import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Safe helper to read initial wishlist from localStorage
const getInitialWishlist = () => {
  try {
    const raw = localStorage.getItem('joshpetshub_wishlist');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

// Safe helper to write wishlist to localStorage
const saveLocalWishlist = (items) => {
  try {
    localStorage.setItem('joshpetshub_wishlist', JSON.stringify(items));
  } catch (_) {}
};

// Helper to normalize product fields
const normalizeWishlistProduct = (p) => {
  if (!p) return null;
  const pId = p._id || p.id;
  const price = Number(p.price) || 0;
  const discountPrice = p.discount_price !== null && p.discount_price !== undefined 
    ? Number(p.discount_price) 
    : (p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null);
  
  return {
    ...p,
    _id: pId,
    id: pId,
    price,
    discountPrice,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
  };
};

// Async Thunks
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, thunkAPI) => {
  const localItems = getInitialWishlist();

  try {
    const token = localStorage.getItem('joshpetshub_token');
    if (!token) {
      return { wishlist: localItems };
    }

    const data = await apiRequest('/wishlist');
    if (data && Array.isArray(data.wishlist)) {
      if (data.wishlist.length > 0) {
        saveLocalWishlist(data.wishlist);
        return { wishlist: data.wishlist };
      }
      
      // If server returned 0 items but local has items, sync local to server
      if (localItems.length > 0) {
        for (const item of localItems) {
          const pId = item._id || item.id;
          if (pId) {
            apiRequest('/wishlist', {
              method: 'POST',
              body: JSON.stringify({ productId: pId, product: item })
            }).catch(() => {});
          }
        }
        return { wishlist: localItems };
      }

      saveLocalWishlist([]);
      return { wishlist: [] };
    }

    return { wishlist: localItems };
  } catch (error) {
    return { wishlist: localItems };
  }
});

export const toggleWishlistAPI = createAsyncThunk('wishlist/toggle', async (product, thunkAPI) => {
  const normProduct = normalizeWishlistProduct(product);
  const productId = normProduct._id || normProduct.id;

  const toggleInLocal = () => {
    let current = getInitialWishlist();
    const existIdx = current.findIndex(p => (p._id || p.id) === productId);
    if (existIdx > -1) {
      current = current.filter(p => (p._id || p.id) !== productId);
    } else {
      current.push(normProduct);
    }
    saveLocalWishlist(current);
    return current;
  };

  try {
    const token = localStorage.getItem('joshpetshub_token');
    if (!token) {
      const updated = toggleInLocal();
      return { wishlist: updated };
    }

    const data = await apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId, product: normProduct }),
    });

    if (data && Array.isArray(data.wishlist)) {
      saveLocalWishlist(data.wishlist);
      return data;
    }

    const updated = toggleInLocal();
    return { wishlist: updated };
  } catch (error) {
    const updated = toggleInLocal();
    return { wishlist: updated };
  }
});

const initialState = {
  items: getInitialWishlist(),
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistLocal(state) {
      state.items = [];
      saveLocalWishlist([]);
    }
  },
  extraReducers: (builder) => {
    const handleWishlistFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload?.wishlist || [];
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
