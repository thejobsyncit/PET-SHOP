import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

// Helper to safely read saved user
const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('pawora_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

// Async Thunks
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem('pawora_token', data.token);
    if (data.user) {
      localStorage.setItem('pawora_user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    // Fallback: create simulated user session for offline / client demo
    const simulatedUser = {
      _id: 'user_' + Date.now(),
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      mobileCountryCode: userData.mobileCountryCode || '+91',
      whatsapp: userData.whatsapp || userData.mobile,
      whatsappCountryCode: userData.whatsappCountryCode || '+91',
      purpose: userData.purpose || 'Pet',
      password: userData.password,
      role: userData.role || 'CUSTOMER',
      serviceCategory: userData.serviceCategory || '',
      location: userData.location || 'Bangalore, Karnataka',
      addresses: []
    };
    const simulatedToken = 'token_' + Date.now();
    localStorage.setItem('pawora_token', simulatedToken);
    localStorage.setItem('pawora_user', JSON.stringify(simulatedUser));

    try {
      const existing = JSON.parse(localStorage.getItem('pawora_registered_users') || '[]');
      const filtered = existing.filter(u => u.email !== simulatedUser.email && u.mobile !== simulatedUser.mobile);
      filtered.push(simulatedUser);
      localStorage.setItem('pawora_registered_users', JSON.stringify(filtered));
    } catch (e) {}

    return { token: simulatedToken, user: simulatedUser };
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  const rawId = (credentials.identifier || credentials.email || credentials.mobile || '').trim();
  const password = credentials.password || '';
  const cleanMobile = rawId.replace(/\D/g, ''); // Extract numeric digits if user logged in with phone number

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: rawId, email: rawId, mobile: cleanMobile, password }),
    });
    localStorage.setItem('pawora_token', data.token);
    if (data.user) {
      localStorage.setItem('pawora_user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    // Check localStorage registered users (only registered users can log in)
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('pawora_registered_users') || '[]');
      
      const matched = registeredUsers.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === rawId.toLowerCase();
        const userMobileClean = (u.mobile || '').replace(/\D/g, '');
        const mobileMatch = cleanMobile.length >= 10 && userMobileClean && (
          userMobileClean === cleanMobile ||
          userMobileClean.endsWith(cleanMobile) ||
          cleanMobile.endsWith(userMobileClean)
        );
        const passMatch = u.password === password;
        return (emailMatch || mobileMatch) && passMatch;
      });

      if (matched) {
        const token = 'token_' + Date.now();
        localStorage.setItem('pawora_token', token);
        localStorage.setItem('pawora_user', JSON.stringify(matched));
        return { token, user: matched };
      }
    } catch (e) {}

    return thunkAPI.rejectWithValue('Invalid credentials. Only registered user credentials can log in.');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, thunkAPI) => {
  try {
    const data = await apiRequest('/auth/profile');
    if (data && data.user) {
      localStorage.setItem('pawora_user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    const saved = getInitialUser();
    if (saved) {
      return { user: saved };
    }
    localStorage.removeItem('pawora_token');
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (data && data.user) {
      localStorage.setItem('pawora_user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    const saved = getInitialUser();
    if (saved) {
      const updated = { ...saved, ...profileData };
      localStorage.setItem('pawora_user', JSON.stringify(updated));
      return { user: updated };
    }
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

const initialUser = getInitialUser();

const initialState = {
  token: localStorage.getItem('pawora_token') || null,
  isAuthenticated: !!localStorage.getItem('pawora_token'),
  user: initialUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedUser(state, action) {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.user = user;
      state.loading = false;
      state.error = null;
      localStorage.setItem('pawora_token', token);
      localStorage.setItem('pawora_user', JSON.stringify(user));

      try {
        const existing = JSON.parse(localStorage.getItem('pawora_registered_users') || '[]');
        const filtered = existing.filter((u) => u.email !== user.email && u.mobile !== user.mobile);
        filtered.push(user);
        localStorage.setItem('pawora_registered_users', JSON.stringify(filtered));
      } catch (e) {}
    },
    logout(state) {
      localStorage.removeItem('pawora_token');
      localStorage.removeItem('pawora_user');
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
        if (!state.user) {
          state.isAuthenticated = false;
          state.token = null;
        }
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
      // Add Address & Remove Address
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

export const { setAuthenticatedUser, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
