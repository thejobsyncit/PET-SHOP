import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COUPONS_FILE = path.join(__dirname, '..', 'data', 'coupons.json');

// Default initial coupons if storage is missing or empty
const DEFAULT_COUPONS = [
  {
    _id: 'coupon_pawfirst_default',
    id: 'coupon_pawfirst_default',
    code: 'PAWFIRST',
    description: '15% off on your 1st order',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 0,
    maxDiscount: 2000,
    expiresAt: '2027-12-31T23:59:59.999Z',
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: '60d5ec49ad70591248000001',
    id: '60d5ec49ad70591248000001',
    code: 'JOSHPETSHUB10',
    description: '10% off on all pet products',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 500,
    expiresAt: '2027-12-31T23:59:59.999Z',
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: '60d5ec49ad70591248000002',
    id: '60d5ec49ad70591248000002',
    code: 'WELCOME300',
    description: 'Flat ₹300 off on orders above ₹2499',
    discountType: 'flat',
    discountValue: 300,
    minOrderValue: 2499,
    maxDiscount: null,
    expiresAt: '2027-12-31T23:59:59.999Z',
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  }
];

export const loadDiskCoupons = () => {
  try {
    if (fs.existsSync(COUPONS_FILE)) {
      const raw = fs.readFileSync(COUPONS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure PAWFIRST is present
        if (!parsed.some(c => (c.code || '').toUpperCase() === 'PAWFIRST')) {
          parsed.unshift(DEFAULT_COUPONS[0]);
          saveDiskCoupons(parsed);
        }
        return parsed.map(normalizeCoupon);
      }
    }
  } catch (err) {
    console.warn('[Coupons] Error reading coupons.json:', err?.message);
  }
  saveDiskCoupons(DEFAULT_COUPONS);
  return DEFAULT_COUPONS;
};

export const saveDiskCoupons = (coupons) => {
  try {
    const dir = path.dirname(COUPONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Coupons] Error saving coupons.json:', err?.message);
  }
};

export const normalizeCoupon = (c) => {
  if (!c) return null;
  const code = (c.code || '').trim().toUpperCase();
  const dType = c.discountType || c.discount_type || 'percentage';
  const dVal = Number(c.discountValue ?? c.discount_value ?? c.discount ?? 0);
  const minVal = Number(c.minOrderValue ?? c.min_order_value ?? 0);
  const maxDisc = c.maxDiscount !== undefined && c.maxDiscount !== null && c.maxDiscount !== ''
    ? Number(c.maxDiscount)
    : null;

  return {
    _id: c._id || c.id || `cp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    id: c.id || c._id || `cp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    code,
    description: c.description || (dType === 'percentage' ? `${dVal}% off on your order` : `Flat ₹${dVal} off on your order`),
    discountType: dType === 'flat' ? 'flat' : 'percentage',
    discountValue: dVal,
    minOrderValue: minVal,
    maxDiscount: maxDisc,
    expiresAt: c.expiresAt || c.expiry_date || c.expires_at || null,
    isActive: c.isActive !== undefined ? Boolean(c.isActive) : (c.is_active !== undefined ? Boolean(c.is_active) : true),
    usageCount: Number(c.usageCount || c.usage_count || 0),
    createdAt: c.createdAt || c.created_at || new Date().toISOString()
  };
};

/**
 * @desc    Get all coupons (Admin and Public listing)
 * @route   GET /api/coupons
 * @access  Public / Admin
 */
