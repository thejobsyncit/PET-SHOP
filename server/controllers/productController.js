import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

export const loadDiskProducts = () => {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const content = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[DiskProducts] Error reading products.json:', err?.message);
  }
  return [];
};

export const saveDiskProducts = (products) => {
  try {
    const dir = path.dirname(PRODUCTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DiskProducts] Error saving products.json:', err?.message);
  }
};

// High-Performance In-Memory Cache (reduces round-trip Supabase latency from 3500ms down to ~2ms)
const productCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export const clearProductCache = () => {
  productCache.clear();
};

export const normalizeProduct = (p) => {
  if (!p) return null;
  const price = Number(p.price) || 0;
  const discountPrice = p.discount_price !== null && p.discount_price !== undefined 
    ? Number(p.discount_price) 
    : (p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null);
  const discountPercentage = p.discount_percentage !== undefined 
    ? Number(p.discount_percentage) 
    : (discountPrice && price > discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0);

  return {
    ...p,
    _id: p.id || p._id,
    id: p.id || p._id,
    price,
    discountPrice,
    discountPercentage,
    isBestSeller: p.is_bestseller ?? p.isBestSeller ?? false,
    isFeatured: p.is_featured ?? p.isFeatured ?? false,
    requiresPrescription: p.requires_prescription ?? p.requiresPrescription ?? false,
    petType: p.pet_type ?? p.petType,
  };
};

