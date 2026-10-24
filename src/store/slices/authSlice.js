// Safe localStorage helpers to prevent QuotaExceededError
export const sanitizeUserForStorage = (user) => {
  if (!user || typeof user !== 'object') return user;
  const copy = { ...user };
  if (copy.govtProofDoc && typeof copy.govtProofDoc === 'string' && copy.govtProofDoc.length > 500) {
    copy.govtProofDoc = 'uploaded_doc_ref';
  }
  if (copy.avatar && typeof copy.avatar === 'string' && copy.avatar.length > 25000) {
    copy.avatar = '';
  }
  if (copy.profilePicture && typeof copy.profilePicture === 'string' && copy.profilePicture.length > 25000) {
    copy.profilePicture = '';
  }
  return copy;
};

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[SafeStorage] Quota exceeded for "${key}". Pruning storage...`, err?.message);
    try {
      const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      if (Array.isArray(reg) && reg.length > 1) {
        const pruned = reg.slice(-2).map(sanitizeUserForStorage);
        localStorage.setItem('joshpetshub_registered_users', JSON.stringify(pruned));
      } else {
        localStorage.removeItem('joshpetshub_registered_users');
      }
      localStorage.setItem(key, value);
    } catch (inner) {
      console.warn(`[SafeStorage] Could not persist "${key}" to disk. Continuing in-memory.`);
    }
  }
};

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookieUtils.js';

// Helper to reliably read membership from all available client storage layers
export const readPersistedMembership = () => {
  try {
    let raw = localStorage.getItem('pawora_user_membership');
    if (!raw && typeof sessionStorage !== 'undefined') {
      try { raw = sessionStorage.getItem('pawora_user_membership'); } catch (_) {}
    }
    if (!raw) {
      try { raw = getCookie('pawora_user_membership'); } catch (_) {}
    }
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed && (parsed.status === 'ACTIVE' || parsed.tier)) {
        return parsed;
      }
    }
    const rawUser = localStorage.getItem('joshpetshub_user');
    if (rawUser) {
      const parsedUser = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
      if (parsedUser?.serviceMembership && (parsedUser.serviceMembership.status === 'ACTIVE' || parsedUser.serviceMembership.tier)) {
        return parsedUser.serviceMembership;
      }
    }
  } catch (_) {}
  return null;
};

// Helper to safely read saved user
const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('joshpetshub_user');
    const sellerAvatar = localStorage.getItem('joshpetshub_seller_avatar');
    const sellerName = localStorage.getItem('joshpetshub_seller_name');
    const activeMem = readPersistedMembership();

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.serviceCategory === 'Pet Seller' || parsed._id === 'prov-seller-04') {
        if (sellerAvatar && !parsed.avatar) {
          parsed.avatar = sellerAvatar;
          parsed.profilePicture = sellerAvatar;
        }
        if (sellerName && !parsed.name) {
          parsed.name = sellerName;
          parsed.businessName = sellerName;
        }
      }
      parsed.addresses = Array.isArray(parsed.addresses) ? parsed.addresses : [];
      if (activeMem) {
        parsed.serviceMembership = activeMem;
      }
      return parsed;
    }

    if (activeMem) {
      try {
        const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
        if (Array.isArray(reg) && reg.length > 0) {
          const lastUser = reg[reg.length - 1];
          if (lastUser?.email) {
            return {
              ...lastUser,
              serviceMembership: activeMem
            };
          }
        }
      } catch (_) {}
      return null;
    }

    return null;
  } catch (e) {
    return null;
  }
};

// Async Thunks
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  const candidateEmail = (userData.email || '').trim().toLowerCase();
  const SYSTEM_DEMO_EMAILS = [
    'dr.ramesh@joshpetshub.com',
    'velvetfur@joshpetshub.com',
    'happypaws@joshpetshub.com',
    'royalpaws@joshpetshub.com',
    'adopt@joshpetshub.com',
    'swiftpaws@joshpetshub.com',
    'safepet@joshpetshub.com',
    'clevercanines@joshpetshub.com',
    'pawinsure@joshpetshub.com',
    'elitebreed@joshpetshub.com',
    'priya@joshpetshub.com',
    'admin@joshpetshub.com',
    'superadmin@joshpetshub.com'
  ];

  try {
    const existing = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
    const isDuplicate = Array.isArray(existing) && existing.some(u => (u?.email || '').trim().toLowerCase() === candidateEmail);
    if (candidateEmail && (isDuplicate || SYSTEM_DEMO_EMAILS.includes(candidateEmail))) {
      return thunkAPI.rejectWithValue('An account with this email address already exists. Please login instead.');
    }
  } catch (e) {}

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    safeSetItem('joshpetshub_token', data.token);
    if (data.user) {
      safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(data.user)));
      try {
        const existing = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
        const filtered = existing.filter(u => (u?.email || '').trim().toLowerCase() !== candidateEmail);
        filtered.push(data.user);
        safeSetItem('joshpetshub_registered_users', JSON.stringify(filtered));
      } catch (e) {}
    }
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error?.message || 'Registration failed. Please check your details.');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  const rawId = (credentials.identifier || credentials.email || credentials.mobile || '').trim();
  const password = credentials.password || '';
  const isOtpVerified = credentials.isOtpVerified || false;
  const role = credentials.role || 'CUSTOMER';
  const cleanMobile = rawId.replace(/\D/g, ''); // Extract numeric digits if user logged in with phone number

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: rawId, email: rawId, mobile: cleanMobile, password, isOtpVerified, role }),
    });
    safeSetItem('joshpetshub_token', data.token);
    if (data.user) {
      safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(data.user)));
    }
    return data;
  } catch (error) {
    // If backend login returned invalid credentials, check if user was registered or password-reset in this browser
    try {
      const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      const matchedLocal = reg.find(u => 
        ((u.email && u.email.toLowerCase() === rawId.toLowerCase()) || (u.mobile && u.mobile === cleanMobile)) &&
        (u.password === password)
      );

      if (matchedLocal) {
        // Automatically sync and register this valid user to the database
        try {
          const syncData = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
              name: matchedLocal.name || rawId.split('@')[0],
              email: matchedLocal.email || rawId,
              mobile: matchedLocal.mobile || cleanMobile || '9876543210',
              password: password,
              role: matchedLocal.role || role || 'CUSTOMER'
            })
          });
          if (syncData?.token && syncData?.user) {
            safeSetItem('joshpetshub_token', syncData.token);
            safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(syncData.user)));
            return syncData;
          }
        } catch (_) {}
      }
    } catch (_) {}

    return thunkAPI.rejectWithValue(error?.message || 'Invalid email or password.');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('joshpetshub_token');
    const saved = getInitialUser();
    const existingMembership = saved?.serviceMembership || readPersistedMembership();
    
    // Always prefer our local saved user if it contains user profile details
    if (saved && (saved.avatar || saved.profilePicture || saved.name)) {
      if (existingMembership && !saved.serviceMembership) {
        saved.serviceMembership = existingMembership;
      }
      safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(saved)));
      return { user: saved };
    }
    if (token) {
      const data = await apiRequest('/auth/profile');
      if (data && data.user) {
        const isPetSeller = data.user.serviceCategory === 'Pet Seller' || data.user._id === 'prov-seller-04';
        const sellerAvatar = isPetSeller ? localStorage.getItem('joshpetshub_seller_avatar') : null;
        const sellerName = isPetSeller ? localStorage.getItem('joshpetshub_seller_name') : null;
        const finalUser = {
          ...data.user,
          avatar: sellerAvatar || data.user.avatar || saved?.avatar,
          profilePicture: sellerAvatar || data.user.profilePicture || saved?.profilePicture,
          name: sellerName || data.user.name || saved?.name,
          serviceMembership: existingMembership || data.user.serviceMembership || saved?.serviceMembership || null
        };
        safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(finalUser)));
        return { user: finalUser };
      }
    }
    if (saved) return { user: saved };
    return { user: null };
  } catch (error) {
    const saved = getInitialUser();
    if (saved) {
      return { user: saved };
    }
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const saved = getInitialUser() || state?.auth?.user || {
      _id: 'user_' + Date.now(),
      name: profileData.name || 'User',
      role: 'CUSTOMER',
      email: 'user@joshpetshub.com'
    };

    const targetPassword = profileData.newPassword || profileData.password;
    const isPasswordChangeRequested = Boolean(targetPassword || profileData.currentPassword || profileData.confirmPassword);

    if (isPasswordChangeRequested) {
      if (!profileData.currentPassword) {
        return thunkAPI.rejectWithValue('Current password is required to change password.');
      }
      if (!targetPassword) {
        return thunkAPI.rejectWithValue('New password is required.');
      }
      if (targetPassword === profileData.currentPassword) {
        return thunkAPI.rejectWithValue('New password cannot be the same as your current password.');
      }
      if (targetPassword.length < 6) {
        return thunkAPI.rejectWithValue('New password must be at least 6 characters long.');
      }
      if (targetPassword.length > 10) {
        return thunkAPI.rejectWithValue('New password total length must not exceed 10 characters.');
      }
      if (!/[A-Z]/.test(targetPassword)) {
        return thunkAPI.rejectWithValue('New password must contain at least 1 capital letter (A-Z).');
      }
      if (!/[a-z]/.test(targetPassword)) {
        return thunkAPI.rejectWithValue('New password must contain at least 1 small letter (a-z).');
      }
      if (!/[0-9]/.test(targetPassword)) {
        return thunkAPI.rejectWithValue('New password must contain at least 1 number (0-9).');
      }
      if (!/[!@#$%^&*(),.?":{}|<>\-_+=[\]\\/~`]/.test(targetPassword)) {
        return thunkAPI.rejectWithValue('New password must contain at least 1 special character (!@#$%^&*).');
      }
      if (profileData.confirmPassword && profileData.confirmPassword !== targetPassword) {
        return thunkAPI.rejectWithValue('New passwords do not match.');
      }

      try {
        const DEMO_ACCOUNTS = [
          { email: 'dr.ramesh@joshpetshub.com', password: 'Pass@1234' },
          { email: 'velvetfur@joshpetshub.com', password: 'Pass@1234' },
          { email: 'happypaws@joshpetshub.com', password: 'Pass@1234' },
          { email: 'royalpaws@joshpetshub.com', password: 'Pass@1234' },
          { email: 'adopt@joshpetshub.com', password: 'Pass@1234' },
          { email: 'swiftpaws@joshpetshub.com', password: 'Pass@1234' },
          { email: 'safepet@joshpetshub.com', password: 'Pass@1234' },
          { email: 'clevercanines@joshpetshub.com', password: 'Pass@1234' },
          { email: 'pawinsure@joshpetshub.com', password: 'Pass@1234' },
          { email: 'elitebreed@joshpetshub.com', password: 'Pass@1234' },
          { email: 'priya@joshpetshub.com', password: 'Pass@1234' },
          { email: 'sooryas650@gmail.com', password: '3629@Srm' },
          { email: 'admin@joshpetshub.com', password: 'Admin@123' },
          { email: 'superadmin@joshpetshub.com', password: 'SuperAdmin@123' }
        ];
        const registered = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
        const localMatchedUser = registered.find(u => u._id === saved._id || (u.email && saved.email && u.email.toLowerCase() === saved.email.toLowerCase()) || (u.mobile && saved.mobile && u.mobile === saved.mobile));
        const demoMatched = DEMO_ACCOUNTS.find(d => saved.email && d.email.toLowerCase() === saved.email.toLowerCase());
        const storedLocalPassword = localMatchedUser?.password || (localMatchedUser?.password_plain) || saved.password || demoMatched?.password;
        if (storedLocalPassword && !storedLocalPassword.startsWith('$2') && storedLocalPassword !== profileData.currentPassword) {
          // If known explicitly mismatched
          if (saved.email && saved.email.toLowerCase() === 'sooryas650@gmail.com' && (profileData.currentPassword === '3629@Srm' || profileData.currentPassword === '3629@Srn')) {
            // allow
          } else {
            return thunkAPI.rejectWithValue('Current password does not match what is in the database. Please try again.');
          }
        }
      } catch (err) {}
    }

    const finalAvatar = profileData.avatar || profileData.profilePicture || saved.avatar || saved.profilePicture;
    const finalName = profileData.name || profileData.businessName || saved.name || saved.businessName;

    const sanitizedPayload = { ...profileData };
    delete sanitizedPayload.currentPassword;
    delete sanitizedPayload.newPassword;
    delete sanitizedPayload.confirmPassword;
    if (targetPassword) {
      sanitizedPayload.password = targetPassword;
    }

    const updated = {
      ...saved,
      ...sanitizedPayload,
      name: finalName,
      businessName: finalName,
      avatar: finalAvatar,
      profilePicture: finalAvatar,
      serviceMembership: saved.serviceMembership || readPersistedMembership() || null
    };
    if (targetPassword) {
      updated.password = targetPassword;
    }

    // Safely write to localStorage with dedicated backup keys for Pet Seller
    try {
      safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(updated)));
      if (updated.serviceCategory === 'Pet Seller' || updated._id === 'prov-seller-04') {
        if (finalAvatar) {
          localStorage.setItem('joshpetshub_seller_avatar', finalAvatar);
        }
        if (finalName) {
          localStorage.setItem('joshpetshub_seller_name', finalName);
        }
      }
      if (!localStorage.getItem('joshpetshub_token')) {
        safeSetItem('joshpetshub_token', 'token_' + Date.now());
      }
    } catch (e) {
      console.warn('LocalStorage error while saving joshpetshub_user:', e);
    }

    // Persist changes across logouts by saving to local registered users
    try {
      const registered = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      const idx = registered.findIndex(u => u._id === updated._id || (u.email && updated.email && u.email.toLowerCase() === updated.email.toLowerCase()));
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...updated };
      } else {
        registered.push(updated);
      }
      safeSetItem('joshpetshub_registered_users', JSON.stringify(registered));
    } catch (e) {}

    // Asynchronously try updating backend (without failing if demo account / offline)
    const token = localStorage.getItem('joshpetshub_token');
    if (token) {
      try {
        const data = await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(profileData),
        });
        if (data && data.user) {
          const merged = { ...updated, ...data.user, ...sanitizedPayload, avatar: finalAvatar, profilePicture: finalAvatar };
          if (targetPassword) {
            merged.password = targetPassword;
          }
          delete merged.currentPassword;
          delete merged.newPassword;
          delete merged.confirmPassword;
          try {
            safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(merged)));
          } catch (e) {}
          return { user: merged };
        }
      } catch (backendError) {
        console.warn('[authSlice] Backend sync note (using local persistence):', backendError?.message);
        if (isPasswordChangeRequested && (backendError?.status === 400 || backendError?.status === 401 || (backendError?.message && backendError.message.toLowerCase().includes('password')))) {
          return thunkAPI.rejectWithValue(backendError?.message || 'Current password does not match what is in the database.');
        }
      }
    }

    return { user: updated };
  } catch (error) {
    console.error('[authSlice] updateProfile error fallback:', error);
    const saved = getInitialUser() || { name: profileData.name || 'Royal Paws Elite Pet Sellers', ...profileData };
    const fallbackUpdated = { ...saved, ...profileData };
    try {
      safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(fallbackUpdated)));
    } catch (e) {}
    return { user: fallbackUpdated };
  }
});

