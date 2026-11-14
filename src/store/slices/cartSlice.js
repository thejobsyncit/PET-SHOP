import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
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
export const getActiveUserKey = () => {
  try {
    const user = getActiveUserObj();
    if (!user) return 'guest';
    const id = user._id || user.id || user.email;
    return id ? String(id).trim().toLowerCase() : 'guest';
  } catch (_) {
    return 'guest';
  }
};

// Helper to extract a normalized string ID from any product, pet, or cart item
export const getCartItemIdStr = (item) => {
  if (!item) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item).trim();
  const raw = (item.product && typeof item.product === 'object')
    ? (item.product._id || item.product.id)
    : (item.product || item.productId || item._id || item.id);
  return raw ? String(raw).trim() : '';
};

// Helper to normalize product & pet details in cart
export const normalizeCartProduct = (p) => {
  if (!p) return null;
  const pId = getCartItemIdStr(p);
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
    name: p.name || p.title || (isPet ? `${p.breed || 'Verified'} (${p.petType || 'Pet'})` : 'Product'),
    title: p.title || p.name || (isPet ? `${p.breed || 'Verified'} (${p.petType || 'Pet'})` : 'Product'),
    brand: p.brand || p.breed || (isPet ? 'Verified Pet Seller' : 'Josh Pets Hub'),
    breed: p.breed || '',
    petType: p.petType || p.category || (isPet ? 'pet' : ''),
    price,
    fee: price,
    discountPrice,
    images,
    image: images[0] || p.image || '',
    stock: isPet ? 1 : (typeof p.stock === 'number' ? p.stock : 999),
    isPet,
    itemType: p.itemType || (isPet ? (p.quality ? 'adoption' : 'pet') : 'product')
  };
};

