<<<<<<< HEAD
import Coupon from '../models/Coupon.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public
export const getCoupons = async (req, res) => {
  try {
    const { data: coupons, error } = await supabase.from('coupons').select('*');
    if (error) throw error;
    res.json({ success: true, coupons: coupons || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate, isActive } = req.body;
    const { data: coupon, error } = await supabase.from('coupons').insert([{
      code, discount, expiry_date: expiryDate, is_active: isActive
    }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

<<<<<<< HEAD
      const newCoupon = new Coupon({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        expiresAt: new Date(expiresAt)
      });
      await newCoupon.save();
      res.status(201).json({ success: true, coupon: newCoupon });
    } else {
      const coupons = readMockData('coupons');
      const couponExists = coupons.find(c => c.code === code.toUpperCase());
      if (couponExists) {
        return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
      }

      const newCoupon = {
        _id: 'cpn_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || 0),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        expiresAt: new Date(expiresAt).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      coupons.push(newCoupon);
      writeMockData('coupons', coupons);
      res.status(201).json({ success: true, coupon: newCoupon });
=======
// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', code).single();
    
    if (error || !coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }
    if (!coupon.is_active || new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon expired or inactive' });
>>>>>>> origin/main
    }
    
    res.json({ success: true, discount: coupon.discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
