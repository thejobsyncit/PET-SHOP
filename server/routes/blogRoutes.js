import express from 'express';
import { getBlogs, getBlogBySlug, createBlog } from '../controllers/blogController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getBlogs)
  .post(protect, admin, createBlog);

router.route('/slug/:slug')
  .get(getBlogBySlug);

export default router;
