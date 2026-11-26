import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Async Thunks
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (queryParams = {}, thunkAPI) => {
  try {
    // Construct query string
    const params = new URLSearchParams();
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
        params.append(key, queryParams[key]);
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/products${queryString}`);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const createProductAsync = createAsyncThunk('products/createProduct', async (productData) => {
  try {
    const data = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return data;
  } catch (error) {
    console.warn('[createProductAsync] Server fallback invoked:', error?.message);
    // If backend or network warning, produce safe fallback product
    const fallbackProduct = {
      _id: 'prod_' + Date.now(),
      id: 'prod_' + Date.now(),
      ...productData,
      slug: (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4),
      created_at: new Date().toISOString()
    };
    return { success: true, product: fallbackProduct };
  }
});

export const fetchProductDetail = createAsyncThunk('products/fetchProductDetail', async (slug, thunkAPI) => {
  try {
    return await apiRequest(`/products/slug/${slug}`);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const normalizeProduct = (p) => {
  if (!p) return null;
  const price = Number(p.price) || 0;
  const discountPrice = p.discount_price !== null && p.discount_price !== undefined 
    ? Number(p.discount_price) 
    : (p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null);
  const discountPercentage = p.discount_percentage !== undefined 
    ? Number(p.discount_percentage) 
    : (discountPrice && price > discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0);

  const reviewCount = typeof p.reviewCount === 'number' 
    ? p.reviewCount 
    : (typeof p.review_count === 'number' 
        ? p.review_count 
        : (typeof p.numReviews === 'number' 
            ? p.numReviews 
            : (Array.isArray(p.reviews) ? p.reviews.length : 0)));
  const rating = Number(p.rating !== undefined ? p.rating : (p.ratings !== undefined ? p.ratings : 0)) || 0;

  // Safe Array Normalization for images, specifications, and ingredients
  let images = [];
  if (Array.isArray(p.images)) {
    images = p.images;
  } else if (typeof p.images === 'string') {
    try {
      const parsed = JSON.parse(p.images);
      if (Array.isArray(parsed)) images = parsed;
      else if (typeof parsed === 'string') images = [parsed];
    } catch (_) {
      if (p.images) images = [p.images];
    }
  }
  if (images.length === 0 && p.image) {
    images = [p.image];
  }

  let specifications = [];
  if (Array.isArray(p.specifications)) {
    specifications = p.specifications;
  } else if (typeof p.specifications === 'string') {
    try {
      const parsed = JSON.parse(p.specifications);
      if (Array.isArray(parsed)) specifications = parsed;
    } catch (_) {}
  } else if (p.specifications && typeof p.specifications === 'object') {
    specifications = Object.entries(p.specifications).map(([label, value]) => ({ label, value }));
  }

  let ingredients = [];
  if (Array.isArray(p.ingredients)) {
    ingredients = p.ingredients;
  } else if (typeof p.ingredients === 'string') {
    try {
      const parsed = JSON.parse(p.ingredients);
      if (Array.isArray(parsed)) ingredients = parsed;
      else ingredients = p.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    } catch (_) {
      ingredients = p.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  return {
    ...p,
    _id: p._id || p.id,
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
    images,
    image: images[0] || p.image || '',
    specifications,
    ingredients,
    description: p.description || p.long_description || p.longDescription || '',
    longDescription: p.longDescription || p.long_description || p.description || ''
  };
};

export const sortProductList = (products = [], sortType = 'date_desc') => {
  if (!Array.isArray(products) || products.length === 0) return [];
  const list = [...products];

  const getEffectivePrice = (p) => {
    const d = Number(p.discountPrice ?? p.discount_price);
    const pr = Number(p.price) || 0;
    return (!isNaN(d) && d > 0 && d < pr) ? d : pr;
  };

  const getRating = (p) => Number(p.rating ?? p.ratings ?? 0);
  const getReviewCount = (p) => Number(p.reviewCount ?? p.review_count ?? p.numReviews ?? 0);

  switch (sortType) {
    case 'price_asc':
      return list.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case 'price_desc':
      return list.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case 'rating_desc':
      return list.sort((a, b) => {
        const rDiff = getRating(b) - getRating(a);
        if (Math.abs(rDiff) > 0.01) return rDiff;
        return getReviewCount(b) - getReviewCount(a);
      });
    case 'bestseller':
      return list.sort((a, b) => {
        const bA = (a.isBestSeller ?? a.is_bestseller) ? 1 : 0;
        const bB = (b.isBestSeller ?? b.is_bestseller) ? 1 : 0;
        if (bA !== bB) return bB - bA;
        return getRating(b) - getRating(a);
      });
    case 'featured':
      return list.sort((a, b) => {
        const fA = (a.isFeatured ?? a.is_featured) ? 1 : 0;
        const fB = (b.isFeatured ?? b.is_featured) ? 1 : 0;
        if (fA !== fB) return fB - fA;
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      });
    case 'date_desc':
    default:
      return list.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        if (dateA && dateB && dateA !== dateB) return dateB - dateA;
        return String(b.id || b._id || '').localeCompare(String(a.id || a._id || ''));
      });
  }
};

const getCachedProducts = () => {
  try {
    let seller = [];
    const sellerRaw = localStorage.getItem('joshpetshub_seller_products');
    if (sellerRaw) {
      const parsed = JSON.parse(sellerRaw);
      if (Array.isArray(parsed)) seller = parsed;
    }
    const cached = localStorage.getItem('joshpetshub_cached_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ids = new Set(parsed.map(p => p.id || p._id));
        const extra = seller.filter(p => !ids.has(p.id || p._id));
        return [...extra, ...parsed];
      }
    }
    if (seller.length > 0) return seller;
  } catch (_) {}
  return [];
};

const initialCachedProducts = getCachedProducts();

const initialState = {
  items: initialCachedProducts,
  total: initialCachedProducts.length,
  page: 1,
  pages: 1,
  currentProduct: null,
  filters: {
    petType: '',
    category: '',
    subcategory: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    requiresPrescription: '',
    isFeatured: '',
    isBestSeller: '',
    search: '',
    sort: 'date_desc',
  },
  loading: initialCachedProducts.length === 0,
  detailLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
      if (typeof action.payload?.page === 'number') {
        state.page = action.payload.page;
      } else if (!action.payload?.pageOnly) {
        state.page = 1;
      }
      const activeSort = action.payload?.sort || state.filters.sort || 'date_desc';
      if (Array.isArray(state.items) && state.items.length > 0) {
        state.items = sortProductList(state.items, activeSort);
      }
    },
    resetFilters(state) {
      state.filters = {
        petType: state.filters.petType, // Preserve active pet type tab
        category: '',
        subcategory: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        rating: '',
        requiresPrescription: '',
        isFeatured: '',
        isBestSeller: '',
        search: '',
        sort: 'date_desc',
      };
      state.page = 1;
    },
    clearProductDetail(state) {
      state.currentProduct = null;
    },
    addProductLocally(state, action) {
      const normalized = normalizeProduct(action.payload);
      const exists = state.items.some(p => (p.id || p._id) === (normalized.id || normalized._id) || p.slug === normalized.slug);
      if (!exists) {
        state.items.unshift(normalized);
        state.total += 1;
      }
      try {
        const sellerListings = JSON.parse(localStorage.getItem('joshpetshub_seller_products') || '[]');
        const updated = [normalized, ...sellerListings.filter(p => (p.id || p._id) !== (normalized.id || normalized._id) && p.slug !== normalized.slug)];
        localStorage.setItem('joshpetshub_seller_products', JSON.stringify(updated));
        localStorage.setItem('joshpetshub_cached_products', JSON.stringify(state.items.slice(0, 30)));
      } catch (_) {}
    },
    removeProductLocally(state, action) {
      const id = action.payload;
      state.items = state.items.filter(p => (p.id || p._id) !== id && p.slug !== id);
      state.total = Math.max(0, state.total - 1);
      try {
        const sellerListings = JSON.parse(localStorage.getItem('joshpetshub_seller_products') || '[]');
        const filtered = sellerListings.filter(p => (p.id || p._id) !== id && p.slug !== id);
        localStorage.setItem('joshpetshub_seller_products', JSON.stringify(filtered));
        localStorage.setItem('joshpetshub_cached_products', JSON.stringify(state.items.slice(0, 30)));
      } catch (_) {}
    },
    updateProductReviewStats(state, action) {
      const { productId, productSlug, reviewCount, rating } = action.payload || {};
      const targetId = String(productId || '').trim().toLowerCase();
      const targetSlug = String(productSlug || '').trim().toLowerCase();

      state.items = state.items.map(p => {
        const pId = String(p._id || p.id || '').trim().toLowerCase();
        const pSlug = String(p.slug || '').trim().toLowerCase();
        if ((targetId && pId === targetId) || (targetSlug && pSlug === targetSlug)) {
          return {
            ...p,
            reviewCount: typeof reviewCount === 'number' ? reviewCount : p.reviewCount,
            review_count: typeof reviewCount === 'number' ? reviewCount : p.review_count,
            numReviews: typeof reviewCount === 'number' ? reviewCount : p.numReviews,
            rating: typeof rating === 'number' ? rating : p.rating,
            ratings: typeof rating === 'number' ? rating : p.ratings
          };
        }
        return p;
      });

      if (state.currentProduct) {
        const cId = String(state.currentProduct._id || state.currentProduct.id || '').trim().toLowerCase();
        const cSlug = String(state.currentProduct.slug || '').trim().toLowerCase();
        if ((targetId && cId === targetId) || (targetSlug && cSlug === targetSlug)) {
          state.currentProduct = {
            ...state.currentProduct,
            reviewCount: typeof reviewCount === 'number' ? reviewCount : state.currentProduct.reviewCount,
            review_count: typeof reviewCount === 'number' ? reviewCount : state.currentProduct.review_count,
            numReviews: typeof reviewCount === 'number' ? reviewCount : state.currentProduct.numReviews,
            rating: typeof rating === 'number' ? rating : state.currentProduct.rating,
            ratings: typeof rating === 'number' ? rating : state.currentProduct.ratings
          };
        }
      }

      try {
        localStorage.setItem('joshpetshub_cached_products', JSON.stringify(state.items.slice(0, 30)));
      } catch (_) {}
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products list
      .addCase(fetchProducts.pending, (state) => {
        // Only trigger visible loading skeleton if we have zero products loaded
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = (action.payload.products || []).map(normalizeProduct);
        let merged = [...normalized];
        try {
          const sellerProducts = JSON.parse(localStorage.getItem('joshpetshub_seller_products') || '[]');
          if (Array.isArray(sellerProducts) && sellerProducts.length > 0) {
            const existingIds = new Set(merged.map(p => p.id || p._id));
            const existingSlugs = new Set(merged.map(p => p.slug));
            const extra = sellerProducts
              .filter(p => !existingIds.has(p.id || p._id) && !existingSlugs.has(p.slug))
              .map(normalizeProduct)
              .filter(p => {
                if (state.filters.petType && state.filters.petType !== 'all') {
                  const pPet = String(p.petType || p.pet_type || '').toLowerCase();
                  if (pPet && !pPet.startsWith(state.filters.petType.toLowerCase().slice(0, 3))) return false;
                }
                if (state.filters.brand) {
                  const brands = state.filters.brand.split(',').map(b => b.trim().toLowerCase());
                  const pBrand = String(p.brand || '').toLowerCase();
                  if (brands.length > 0 && !brands.some(b => pBrand.includes(b))) return false;
                }
                return true;
              });
            merged = [...extra, ...merged];
          }
        } catch (_) {}
        state.items = sortProductList(merged, state.filters.sort || 'date_desc');
        state.total = action.payload.total ?? merged.length;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        try {
          if (merged.length > 0 && !state.filters.search && !state.filters.category) {
            localStorage.setItem('joshpetshub_cached_products', JSON.stringify(merged.slice(0, 30)));
          }
        } catch (_) {}
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Product Async
      .addCase(createProductAsync.fulfilled, (state, action) => {
        if (action.payload?.product) {
          const normalized = normalizeProduct(action.payload.product);
          const exists = state.items.some(p => (p.id || p._id) === (normalized.id || normalized._id) || p.slug === normalized.slug);
          if (!exists) {
            state.items.unshift(normalized);
            state.total += 1;
          }
          try {
            const sellerListings = JSON.parse(localStorage.getItem('joshpetshub_seller_products') || '[]');
            const updated = [normalized, ...sellerListings.filter(p => (p.id || p._id) !== (normalized.id || normalized._id) && p.slug !== normalized.slug)];
            localStorage.setItem('joshpetshub_seller_products', JSON.stringify(updated));
            localStorage.setItem('joshpetshub_cached_products', JSON.stringify(state.items.slice(0, 30)));
          } catch (_) {}
        }
      })
      // Fetch Product Detail
      .addCase(fetchProductDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentProduct = normalizeProduct(action.payload.product);
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilters, clearProductDetail, addProductLocally, removeProductLocally, updateProductReviewStats } = productSlice.actions;
export default productSlice.reducer;
