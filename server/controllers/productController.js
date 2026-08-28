import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

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
    const skip = (pageNum - 1) * limitNum;

    if (isDbConnected()) {
      // 1. MongoDB Implementation
      const query = {};

      if (petType) query.petType = petType;
      if (category) query.category = category;
      if (subcategory) query.subcategory = subcategory;
      
      if (brand) {
        const brandsList = brand.split(',');
        query.brand = { $in: brandsList.map(b => new RegExp('^' + b + '$', 'i')) };
      }

      if (requiresPrescription !== undefined) {
        query.requiresPrescription = requiresPrescription === 'true';
      }

      if (isFeatured !== undefined) {
        query.isFeatured = isFeatured === 'true';
      }

      if (isBestSeller !== undefined) {
        query.isBestSeller = isBestSeller === 'true';
      }

      if (rating) {
        query.rating = { $gte: parseFloat(rating) };
      }

      // Price Filter (considers discountPrice if present, fallback to price)
      if (minPrice || maxPrice) {
        query.$or = [];
        const minVal = minPrice ? parseFloat(minPrice) : 0;
        const maxVal = maxPrice ? parseFloat(maxPrice) : 999999;
        
        // Match where discountPrice is in range OR (discountPrice is null/undefined AND price is in range)
        query.$or.push({
          discountPrice: { $gte: minVal, $lte: maxVal }
        });
        query.$or.push({
          discountPrice: { $exists: false },
          price: { $gte: minVal, $lte: maxVal }
        });
        query.$or.push({
          discountPrice: null,
          price: { $gte: minVal, $lte: maxVal }
        });
      }

      // Full-text search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build Sorting
      let sortObj = { createdAt: -1 }; // default: newest
      if (sort) {
        switch (sort) {
          case 'price_asc':
            sortObj = { discountPrice: 1, price: 1 };
            break;
          case 'price_desc':
            sortObj = { discountPrice: -1, price: -1 };
            break;
          case 'rating_desc':
            sortObj = { rating: -1 };
            break;
          case 'bestseller':
            sortObj = { isBestSeller: -1, createdAt: -1 };
            break;
          case 'featured':
            sortObj = { isFeatured: -1, createdAt: -1 };
            break;
          case 'date_desc':
          default:
            sortObj = { createdAt: -1 };
            break;
        }
      }

      const total = await Product.countDocuments(query);
      const dbProducts = await Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);

      res.json({
        success: true,
        count: dbProducts.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        products: dbProducts
      });

    } else {
      // 2. Mock JSON Implementation
      let filteredProducts = readMockData('products');

      if (petType) {
        filteredProducts = filteredProducts.filter(p => p.petType === petType);
      }
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (subcategory) {
        filteredProducts = filteredProducts.filter(p => p.subcategory.toLowerCase() === subcategory.toLowerCase());
      }
      if (brand) {
        const brandsList = brand.toLowerCase().split(',');
        filteredProducts = filteredProducts.filter(p => brandsList.includes(p.brand.toLowerCase()));
      }
      if (requiresPrescription !== undefined) {
        const reqPresc = requiresPrescription === 'true';
        filteredProducts = filteredProducts.filter(p => p.requiresPrescription === reqPresc);
      }
      if (isFeatured !== undefined) {
        const reqFeatured = isFeatured === 'true';
        filteredProducts = filteredProducts.filter(p => p.isFeatured === reqFeatured);
      }
      if (isBestSeller !== undefined) {
        const reqBest = isBestSeller === 'true';
        filteredProducts = filteredProducts.filter(p => p.isBestSeller === reqBest);
      }
      if (rating) {
        const rateVal = parseFloat(rating);
        filteredProducts = filteredProducts.filter(p => p.rating >= rateVal);
      }
      if (minPrice || maxPrice) {
        const minVal = minPrice ? parseFloat(minPrice) : 0;
        const maxVal = maxPrice ? parseFloat(maxPrice) : 999999;
        filteredProducts = filteredProducts.filter(p => {
          const effectivePrice = p.discountPrice !== undefined && p.discountPrice !== null ? p.discountPrice : p.price;
          return effectivePrice >= minVal && effectivePrice <= maxVal;
        });
      }
      if (search) {
        const term = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      }

      // Sort JSON Products
      filteredProducts.sort((a, b) => {
        const getEffectivePrice = (p) => p.discountPrice !== undefined && p.discountPrice !== null ? p.discountPrice : p.price;
        if (sort === 'price_asc') {
          return getEffectivePrice(a) - getEffectivePrice(b);
        } else if (sort === 'price_desc') {
          return getEffectivePrice(b) - getEffectivePrice(a);
        } else if (sort === 'rating_desc') {
          return b.rating - a.rating;
        } else if (sort === 'bestseller') {
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        } else if (sort === 'featured') {
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        } else {
          // Default: date_desc (newest)
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      const total = filteredProducts.length;
      const paginatedProducts = filteredProducts.slice(skip, skip + limitNum);

      res.json({
        success: true,
        count: paginatedProducts.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        products: paginatedProducts
      });
    }
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

    if (isDbConnected()) {
      const product = await Product.findOne({ slug });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, product });
    } else {
      const productsList = readMockData('products');
      const product = productsList.find(p => p.slug === slug);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, product });
    }
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

    if (isDbConnected()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, product });
    } else {
      const productsList = readMockData('products');
      const product = productsList.find(p => p._id.toString() === id.toString());
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    name,
    brand,
    sku,
    description,
    longDescription,
    ingredients,
    specifications,
    price,
    discountPrice,
    stock,
    images,
    category,
    subcategory,
    petType,
    isFeatured,
    isBestSeller,
    requiresPrescription
  } = req.body;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
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
        _id: new mongoose.Types.ObjectId().toString(),
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

      productsList.push(newProduct);
      writeMockData('products', productsList);
      res.status(201).json({ success: true, product: newProduct });
    }
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

  try {
    if (isDbConnected()) {
      const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, product });
    } else {
      const productsList = readMockData('products');
      const idx = productsList.findIndex(p => p._id.toString() === id.toString());
      if (idx !== -1) {
        // Calculate discount percentage if price changed
        const p = parseFloat(updates.price !== undefined ? updates.price : productsList[idx].price);
        const dp = updates.discountPrice !== undefined ? parseFloat(updates.discountPrice) : productsList[idx].discountPrice;
        let discountPercentage = 0;
        if (dp && p > 0) {
          discountPercentage = Math.round(((p - dp) / p) * 100);
        }

        productsList[idx] = {
          ...productsList[idx],
          ...updates,
          price: updates.price !== undefined ? parseFloat(updates.price) : productsList[idx].price,
          discountPrice: updates.discountPrice !== undefined ? (updates.discountPrice ? parseFloat(updates.discountPrice) : undefined) : productsList[idx].discountPrice,
          discountPercentage,
          stock: updates.stock !== undefined ? parseInt(updates.stock) : productsList[idx].stock,
          isFeatured: updates.isFeatured !== undefined ? updates.isFeatured : productsList[idx].isFeatured,
          isBestSeller: updates.isBestSeller !== undefined ? updates.isBestSeller : productsList[idx].isBestSeller,
          requiresPrescription: updates.requiresPrescription !== undefined ? updates.requiresPrescription : productsList[idx].requiresPrescription
        };

        writeMockData('products', productsList);
        res.json({ success: true, product: productsList[idx] });
      } else {
        res.status(404).json({ success: false, message: 'Product not found' });
      }
    }
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
    if (isDbConnected()) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      let productsList = readMockData('products');
      const exists = productsList.some(p => p._id.toString() === id.toString());
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      productsList = productsList.filter(p => p._id.toString() !== id.toString());
      writeMockData('products', productsList);
      res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
