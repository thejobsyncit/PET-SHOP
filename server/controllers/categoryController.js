import { supabase } from '../config/supabase.js';

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
