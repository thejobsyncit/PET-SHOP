import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

const loadUserFromDb = async (userId, userEmail) => {
  // 1. Check Supabase users table if available
  if (supabase) {
    try {
      if (userId) {
        const { data: uById, error: errById } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
        if (uById && !errById) return uById;
      }
      if (userEmail) {
        const { data: uByEmail, error: errByEmail } = await supabase.from('users').select('*').ilike('email', userEmail).maybeSingle();
        if (uByEmail && !errByEmail) return uByEmail;
      }
    } catch (_) {}
  }

  // 2. Check persistent users.json
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      const users = JSON.parse(raw);
      if (Array.isArray(users)) {
        const found = users.find(u => 
          (userId && (u._id === userId || u.id === userId)) ||
          (userEmail && u.email && u.email.toLowerCase() === userEmail.toLowerCase())
        );
        if (found) return found;
      }
    }
  } catch (_) {}

  return null;
};

/**
 * Protect middleware: Verifies JWT token and validates user against database.
 * Rejects missing, invalid, expired, or tampered tokens.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.joshpetshub_token) {
    token = req.cookies.joshpetshub_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Authentication token missing. Please log in.'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'joshpetshub_prod_secure_jwt_secret_99f38e789a24c7f0b12da459e81b67f132e';
    
    // Strict verification: will throw error if expired, invalid signature, or tampered
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.id || decoded._id;
    const userEmail = decoded.email;

    const user = await loadUserFromDb(userId, userEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User session invalid or account no longer exists in database.'
      });
    }

    // Check if account status is suspended or rejected
    if (user.verificationStatus === 'Suspended' || user.verification_status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account suspended: Your account is currently suspended. Please contact support.'
      });
    }

    const { password, password_plain, ...userWithoutPassword } = user;
    req.user = {
      ...userWithoutPassword,
      _id: user._id || user.id,
      id: user.id || user._id,
      role: user.role || 'CUSTOMER',
      serviceCategory: user.serviceCategory || user.service_category || ''
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or tampered authentication token.'
    });
  }
};

/**
 * Role-based access control middleware.
 */
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Superadmins and Admins have universal operational oversight
  if (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN') {
    return next();
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied: This portal/resource requires ${allowedRoles.join(' or ')} role.`
    });
  }

  next();
};

export const admin = requireRole('ADMIN', 'SUPERADMIN');
export const customerOnly = requireRole('CUSTOMER');
export const providerOnly = requireRole('SERVICE_PROVIDER');

/**
 * Service-Specific Dashboard & Resource Authorization Middleware.
 * Verifies that the authenticated provider is authorized for the given service category.
 */
export const requireProviderService = (...allowedCategories) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.role !== 'SERVICE_PROVIDER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Resource restricted to authorized Service Providers.'
    });
  }

  const userCategory = (req.user.serviceCategory || '').toLowerCase();
  const isAuthorized = allowedCategories.some(cat => userCategory.includes(cat.toLowerCase()));

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: `Access denied: You are registered for "${req.user.serviceCategory}". You are not authorized to access "${allowedCategories.join(', ')}" services.`
    });
  }

  next();
};

/**
 * Optional authentication: Attaches user if valid token present, does not reject if missing.
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.joshpetshub_token) {
    token = req.cookies.joshpetshub_token;
  }

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'joshpetshub_prod_secure_jwt_secret_99f38e789a24c7f0b12da459e81b67f132e';
      const decoded = jwt.verify(token, jwtSecret);
      const user = await loadUserFromDb(decoded.id, decoded.email);
      if (user) {
        const { password, password_plain, ...userWithoutPassword } = user;
        req.user = {
          ...userWithoutPassword,
          _id: user._id || user.id,
          id: user.id || user._id,
          role: user.role || 'CUSTOMER',
          serviceCategory: user.serviceCategory || user.service_category || ''
        };
      }
    } catch (_) {
      // Ignore invalid token in optional auth
    }
  }
  next();
};
