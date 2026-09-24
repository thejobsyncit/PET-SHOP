// crmAuth.js - CRM Authentication and Session Management
import { INITIAL_STAFF, CRM_ROLES } from './crmData.js';

const CRM_SESSION_STORAGE_KEY = 'pawora_crm_auth_session_v1';

// Default demo password for CRM staff testing
export const CRM_DEFAULT_PASSWORD = 'admin123';

/**
 * Retrieve current authenticated CRM session from localStorage/sessionStorage
 */
export const getCrmSession = () => {
  try {
    const raw = localStorage.getItem(CRM_SESSION_STORAGE_KEY) || sessionStorage.getItem(CRM_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.staffId && session.roleId) {
      return session;
    }
    return null;
  } catch (err) {
    console.error('Error reading CRM session:', err);
    return null;
  }
};

/**
 * Save authenticated CRM session
 */
export const saveCrmSession = (staff, rememberMe = true) => {
  try {
    const sessionData = {
      staffId: staff.id,
      name: staff.name,
      email: staff.email,
      roleId: staff.roleId,
      department: staff.department,
      title: staff.title,
      avatar: staff.avatar,
      loginTimestamp: new Date().toISOString()
    };
    const serialized = JSON.stringify(sessionData);
    if (rememberMe) {
      localStorage.setItem(CRM_SESSION_STORAGE_KEY, serialized);
    } else {
      sessionStorage.setItem(CRM_SESSION_STORAGE_KEY, serialized);
    }
    return sessionData;
  } catch (err) {
    console.error('Error saving CRM session:', err);
    return null;
  }
};

/**
 * Clear authenticated CRM session (Logout)
 */
export const clearCrmSession = () => {
  try {
    localStorage.removeItem(CRM_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(CRM_SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing CRM session:', err);
  }
};

/**
 * Authenticate staff member by email/staffId and password
 */
export const authenticateStaff = (identifier, password) => {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanId || !cleanPass) {
    return { success: false, message: 'Please provide both staff email/ID and security password.' };
  }

  // Find staff in directory
  const staff = INITIAL_STAFF.find(
    s => s.email.toLowerCase() === cleanId || 
         s.id.toLowerCase() === cleanId ||
         s.name.toLowerCase() === cleanId
  );

  if (!staff) {
    return { success: false, message: 'Staff identity not found in enterprise directory.' };
  }

  // Check password (accept demo password 'admin123' or custom pass)
  if (cleanPass !== CRM_DEFAULT_PASSWORD && cleanPass !== 'pawora2026' && cleanPass.length < 4) {
    return { success: false, message: 'Invalid password. (Hint: Demo password is admin123)' };
  }

  const role = CRM_ROLES[staff.roleId] || CRM_ROLES.SUPER_ADMIN;

  return {
    success: true,
    staff: {
      ...staff,
      role
    }
  };
};

/**
 * Quick authenticate by role for rapid testing/demoing
 */
export const getStaffByRoleId = (roleId) => {
  const staff = INITIAL_STAFF.find(s => s.roleId === roleId) || INITIAL_STAFF[0];
  const role = CRM_ROLES[roleId] || CRM_ROLES.SUPER_ADMIN;
  return {
    ...staff,
    role
  };
};
