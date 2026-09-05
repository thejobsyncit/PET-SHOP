import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected, readMockData } from '../utils/mockDb.js';
import { DEMO_ACCOUNTS } from '../controllers/authController.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, token missing' });
  }

  try {
    if (token.startsWith('token_')) {
      const mockUserId = req.headers['x-mock-user-id'];
      const demoMatch = DEMO_ACCOUNTS.find(d => 
        (mockUserId && (d.email === mockUserId || d.mobile === mockUserId || mockUserId.includes(d.email)))
      );
      req.user = {
        _id: mockUserId || 'mock_user_1',
        name: demoMatch ? demoMatch.name : 'Simulated Demo User',
        businessName: demoMatch ? (demoMatch.businessName || demoMatch.name) : 'Demo Business',
        email: demoMatch ? demoMatch.email : 'demo@pawora.com',
        role: demoMatch ? demoMatch.role : 'SERVICE_PROVIDER',
        serviceCategory: demoMatch ? demoMatch.serviceCategory : ''
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pawora_super_secret_jwt_key_123');

    if (isDbConnected()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      const usersList = readMockData('users');
      const foundUser = usersList.find(u => u._id && u._id.toString() === decoded.id);
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        req.user = userWithoutPassword;
      }
    }

    if (!req.user) {
      // Check demo accounts as fallback
      const mockUserId = req.headers['x-mock-user-id'];
      const demoMatch = DEMO_ACCOUNTS.find(d => 
        (mockUserId && (d.email === mockUserId || d.mobile === mockUserId))
      );
      if (demoMatch) {
        req.user = {
          _id: decoded.id || mockUserId,
          name: demoMatch.name,
          businessName: demoMatch.businessName || demoMatch.name,
          email: demoMatch.email,
          role: demoMatch.role,
          serviceCategory: demoMatch.serviceCategory
        };
      } else {
        return res.status(404).json({ success: false, message: 'No user found with this id' });
      }
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
  }
  
  if (token) {
    try {
      if (token.startsWith('token_')) {
        const mockUserId = req.headers['x-mock-user-id'];
        if (mockUserId) {
          req.user = {
            _id: mockUserId,
            name: 'Simulated Demo User',
            email: 'demo@pawora.com',
            role: 'CUSTOMER'
          };
        }
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pawora_super_secret_jwt_key_123');
      if (isDbConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const usersList = readMockData('users');
        const foundUser = usersList.find(u => u._id.toString() === decoded.id);
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
