import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllServiceProviders,
  updateServiceProvider,
  deleteServiceProvider
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

// Dedicated Service Provider management routes
router.get('/service-providers', protect, admin, getAllServiceProviders);
router.put('/service-providers/:id', protect, admin, updateServiceProvider);
router.delete('/service-providers/:id', protect, admin, deleteServiceProvider);

export default router;
