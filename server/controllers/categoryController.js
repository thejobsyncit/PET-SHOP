import Category from '../models/Category.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
import mongoose from 'mongoose';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { petType } = req.query;
    
    if (isDbConnected()) {
      const filter = petType ? { petType } : {};
      const categories = await Category.find(filter);
      res.json({ success: true, categories });
    } else {
      let categories = readMockData('categories');
      if (petType) {
        categories = categories.filter(c => c.petType === petType);
      }
      res.json({ success: true, categories });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, description, image, petType, subcategories } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    if (isDbConnected()) {
      const category = new Category({
        name,
        slug,
        description,
        image,
        petType,
        subcategories: subcategories || []
      });
      const saved = await category.save();
      res.status(201).json({ success: true, category: saved });
    } else {
      const categories = readMockData('categories');
      const newCategory = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        slug,
        description,
        image,
        petType,
        subcategories: subcategories || [],
        createdAt: new Date().toISOString()
      };
      categories.push(newCategory);
      writeMockData('categories', categories);
      res.status(201).json({ success: true, category: newCategory });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
