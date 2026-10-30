import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSubscriptionStatus,
  completeProviderProfile,
  createSubscriptionOrder,
  verifySubscriptionPayment
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/status', protect, getSubscriptionStatus);
router.post('/profile', protect, completeProviderProfile);
router.post('/create-order', protect, createSubscriptionOrder);
router.post('/verify-payment', protect, verifySubscriptionPayment);

export default router;