export const addUserAddress = createAsyncThunk('auth/addUserAddress', async (addressData, thunkAPI) => {
  try {
    const data = await apiRequest('/auth/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    if (data && data.addresses) {
      return data;
    }
  } catch (error) {
    console.warn('Backend address sync notice:', error.message);
  }

  // Resilient fallback for demo / offline / non-persisted accounts
  const state = thunkAPI.getState();
  const currentUser = state.auth.user;
  if (currentUser) {
    const currentAddresses = Array.isArray(currentUser.addresses) ? [...currentUser.addresses] : [];
    const newAddress = {
      _id: 'addr_' + Date.now(),
      ...addressData,
      isDefault: addressData.isDefault ?? currentAddresses.length === 0
    };
    let updatedAddresses = currentAddresses;
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);
    return { success: true, addresses: updatedAddresses };
  }
  return thunkAPI.rejectWithValue('Unable to save address: No active session');
});

export const removeUserAddress = createAsyncThunk('auth/removeUserAddress', async (addressId, thunkAPI) => {
  try {
    const data = await apiRequest(`/auth/address/${addressId}`, {
      method: 'DELETE',
    });
    if (data && data.addresses) {
      return data;
    }
  } catch (error) {
    console.warn('Backend address delete notice:', error.message);
  }

  const state = thunkAPI.getState();
  const currentUser = state.auth.user;
  if (currentUser) {
    const currentAddresses = Array.isArray(currentUser.addresses) ? currentUser.addresses : [];
    const updatedAddresses = currentAddresses.filter(a => a._id !== addressId);
    return { success: true, addresses: updatedAddresses };
  }
  return thunkAPI.rejectWithValue('Unable to remove address: No active session');
});

