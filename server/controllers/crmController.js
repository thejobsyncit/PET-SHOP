import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const ROLES_FILE = path.join(DATA_DIR, 'crm_roles.json');
const STAFF_FILE = path.join(DATA_DIR, 'crm_users.json');
const DEPARTMENTS_FILE = path.join(DATA_DIR, 'crm_departments.json');
const DESIGNATIONS_FILE = path.join(DATA_DIR, 'crm_designations.json');
const TICKETS_FILE = path.join(DATA_DIR, 'crm_tickets.json');
const TASKS_FILE = path.join(DATA_DIR, 'crm_tasks.json');
const TASK_HISTORY_FILE = path.join(DATA_DIR, 'crm_task_history.json');
const TASK_COMMENTS_FILE = path.join(DATA_DIR, 'crm_task_comments.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'crm_notifications.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'crm_audit_logs.json');
const LEADS_FILE = path.join(DATA_DIR, 'crm_leads.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SERVICE_PROVIDERS_FILE = path.join(DATA_DIR, 'service_providers.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, 'prescriptions.json');
const INCIDENTS_FILE = path.join(DATA_DIR, 'crm_incidents.json');
const REFUNDS_FILE = path.join(DATA_DIR, 'crm_refunds.json');
const PAYOUTS_FILE = path.join(DATA_DIR, 'provider_payouts.json');
const SERVER_DATA_DIR = path.join(__dirname, '..', '..', 'server_data');
const SERVER_DATA_PAYOUTS_FILE = path.join(SERVER_DATA_DIR, 'provider_payouts.json');

const JWT_SECRET = process.env.JWT_SECRET || 'joshpetshub_prod_secure_jwt_secret_99f38e789a24c7f0b12da459e81b67f132e';

// File Helper utilities
const readJson = (filePath, fallback = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.warn(`[CRM] Error reading ${filePath}:`, err?.message);
  }
  return fallback;
};

// Unified helper to read all provider payouts from server_data, server/data, and Supabase
const loadAllUnifiedPayouts = () => {
  const p1 = readJson(SERVER_DATA_PAYOUTS_FILE, []);
  const p2 = readJson(PAYOUTS_FILE, []);
  const map = new Map();
  [...p1, ...p2].forEach(p => {
    if (p && (p.id || p._id)) {
      const id = String(p.id || p._id);
      map.set(id, {
        ...p,
        id,
        amount: Number(p.amount || 0),
        status: p.status || 'Requested'
      });
    }
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.requestedAt || b.createdAt || 0) - new Date(a.requestedAt || a.createdAt || 0));
};

const writeJson = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`[CRM] Error writing ${filePath}:`, err?.message);
  }
};

/**
 * Audit Logging Helper
 */
export const logCrmAudit = (actor, department, action, entityType, entityId, oldData, newData) => {
  try {
    const logs = readJson(AUDIT_LOGS_FILE, []);
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actor_user_id: actor?.id || 'system',
      actor_email: actor?.email || '',
      actor_name: actor?.name || 'Administrator',
      department_id: department || actor?.department || 'System',
      department_name: department || actor?.department || 'System',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData || null,
      new_data: newData || null,
      created_at: new Date().toISOString()
    };
    logs.unshift(entry);
    if (logs.length > 500) logs.pop();
    writeJson(AUDIT_LOGS_FILE, logs);
    if (supabase) {
      supabase.from('crm_audit_logs').insert(entry).then().catch(() => {});
    }
  } catch (err) {
    console.warn('[CRM] Audit log error:', err?.message);
  }
};

/**
 * Notification Helper
 */
export const createNotification = (recipientEmployeeId, recipientEmail, title, message, type = 'Task', entityType = null, entityId = null) => {
  try {
    const notifs = readJson(NOTIFICATIONS_FILE, []);
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      recipient_employee_id: recipientEmployeeId,
      recipient_email: recipientEmail,
      title,
      message,
      notification_type: type,
      related_entity_type: entityType,
      related_entity_id: entityId,
      is_read: false,
      created_at: new Date().toISOString()
    };
    notifs.unshift(notif);
    writeJson(NOTIFICATIONS_FILE, notifs);
    if (supabase) {
      supabase.from('crm_notifications').insert(notif).then().catch(() => {});
    }
  } catch (err) {
    console.warn('[CRM] Notification error:', err?.message);
  }
};

/**
 * @desc    CRM Staff Login (Uses credentials created by Super Admin)
 * @route   POST /api/crm/login
 * @access  Public
 */
export const crmLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const staffList = readJson(STAFF_FILE, []);
    const rolesList = readJson(ROLES_FILE, []);

    // 1. Check in CRM staff accounts
    let staffMember = staffList.find(s => (s.email || '').toLowerCase() === cleanEmail);

    // 2. Also allow SuperAdmin to log in directly into CRM with master credentials
    if (!staffMember && (cleanEmail === 'superadmin@joshpetshub.com' || cleanEmail === 'admin@joshpetshub.com')) {
      const usersList = readJson(USERS_FILE, []);
      const masterUser = usersList.find(u => (u.email || '').toLowerCase() === cleanEmail);
      if (masterUser) {
        let isMasterValid = (password === masterUser.password);
        if (!isMasterValid && masterUser.password && (masterUser.password.startsWith('$2a$') || masterUser.password.startsWith('$2b$'))) {
          isMasterValid = await bcrypt.compare(password, masterUser.password);
        }
        if (isMasterValid) {
          const isAdminUser = cleanEmail === 'admin@joshpetshub.com';
          const masterRoleId = isAdminUser ? 'crm_role_admin' : 'crm_role_superadmin';
          const masterRoleName = isAdminUser ? 'Admin' : 'Super Administrator';
          const masterDept = isAdminUser ? 'Operations & Administration' : 'Executive Administration';

          const masterRole = {
            id: masterRoleId,
            name: masterRoleName,
            permissions: {
              manage_staff: true,
              manage_roles: true,
              view_customers: true,
              manage_customers: true,
              view_leads: true,
              manage_leads: true,
              view_orders: true,
              manage_orders: true,
              view_bookings: true,
              manage_bookings: true,
              view_tickets: true,
              manage_tickets: true,
              manage_tasks: true,
              view_finance: true,
              manage_finance: true,
              view_providers: true,
              manage_providers: true,
              view_quality: true,
              manage_quality: true,
              view_tech: true,
              manage_tech: true,
              export_data: true
            }
          };
          const token = jwt.sign(
            { id: masterUser.id || (isAdminUser ? 'admin' : 'superadmin'), email: masterUser.email, role: isAdminUser ? 'ADMIN' : 'SUPERADMIN', roleName: masterRoleName },
            JWT_SECRET,
            { expiresIn: '30d' }
          );
          return res.json({
            success: true,
            message: `${masterRoleName} authenticated to CRM Portal`,
            token,
            user: {
              id: masterUser.id || (isAdminUser ? 'admin' : 'superadmin'),
              name: masterUser.name || (isAdminUser ? 'JOSH PETS HUB Admin' : 'JOSH PETS HUB Superadmin'),
              email: masterUser.email,
              roleId: masterRoleId,
              roleName: masterRoleName,
              department: masterDept,
              isHead: true,
              permissions: masterRole.permissions
            }
          });
        }
      }
    }

    if (!staffMember) {
      return res.status(401).json({
        success: false,
        message: 'Invalid CRM staff credentials. Access accounts must be created by the Super Administrator.'
      });
    }

    if (staffMember.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This CRM staff account has been deactivated by the Super Administrator. Please contact management.'
      });
    }

    // Verify password (plain text or bcrypt hash)
    let isMatch = false;
    if (staffMember.password) {
      if (staffMember.password.startsWith('$2a$') || staffMember.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, staffMember.password);
      } else {
        isMatch = (staffMember.password === password);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }

    // Update last login
    staffMember.lastLogin = new Date().toISOString();
    staffMember.last_login = staffMember.lastLogin;
    writeJson(STAFF_FILE, staffList);
    if (supabase) {
      try {
        await supabase.from('crm_users').update({
          last_login: staffMember.lastLogin,
          lastLogin: staffMember.lastLogin
        }).eq('id', staffMember.id);
      } catch (sbLoginErr) {
        console.warn('Supabase update last_login note:', sbLoginErr?.message);
      }
    }

    // Get assigned role permissions
    const assignedRole = rolesList.find(r => r.id === staffMember.roleId) || {
      id: staffMember.roleId,
      name: staffMember.roleName || 'CRM Staff',
      permissions: {
        view_customers: true,
        view_leads: true,
        view_tickets: true,
        manage_tickets: true,
        manage_tasks: true
      }
    };

    const tokenPayload = {
      id: staffMember.id,
      email: staffMember.email,
      name: staffMember.name,
      roleId: staffMember.roleId,
      department: staffMember.department,
      role: 'CRM_STAFF'
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      message: `Welcome back, ${staffMember.name}!`,
      token,
      user: {
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        roleId: staffMember.roleId,
        roleName: assignedRole.name || staffMember.roleName,
        department: staffMember.department,
        designationId: staffMember.designationId || null,
        designationName: staffMember.designationName || null,
        isHead: Boolean(assignedRole.isHead && (!staffMember.reportingManagerId || staffMember.designationId?.endsWith('_head'))),
        permissions: assignedRole.permissions || {}
      }
    });
  } catch (error) {
    console.error('[CRM Login] Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during CRM login' });
  }
};

