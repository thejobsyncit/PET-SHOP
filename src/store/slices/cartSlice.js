import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Helper to calculate totals
const calculateTotals = (items, appliedCoupon = null) => {
  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + (price * item.quantity);
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
    const token = localStorage.getItem('pawora_token');
    if (!token) {
      // Return guest cart from localStorage
      const localCart = JSON.parse(localStorage.getItem('pawora_cart') || '[]');
      return { cart: localCart };
    }
    return await apiRequest('/cart');
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const addToCartAPI = createAsyncThunk('cart/addToCart', async ({ product, quantity = 1 }, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    if (!token) {
      // Handle local guest cart
      const localCart = JSON.parse(localStorage.getItem('pawora_cart') || '[]');
      const existIdx = localCart.findIndex(item => item.product._id === product._id);
      if (existIdx > -1) {
        localCart[existIdx].quantity += quantity;
      } else {
        localCart.push({ product, quantity });
      }
      localStorage.setItem('pawora_cart', JSON.stringify(localCart));
      return { cart: localCart };
    }
    
    // Authenticated API request
    const data = await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product._id, quantity }),
    });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateCartQuantityAPI = createAsyncThunk('cart/updateQuantity', async ({ productId, quantity }, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('pawora_cart') || '[]');
      const existIdx = localCart.findIndex(item => item.product._id === productId);
      if (existIdx > -1) {
        localCart[existIdx].quantity = quantity;
      }
      localStorage.setItem('pawora_cart', JSON.stringify(localCart));
      return { cart: localCart };
    }

    return await apiRequest('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const removeFromCartAPI = createAsyncThunk('cart/removeFromCart', async (productId, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    if (!token) {
      let localCart = JSON.parse(localStorage.getItem('pawora_cart') || '[]');
      localCart = localCart.filter(item => item.product._id !== productId);
      localStorage.setItem('pawora_cart', JSON.stringify(localCart));
      return { cart: localCart };
    }

    return await apiRequest(`/cart/${productId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const clearCartAPI = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    if (!token) {
      localStorage.removeItem('pawora_cart');
      return { cart: [] };
    }
    return await apiRequest('/cart', {
      method: 'DELETE',
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
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
      state.items = action.payload.cart || [];
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
