import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProductReviewStatsMap } from '../services/reviewStatsService.js';

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

let diskProductsMap = null;
const getDiskProductsMap = () => {
  if (!diskProductsMap) {
    diskProductsMap = new Map();
    const diskList = loadDiskProducts();
    diskList.forEach(dp => {
      if (dp.slug) diskProductsMap.set(dp.slug.toLowerCase(), dp);
      if (dp.id) diskProductsMap.set(String(dp.id).toLowerCase(), dp);
      if (dp._id) diskProductsMap.set(String(dp._id).toLowerCase(), dp);
      if (dp.name) diskProductsMap.set(dp.name.toLowerCase().trim(), dp);
    });
  }
  return diskProductsMap;
};

export const normalizeProduct = (p, statsMap = null) => {
  if (!p) return null;
  const price = Number(p.price) || 0;
  const discountPrice = p.discount_price !== null && p.discount_price !== undefined 
    ? Number(p.discount_price) 
    : (p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null);
  const discountPercentage = p.discount_percentage !== undefined 
    ? Number(p.discount_percentage) 
    : (discountPrice && price > discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0);

  const pId = String(p.id || p._id || '').trim().toLowerCase();
  const pSlug = String(p.slug || '').trim().toLowerCase();

  let reviewCount = typeof p.reviewCount === 'number' 
    ? p.reviewCount 
    : (typeof p.review_count === 'number' 
        ? p.review_count 
        : (typeof p.numReviews === 'number' 
            ? p.numReviews 
            : (typeof p.num_reviews === 'number' ? p.num_reviews : 0)));
  let rating = Number(p.rating !== undefined ? p.rating : (p.ratings !== undefined ? p.ratings : 0)) || 0;

  if (statsMap) {
    const stat = (pId && statsMap.get(pId)) || (pSlug && statsMap.get(pSlug));
    if (stat) {
      reviewCount = stat.reviewCount;
      if (stat.reviewCount > 0) {
        rating = stat.rating;
      }
    } else {
      reviewCount = 0;
    }
  }

  // Lookup disk fallback for rich specifications and ingredients if missing from DB
  const diskMap = getDiskProductsMap();
  const diskFallback = (pSlug && diskMap.get(pSlug)) || (pId && diskMap.get(pId)) || (p.name && diskMap.get(p.name.toLowerCase().trim())) || null;

  let specifications = [];
  if (Array.isArray(p.specifications) && p.specifications.length > 0) {
    specifications = p.specifications;
  } else if (diskFallback && Array.isArray(diskFallback.specifications)) {
    specifications = diskFallback.specifications;
  } else if (typeof p.specifications === 'string') {
    try {
      const parsed = JSON.parse(p.specifications);
      if (Array.isArray(parsed)) specifications = parsed;
    } catch (_) {}
  }

  let ingredients = [];
  if (Array.isArray(p.ingredients) && p.ingredients.length > 0) {
    ingredients = p.ingredients;
  } else if (diskFallback && Array.isArray(diskFallback.ingredients)) {
    ingredients = diskFallback.ingredients;
  } else if (typeof p.ingredients === 'string') {
    try {
      const parsed = JSON.parse(p.ingredients);
      if (Array.isArray(parsed)) ingredients = parsed;
      else ingredients = p.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    } catch (_) {
      ingredients = p.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  let images = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images;
  } else if (typeof p.images === 'string') {
    try {
      const parsed = JSON.parse(p.images);
      if (Array.isArray(parsed)) images = parsed;
    } catch (_) {}
  }
  if (images.length === 0 && p.image) {
    images = [p.image];
  }
  if (images.length === 0 && diskFallback) {
    images = Array.isArray(diskFallback.images) ? diskFallback.images : (diskFallback.image ? [diskFallback.image] : []);
  }

  const longDescription = p.longDescription || p.long_description || (diskFallback && diskFallback.longDescription) || p.description || '';

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
    petType: p.pet_type ?? p.petType ?? 'dogs',
    rating,
    ratings: rating,
    reviewCount,
    review_count: reviewCount,
    numReviews: reviewCount,
    specifications,
    ingredients,
    images,
    image: images[0] || p.image || '',
    longDescription,
    description: p.description || longDescription
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
      pharmacyPet,
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

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 12);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const statsMap = getProductReviewStatsMap();

    // 1. Fetch DB products from Supabase
    let dbProducts = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && Array.isArray(data)) {
          dbProducts = data;
        }
      } catch (sbErr) {
        console.warn('[GetProducts] Supabase select warning:', sbErr?.message);
      }
    }

    // 2. Fetch disk products and merge/deduplicate with DB products
    const disk = loadDiskProducts();
    const existingIds = new Set(dbProducts.map(p => String(p.id || p._id).toLowerCase()));
    const existingSlugs = new Set(dbProducts.map(p => String(p.slug || '').toLowerCase()));

    const uniqueDisk = (Array.isArray(disk) ? disk : []).filter(p => {
      const pId = String(p.id || p._id || '').toLowerCase();
      const pSlug = String(p.slug || '').toLowerCase();
      return (!pId || !existingIds.has(pId)) && (!pSlug || !existingSlugs.has(pSlug));
    });

    const allRawProducts = [...dbProducts, ...uniqueDisk];
    let allNormalized = allRawProducts.map(p => normalizeProduct(p, statsMap));

    const normalizePet = (val) => {
      const v = String(val || '').toLowerCase().trim();
      if (v.startsWith('dog')) return 'dogs';
      if (v.startsWith('cat')) return 'cats';
      if (v.startsWith('bird')) return 'birds';
      if (v.startsWith('reptile')) return 'reptiles';
      if (v.startsWith('fish') || v.startsWith('aquat')) return 'fish';
      if (v.startsWith('pharm')) return 'pharmacy';
      return v;
    };

    const matchSubcategory = (p, targetSub, targetPet) => {
      if (!targetSub) return true;
      const t = targetSub.toLowerCase().trim();
      const pSub = String(p.subcategory || p.subCategory || '').toLowerCase().trim();
      const pCat = String(p.category || '').toLowerCase().trim();
      const pName = String(p.name || '').toLowerCase().trim();
      const pPet = normalizePet(p.petType || p.pet_type);

      // Species-specific food subcategories
      if (t === 'dog food' || (t.includes('food') && (targetPet === 'dogs' || pPet === 'dogs'))) {
        return (pPet === 'dogs' || !pPet) && (pSub.includes('food') || pCat.includes('food') || pName.includes('food'));
      }
      if (t === 'cat food' || (t.includes('food') && (targetPet === 'cats' || pPet === 'cats'))) {
        return (pPet === 'cats' || !pPet) && (pSub.includes('food') || pCat.includes('food') || pName.includes('food'));
      }
      if (t === 'bird food' || (t.includes('food') && (targetPet === 'birds' || pPet === 'birds'))) {
        return (pPet === 'birds' || !pPet) && (pSub.includes('food') || pCat.includes('food') || pSub.includes('seed') || pName.includes('seed') || pName.includes('food') || pName.includes('blend')) && !pName.includes('feeder');
      }
      if (t === 'reptile food' || (t.includes('food') && (targetPet === 'reptiles' || pPet === 'reptiles'))) {
        return (pPet === 'reptiles' || !pPet) && (pSub.includes('food') || pCat.includes('food') || pName.includes('food'));
      }
      if (t === 'fish food' || (t.includes('food') && (targetPet === 'fish' || pPet === 'fish'))) {
        return (pPet === 'fish' || !pPet) && (pSub.includes('food') || pCat.includes('food') || pSub.includes('pellet') || pName.includes('pellet') || pName.includes('food'));
      }

      // Treats
      if (t === 'treats') {
        return pSub.includes('treat') || pName.includes('treat') || pName.includes('dentastix') || pName.includes('chew') || pName.includes('biscuit') || pName.includes('me-o');
      }

      // Beds, cotes, scratchers, terrariums, cages, aquariums
      if (t.includes('beds') || t.includes('cotes') || t.includes('scratchers') || t.includes('terrariums') || t.includes('cages') || t.includes('aquariums') || t.includes('tanks')) {
        return pSub.includes('bed') || pSub.includes('cote') || pSub.includes('scratcher') || pSub.includes('cage') || pSub.includes('terrarium') || pSub.includes('aquarium') || pSub.includes('tank') || pCat.includes('bed') || pCat.includes('terrarium') || pCat.includes('cage') || pCat.includes('aquarium') || pName.includes('bed') || pName.includes('tree') || pName.includes('tower') || pName.includes('terrarium') || pName.includes('cage') || pName.includes('aquarium');
      }

      // Collars & leashes
      if (t.includes('collars') || t.includes('leashes') || t.includes('leash')) {
        return pSub.includes('collar') || pSub.includes('leash') || pSub.includes('harness') || pCat.includes('collar') || pCat.includes('leash') || pName.includes('collar') || pName.includes('leash');
      }

      // Supplements & Vitamins
      if (t.includes('supplement') || t.includes('vitamins') || t.includes('calcium')) {
        return pSub.includes('supplement') || pSub.includes('calcium') || pSub.includes('vitamin') || pSub.includes('tonic') || pSub.includes('mineral') || pCat.includes('supplement') || pCat.includes('vitamin') || pName.includes('supplement') || pName.includes('tonic') || pName.includes('furglow') || pName.includes('calcium') || pName.includes('drops') || pName.includes('himcal');
      }

      // First Aid & Healthcare
      if (t.includes('first aid') || t.includes('healthcare')) {
        return pSub.includes('first aid') || pCat.includes('first aid') || pName.includes('first aid') || pName.includes('wound') || pName.includes('kit');
      }

      // Skin Care
      if (t.includes('skin care') || t.includes('skin')) {
        return pSub.includes('skin') || pCat.includes('skin') || pName.includes('ichmune') || pName.includes('prednisolone') || pName.includes('cephavet');
      }

      // Joint Care
      if (t.includes('joint care') || t.includes('joint')) {
        return pSub.includes('joint') || pCat.includes('joint') || pName.includes('joint') || pName.includes('melonex');
      }

      // Digestive Care
      if (t.includes('digestive')) {
        return pSub.includes('digestive') || pCat.includes('digestive') || pName.includes('digyton') || pName.includes('digestive');
      }

      // Perches & Toys
      if (t.includes('perch')) return pSub.includes('perch') || pName.includes('perch');
      if (t.includes('toy')) return pSub.includes('toy') || pName.includes('toy') || pName.includes('chew') || pName.includes('puzzle');

      // Heating & Lighting
      if (t.includes('heating') || t.includes('lighting') || t.includes('light')) {
        return pSub.includes('heat') || pSub.includes('uvb') || pSub.includes('light') || pCat.includes('heat') || pCat.includes('light') || pName.includes('heat') || pName.includes('emitter') || pName.includes('bulb') || pName.includes('light') || pName.includes('led');
      }

      // Water Care & Filtration
      if (t.includes('water care') || t.includes('filtration')) {
        return pSub.includes('filter') || pSub.includes('conditioner') || pSub.includes('water') || pName.includes('filter') || pName.includes('stress coat') || pName.includes('conditioner');
      }

      // Plants & Décor
      if (t.includes('plant') || t.includes('décor') || t.includes('decor')) {
        return pSub.includes('plant') || pSub.includes('decor') || pSub.includes('décor') || pCat.includes('decor') || pName.includes('plant') || pName.includes('anubias') || pName.includes('driftwood') || pName.includes('vine');
      }

      // Other Accessories
      if (t.includes('other accessories') || t.includes('accessories')) {
        const isSpecialty = pSub.includes('food') || pSub.includes('treat') || pSub.includes('bed') || pSub.includes('terrarium') || pSub.includes('cage') || pSub.includes('aquarium') || pSub.includes('supplement') || pSub.includes('joint') || pSub.includes('skin') || pSub.includes('digestive');
        return (!isSpecialty && (pSub.includes('accessory') || pSub.includes('feeder') || pSub.includes('bowl') || pSub.includes('groom') || pSub.includes('shampoo') || pSub.includes('toy') || pSub.includes('wand') || pSub.includes('mouse') || pSub.includes('heater') || pSub.includes('pump') || pSub.includes('substrate') || pSub.includes('thermometer') || pSub.includes('spray') || pCat.includes('access'))) || pName.includes('feeder') || pName.includes('bowl') || pName.includes('shampoo') || pName.includes('toy') || pName.includes('wand') || pName.includes('spray') || pName.includes('heater') || pName.includes('thermometer') || pName.includes('kit');
      }

      return (pSub && (pSub === t || pSub.includes(t) || t.includes(pSub))) || 
             (pCat && (pCat === t || pCat.includes(t) || t.includes(pCat)));
    };

    // 3. Apply Filtering across entire catalog
    let filtered = allNormalized.filter(p => {
      // 1. Department / Pet Type
      if (petType && petType !== 'all') {
        const pPet = normalizePet(p.petType || p.pet_type);
        const targetPet = normalizePet(petType);
        if (pPet && pPet !== targetPet) return false;
      }

      // 2. Pharmacy Pet Sub-Filter
      if (petType === 'pharmacy' && pharmacyPet && pharmacyPet !== 'all') {
        const target = pharmacyPet.toLowerCase().trim();
        const pTarget = String(p.targetPet || p.petType || p.pet_type || p.category || p.subcategory || p.name || p.description || p.longDescription || '').toLowerCase();
        const isUniversal = pTarget.includes('all pet') || pTarget.includes('dog and cat') || pTarget.includes('dogs & cats');
        if (!pTarget.includes(target) && !isUniversal) return false;
      }

      // 3. Category Filter
      if (category) {
        const pCat = String(p.category || '').toLowerCase().trim();
        const pSub = String(p.subcategory || '').toLowerCase().trim();
        const targetCat = category.toLowerCase().trim();
        if (!pCat.includes(targetCat) && !pSub.includes(targetCat) && !targetCat.includes(pCat)) return false;
      }

      // 4. Subcategory Filter
      if (subcategory) {
        if (!matchSubcategory(p, subcategory, normalizePet(petType))) return false;
      }

      // 5. Brand Filter
      if (brand) {
        const targetBrands = brand.split(',').map(b => b.trim().toLowerCase()).filter(Boolean);
        const pBrand = String(p.brand || '').trim().toLowerCase();
        if (targetBrands.length > 0) {
          const matchesBrand = targetBrands.some(b => 
            pBrand && (pBrand === b || pBrand.includes(b) || b.includes(pBrand))
          );
          if (!matchesBrand) return false;
        }
      }

      // 6. Requires Prescription Filter
      if (requiresPrescription !== undefined && requiresPrescription !== '') {
        const isRx = Boolean(p.requiresPrescription ?? p.requires_prescription);
        if (requiresPrescription === 'true' && !isRx) return false;
      }

      if (isFeatured !== undefined && isFeatured !== '') {
        const isFeat = Boolean(p.isFeatured ?? p.is_featured);
        if (isFeat !== (isFeatured === 'true')) return false;
      }

      if (isBestSeller !== undefined && isBestSeller !== '') {
        const isBest = Boolean(p.isBestSeller ?? p.is_bestseller);
        if (isBest !== (isBestSeller === 'true')) return false;
      }

      // 7. Ratings Filter
      if (rating !== undefined && rating !== null && rating !== '') {
        const minRating = parseFloat(rating);
        const pRating = Number(p.rating ?? p.ratings ?? 0);
        if (!isNaN(minRating) && pRating < minRating) return false;
      }

      // 8. Price Range Filter
      const dPrice = Number(p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice : p.discount_price);
      const regularPrice = Number(p.price) || 0;
      const effectivePrice = (!isNaN(dPrice) && dPrice > 0 && dPrice < regularPrice) ? dPrice : regularPrice;

      if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
        const min = parseFloat(minPrice);
        if (!isNaN(min) && effectivePrice < min) return false;
      }
      if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
        const max = parseFloat(maxPrice);
        if (!isNaN(max) && effectivePrice > max) return false;
      }

      // 9. Search Query Filter
      if (search) {
        const q = String(search).trim().toLowerCase();
        if (q) {
          const nameMatch = (p.name || '').toLowerCase().includes(q);
          const brandMatch = (p.brand || '').toLowerCase().includes(q);
          const descMatch = (p.description || '').toLowerCase().includes(q);
          const catMatch = (p.category || '').toLowerCase().includes(q);
          const subMatch = (p.subcategory || '').toLowerCase().includes(q);
          if (!nameMatch && !brandMatch && !descMatch && !catMatch && !subMatch) return false;
        }
      }

      return true;
    });

    // 4. Apply Sorting
    const getEffectivePrice = (p) => {
      const d = Number(p.discountPrice ?? p.discount_price);
      const pr = Number(p.price) || 0;
      return (!isNaN(d) && d > 0 && d < pr) ? d : pr;
    };

    const getRating = (p) => Number(p.rating ?? p.ratings ?? 0);
    const getReviewCount = (p) => Number(p.reviewCount ?? p.review_count ?? p.numReviews ?? 0);

    const sortType = sort || 'date_desc';

    switch (sortType) {
      case 'price_asc':
        filtered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case 'price_desc':
        filtered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case 'rating_desc':
        filtered.sort((a, b) => {
          const rDiff = getRating(b) - getRating(a);
          if (Math.abs(rDiff) > 0.01) return rDiff;
          return getReviewCount(b) - getReviewCount(a);
        });
        break;
      case 'bestseller':
        filtered.sort((a, b) => {
          const bA = (a.isBestSeller ?? a.is_bestseller) ? 1 : 0;
          const bB = (b.isBestSeller ?? b.is_bestseller) ? 1 : 0;
          if (bA !== bB) return bB - bA;
          return getRating(b) - getRating(a);
        });
        break;
      case 'featured':
        filtered.sort((a, b) => {
          const fA = (a.isFeatured ?? a.is_featured) ? 1 : 0;
          const fB = (b.isFeatured ?? b.is_featured) ? 1 : 0;
          if (fA !== fB) return fB - fA;
          return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
        });
        break;
      case 'date_desc':
      default:
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          if (dateA && dateB && dateA !== dateB) return dateB - dateA;
          return String(b.id || b._id || '').localeCompare(String(a.id || a._id || ''));
        });
        break;
    }

    // 5. Paginate
    const totalCount = filtered.length;
    const paginatedProducts = filtered.slice(from, to + 1);

    const payload = {
      success: true,
      count: paginatedProducts.length,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum) || 1,
      products: paginatedProducts
    };

    productCache.set(cacheKey, { timestamp: Date.now(), data: payload });
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    res.json(payload);

  } catch (error) {
    console.warn('[GetProducts] Controller fallback notice:', error?.message);
    const disk = loadDiskProducts();
    const statsMap = getProductReviewStatsMap();
    const normalized = disk.map(p => normalizeProduct(p, statsMap));
    res.json({
      success: true,
      count: normalized.length,
      total: normalized.length,
      page: 1,
      pages: 1,
      products: normalized
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
    const statsMap = getProductReviewStatsMap();
    res.json({ success: true, product: normalizeProduct(product, statsMap) });
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
    const statsMap = getProductReviewStatsMap();
    res.json({ success: true, product: normalizeProduct(product, statsMap) });
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
