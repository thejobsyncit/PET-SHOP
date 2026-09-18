import express from 'express';
import { saveConsent, getConsents } from '../controllers/cookieConsentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(saveConsent)
  .get(protect, admin, getConsents);

export default router;
