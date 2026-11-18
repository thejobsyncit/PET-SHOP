import express from 'express';
import {
  crmLogin,
  getMe,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getDashboardStats,
  getCustomers,
  addCustomerNote,
  getLeads,
  createLead,
  updateLead,
  getTickets,
  createTicket,
  updateTicket,
  getTasks,
  createTask,
  updateTask,
  crmAdminOrSuperAdminAuth,
  getBookings,
  updateBookingStatus,
  getOrders,
  updateOrderStatus,
  getFinanceOverview,
  processRefund,
  getProviders,
  updateProviderStatus,
  getPrescriptions,
  verifyPrescription,
  getTechHealth,
  createTechIncident
} from '../controllers/crmController.js';

const router = express.Router();

// 1. Authentication
router.post('/login', crmLogin);
router.get('/me', getMe);

// 2. Department & Staff Role Administration (Accessible by Super Admin or CRM Admin / Operations Head)
router.get('/admin/roles', crmAdminOrSuperAdminAuth, getRoles);
router.post('/admin/roles', crmAdminOrSuperAdminAuth, createRole);
router.put('/admin/roles/:id', crmAdminOrSuperAdminAuth, updateRole);
router.delete('/admin/roles/:id', crmAdminOrSuperAdminAuth, deleteRole);

router.get('/admin/staff', crmAdminOrSuperAdminAuth, getStaff);
router.post('/admin/staff', crmAdminOrSuperAdminAuth, createStaff);
router.put('/admin/staff/:id', crmAdminOrSuperAdminAuth, updateStaff);
router.delete('/admin/staff/:id', crmAdminOrSuperAdminAuth, deleteStaff);

// 3. Common Operations Console Data
router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.post('/customers/:id/notes', addCustomerNote);
router.get('/leads', getLeads);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.put('/tickets/:id', updateTicket);
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);

// 4. Department-Specific Operational Modules
// Service Operations Manager
router.get('/bookings', getBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// E-commerce Manager
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Finance Manager
router.get('/finance', getFinanceOverview);
router.put('/finance/refunds/:id', processRefund);

// Provider Relations Manager
router.get('/providers', getProviders);
router.put('/providers/:id/verify', updateProviderStatus);

// Quality & Compliance Manager
router.get('/compliance/prescriptions', getPrescriptions);
router.put('/compliance/prescriptions/:id', verifyPrescription);

// Technical Support Manager
router.get('/tech/health', getTechHealth);
router.post('/tech/incidents', createTechIncident);

export default router;
