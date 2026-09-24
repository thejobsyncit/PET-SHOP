import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

// Initialize Razorpay
let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.warn('Razorpay initialization failed:', error.message);
}

// @desc    Create a new Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_order_1' } = req.body;

    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay keys not configured' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount specified' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: 'Some error occurred while creating order' });
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment details missing' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Payment secret not configured on server' });
    }

    // Creating expected HMAC digest
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Timing-safe comparison to prevent side-channel timing attacks
    let isAuthentic = false;
    try {
      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const signatureBuf = Buffer.from(razorpay_signature, 'utf-8');
      isAuthentic = expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf);
    } catch (_) {
      isAuthentic = false;
    }

    if (isAuthentic) {
      // If an associated internal orderId is provided, confirm its payment
      if (orderId) {
        const { data: order } = await supabase.from('orders').select('payment_result').eq('id', orderId).single();
        if (order) {
          const paymentResult = order.payment_result || {};
          paymentResult.status = 'Completed';
          paymentResult.transactionId = razorpay_payment_id;
          paymentResult.paidAt = new Date().toISOString();
          
          await supabase.from('orders').update({
            payment_result: paymentResult,
            is_paid: true,
            paid_at: new Date().toISOString()
          }).eq('id', orderId);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
