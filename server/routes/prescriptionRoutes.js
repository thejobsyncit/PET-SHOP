import express from 'express';
import {
  uploadPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  getAllPrescriptions,
  verifyPrescription
} from '../controllers/prescriptionController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(upload.single('file'), uploadPrescription)
  .get(admin, getAllPrescriptions);

router.route('/my')
  .get(getMyPrescriptions);

router.route('/:id')
  .get(getPrescriptionById);

router.route('/:id/status')
  .put(admin, verifyPrescription);

export default router;
