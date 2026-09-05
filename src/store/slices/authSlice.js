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
      businessName: userData.businessName || userData.name,
      email: userData.email,
      mobile: userData.mobile,
      mobileCountryCode: userData.mobileCountryCode || '+91',
      whatsapp: userData.whatsapp || userData.mobile,
      whatsappCountryCode: userData.whatsappCountryCode || '+91',
      purpose: userData.purpose || 'Pet',
      password: userData.password,
      role: userData.role || 'CUSTOMER',
      serviceCategory: userData.serviceCategory || '',
      govtProofType: userData.govtProofType || 'AWBI / NGO Registration Certificate',
      govtProofNumber: userData.govtProofNumber || '',
      govtProofDoc: userData.govtProofDoc || '',
      verificationStatus: userData.verificationStatus || 'Verified',
      shelterCapacity: userData.shelterCapacity || 50,
      bio: userData.bio || '',
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
    // Check demo accounts & localStorage registered users
    try {
      const DEMO_ACCOUNTS = [
        {
          _id: 'prov-vet-01',
          name: 'Dr. Ramesh Kumar',
          email: 'dr.ramesh@pawora.com',
          mobile: '9845012345',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Consult a Vet',
          location: 'Koramangala, Bangalore, Karnataka'
        },
        {
          _id: 'prov-groom-02',
          name: 'Velvet Fur Grooming Studio',
          email: 'velvetfur@pawora.com',
          mobile: '9845199882',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Grooming Spa',
          location: 'Indiranagar, Bangalore, Karnataka'
        },
        {
          _id: 'prov-hostel-03',
          name: 'Happy Paws Pet Resort',
          email: 'happypaws@pawora.com',
          mobile: '9731299881',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Hostel / Boarding',
          location: 'Sarjapur Road, Bangalore, Karnataka'
        },
        {
          _id: 'prov-seller-04',
          name: 'Royal Paws Elite Pet Sellers',
          email: 'royalpaws@pawora.com',
          mobile: '9945122334',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Seller',
          location: 'Indiranagar, Bangalore, Karnataka'
        },
        {
          _id: 'prov-adopt-05',
          name: 'Hope Animal Sanctuary & Adoption Center',
          businessName: 'Hope Animal Welfare Foundation & Sanctuary',
          email: 'adopt@pawora.com',
          mobile: '9845577661',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Adoption',
          govtProofType: 'AWBI / Section 8 NGO Certificate',
          govtProofNumber: 'AWBI/KAR/2023/NGO-88942',
          govtProofDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800',
          verificationStatus: 'Verified',
          shelterCapacity: 85,
          bio: 'Dedicated non-profit rescue sanctuary providing compassionate foster care, medical rehabilitation, and loving forever homes.',
          location: 'Whitefield, Bangalore, Karnataka'
        },
        {
          _id: 'prov-walk-06',
          name: 'Swift Paws Walking',
          email: 'swiftpaws@pawora.com',
          mobile: '9845112233',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Walking & Fitness',
          location: 'Jayanagar, Bangalore, Karnataka'
        },
        {
          _id: 'prov-trans-07',
          name: 'SafePet Transit',
          email: 'safepet@pawora.com',
          mobile: '9845223344',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Transport & Relocation',
          location: 'Hebbal, Bangalore, Karnataka'
        },
        {
          _id: 'prov-train-08',
          name: 'Clever Canines',
          email: 'clevercanines@pawora.com',
          mobile: '9845334455',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Training & Behavior',
          location: 'HSR Layout, Bangalore, Karnataka'
        },
        {
          _id: 'prov-insure-09',
          name: 'PawProtect Insurance',
          email: 'pawinsure@pawora.com',
          mobile: '9845445566',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Insurance',
          location: 'Koramangala, Bangalore, Karnataka'
        },
        {
          _id: 'prov-breed-10',
          name: 'Elite Breeds Hub',
          email: 'elitebreed@pawora.com',
          mobile: '9845556677',
          password: 'Pass@1234',
          role: 'SERVICE_PROVIDER',
          serviceCategory: 'Pet Mating & Breeding',
          location: 'Yelahanka, Bangalore, Karnataka'
        },
        {
          _id: 'user-demo-01',
          name: 'Priya Sharma',
          email: 'priya@pawora.com',
          mobile: '9876543210',
          password: 'Pass@1234',
          role: 'CUSTOMER',
          serviceCategory: '',
          location: 'Bangalore, Karnataka'
        }
      ];

      const registeredUsers = JSON.parse(localStorage.getItem('pawora_registered_users') || '[]');
      const allAccounts = [...DEMO_ACCOUNTS, ...registeredUsers];
      
      const matched = allAccounts.find((u) => {
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

    return thunkAPI.rejectWithValue('Invalid credentials. Please check your email/mobile and password.');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    console.log('[authSlice] fetchProfile called, token:', token);
    
    // BYPASS BACKEND ENTIRELY FOR ALL USERS:
    // Since Vercel has a read-only filesystem, any changes made to users.json are lost.
    // We MUST prefer the localStorage version which has the user's latest local edits (like avatars).
    const saved = getInitialUser();
    if (saved) {
      return { user: saved };
    }
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
    // Avoid automatically logging out the user if the backend fetch fails
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    const token = localStorage.getItem('pawora_token');
    console.log('[authSlice] updateProfile called, token:', token, 'profileData:', profileData);
    
    // BYPASS BACKEND ENTIRELY FOR ALL USERS:
    // Vercel serverless functions cannot persist changes to users.json.
    const saved = getInitialUser();
    if (saved) {
      const updated = { ...saved, ...profileData };
      localStorage.setItem('pawora_user', JSON.stringify(updated));
      
      // Persist changes across logouts by saving to local registered users
      try {
        const registered = JSON.parse(localStorage.getItem('pawora_registered_users') || '[]');
        const idx = registered.findIndex(u => u._id === updated._id);
        if (idx !== -1) {
          registered[idx] = { ...registered[idx], ...updated };
        } else {
          registered.push(updated);
        }
        localStorage.setItem('pawora_registered_users', JSON.stringify(registered));
      } catch (e) {}

      return { user: updated };
    }
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
        state.error = action.payload;
        // Do not force logout on profile fetch failure to prevent accidental logouts
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
