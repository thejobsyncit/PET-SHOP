<<<<<<< HEAD
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

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

<<<<<<< HEAD
      const review = new Review({
        user: userId,
        userName: req.user.name,
        product: productId,
        rating: Number(rating),
        title,
        comment,
        verifiedPurchase: true // Hardcoded for demo/simplicity
      });

      await review.save();

      // Recalculate product rating
      const reviews = await Review.find({ product: productId });
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

      await Product.findByIdAndUpdate(productId, {
        rating: Number(avgRating.toFixed(1)),
        reviewCount: reviews.length
      });

      res.status(201).json({ success: true, review });

    } else {
      const reviewsList = readMockData('reviews');
      const productsList = readMockData('products');

      const alreadyReviewed = reviewsList.find(
        r => r.user.toString() === userId.toString() && r.product.toString() === productId.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      }

      const newReview = {
        _id: 'rev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        user: userId.toString(),
        userName: req.user.name,
        product: productId.toString(),
        rating: Number(rating),
        title,
        comment,
        verifiedPurchase: true,
        createdAt: new Date().toISOString()
      };

      reviewsList.push(newReview);
      writeMockData('reviews', reviewsList);

      // Recalculate rating
      const prodReviews = reviewsList.filter(r => r.product.toString() === productId.toString());
      const avgRating = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;

      const pIdx = productsList.findIndex(p => p._id.toString() === productId.toString());
      if (pIdx !== -1) {
        productsList[pIdx].rating = Number(avgRating.toFixed(1));
        productsList[pIdx].reviewCount = prodReviews.length;
        writeMockData('products', productsList);
      }

      res.status(201).json({ success: true, review: newReview });
    }
=======
    const { data: review, error } = await supabase.from('reviews').insert([{
      product_id: productId,
      user_id: userId,
      rating,
      comment
    }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, review });
>>>>>>> origin/main
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
