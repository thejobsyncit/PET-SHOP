import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_REVIEWS_FILE = path.join(__dirname, '..', 'data', 'reviews.json');
const REVIEWS_STATE_FILE = path.join(__dirname, '..', '..', 'server_data', 'reviews_state.json');
const DISK_PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

// Read products from local disk for ID/slug matching
const loadDiskProducts = () => {
  try {
    if (fs.existsSync(DISK_PRODUCTS_FILE)) {
      const content = fs.readFileSync(DISK_PRODUCTS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
};

// Resolve all identifier aliases (id, _id, slug) for a product
const resolveProductIdentifiers = async (identifier) => {
  if (!identifier) return new Set();
  const idStr = String(identifier).trim().toLowerCase();
  const identifiers = new Set([idStr]);

  // Check disk products
  try {
    const products = loadDiskProducts();
    for (const p of products) {
      const pId = String(p._id || p.id || '').trim().toLowerCase();
      const pSlug = String(p.slug || '').trim().toLowerCase();
      if (pId === idStr || pSlug === idStr) {
        if (pId) identifiers.add(pId);
        if (pSlug) identifiers.add(pSlug);
      }
    }
  } catch (_) {}

  // Check Supabase products if connected
  if (supabase) {
    try {
      const { data: pFromDb } = await supabase
        .from('products')
        .select('id, slug')
        .or(`id.eq.${identifier},slug.eq.${identifier}`);
      if (Array.isArray(pFromDb)) {
        for (const p of pFromDb) {
          if (p.id) identifiers.add(String(p.id).trim().toLowerCase());
          if (p.slug) identifiers.add(String(p.slug).trim().toLowerCase());
        }
      }
    } catch (_) {}
  }

  return identifiers;
};

// Read reviews from persistent disk / seed storage
const loadReviews = () => {
  try {
    if (fs.existsSync(REVIEWS_STATE_FILE)) {
      const content = fs.readFileSync(REVIEWS_STATE_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[ReviewController] Error reading reviews_state.json:', err?.message);
  }

  try {
    if (fs.existsSync(SEED_REVIEWS_FILE)) {
      const content = fs.readFileSync(SEED_REVIEWS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[ReviewController] Error reading seed reviews.json:', err?.message);
  }

  return [];
};

// Save reviews to persistent storage (outside server directory to avoid nodemon restarts)
const saveReviews = (reviews) => {
  try {
    const dir = path.dirname(REVIEWS_STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REVIEWS_STATE_FILE, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (err) {
    console.warn('[ReviewController] Error saving reviews_state.json:', err?.message);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const validIdentifiers = await resolveProductIdentifiers(productId);

    // 1. Try fetching from Supabase if table exists
    if (supabase) {
      try {
        const idList = Array.from(validIdentifiers);
        const { data: dbReviews, error } = await supabase
          .from('reviews')
          .select('*, user:users(name, avatar)')
          .in('product_id', idList);

        if (!error && Array.isArray(dbReviews) && dbReviews.length > 0) {
          return res.json({
            success: true,
            reviews: dbReviews.map(r => ({
              _id: r.id || r._id,
              id: r.id || r._id,
              userName: r.user?.name || r.userName || 'Verified Buyer',
              userAvatar: r.user?.avatar,
              rating: r.rating,
              title: r.title || '',
              comment: r.comment || '',
              createdAt: r.created_at || r.createdAt || new Date().toISOString()
            }))
          });
        }
      } catch (_) {}
    }

    // 2. Fallback to local persistent storage
    const allReviews = loadReviews();
    const matching = allReviews.filter(r => {
      const rProd = String(r.product || r.product_id || r.productId || '').trim().toLowerCase();
      const rSlug = String(r.productSlug || r.slug || '').trim().toLowerCase();
      return validIdentifiers.has(rProd) || validIdentifiers.has(rSlug);
    });

    const sanitizedReviews = matching.map(r => ({
      ...r,
      _id: r._id || r.id,
      id: r.id || r._id,
      userName: r.userName || r.user_name || 'Verified Buyer',
      title: r.title || '',
      comment: r.comment || '',
      createdAt: r.createdAt || r.created_at || '2026-10-15T10:00:00.000Z'
    }));

    res.json({ success: true, reviews: sanitizedReviews });
  } catch (error) {
    console.error('[ReviewController] getProductReviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private / Authenticated User
export const createReview = async (req, res) => {
  try {
    const { productId, productSlug, rating, title, comment, userId: bodyUserId, userName: bodyUserName } = req.body;
    const userId = req.user?._id || req.user?.id || bodyUserId || 'guest-user';
    const userName = req.user?.name || bodyUserName || req.user?.email?.split('@')[0] || 'Verified Buyer';

    const targetIdentifier = productId || productSlug;
    if (!targetIdentifier) {
      return res.status(400).json({ success: false, message: 'Product ID or slug is required' });
    }

    // Resolve matching product info
    let resolvedId = productId;
    let resolvedSlug = productSlug;

    try {
      const diskProducts = loadDiskProducts();
      const found = diskProducts.find(p => 
        String(p._id || p.id) === String(targetIdentifier) || 
        String(p.slug) === String(targetIdentifier)
      );
      if (found) {
        resolvedId = found._id || found.id || resolvedId;
        resolvedSlug = found.slug || resolvedSlug;
      }
    } catch (_) {}

    const reviewId = 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanComment = typeof comment === 'string' ? comment.trim() : '';
    const cleanRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const nowIso = new Date().toISOString();

    const newReview = {
      _id: reviewId,
      id: reviewId,
      user: userId,
      user_id: userId,
      userName: userName,
      product: resolvedId || targetIdentifier,
      product_id: resolvedId || targetIdentifier,
      productId: resolvedId || targetIdentifier,
      productSlug: resolvedSlug || '',
      slug: resolvedSlug || '',
      rating: cleanRating,
      title: cleanTitle,
      comment: cleanComment,
      verifiedPurchase: true,
      createdAt: nowIso
    };

    // 1. Attempt to insert into Supabase if table exists
    if (supabase) {
      try {
        await supabase.from('reviews').insert([{
          id: reviewId,
          product_id: resolvedId || targetIdentifier,
          user_id: userId,
          rating: cleanRating,
          title: cleanTitle || null,
          comment: cleanComment || null,
          created_at: nowIso
        }]);
      } catch (e) {
        // Table doesn't exist in Supabase; fallback handled below
      }
    }

    // 2. Persist to file storage
    const currentReviews = loadReviews();
    currentReviews.unshift(newReview);
    saveReviews(currentReviews);

    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    console.error('[ReviewController] createReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
