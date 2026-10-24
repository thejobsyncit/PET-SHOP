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
    const cached = localStorage.getItem('joshpetshub_cached_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
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
        state.items = normalized;
        state.total = action.payload.total ?? normalized.length;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        try {
          if (normalized.length > 0 && !state.filters.search && !state.filters.category) {
            localStorage.setItem('joshpetshub_cached_products', JSON.stringify(normalized.slice(0, 30)));
          }
        } catch (_) {}
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

export const { setFilter, resetFilters, clearProductDetail } = productSlice.actions;
export default productSlice.reducer;