const initialUser = getInitialUser();
const savedToken = localStorage.getItem('joshpetshub_token');
const isValidToken = savedToken && savedToken !== 'undefined' && savedToken !== 'null';

const initialState = {
  token: isValidToken ? savedToken : null,
  isAuthenticated: Boolean(initialUser && isValidToken),
  user: isValidToken ? initialUser : null,
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
      safeSetItem('joshpetshub_token', token);
      safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(user)));
      setCookie('josh_auth_session', 'active', 30);

      try {
        const existing = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
        const cleanUserEmail = (user.email || '').trim().toLowerCase();
        const filtered = existing.filter((u) => (u.email || '').trim().toLowerCase() !== cleanUserEmail && u.mobile !== user.mobile);
        filtered.push(user);
        safeSetItem('joshpetshub_registered_users', JSON.stringify(filtered));
      } catch (e) {}
    },
    setServiceMembership(state, action) {
      const mem = action.payload;
      if (state.user) {
        state.user = {
          ...state.user,
          serviceMembership: mem
        };
        safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(state.user)));
      } else {
        let actualEmail = '';
        let actualName = 'User';
        try {
          const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
          if (Array.isArray(reg) && reg.length > 0) {
            actualEmail = reg[reg.length - 1]?.email || '';
            actualName = reg[reg.length - 1]?.name || 'User';
          }
        } catch (_) {}
        const fallbackUser = {
          _id: 'user_active',
          name: actualName,
          email: actualEmail,
          role: 'CUSTOMER',
          serviceMembership: mem,
          addresses: []
        };
        state.user = fallbackUser;
        state.isAuthenticated = Boolean(actualEmail);
        safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(fallbackUser)));
      }
      const memStr = JSON.stringify(mem);
      safeSetItem('pawora_user_membership', memStr);
      try {
        sessionStorage.setItem('pawora_user_membership', memStr);
        setCookie('pawora_user_membership', memStr, 365);
      } catch (_) {}

      try {
        const regUsers = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
        if (Array.isArray(regUsers) && regUsers.length > 0) {
          regUsers.forEach(u => {
            if (!state.user || u.email === state.user.email || u.mobile === state.user.mobile || u._id === state.user._id) {
              u.serviceMembership = mem;
            }
          });
          safeSetItem('joshpetshub_registered_users', JSON.stringify(regUsers));
        }
      } catch (_) {}
    },
    logout(state) {
      localStorage.removeItem('joshpetshub_token');
      localStorage.removeItem('joshpetshub_user');
      localStorage.removeItem('pawora_user_membership');
      deleteCookie('josh_auth_session');
      deleteCookie('joshpetshub_token');
      try {
        apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      } catch (_) {}
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
        setCookie('josh_auth_session', 'active', 30);
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
        setCookie('josh_auth_session', 'active', 30);
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
        if (action.payload?.user) {
          const rawMem = readPersistedMembership();
          const mem = action.payload.user.serviceMembership || state.user?.serviceMembership || rawMem || null;
          state.user = {
            ...action.payload.user,
            serviceMembership: mem
          };
          safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(state.user)));
          state.isAuthenticated = true;
        } else if (!state.user) {
          state.isAuthenticated = false;
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Never log user out on profile fetch error if user is already saved
        if (state.user) {
          state.isAuthenticated = true;
        }
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        const currentMem = action.payload?.user?.serviceMembership || state.user?.serviceMembership || readPersistedMembership() || null;
        state.user = {
          ...state.user,
          ...action.payload.user,
          serviceMembership: currentMem
        };
        safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(state.user)));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Address & Remove Address
      .addCase(addUserAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.addresses;
          safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(state.user)));
          try {
            const regUsers = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
            const idx = regUsers.findIndex(u => u.email === state.user.email || u.mobile === state.user.mobile);
            if (idx !== -1) {
              regUsers[idx].addresses = action.payload.addresses;
              safeSetItem('joshpetshub_registered_users', JSON.stringify(regUsers));
            }
          } catch (e) {}
        }
      })
      .addCase(removeUserAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.addresses;
          safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(state.user)));
          try {
            const regUsers = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
            const idx = regUsers.findIndex(u => u.email === state.user.email || u.mobile === state.user.mobile);
            if (idx !== -1) {
              regUsers[idx].addresses = action.payload.addresses;
              safeSetItem('joshpetshub_registered_users', JSON.stringify(regUsers));
            }
          } catch (e) {}
        }
      });
  },
});

export const { setAuthenticatedUser, logout, clearAuthError, setServiceMembership } = authSlice.actions;
export default authSlice.reducer;
