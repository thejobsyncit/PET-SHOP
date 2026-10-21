import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Helper to calculate totals
const calculateTotals = (items, appliedCoupon = null) => {
  const subtotal = (items || []).reduce((acc, item) => {
    if (!item || !item.product) return acc;
    const price = item.product.discountPrice ?? item.product.discount_price ?? item.product.price ?? 0;
    return acc + (Number(price) * (item.quantity || 1));
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
  try {
    const token = localStorage.getItem('joshpetshub_token');
    if (!token) {
      // Return guest cart from localStorage
      const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
      return { cart: localCart };
    }
    const data = await apiRequest('/cart');
    if (data?.cart) {
      localStorage.setItem('joshpetshub_cart', JSON.stringify(data.cart));
    }
    return data;
  } catch (error) {
    const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
    return { cart: localCart };
  }
});

export const addToCartAPI = createAsyncThunk('cart/addToCart', async ({ product, quantity = 1 }, thunkAPI) => {
  const normProduct = {
    ...product,
    _id: product?._id || product?.id,
    id: product?.id || product?._id,
    discountPrice: product?.discountPrice ?? product?.discount_price ?? null,
  };
  const productId = normProduct._id || normProduct.id;

  try {
    const token = localStorage.getItem('joshpetshub_token');
    if (!token) {
      // Handle local guest cart
      const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
      const existIdx = localCart.findIndex(item => (item.product?._id || item.product?.id) === productId);
      if (existIdx > -1) {
        localCart[existIdx].quantity += quantity;
      } else {
        localCart.push({ product: normProduct, quantity });
      }
      localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
      return { cart: localCart };
    }
    
    // Authenticated API request
    const data = await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });

    if (data?.cart) {
      localStorage.setItem('joshpetshub_cart', JSON.stringify(data.cart));
      return data;
    }

    const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
    const existIdx = localCart.findIndex(item => (item.product?._id || item.product?.id) === productId);
    if (existIdx > -1) {
      localCart[existIdx].quantity += quantity;
    } else {
      localCart.push({ product: normProduct, quantity });
    }
    localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
    return { cart: localCart };
  } catch (error) {
    console.warn('addToCart API failed, falling back to local cart storage:', error);
    const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
    const existIdx = localCart.findIndex(item => (item.product?._id || item.product?.id) === productId);
    if (existIdx > -1) {
      localCart[existIdx].quantity += quantity;
    } else {
      localCart.push({ product: normProduct, quantity });
    }
    localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
    return { cart: localCart };
  }
});

export const updateCartQuantityAPI = createAsyncThunk('cart/updateQuantity', async ({ productId, quantity }, thunkAPI) => {
  try {
    const token = localStorage.getItem('joshpetshub_token');
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
      const existIdx = localCart.findIndex(item => (item.product?._id || item.product?.id) === productId);
      if (existIdx > -1) {
        localCart[existIdx].quantity = quantity;
      }
      localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
      return { cart: localCart };
    }

    const data = await apiRequest('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });

    if (data?.cart) {
      localStorage.setItem('joshpetshub_cart', JSON.stringify(data.cart));
      return data;
    }

    const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
    const existIdx = localCart.findIndex(item => (item.product?._id || item.product?.id) === productId);
    if (existIdx > -1) {
      localCart[existIdx].quantity = quantity;
    }
    localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
    return { cart: localCart };
  } catch (error) {
    const localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
    const existIdx = localCart.findIndex(item => (item.product?._id || item.product?.id) === productId);
    if (existIdx > -1) {
      localCart[existIdx].quantity = quantity;
    }
    localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
    return { cart: localCart };
  }
});

export const removeFromCartAPI = createAsyncThunk('cart/removeFromCart', async (productId, thunkAPI) => {
  try {
    const token = localStorage.getItem('joshpetshub_token');
    if (!token) {
      let localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
      localCart = localCart.filter(item => (item.product?._id || item.product?.id) !== productId);
      localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
      return { cart: localCart };
    }

    const data = await apiRequest(`/cart/${productId}`, {
      method: 'DELETE',
    });

    if (data?.cart) {
      localStorage.setItem('joshpetshub_cart', JSON.stringify(data.cart));
      return data;
    }

    let localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
    localCart = localCart.filter(item => (item.product?._id || item.product?.id) !== productId);
    localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
    return { cart: localCart };
  } catch (error) {
    let localCart = JSON.parse(localStorage.getItem('joshpetshub_cart') || '[]');
    localCart = localCart.filter(item => (item.product?._id || item.product?.id) !== productId);
    localStorage.setItem('joshpetshub_cart', JSON.stringify(localCart));
    return { cart: localCart };
  }
});

export const clearCartAPI = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('joshpetshub_token');
    localStorage.removeItem('joshpetshub_cart');
    if (token) {
      await apiRequest('/cart', { method: 'DELETE' });
    }
    return { cart: [] };
  } catch (error) {
    localStorage.removeItem('joshpetshub_cart');
    return { cart: [] };
  }
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

const initialState = {
  items: [],
  pricing: {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
  },
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
    }
  },
  extraReducers: (builder) => {
    const handleCartFulfilled = (state, action) => {
      state.loading = false;
      const rawCart = action.payload?.cart || [];
      state.items = rawCart.map(item => ({
        ...item,
        product: {
          ...item.product,
          _id: item.product?._id || item.product?.id,
          id: item.product?.id || item.product?._id,
          discountPrice: item.product?.discountPrice ?? item.product?.discount_price ?? null
        }
      }));
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
