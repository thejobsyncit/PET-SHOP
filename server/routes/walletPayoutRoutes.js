import express from 'express';
import { protect, admin, providerOnly } from '../middleware/auth.js';
import {
  createBookingOrder,
  verifyBookingPayment,
  getPlatformWallet,
  getProviderEarnings,
  requestPayout,
  saveBankAccount,
  getBankAccount,
  getAdminPayoutRequests,
  processPayoutRequest,
  refundBooking,
  getNotifications,
  exportPayoutsCsv
} from '../controllers/walletPayoutController.js';

const router = express.Router();

// 1. Booking Payment Flow
router.post('/create-booking-order', createBookingOrder);
router.post('/verify-booking-payment', verifyBookingPayment);

// 2. Central Platform Wallet (Super Admin)
router.get('/platform-wallet', protect, admin, getPlatformWallet);

// 3. Provider Earnings & Wallet Breakdown
router.get('/provider-earnings', protect, getProviderEarnings);

// 4. Provider Bank Account Management
router.get('/bank-account', protect, getBankAccount);
router.post('/bank-account', protect, saveBankAccount);

// 5. Provider Payout Withdrawal Request
router.post('/request-payout', protect, requestPayout);

// 6. Super Admin Payout Operations
router.get('/admin/payout-requests', protect, admin, getAdminPayoutRequests);
router.post('/admin/process-payout', protect, admin, processPayoutRequest);
router.post('/admin/refund-booking', protect, admin, refundBooking);
router.get('/admin/export-payouts-csv', protect, admin, exportPayoutsCsv);

// 7. Notifications
router.get('/notifications', protect, getNotifications);

export default router;

