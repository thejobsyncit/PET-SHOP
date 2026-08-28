import express from 'express';
import { createEnquiry, getAllEnquiries } from '../controllers/enquiryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(createEnquiry)
  .get(protect, admin, getAllEnquiries);

export default router;
