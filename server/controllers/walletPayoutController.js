import {
  createRazorpayBookingOrder,
  verifyRazorpayBookingSignature,
  recordPlatformLedgerEntry,
  getPlatformWalletSummary,
  getProviderEarningsData,
  saveProviderBankAccount,
  getProviderBankAccount,
  submitProviderPayoutRequest,
  processAdminPayout,
  processBookingRefund,
  createNotification
} from '../services/walletPayoutService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'server_data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PAYOUTS_FILE = path.join(DATA_DIR, 'provider_payouts.json');
const NOTIFICATIONS_FILE = path.join(__dirname, '..', 'data', 'notifications.json');

const loadJson = (filePath, fallback = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (_) {}
  return fallback;
};

const saveJson = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (_) {
    return false;
  }
};

// -----------------------------------------------------------------------------
// 1. Create Razorpay Order for Service Booking
// -----------------------------------------------------------------------------
export const createBookingOrder = async (req, res) => {
  try {
    const { amount, serviceName, bookingId, customerEmail, customerPhone } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid booking amount' });
    }

    const orderData = await createRazorpayBookingOrder({
      amount,
      serviceName,
      bookingId,
      customerEmail,
      customerPhone
    });

    return res.status(200).json(orderData);
  } catch (error) {
    console.error('Error in createBookingOrder:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create payment order' });
  }
};

