import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const USER_STATE_FILE = path.join(__dirname, '..', '..', 'server_data', 'user_state.json');

// Helpers for reading and writing user state (combining seed users.json and server_data/user_state.json)
const loadDiskUsers = () => {
  const userMap = new Map();

  const mergeUser = (u) => {
    if (!u) return;
    const key = String(u._id || u.id || (u.email ? u.email.toLowerCase() : ''));
    if (!key) return;

    let existingKey = key;
    if (!userMap.has(key) && u.email) {
      for (const [k, existing] of userMap.entries()) {
        if (existing.email && existing.email.toLowerCase() === u.email.toLowerCase()) {
          existingKey = k;
          break;
        }
      }
    }

    if (userMap.has(existingKey)) {
      const existing = userMap.get(existingKey);
      userMap.set(existingKey, {
        ...existing,
        ...u,
        cart: Array.isArray(u.cart) ? u.cart : (existing.cart || []),
        addresses: (Array.isArray(u.addresses) && u.addresses.length > 0) ? u.addresses : (existing.addresses || []),
        wishlist: Array.isArray(u.wishlist) ? u.wishlist : (existing.wishlist || [])
      });
    } else {
      userMap.set(key, { ...u });
    }
  };

  // 1. Read seed users.json (canonical auth & users store)
  try {
    if (fs.existsSync(SEED_USERS_FILE)) {
      const content = fs.readFileSync(SEED_USERS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) parsed.forEach(mergeUser);
    }
  } catch (err) {
    console.warn('[CartWishlist] Error reading seed users.json:', err?.message);
  }

  // 2. Read and overlay user_state.json
  try {
    if (fs.existsSync(USER_STATE_FILE)) {
      const content = fs.readFileSync(USER_STATE_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) parsed.forEach(mergeUser);
    }
  } catch (err) {
    console.warn('[CartWishlist] Error reading user_state.json:', err?.message);
  }

  return Array.from(userMap.values());
};

