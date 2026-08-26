import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
import mongoose from 'mongoose';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    if (isDbConnected()) {
      const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
      res.json({ success: true, reviews });
    } else {
      const reviewsList = readMockData('reviews');
      const filtered = reviewsList
        .filter(r => r.product.toString() === productId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, reviews: filtered });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const userId = req.user._id || req.user.id;

  if (!rating || !title || !comment) {
    return res.status(400).json({ success: false, message: 'Please provide rating, title, and comment' });
  }

  try {
    if (isDbConnected()) {
      // Check if user already reviewed this product
      const alreadyReviewed = await Review.findOne({ user: userId, product: productId });
      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      }

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
        _id: new mongoose.Types.ObjectId().toString(),
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
