import express from 'express';
import multer from 'multer';
import { 
  getBlogs, 
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  uploadBlogCover 
} from '../controllers/blogController.js';
import { protect, admin, canManageMarketing } from '../middleware/auth.js';
import { blogImageUpload, verifyImageMagicBytes } from '../middleware/upload.js';

const router = express.Router();

// Cover image upload for blogs (Admin and Marketing Manager, image formats only, max 10MB)
router.post('/upload-cover', protect, canManageMarketing, (req, res, next) => {
  blogImageUpload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image size exceeds 10MB limit. Please upload an image under 10MB.'
        });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, verifyImageMagicBytes, uploadBlogCover);

router.route('/')
  .get(getBlogs)
  .post(protect, canManageMarketing, createBlog);

router.route('/:id')
  .put(protect, canManageMarketing, updateBlog)
  .delete(protect, canManageMarketing, deleteBlog);

router.route('/slug/:slug')
  .get(getBlogBySlug);

export default router;
