import { supabase } from '../config/supabase.js';

// In-Memory Cache for Categories (5 min TTL)
const categoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export const clearCategoryCache = () => {
  categoryCache.clear();
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { petType } = req.query;
    const cacheKey = petType || 'all';
    const cached = categoryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.json(cached.data);
    }
    
    let query = supabase.from('categories').select('*');
    if (petType) {
      query = query.eq('pet_type', petType);
    }
    
    const { data: categories, error } = await query;
    if (error) throw error;
    
    const payload = { success: true, categories: categories || [] };
    categoryCache.set(cacheKey, { timestamp: Date.now(), data: payload });
    res.json(payload);
  } catch (error) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const raw = fs.readFileSync(path.resolve('server/data/categories.json'), 'utf8');
      let localCategories = JSON.parse(raw);
      if (req.query.petType) {
        localCategories = localCategories.filter(c => c.petType === req.query.petType);
      }
      return res.json({ success: true, categories: localCategories });
    } catch {
      res.status(500).json({ success: false, message: error.message });
    }
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
