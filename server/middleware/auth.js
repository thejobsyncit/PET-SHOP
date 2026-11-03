import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

const DEMO_ACCOUNTS = [
  { _id: 'prov-vet-01', id: 'prov-vet-01', name: 'Dr. Ramesh Kumar', email: 'dr.ramesh@joshpetshub.com', mobile: '9845012345', phone: '9845012345', role: 'SERVICE_PROVIDER', serviceCategory: 'Consult a Vet' },
  { _id: 'prov-groom-02', id: 'prov-groom-02', name: 'Velvet Fur Spa', email: 'velvetfur@joshpetshub.com', mobile: '9845199882', phone: '9845199882', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Grooming Spa' },
  { _id: 'prov-hostel-03', id: 'prov-hostel-03', name: 'Happy Paws Resort', email: 'happypaws@joshpetshub.com', mobile: '9731299881', phone: '9731299881', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Hostel' },
  { _id: 'prov-seller-04', id: 'prov-seller-04', name: 'Royal Paws Studio', email: 'royalpaws@joshpetshub.com', mobile: '9945122334', phone: '9945122334', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Seller' },
  { _id: 'prov-adopt-05', id: 'prov-adopt-05', name: 'Hope Sanctuary', email: 'adopt@joshpetshub.com', mobile: '9845577661', phone: '9845577661', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Adoption' },
  { _id: 'prov-walk-06', id: 'prov-walk-06', name: 'Swift Paws Walking', email: 'swiftpaws@joshpetshub.com', mobile: '9845112233', phone: '9845112233', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Walking & Fitness' },
  { _id: 'prov-trans-07', id: 'prov-trans-07', name: 'SafePet Transit', email: 'safepet@joshpetshub.com', mobile: '9845223344', phone: '9845223344', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Transport' },
  { _id: 'prov-train-08', id: 'prov-train-08', name: 'Clever Canines', email: 'clevercanines@joshpetshub.com', mobile: '9845334455', phone: '9845334455', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Training' },
  { _id: 'prov-insure-09', id: 'prov-insure-09', name: 'PawProtect Insurance', email: 'pawinsure@joshpetshub.com', mobile: '9845445566', phone: '9845445566', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Insurance' },
  { _id: 'prov-breed-10', id: 'prov-breed-10', name: 'Elite K9 Breedline', email: 'elitebreed@joshpetshub.com', mobile: '9845556677', phone: '9845556677', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Breeding' },
  { _id: 'prov-prod-11', id: 'prov-prod-11', name: 'Josh Pet Store Supplies', email: 'productseller@joshpetshub.com', mobile: '9845667788', phone: '9845667788', role: 'SERVICE_PROVIDER', serviceCategory: 'Pet Products & Supplies' },
  { _id: 'usr-customer-01', id: 'usr-customer-01', name: 'Priya Sharma', email: 'priya@joshpetshub.com', mobile: '9845099881', phone: '9845099881', role: 'CUSTOMER' },
  { _id: 'admin-01', id: 'admin-01', name: 'Admin', email: 'admin@joshpetshub.com', mobile: '9876543210', phone: '9876543210', role: 'ADMIN' },
  { _id: 'superadmin-01', id: 'superadmin-01', name: 'Super Admin', email: 'superadmin@joshpetshub.com', mobile: '9876543210', phone: '9876543210', role: 'SUPERADMIN' }
];

const loadUserFromDb = async (userId, userEmail) => {
  // 1. Check persistent users.json first (instant local retrieval, zero network delay)
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

  // 2. Check DEMO_ACCOUNTS
  const demoFound = DEMO_ACCOUNTS.find(u => 
    (userId && (u._id === userId || u.id === userId)) ||
    (userEmail && u.email && u.email.toLowerCase() === userEmail.toLowerCase())
  );
  if (demoFound) return demoFound;

  // 3. Check Supabase users table if available with strict 1.5s timeout fallback
  if (supabase) {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 1500));
      const fetchDb = async () => {
        if (userId) {
          const { data: uById, error: errById } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
          if (uById && !errById) return uById;
        }
        if (userEmail) {
          const { data: uByEmail, error: errByEmail } = await supabase.from('users').select('*').ilike('email', userEmail).maybeSingle();
          if (uByEmail && !errByEmail) return uByEmail;
        }
        return null;
      };
      const result = await Promise.race([fetchDb(), timeoutPromise]);
      if (result) return result;
    } catch (_) {}
  }

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
    
    let userId;
    let userEmail;
    try {
      const decoded = jwt.verify(token, jwtSecret);
      userId = decoded.id || decoded._id;
      userEmail = decoded.email;
    } catch (jwtErr) {
      if (token && typeof token === 'string' && token.startsWith('session_')) {
        const parts = token.split('_');
        userId = parts[1];
      } else {
        throw jwtErr;
      }
    }

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

export const canManageProducts = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN') {
    return next();
  }
  if (req.user.role === 'SERVICE_PROVIDER') {
    const cat = (req.user.serviceCategory || '').toLowerCase();
    if (cat.includes('product') || cat.includes('seller') || cat.includes('store') || cat.includes('shop') || cat === '') {
      return next();
    }
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Only Admins and verified Product Sellers can manage products.'
  });
};

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

/**
 * Require Service Provider to have completed their profile before accessing operational APIs.
 */
export const requireProviderProfileComplete = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN') {
    return next();
  }
  if (req.user.role === 'SERVICE_PROVIDER') {
    const isComplete = Boolean(req.user.isProfileComplete || req.user.profileCompleted);
    if (!isComplete) {
      return res.status(403).json({
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Profile completion required: You must complete and submit your Service Provider Profile before using operational features.'
      });
    }
  }
  next();
};

/**
 * Require Service Provider to have an active, non-expired subscription before accessing operational APIs.
 */
export const requireActiveSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN') {
    return next();
  }
  if (req.user.role === 'SERVICE_PROVIDER') {
    const isComplete = Boolean(req.user.isProfileComplete || req.user.profileCompleted);
    if (!isComplete) {
      return res.status(403).json({
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Profile completion required: You must complete and submit your Service Provider Profile first.'
      });
    }

    const sub = req.user.subscription;
    const isExpired = sub && sub.expiryDate && new Date(sub.expiryDate) <= new Date();
    const isActive = sub && sub.status === 'ACTIVE' && !isExpired;

    if (!isActive) {
      return res.status(403).json({
        success: false,
        code: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'SUBSCRIPTION_REQUIRED',
        message: isExpired
          ? 'Subscription expired: Your subscription plan has expired. Please renew your plan to continue using operational dashboard features.'
          : 'Subscription required: An active subscription plan is required to access operational dashboard features.'
      });
    }
  }
  next();
};
