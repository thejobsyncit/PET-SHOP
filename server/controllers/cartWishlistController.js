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
        _id: existing._id || u._id || existing.id || u.id,
        id: existing.id || existing._id || u.id || u._id,
        cart: (Array.isArray(u.cart) && u.cart.length > 0) ? u.cart : (existing.cart || []),
        addresses: (Array.isArray(u.addresses) && u.addresses.length > 0) ? u.addresses : (existing.addresses || []),
        wishlist: (Array.isArray(u.wishlist) && u.wishlist.length > 0) ? u.wishlist : (existing.wishlist || [])
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
let diskLockQueue = Promise.resolve();
const withDiskLock = (fn) => {
  const next = diskLockQueue.then(() => fn());
  diskLockQueue = next.catch(() => {});
  return next;
};

// In-memory registries for fast session continuity across requests
const inMemoryWishlists = new Map();
const inMemoryCarts = new Map();

const getMemCart = (...keys) => {
  for (const k of keys) {
    if (!k) continue;
    const str = String(k).trim();
    if (inMemoryCarts.has(str)) return inMemoryCarts.get(str);
    const lower = str.toLowerCase();
    if (inMemoryCarts.has(lower)) return inMemoryCarts.get(lower);
  }
  return null;
};

const setMemCart = (cart, ...keys) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  for (const k of keys) {
    if (!k) continue;
    const str = String(k).trim();
    inMemoryCarts.set(str, safeCart);
    inMemoryCarts.set(str.toLowerCase(), safeCart);
  }
};

const getMemWishlist = (...keys) => {
  for (const k of keys) {
    if (!k) continue;
    const str = String(k).trim();
    if (inMemoryWishlists.has(str)) return inMemoryWishlists.get(str);
    const lower = str.toLowerCase();
    if (inMemoryWishlists.has(lower)) return inMemoryWishlists.get(lower);
  }
  return null;
};

const setMemWishlist = (wishlist, ...keys) => {
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  for (const k of keys) {
    if (!k) continue;
    const str = String(k).trim();
    inMemoryWishlists.set(str, safeWishlist);
    inMemoryWishlists.set(str.toLowerCase(), safeWishlist);
  }
};

