import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Helper to determine the active user key for partitioned local storage
export const getActiveWishlistUserKey = () => {
  try {
    const raw = localStorage.getItem('joshpetshub_user');
    if (!raw) return 'guest';
    const user = JSON.parse(raw);
    const id = user?._id || user?.id || user?.email;
    return id ? String(id).trim().toLowerCase() : 'guest';
  } catch (_) {
    return 'guest';
  }
};

// Safe helper to read initial wishlist from localStorage scoped to active user
export const getInitialWishlist = (customKey) => {
  try {
    const userKey = customKey || getActiveWishlistUserKey();
    const raw = localStorage.getItem(`joshpetshub_wishlist_${userKey}`);
    if (!raw) {
      if (userKey === 'guest') {
        const legacy = localStorage.getItem('joshpetshub_wishlist');
        if (legacy && legacy !== 'undefined' && legacy !== 'null') {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) return parsed;
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

// Safe helper to write wishlist to localStorage scoped to active user
export const saveLocalWishlist = (items, customKey) => {
  try {
    const userKey = customKey || getActiveWishlistUserKey();
    localStorage.setItem(`joshpetshub_wishlist_${userKey}`, JSON.stringify(items));
  } catch (_) {}
};

// Safe helper to clear local wishlist for the active user
export const clearLocalWishlist = (customKey) => {
  try {
    const userKey = customKey || getActiveWishlistUserKey();
    localStorage.removeItem(`joshpetshub_wishlist_${userKey}`);
    localStorage.removeItem('joshpetshub_wishlist'); // Clear legacy un-scoped key
    localStorage.removeItem('joshpetshub_wishlist_guest');
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
  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';
  const userKey = getActiveWishlistUserKey();

  if (!hasToken || userKey === 'guest') {
    return { wishlist: getInitialWishlist('guest') };
  }

  try {
    // Authenticated user: server is authoritative
    const data = await apiRequest('/wishlist');
    if (data && Array.isArray(data.wishlist)) {
      saveLocalWishlist(data.wishlist, userKey);
      return { wishlist: data.wishlist };
    }
    return { wishlist: getInitialWishlist(userKey) };
  } catch (error) {
    return { wishlist: getInitialWishlist(userKey) };
  }
});

export const toggleWishlistAPI = createAsyncThunk('wishlist/toggle', async (product, thunkAPI) => {
  const normProduct = normalizeWishlistProduct(product);
  const userKey = getActiveWishlistUserKey();
  if (!normProduct) return { wishlist: getInitialWishlist(userKey) };
  const productId = normProduct._id || normProduct.id;

  const toggleInLocal = () => {
    let current = getInitialWishlist(userKey);
    const existIdx = current.findIndex(p => (p._id || p.id) === productId);
    if (existIdx > -1) {
      current = current.filter(p => (p._id || p.id) !== productId);
    } else {
      current.push(normProduct);
    }
    saveLocalWishlist(current, userKey);
    return current;
  };

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  try {
    if (!hasToken || userKey === 'guest') {
      const updated = toggleInLocal();
      return { wishlist: updated };
    }

    const data = await apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId, product: normProduct }),
    });

    if (data && Array.isArray(data.wishlist)) {
      saveLocalWishlist(data.wishlist, userKey);
      return data;
    }

    const updated = toggleInLocal();
    return { wishlist: updated };
  } catch (error) {
    const updated = toggleInLocal();
    return { wishlist: updated };
  }
});

const getInitialStateWishlist = () => {
  if (typeof window === 'undefined') return [];
  const token = localStorage.getItem('joshpetshub_token');
  if (!token) return [];
  const userKey = getActiveWishlistUserKey();
  if (userKey === 'guest') return [];
  return getInitialWishlist(userKey);
};

const initialState = {
  items: getInitialStateWishlist(),
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistLocal(state) {
      state.items = [];
      clearLocalWishlist();
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
      .addCase(toggleWishlistAPI.fulfilled, handleWishlistFulfilled)
      .addCase('auth/logout', (state) => {
        state.items = [];
        clearLocalWishlist('guest');
        localStorage.removeItem('joshpetshub_wishlist');
      })
      .addCase('auth/setAuthenticatedUser', (state, action) => {
        const u = action.payload?.user;
        const key = u ? (u._id || u.id || u.email || '').toLowerCase() : 'guest';
        state.items = getInitialWishlist(key);
      })
      .addCase('auth/login/fulfilled', (state, action) => {
        const u = action.payload?.user;
        const key = u ? (u._id || u.id || u.email || '').toLowerCase() : 'guest';
        state.items = getInitialWishlist(key);
      })
      .addCase('auth/register/fulfilled', (state) => {
        state.items = [];
      });
  },
});

export const { clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
