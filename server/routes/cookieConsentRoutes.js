import express from 'express';
import { saveConsent, getConsents, deleteConsent, checkConsent } from '../controllers/cookieConsentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(saveConsent)
  .get(protect, admin, getConsents);

router.route('/check/:sessionId')
  .get(checkConsent);

router.route('/:id')
  .delete(protect, admin, deleteConsent);

export default router;