// -----------------------------------------------------------------------------
// 2. Verify Razorpay Payment & Confirm Service Booking
// -----------------------------------------------------------------------------
export const verifyBookingPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingPayload
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification credentials' });
    }

    if (!bookingPayload) {
      return res.status(400).json({ success: false, message: 'Missing booking payload' });
    }

    // 1. Verify Razorpay signature
    const isAuthentic = verifyRazorpayBookingSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid cryptographic signature.' });
    }

    const servicePrice = Number(bookingPayload.fee || bookingPayload.totalAmount || bookingPayload.totalPrice || bookingPayload.price || 0);
    const platformFee = Math.round(servicePrice * 0.05); // 5% Josh Pets Hub commission
    const providerShare = servicePrice - platformFee;

    const bookingId = bookingPayload.id || bookingPayload._id || `BK-${Date.now().toString().slice(-6)}`;

    // 2. Prepare Confirmed Booking Record
    const confirmedBooking = {
      ...bookingPayload,
      _id: bookingId,
      id: bookingId,
      // Strictly maintain separate bookingStatus, paymentStatus, and settlementStatus
      status: 'Confirmed',
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      settlementStatus: 'Pending', // Pending settlement in platform escrow
      paymentDetails: {
        gateway: 'Razorpay',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        paidAt: new Date().toISOString(),
        amount: servicePrice,
        currency: 'INR'
      },
      createdAt: bookingPayload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 3. Persist to Bookings Database
    const diskBookings = loadJson(BOOKINGS_FILE, []);
    const updatedBookings = [confirmedBooking, ...diskBookings.filter(b => (b.id || b._id) !== bookingId)];
    saveJson(BOOKINGS_FILE, updatedBookings);

    // 4. Credit Central Platform Wallet Ledger (Money enters Josh Pet Hub platform wallet)
    const ledgerEntry = recordPlatformLedgerEntry({
      type: 'PAYMENT_COLLECTION',
      amount: servicePrice,
      bookingId: confirmedBooking.id,
      providerId: confirmedBooking.providerId || 'PROV-GENERAL',
      providerName: confirmedBooking.providerName || confirmedBooking.groomerName || confirmedBooking.doctorName || confirmedBooking.trainerName || 'Service Provider Partner',
      serviceCategory: confirmedBooking.serviceCategory || confirmedBooking.serviceType || 'General Service',
      customerId: confirmedBooking.userId || req.user?._id || 'CUST-GENERAL',
      customerName: confirmedBooking.ownerName || req.user?.name || 'Pet Parent',
      platformFee,
      providerShare,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'SUCCESS',
      description: `Service booking fee collected for ${confirmedBooking.packageName || confirmedBooking.serviceType} (Ref: ${bookingId})`
    });

    // 5. Emit Notifications
    // To Customer
    createNotification({
      recipientType: 'USER',
      recipientId: confirmedBooking.ownerEmail || confirmedBooking.userEmail,
      title: 'Booking Confirmed & Payment Received',
      message: `Your booking for ${confirmedBooking.packageName || confirmedBooking.serviceType} is confirmed! Payment Ref: ${razorpay_payment_id}.`,
      type: 'booking',
      metadata: { bookingId: confirmedBooking.id, amount: servicePrice }
    });

    // To Service Provider
    createNotification({
      recipientType: 'PROVIDER',
      recipientId: confirmedBooking.providerId,
      title: 'New Paid Booking Received',
      message: `New booking from ${confirmedBooking.ownerName} for ₹${servicePrice}. Payable earnings of ₹${providerShare} added to your pending settlement escrow.`,
      type: 'payment',
      metadata: { bookingId: confirmedBooking.id, netEarnings: providerShare }
    });

    // To Super Admin
    createNotification({
      recipientType: 'ADMIN',
      title: 'Service Payment Credited to Central Wallet',
      message: `₹${servicePrice} collected for booking ${confirmedBooking.id}. Platform commission earned: ₹${platformFee}.`,
      type: 'payment',
      metadata: { bookingId: confirmedBooking.id, ledgerId: ledgerEntry.id }
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and booking confirmed.',
      booking: confirmedBooking,
      ledgerEntry
    });

  } catch (error) {
    console.error('Error in verifyBookingPayment:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

// -----------------------------------------------------------------------------
// 3. Central Platform Wallet Summary (Super Admin)
// -----------------------------------------------------------------------------
export const getPlatformWallet = async (req, res) => {
  try {
    const summary = getPlatformWalletSummary();
    return res.status(200).json({ success: true, ...summary });
  } catch (error) {
    console.error('Error in getPlatformWallet:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch platform wallet summary' });
  }
};

// -----------------------------------------------------------------------------
// 4. Service Provider Earnings & Wallet Breakdown
// -----------------------------------------------------------------------------
export const getProviderEarnings = async (req, res) => {
  try {
    const providerId = req.query.providerId || req.user?._id || req.user?.id || req.user?.email;
    const category = req.query.category || req.user?.serviceCategory || '';

    const earnings = getProviderEarningsData(providerId, category);
    const bankDetails = getProviderBankAccount(providerId || req.user?.email);

    return res.status(200).json({
      success: true,
      ...earnings,
      bankDetails
    });
  } catch (error) {
    console.error('Error in getProviderEarnings:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch provider earnings' });
  }
};

// -----------------------------------------------------------------------------
// 5. Provider Bank Account Management
// -----------------------------------------------------------------------------
export const saveBankAccount = async (req, res) => {
  try {
    const {
      accountHolder,
      accountNumber,
      confirmAccountNumber,
      ifsc,
      bankName
    } = req.body;

    const providerId = req.user?._id || req.user?.id || req.body.providerId;
    const providerEmail = req.user?.email || req.body.providerEmail;
    const providerName = req.user?.name || req.user?.businessName || req.body.providerName;

    const result = saveProviderBankAccount({
      providerId,
      providerEmail,
      providerName,
      accountHolder,
      accountNumber,
      confirmAccountNumber,
      ifsc,
      bankName
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in saveBankAccount:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to save bank account' });
  }
};

export const getBankAccount = async (req, res) => {
  try {
    const providerId = req.query.providerId || req.user?._id || req.user?.id || req.user?.email;
    const bankDetails = getProviderBankAccount(providerId);

    return res.status(200).json({
      success: true,
      bankDetails
    });
  } catch (error) {
    console.error('Error in getBankAccount:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve bank account' });
  }
};

// -----------------------------------------------------------------------------
// 6. Submit Payout Request
// -----------------------------------------------------------------------------
export const requestPayout = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const providerId = req.user?._id || req.user?.id || req.body.providerId;
    const providerEmail = req.user?.email || req.body.providerEmail;
    const providerName = req.user?.name || req.user?.businessName || req.body.providerName;
    const serviceCategory = req.user?.serviceCategory || req.body.serviceCategory;

    const payout = submitProviderPayoutRequest({
      providerId,
      providerEmail,
      providerName,
      serviceCategory,
      amount,
      upiId
    });

    return res.status(201).json({
      success: true,
      message: `Withdrawal request for ₹${Number(amount).toLocaleString('en-IN')} submitted successfully.`,
      payout
    });
  } catch (error) {
    console.error('Error in requestPayout:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to submit payout request' });
  }
};

