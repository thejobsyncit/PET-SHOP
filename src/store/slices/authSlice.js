import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Async Thunks
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem('pawora_token', data.token);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('pawora_token', data.token);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, thunkAPI) => {
  try {
    return await apiRequest('/auth/profile');
  } catch (error) {
    localStorage.removeItem('pawora_token');
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const addUserAddress = createAsyncThunk('auth/addUserAddress', async (addressData, thunkAPI) => {
  try {
    return await apiRequest('/auth/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const removeUserAddress = createAsyncThunk('auth/removeUserAddress', async (addressId, thunkAPI) => {
  try {
    return await apiRequest(`/auth/address/${addressId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  token: localStorage.getItem('pawora_token') || null,
  isAuthenticated: !!localStorage.getItem('pawora_token'),
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('pawora_token');
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload.user
        };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Address & Remove Address (updates addresses array inside state.user)
      .addCase(addUserAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.addresses;
        }
      })
      .addCase(removeUserAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.addresses;
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
