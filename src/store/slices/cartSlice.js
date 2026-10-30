import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Helper to determine the active user key for partitioned local storage
export const getActiveUserKey = () => {
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

// Safe helper to read cart from localStorage scoped to the active user
export const getLocalCart = (customKey) => {
  try {
    const userKey = customKey || getActiveUserKey();
    const raw = localStorage.getItem(`joshpetshub_cart_${userKey}`);
    if (!raw || raw === 'undefined' || raw === 'null') {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.cart)) return parsed.cart;
    return [];
  } catch (_) {
    return [];
  }
};

// Safe helper to save cart to localStorage scoped to the active user
export const saveLocalCart = (cart, customKey) => {
  try {
    const userKey = customKey || getActiveUserKey();
    const safeCart = Array.isArray(cart) ? cart : [];
    localStorage.setItem(`joshpetshub_cart_${userKey}`, JSON.stringify(safeCart));
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
    const price = item.product.discountPrice ?? item.product.discount_price ?? item.product.price ?? 0;
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

  try {
    // Authenticated user: server is authoritative
    const data = await apiRequest('/cart');
    if (data && Array.isArray(data.cart)) {
      saveLocalCart(data.cart, userKey);
      return { cart: data.cart };
    }
    return { cart: getLocalCart(userKey) };
  } catch (error) {
    return { cart: getLocalCart(userKey) };
  }
});

export const addToCartAPI = createAsyncThunk('cart/addToCart', async ({ product, quantity = 1 }, thunkAPI) => {
  if (!product) {
    return { cart: getLocalCart() };
  }

  const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
  const maxStock = typeof product.stock === 'number'
    ? Math.max(0, product.stock)
    : (product.stock !== undefined && product.stock !== null && !isNaN(Number(product.stock))
        ? Math.max(0, Number(product.stock))
        : 999);

  if (maxStock <= 0) {
    toast.error('This product is currently out of stock.');
    return thunkAPI.rejectWithValue('This product is out of stock.');
  }

  const normProduct = {
    ...product,
    _id: product._id || product.id,
    id: product.id || product._id,
    stock: maxStock,
    price: Number(product.price) || 0,
    discountPrice: product.discountPrice !== null && product.discountPrice !== undefined 
      ? Number(product.discountPrice) 
      : (product.discount_price !== null && product.discount_price !== undefined ? Number(product.discount_price) : null),
  };
  const productId = normProduct._id || normProduct.id;
  const userKey = getActiveUserKey();

  // Optimistically update local cart for this user
  let localCart = getLocalCart(userKey);
  const existIdx = localCart.findIndex(item => {
    const pId = typeof item?.product === 'object' ? (item.product?._id || item.product?.id) : item?.product;
    return String(pId) === String(productId);
  });

  if (existIdx > -1) {
    const existing = localCart[existIdx];
    const currentQty = Number(existing.quantity) || 0;
    if (currentQty >= maxStock) {
      toast.error(`Cannot add more. You already have the maximum available stock (${maxStock} unit${maxStock === 1 ? '' : 's'}) in your cart.`);
      return thunkAPI.rejectWithValue(`Maximum available stock (${maxStock}) reached in cart`);
    }

    const nextQty = Math.min(maxStock, currentQty + safeQuantity);
    if (nextQty < currentQty + safeQuantity) {
      toast.error(`Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available in stock. Cart updated to maximum available quantity.`);
    }

    localCart[existIdx] = {
      ...existing,
      product: { ...(typeof existing.product === 'object' ? existing.product : {}), ...normProduct },
      quantity: nextQty,
    };
  } else {
    const initialQty = Math.min(maxStock, safeQuantity);
    if (initialQty < safeQuantity) {
      toast.error(`Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available in stock. Added ${maxStock} to cart.`);
    }
    localCart.push({ product: normProduct, quantity: initialQty });
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
  const existIdx = localCart.findIndex(item => {
    const pId = typeof item?.product === 'object' ? (item.product?._id || item.product?.id) : item?.product;
    return String(pId) === String(productId);
  });
  if (existIdx > -1) {
    const item = localCart[existIdx];
    const maxStock = typeof item?.product?.stock === 'number'
      ? Math.max(0, item.product.stock)
      : (item?.product?.stock !== undefined && item?.product?.stock !== null && !isNaN(Number(item.product.stock))
          ? Math.max(0, Number(item.product.stock))
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
  let localCart = getLocalCart(userKey).filter(item => {
    const pId = typeof item?.product === 'object' ? (item.product?._id || item.product?.id) : item?.product;
    return String(pId) !== String(productId);
  });
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
  const token = localStorage.getItem('joshpetshub_token');
  if (!token) return [];
  const userKey = getActiveUserKey();
  if (userKey === 'guest') return [];
  return getLocalCart(userKey);
};

const initialCart = getInitialStateCart();

const initialState = {
  items: initialCart.map(item => {
    const prod = typeof item?.product === 'object' && item?.product !== null ? item.product : {};
    const pId = prod._id || prod.id || (typeof item?.product === 'string' ? item.product : null);
    const price = Number(prod.price) || 0;
    const discountPrice = prod.discountPrice !== null && prod.discountPrice !== undefined 
      ? Number(prod.discountPrice) 
      : (prod.discount_price !== null && prod.discount_price !== undefined ? Number(prod.discount_price) : null);
    
    return {
      ...item,
      quantity: Math.max(1, parseInt(item?.quantity, 10) || 1),
      product: {
        ...prod,
        _id: pId,
        id: pId,
        price,
        discountPrice,
        images: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : [])
      }
    };
  }).filter(item => item.product._id || item.product.id),
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

      state.items = rawCart.map(item => {
        const prod = typeof item?.product === 'object' && item?.product !== null ? item.product : {};
        const pId = prod._id || prod.id || (typeof item?.product === 'string' ? item.product : null);
        const price = Number(prod.price) || 0;
        const discountPrice = prod.discountPrice !== null && prod.discountPrice !== undefined 
          ? Number(prod.discountPrice) 
          : (prod.discount_price !== null && prod.discount_price !== undefined ? Number(prod.discount_price) : null);
        
        return {
          ...item,
          quantity: Math.max(1, parseInt(item?.quantity, 10) || 1),
          product: {
            ...prod,
            _id: pId,
            id: pId,
            price,
            discountPrice,
            images: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : [])
          }
        };
      }).filter(item => item.product._id || item.product.id);

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
        const cached = getLocalCart(key);
        state.items = cached;
        state.pricing = calculateTotals(cached, null);
      })
      .addCase('auth/login/fulfilled', (state, action) => {
        const u = action.payload?.user;
        const key = u ? (u._id || u.id || u.email || '').toLowerCase() : 'guest';
        const cached = getLocalCart(key);
        state.items = cached;
        state.pricing = calculateTotals(cached, null);
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
