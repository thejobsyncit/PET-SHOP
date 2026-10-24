import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_REVIEWS_FILE = path.join(__dirname, '..', 'data', 'reviews.json');
const REVIEWS_STATE_FILE = path.join(__dirname, '..', '..', 'server_data', 'reviews_state.json');

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
    // 1. Try fetching from Supabase if table exists
    if (supabase) {
      try {
        const { data: dbReviews, error } = await supabase
          .from('reviews')
          .select('*, user:users(name, avatar)')
          .eq('product_id', productId);

        if (!error && dbReviews) {
          return res.json({
            success: true,
            reviews: dbReviews.map(r => ({
              _id: r.id || r._id,
              id: r.id || r._id,
              userName: r.user?.name || r.userName || 'Verified Buyer',
              userAvatar: r.user?.avatar,
              rating: r.rating,
              title: r.title || 'Verified Review',
              comment: r.comment,
              createdAt: r.created_at || r.createdAt || new Date().toISOString()
            }))
          });
        }
      } catch (_) {}
    }

    // 2. Fallback to local persistent storage
    const allReviews = loadReviews();
    const cleanId = String(productId);
    const matching = allReviews.filter(r => 
      String(r.product || r.product_id || r.productId) === cleanId
    );

    res.json({ success: true, reviews: matching });
  } catch (error) {
    console.error('[ReviewController] getProductReviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user?._id || req.user?.id || 'guest-user';
    const userName = req.user?.name || req.user?.email?.split('@')[0] || 'Verified Buyer';

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment is required' });
    }

    const reviewId = 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const newReview = {
      _id: reviewId,
      id: reviewId,
      user: userId,
      user_id: userId,
      userName: userName,
      product: productId,
      product_id: productId,
      productId: productId,
      rating: Number(rating) || 5,
      title: title?.trim() || 'Verified Purchase',
      comment: comment.trim(),
      verifiedPurchase: true,
      createdAt: new Date().toISOString()
    };

    // 1. Attempt to insert into Supabase if table exists (ignore schema cache / table missing errors)
    if (supabase) {
      try {
        await supabase.from('reviews').insert([{
          id: reviewId,
          product_id: productId,
          user_id: userId,
          rating: Number(rating) || 5,
          title: title?.trim() || 'Verified Purchase',
          comment: comment.trim(),
          created_at: newReview.createdAt
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
