import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Safe helper to read cart from localStorage
export const getLocalCart = () => {
  try {
    const raw = localStorage.getItem('joshpetshub_cart');
    if (!raw || raw === 'undefined' || raw === 'null') return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.cart)) return parsed.cart;
    return [];
  } catch (_) {
    return [];
  }
};

// Safe helper to save cart to localStorage
export const saveLocalCart = (cart) => {
  try {
    const safeCart = Array.isArray(cart) ? cart : [];
    localStorage.setItem('joshpetshub_cart', JSON.stringify(safeCart));
  } catch (_) {}
};

// Helper to calculate totals
const calculateTotals = (items, appliedCoupon = null) => {
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
  const localCart = getLocalCart();
  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (!hasToken) {
    return { cart: localCart };
  }

  try {
    const data = await apiRequest('/cart');
    if (data && Array.isArray(data.cart)) {
      if (data.cart.length > 0) {
        saveLocalCart(data.cart);
        return data;
      }
      // If server returned empty cart but local has items, sync local items to server
      if (localCart.length > 0) {
        for (const item of localCart) {
          const pId = typeof item?.product === 'object' ? (item.product?._id || item.product?.id) : item?.product;
          if (pId) {
            apiRequest('/cart', {
              method: 'POST',
              body: JSON.stringify({ productId: pId, quantity: item.quantity || 1 })
            }).catch(() => {});
          }
        }
        return { cart: localCart };
      }
      saveLocalCart([]);
      return { cart: [] };
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

  const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
  const normProduct = {
    ...product,
    _id: product._id || product.id,
    id: product.id || product._id,
    price: Number(product.price) || 0,
    discountPrice: product.discountPrice !== null && product.discountPrice !== undefined 
      ? Number(product.discountPrice) 
      : (product.discount_price !== null && product.discount_price !== undefined ? Number(product.discount_price) : null),
  };
  const productId = normProduct._id || normProduct.id;

  // Always update local cart first
  let localCart = getLocalCart();
  const existIdx = localCart.findIndex(item => {
    const pId = typeof item?.product === 'object' ? (item.product?._id || item.product?.id) : item?.product;
    return pId === productId;
  });

  if (existIdx > -1) {
    const existing = localCart[existIdx];
    localCart[existIdx] = {
      ...existing,
      product: { ...(typeof existing.product === 'object' ? existing.product : {}), ...normProduct },
      quantity: (Number(existing.quantity) || 0) + safeQuantity,
    };
  } else {
    localCart.push({ product: normProduct, quantity: safeQuantity });
  }
  saveLocalCart(localCart);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (!hasToken) {
    return { cart: localCart };
  }

  try {
    const data = await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: safeQuantity }),
    });

    if (data && Array.isArray(data.cart) && data.cart.length > 0) {
      saveLocalCart(data.cart);
      return data;
    }
    return { cart: localCart };
  } catch (error) {
    console.warn('addToCart server sync note:', error?.message);
    return { cart: localCart };
  }
});

export const updateCartQuantityAPI = createAsyncThunk('cart/updateQuantity', async ({ productId, quantity }, thunkAPI) => {
  const safeQty = Math.max(1, parseInt(quantity, 10) || 1);
  let localCart = getLocalCart();
  const existIdx = localCart.findIndex(item => {
    const pId = typeof item?.product === 'object' ? (item.product?._id || item.product?.id) : item?.product;
    return pId === productId;
  });
  if (existIdx > -1) {
    localCart[existIdx] = { ...localCart[existIdx], quantity: safeQty };
  }
  saveLocalCart(localCart);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (!hasToken) {
    return { cart: localCart };
  }

  try {
    const data = await apiRequest('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity: safeQty }),
    });

    if (data && Array.isArray(data.cart)) {
      saveLocalCart(data.cart);
      return data;
    }
    return { cart: localCart };
  } catch (error) {
    return { cart: localCart };
  }
});

export const removeFromCartAPI = createAsyncThunk('cart/removeFromCart', async (productId, thunkAPI) => {
  let localCart = getLocalCart().filter(item => {
    const pId = typeof item?.product === 'object' ? (item.product?._id || item.product?.id) : item?.product;
    return pId !== productId;
  });
  saveLocalCart(localCart);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (!hasToken) {
    return { cart: localCart };
  }

  try {
    const data = await apiRequest(`/cart/${productId}`, {
      method: 'DELETE',
    });

    if (data && Array.isArray(data.cart)) {
      saveLocalCart(data.cart);
      return data;
    }
    return { cart: localCart };
  } catch (error) {
    return { cart: localCart };
  }
});

export const clearCartAPI = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  saveLocalCart([]);

  const token = localStorage.getItem('joshpetshub_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';

  if (hasToken) {
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

const initialCart = getLocalCart();

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
      saveLocalCart([]);
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
      });
  },
});

export const { removeCoupon, clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
