<<<<<<< HEAD
import Product from '../models/Product.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

// @desc    Get all products (with search, filter, sorting, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      petType,
      category,
      subcategory,
      brand,
      search,
      minPrice,
      maxPrice,
      rating,
      requiresPrescription,
      isFeatured,
      isBestSeller,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (petType) query = query.eq('pet_type', petType);
    if (category) query = query.ilike('category', category);
    if (subcategory) query = query.ilike('subcategory', subcategory);
    
    if (brand) {
      const brandsList = brand.split(',').map(b => b.trim());
      query = query.in('brand', brandsList);
    }

    if (requiresPrescription !== undefined) {
      query = query.eq('requires_prescription', requiresPrescription === 'true');
    }

    if (isFeatured !== undefined) {
      query = query.eq('is_featured', isFeatured === 'true');
    }

    if (isBestSeller !== undefined) {
      query = query.eq('is_bestseller', isBestSeller === 'true');
    }

    if (rating) {
      query = query.gte('ratings', parseFloat(rating));
    }

    if (minPrice || maxPrice) {
      const minVal = minPrice ? parseFloat(minPrice) : 0;
      const maxVal = maxPrice ? parseFloat(maxPrice) : 999999;
      // Approximate filter using just price for now
      query = query.gte('price', minVal).lte('price', maxVal);
    }

    if (search) {
      const term = String(search).trim();
      if (term) {
        query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`);
      }
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating_desc':
          query = query.order('ratings', { ascending: false });
          break;
        case 'bestseller':
          query = query.order('is_bestseller', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'date_desc':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data: dbProducts, count: total, error } = await query;
    
    if (error) throw error;

    res.json({
      success: true,
      count: dbProducts?.length || 0,
      total: total || 0,
      page: pageNum,
      pages: Math.ceil((total || 0) / limitNum),
      products: dbProducts || []
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data: product, error } = await supabase.from('products').select('*').eq('slug', slug).single();
    if (error) throw error;
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    name, brand, sku, description, longDescription, ingredients, specifications,
    price, discountPrice, stock, images, category, subcategory, petType,
    isFeatured, isBestSeller, requiresPrescription
  } = req.body;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
<<<<<<< HEAD
    if (isDbConnected()) {
      const newProduct = new Product({
        name,
        slug,
        brand,
        sku,
        description,
        longDescription,
        ingredients: ingredients || [],
        specifications: specifications || [],
        price,
        discountPrice,
        stock,
        images,
        category,
        subcategory,
        petType,
        isFeatured: isFeatured || false,
        isBestSeller: isBestSeller || false,
        requiresPrescription: requiresPrescription || false
      });
      const saved = await newProduct.save();
      res.status(201).json({ success: true, product: saved });
    } else {
      const productsList = readMockData('products');
      
      const newProduct = {
        _id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        name,
        slug,
        brand,
        sku,
        description,
        longDescription,
        ingredients: ingredients || [],
        specifications: specifications || [],
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
        discountPercentage: discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0,
        rating: 5.0,
        reviewCount: 0,
        stock: parseInt(stock),
        lowStockThreshold: 5,
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800'],
        category,
        subcategory,
        petType,
        isFeatured: isFeatured || false,
        isBestSeller: isBestSeller || false,
        requiresPrescription: requiresPrescription || false,
        createdAt: new Date().toISOString()
      };
=======
    const { data: newProduct, error } = await supabase.from('products').insert([{
      name, slug, brand, sku, description, long_description: longDescription,
      ingredients: ingredients || [], specifications: specifications || [],
      price, discount_price: discountPrice, stock, images,
      category, subcategory, pet_type: petType,
      is_featured: isFeatured || false,
      is_bestseller: isBestSeller || false,
      requires_prescription: requiresPrescription || false
    }]).select().single();
>>>>>>> origin/main

    if (error) throw error;
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.name) {
    updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  // Map JS casing to DB casing
  const dbUpdates = {};
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'longDescription') dbUpdates.long_description = value;
    else if (key === 'discountPrice') dbUpdates.discount_price = value;
    else if (key === 'petType') dbUpdates.pet_type = value;
    else if (key === 'isFeatured') dbUpdates.is_featured = value;
    else if (key === 'isBestSeller') dbUpdates.is_bestseller = value;
    else if (key === 'requiresPrescription') dbUpdates.requires_prescription = value;
    else dbUpdates[key] = value;
  }

  try {
    const { data: product, error } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
