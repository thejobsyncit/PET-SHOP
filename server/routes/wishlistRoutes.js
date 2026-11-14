import express from 'express';
import { getWishlist, toggleWishlist, syncWishlist } from '../controllers/cartWishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(toggleWishlist);

router.post('/sync', syncWishlist);

export default router;
