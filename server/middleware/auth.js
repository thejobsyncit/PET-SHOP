import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected, readMockData } from '../utils/mockDb.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.pawora_token) {
    token = req.cookies.pawora_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, token missing' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'pawora_prod_secure_jwt_secret_99f38e789a24c7f0b12da459e81b67f132e';
    const decoded = jwt.verify(token, jwtSecret);

    if (isDbConnected()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      const usersList = readMockData('users');
      const foundUser = usersList.find(u => u._id && u._id.toString() === decoded.id.toString());
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        req.user = userWithoutPassword;
      }
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User session expired or user no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, token invalid' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.pawora_token) {
    token = req.cookies.pawora_token;
  }
  
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'pawora_prod_secure_jwt_secret_99f38e789a24c7f0b12da459e81b67f132e';
      const decoded = jwt.verify(token, jwtSecret);
      if (isDbConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const usersList = readMockData('users');
        const foundUser = usersList.find(u => u._id && u._id.toString() === decoded.id.toString());
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          req.user = userWithoutPassword;
        }
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }
  next();
};
