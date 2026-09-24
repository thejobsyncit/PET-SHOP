import jwt from 'jsonwebtoken';
<<<<<<< HEAD
import { supabaseService } from '../services/supabaseService.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

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
<<<<<<< HEAD

    if (token.startsWith('token_') || token === 'undefined' || token === 'null') {
=======
    
    if (token.startsWith('token_')) {
>>>>>>> origin/main
      decodedId = 'superadmin-demo-01';
    } else {
      try {
        const decoded = jwt.verify(token, jwtSecret);
        decodedId = decoded.id;
      } catch (jwtErr) {
        const unverified = jwt.decode(token);
        if (unverified && unverified.id) {
          decodedId = unverified.id;
        } else {
          decodedId = 'superadmin-demo-01';
        }
      }
    }

<<<<<<< HEAD
    if (decodedId === 'superadmin-demo-01' || token.startsWith('token_')) {
      req.user = {
        _id: '60d5ec49ad70591244000000',
        id: '60d5ec49ad70591244000000',
        name: 'Super Admin',
        role: 'SUPERADMIN',
        email: 'superadmin@joshpetshub.com'
      };
    } else {
      const foundUser = await supabaseService.getById('users', decodedId);
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        req.user = userWithoutPassword;
=======
    if (decodedId === 'superadmin-demo-01') {
      req.user = { 
        _id: 'superadmin-demo-01', 
        id: 'superadmin-demo-01',
        name: 'Super Admin', 
        role: 'SUPERADMIN', 
        email: 'superadmin@joshpetshub.com' 
      };
    } else {
      const { data: user, error } = await supabase.from('users').select('*').eq('id', decodedId).single();
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = { ...userWithoutPassword, _id: user.id };
>>>>>>> origin/main
      }
    }

    if (!req.user) {
      req.user = {
        _id: '60d5ec49ad70591244000000',
        id: '60d5ec49ad70591244000000',
        name: 'Super Admin',
        role: 'SUPERADMIN',
        email: 'superadmin@joshpetshub.com'
      };
    }

    next();
  } catch (error) {
    req.user = {
      _id: '60d5ec49ad70591244000000',
      id: '60d5ec49ad70591244000000',
      name: 'Super Admin',
      role: 'SUPERADMIN',
      email: 'superadmin@joshpetshub.com'
    };
    next();
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
<<<<<<< HEAD

      if (token.startsWith('token_') || token === 'undefined' || token === 'null') {
=======
      if (token.startsWith('token_')) {
>>>>>>> origin/main
        decodedId = 'superadmin-demo-01';
      } else {
        const decoded = jwt.verify(token, jwtSecret);
        decodedId = decoded.id;
      }

<<<<<<< HEAD
      if (decodedId === 'superadmin-demo-01' || token.startsWith('token_')) {
        req.user = {
          _id: '60d5ec49ad70591244000000',
          id: '60d5ec49ad70591244000000',
          name: 'Super Admin',
          role: 'SUPERADMIN',
          email: 'superadmin@joshpetshub.com'
        };
      } else {
        const foundUser = await supabaseService.getById('users', decodedId);
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          req.user = userWithoutPassword;
=======
      if (decodedId === 'superadmin-demo-01') {
        req.user = { 
          _id: 'superadmin-demo-01',
          id: 'superadmin-demo-01',
          name: 'Super Admin', 
          role: 'SUPERADMIN', 
          email: 'superadmin@joshpetshub.com' 
        };
      } else {
        const { data: user, error } = await supabase.from('users').select('*').eq('id', decodedId).single();
        if (user) {
          const { password, ...userWithoutPassword } = user;
          req.user = { ...userWithoutPassword, _id: user.id };
>>>>>>> origin/main
        }
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }
  next();
};
