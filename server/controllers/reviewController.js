import { supabase } from '../config/supabase.js';

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { data: reviews, error } = await supabase.from('reviews').select('*, user:users(name, avatar)').eq('product_id', productId);
    if (error) throw error;
    res.json({ success: true, reviews: reviews || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id || req.user.id;

    const { data: review, error } = await supabase.from('reviews').insert([{
      product_id: productId,
      user_id: userId,
      rating,
      comment
    }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
