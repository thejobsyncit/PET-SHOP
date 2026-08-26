import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/cartWishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(toggleWishlist);

export default router;
