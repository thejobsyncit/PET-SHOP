import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Safe helper to extract parsed active user object
export const getActiveUserObj = () => {
  try {
    const raw = localStorage.getItem('joshpetshub_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
};

// Helper to determine the active user key for partitioned local storage
export const getActiveWishlistUserKey = () => {
  try {
    const user = getActiveUserObj();
    if (!user) return 'guest';
    const id = user._id || user.id || user.email;
    return id ? String(id).trim().toLowerCase() : 'guest';
  } catch (_) {
    return 'guest';
  }
};

// Helper to extract a normalized string ID from any product, pet, or wishlist item
export const getWishlistItemIdStr = (item) => {
  if (!item) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item).trim();
  const raw = item._id || item.id || item.productId || (typeof item.product === 'object' ? (item.product?._id || item.product?.id) : item.product);
  return raw ? String(raw).trim() : '';
};

// Safe helper to read initial wishlist from localStorage scoped to active user
export const getInitialWishlist = (customKey, userObj) => {
  try {
    const user = userObj || getActiveUserObj();
    const userKey = customKey || getActiveWishlistUserKey();

    if (userKey === 'guest') {
      const guestRaw = localStorage.getItem('joshpetshub_wishlist_guest');
      if (guestRaw) {
        const parsed = JSON.parse(guestRaw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacy = localStorage.getItem('joshpetshub_wishlist');
      if (legacy && legacy !== 'undefined' && legacy !== 'null') {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    }

    // 1. Direct scoped key
    const raw = localStorage.getItem(`joshpetshub_wishlist_${userKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // 2. Check by email if userKey was an ID
    if (user?.email) {
      const emailKey = user.email.trim().toLowerCase();
      if (emailKey !== userKey) {
        const emailRaw = localStorage.getItem(`joshpetshub_wishlist_${emailKey}`);
        if (emailRaw) {
          const parsed = JSON.parse(emailRaw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    }

    // 3. Check by _id if userKey was an email
    if (user?._id || user?.id) {
      const idKey = String(user._id || user.id).trim().toLowerCase();
      if (idKey !== userKey) {
        const idRaw = localStorage.getItem(`joshpetshub_wishlist_${idKey}`);
        if (idRaw) {
          const parsed = JSON.parse(idRaw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    }

    // 4. Check joshpetshub_registered_users
    try {
      const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      if (Array.isArray(reg)) {
        const found = reg.find(u => 
          (userKey && (String(u._id).toLowerCase() === userKey || String(u.id).toLowerCase() === userKey)) ||
          (u.email && u.email.toLowerCase() === userKey) ||
          (user?.email && u.email && u.email.toLowerCase() === user.email.toLowerCase())
        );
        if (found && Array.isArray(found.wishlist) && found.wishlist.length > 0) {
          return found.wishlist;
        }
      }
    } catch (_) {}

    return [];
  } catch (_) {
    return [];
  }
};

// Safe helper to write wishlist to localStorage scoped to active user
export const saveLocalWishlist = (items, customKey) => {
  try {
    const user = getActiveUserObj();
    const userKey = customKey || getActiveWishlistUserKey();
    const itemsArr = Array.isArray(items) ? items : [];

    localStorage.setItem(`joshpetshub_wishlist_${userKey}`, JSON.stringify(itemsArr));

    if (userKey !== 'guest') {
      // Mirror to email key if userKey was ID, or ID key if userKey was email
      if (user?.email) {
        const emailKey = user.email.trim().toLowerCase();
        if (emailKey !== userKey) {
          localStorage.setItem(`joshpetshub_wishlist_${emailKey}`, JSON.stringify(itemsArr));
        }
      }
      if (user?._id || user?.id) {
        const idKey = String(user._id || user.id).trim().toLowerCase();
        if (idKey !== userKey) {
          localStorage.setItem(`joshpetshub_wishlist_${idKey}`, JSON.stringify(itemsArr));
        }
      }

      // Also persist to joshpetshub_registered_users
      try {
        const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
        if (Array.isArray(reg)) {
          const idx = reg.findIndex(u => 
            (userKey && (String(u._id).toLowerCase() === userKey || String(u.id).toLowerCase() === userKey)) ||
            (u.email && u.email.toLowerCase() === userKey) ||
            (user?.email && u.email && u.email.toLowerCase() === user.email.toLowerCase())
          );
          if (idx !== -1) {
            reg[idx].wishlist = itemsArr;
            localStorage.setItem('joshpetshub_registered_users', JSON.stringify(reg));
          }
        }
      } catch (_) {}
    }
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

// Helper to normalize product & pet fields
export const normalizeWishlistProduct = (p) => {
  if (!p) return null;
  const pId = getWishlistItemIdStr(p);
  const price = Number(p.price ?? p.fee ?? 0) || 0;
  const discountPrice = p.discount_price !== null && p.discount_price !== undefined 
    ? Number(p.discount_price) 
    : (p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : null);
  const images = Array.isArray(p.images) && p.images.length > 0 
    ? p.images 
    : (p.image ? [p.image] : []);

  const isPet = Boolean(
    p.isPet || p.petType || p.breed || 
    p.itemType === 'pet' || p.itemType === 'adoption' ||
    p.quality || p.sellerName || p.parentContact
  );

  return {
    ...p,
    _id: pId,
    id: pId,
    name: p.name || p.title || 'Product',
    title: p.title || p.name || 'Product',
    brand: p.brand || p.breed || (isPet ? 'Verified Pet' : ''),
    breed: p.breed || '',
    petType: p.petType || p.category || (isPet ? 'pet' : ''),
    price,
    fee: price,
    discountPrice,
    images,
    image: images[0] || p.image || '',
    isPet,
    itemType: p.itemType || (isPet ? (p.quality ? 'adoption' : 'pet') : 'product')
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

  const localItems = getInitialWishlist(userKey);

  try {
    // Authenticated user: server is authoritative, but local items must be preserved
    const data = await apiRequest('/wishlist');
    if (data && Array.isArray(data.wishlist)) {
      // If server returned empty, but local has items: retain local items and sync them to server
      if (data.wishlist.length === 0 && localItems.length > 0) {
        apiRequest('/wishlist/sync', {
          method: 'POST',
          body: JSON.stringify({ items: localItems })
        }).catch(() => {});
        saveLocalWishlist(localItems, userKey);
        return { wishlist: localItems };
      }

      // Merge server items and local items (so no pet attributes or items are lost)
      const mergedMap = new Map();
      localItems.forEach(item => {
        const id = getWishlistItemIdStr(item);
        if (id) mergedMap.set(id, item);
      });
      data.wishlist.forEach(item => {
        const id = getWishlistItemIdStr(item);
        if (id) {
          const existing = mergedMap.get(id);
          // If local existing item has richer details (e.g. pet details or custom image), keep existing; else server item
          if (existing && (!item.images || item.images.length === 0 || item.name === 'Product')) {
            mergedMap.set(id, existing);
          } else {
            mergedMap.set(id, item);
          }
        }
      });
      const merged = Array.from(mergedMap.values());
      saveLocalWishlist(merged, userKey);
      return { wishlist: merged };
    }
    return { wishlist: localItems };
  } catch (error) {
    return { wishlist: localItems };
  }
});

export const toggleWishlistAPI = createAsyncThunk('wishlist/toggle', async (payload, thunkAPI) => {
  const product = (payload && typeof payload === 'object' && payload.product) ? payload.product : payload;
  const explicitAction = (payload && typeof payload === 'object' && payload.action) ? payload.action : null; // 'add' | 'remove' | null

  const normProduct = normalizeWishlistProduct(product);
  const userKey = getActiveWishlistUserKey();
  const state = thunkAPI.getState();
  const currentStoreItems = state.wishlist?.items || [];

  if (!normProduct) return { wishlist: currentStoreItems };
  const productId = getWishlistItemIdStr(normProduct);

  const isCurrentlyInStore = currentStoreItems.some(item => getWishlistItemIdStr(item) === productId);
  const shouldRemove = explicitAction === 'remove' || (explicitAction !== 'add' && isCurrentlyInStore);
  const actionToTake = shouldRemove ? 'remove' : 'add';

  const toggleInLocal = () => {
    let localItems = getInitialWishlist(userKey);
    let base = Array.isArray(localItems) && localItems.length > 0 ? localItems : currentStoreItems;
    let updated;
    if (shouldRemove) {
      updated = base.filter(item => getWishlistItemIdStr(item) !== productId);
    } else {
      const alreadyHas = base.some(item => getWishlistItemIdStr(item) === productId);
      updated = alreadyHas ? base : [...base, normProduct];
    }
    saveLocalWishlist(updated, userKey);
    return updated;
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
      body: JSON.stringify({ productId, product: normProduct, action: actionToTake }),
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
  const userKey = getActiveWishlistUserKey();
  const raw = getInitialWishlist(userKey);
  return (Array.isArray(raw) ? raw : []).map(normalizeWishlistProduct).filter(Boolean);
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
        const userWishlist = getInitialWishlist(key, u);
        const guestWishlist = getInitialWishlist('guest');

        let merged = userWishlist;
        if (guestWishlist.length > 0) {
          const map = new Map();
          userWishlist.forEach(i => { const id = getWishlistItemIdStr(i); if (id) map.set(id, i); });
          guestWishlist.forEach(i => { const id = getWishlistItemIdStr(i); if (id && !map.has(id)) map.set(id, i); });
          merged = Array.from(map.values());
          saveLocalWishlist(merged, key);
          clearLocalWishlist('guest');
          apiRequest('/wishlist/sync', { method: 'POST', body: JSON.stringify({ items: merged }) }).catch(() => {});
        } else if (userWishlist.length > 0) {
          apiRequest('/wishlist/sync', { method: 'POST', body: JSON.stringify({ items: userWishlist }) }).catch(() => {});
        }
        state.items = merged.map(item => normalizeWishlistProduct(item)).filter(Boolean);
      })
      .addCase('auth/login/fulfilled', (state, action) => {
        const u = action.payload?.user;
        const key = u ? (u._id || u.id || u.email || '').toLowerCase() : 'guest';
        const userWishlist = getInitialWishlist(key, u);
        const guestWishlist = getInitialWishlist('guest');

        let merged = userWishlist;
        if (guestWishlist.length > 0) {
          const map = new Map();
          userWishlist.forEach(i => { const id = getWishlistItemIdStr(i); if (id) map.set(id, i); });
          guestWishlist.forEach(i => { const id = getWishlistItemIdStr(i); if (id && !map.has(id)) map.set(id, i); });
          merged = Array.from(map.values());
          saveLocalWishlist(merged, key);
          clearLocalWishlist('guest');
          apiRequest('/wishlist/sync', { method: 'POST', body: JSON.stringify({ items: merged }) }).catch(() => {});
        } else if (userWishlist.length > 0) {
          apiRequest('/wishlist/sync', { method: 'POST', body: JSON.stringify({ items: userWishlist }) }).catch(() => {});
        }
        state.items = merged.map(item => normalizeWishlistProduct(item)).filter(Boolean);
      })
      .addCase('auth/register/fulfilled', (state) => {
        state.items = [];
      });
  },
});

export const { clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