export const getCoupons = async (req, res) => {
  try {
    const coupons = loadDiskCoupons();

    // Background sync from Supabase if available
    if (supabase) {
      supabase.from('coupons').select('*')
        .then(({ data, error }) => {
          if (!error && Array.isArray(data) && data.length > 0) {
            const diskMap = new Map();
            coupons.forEach(c => diskMap.set(c.code, c));
            data.forEach(sc => {
              const norm = normalizeCoupon(sc);
              if (norm && !diskMap.has(norm.code)) {
                diskMap.set(norm.code, norm);
              }
            });
            const merged = Array.from(diskMap.values());
            if (merged.length !== coupons.length) {
              saveDiskCoupons(merged);
            }
          }
        })
        .catch(() => {});
    }

    res.json({ success: true, coupons });
  } catch (error) {
    console.error('getCoupons error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType = 'percentage',
      discountValue,
      discount,
      minOrderValue = 0,
      maxDiscount = null,
      expiresAt = null,
      expiryDate = null,
      isActive = true
    } = req.body;

    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return res.status(400).json({ success: false, message: 'Offer code is required.' });
    }

    const val = Number(discountValue !== undefined ? discountValue : discount);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid discount value greater than 0.' });
    }

    if (discountType === 'percentage' && val > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100%.' });
    }

    const coupons = loadDiskCoupons();
    if (coupons.some(c => c.code === cleanCode)) {
      return res.status(400).json({ success: false, message: `Offer code "${cleanCode}" already exists. Please choose a different code.` });
    }

    const newCoupon = normalizeCoupon({
      code: cleanCode,
      description: description?.trim() || '',
      discountType,
      discountValue: val,
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount !== null && maxDiscount !== undefined && maxDiscount !== '' ? Number(maxDiscount) : null,
      expiresAt: expiresAt || expiryDate || null,
      isActive: Boolean(isActive),
      usageCount: 0,
      createdAt: new Date().toISOString()
    });

    coupons.unshift(newCoupon);
    saveDiskCoupons(coupons);

    // Sync to Supabase in background
    if (supabase) {
      supabase.from('coupons').insert([{
        code: newCoupon.code,
        discount: newCoupon.discountValue,
        discount_type: newCoupon.discountType,
        min_order_value: newCoupon.minOrderValue,
        max_discount: newCoupon.maxDiscount,
        expiry_date: newCoupon.expiresAt,
        is_active: newCoupon.isActive
      }]).catch(err => console.warn('[Coupons] Supabase insert notice:', err.message));
    }

    res.status(201).json({
      success: true,
      message: `Offer code "${newCoupon.code}" created successfully!`,
      coupon: newCoupon
    });
  } catch (error) {
    console.error('createCoupon error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * @desc    Update an existing coupon
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupons = loadDiskCoupons();

    const idx = coupons.findIndex(c => String(c._id) === String(id) || String(c.id) === String(id) || c.code === id.toUpperCase());
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Offer code not found.' });
    }

    const current = coupons[idx];
    const {
      code,
      description,
      discountType,
      discountValue,
      discount,
      minOrderValue,
      maxDiscount,
      expiresAt,
      expiryDate,
      isActive
    } = req.body;

    const newCode = code ? code.trim().toUpperCase() : current.code;
    if (newCode !== current.code && coupons.some((c, i) => i !== idx && c.code === newCode)) {
      return res.status(400).json({ success: false, message: `Offer code "${newCode}" already in use.` });
    }

    const val = discountValue !== undefined ? Number(discountValue) : (discount !== undefined ? Number(discount) : current.discountValue);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid discount value greater than 0.' });
    }

    const updatedCoupon = normalizeCoupon({
      ...current,
      code: newCode,
      description: description !== undefined ? description.trim() : current.description,
      discountType: discountType || current.discountType,
      discountValue: val,
      minOrderValue: minOrderValue !== undefined ? Number(minOrderValue) : current.minOrderValue,
      maxDiscount: maxDiscount !== undefined ? (maxDiscount === null || maxDiscount === '' ? null : Number(maxDiscount)) : current.maxDiscount,
      expiresAt: expiresAt !== undefined ? (expiresAt || null) : (expiryDate !== undefined ? (expiryDate || null) : current.expiresAt),
      isActive: isActive !== undefined ? Boolean(isActive) : current.isActive,
      updatedAt: new Date().toISOString()
    });

    coupons[idx] = updatedCoupon;
    saveDiskCoupons(coupons);

    // Sync to Supabase in background
    if (supabase) {
      supabase.from('coupons').update({
        code: updatedCoupon.code,
        discount: updatedCoupon.discountValue,
        discount_type: updatedCoupon.discountType,
        min_order_value: updatedCoupon.minOrderValue,
        max_discount: updatedCoupon.maxDiscount,
        expiry_date: updatedCoupon.expiresAt,
        is_active: updatedCoupon.isActive
      }).eq('code', current.code).catch(() => {});
    }

    res.json({
      success: true,
      message: `Offer code "${updatedCoupon.code}" updated successfully!`,
      coupon: updatedCoupon
    });
  } catch (error) {
    console.error('updateCoupon error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupons = loadDiskCoupons();

    const idx = coupons.findIndex(c => String(c._id) === String(id) || String(c.id) === String(id) || c.code === id.toUpperCase());
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Offer code not found.' });
    }

    const [deleted] = coupons.splice(idx, 1);
    saveDiskCoupons(coupons);

    // Sync to Supabase in background
    if (supabase) {
      supabase.from('coupons').delete().eq('code', deleted.code).catch(() => {});
    }

    res.json({
      success: true,
      message: `Offer code "${deleted.code}" deleted successfully!`
    });
  } catch (error) {
    console.error('deleteCoupon error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * @desc    Validate an offer code against cart total
 * @route   POST /api/coupons/validate
 * @access  Public (Guest & Logged-in checkout supported)
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter an offer code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupons = loadDiskCoupons();
    const coupon = coupons.find(c => c.code === cleanCode);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Invalid offer code "${cleanCode}". Please check for typos and try again.`
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: `Offer code "${coupon.code}" is currently paused or inactive.`
      });
    }

    if (coupon.expiresAt) {
      const expiry = new Date(coupon.expiresAt);
      if (expiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: `Offer code "${coupon.code}" expired on ${expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`
        });
      }
    }

    const subtotal = Number(cartTotal) || 0;
    if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${coupon.minOrderValue} required for offer code "${coupon.code}". (Current cart: ₹${subtotal})`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    // Increment usage count in background
    coupon.usageCount = (coupon.usageCount || 0) + 1;
    saveDiskCoupons(coupons);

    res.json({
      success: true,
      message: `🎉 Offer code "${coupon.code}" applied successfully! You save ₹${discount}.`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderValue: coupon.minOrderValue,
        calculatedDiscount: discount
      }
    });
  } catch (error) {
    console.error('validateCoupon error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
