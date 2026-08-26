import express from 'express';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cartWishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .put(updateCartQuantity)
  .delete(clearCart);

router.route('/:productId')
  .delete(removeFromCart);

export default router;
