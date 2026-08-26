import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected, readMockData } from '../utils/mockDb.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, token missing' });
  }

  try {
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

    if (!req.user) {
      return res.status(404).json({ success: false, message: 'No user found with this id' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, token invalid' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};
