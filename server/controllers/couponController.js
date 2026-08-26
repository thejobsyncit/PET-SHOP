import Coupon from '../models/Coupon.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
import mongoose from 'mongoose';

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  try {
    let coupon;
    if (isDbConnected()) {
      coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    } else {
      const coupons = readMockData('coupons');
      coupon = coupons.find(c => c.code === code.toUpperCase() && c.isActive);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(coupon.expiresAt);
    if (expiry < now) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired' });
    }

    // Check min order value
    if (cartTotal && cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value to apply this coupon is ₹${coupon.minOrderValue}` 
      });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    if (isDbConnected()) {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
      res.json({ success: true, coupons });
    } else {
      const coupons = readMockData('coupons');
      res.json({ success: true, coupons: coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minOrderValue, maxDiscount, expiresAt } = req.body;

  try {
    if (isDbConnected()) {
      const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
      if (couponExists) {
        return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
      }

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
        _id: new mongoose.Types.ObjectId().toString(),
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
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
