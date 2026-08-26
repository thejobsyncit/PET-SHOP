import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Async Thunks
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    if (!token) {
      const local = JSON.parse(localStorage.getItem('pawora_wishlist') || '[]');
      return { wishlist: local };
    }
    return await apiRequest('/wishlist');
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const toggleWishlistAPI = createAsyncThunk('wishlist/toggle', async (product, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    if (!token) {
      let local = JSON.parse(localStorage.getItem('pawora_wishlist') || '[]');
      const existIdx = local.findIndex(p => p._id === product._id);
      if (existIdx > -1) {
        local = local.filter(p => p._id !== product._id);
      } else {
        local.push(product);
      }
      localStorage.setItem('pawora_wishlist', JSON.stringify(local));
      return { wishlist: local };
    }

    return await apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId: product._id }),
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistLocal(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    const handleWishlistFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload.wishlist || [];
    };

    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, handleWishlistFulfilled)
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlistAPI.fulfilled, handleWishlistFulfilled);
  },
});

export const { clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
