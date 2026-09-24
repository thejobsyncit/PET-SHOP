<<<<<<< HEAD
import Category from '../models/Category.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { petType } = req.query;
    
    let query = supabase.from('categories').select('*');
    if (petType) {
      query = query.eq('pet_type', petType);
    }
    
    const { data: categories, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, categories: categories || [] });
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
<<<<<<< HEAD
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
        _id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
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
=======
    const { data: newCategory, error } = await supabase.from('categories').insert([{
      name,
      slug,
      description,
      image,
      pet_type: petType,
      subcategories: subcategories || []
    }]).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, category: newCategory });
>>>>>>> origin/main
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