// -----------------------------------------------------------------------------
// 7. Super Admin: View & Process Payout Requests
// -----------------------------------------------------------------------------
export const getAdminPayoutRequests = async (req, res) => {
  try {
    const payouts = loadJson(PAYOUTS_FILE, []);
    return res.status(200).json({
      success: true,
      payouts
    });
  } catch (error) {
    console.error('Error in getAdminPayoutRequests:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve payout requests' });
  }
};

export const processPayoutRequest = async (req, res) => {
  try {
    const { payoutId, action, adminNotes, transferReference } = req.body;

    if (!payoutId || !action) {
      return res.status(400).json({ success: false, message: 'payoutId and action are required' });
    }

    const updatedPayout = processAdminPayout({
      payoutId,
      action,
      adminNotes,
      transferReference,
      adminUser: req.user
    });

    return res.status(200).json({
      success: true,
      message: `Payout request ${action.toLowerCase()} successfully.`,
      payout: updatedPayout
    });
  } catch (error) {
    console.error('Error in processPayoutRequest:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to process payout request' });
  }
};

// -----------------------------------------------------------------------------
// 8. Process Booking Refund
// -----------------------------------------------------------------------------
export const refundBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const refunded = processBookingRefund({
      bookingId,
      reason,
      adminUser: req.user
    });

    return res.status(200).json({
      success: true,
      message: `Booking ${bookingId} refunded successfully.`,
      booking: refunded
    });
  } catch (error) {
    console.error('Error in refundBooking:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to process refund' });
  }
};

// -----------------------------------------------------------------------------
// 9. Notifications Endpoint
// -----------------------------------------------------------------------------
export const getNotifications = async (req, res) => {
  try {
    const notifs = loadJson(NOTIFICATIONS_FILE, []);
    const role = (req.user?.role || 'USER').toUpperCase();
    const id = req.user?._id || req.user?.email || '';

    const filtered = notifs.filter(n => {
      if (role === 'SUPERADMIN' || role === 'ADMIN') return true;
      if (role === 'SERVICE_PROVIDER') {
        return n.recipientType === 'PROVIDER' && (n.recipientId === 'all' || n.recipientId === id);
      }
      return n.recipientType === 'USER' && (n.recipientId === 'all' || n.recipientId === id);
    });

    return res.status(200).json({
      success: true,
      notifications: filtered
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// -----------------------------------------------------------------------------
// 10. Export Payouts CSV (Super Admin)
// -----------------------------------------------------------------------------
export const exportPayoutsCsv = async (req, res) => {
  try {
    const payouts = loadJson(PAYOUTS_FILE, []);
    let csv = 'Payout ID,Provider Name,Service Category,Amount (INR),Status,Bank Name,Account Masked,IFSC,Requested Date,Processed Date,Transfer Reference,Admin Notes\n';

    for (const p of payouts) {
      csv += `"${p.id}","${p.providerName || ''}","${p.serviceCategory || ''}","${p.amount}","${p.status}","${p.bankDetails?.bankName || ''}","${p.bankDetails?.accountNumberMasked || ''}","${p.bankDetails?.ifsc || ''}","${p.requestedAt || ''}","${p.processedAt || ''}","${p.transferReference || ''}","${(p.adminNotes || '').replace(/"/g, '""')}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payout_report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error in exportPayoutsCsv:', error);
    return res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

