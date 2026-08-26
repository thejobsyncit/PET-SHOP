import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  petType: {
    type: String,
    required: true,
    enum: ['dogs', 'birds', 'reptiles', 'fish', 'pharmacy'],
  },
  subcategories: [{
    type: String,
  }],
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export default Category;
