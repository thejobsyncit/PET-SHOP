import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect, admin, canManageMarketing } from '../middleware/auth.js';

const router = express.Router();

// Public validation for cart & checkout
router.post('/validate', validateCoupon);

// General listings & Admin / Marketing Manager CRUD
router.route('/')
  .get(getCoupons)
  .post(protect, canManageMarketing, createCoupon);

router.route('/:id')
  .put(protect, canManageMarketing, updateCoupon)
  .delete(protect, canManageMarketing, deleteCoupon);

export default router;