// @desc    Get all products (with search, filter, sorting, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cached = productCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.json(cached.data);
    }

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
    
    let finalProducts = [];
    if (!error && Array.isArray(dbProducts)) {
      finalProducts = dbProducts.map(normalizeProduct);
    }

    // Merge any products from disk (e.g. newly added by Product Sellers)
    const disk = loadDiskProducts();
    if (Array.isArray(disk) && disk.length > 0) {
      const existingIds = new Set(finalProducts.map(p => String(p.id || p._id)));
      const existingSlugs = new Set(finalProducts.map(p => p.slug));
      
      let extra = disk.filter(p => !existingIds.has(String(p.id || p._id)) && !existingSlugs.has(p.slug));
      
      // Apply basic filter to extra disk products if requested
      if (petType) extra = extra.filter(p => (p.petType || p.pet_type) === petType);
      if (category) extra = extra.filter(p => (p.category || '').toLowerCase().includes(category.toLowerCase()));
      if (search) extra = extra.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase()));

      finalProducts = [...extra.map(normalizeProduct), ...finalProducts];
    }

    const totalCount = (total || 0) + (finalProducts.length > (dbProducts?.length || 0) ? (finalProducts.length - (dbProducts?.length || 0)) : 0);

    const payload = {
      success: true,
      count: finalProducts.length,
      total: totalCount || finalProducts.length,
      page: pageNum,
      pages: Math.ceil((totalCount || finalProducts.length) / limitNum) || 1,
      products: finalProducts
    };

    productCache.set(cacheKey, { timestamp: Date.now(), data: payload });
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    res.json(payload);

  } catch (error) {
    console.warn('[GetProducts] Supabase notice, falling back to disk products:', error?.message);
    const disk = loadDiskProducts();
    res.json({
      success: true,
      count: disk.length,
      total: disk.length,
      page: 1,
      pages: 1,
      products: disk.map(normalizeProduct)
    });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let product = null;

    if (supabase) {
      try {
        let { data: pFromDb, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
        if (!error && pFromDb) product = pFromDb;
        if (!product) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
          if (isUUID) {
            const { data: pById } = await supabase.from('products').select('*').eq('id', slug).maybeSingle();
            if (pById) product = pById;
          }
        }
      } catch (_) {}
    }

    // Fallback: check disk products.json
    if (!product) {
      const disk = loadDiskProducts();
      product = disk.find(p => p.slug === slug || (p.id || p._id) === slug);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: normalizeProduct(product) });
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
    let product = null;

    if (supabase) {
      try {
        const { data: pFromDb } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
        if (pFromDb) product = pFromDb;
      } catch (_) {}
    }

    if (!product) {
      const disk = loadDiskProducts();
      product = disk.find(p => (p.id || p._id) === id || p.slug === id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: normalizeProduct(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product (Admin or Product Seller)
// @route   POST /api/products
// @access  Private/Admin/ProductSeller
export const createProduct = async (req, res) => {
  try {
    const {
    name, brand, sku, description, longDescription, ingredients, specifications,
    price, discountPrice, stock, images, category, subcategory, petType,
    isFeatured, isBestSeller, requiresPrescription, sellerId, sellerName
  } = req.body;

  if (!name || price === undefined || price === null || price === '') {
    return res.status(400).json({ success: false, message: 'Product name and price are required.' });
  }

  const generatedId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const baseSlug = (name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  const resolvedSellerId = sellerId || req.user?._id || req.user?.id || 'seller_prod';
  const resolvedSellerName = sellerName || req.user?.businessName || req.user?.name || 'Verified Product Seller';

  const productObj = {
    _id: generatedId,
    id: generatedId,
    name: name.trim(),
    slug,
    brand: (brand || 'Josh Pets Hub').trim(),
    sku: sku || `SKU-${Date.now().toString().slice(-6).toUpperCase()}`,
    description: description || '',
    long_description: longDescription || description || '',
    longDescription: longDescription || description || '',
    ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? [ingredients] : []),
    specifications: Array.isArray(specifications) ? specifications : [],
    price: Number(price) || 0,
    discount_price: discountPrice ? Number(discountPrice) : null,
    discountPrice: discountPrice ? Number(discountPrice) : null,
    stock: stock !== undefined && stock !== null && stock !== '' ? Number(stock) : 15,
    images: Array.isArray(images) && images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800'],
    category: category || 'Dog Food',
    subcategory: subcategory || category || 'Dog Food',
    pet_type: (petType || 'dogs').toLowerCase(),
    petType: (petType || 'dogs').toLowerCase(),
    is_featured: Boolean(isFeatured),
    isFeatured: Boolean(isFeatured),
    is_bestseller: Boolean(isBestSeller),
    isBestSeller: Boolean(isBestSeller),
    requires_prescription: Boolean(requiresPrescription),
    requiresPrescription: Boolean(requiresPrescription),
    seller_id: resolvedSellerId,
    seller_name: resolvedSellerName,
    sellerId: resolvedSellerId,
    sellerName: resolvedSellerName,
    ratings: 5.0,
    rating: 5.0,
    review_count: 0,
    reviewCount: 0,
    created_at: new Date().toISOString()
  };

  let savedProduct = productObj;

  // 1. Try Supabase
  if (supabase) {
    try {
      const { data: newDbProduct, error: sbError } = await supabase.from('products').insert([{
        name: productObj.name,
        slug: productObj.slug,
        brand: productObj.brand,
        sku: productObj.sku,
        description: productObj.description,
        long_description: productObj.long_description,
        ingredients: productObj.ingredients,
        specifications: productObj.specifications,
        price: productObj.price,
        discount_price: productObj.discount_price,
        stock: productObj.stock,
        images: productObj.images,
        category: productObj.category,
        subcategory: productObj.subcategory,
        pet_type: productObj.pet_type,
        is_featured: productObj.is_featured,
        is_bestseller: productObj.is_bestseller,
        requires_prescription: productObj.requires_prescription
      }]).select().maybeSingle();

      if (!sbError && newDbProduct) {
        savedProduct = { ...productObj, ...newDbProduct, id: newDbProduct.id || productObj.id, _id: newDbProduct.id || productObj._id };
      }
    } catch (err) {
      console.warn('[CreateProduct] Supabase insert warning, persisting to disk fallback:', err?.message);
    }
  }

  // 2. Persist to disk products.json
  const diskProducts = loadDiskProducts();
  diskProducts.unshift(savedProduct);
  saveDiskProducts(diskProducts);

  clearProductCache();
  return res.status(201).json({
    success: true,
    product: normalizeProduct(savedProduct),
    message: '🎉 Product posted successfully! It is now live in the Shop.'
  });
} catch (error) {
  return res.status(500).json({ success: false, message: error.message });
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
    clearProductCache();
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
    clearProductCache();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
