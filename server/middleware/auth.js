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
    
    let decodedId;
    
    if (token.startsWith('token_') && !isDbConnected()) {
      // Fallback for client-generated demo tokens when backend was unreachable
      // Assume SuperAdmin for demo purposes to avoid UI breakage
      decodedId = 'superadmin-demo-01';
    } else {
      const decoded = jwt.verify(token, jwtSecret);
      decodedId = decoded.id;
    }

    if (isDbConnected()) {
      req.user = await User.findById(decodedId).select('-password');
    } else {
      const usersList = readMockData('users');
      const foundUser = usersList.find(u => u._id && u._id.toString() === decodedId.toString());
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        req.user = userWithoutPassword;
      } else if (decodedId === 'superadmin-demo-01') {
        // Provide mock user if it wasn't written to users.json (happens on client offline login)
        req.user = { 
          _id: 'superadmin-demo-01', 
          name: 'Super Admin', 
          role: 'SUPERADMIN', 
          email: 'superadmin@joshpetshub.com' 
        };
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
      
      let decodedId;
      if (token.startsWith('token_') && !isDbConnected()) {
        decodedId = 'superadmin-demo-01';
      } else {
        const decoded = jwt.verify(token, jwtSecret);
        decodedId = decoded.id;
      }

      if (isDbConnected()) {
        req.user = await User.findById(decodedId).select('-password');
      } else {
        const usersList = readMockData('users');
        const foundUser = usersList.find(u => u._id && u._id.toString() === decodedId.toString());
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          req.user = userWithoutPassword;
        } else if (decodedId === 'superadmin-demo-01') {
          req.user = { 
            _id: 'superadmin-demo-01', 
            name: 'Super Admin', 
            role: 'SUPERADMIN', 
            email: 'superadmin@joshpetshub.com' 
          };
        }
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }
  next();
};