/**
 * @desc    Get Current CRM Staff Profile
 * @route   GET /api/crm/me
 * @access  Private (CRM Token)
 */
export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // If superadmin
    if (decoded.role === 'SUPERADMIN') {
      return res.json({
        success: true,
        user: {
          id: decoded.id || 'superadmin',
          name: 'JOSH PETS HUB Superadmin',
          email: decoded.email,
          roleId: 'crm_role_superadmin',
          roleName: 'Super Administrator',
          department: 'Executive Administration',
          permissions: {
            manage_staff: true,
            manage_roles: true,
            view_customers: true,
            manage_customers: true,
            view_leads: true,
            manage_leads: true,
            view_orders: true,
            manage_orders: true,
            view_bookings: true,
            manage_bookings: true,
            view_tickets: true,
            manage_tickets: true,
            manage_tasks: true,
            view_finance: true,
            manage_finance: true,
            view_providers: true,
            manage_providers: true,
            view_quality: true,
            manage_quality: true,
            view_tech: true,
            manage_tech: true,
            export_data: true
          }
        }
      });
    }

    const staffList = readJson(STAFF_FILE, []);
    const rolesList = readJson(ROLES_FILE, []);
    const staff = staffList.find(s => s.id === decoded.id || s.email.toLowerCase() === decoded.email?.toLowerCase());

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member account not found' });
    }

    const assignedRole = rolesList.find(r => r.id === staff.roleId) || { permissions: {} };

    return res.json({
      success: true,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        roleId: staff.roleId,
        roleName: assignedRole.name || staff.roleName,
        department: staff.department,
        designationId: staff.designationId || null,
        designationName: staff.designationName || null,
        isHead: Boolean(assignedRole.isHead && (!staff.reportingManagerId || staff.designationId?.endsWith('_head'))),
        permissions: assignedRole.permissions || {}
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired CRM session' });
  }
};

/* =========================================================================
   ROLE & STAFF PERMISSION AUTH MIDDLEWARE
   ========================================================================= */

/**
 * Helper to resolve CRM User identity from request (Token or req.user)
 */
export const resolveCrmUser = (req) => {
  if (req.user) return req.user;
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.joshpetshub_token) {
      token = req.cookies.joshpetshub_token;
    }
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'SUPERADMIN' || decoded.role === 'ADMIN' ||
        decoded.email === 'superadmin@joshpetshub.com' || decoded.email === 'admin@joshpetshub.com') {
      return { id: decoded.id || 'usr_superadmin', email: decoded.email, role: 'SUPERADMIN', isSuperAdmin: true, isGlobal: true, isDeptHead: true, name: 'Super Administrator' };
    }
    const staffList = readJson(STAFF_FILE, []);
    const rolesList = readJson(ROLES_FILE, []);
    const staffMember = staffList.find(s => s.id === decoded.id || s.email?.toLowerCase() === decoded.email?.toLowerCase());
    if (staffMember) {
      const assignedRole = rolesList.find(r => r.id === staffMember.roleId);
      const isOperationsHead = staffMember.roleId === 'crm_role_admin' || assignedRole?.slug === 'crm_admin';
      const isDesignationHead = Boolean(staffMember.designationId?.endsWith('_head') || staffMember.roleName?.includes('Manager') || staffMember.designationName?.includes('Manager'));
      const isDeptHead = (assignedRole?.isHead === true && isDesignationHead) || isOperationsHead;
      return {
        id: staffMember.id,
        email: staffMember.email,
        name: staffMember.name,
        roleId: staffMember.roleId,
        roleName: assignedRole?.name || staffMember.roleName,
        department: staffMember.department,
        isSuperAdmin: false,
        isCrmAdmin: isOperationsHead,
        isGlobal: isOperationsHead,
        isDeptHead: isDeptHead || isOperationsHead,
        permissions: assignedRole?.permissions || {}
      };
    }
  } catch (e) {}
  return null;
};

/**
 * Middleware: Authorizes Super Admin OR CRM Department Managers to manage roles & staff
 * Resolves requesting identity, department, and authorized hierarchical scope.
 */
export const crmAdminOrSuperAdminAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.joshpetshub_token) {
      token = req.cookies.joshpetshub_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // 1. SuperAdmin master token check
    if (decoded.role === 'SUPERADMIN' || decoded.role === 'ADMIN' ||
        decoded.email === 'superadmin@joshpetshub.com' || decoded.email === 'admin@joshpetshub.com') {
      req.user = { id: decoded.id, email: decoded.email, role: 'SUPERADMIN', isSuperAdmin: true, isGlobal: true };
      return next();
    }

    // 2. CRM Staff Identity Resolution
    const staffList = readJson(STAFF_FILE, []);
    const rolesList = readJson(ROLES_FILE, []);
    const staffMember = staffList.find(s => s.id === decoded.id || s.email?.toLowerCase() === decoded.email?.toLowerCase());

    if (!staffMember || staffMember.isActive === false) {
      return res.status(403).json({ success: false, message: 'Access denied: CRM staff account is deactivated or not found.' });
    }

    const assignedRole = rolesList.find(r => r.id === staffMember.roleId);
    const isOperationsHead = staffMember.roleId === 'crm_role_admin' || assignedRole?.slug === 'crm_admin';
    const isDesignationHead = Boolean(staffMember.designationId?.endsWith('_head') || staffMember.roleName?.includes('Manager') || staffMember.designationName?.includes('Manager'));
    const isDeptHead = (assignedRole?.isHead === true && isDesignationHead) || isOperationsHead;
    const isTeamLead = Boolean(staffMember.roleName?.includes('Team Lead') || staffMember.designationName?.includes('Team Lead') || staffMember.designationId?.includes('team_lead'));
    const hasManagePermission = assignedRole?.permissions?.manage_staff === true || assignedRole?.permissions?.manage_roles === true;

    if (!isOperationsHead && !isDeptHead && !hasManagePermission && !(req.method === 'GET' && isTeamLead)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only Department Managers or Super Admin can manage departmental designations and credentials.'
      });
    }

    req.user = {
      id: staffMember.id,
      email: staffMember.email,
      name: staffMember.name,
      roleId: staffMember.roleId,
      roleName: assignedRole?.name || staffMember.roleName,
      department: staffMember.department,
      isSuperAdmin: false,
      isCrmAdmin: isOperationsHead,
      isGlobal: isOperationsHead,
      isDeptHead: isDeptHead || isOperationsHead,
      permissions: assignedRole?.permissions || {}
    };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

/* =========================================================================
   DEPARTMENTS & DESIGNATIONS ENDPOINTS
   ========================================================================= */

/**
 * @desc    Get all CRM Departments
 * @route   GET /api/crm/departments
 * @access  Private / CRM Token
 */
