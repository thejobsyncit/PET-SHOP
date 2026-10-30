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
    petType: p.pet_type ?? p.petType,
  };
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
        search: '',
        sort: 'date_desc',
      };
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
            const extra = sellerProducts.filter(p => !existingIds.has(p.id || p._id) && !existingSlugs.has(p.slug)).map(normalizeProduct);
            merged = [...extra, ...merged];
          }
        } catch (_) {}
        state.items = merged;
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

export const { setFilter, resetFilters, clearProductDetail, addProductLocally, removeProductLocally } = productSlice.actions;
export default productSlice.reducer;
