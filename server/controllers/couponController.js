import { supabase } from '../config/supabase.js';

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
    }
    
    res.json({ success: true, discount: coupon.discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
