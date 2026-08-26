import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
  },
  content: {
    type: String,
    required: [true, 'Article content is required'],
  },
  author: {
    type: String,
    required: true,
    default: 'Pawora Editorial Team',
  },
  featuredImage: {
    type: String,
    required: true,
  },
  petType: {
    type: String,
    required: true,
    enum: ['dogs', 'birds', 'reptiles', 'fish', 'general'],
    default: 'general',
  },
  tags: [String],
  readTime: {
    type: String,
    default: '5 min read',
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  faqs: [{
    question: String,
    answer: String
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
export default Blog;
