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

const initialState = {
  items: [],
  total: 0,
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
  loading: false,
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
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
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
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilters, clearProductDetail } = productSlice.actions;
export default productSlice.reducer;
