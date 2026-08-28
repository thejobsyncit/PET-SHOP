import express from 'express';
import { getDashboardStats, getAllUsers, updateUserRole, deleteUser } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;
