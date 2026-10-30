import express from 'express';
import { createEnquiry, getAllEnquiries, deleteEnquiry } from '../controllers/enquiryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(createEnquiry)
  .get(protect, admin, getAllEnquiries);

router.route('/:id')
  .delete(protect, admin, deleteEnquiry);

export default router;