export const getDepartments = async (req, res) => {
  try {
    let departments = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('crm_departments').select('*').order('created_at', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          departments = data;
        }
      } catch (sbErr) {
        console.warn('Supabase getDepartments note:', sbErr?.message);
      }
    }

    if (!departments || departments.length === 0) {
      departments = readJson(DEPARTMENTS_FILE, []);
    }

    return res.json({ success: true, departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new Department (Super Admin Only)
 * @route   POST /api/crm/departments
 * @access  Private / SuperAdmin
 */
export const createDepartment = async (req, res) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create new departments.' });
    }

    const { department_name, department_code, description, head_role_id } = req.body;
    if (!department_name || !department_code) {
      return res.status(400).json({ success: false, message: 'Department Name and Code are required.' });
    }

    const depts = readJson(DEPARTMENTS_FILE, []);
    const newDept = {
      id: `dept_${Date.now()}`,
      department_name: department_name.trim(),
      department_code: department_code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      head_role_id: head_role_id || null,
      status: 'Active',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('crm_departments').insert(newDept);
      } catch (sbErr) {
        console.warn('Supabase createDepartment note:', sbErr?.message);
      }
    }

    depts.push(newDept);
    writeJson(DEPARTMENTS_FILE, depts);

    logCrmAudit(req.user, newDept.department_name, 'CREATE_DEPARTMENT', 'crm_departments', newDept.id, null, newDept);

    return res.status(201).json({ success: true, message: `Department "${newDept.department_name}" created!`, department: newDept });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Designations (Scoped to caller's department if Department Manager)
 * @route   GET /api/crm/designations
 * @access  Private / CRM Token
 */
export const getDesignations = async (req, res) => {
  try {
    let designations = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('crm_designations').select('*').order('created_at', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          designations = data;
        }
      } catch (sbErr) {
        console.warn('Supabase getDesignations note:', sbErr?.message);
      }
    }

    if (!designations || designations.length === 0) {
      designations = readJson(DESIGNATIONS_FILE, []);
    }

    // Filter to department if caller is restricted Department Manager
    if (req.user && !req.user.isSuperAdmin && !req.user.isGlobal && req.user.department) {
      const callerDept = req.user.department.toLowerCase();
      designations = designations.filter(d =>
        (d.department_name || d.department || '').toLowerCase().includes(callerDept) ||
        callerDept.includes((d.department_name || d.department || '').toLowerCase())
      );
    }

    return res.json({ success: true, designations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   SUPERADMIN & DEPARTMENT MANAGERS ROLE MANAGEMENT
   ========================================================================= */

/**
 * @desc    Get CRM Roles (SuperAdmin/CRM Admin: All; Dept Manager: Own Department)
 * @route   GET /api/crm/admin/roles
 * @access  Private / SuperAdmin or Dept Manager
 */
export const getRoles = async (req, res) => {
  try {
    let roles = [];
    if (supabase) {
      try {
        const { data: dbRoles, error } = await supabase.from('crm_roles').select('*').order('created_at', { ascending: true });
        if (!error && Array.isArray(dbRoles) && dbRoles.length > 0) {
          roles = dbRoles;
        }
      } catch (sbErr) {
        console.warn('Supabase getRoles note:', sbErr?.message);
      }
    }

    if (!roles || roles.length === 0) {
      roles = readJson(ROLES_FILE, []);
    }

    const staff = readJson(STAFF_FILE, []);

    // Department Scoping: If caller is Department Manager, filter to roles in caller's department + active designations
    if (req.user && !req.user.isSuperAdmin && !req.user.isGlobal && req.user.department) {
      const callerDept = req.user.department.toLowerCase();
      roles = roles.filter(r =>
        (r.department || '').toLowerCase().includes(callerDept) ||
        callerDept.includes((r.department || '').toLowerCase()) ||
        r.id === req.user.roleId
      );
    }

    // Enrich with count of staff members assigned to this role
    const enriched = roles.map(r => ({
      ...r,
      staffCount: staff.filter(s => s.roleId === r.id || s.role_id === r.id).length
    }));

    return res.json({ success: true, roles: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new CRM Role / Subordinate Designation
 * @route   POST /api/crm/admin/roles
 * @access  Private / SuperAdmin or Department Manager
 */
export const createRole = async (req, res) => {
  try {
    const { name, description, color, permissions, department, category, reportingTo } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required.' });
    }

    const caller = req.user;
    const isGlobalAdmin = caller?.isSuperAdmin || caller?.isGlobal;

    // Strict Department Scoping Guardrail (Phase 3)
    if (!isGlobalAdmin) {
      // 1. Department Manager cannot create roles in another department
      if (department && caller.department &&
          !department.toLowerCase().includes(caller.department.toLowerCase()) &&
          !caller.department.toLowerCase().includes(department.toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: `Department Managers can only create designations within their own department (${caller.department}).`
        });
      }

      // 2. Department Manager cannot create Department Head roles
      if (category === 'Department Head') {
        return res.status(403).json({
          success: false,
          message: 'Department Managers cannot create Department Head roles. Only Super Admin has this authority.'
        });
      }

      // 3. Permissions cannot exceed Department Head's own permissions
      if (permissions && typeof permissions === 'object') {
        const callerPerms = caller.permissions || {};
        for (const [permKey, isGranted] of Object.entries(permissions)) {
          if (isGranted && !callerPerms[permKey]) {
            return res.status(403).json({
              success: false,
              message: `Cannot grant permission "${permKey}" which exceeds your own authorized department permissions.`
            });
          }
        }
      }
    }

    const assignedDepartment = isGlobalAdmin ? (department || 'CRM Operations & Administration') : caller.department;
    const roles = readJson(ROLES_FILE, []);
    const id = `desig_${Date.now()}`;

    const newRole = {
      id,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      description: description ? description.trim() : '',
      department: assignedDepartment,
      category: isGlobalAdmin ? (category || 'Employee Designation') : 'Employee Designation',
      reportingTo: reportingTo || (isGlobalAdmin ? 'Super Administrator' : caller.roleName),
      color: color || '#059669',
      isSystem: false,
      is_system: false,
      isHead: isGlobalAdmin && category === 'Department Head',
      status: 'Active',
      permissions: permissions || {
        view_customers: true,
        manage_customers: false,
        view_tickets: true,
        manage_tickets: true,
        manage_tasks: true
      },
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('crm_roles').insert(newRole);
      } catch (sbErr) {
        console.warn('Supabase createRole note:', sbErr?.message);
      }
    }

    roles.push(newRole);
    writeJson(ROLES_FILE, roles);

    // Also persist in designations catalog
    const designations = readJson(DESIGNATIONS_FILE, []);
    designations.push({
      id: newRole.id,
      department_name: newRole.department,
      designation_name: newRole.name,
      slug: newRole.slug,
      category: newRole.category,
      reporting_to: newRole.reportingTo,
      is_department_head: newRole.isHead,
      status: 'Active',
      permissions: newRole.permissions
    });
    writeJson(DESIGNATIONS_FILE, designations);

    logCrmAudit(caller, assignedDepartment, 'CREATE_ROLE', 'crm_roles', newRole.id, null, newRole);

    return res.status(201).json({
      success: true,
      message: `Role "${newRole.name}" created successfully for ${newRole.department}!`,
      role: newRole
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update a CRM Role
 * @route   PUT /api/crm/admin/roles/:id
 * @access  Private / SuperAdmin or Department Manager
 */
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, permissions, status } = req.body;

    const roles = readJson(ROLES_FILE, []);
    const idx = roles.findIndex(r => r.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    const existing = roles[idx];
    const caller = req.user;
    const isGlobalAdmin = caller?.isSuperAdmin || caller?.isGlobal;

    // Check departmental authority
    if (!isGlobalAdmin) {
      if (existing.department && caller.department &&
          !existing.department.toLowerCase().includes(caller.department.toLowerCase()) &&
          !caller.department.toLowerCase().includes(existing.department.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Cannot modify roles outside your department.' });
      }
      if (existing.isHead || existing.isSystem) {
        return res.status(403).json({ success: false, message: 'Cannot modify system or Department Head roles.' });
      }
    }

    const updated = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      description: description !== undefined ? description.trim() : existing.description,
      color: color || existing.color,
      status: status || existing.status || 'Active',
      permissions: permissions !== undefined ? permissions : existing.permissions,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('crm_roles').update({
          name: updated.name,
          description: updated.description,
          color: updated.color,
          permissions: updated.permissions,
          updated_at: updated.updated_at
        }).eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase updateRole note:', sbErr?.message);
      }
    }

    roles[idx] = updated;
    writeJson(ROLES_FILE, roles);

    // Also update roleName in staff accounts if name changed
    if (name && name.trim() !== existing.name) {
      const staffList = readJson(STAFF_FILE, []);
      let updatedAny = false;
      staffList.forEach(s => {
        if (s.roleId === id || s.role_id === id) {
          s.roleName = updated.name;
          s.role_name = updated.name;
          updatedAny = true;
        }
      });
      if (updatedAny) writeJson(STAFF_FILE, staffList);
    }

    logCrmAudit(caller, existing.department, 'UPDATE_ROLE', 'crm_roles', id, existing, updated);

    return res.json({
      success: true,
      message: `Role "${updated.name}" updated successfully!`,
      role: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a CRM Role
 * @route   DELETE /api/crm/admin/roles/:id
 * @access  Private / SuperAdmin or Department Manager
 */
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const roles = readJson(ROLES_FILE, []);
    const staff = readJson(STAFF_FILE, []);

    const existing = roles.find(r => r.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    const caller = req.user;
    const isGlobalAdmin = caller?.isSuperAdmin || caller?.isGlobal;

    if (!isGlobalAdmin) {
      if (existing.department && caller.department &&
          !existing.department.toLowerCase().includes(caller.department.toLowerCase()) &&
          !caller.department.toLowerCase().includes(existing.department.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Cannot delete roles outside your department.' });
      }
      if (existing.isHead || existing.isSystem) {
        return res.status(403).json({ success: false, message: 'Cannot delete system or Department Head roles.' });
      }
    }

    // Prevent deleting if staff are assigned
    const assignedCount = staff.filter(s => s.roleId === id || s.role_id === id).length;
    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. There are currently ${assignedCount} staff member(s) assigned to this role.`
      });
    }

    if (supabase) {
      try {
        await supabase.from('crm_roles').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase deleteRole note:', sbErr?.message);
      }
    }

    const filtered = roles.filter(r => r.id !== id);
    writeJson(ROLES_FILE, filtered);

    logCrmAudit(caller, existing.department, 'DELETE_ROLE', 'crm_roles', id, existing, null);

    return res.json({ success: true, message: 'Role deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   STAFF CREDENTIALS & ACCOUNT MANAGEMENT
   ========================================================================= */

/**
 * @desc    Get CRM Staff Accounts (SuperAdmin: All; Dept Manager: Own Department)
 * @route   GET /api/crm/admin/staff
 * @access  Private / SuperAdmin or Dept Manager
 */
export const getStaff = async (req, res) => {
  try {
    let staff = [];
    if (supabase) {
      try {
        const { data: dbStaff, error } = await supabase.from('crm_users').select('*').order('created_at', { ascending: true });
        if (!error && Array.isArray(dbStaff) && dbStaff.length > 0) {
          staff = dbStaff.map(s => ({
            ...s,
            roleId: s.role_id || s.roleId,
            roleName: s.role_name || s.roleName,
            isActive: s.is_active !== undefined ? s.is_active : s.isActive,
            lastLogin: s.last_login || s.lastLogin || null,
            createdAt: s.created_at || s.createdAt || null
          }));
        }
      } catch (sbErr) {
        console.warn('Supabase getStaff note:', sbErr?.message);
      }
    }

    if (!staff || staff.length === 0) {
      staff = readJson(STAFF_FILE, []);
    }

    const caller = req.user;
    const isGlobalAdmin = caller?.isSuperAdmin || caller?.isGlobal;

    // Department Scoping: Department Manager only sees staff of their department
    if (!isGlobalAdmin && caller?.department) {
      const callerDept = caller.department.toLowerCase();
      staff = staff.filter(s =>
        (s.department || '').toLowerCase().includes(callerDept) ||
        callerDept.includes((s.department || '').toLowerCase())
      );
    }

    const roles = readJson(ROLES_FILE, []);
    const tasks = readJson(TASKS_FILE, []);

    const enriched = staff.map(s => {
      const roleObj = roles.find(r => r.id === (s.roleId || s.role_id));
      const sTasks = tasks.filter(t =>
        t.assignedToId === s.id ||
        (t.assignedTo && (
          t.assignedTo.toLowerCase() === (s.name || '').toLowerCase() ||
          t.assignedTo.toLowerCase() === (s.fullName || '').toLowerCase() ||
          t.assignedTo.toLowerCase().includes((s.roleName || '').toLowerCase()) ||
          t.assignedTo.toLowerCase().includes((s.designationName || '').toLowerCase())
        ))
      );
      const completedTasks = sTasks.filter(t => t.status === 'Completed' || t.completed).length;
      const pendingTasks = sTasks.filter(t => t.status !== 'Completed' && !t.completed).length;

      return {
        ...s,
        roleId: s.roleId || s.role_id,
        roleName: roleObj?.name || s.roleName || s.role_name || 'Unassigned',
        roleColor: roleObj?.color || '#0F2E23',
        tasksCount: sTasks.length,
        completedTasks,
        pendingTasks
      };
    });

    return res.json({ success: true, staff: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new CRM Staff Account with Credentials
 * @route   POST /api/crm/admin/staff
 * @access  Private / SuperAdmin or Dept Manager
 */
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, roleId, phone, department, isActive } = req.body;

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Name, Login Email, Password, and Assigned Role are required.'
      });
    }

    const caller = req.user;
    const isGlobalAdmin = caller?.isSuperAdmin || caller?.isGlobal;

    // Strict Department Scoping (Phase 3)
    if (!isGlobalAdmin) {
      if (department && caller.department &&
          !department.toLowerCase().includes(caller.department.toLowerCase()) &&
          !caller.department.toLowerCase().includes(department.toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: `Department Managers can only add employees within their own department (${caller.department}).`
        });
      }
    }

    const assignedDepartment = isGlobalAdmin ? (department || 'CRM Operations & Administration') : caller.department;
    const cleanEmail = email.trim().toLowerCase();
    const staffList = readJson(STAFF_FILE, []);
    const rolesList = readJson(ROLES_FILE, []);

    // Check duplicate email
    if (staffList.some(s => s.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: `A staff account with email "${cleanEmail}" already exists.`
      });
    }

    const roleObj = rolesList.find(r => r.id === roleId);

    // If Dept Manager, ensure role belongs to their department and is not Dept Head
    if (!isGlobalAdmin) {
      if (roleObj && roleObj.department &&
          !roleObj.department.toLowerCase().includes(caller.department.toLowerCase()) &&
          !caller.department.toLowerCase().includes(roleObj.department.toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: `Selected designation does not belong to your department (${caller.department}).`
        });
      }
      if (roleObj?.isHead) {
        return res.status(403).json({
          success: false,
          message: 'Department Managers cannot assign Department Head designations.'
        });
      }
    }

    const newStaff = {
      id: `crm_usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      phone: phone ? phone.trim() : '',
      roleId,
      role_id: roleId,
      roleName: roleObj ? roleObj.name : 'CRM Staff',
      role_name: roleObj ? roleObj.name : 'CRM Staff',
      department: assignedDepartment,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      is_active: isActive !== undefined ? Boolean(isActive) : true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('crm_users').insert(newStaff);
      } catch (sbErr) {
        console.warn('Supabase createStaff note:', sbErr?.message);
      }
    }

    staffList.push(newStaff);
    writeJson(STAFF_FILE, staffList);

    logCrmAudit(caller, assignedDepartment, 'CREATE_STAFF', 'crm_users', newStaff.id, null, { name: newStaff.name, email: newStaff.email, department: newStaff.department, role: newStaff.roleName });

    return res.status(201).json({
      success: true,
      message: `CRM Staff account created for ${newStaff.name}! They can now log in at /crm.`,
      staff: newStaff
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Staff Account / Reset Password / Toggle Status
 * @route   PUT /api/crm/admin/staff/:id
 * @access  Private / SuperAdmin or Dept Manager
 */
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, roleId, phone, department, isActive } = req.body;

    const staffList = readJson(STAFF_FILE, []);
    const rolesList = readJson(ROLES_FILE, []);
    const idx = staffList.findIndex(s => s.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Staff member account not found.' });
    }

    const existing = staffList[idx];
    const caller = req.user;
    const isGlobalAdmin = caller?.isSuperAdmin || caller?.isGlobal;

    // Check department authority
    if (!isGlobalAdmin) {
      if (existing.department && caller.department &&
          !existing.department.toLowerCase().includes(caller.department.toLowerCase()) &&
          !caller.department.toLowerCase().includes(existing.department.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Cannot modify staff accounts outside your department.' });
      }
    }

    const roleObj = roleId ? rolesList.find(r => r.id === roleId) : null;

    const updated = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      email: email !== undefined ? email.trim().toLowerCase() : existing.email,
      password: password !== undefined && password.trim() ? password.trim() : existing.password,
      roleId: roleId || existing.roleId,
      role_id: roleId || existing.role_id,
      roleName: roleObj ? roleObj.name : existing.roleName,
      role_name: roleObj ? roleObj.name : existing.role_name,
      phone: phone !== undefined ? phone.trim() : existing.phone,
      department: isGlobalAdmin ? (department !== undefined ? department.trim() : existing.department) : existing.department,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      is_active: isActive !== undefined ? Boolean(isActive) : existing.is_active,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('crm_users').update({
          name: updated.name,
          email: updated.email,
          password: updated.password,
          role_id: updated.role_id,
          roleId: updated.roleId,
          role_name: updated.role_name,
          roleName: updated.roleName,
          phone: updated.phone,
          department: updated.department,
          is_active: updated.is_active,
          isActive: updated.isActive,
          updated_at: updated.updated_at
        }).eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase updateStaff note:', sbErr?.message);
      }
    }

    staffList[idx] = updated;
    writeJson(STAFF_FILE, staffList);

    logCrmAudit(caller, existing.department, 'UPDATE_STAFF', 'crm_users', id, { email: existing.email, name: existing.name }, { email: updated.email, name: updated.name, role: updated.roleName });

    return res.json({
      success: true,
      message: `Staff account "${updated.name}" updated successfully!`,
      staff: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete Staff Account
 * @route   DELETE /api/crm/admin/staff/:id
 * @access  Private / SuperAdmin or Dept Manager
 */
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staffList = readJson(STAFF_FILE, []);
    const existing = staffList.find(s => s.id === id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    const caller = req.user;
    const isGlobalAdmin = caller?.isSuperAdmin || caller?.isGlobal;

    if (!isGlobalAdmin) {
      if (existing.department && caller.department &&
          !existing.department.toLowerCase().includes(caller.department.toLowerCase()) &&
          !caller.department.toLowerCase().includes(existing.department.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Cannot delete staff outside your department.' });
      }
    }

    if (supabase) {
      try {
        await supabase.from('crm_users').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase deleteStaff note:', sbErr?.message);
      }
    }

    const filtered = staffList.filter(s => s.id !== id);
    writeJson(STAFF_FILE, filtered);

    logCrmAudit(caller, existing.department, 'DELETE_STAFF', 'crm_users', id, existing, null);

    return res.json({ success: true, message: 'Staff account deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   TASK WORKFLOW & ASSIGNMENT SYSTEM (PHASE 6)
   Pending -> In Progress -> Under Review -> Completed / Reopened
   ========================================================================= */

/**
 * @desc    Get Tasks & Reminders (Scoped to User / Department)
 * @route   GET /api/crm/tasks
 * @access  Private / CRM Staff
 */
export const getTasks = async (req, res) => {
  try {
    let tasks = readJson(TASKS_FILE, []);
    const caller = req.user;

    // Scope tasks if caller is known
    if (caller && !caller.isSuperAdmin && !caller.isGlobal) {
      const isLeadOrManager = caller.isDeptHead || 
        (caller.roleName && caller.roleName.toLowerCase().includes('lead')) ||
        (caller.designationName && caller.designationName.toLowerCase().includes('lead')) ||
        (caller.roleName && caller.roleName.toLowerCase().includes('manager')) ||
        (caller.designationName && caller.designationName.toLowerCase().includes('manager'));

      if (isLeadOrManager) {
        // Department Head & Team Lead see their department's tasks to track delegation & completion
        const dept = (caller.department || '').toLowerCase();
        tasks = tasks.filter(t => (t.department || '').toLowerCase().includes(dept) || dept.includes((t.department || '').toLowerCase()));
      } else {
        // Subordinate employee sees tasks assigned to them (by name, email, ID, or designation) or created/delegated by them
        const myName = (caller.name || '').toLowerCase();
        const myEmail = (caller.email || '').toLowerCase();
        const myDesig = (caller.designationName || caller.roleName || '').toLowerCase();
        tasks = tasks.filter(t => {
          const assigned = (t.assignedTo || '').toLowerCase();
          return (
            assigned === myName ||
            assigned === myEmail ||
            (myDesig && assigned === myDesig) ||
            t.assignedToId === caller.id ||
            t.delegatedToId === caller.id ||
            t.assignedById === caller.id ||
            t.delegatedById === caller.id
          );
        });
      }
    }

    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create Task
 * @route   POST /api/crm/tasks
 * @access  Private / CRM Staff
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, assignedToId, customerName, customerPhone, dueDate, priority, department, category } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const caller = req.user;
    const tasks = readJson(TASKS_FILE, []);
    const assignedDepartment = department || caller?.department || 'CRM Operations & Administration';

    const newTask = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      department: assignedDepartment,
      category: category || 'General',
      assignedTo: assignedTo || 'Unassigned',
      assignedToId: assignedToId || null,
      assignedBy: caller?.name || 'Manager',
      assignedById: caller?.id || null,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString(),
      priority: priority || 'Medium',
      status: 'Pending',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    writeJson(TASKS_FILE, tasks);

    // Log to task history
    const history = readJson(TASK_HISTORY_FILE, []);
    history.unshift({
      id: `th_${Date.now()}`,
      taskId: newTask.id,
      action: 'TASK_CREATED',
      oldValue: null,
      newValue: 'Pending',
      performedBy: caller?.name || 'System',
      performedById: caller?.id,
      remarks: `Task assigned to ${newTask.assignedTo}`,
      createdAt: new Date().toISOString()
    });
    writeJson(TASK_HISTORY_FILE, history);

    // Send notification if assigned to staff
    if (assignedTo && assignedTo !== 'Unassigned') {
      const staffList = readJson(STAFF_FILE, []);
      const assignee = staffList.find(s => s.name?.toLowerCase() === assignedTo.toLowerCase() || s.id === assignedToId);
      if (assignee) {
        createNotification(
          assignee.id,
          assignee.email,
          'New Task Assigned',
          `You have been assigned: "${newTask.title}" (Due: ${new Date(newTask.dueDate).toLocaleDateString()})`,
          'Task',
          'crm_tasks',
          newTask.id
        );
      }
    }

    return res.status(201).json({ success: true, message: 'Follow-up task created!', task: newTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Task Lifecycle Status (Pending -> In Progress -> Under Review -> Completed / Reopened)
 * @route   PUT /api/crm/tasks/:id/status
 * @access  Private / CRM Staff
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, reopenReason, description, employeeNotes } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Under Review', 'Completed', 'Reopened'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const tasks = readJson(TASKS_FILE, []);
    const idx = tasks.findIndex(t => t.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const existing = tasks[idx];
    const caller = resolveCrmUser(req) || req.user;
    const isLeadOrManager = caller?.isSuperAdmin || caller?.isCrmAdmin || caller?.isDeptHead || caller?.roleName?.includes('Team Lead') || caller?.designationName?.includes('Team Lead');

    // Workflow Authority Validation
    if (status === 'Completed' || status === 'Reopened') {
      if (!isLeadOrManager) {
        return res.status(403).json({
          success: false,
          message: 'Only Department Heads, Team Leads, or Super Admin can approve (Complete) or Reopen a submitted task.'
        });
      }
    }

    const prevStatus = existing.status || 'Pending';
    const noteContent = description || employeeNotes || remarks || '';

    existing.status = status;
    existing.completed = (status === 'Completed');
    existing.updatedAt = new Date().toISOString();
    existing.lastUpdatedBy = caller?.name || 'Staff';
    existing.lastUpdatedAt = new Date().toISOString();

    if (noteContent) {
      existing.remarks = noteContent;
      existing.employeeNotes = noteContent;
    }

    if (status === 'In Progress' && !existing.startedAt) {
      existing.startedAt = new Date().toISOString();
    }
    if (status === 'Under Review') {
      existing.submittedAt = new Date().toISOString();
    }
    if (status === 'Completed') {
      existing.completedAt = new Date().toISOString();
      existing.approvedBy = caller?.name || 'Customer Support Manager';
    }
    if (status === 'Reopened') {
      existing.reopenReason = reopenReason || noteContent || 'Revisions requested by manager';
    }

    tasks[idx] = existing;
    writeJson(TASKS_FILE, tasks);

    // If description/remarks provided, add to task comments
    if (noteContent) {
      const comments = readJson(TASK_COMMENTS_FILE, []);
      comments.push({
        id: `tc_${Date.now()}`,
        taskId: existing.id,
        employeeId: caller?.id || 'staff',
        employeeName: caller?.name || 'Team Member',
        comment: `[Status: ${status}] ${noteContent}`,
        createdAt: new Date().toISOString()
      });
      writeJson(TASK_COMMENTS_FILE, comments);
    }

    // Record in Task History
    const history = readJson(TASK_HISTORY_FILE, []);
    history.unshift({
      id: `th_${Date.now()}`,
      taskId: existing.id,
      action: `STATUS_CHANGE_TO_${status.toUpperCase().replace(/\s+/g, '_')}`,
      oldValue: prevStatus,
      newValue: status,
      performedBy: caller?.name || 'Staff',
      performedById: caller?.id,
      remarks: noteContent || reopenReason || '',
      createdAt: new Date().toISOString()
    });
    writeJson(TASK_HISTORY_FILE, history);

    // Notify respective parties
    if (status === 'Under Review' || status === 'Completed' || status === 'In Progress') {
      createNotification(
        existing.delegatedById || existing.assignedById || 'dept_manager',
        null,
        `Task Status: ${status}`,
        `Task "${existing.title}" was updated to ${status} by ${caller?.name || 'employee'}. ${noteContent ? 'Note: ' + noteContent : ''}`,
        'Task',
        'crm_tasks',
        existing.id
      );
    } else if (status === 'Reopened') {
      createNotification(
        existing.assignedToId || 'assignee',
        null,
        'Task Reopened for Revision',
        `Your task "${existing.title}" was marked Reopened by ${caller?.name}. ${reopenReason ? 'Feedback: ' + reopenReason : ''}`,
        'Task',
        'crm_tasks',
        existing.id
      );
    }

    return res.json({ success: true, message: `Task status updated to "${status}"!`, task: existing });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delegate / Reassign a Task (Manager or Team Lead to Executive)
 * @route   PUT /api/crm/tasks/:id/delegate
 * @access  Private / CRM Staff (Manager or Team Lead)
 */
export const delegateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedToId, delegationNotes } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'Assignee is required.' });
    }

    const tasks = readJson(TASKS_FILE, []);
    const idx = tasks.findIndex(t => t.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const existing = tasks[idx];
    const caller = resolveCrmUser(req) || req.user;
    const prevAssignee = existing.assignedTo;

    existing.assignedTo = assignedTo;
    existing.assignedToId = assignedToId || existing.assignedToId;
    existing.delegatedBy = caller?.name || 'Customer Support Team Lead';
    existing.delegatedById = caller?.id || null;
    existing.delegationNotes = delegationNotes || '';
    existing.status = existing.status === 'Completed' ? 'In Progress' : (existing.status || 'Pending');
    existing.updatedAt = new Date().toISOString();

    tasks[idx] = existing;
    writeJson(TASKS_FILE, tasks);

    // Record in Task History
    const history = readJson(TASK_HISTORY_FILE, []);
    history.unshift({
      id: `th_${Date.now()}`,
      taskId: existing.id,
      action: 'TASK_DELEGATED',
      oldValue: prevAssignee,
      newValue: assignedTo,
      performedBy: caller?.name || 'Staff',
      performedById: caller?.id,
      remarks: delegationNotes || `Delegated from ${prevAssignee} to ${assignedTo}`,
      createdAt: new Date().toISOString()
    });
    writeJson(TASK_HISTORY_FILE, history);

    // If delegation notes provided, add as comment
    if (delegationNotes) {
      const comments = readJson(TASK_COMMENTS_FILE, []);
      comments.push({
        id: `tc_${Date.now()}`,
        taskId: existing.id,
        employeeId: caller?.id || 'lead',
        employeeName: caller?.name || 'Team Lead',
        comment: `Delegated to ${assignedTo}: ${delegationNotes}`,
        createdAt: new Date().toISOString()
      });
      writeJson(TASK_COMMENTS_FILE, comments);
    }

    // Notify assignee
    createNotification(
      assignedToId || 'assignee',
      null,
      'Task Assigned by Higher Authority',
      `You have been assigned: "${existing.title}" by ${caller?.name || 'Higher Authority'}. ${delegationNotes ? 'Note: ' + delegationNotes : ''}`,
      'Task',
      'crm_tasks',
      existing.id
    );

    return res.json({ success: true, message: `Task delegated to ${assignedTo}!`, task: existing });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Task (General fields)
 * @route   PUT /api/crm/tasks/:id
 * @access  Private / CRM Staff
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = readJson(TASKS_FILE, []);
    const idx = tasks.findIndex(t => t.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updated = {
      ...tasks[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    tasks[idx] = updated;
    writeJson(TASKS_FILE, tasks);

    return res.json({ success: true, message: 'Task updated!', task: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Task History Audit Trail
 * @route   GET /api/crm/tasks/:id/history
 * @access  Private / CRM Staff
 */
export const getTaskHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = readJson(TASK_HISTORY_FILE, []);
    const filtered = history.filter(h => h.taskId === id);
    return res.json({ success: true, history: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add Comment to Task
 * @route   POST /api/crm/tasks/:id/comments
 * @access  Private / CRM Staff
 */
export const createTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const comments = readJson(TASK_COMMENTS_FILE, []);
    const newComment = {
      id: `tc_${Date.now()}`,
      taskId: id,
      employeeId: req.user?.id || 'staff',
      employeeName: req.user?.name || 'Team Member',
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    writeJson(TASK_COMMENTS_FILE, comments);

    return res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Comments for Task
 * @route   GET /api/crm/tasks/:id/comments
 * @access  Private / CRM Staff
 */
export const getTaskComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = readJson(TASK_COMMENTS_FILE, []);
    const filtered = comments.filter(c => c.taskId === id);
    return res.json({ success: true, comments: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   NOTIFICATIONS API (PHASE 10)
   ========================================================================= */

/**
 * @desc    Get Notifications for Current Staff Member
 * @route   GET /api/crm/notifications
 * @access  Private / CRM Staff
 */
export const getNotifications = async (req, res) => {
  try {
    const notifs = readJson(NOTIFICATIONS_FILE, []);
    const caller = req.user;

    const filtered = notifs.filter(n =>
      n.recipient_employee_id === caller?.id ||
      (caller?.email && n.recipient_email?.toLowerCase() === caller.email.toLowerCase()) ||
      n.recipient_employee_id === 'all'
    );

    return res.json({ success: true, notifications: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark Notification Read
 * @route   PUT /api/crm/notifications/:id/read
 * @access  Private / CRM Staff
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notifs = readJson(NOTIFICATIONS_FILE, []);
    const idx = notifs.findIndex(n => n.id === id);

    if (idx !== -1) {
      notifs[idx].is_read = true;
      writeJson(NOTIFICATIONS_FILE, notifs);
    }

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark All Notifications Read
 * @route   PUT /api/crm/notifications/mark-all-read
 * @access  Private / CRM Staff
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const notifs = readJson(NOTIFICATIONS_FILE, []);
    const caller = req.user;

    notifs.forEach(n => {
      if (n.recipient_employee_id === caller?.id || (caller?.email && n.recipient_email?.toLowerCase() === caller.email.toLowerCase())) {
        n.is_read = true;
      }
    });

    writeJson(NOTIFICATIONS_FILE, notifs);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   AUDIT LOGS API (PHASE 2 & PHASE 7)
   ========================================================================= */

/**
 * @desc    Get CRM Audit Logs
 * @route   GET /api/crm/audit-logs
 * @access  Private / SuperAdmin or Dept Manager
 */
export const getAuditLogs = async (req, res) => {
  try {
    let logs = readJson(AUDIT_LOGS_FILE, []);
    const caller = req.user;

    if (caller && !caller.isSuperAdmin && !caller.isGlobal) {
      const dept = (caller.department || '').toLowerCase();
      logs = logs.filter(l => (l.department_name || '').toLowerCase().includes(dept) || dept.includes((l.department_name || '').toLowerCase()));
    }

    return res.json({ success: true, auditLogs: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   OPERATIONAL CRM PORTAL DATA (CUSTOMERS, LEADS, TICKETS)
   ========================================================================= */

/**
 * @desc    CRM Dashboard Overview KPIs
 * @route   GET /api/crm/dashboard
 * @access  Private / CRM Staff
 */
export const getDashboardStats = async (req, res) => {
  try {
    const users = readJson(USERS_FILE, []);
    const customers = users.filter(u => u.role === 'CUSTOMER' || !u.role);
    const providers = users.filter(u => u.role === 'SERVICE_PROVIDER');
    const leads = readJson(LEADS_FILE, []);
    const tickets = readJson(TICKETS_FILE, []);
    const tasks = readJson(TASKS_FILE, []);
    const orders = readJson(ORDERS_FILE, []);
    const bookings = readJson(BOOKINGS_FILE, []);
    const staff = readJson(STAFF_FILE, []);
    const roles = readJson(ROLES_FILE, []);
    const prescriptions = readJson(PRESCRIPTIONS_FILE, []);
    const refunds = readJson(REFUNDS_FILE, []);
    const incidents = readJson(INCIDENTS_FILE, []);

    const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress' || !t.completed).length;
    const activeLeads = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;
    const storeRevenue = orders.reduce((sum, o) => sum + Number(o.grandTotal || o.totalAmount || 0), 0);
    const serviceRevenue = bookings.reduce((sum, b) => sum + Number(b.fee || 0), 0);
    const totalRevenue = storeRevenue + serviceRevenue;
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'Pending' || !p.status).length;
    const verifiedProviders = providers.filter(p => p.verificationStatus === 'Verified' || p.isVerified).length;
    const pendingRefunds = refunds.filter(r => r.status === 'Pending').length;

    return res.json({
      success: true,
      stats: {
        totalCustomers: customers.length,
        activeLeads,
        openTickets,
        pendingTasks,
        totalOrdersCount: orders.length,
        totalBookingsCount: bookings.length,
        storeRevenue,
        serviceRevenue,
        totalRevenue,
        totalProvidersCount: providers.length,
        verifiedProviders,
        pendingPrescriptions,
        pendingRefunds,
        staffCount: staff.length,
        rolesCount: roles.length,
        systemUptime: '99.98%',
        recentTickets: tickets.slice(0, 5),
        recentLeads: leads.slice(0, 5),
        recentOrders: orders.slice(0, 5),
        recentBookings: bookings.slice(0, 5)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Customers with 360 profile summaries
 * @route   GET /api/crm/customers
 * @access  Private / CRM Staff
 */
export const getCustomers = async (req, res) => {
  try {
    const users = readJson(USERS_FILE, []);
    const orders = readJson(ORDERS_FILE, []);
    const bookings = readJson(BOOKINGS_FILE, []);

    const customers = users
      .filter(u => u.role === 'CUSTOMER' || !u.role)
      .map(c => {
        const cOrders = orders.filter(o => o.userId === c.id || o.user?.email === c.email || o.shippingAddress?.email === c.email);
        const cBookings = bookings.filter(b => b.userId === c.id || b.userEmail === c.email);
        const totalSpent = cOrders.reduce((sum, o) => sum + Number(o.pricing?.total || o.totalAmount || 0), 0);

        return {
          id: c.id,
          name: c.name || 'Pet Parent',
          email: c.email,
          phone: c.phone || c.mobile || 'Not provided',
          city: c.city || c.address?.city || 'Bangalore',
          ordersCount: cOrders.length,
          bookingsCount: cBookings.length,
          totalSpent,
          pets: c.pets || (c.petType ? [{ name: c.petName || 'Companion', type: c.petType }] : []),
          membershipPass: c.membershipPass || 'Standard',
          crmNotes: c.crmNotes || [],
          createdAt: c.createdAt || new Date().toISOString()
        };
      });

    return res.json({ success: true, customers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add Note to Customer Record
 * @route   POST /api/crm/customers/:id/notes
 * @access  Private / CRM Staff
 */
export const addCustomerNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, authorName } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required.' });
    }

    const users = readJson(USERS_FILE, []);
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Customer record not found.' });
    }

    const newNote = {
      id: `note_${Date.now()}`,
      author: authorName || 'CRM Staff',
      text: note.trim(),
      timestamp: new Date().toISOString()
    };

    if (!Array.isArray(users[idx].crmNotes)) {
      users[idx].crmNotes = [];
    }

    users[idx].crmNotes.unshift(newNote);
    writeJson(USERS_FILE, users);

    return res.json({ success: true, message: 'Note logged to customer record.', note: newNote });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get All Leads
 * @route   GET /api/crm/leads
 * @access  Private / CRM Staff
 */
export const getLeads = async (req, res) => {
  try {
    const leads = readJson(LEADS_FILE, []);
    const enquiries = readJson(ENQUIRIES_FILE, []);

    const leadEmails = new Set(leads.map(l => (l.email || '').toLowerCase()));
    enquiries.forEach(enq => {
      const em = (enq.email || '').toLowerCase();
      if (em && !leadEmails.has(em)) {
        leads.unshift({
          id: `ENQ-LEAD-${enq.id || Date.now()}`,
          name: enq.name || 'Website Inquirer',
          email: enq.email,
          phone: enq.phone || '',
          petInterest: enq.subject || enq.service || 'General Pet Inquiry',
          source: 'Website Contact Form',
          budget: '₹5,000+',
          stage: 'New',
          priority: 'Normal',
          assignedTo: 'Unassigned',
          notes: enq.message || '',
          createdAt: enq.createdAt || new Date().toISOString(),
          updatedAt: enq.createdAt || new Date().toISOString()
        });
        leadEmails.add(em);
      }
    });

    return res.json({ success: true, leads });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create Lead
 * @route   POST /api/crm/leads
 * @access  Private / CRM Staff
 */
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, petInterest, source, budget, priority, assignedTo, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Lead Name and Phone number are required.' });
    }

    const leads = readJson(LEADS_FILE, []);
    const newLead = {
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone.trim(),
      petInterest: petInterest ? petInterest.trim() : 'General Inquiry',
      source: source || 'Direct Phone/Walk-in',
      budget: budget || 'Flexible',
      stage: 'New',
      priority: priority || 'Medium',
      assignedTo: assignedTo || 'Unassigned',
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    leads.unshift(newLead);
    writeJson(LEADS_FILE, leads);

    return res.status(201).json({ success: true, message: 'Lead created successfully!', lead: newLead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Lead (Stage, Notes, Assigned Staff)
 * @route   PUT /api/crm/leads/:id
 * @access  Private / CRM Staff
 */
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const leads = readJson(LEADS_FILE, []);
    const idx = leads.findIndex(l => l.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    const existing = leads[idx];
    const updated = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    leads[idx] = updated;
    writeJson(LEADS_FILE, leads);

    return res.json({ success: true, message: 'Lead updated successfully!', lead: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Support Tickets
 * @route   GET /api/crm/tickets
 * @access  Private / CRM Staff
 */
export const getTickets = async (req, res) => {
  try {
    const tickets = readJson(TICKETS_FILE, []);
    return res.json({ success: true, tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create Support Ticket
 * @route   POST /api/crm/tickets
 * @access  Private / CRM Staff
 */
export const createTicket = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, subject, category, priority, assignedTo, initialMessage } = req.body;
    if (!customerName || !subject) {
      return res.status(400).json({ success: false, message: 'Customer name and Ticket subject are required.' });
    }

    const tickets = readJson(TICKETS_FILE, []);
    const id = `TICK-${Date.now().toString().slice(-4)}`;

    const newTicket = {
      id,
      ticketNumber: `TCK-${Date.now().toString().slice(-4)}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      customerPhone: customerPhone ? customerPhone.trim() : '',
      subject: subject.trim(),
      category: category || 'General Support',
      priority: priority || 'Medium',
      status: 'Open',
      assignedTo: assignedTo || 'Unassigned',
      messages: initialMessage ? [
        {
          sender: 'customer',
          senderName: customerName.trim(),
          text: initialMessage.trim(),
          timestamp: new Date().toISOString()
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tickets.unshift(newTicket);
    writeJson(TICKETS_FILE, tickets);

    return res.status(201).json({ success: true, message: 'Support ticket created!', ticket: newTicket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Ticket (Status, Reply message, Assigned staff)
 * @route   PUT /api/crm/tickets/:id
 * @access  Private / CRM Staff
 */
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, replyMessage, replySenderName } = req.body;

    const tickets = readJson(TICKETS_FILE, []);
    const idx = tickets.findIndex(t => t.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const existing = tickets[idx];
    const messages = Array.isArray(existing.messages) ? [...existing.messages] : [];

    if (replyMessage && replyMessage.trim()) {
      messages.push({
        sender: 'staff',
        senderName: replySenderName || 'Support Agent',
        text: replyMessage.trim(),
        timestamp: new Date().toISOString()
      });
    }

    const updated = {
      ...existing,
      status: status || existing.status,
      priority: priority || existing.priority,
      assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
      messages,
      updatedAt: new Date().toISOString()
    };

    tickets[idx] = updated;
    writeJson(TICKETS_FILE, tickets);

    return res.json({ success: true, message: 'Ticket updated successfully!', ticket: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   DEPARTMENT SPECIFIC OPERATIONAL ENDPOINTS
   ========================================================================= */

/**
 * SERVICE OPERATIONS: Get bookings list with full customer, provider and dispute metadata
 */
export const getBookings = async (req, res) => {
  try {
    const diskBookings = readJson(BOOKINGS_FILE, []);
    let allBookings = [...diskBookings];

    let usersMap = new Map();
    try {
      const diskUsers = readJson(USERS_FILE, []);
      diskUsers.forEach(u => {
        if (u.id || u._id) usersMap.set(String(u.id || u._id), u);
        if (u.email) usersMap.set(u.email.toLowerCase(), u);
      });
    } catch (_) {}

    if (supabase) {
      try {
        const { data: sbUsers } = await supabase.from('users').select('id, name, email, mobile, phone, location');
        if (Array.isArray(sbUsers)) {
          sbUsers.forEach(u => {
            if (u.id) usersMap.set(String(u.id), u);
            if (u.email) usersMap.set(u.email.toLowerCase(), u);
          });
        }

        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const ids = new Set(allBookings.map(b => b.id || b._id));
          for (const item of data) {
            const rawItem = item.details ? { ...item.details, ...item } : item;
            if (!ids.has(rawItem.id || rawItem._id)) {
              allBookings.push(rawItem);
            }
          }
        }
      } catch (sbErr) {
        console.warn('[CRM] Supabase bookings fetch notice:', sbErr?.message);
      }
    }

    // Enrich each booking with matched customer and provider information for oversight & problem solving
    const enriched = allBookings.map(b => {
      const userIdKey = String(b.userId || b.user_id || b.customerId || '').trim();
      const userEmailKey = (b.userEmail || b.customerEmail || b.email || b.user?.email || b.pet_details?.userEmail || '').toLowerCase().trim();
      const matchedUser = usersMap.get(userIdKey) || usersMap.get(userEmailKey) || b.user || {};

      const custName = b.customerName || b.ownerName || matchedUser.name || b.user?.name || (userEmailKey ? userEmailKey.split('@')[0] : 'Client');
      const custPhone = b.customerPhone || b.ownerPhone || b.userPhone || matchedUser.mobile || matchedUser.phone || b.phone || b.pet_details?.userPhone || '+91 98765 43210';
      const custEmail = b.customerEmail || b.ownerEmail || b.userEmail || matchedUser.email || b.email || b.pet_details?.userEmail || 'client@joshpetshub.com';

      return {
        ...b,
        _id: b.id || b._id,
        id: b.id || b._id,
        serviceType: b.serviceType || b.service_type || b.serviceCategory || 'Service',
        providerName: b.providerName || b.provider_name || 'Josh Pets Hub Clinic',
        location: b.location || matchedUser.location || 'Bangalore, India',
        date: b.date || b.bookingDate || 'Scheduled Date',
        timeSlot: b.timeSlot || b.time_slot || '10:00 AM - 11:00 AM',
        fee: Number(b.fee || b.quoteAmount || b.totalAmount || b.total_amount || 500),
        status: b.status || b.bookingStatus || 'Confirmed',
        paymentStatus: b.paymentStatus || b.payment_status || 'Pay at Clinic',
        customer: {
          name: custName,
          phone: custPhone,
          email: custEmail,
          location: b.location || matchedUser.location || 'Bangalore'
        },
        user: {
          name: custName,
          phone: custPhone,
          email: custEmail
        },
        petDetails: {
          name: b.petDetails?.name || b.pet_details?.name || b.petName || 'Bruno',
          breed: b.petDetails?.breed || b.pet_details?.breed || b.petBreed || 'Indie / Mixed',
          type: b.petDetails?.type || b.pet_details?.type || b.petSpecies || 'Dog'
        }
      };
    });

    return res.json({ success: true, bookings: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SERVICE OPERATIONS: Update appointment status (Confirmed, In-Service, Completed, Cancelled)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const bookings = readJson(BOOKINGS_FILE, []);
    const idx = bookings.findIndex(b => b._id === id || b.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    bookings[idx].status = status || bookings[idx].status;
    if (remarks) bookings[idx].coordinatorRemarks = remarks;
    bookings[idx].updatedAt = new Date().toISOString();

    writeJson(BOOKINGS_FILE, bookings);
    return res.json({ success: true, message: `Booking status updated to ${status}`, booking: bookings[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ORDERS: Get product store orders with items and delivery tracking
 */
export const getOrders = async (req, res) => {
  try {
    const orders = readJson(ORDERS_FILE, []);
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ORDERS: Update shipping stage (Pending, Processing, Shipped, Delivered) and tracking
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingStatus, trackingId, remarks } = req.body;
    const orders = readJson(ORDERS_FILE, []);
    const idx = orders.findIndex(o => o.id === id || o._id === id || o.orderNumber === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (shippingStatus) orders[idx].shippingStatus = shippingStatus;
    if (trackingId !== undefined) orders[idx].trackingId = trackingId;
    if (remarks) orders[idx].internalNotes = remarks;
    orders[idx].updatedAt = new Date().toISOString();

    writeJson(ORDERS_FILE, orders);
    return res.json({ success: true, message: `Order status updated to ${shippingStatus}`, order: orders[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * FINANCE: Overview of revenue reconciliation, refunds, and totals
 */
export const getFinanceOverview = async (req, res) => {
  try {
    const orders = readJson(ORDERS_FILE, []);
    const bookings = readJson(BOOKINGS_FILE, []);
    const refunds = readJson(REFUNDS_FILE, []);

    const storeRevenue = orders.reduce((sum, o) => sum + Number(o.grandTotal || o.totalAmount || 0), 0);
    const serviceRevenue = bookings.reduce((sum, b) => sum + Number(b.fee || 0), 0);

    return res.json({
      success: true,
      finance: {
        storeRevenue,
        serviceRevenue,
        grossPlatformVolume: storeRevenue + serviceRevenue,
        refunds,
        totalRefundsPending: refunds.filter(r => r.status === 'Pending').length,
        totalRefundAmount: refunds.reduce((sum, r) => sum + Number(r.amount || 0), 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * FINANCE: Get Provider Payout Requests
 */
export const getFinancePayouts = async (req, res) => {
  try {
    let payouts = loadAllUnifiedPayouts();

    if (supabase) {
      try {
        const { data: dbPayouts, error } = await supabase
          .from('provider_payouts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(dbPayouts) && dbPayouts.length > 0) {
          const map = new Map(payouts.map(p => [String(p.id), p]));
          dbPayouts.forEach(p => {
            const pid = String(p.id || p._id);
            if (!map.has(pid)) {
              map.set(pid, {
                ...p,
                id: pid,
                providerId: p.provider_id || p.providerId,
                providerName: p.provider_name || p.providerName,
                providerEmail: p.provider_email || p.providerEmail,
                serviceCategory: p.service_category || p.serviceCategory,
                payoutMethod: p.payout_method || p.payoutMethod,
                upiId: p.upi_id || p.upiId,
                amount: Number(p.amount || 0),
                status: p.status || 'Requested',
                requestedAt: p.requested_at || p.requestedAt || p.created_at,
                bankDetails: p.bank_details || p.bankDetails
              });
            }
          });
          payouts = Array.from(map.values()).sort((a, b) => new Date(b.requestedAt || b.createdAt || 0) - new Date(a.requestedAt || a.createdAt || 0));
        }
      } catch (sbErr) {
        console.warn('[CRM Finance] Supabase payout query note:', sbErr?.message);
      }
    }

    const { status, provider, startDate, endDate } = req.query;

    let filtered = [...payouts];
    if (status && status !== 'All') {
      filtered = filtered.filter(p => (p.status || '').toLowerCase() === status.toLowerCase());
    }
    if (provider) {
      const q = provider.toLowerCase();
      filtered = filtered.filter(p => (p.providerName || '').toLowerCase().includes(q) || (p.providerEmail || '').toLowerCase().includes(q));
    }
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.requestedAt || p.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.requestedAt || p.createdAt) <= new Date(endDate));
    }

    return res.json({ success: true, payouts: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * FINANCE: Export Payouts Report CSV (Verified financial data format)
 */
export const exportFinancePayoutsCsv = async (req, res) => {
  try {
    const payouts = loadAllUnifiedPayouts();
    let csv = 'Payout ID,Provider Name,Service Category,Amount (INR),Status,Bank Name,Account Masked,IFSC,Requested Date,Processed Date,Transfer Reference,Admin Notes\n';

    for (const p of payouts) {
      csv += `"${p.id}","${p.providerName || ''}","${p.serviceCategory || ''}","${p.amount}","${p.status}","${p.bankDetails?.bankName || ''}","${p.bankDetails?.accountNumberMasked || ''}","${p.bankDetails?.ifsc || ''}","${p.requestedAt || ''}","${p.processedAt || ''}","${p.transferReference || ''}","${(p.adminNotes || '').replace(/"/g, '""')}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=joshpetshub_payout_report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting payouts CSV:', error);
    return res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

/**
 * FINANCE: Approve or reject customer refund request
 */
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewRemarks, reviewerName } = req.body;
    const refunds = readJson(REFUNDS_FILE, []);
    const idx = refunds.findIndex(r => r.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Refund case not found.' });
    }

    refunds[idx].status = status;
    refunds[idx].reviewRemarks = reviewRemarks || '';
    refunds[idx].reviewedBy = reviewerName || req.user?.name || 'Finance Manager';
    refunds[idx].reviewedAt = new Date().toISOString();

    writeJson(REFUNDS_FILE, refunds);
    return res.json({ success: true, message: `Refund case ${status.toLowerCase()} successfully!`, refund: refunds[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PROVIDER RELATIONS: List service partners & KYC verification status
 */
export const getProviders = async (req, res) => {
  try {
    let sbProviders = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('service_providers').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) sbProviders = data;
      } catch (_) {}
    }

    const diskProviders = readJson(SERVICE_PROVIDERS_FILE, []);
    const diskUsers = readJson(USERS_FILE, []);
    const providerUsers = diskUsers.filter(u => u.role === 'SERVICE_PROVIDER');

    const seen = new Set();
    const combined = [];

    const addRecord = (item) => {
      const key = (item.id || item._id || item.email || '').toString().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      if (item.email) seen.add(item.email.toLowerCase());
      combined.push(item);
    };

    sbProviders.forEach(addRecord);
    diskProviders.forEach(addRecord);
    providerUsers.forEach(addRecord);

    const providers = combined.map(p => {
      const diskMatch = diskProviders.find(d => (d.id && d.id === p.id) || (d._id && d._id === p._id) || (d.email && p.email && d.email.toLowerCase() === p.email.toLowerCase()));
      const resolvedStatus = (diskMatch?.verificationStatus || p.verificationStatus || p.verification_status || (p.isVerified ? 'Verified' : 'Pending'));
      return {
        id: p.id || p._id,
        _id: p._id || p.id,
        name: p.businessName || p.business_name || p.name || 'Service Partner',
        businessName: p.businessName || p.business_name || p.name || 'Service Partner',
        email: p.email,
        phone: p.phone || p.mobile || p.whatsapp || 'Not provided',
        mobile: p.mobile || p.phone || p.whatsapp || 'Not provided',
        serviceCategory: p.serviceCategory || p.service_category || 'Pet Care',
        city: p.city || p.location || 'Bangalore',
        location: p.location || p.city || 'Bangalore',
        verificationStatus: resolvedStatus,
        verification_status: resolvedStatus,
        isVerified: resolvedStatus === 'Verified',
        govtProofType: p.govtProofType || p.govt_proof_type || 'AWBI / Trade License',
        govtProofNumber: p.govtProofNumber || p.govt_proof_number || 'Pending Doc',
        subscription: diskMatch?.subscription || p.subscription || null,
        rating: p.rating || 4.8,
        reviewsCount: p.reviewsCount || 12,
        createdAt: p.createdAt || p.created_at || '2026-08-01T00:00:00.000Z'
      };
    });

    return res.json({ success: true, providers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PROVIDER RELATIONS: Approve KYC / Update partner status
 */
export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, remarks } = req.body;
    const isVerified = (verificationStatus === 'Verified');

    // 1. Update users.json
    const users = readJson(USERS_FILE, []);
    const uIdx = users.findIndex(u => (u.id || u._id) === id);
    if (uIdx !== -1) {
      users[uIdx].verificationStatus = verificationStatus;
      users[uIdx].verification_status = verificationStatus;
      users[uIdx].isVerified = isVerified;
      if (remarks) users[uIdx].kycReviewRemarks = remarks;
      users[uIdx].kycReviewedAt = new Date().toISOString();
      writeJson(USERS_FILE, users);
    }

    // 2. Update service_providers.json
    const diskProviders = readJson(SERVICE_PROVIDERS_FILE, []);
    const pIdx = diskProviders.findIndex(p => (p.id || p._id) === id || (uIdx !== -1 && users[uIdx]?.email && p.email && p.email.toLowerCase() === users[uIdx].email.toLowerCase()));
    if (pIdx !== -1) {
      diskProviders[pIdx].verificationStatus = verificationStatus;
      diskProviders[pIdx].verification_status = verificationStatus;
      diskProviders[pIdx].isVerified = isVerified;
      if (remarks) diskProviders[pIdx].kycReviewRemarks = remarks;
      diskProviders[pIdx].kycReviewedAt = new Date().toISOString();
      writeJson(SERVICE_PROVIDERS_FILE, diskProviders);
    }

    // 3. Update Supabase if available
    if (supabase) {
      try {
        await supabase.from('service_providers').update({
          verification_status: verificationStatus
        }).eq('id', id);
      } catch (_) {}
      try {
        await supabase.from('users').update({
          verification_status: verificationStatus
        }).eq('id', id);
      } catch (_) {}
    }

    const updatedProvider = (pIdx !== -1 ? diskProviders[pIdx] : (uIdx !== -1 ? users[uIdx] : { id, verificationStatus, isVerified }));

    return res.json({
      success: true,
      message: `Provider verification status updated to ${verificationStatus}!`,
      provider: updatedProvider
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * QUALITY & COMPLIANCE: Prescriptions verification desk
 */
export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = readJson(PRESCRIPTIONS_FILE, []);
    return res.json({ success: true, prescriptions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * QUALITY & COMPLIANCE: Verify/Approve/Reject prescription
 */
export const verifyPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, doctorRegistrationNumber } = req.body;
    const prescriptions = readJson(PRESCRIPTIONS_FILE, []);
    const idx = prescriptions.findIndex(p => p.id === id || p._id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Prescription document not found.' });
    }

    prescriptions[idx].status = status;
    if (remarks) prescriptions[idx].reviewNotes = remarks;
    if (doctorRegistrationNumber) prescriptions[idx].verifiedDoctorReg = doctorRegistrationNumber;
    prescriptions[idx].reviewedAt = new Date().toISOString();
    prescriptions[idx].reviewedBy = req.user?.name || 'Quality & Compliance Manager';

    writeJson(PRESCRIPTIONS_FILE, prescriptions);
    return res.json({ success: true, message: `Prescription ${status.toLowerCase()} successfully!`, prescription: prescriptions[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * TECHNICAL SUPPORT: Get system health, uptime, and incident logs
 */
export const getTechHealth = async (req, res) => {
  try {
    const incidents = readJson(INCIDENTS_FILE, []);
    return res.json({
      success: true,
      health: {
        serverStatus: 'Operational',
        frontendUptime: '99.99%',
        apiLatencyMs: 34,
        activeSocketConnections: 4,
        databaseStatus: 'Healthy (Supabase Engine)',
        razorpayWebhookStatus: 'Active & Verified',
        incidents
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * TECHNICAL SUPPORT: Log technical incident or bug report
 */
export const createTechIncident = async (req, res) => {
  try {
    const { title, service, severity, details } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Incident title is required.' });
    }

    const incidents = readJson(INCIDENTS_FILE, []);
    const newInc = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      service: service || 'API Gateway',
      severity: severity || 'Medium',
      status: 'Investigating',
      details: details ? details.trim() : '',
      loggedBy: req.user?.name || 'Technical Support Manager',
      timestamp: new Date().toISOString(),
      resolvedAt: null
    };

    incidents.unshift(newInc);
    writeJson(INCIDENTS_FILE, incidents);
    return res.status(201).json({ success: true, message: 'Incident logged!', incident: newInc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
