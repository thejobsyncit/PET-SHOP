import express from 'express';
import {
  crmLogin,
  getMe,
  getDepartments,
  createDepartment,
  getDesignations,
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
  updateTaskStatus,
  delegateTask,
  getTaskHistory,
  createTaskComment,
  getTaskComments,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAuditLogs,
  crmAdminOrSuperAdminAuth,
  getBookings,
  updateBookingStatus,
  getOrders,
  updateOrderStatus,
  getFinanceOverview,
  getFinancePayouts,
  exportFinancePayoutsCsv,
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

// 2. Departments & Designations Catalog
router.get('/departments', getDepartments);
router.post('/departments', crmAdminOrSuperAdminAuth, createDepartment);
router.get('/designations', getDesignations);

// 3. Department & Staff Role Administration (Super Admin & Department Managers)
router.get('/admin/roles', crmAdminOrSuperAdminAuth, getRoles);
router.post('/admin/roles', crmAdminOrSuperAdminAuth, createRole);
router.put('/admin/roles/:id', crmAdminOrSuperAdminAuth, updateRole);
router.delete('/admin/roles/:id', crmAdminOrSuperAdminAuth, deleteRole);

router.get('/admin/staff', crmAdminOrSuperAdminAuth, getStaff);
router.post('/admin/staff', crmAdminOrSuperAdminAuth, createStaff);
router.put('/admin/staff/:id', crmAdminOrSuperAdminAuth, updateStaff);
router.delete('/admin/staff/:id', crmAdminOrSuperAdminAuth, deleteStaff);

// 4. Common Operations Console Data
router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.post('/customers/:id/notes', addCustomerNote);
router.get('/leads', getLeads);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.put('/tickets/:id', updateTicket);

// 5. Tasks Workflow & Collaboration
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.put('/tasks/:id/status', updateTaskStatus);
router.put('/tasks/:id/delegate', delegateTask);
router.get('/tasks/:id/history', getTaskHistory);
router.post('/tasks/:id/comments', createTaskComment);
router.get('/tasks/:id/comments', getTaskComments);

// 6. Notifications & Audit Logs
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/mark-all-read', markAllNotificationsRead);
router.get('/audit-logs', crmAdminOrSuperAdminAuth, getAuditLogs);

// 7. Department-Specific Operational Modules
// Service Operations Manager
router.get('/bookings', getBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Orders / E-Commerce Operations
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Finance Manager (Reconciliation, Payouts & Refunds)
router.get('/finance', getFinanceOverview);
router.get('/finance/payouts', getFinancePayouts);
router.get('/finance/payouts/export', exportFinancePayoutsCsv);
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
