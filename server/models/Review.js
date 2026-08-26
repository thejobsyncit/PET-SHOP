import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
  },
  comment: {
    type: String,
    required: [true, 'Review body text is required'],
  },
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;
