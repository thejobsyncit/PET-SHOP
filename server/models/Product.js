import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Short description is required'],
  },
  longDescription: {
    type: String,
    required: [true, 'Detailed description is required'],
  },
  ingredients: [String],
  specifications: [{
    label: String,
    value: String
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  discountPrice: {
    type: Number,
    min: 0,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
  },
  petType: {
    type: String,
    required: [true, 'Pet type is required'],
    enum: ['dogs', 'birds', 'reptiles', 'fish', 'pharmacy'],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isBestSeller: {
    type: Boolean,
    default: false,
  },
  requiresPrescription: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Calculate discount percentage before save
ProductSchema.pre('save', function (next) {
  if (this.discountPrice && this.price > 0) {
    this.discountPercentage = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  } else {
    this.discountPercentage = 0;
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