// Safe helper to read cart from localStorage scoped to the active user
export const getLocalCart = (customKey, userObj) => {
  try {
    const user = userObj || getActiveUserObj();
    const userKey = customKey || getActiveUserKey();

    if (userKey === 'guest') {
      const guestRaw = localStorage.getItem('joshpetshub_cart_guest');
      if (guestRaw) {
        const parsed = JSON.parse(guestRaw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacy = localStorage.getItem('joshpetshub_cart');
      if (legacy && legacy !== 'undefined' && legacy !== 'null') {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    }

    // 1. Direct scoped key
    const raw = localStorage.getItem(`joshpetshub_cart_${userKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed && Array.isArray(parsed.cart) && parsed.cart.length > 0) return parsed.cart;
    }

    // 2. Check by email if userKey was an ID
    if (user?.email) {
      const emailKey = user.email.trim().toLowerCase();
      if (emailKey !== userKey) {
        const emailRaw = localStorage.getItem(`joshpetshub_cart_${emailKey}`);
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
        const idRaw = localStorage.getItem(`joshpetshub_cart_${idKey}`);
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
        if (found && Array.isArray(found.cart) && found.cart.length > 0) {
          return found.cart;
        }
      }
    } catch (_) {}

    return [];
  } catch (_) {
    return [];
  }
};

// Safe helper to save cart to localStorage scoped to the active user
export const saveLocalCart = (cart, customKey) => {
  try {
    const user = getActiveUserObj();
    const userKey = customKey || getActiveUserKey();
    const safeCart = Array.isArray(cart) ? cart : [];
    localStorage.setItem(`joshpetshub_cart_${userKey}`, JSON.stringify(safeCart));

    if (userKey !== 'guest') {
      // Mirror to email key if userKey was ID, or ID key if userKey was email
      if (user?.email) {
        const emailKey = user.email.trim().toLowerCase();
        if (emailKey !== userKey) {
          localStorage.setItem(`joshpetshub_cart_${emailKey}`, JSON.stringify(safeCart));
        }
      }
      if (user?._id || user?.id) {
        const idKey = String(user._id || user.id).trim().toLowerCase();
        if (idKey !== userKey) {
          localStorage.setItem(`joshpetshub_cart_${idKey}`, JSON.stringify(safeCart));
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
            reg[idx].cart = safeCart;
            localStorage.setItem('joshpetshub_registered_users', JSON.stringify(reg));
          }
        }
      } catch (_) {}
    }
  } catch (_) {}
};

// Safe helper to clear local cart for the active user
export const clearLocalCart = (customKey) => {
  try {
    const userKey = customKey || getActiveUserKey();
    localStorage.removeItem(`joshpetshub_cart_${userKey}`);
    localStorage.removeItem('joshpetshub_cart'); // Purge legacy un-scoped key
    localStorage.removeItem('joshpetshub_cart_guest');
  } catch (_) {}
};

// Helper to calculate totals
export const calculateTotals = (items, appliedCoupon = null) => {
  const subtotal = (items || []).reduce((acc, item) => {
    if (!item || !item.product) return acc;
    const price = item.product.discountPrice ?? item.product.discount_price ?? item.product.price ?? item.product.fee ?? 0;
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    return acc + (Number(price) * qty);
  }, 0);

  // Free shipping threshold = ₹999
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18); // 18% GST

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === 'flat') {
      discount = appliedCoupon.discountValue;
    }
  }

  const total = Math.max(0, subtotal - discount + shipping + tax);

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total,
  };
};

// Async Thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';
  const userKey = getActiveUserKey();

  // If not authenticated or guest session, strictly load guest cart
  if (!hasToken || userKey === 'guest') {
    return { cart: getLocalCart('guest') };
  }

  const localCart = getLocalCart(userKey);

  try {
    const data = await apiRequest('/cart');
    if (data && Array.isArray(data.cart)) {
      // If server returned empty, but local has items: retain local items and sync them to server
      if (data.cart.length === 0 && localCart.length > 0) {
        apiRequest('/cart/sync', {
          method: 'POST',
          body: JSON.stringify({ items: localCart })
        }).catch(() => {});
        saveLocalCart(localCart, userKey);
        return { cart: localCart };
      }

      // Merge server items and local items (deduplicated by item product ID)
      const mergedMap = new Map();
      localCart.forEach(item => {
        const id = getCartItemIdStr(item);
        if (id) mergedMap.set(id, item);
      });
      data.cart.forEach(item => {
        const id = getCartItemIdStr(item);
        if (id) {
          const existing = mergedMap.get(id);
          if (existing) {
            const existingQty = Number(existing.quantity) || 1;
            const serverQty = Number(item.quantity) || 1;
            const richerProduct = (existing.product && typeof existing.product === 'object' && (existing.product.isPet || existing.product.breed))
              ? existing.product
              : item.product;
            mergedMap.set(id, {
              ...item,
              product: normalizeCartProduct(richerProduct),
              quantity: Math.max(existingQty, serverQty)
            });
          } else {
            mergedMap.set(id, {
              ...item,
              product: normalizeCartProduct(item.product)
            });
          }
        }
      });
      const merged = Array.from(mergedMap.values());
      saveLocalCart(merged, userKey);
      return { cart: merged };
    }
    return { cart: localCart };
  } catch (error) {
    return { cart: localCart };
  }
});

export const addToCartAPI = createAsyncThunk('cart/addToCart', async ({ product, quantity = 1 }, thunkAPI) => {
  if (!product) {
    return { cart: getLocalCart() };
  }

  const normProduct = normalizeCartProduct(product);
  const productId = getCartItemIdStr(normProduct);
  const isPet = Boolean(normProduct.isPet);
  const safeQuantity = isPet ? 1 : Math.max(1, parseInt(quantity, 10) || 1);
  const maxStock = isPet ? 1 : (typeof normProduct.stock === 'number' ? normProduct.stock : 999);

  if (maxStock <= 0) {
    toast.error('This item is currently out of stock.');
    return thunkAPI.rejectWithValue('This item is out of stock.');
  }

  const userKey = getActiveUserKey();
  let localCart = getLocalCart(userKey);
  const existIdx = localCart.findIndex(item => getCartItemIdStr(item) === productId);

  if (existIdx > -1) {
    const existing = localCart[existIdx];
    if (isPet) {
      toast.success('Pet is already in your cart.');
    } else {
      const currentQty = Number(existing.quantity) || 0;
      if (currentQty >= maxStock) {
        toast.error(`Cannot add more. You already have the maximum available stock (${maxStock} unit${maxStock === 1 ? '' : 's'}) in your cart.`);
        return thunkAPI.rejectWithValue(`Maximum available stock (${maxStock}) reached in cart`);
      }

      if (currentQty + safeQuantity > maxStock) {
        const remaining = maxStock - currentQty;
        toast.error(`Cannot add ${safeQuantity} units. Only ${remaining} more unit${remaining === 1 ? '' : 's'} available in stock (total stock: ${maxStock}).`);
        return thunkAPI.rejectWithValue(`Only ${remaining} more unit(s) available in stock`);
      }

      const nextQty = currentQty + safeQuantity;
      localCart[existIdx] = {
        ...existing,
        product: { ...(typeof existing.product === 'object' ? existing.product : {}), ...normProduct },
        quantity: nextQty,
      };
      toast.success(`Updated cart quantity (${nextQty}).`);
    }
  } else {
    if (safeQuantity > maxStock) {
      toast.error(`Cannot add ${safeQuantity} units. Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available in stock.`);
      return thunkAPI.rejectWithValue(`Requested quantity (${safeQuantity}) exceeds available stock (${maxStock})`);
    }
    localCart.push({ product: normProduct, quantity: safeQuantity });
    toast.success(isPet ? `Added ${normProduct.name || 'Pet'} to cart!` : `Added to cart!`);
  }
  saveLocalCart(localCart, userKey);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';
  if (!hasToken || userKey === 'guest') {
    return { cart: localCart };
  }

  try {
    const data = await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: safeQuantity, product: normProduct }),
    });

    if (data && Array.isArray(data.cart)) {
      saveLocalCart(data.cart, userKey);
      return { cart: data.cart };
    }
    return { cart: localCart };
  } catch (error) {
    console.warn('addToCart server sync note:', error?.message);
    return { cart: localCart };
  }
});

export const updateCartQuantityAPI = createAsyncThunk('cart/updateQuantity', async ({ productId, quantity }, thunkAPI) => {
  let safeQty = Math.max(1, parseInt(quantity, 10) || 1);
  const userKey = getActiveUserKey();
  let localCart = getLocalCart(userKey);
  const existIdx = localCart.findIndex(item => getCartItemIdStr(item) === String(productId));

  if (existIdx > -1) {
    const item = localCart[existIdx];
    const isPet = Boolean(item.product?.isPet || item.product?.breed || item.product?.petType);
    const maxStock = isPet 
      ? 1 
      : (typeof item?.product?.stock === 'number'
          ? Math.max(0, item.product.stock)
          : 999);
    
    if (safeQty > maxStock) {
      toast.error(`Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available in stock.`);
      safeQty = Math.max(1, maxStock);
    }
    localCart[existIdx] = { ...localCart[existIdx], quantity: safeQty };
  }
  saveLocalCart(localCart, userKey);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (!hasToken || userKey === 'guest') {
    return { cart: localCart };
  }

  try {
    const data = await apiRequest('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity: safeQty }),
    });

    if (data && Array.isArray(data.cart)) {
      saveLocalCart(data.cart, userKey);
      return { cart: data.cart };
    }
    return { cart: localCart };
  } catch (error) {
    return { cart: localCart };
  }
});

export const removeFromCartAPI = createAsyncThunk('cart/removeFromCart', async (productId, thunkAPI) => {
  const userKey = getActiveUserKey();
  let localCart = getLocalCart(userKey).filter(item => getCartItemIdStr(item) !== String(productId));
  saveLocalCart(localCart, userKey);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (!hasToken || userKey === 'guest') {
    return { cart: localCart };
  }

  try {
    const data = await apiRequest(`/cart/${productId}`, {
      method: 'DELETE',
    });

    if (data && Array.isArray(data.cart)) {
      saveLocalCart(data.cart, userKey);
      return data;
    }
    return { cart: localCart };
  } catch (error) {
    return { cart: localCart };
  }
});

export const clearCartAPI = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  const userKey = getActiveUserKey();
  saveLocalCart([], userKey);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (hasToken && userKey !== 'guest') {
    try {
      await apiRequest('/cart', { method: 'DELETE' });
    } catch (_) {}
  }

  return { cart: [] };
});

export const applyCouponCode = createAsyncThunk('cart/applyCoupon', async (couponCode, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const cartTotal = state.cart.pricing.subtotal;
    const data = await apiRequest('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: couponCode, cartTotal }),
    });
    return data.coupon;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const getInitialStateCart = () => {
  if (typeof window === 'undefined') return [];
  const userKey = getActiveUserKey();
  return getLocalCart(userKey);
};

const initialCart = getInitialStateCart();

const initialState = {
  items: initialCart.map(item => ({
    ...item,
    quantity: Math.max(1, parseInt(item?.quantity, 10) || 1),
    product: normalizeCartProduct(item?.product)
  })).filter(item => item.product && (item.product._id || item.product.id)),
  pricing: calculateTotals(initialCart, null),
  appliedCoupon: null,
  loading: false,
  error: null,
  isCartOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    removeCoupon(state) {
      state.appliedCoupon = null;
      state.pricing = calculateTotals(state.items, null);
    },
    clearCartLocal(state) {
      state.items = [];
      state.appliedCoupon = null;
      state.pricing = calculateTotals([], null);
      clearLocalCart();
    },
    openCart(state) {
      state.isCartOpen = true;
    },
    closeCart(state) {
      state.isCartOpen = false;
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen(state, action) {
      state.isCartOpen = Boolean(action.payload);
    }
  },
  extraReducers: (builder) => {
    const handleCartFulfilled = (state, action) => {
      state.loading = false;
      const rawCart = Array.isArray(action.payload?.cart) 
        ? action.payload.cart 
        : (Array.isArray(action.payload) ? action.payload : []);

      state.items = rawCart.map(item => ({
        ...item,
        quantity: Math.max(1, parseInt(item?.quantity, 10) || 1),
        product: normalizeCartProduct(item?.product)
      })).filter(item => item.product && (item.product._id || item.product.id));

      state.pricing = calculateTotals(state.items, state.appliedCoupon);
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, handleCartFulfilled)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCartAPI.fulfilled, handleCartFulfilled)
      .addCase(updateCartQuantityAPI.fulfilled, handleCartFulfilled)
      .addCase(removeFromCartAPI.fulfilled, handleCartFulfilled)
      .addCase(clearCartAPI.fulfilled, handleCartFulfilled)
      
      // Apply Coupon
      .addCase(applyCouponCode.fulfilled, (state, action) => {
        state.appliedCoupon = action.payload;
        state.pricing = calculateTotals(state.items, action.payload);
        state.error = null;
      })
      .addCase(applyCouponCode.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase('auth/logout', (state) => {
        state.items = [];
        state.pricing = calculateTotals([], null);
        state.appliedCoupon = null;
        clearLocalCart('guest');
        localStorage.removeItem('joshpetshub_cart');
      })
      .addCase('auth/setAuthenticatedUser', (state, action) => {
        const u = action.payload?.user;
        const key = u ? (u._id || u.id || u.email || '').toLowerCase() : 'guest';
        const userCart = getLocalCart(key, u);
        const guestCart = getLocalCart('guest');

        let merged = userCart;
        if (guestCart.length > 0) {
          const map = new Map();
          userCart.forEach(i => { const id = getCartItemIdStr(i); if (id) map.set(id, i); });
          guestCart.forEach(i => {
            const id = getCartItemIdStr(i);
            if (id) {
              if (!map.has(id)) {
                map.set(id, i);
              } else {
                const existing = map.get(id);
                existing.quantity = Math.max(Number(existing.quantity) || 1, Number(i.quantity) || 1);
              }
            }
          });
          merged = Array.from(map.values());
          saveLocalCart(merged, key);
          clearLocalCart('guest');
          apiRequest('/cart/sync', { method: 'POST', body: JSON.stringify({ items: merged }) }).catch(() => {});
        } else if (userCart.length > 0) {
          apiRequest('/cart/sync', { method: 'POST', body: JSON.stringify({ items: userCart }) }).catch(() => {});
        }

        state.items = merged.map(item => ({
          ...item,
          product: normalizeCartProduct(item?.product)
        })).filter(item => item.product && (item.product._id || item.product.id));
        state.pricing = calculateTotals(state.items, null);
      })
      .addCase('auth/login/fulfilled', (state, action) => {
        const u = action.payload?.user;
        const key = u ? (u._id || u.id || u.email || '').toLowerCase() : 'guest';
        const userCart = getLocalCart(key, u);
        const guestCart = getLocalCart('guest');

        let merged = userCart;
        if (guestCart.length > 0) {
          const map = new Map();
          userCart.forEach(i => { const id = getCartItemIdStr(i); if (id) map.set(id, i); });
          guestCart.forEach(i => {
            const id = getCartItemIdStr(i);
            if (id) {
              if (!map.has(id)) {
                map.set(id, i);
              } else {
                const existing = map.get(id);
                existing.quantity = Math.max(Number(existing.quantity) || 1, Number(i.quantity) || 1);
              }
            }
          });
          merged = Array.from(map.values());
          saveLocalCart(merged, key);
          clearLocalCart('guest');
          apiRequest('/cart/sync', { method: 'POST', body: JSON.stringify({ items: merged }) }).catch(() => {});
        } else if (userCart.length > 0) {
          apiRequest('/cart/sync', { method: 'POST', body: JSON.stringify({ items: userCart }) }).catch(() => {});
        }

        state.items = merged.map(item => ({
          ...item,
          product: normalizeCartProduct(item?.product)
        })).filter(item => item.product && (item.product._id || item.product.id));
        state.pricing = calculateTotals(state.items, null);
      })
      .addCase('auth/register/fulfilled', (state) => {
        state.items = [];
        state.pricing = calculateTotals([], null);
        state.appliedCoupon = null;
      });
  },
});

export const { removeCoupon, clearCartLocal, openCart, closeCart, toggleCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