const saveDiskUsers = (users) => {
  try {
    const dir = path.dirname(USER_STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USER_STATE_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('[CartWishlist] Error saving user_state.json:', err?.message);
  }

  // Also update SEED_USERS_FILE so authController and auth middleware remain synchronized
  try {
    if (fs.existsSync(SEED_USERS_FILE)) {
      const seedRaw = fs.readFileSync(SEED_USERS_FILE, 'utf8');
      const seedUsers = JSON.parse(seedRaw);
      if (Array.isArray(seedUsers)) {
        let changed = false;
        users.forEach(u => {
          const id = String(u._id || u.id);
          const sIdx = seedUsers.findIndex(su => String(su._id || su.id) === id || (u.email && su.email && su.email.toLowerCase() === u.email.toLowerCase()));
          if (sIdx > -1) {
            seedUsers[sIdx].cart = u.cart;
            seedUsers[sIdx].wishlist = u.wishlist;
            changed = true;
          }
        });
        if (changed) {
          fs.writeFileSync(SEED_USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf8');
        }
      }
    }
  } catch (_) {}
};

// In-memory registries for fast session continuity across requests
const inMemoryWishlists = new Map();
const inMemoryCarts = new Map();

// Retrieve user record from Supabase or disk users.json
const getUserData = async (userId, userEmail) => {
  const cleanId = (userId && String(userId) !== 'undefined' && String(userId) !== 'null') ? String(userId) : '';
  const cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : '';

  if (!cleanId && !cleanEmail) {
    throw new Error('User identity missing');
  }

  if (supabase && cleanId) {
    try {
      const { data: user, error } = await supabase.from('users').select('*').eq('id', cleanId).single();
      if (!error && user) {
        return { user, source: 'supabase' };
      }
    } catch (e) {}
  }

  const diskUsers = loadDiskUsers();
  const diskUser = diskUsers.find(u => 
    (cleanId && (String(u._id) === cleanId || String(u.id) === cleanId)) ||
    (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
  );

  if (diskUser) {
    const key = cleanId || String(diskUser._id || diskUser.id || cleanEmail);
    if (inMemoryWishlists.has(key) && (!diskUser.wishlist || diskUser.wishlist.length === 0)) {
      diskUser.wishlist = inMemoryWishlists.get(key);
    }
    if (inMemoryCarts.has(key) && (!diskUser.cart || diskUser.cart.length === 0)) {
      diskUser.cart = inMemoryCarts.get(key);
    }
    return { user: diskUser, source: 'disk' };
  }

  const effectiveKey = cleanId || cleanEmail;
  const memWishlist = inMemoryWishlists.get(effectiveKey) || [];
  const memCart = inMemoryCarts.get(effectiveKey) || [];
  return {
    user: {
      _id: effectiveKey,
      id: effectiveKey,
      email: cleanEmail,
      cart: memCart,
      wishlist: memWishlist
    },
    source: 'memory'
  };
};

// Save user cart state
const saveUserCart = async (userId, cart, userData, userEmail) => {
  const cleanId = (userId && String(userId) !== 'undefined' && String(userId) !== 'null') ? String(userId) : '';
  const cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : (userData?.user?.email ? userData.user.email.trim().toLowerCase() : '');
  const key = cleanId || cleanEmail;

  inMemoryCarts.set(key, cart);

  if (userData?.source === 'supabase' && supabase && cleanId) {
    try {
      await supabase.from('users').update({ cart }).eq('id', cleanId);
    } catch (e) {}
  }

  const diskUsers = loadDiskUsers();
  const idx = diskUsers.findIndex(u => 
    (cleanId && (String(u._id) === cleanId || String(u.id) === cleanId)) ||
    (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
  );

  if (idx > -1) {
    diskUsers[idx].cart = cart;
  } else {
    diskUsers.push({
      _id: cleanId || key,
      id: cleanId || key,
      email: cleanEmail || `user_${key.slice(0, 8)}@joshpetshub.com`,
      role: userData?.user?.role || 'CUSTOMER',
      cart: cart,
      wishlist: inMemoryWishlists.get(key) || userData?.user?.wishlist || []
    });
  }
  saveDiskUsers(diskUsers);
};

// Save user wishlist state
const saveUserWishlist = async (userId, wishlist, userData, userEmail) => {
  const cleanId = (userId && String(userId) !== 'undefined' && String(userId) !== 'null') ? String(userId) : '';
  const cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : (userData?.user?.email ? userData.user.email.trim().toLowerCase() : '');
  const key = cleanId || cleanEmail;

  inMemoryWishlists.set(key, wishlist);

  if (userData?.source === 'supabase' && supabase && cleanId) {
    try {
      await supabase.from('users').update({ wishlist }).eq('id', cleanId);
    } catch (e) {}
  }

  const diskUsers = loadDiskUsers();
  const idx = diskUsers.findIndex(u => 
    (cleanId && (String(u._id) === cleanId || String(u.id) === cleanId)) ||
    (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
  );

  if (idx > -1) {
    diskUsers[idx].wishlist = wishlist;
  } else {
    diskUsers.push({
      _id: cleanId || key,
      id: cleanId || key,
      email: cleanEmail || `user_${key.slice(0, 8)}@joshpetshub.com`,
      role: userData?.user?.role || 'CUSTOMER',
      cart: inMemoryCarts.get(key) || userData?.user?.cart || [],
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
    stock: p.stock !== undefined && p.stock !== null && !isNaN(Number(p.stock)) ? Number(p.stock) : 15,
    isBestSeller: p.is_bestseller ?? p.isBestSeller ?? false,
    isFeatured: p.is_featured ?? p.isFeatured ?? false,
    requiresPrescription: p.requires_prescription ?? p.requiresPrescription ?? false,
    petType: p.pet_type ?? p.petType,
  };
};

// Populate product details for given product IDs (checks Supabase and disk products.json)
const populateProducts = async (rawProductIds) => {
  const productIds = (rawProductIds || []).filter(Boolean);
  if (productIds.length === 0) return [];

  let foundProducts = [];
  if (supabase) {
    try {
      const { data: products } = await supabase.from('products').select('*').in('id', productIds);
      if (products && products.length > 0) {
        foundProducts = products.map(normalizeProduct);
      }
    } catch (e) {}
  }

  // Also check disk products.json
  try {
    const productsFile = path.join(__dirname, '..', 'data', 'products.json');
    if (fs.existsSync(productsFile)) {
      const raw = fs.readFileSync(productsFile, 'utf8');
      const allProducts = JSON.parse(raw);
      if (Array.isArray(allProducts)) {
        const remainingIds = productIds.filter(id => !foundProducts.some(p => String(p.id) === String(id) || String(p._id) === String(id)));
        const matched = allProducts.filter(p => remainingIds.includes(String(p._id)) || remainingIds.includes(String(p.id)));
        foundProducts.push(...matched.map(normalizeProduct));
      }
    }
  } catch (err) {
    console.warn('[CartWishlist] Error reading products.json:', err?.message);
  }

  return foundProducts;
};

// ==========================================
// CART CONTROLLERS
// ==========================================

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    const rawCart = userData?.user?.cart || [];
    if (rawCart.length === 0) {
      return res.json({ success: true, cart: [] });
    }

    // Deduplicate cart rows by productId
    const cartMap = new Map();
    for (const item of rawCart) {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const key = String(pId);
      if (cartMap.has(key)) {
        const existing = cartMap.get(key);
        existing.quantity = Math.max(Number(existing.quantity) || 1, Number(item.quantity) || 1);
      } else {
        cartMap.set(key, { ...item, quantity: Number(item.quantity) || 1 });
      }
    }
    const cart = Array.from(cartMap.values());

    const productIds = cart.map(item => typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product);
    const products = await populateProducts(productIds);

    const populatedCart = cart.map(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const prod = products?.find(p => String(p.id) === String(pId) || String(p._id) === String(pId));
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
  const { productId, quantity = 1, product: clientProduct } = req.body;
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    let rawCart = Array.isArray(userData?.user?.cart) ? [...userData.user.cart] : [];
    
    // Deduplicate cart rows by productId
    const cartMap = new Map();
    for (const item of rawCart) {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const key = String(pId);
      if (cartMap.has(key)) {
        const existing = cartMap.get(key);
        existing.quantity = Math.max(Number(existing.quantity) || 1, Number(item.quantity) || 1);
      } else {
        cartMap.set(key, { ...item, quantity: Number(item.quantity) || 1 });
      }
    }

    const cleanProductId = String(productId);
    const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Stock verification
    let availableStock = 999;
    if (clientProduct && (typeof clientProduct.stock === 'number' || clientProduct.stock !== undefined)) {
      availableStock = Math.max(0, Number(clientProduct.stock));
    } else {
      const dbProds = await populateProducts([cleanProductId]);
      if (dbProds && dbProds[0] && dbProds[0].stock !== undefined) {
        availableStock = Math.max(0, Number(dbProds[0].stock));
      }
    }

    if (availableStock <= 0) {
      return res.status(400).json({ success: false, message: 'This product is currently out of stock.' });
    }

    if (cartMap.has(cleanProductId)) {
      const existing = cartMap.get(cleanProductId);
      const currentQty = Number(existing.quantity) || 0;
      if (currentQty >= availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. You already have the maximum available stock (${availableStock} unit${availableStock === 1 ? '' : 's'}) in your cart.`
        });
      }
      existing.quantity = Math.min(availableStock, currentQty + parsedQty);
      if (clientProduct && typeof clientProduct === 'object') {
        existing.product = { ...clientProduct, stock: availableStock };
      }
    } else {
      const initialQty = Math.min(availableStock, parsedQty);
      cartMap.set(cleanProductId, { 
        product: clientProduct && typeof clientProduct === 'object' ? { ...clientProduct, stock: availableStock } : productId, 
        quantity: initialQty 
      });
    }

    const updatedCart = Array.from(cartMap.values());
    await saveUserCart(userId, updatedCart, userData, userEmail);

    const productIds = updatedCart.map(item => typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product);
    const products = await populateProducts(productIds);
    
    const populatedCart = updatedCart.map(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      const prod = products?.find(p => String(p.id) === String(pId) || String(p._id) === String(pId));
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
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    let cart = userData?.user?.cart || [];
    const itemIndex = cart.findIndex(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      return pId === productId;
    });

    if (itemIndex > -1) {
      const item = cart[itemIndex];
      let availableStock = 999;
      if (typeof item.product === 'object' && item.product.stock !== undefined) {
        availableStock = Math.max(0, Number(item.product.stock));
      } else {
        const dbProds = await populateProducts([productId]);
        if (dbProds && dbProds[0] && dbProds[0].stock !== undefined) {
          availableStock = Math.max(0, Number(dbProds[0].stock));
        }
      }

      const requestedQty = parseInt(quantity, 10) || 1;
      const targetQty = Math.min(availableStock, Math.max(1, requestedQty));
      cart[itemIndex].quantity = targetQty;
      await saveUserCart(userId, cart, userData, userEmail);
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
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    let cart = userData?.user?.cart || [];
    cart = cart.filter(item => {
      const pId = typeof item.product === 'object' ? (item.product.id || item.product._id) : item.product;
      return pId !== productId;
    });

    await saveUserCart(userId, cart, userData, userEmail);

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
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    await saveUserCart(userId, [], userData, userEmail);
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
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
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
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!targetId) {
    return res.status(400).json({ success: false, message: 'Product ID required' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    let wishlist = userData?.user?.wishlist || [];
    if (!Array.isArray(wishlist)) wishlist = [];

    const getId = (item) => (typeof item === 'object' && item !== null ? (item.id || item._id) : item);
    const exists = wishlist.some(item => getId(item) === targetId);

    if (exists) {
      wishlist = wishlist.filter(item => getId(item) !== targetId);
    } else {
      wishlist.push(targetId);
    }

    await saveUserWishlist(userId, wishlist, userData, userEmail);

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