// Retrieve user record from Supabase or disk users.json
const getUserData = async (userId, userEmail) => {
  const cleanId = (userId && String(userId) !== 'undefined' && String(userId) !== 'null') ? String(userId) : '';
  const cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : '';

  if (!cleanId && !cleanEmail) {
    throw new Error('User identity missing');
  }

  let user = null;
  let source = 'disk';

  if (supabase && cleanId) {
    try {
      const { data: dbUser, error } = await supabase.from('users').select('*').eq('id', cleanId).single();
      if (!error && dbUser) {
        user = dbUser;
        source = 'supabase';
      }
    } catch (e) {}
  }

  if (!user) {
    const diskUsers = loadDiskUsers();
    user = diskUsers.find(u => 
      (cleanId && (String(u._id) === cleanId || String(u.id) === cleanId)) ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );
  }

  if (user) {
    const userKeys = [cleanId, cleanEmail, user._id, user.id, user.email].filter(Boolean);
    const memWish = getMemWishlist(...userKeys);
    const memC = getMemCart(...userKeys);

    if ((!user.wishlist || user.wishlist.length === 0) && Array.isArray(memWish) && memWish.length > 0) {
      user.wishlist = memWish;
    } else if (Array.isArray(user.wishlist) && user.wishlist.length > 0) {
      setMemWishlist(user.wishlist, ...userKeys);
    }

    if ((!user.cart || user.cart.length === 0) && Array.isArray(memC) && memC.length > 0) {
      user.cart = memC;
    } else if (Array.isArray(user.cart) && user.cart.length > 0) {
      setMemCart(user.cart, ...userKeys);
    }

    return { user, source };
  }

  const effectiveKey = cleanId || cleanEmail;
  const userKeys = [cleanId, cleanEmail].filter(Boolean);
  const memWishlist = getMemWishlist(...userKeys) || [];
  const memCart = getMemCart(...userKeys) || [];
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
  return withDiskLock(async () => {
    const cleanId = (userId && String(userId) !== 'undefined' && String(userId) !== 'null') ? String(userId) : '';
    const cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : (userData?.user?.email ? userData.user.email.trim().toLowerCase() : '');
    const userObjId = userData?.user?._id || userData?.user?.id;
    const safeCart = Array.isArray(cart) ? cart : [];

    // Cache cart in memory under all user identifiers
    setMemCart(safeCart, cleanId, cleanEmail, userObjId);

    if (userData?.source === 'supabase' && supabase && cleanId) {
      try {
        await supabase.from('users').update({ cart: safeCart }).eq('id', cleanId);
      } catch (e) {}
    }

    const diskUsers = loadDiskUsers();
    const idx = diskUsers.findIndex(u => 
      (cleanId && (String(u._id) === cleanId || String(u.id) === cleanId)) ||
      (userObjId && (String(u._id) === String(userObjId) || String(u.id) === String(userObjId))) ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (idx > -1) {
      diskUsers[idx].cart = safeCart;
      // Cross-preservation: Never let wishlist be erased when saving cart!
      const memWish = getMemWishlist(cleanId, cleanEmail, userObjId, diskUsers[idx]._id, diskUsers[idx].id, diskUsers[idx].email);
      if ((!diskUsers[idx].wishlist || diskUsers[idx].wishlist.length === 0) && Array.isArray(memWish) && memWish.length > 0) {
        diskUsers[idx].wishlist = memWish;
      }
      setMemWishlist(diskUsers[idx].wishlist, cleanId, cleanEmail, userObjId, diskUsers[idx]._id, diskUsers[idx].id);
    } else {
      const memWish = getMemWishlist(cleanId, cleanEmail, userObjId) || userData?.user?.wishlist || [];
      diskUsers.push({
        _id: cleanId || userObjId || `user_${Date.now()}`,
        id: cleanId || userObjId || `user_${Date.now()}`,
        email: cleanEmail || `user_${(cleanId || 'guest').slice(0, 8)}@joshpetshub.com`,
        role: userData?.user?.role || 'CUSTOMER',
        cart: safeCart,
        wishlist: memWish
      });
      setMemWishlist(memWish, cleanId, cleanEmail, userObjId);
    }
    saveDiskUsers(diskUsers);
  });
};

// Save user wishlist state
const saveUserWishlist = async (userId, wishlist, userData, userEmail) => {
  return withDiskLock(async () => {
    const cleanId = (userId && String(userId) !== 'undefined' && String(userId) !== 'null') ? String(userId) : '';
    const cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : (userData?.user?.email ? userData.user.email.trim().toLowerCase() : '');
    const userObjId = userData?.user?._id || userData?.user?.id;
    const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

    // Cache wishlist in memory under all user identifiers
    setMemWishlist(safeWishlist, cleanId, cleanEmail, userObjId);

    if (userData?.source === 'supabase' && supabase && cleanId) {
      try {
        await supabase.from('users').update({ wishlist: safeWishlist }).eq('id', cleanId);
      } catch (e) {}
    }

    const diskUsers = loadDiskUsers();
    const idx = diskUsers.findIndex(u => 
      (cleanId && (String(u._id) === cleanId || String(u.id) === cleanId)) ||
      (userObjId && (String(u._id) === String(userObjId) || String(u.id) === String(userObjId))) ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (idx > -1) {
      diskUsers[idx].wishlist = safeWishlist;
      // Cross-preservation: Never let cart be erased when saving wishlist!
      const memC = getMemCart(cleanId, cleanEmail, userObjId, diskUsers[idx]._id, diskUsers[idx].id, diskUsers[idx].email);
      if ((!diskUsers[idx].cart || diskUsers[idx].cart.length === 0) && Array.isArray(memC) && memC.length > 0) {
        diskUsers[idx].cart = memC;
      }
      setMemCart(diskUsers[idx].cart, cleanId, cleanEmail, userObjId, diskUsers[idx]._id, diskUsers[idx].id);
    } else {
      const memC = getMemCart(cleanId, cleanEmail, userObjId) || userData?.user?.cart || [];
      diskUsers.push({
        _id: cleanId || userObjId || `user_${Date.now()}`,
        id: cleanId || userObjId || `user_${Date.now()}`,
        email: cleanEmail || `user_${(cleanId || 'guest').slice(0, 8)}@joshpetshub.com`,
        role: userData?.user?.role || 'CUSTOMER',
        cart: memC,
        wishlist: safeWishlist
      });
      setMemCart(memC, cleanId, cleanEmail, userObjId);
    }
    saveDiskUsers(diskUsers);
  });
};

const normalizeProduct = (p) => {
  if (!p) return null;
  const price = Number(p.price ?? p.fee ?? 0) || 0;
  const discountPrice = p.discount_price !== null && p.discount_price !== undefined 
    ? Number(p.discount_price) 
    : (p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null);
  const discountPercentage = p.discount_percentage !== undefined 
    ? Number(p.discount_percentage) 
    : (discountPrice && price > discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0);

  const pId = String(p.id || p._id || '');
  const images = Array.isArray(p.images) && p.images.length > 0 
    ? p.images 
    : (p.image ? [p.image] : []);

  return {
    ...p,
    _id: pId,
    id: pId,
    name: p.name || p.title || 'Product',
    title: p.title || p.name || 'Product',
    price,
    fee: price,
    discountPrice,
    discountPercentage,
    images,
    image: images[0] || p.image || '',
    stock: p.stock !== undefined && p.stock !== null && !isNaN(Number(p.stock)) ? Number(p.stock) : 15,
    isBestSeller: p.is_bestseller ?? p.isBestSeller ?? false,
    isFeatured: p.is_featured ?? p.isFeatured ?? false,
    requiresPrescription: p.requires_prescription ?? p.requiresPrescription ?? false,
    petType: p.pet_type ?? p.petType,
    breed: p.breed,
    isPet: Boolean(p.isPet || p.petType || p.breed || p.itemType === 'pet' || p.itemType === 'adoption')
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

const getCartItemIdStr = (item) => {
  if (!item) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item).trim();
  const raw = (item.product && typeof item.product === 'object')
    ? (item.product._id || item.product.id)
    : (item.product || item.productId || item._id || item.id);
  return raw ? String(raw).trim() : '';
};

// Populate product and pet details for given cart items
export const populateCartItems = async (rawCart) => {
  if (!Array.isArray(rawCart) || rawCart.length === 0) return [];
  
  const productIds = Array.from(new Set(rawCart.map(getCartItemIdStr).filter(Boolean)));
  const populatedProds = await populateProducts(productIds);

  let listings = [];
  try {
    const listingsFile = path.join(__dirname, '..', 'data', 'listings.json');
    if (fs.existsSync(listingsFile)) {
      const content = fs.readFileSync(listingsFile, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) listings = parsed;
    }
  } catch (_) {}

  let adoptions = [];
  try {
    const adoptionsFile = path.join(__dirname, '..', 'data', 'adoptions.json');
    if (fs.existsSync(adoptionsFile)) {
      const content = fs.readFileSync(adoptionsFile, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) adoptions = parsed;
    }
  } catch (_) {}

  return rawCart.map(item => {
    if (!item) return null;
    const pId = getCartItemIdStr(item);
    const quantity = Math.max(1, Number(item.quantity) || 1);

    const foundProd = populatedProds.find(p => String(p.id) === pId || String(p._id) === pId);
    if (foundProd) {
      return { product: foundProd, quantity };
    }

    const foundListing = listings.find(l => String(l.id) === pId || String(l._id) === pId);
    if (foundListing) {
      return {
        product: normalizeProduct({
          ...foundListing,
          _id: foundListing._id || foundListing.id,
          id: foundListing._id || foundListing.id,
          name: foundListing.title || `${foundListing.breed} (${foundListing.petType})`,
          title: foundListing.title,
          breed: foundListing.breed,
          petType: foundListing.petType,
          price: Number(foundListing.price) || 0,
          fee: Number(foundListing.price) || 0,
          images: foundListing.images || (foundListing.image ? [foundListing.image] : []),
          image: (foundListing.images && foundListing.images[0]) || foundListing.image || '',
          location: foundListing.location,
          contactPhone: foundListing.contactPhone,
          itemType: 'pet',
          isPet: true,
          stock: 1
        }),
        quantity
      };
    }

    const foundAdopt = adoptions.find(a => String(a.id) === pId || String(a._id) === pId);
    if (foundAdopt) {
      return {
        product: normalizeProduct({
          ...foundAdopt,
          _id: foundAdopt.id || foundAdopt._id,
          id: foundAdopt.id || foundAdopt._id,
          name: foundAdopt.name,
          title: foundAdopt.name,
          breed: foundAdopt.breed,
          petType: foundAdopt.petType || foundAdopt.category || 'pet',
          price: Number(foundAdopt.fee || foundAdopt.price) || 0,
          fee: Number(foundAdopt.fee || foundAdopt.price) || 0,
          quality: foundAdopt.quality,
          images: foundAdopt.image ? [foundAdopt.image] : [],
          image: foundAdopt.image || '',
          city: foundAdopt.city,
          itemType: 'adoption',
          isPet: true,
          stock: 1
        }),
        quantity
      };
    }

    if (typeof item.product === 'object' && item.product) {
      return {
        product: normalizeProduct(item.product),
        quantity
      };
    }

    return {
      product: { _id: pId, id: pId, name: 'Product / Pet', price: 0, stock: 1 },
      quantity
    };
  }).filter(Boolean);
};

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
    if (!Array.isArray(rawCart) || rawCart.length === 0) {
      return res.json({ success: true, cart: [] });
    }

    // Deduplicate cart rows by item ID
    const cartMap = new Map();
    for (const item of rawCart) {
      const pId = getCartItemIdStr(item);
      if (!pId) continue;
      if (cartMap.has(pId)) {
        const existing = cartMap.get(pId);
        existing.quantity = Math.max(Number(existing.quantity) || 1, Number(item.quantity) || 1);
        if (typeof item.product === 'object' && item.product) {
          existing.product = item.product;
        }
      } else {
        cartMap.set(pId, { ...item, quantity: Number(item.quantity) || 1 });
      }
    }
    const cart = Array.from(cartMap.values());
    const populatedCart = await populateCartItems(cart);

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product or pet to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity = 1, product: clientProduct } = req.body;
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const targetId = productId || (clientProduct?._id || clientProduct?.id);
  if (!targetId) {
    return res.status(400).json({ success: false, message: 'Product or Pet ID is required' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    let rawCart = Array.isArray(userData?.user?.cart) ? [...userData.user.cart] : [];
    
    // Deduplicate cart rows by productId
    const cartMap = new Map();
    for (const item of rawCart) {
      const pId = getCartItemIdStr(item);
      if (!pId) continue;
      if (cartMap.has(pId)) {
        const existing = cartMap.get(pId);
        existing.quantity = Math.max(Number(existing.quantity) || 1, Number(item.quantity) || 1);
        if (typeof item.product === 'object' && item.product) {
          existing.product = item.product;
        }
      } else {
        cartMap.set(pId, { ...item, quantity: Number(item.quantity) || 1 });
      }
    }

    const cleanProductId = String(targetId).trim();
    const isPet = Boolean(
      clientProduct?.isPet || clientProduct?.petType || clientProduct?.breed ||
      clientProduct?.itemType === 'pet' || clientProduct?.itemType === 'adoption'
    );
    const parsedQty = isPet ? 1 : Math.max(1, parseInt(quantity, 10) || 1);

    // Stock verification
    let availableStock = isPet ? 1 : 999;
    if (!isPet) {
      if (clientProduct && (typeof clientProduct.stock === 'number' || clientProduct.stock !== undefined)) {
        availableStock = Math.max(0, Number(clientProduct.stock));
      } else {
        const dbProds = await populateProducts([cleanProductId]);
        if (dbProds && dbProds[0] && dbProds[0].stock !== undefined) {
          availableStock = Math.max(0, Number(dbProds[0].stock));
        }
      }
    }

    if (availableStock <= 0) {
      return res.status(400).json({ success: false, message: 'This item is currently out of stock.' });
    }

    if (cartMap.has(cleanProductId)) {
      if (isPet) {
        // Pet is already in cart, return existing cart cleanly
        const existing = cartMap.get(cleanProductId);
        existing.quantity = 1;
        if (clientProduct && typeof clientProduct === 'object') {
          existing.product = normalizeProduct(clientProduct);
        }
      } else {
        const existing = cartMap.get(cleanProductId);
        const currentQty = Number(existing.quantity) || 0;
        if (currentQty >= availableStock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more units. You already have the maximum available stock (${availableStock} unit${availableStock === 1 ? '' : 's'}) in your cart.`
          });
        }
        if (currentQty + parsedQty > availableStock) {
          const remaining = availableStock - currentQty;
          return res.status(400).json({
            success: false,
            message: `Cannot add ${parsedQty} units. You already have ${currentQty} in cart, and only ${remaining} more can be added (total stock: ${availableStock}).`
          });
        }
        existing.quantity = currentQty + parsedQty;
        if (clientProduct && typeof clientProduct === 'object') {
          existing.product = { ...clientProduct, stock: availableStock };
        }
      }
    } else {
      if (parsedQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity (${parsedQty}) exceeds available stock (${availableStock}).`
        });
      }
      cartMap.set(cleanProductId, { 
        product: clientProduct && typeof clientProduct === 'object' ? normalizeProduct(clientProduct) : cleanProductId, 
        quantity: parsedQty 
      });
    }

    const updatedCart = Array.from(cartMap.values());
    await saveUserCart(userId, updatedCart, userData, userEmail);

    const populatedCart = await populateCartItems(updatedCart);
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
    const itemIndex = cart.findIndex(item => getCartItemIdStr(item) === String(productId));

    if (itemIndex > -1) {
      const item = cart[itemIndex];
      let availableStock = 999;
      const isPet = Boolean(item.product?.isPet || item.product?.breed || item.product?.petType);
      if (isPet) {
        availableStock = 1;
      } else if (typeof item.product === 'object' && item.product.stock !== undefined) {
        availableStock = Math.max(0, Number(item.product.stock));
      } else {
        const dbProds = await populateProducts([String(productId)]);
        if (dbProds && dbProds[0] && dbProds[0].stock !== undefined) {
          availableStock = Math.max(0, Number(dbProds[0].stock));
        }
      }

      const requestedQty = parseInt(quantity, 10) || 1;
      if (requestedQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity (${requestedQty}) exceeds available stock (${availableStock}).`
        });
      }
      cart[itemIndex].quantity = requestedQty;
      await saveUserCart(userId, cart, userData, userEmail);
    }

    const populatedCart = await populateCartItems(cart);
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
    cart = cart.filter(item => getCartItemIdStr(item) !== String(productId));

    await saveUserCart(userId, cart, userData, userEmail);

    const populatedCart = await populateCartItems(cart);
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

// @desc    Sync local cart items to user account on login
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
  const { items } = req.body;
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    let cart = userData?.user?.cart || [];
    if (!Array.isArray(cart)) cart = [];

    const incoming = Array.isArray(items) ? items : [];
    const cartMap = new Map();

    // Load existing items into map
    cart.forEach(item => {
      const id = getCartItemIdStr(item);
      if (id) {
        cartMap.set(id, {
          product: item.product,
          quantity: Math.max(1, Number(item.quantity) || 1)
        });
      }
    });

    // Merge incoming items
    incoming.forEach(item => {
      const id = getCartItemIdStr(item);
      if (id) {
        const inQty = Math.max(1, Number(item.quantity) || 1);
        if (!cartMap.has(id)) {
          cartMap.set(id, {
            product: typeof item.product === 'object' ? (normalizeProduct(item.product) || item.product) : id,
            quantity: inQty
          });
        } else {
          const existing = cartMap.get(id);
          existing.quantity = Math.max(Number(existing.quantity) || 1, inQty);
          if (typeof item.product === 'object' && item.product) {
            existing.product = normalizeProduct(item.product) || item.product;
          }
        }
      }
    });

    const updatedCart = Array.from(cartMap.values());
    await saveUserCart(userId, updatedCart, userData, userEmail);

    const populatedCart = await populateCartItems(updatedCart);
    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error('syncCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// WISHLIST CONTROLLERS
// ==========================================

const getWishlistItemIdStr = (item) => {
  if (!item) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item).trim();
  const raw = item._id || item.id || item.productId || (typeof item.product === 'object' ? (item.product?._id || item.product?.id) : item.product);
  return raw ? String(raw).trim() : '';
};

// Populate product and pet details for given wishlist items
const populateWishlistItems = async (rawWishlist, fallbackProduct = null) => {
  if (!Array.isArray(rawWishlist) || rawWishlist.length === 0) return [];
  const productIds = Array.from(new Set(rawWishlist.map(getWishlistItemIdStr).filter(Boolean)));
  const populatedProds = await populateProducts(productIds);

  // Check pet listings and adoptions from disk if not found in products
  let listings = [];
  try {
    const listingsFile = path.join(__dirname, '..', 'data', 'listings.json');
    if (fs.existsSync(listingsFile)) {
      const content = fs.readFileSync(listingsFile, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) listings = parsed;
    }
  } catch (_) {}

  let adoptions = [];
  try {
    const adoptionsFile = path.join(__dirname, '..', 'data', 'adoptions.json');
    if (fs.existsSync(adoptionsFile)) {
      const content = fs.readFileSync(adoptionsFile, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) adoptions = parsed;
    }
  } catch (_) {}

  return productIds.map(id => {
    const foundProd = populatedProds.find(p => String(p.id) === String(id) || String(p._id) === String(id));
    if (foundProd) return foundProd;

    const foundListing = listings.find(l => String(l.id) === String(id) || String(l._id) === String(id));
    if (foundListing) {
      return normalizeProduct({
        ...foundListing,
        _id: foundListing._id || foundListing.id,
        id: foundListing._id || foundListing.id,
        name: foundListing.title || `${foundListing.breed} (${foundListing.petType})`,
        title: foundListing.title,
        breed: foundListing.breed,
        petType: foundListing.petType,
        price: Number(foundListing.price) || 0,
        images: foundListing.images || (foundListing.image ? [foundListing.image] : []),
        image: (foundListing.images && foundListing.images[0]) || foundListing.image || '',
        location: foundListing.location,
        contactPhone: foundListing.contactPhone,
        itemType: 'pet',
        isPet: true
      });
    }

    const foundAdopt = adoptions.find(a => String(a.id) === String(id) || String(a._id) === String(id));
    if (foundAdopt) {
      return normalizeProduct({
        ...foundAdopt,
        _id: foundAdopt.id || foundAdopt._id,
        id: foundAdopt.id || foundAdopt._id,
        name: foundAdopt.name,
        title: foundAdopt.name,
        breed: foundAdopt.breed,
        petType: foundAdopt.petType || foundAdopt.category || 'pet',
        price: Number(foundAdopt.fee || foundAdopt.price) || 0,
        fee: Number(foundAdopt.fee || foundAdopt.price) || 0,
        quality: foundAdopt.quality,
        images: foundAdopt.image ? [foundAdopt.image] : [],
        image: foundAdopt.image || '',
        city: foundAdopt.city,
        itemType: 'adoption',
        isPet: true
      });
    }

    const rawObj = rawWishlist.find(item => getWishlistItemIdStr(item) === id);
    if (typeof rawObj === 'object' && rawObj !== null) {
      return normalizeProduct(rawObj);
    }

    if (fallbackProduct && (String(fallbackProduct._id) === String(id) || String(fallbackProduct.id) === String(id))) {
      return normalizeProduct(fallbackProduct);
    }

    return { _id: id, id, name: 'Product', price: 0 };
  });
};

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

    const finalWishlist = await populateWishlistItems(rawWishlist);
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
  const { productId, product, action } = req.body;
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

    const targetIdStr = String(targetId).trim();
    const exists = wishlist.some(item => getWishlistItemIdStr(item) === targetIdStr);

    // Determine whether to remove or add
    const shouldRemove = action === 'remove' || (action !== 'add' && exists);

    if (shouldRemove) {
      wishlist = wishlist.filter(item => getWishlistItemIdStr(item) !== targetIdStr);
    } else {
      if (!exists) {
        const itemToStore = product ? (normalizeProduct(product) || product) : targetIdStr;
        wishlist.push(itemToStore);
      }
    }

    await saveUserWishlist(userId, wishlist, userData, userEmail);

    const finalWishlist = await populateWishlistItems(wishlist, product);
    res.json({ success: true, wishlist: finalWishlist });
  } catch (error) {
    console.error('toggleWishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync local wishlist items to user account on login
// @route   POST /api/wishlist/sync
// @access  Private
export const syncWishlist = async (req, res) => {
  const { items } = req.body;
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  if (!userId && !userEmail) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userData = await getUserData(userId, userEmail);
    let wishlist = userData?.user?.wishlist || [];
    if (!Array.isArray(wishlist)) wishlist = [];

    const incoming = Array.isArray(items) ? items : [];
    const wishlistMap = new Map();

    // Load existing items into map
    wishlist.forEach(item => {
      const id = getWishlistItemIdStr(item);
      if (id) wishlistMap.set(id, item);
    });

    // Merge incoming items
    incoming.forEach(item => {
      const id = getWishlistItemIdStr(item);
      if (id) {
        if (!wishlistMap.has(id)) {
          wishlistMap.set(id, typeof item === 'object' ? (normalizeProduct(item) || item) : id);
        } else if (typeof item === 'object') {
          // If incoming has richer details (e.g. pet object), update existing
          wishlistMap.set(id, normalizeProduct(item) || item);
        }
      }
    });

    const updatedWishlist = Array.from(wishlistMap.values());
    await saveUserWishlist(userId, updatedWishlist, userData, userEmail);

    const finalWishlist = await populateWishlistItems(updatedWishlist);
    res.json({ success: true, wishlist: finalWishlist });
  } catch (error) {
    console.error('syncWishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
