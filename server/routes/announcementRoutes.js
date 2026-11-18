import express from 'express';
import {
  getPublicAnnouncements,
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  updateAnnouncementSettings,
  uploadAnnouncementIcon
} from '../controllers/announcementController.js';
import { protect, admin, canManageMarketing } from '../middleware/auth.js';
import { announcementIconUpload, verifyImageMagicBytes } from '../middleware/upload.js';

const router = express.Router();

// Public route for public navbar marquee
router.get('/', getPublicAnnouncements);

// Protected Admin & Marketing Manager routes
router.get('/admin', protect, canManageMarketing, getAdminAnnouncements);
router.put('/settings', protect, canManageMarketing, updateAnnouncementSettings);

// Custom icon image upload for announcement offers (Admin and Marketing Manager, image formats, max 3MB)
router.post('/upload-icon', protect, canManageMarketing, (req, res, next) => {
  announcementIconUpload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Icon file size exceeds 3MB limit. Please upload an image under 3MB.'
        });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    next();
  });
}, verifyImageMagicBytes, uploadAnnouncementIcon);

router.post('/', protect, canManageMarketing, createAnnouncement);
router.put('/:id', protect, canManageMarketing, updateAnnouncement);
router.delete('/:id', protect, canManageMarketing, deleteAnnouncement);

export default router;

