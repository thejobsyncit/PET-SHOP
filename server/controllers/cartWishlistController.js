import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const USER_STATE_FILE = path.join(__dirname, '..', '..', 'server_data', 'user_state.json');

// Helpers for reading and writing user_state.json fallback (outside server directory to avoid nodemon restarts)
const loadDiskUsers = () => {
  try {
    if (fs.existsSync(USER_STATE_FILE)) {
      const content = fs.readFileSync(USER_STATE_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[CartWishlist] Error reading user_state.json:', err?.message);
  }

  // Fallback to seed users.json
  try {
    if (fs.existsSync(SEED_USERS_FILE)) {
      const content = fs.readFileSync(SEED_USERS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[CartWishlist] Error reading seed users.json:', err?.message);
  }

  return [];
};

const saveDiskUsers = (users) => {
  try {
    const dir = path.dirname(USER_STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USER_STATE_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('[CartWishlist] Error saving user_state.json:', err?.message);
  }
};

// In-memory registries for fast session continuity across requests
const inMemoryWishlists = new Map();
const inMemoryCarts = new Map();

// Retrieve user record from Supabase or disk users.json
const getUserData = async (userId) => {
  const cleanId = String(userId);

  if (supabase) {
    try {
      const { data: user, error } = await supabase.from('users').select('*').eq('id', cleanId).single();
      if (!error && user) {
        return { user, source: 'supabase' };
      }
    } catch (e) {}
  }

  const diskUsers = loadDiskUsers();
  const diskUser = diskUsers.find(u => String(u._id) === cleanId || String(u.id) === cleanId);
  if (diskUser) {
    if (inMemoryWishlists.has(cleanId) && (!diskUser.wishlist || diskUser.wishlist.length === 0)) {
      diskUser.wishlist = inMemoryWishlists.get(cleanId);
    }
    if (inMemoryCarts.has(cleanId) && (!diskUser.cart || diskUser.cart.length === 0)) {
      diskUser.cart = inMemoryCarts.get(cleanId);
    }
    return { user: diskUser, source: 'disk' };
  }

  const memWishlist = inMemoryWishlists.get(cleanId) || [];
  const memCart = inMemoryCarts.get(cleanId) || [];
  return {
    user: {
      _id: cleanId,
      id: cleanId,
      cart: memCart,
      wishlist: memWishlist
    },
    source: 'memory'
  };
};

// Save user cart state
const saveUserCart = async (userId, cart, userData) => {
  const cleanId = String(userId);
  inMemoryCarts.set(cleanId, cart);

  if (userData?.source === 'supabase' && supabase) {
    try {
      await supabase.from('users').update({ cart }).eq('id', cleanId);
    } catch (e) {}
  }

  const diskUsers = loadDiskUsers();
  const idx = diskUsers.findIndex(u => String(u._id) === cleanId || String(u.id) === cleanId);
  if (idx > -1) {
    diskUsers[idx].cart = cart;
  } else {
    diskUsers.push({
      _id: cleanId,
      id: cleanId,
      email: userData?.user?.email || `user_${cleanId.slice(0, 8)}@joshpetshub.com`,
      role: userData?.user?.role || 'CUSTOMER',
      cart: cart,
      wishlist: inMemoryWishlists.get(cleanId) || userData?.user?.wishlist || []
    });
  }
  saveDiskUsers(diskUsers);
};

// Save user wishlist state
const saveUserWishlist = async (userId, wishlist, userData) => {
  const cleanId = String(userId);
  inMemoryWishlists.set(cleanId, wishlist);

  if (userData?.source === 'supabase' && supabase) {
    try {
      await supabase.from('users').update({ wishlist }).eq('id', cleanId);
    } catch (e) {}
  }

  const diskUsers = loadDiskUsers();
  const idx = diskUsers.findIndex(u => String(u._id) === cleanId || String(u.id) === cleanId);
  if (idx > -1) {
    diskUsers[idx].wishlist = wishlist;
  } else {
    diskUsers.push({
      _id: cleanId,
      id: cleanId,
      email: userData?.user?.email || `user_${cleanId.slice(0, 8)}@joshpetshub.com`,
      role: userData?.user?.role || 'CUSTOMER',
      cart: inMemoryCarts.get(cleanId) || userData?.user?.cart || [],
      wishlist: wishlist
    });
  }
  saveDiskUsers(diskUsers);
};

const normalizeProduct = (p) => {
  if (!p) return null;
  const price = Number(p.price) || 0;
  const discountPrice = p.discount_price !== null && p.discount_price !== undefined 
    ? Number(p.discount_price) 
    : (p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null);
  const discountPercentage = p.discount_percentage !== undefined 
    ? Number(p.discount_percentage) 
    : (discountPrice && price > discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0);

  return {
    ...p,
    _id: p.id || p._id,
    id: p.id || p._id,
    price,
    discountPrice,
    discountPercentage,
    isBestSeller: p.is_bestseller ?? p.isBestSeller ?? false,
    isFeatured: p.is_featured ?? p.isFeatured ?? false,
    requiresPrescription: p.requires_prescription ?? p.requiresPrescription ?? false,
    petType: p.pet_type ?? p.petType,
  };
};

// Populate product details for given product IDs
const populateProducts = async (rawProductIds) => {
  const productIds = (rawProductIds || []).filter(Boolean);
  if (productIds.length === 0) return [];

  if (supabase) {
    try {
      const { data: products } = await supabase.from('products').select('*').in('id', productIds);
      if (products && products.length > 0) {
        return products.map(normalizeProduct);
      }
    } catch (e) {}
  }
  return [];
};

// ==========================================
// CART CONTROLLERS
// ==========================================

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    const userData = await getUserData(userId);
    const cart = userData?.user?.cart || [];
    if (cart.length === 0) {
      return res.json({ success: true, cart: [] });
    }

    const productIds = cart.map(item => typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product);
    const products = await populateProducts(productIds);

    const populatedCart = cart.map(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const prod = products?.find(p => p.id === pId || p._id === pId);
      return {
        product: prod || (typeof item.product === 'object' ? normalizeProduct(item.product) : { _id: pId, id: pId, name: 'Product', price: 0 }),
        quantity: item.quantity
      };
    }).filter(item => item.product !== null);

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id || req.user.id;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  try {
    const userData = await getUserData(userId);
    let cart = userData?.user?.cart || [];
    const itemIndex = cart.findIndex(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      return pId === productId;
    });

    if (itemIndex > -1) {
      cart[itemIndex].quantity += parseInt(quantity, 10);
    } else {
      cart.push({ product: productId, quantity: parseInt(quantity, 10) });
    }

    await saveUserCart(userId, cart, userData);

    const productIds = cart.map(item => typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product);
    const products = await populateProducts(productIds);
    
    const populatedCart = cart.map(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const prod = products?.find(p => p.id === pId || p._id === pId);
      return {
        product: prod || (typeof item.product === 'object' ? normalizeProduct(item.product) : { _id: pId, id: pId, name: 'Product', price: 0 }),
        quantity: item.quantity
      };
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update quantity in cart
// @route   PUT /api/cart
// @access  Private
export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id || req.user.id;

  if (quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  try {
    const userData = await getUserData(userId);
    let cart = userData?.user?.cart || [];
    const itemIndex = cart.findIndex(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      return pId === productId;
    });

    if (itemIndex > -1) {
      cart[itemIndex].quantity = parseInt(quantity, 10);
      await saveUserCart(userId, cart, userData);
    }

    const productIds = cart.map(item => typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product);
    const products = await populateProducts(productIds);
    
    const populatedCart = cart.map(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const prod = products?.find(p => p.id === pId || p._id === pId);
      return {
        product: prod || (typeof item.product === 'object' ? normalizeProduct(item.product) : { _id: pId, id: pId, name: 'Product', price: 0 }),
        quantity: item.quantity
      };
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id || req.user.id;

  try {
    const userData = await getUserData(userId);
    let cart = userData?.user?.cart || [];
    cart = cart.filter(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      return pId !== productId;
    });

    await saveUserCart(userId, cart, userData);

    const productIds = cart.map(item => typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product);
    const products = await populateProducts(productIds);
    
    const populatedCart = cart.map(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const prod = products?.find(p => p.id === pId || p._id === pId);
      return {
        product: prod || (typeof item.product === 'object' ? normalizeProduct(item.product) : { _id: pId, id: pId, name: 'Product', price: 0 }),
        quantity: item.quantity
      };
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    const userData = await getUserData(userId);
    await saveUserCart(userId, [], userData);
    res.json({ success: true, cart: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// WISHLIST CONTROLLERS
// ==========================================

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    const userData = await getUserData(userId);
    const rawWishlist = userData?.user?.wishlist || [];
    if (!Array.isArray(rawWishlist) || rawWishlist.length === 0) {
      return res.json({ success: true, wishlist: [] });
    }

    const getId = (item) => (typeof item === 'object' && item !== null ? (item.id || item._id) : item);
    const productIds = rawWishlist.map(getId).filter(Boolean);
    const populated = await populateProducts(productIds);

    const finalWishlist = productIds.map(id => {
      const found = populated.find(p => p.id === id || p._id === id);
      if (found) return found;
      const rawObj = rawWishlist.find(item => getId(item) === id);
      return typeof rawObj === 'object' && rawObj !== null 
        ? normalizeProduct(rawObj) 
        : { _id: id, id, name: 'Product', price: 0 };
    });

    res.json({ success: true, wishlist: finalWishlist });
  } catch (error) {
    console.error('getWishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  const { productId, product } = req.body;
  const targetId = productId || product?._id || product?.id;
  const userId = req.user._id || req.user.id;

  if (!targetId) {
    return res.status(400).json({ success: false, message: 'Product ID required' });
  }

  try {
    const userData = await getUserData(userId);
    let wishlist = userData?.user?.wishlist || [];
    if (!Array.isArray(wishlist)) wishlist = [];

    const getId = (item) => (typeof item === 'object' && item !== null ? (item.id || item._id) : item);
    const exists = wishlist.some(item => getId(item) === targetId);

    if (exists) {
      wishlist = wishlist.filter(item => getId(item) !== targetId);
    } else {
      wishlist.push(targetId);
    }

    await saveUserWishlist(userId, wishlist, userData);

    const productIds = wishlist.map(getId).filter(Boolean);
    const populated = await populateProducts(productIds);

    const finalWishlist = productIds.map(id => {
      const found = populated.find(p => p.id === id || p._id === id);
      if (found) return found;
      if (product && (product._id === id || product.id === id)) {
        return normalizeProduct(product);
      }
      return { _id: id, id, name: 'Product', price: 0 };
    });

    res.json({ success: true, wishlist: finalWishlist });
  } catch (error) {
    console.error('toggleWishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
