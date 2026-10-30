import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, canManageProducts } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, canManageProducts, createProduct);

router.route('/slug/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .get(getProductById)
  .put(protect, canManageProducts, updateProduct)
  .delete(protect, canManageProducts, deleteProduct);

export default router;
