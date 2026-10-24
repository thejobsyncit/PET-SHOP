import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError || error.issues) {
      const issues = error.issues || error.errors || [];
      const errorMessages = issues.map(err => `${(err.path || []).join('.')}: ${err.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${errorMessages}`,
        errors: issues
      });
    }
    next(error);
  }
};

import { validateEmailFormat } from '../utils/emailValidator.js';

// Schema for registration
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().refine(val => validateEmailFormat(val).isValid, {
    message: 'Invalid email format or unsupported domain extension (e.g. .con is invalid)'
  }).max(100),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  mobile: z.string().trim().optional(),
  location: z.string().max(200).optional(),
  role: z.string().optional(),
  serviceCategory: z.string().optional(),
  businessName: z.string().max(150).optional(),
  bio: z.string().max(1000).optional()
}).passthrough();

// Schema for login
export const loginSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  mobile: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  isOtpVerified: z.boolean().optional(),
  role: z.string().optional()
}).passthrough().refine(data => Boolean(data.email || data.identifier || data.mobile), {
  message: 'Email, mobile, or identifier is required',
  path: ['email']
}).refine(data => {
  const candidate = (data.email || data.identifier || '').trim();
  if (candidate.includes('@')) {
    const res = validateEmailFormat(candidate);
    return res.isValid;
  }
  return true;
}, {
  message: 'Invalid email address format or domain extension (e.g. .con is rejected)',
  path: ['email']
});

