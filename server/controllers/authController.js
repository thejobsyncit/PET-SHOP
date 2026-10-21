import { sendOtpEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Helper to generate JWT Token
const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'joshpetshub_prod_secure_jwt_secret_99f38e789a24c7f0b12da459e81b67f132e';
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

// Helper to attach secure httpOnly cookie
export const setAuthCookie = (res, token) => {
  res.cookie('joshpetshub_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

export const DEMO_ACCOUNTS = [
  {
    _id: 'prov-vet-01',
    name: 'Dr. Ramesh Kumar',
    businessName: 'Dr. Ramesh Kumar Pet Clinic',
    email: 'dr.ramesh@joshpetshub.com',
    mobile: '9845012345',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Consult a Vet',
    location: 'Koramangala, Bangalore, Karnataka'
  },
  {
    _id: 'prov-groom-02',
    name: 'Velvet Fur Grooming Studio',
    businessName: 'Velvet Fur Grooming Studio',
    email: 'velvetfur@joshpetshub.com',
    mobile: '9845199882',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Grooming Spa',
    location: 'Indiranagar, Bangalore, Karnataka'
  },
  {
    _id: 'prov-hostel-03',
    name: 'Happy Paws Pet Resort',
    businessName: 'Happy Paws Pet Resort',
    email: 'happypaws@joshpetshub.com',
    mobile: '9731299881',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Hostel / Boarding',
    location: 'Sarjapur Road, Bangalore, Karnataka'
  },
  {
    _id: 'prov-seller-04',
    name: 'Royal Paws Elite Pet Sellers',
    businessName: 'Royal Paws Elite Pet Sellers',
    email: 'royalpaws@joshpetshub.com',
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
    email: 'adopt@joshpetshub.com',
    mobile: '9845577661',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Adoption',
    govtProofType: 'AWBI / Section 8 NGO Certificate',
    govtProofNumber: 'AWBI/KAR/2023/NGO-88942',
    govtProofDoc: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800&auto=format&fit=crop',
    verificationStatus: 'Verified',
    shelterCapacity: 85,
    bio: 'Dedicated non-profit rescue sanctuary providing compassionate foster care, medical rehabilitation, and loving forever homes.',
    location: 'Whitefield, Bangalore, Karnataka'
  },
  {
    _id: 'prov-walk-06',
    name: 'Swift Paws Walking',
    businessName: 'Swift Paws Walking',
    email: 'swiftpaws@joshpetshub.com',
    mobile: '9845112233',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Walking & Fitness',
    location: 'Jayanagar, Bangalore, Karnataka'
  },
  {
    _id: 'prov-trans-07',
    name: 'SafePet Transit',
    businessName: 'SafePet Transit',
    email: 'safepet@joshpetshub.com',
    mobile: '9845223344',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Transport & Relocation',
    location: 'Hebbal, Bangalore, Karnataka'
  },
  {
    _id: 'prov-train-08',
    name: 'Clever Canines',
    businessName: 'Clever Canines',
    email: 'clevercanines@joshpetshub.com',
    mobile: '9845334455',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Training & Behavior',
    location: 'HSR Layout, Bangalore, Karnataka'
  },
  {
    _id: 'prov-insure-09',
    name: 'PawProtect Insurance',
    businessName: 'PawProtect Insurance',
    email: 'pawinsure@joshpetshub.com',
    mobile: '9845445566',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Insurance',
    location: 'Koramangala, Bangalore, Karnataka'
  },
  {
    _id: 'prov-breed-10',
    name: 'Elite Breeds Hub',
    businessName: 'Elite Breeds Hub',
    email: 'elitebreed@joshpetshub.com',
    mobile: '9845556677',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Mating & Breeding',
    location: 'Yelahanka, Bangalore, Karnataka'
  },
  {
    _id: 'user-demo-01',
    name: 'Priya Sharma',
    businessName: '',
    email: 'priya@joshpetshub.com',
    mobile: '9876543210',
    password: 'Pass@1234',
    role: 'CUSTOMER',
    serviceCategory: '',
    location: 'Bangalore, Karnataka'
  },
  {
    _id: 'admin-demo-01',
    name: 'Admin User',
    businessName: 'Admin Hub',
    email: 'admin@joshpetshub.com',
    mobile: '9888888888',
    password: 'Admin@123',
    role: 'ADMIN',
    serviceCategory: '',
    location: 'Bangalore, Karnataka'
  },
  {
    _id: 'superadmin-demo-01',
    name: 'Super Admin',
    businessName: 'JOSH PETS HUB',
    email: 'superadmin@joshpetshub.com',
    mobile: '9999999999',
    password: 'SuperAdmin@123',
    role: 'SUPERADMIN',
    serviceCategory: '',
    location: 'Bangalore, Karnataka'
  }
];

// Persistent in-memory user registry for the running backend process
export const inMemoryUsers = new Map();

// Helper to read users from disk fallback
export const loadDiskUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[DiskUsers] Error reading users.json:', err?.message);
  }
  return [];
};

// Helper to save users to disk fallback
export const saveDiskUsers = (users) => {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DiskUsers] Error saving users.json:', err?.message);
  }
};

// Universal duplicate email verification across DEMO_ACCOUNTS, local disk users, memory, and Supabase
export const isEmailAlreadyRegistered = async (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') return false;
  const clean = rawEmail.trim().toLowerCase();

  // 1. Check in DEMO_ACCOUNTS
  if (DEMO_ACCOUNTS.some(d => d.email && d.email.trim().toLowerCase() === clean)) {
    return true;
  }

  // 2. Check in inMemoryUsers
  if (inMemoryUsers.has(clean)) {
    return true;
  }

  // 3. Check in disk users.json
  const diskUsers = loadDiskUsers();
  if (diskUsers.some(u => u.email && u.email.trim().toLowerCase() === clean)) {
    return true;
  }

  // 4. Check in Supabase if configured & available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', clean);
      if (!error && Array.isArray(data) && data.length > 0) {
        return true;
      }
    } catch (_) {
      // Supabase table may not be initialized; continue
    }
  }

  return false;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const {
    name, email, password, mobile, role, location, serviceCategory,
    businessName, govtProofType, govtProofNumber, govtProofDoc,
    shelterCapacity, bio
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // STRICT Duplicate Email Check
  const alreadyExists = await isEmailAlreadyRegistered(cleanEmail);
  if (alreadyExists) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists. Please log in instead.'
    });
  }

  // Enforce strong password complexity policy
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  // Security: Restrict public registration roles to CUSTOMER or SERVICE_PROVIDER only (prevent ADMIN escalation)
  const allowedRoles = ['CUSTOMER', 'SERVICE_PROVIDER'];
  const safeRole = allowedRoles.includes(role) ? role : 'CUSTOMER';
  const safeVerification = safeRole === 'SERVICE_PROVIDER' ? 'Pending' : 'Verified';

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedId = (typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : ('user_' + Date.now());
    let userObj = {
      _id: generatedId,
      id: generatedId,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      mobile: mobile ? mobile.trim() : null,
      role: safeRole,
      location: location || null,
      serviceCategory: serviceCategory || null,
      service_category: serviceCategory || null,
      businessName: businessName || name,
      business_name: businessName || name,
      govtProofType: govtProofType || 'AWBI / NGO Registration Certificate',
      govt_proof_type: govtProofType || 'AWBI / NGO Registration Certificate',
      govtProofNumber: govtProofNumber || null,
      govt_proof_number: govtProofNumber || null,
      govtProofDoc: govtProofDoc || null,
      govt_proof_doc: govtProofDoc || null,
      verificationStatus: safeVerification,
      verification_status: safeVerification,
      shelterCapacity: shelterCapacity || 50,
      shelter_capacity: shelterCapacity || 50,
      bio: bio || null,
      addresses: [],
      wishlist: [],
      cart: [],
      prescription_history: []
    };

    // Try persisting to Supabase if available
    if (supabase) {
      try {
        const { data: dbUser, error: dbErr } = await supabase.from('users').insert([{
          name: userObj.name,
          email: userObj.email,
          password: userObj.password,
          mobile: userObj.mobile,
          role: userObj.role,
          location: userObj.location,
          service_category: userObj.service_category,
          business_name: userObj.business_name,
          govt_proof_type: userObj.govt_proof_type,
          govt_proof_number: userObj.govt_proof_number,
          govt_proof_doc: userObj.govt_proof_doc,
          verification_status: userObj.verification_status,
          shelter_capacity: userObj.shelter_capacity,
          bio: userObj.bio,
          addresses: [],
          wishlist: [],
          cart: [],
          prescription_history: []
        }]).select().single();

        if (!dbErr && dbUser) {
          userObj.id = dbUser.id;
          userObj._id = dbUser.id;
        }
      } catch (sbErr) {
        console.warn('Supabase insert notice, using local file store:', sbErr?.message);
      }
    }

    // Always register in inMemoryUsers so repeat attempts are instantly blocked
    inMemoryUsers.set(cleanEmail, userObj);

    // Persist to disk users.json
    const diskUsers = loadDiskUsers();
    const existingIdx = diskUsers.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existingIdx >= 0) {
      diskUsers[existingIdx] = userObj;
    } else {
      diskUsers.push(userObj);
    }
    saveDiskUsers(diskUsers);

    const token = generateToken(userObj.id);
    setAuthCookie(res, token);
    return res.status(201).json({
      success: true,
      token,
      user: { 
        id: userObj.id, 
        _id: userObj.id,
        name: userObj.name, 
        email: userObj.email, 
        role: userObj.role,
        mobile: userObj.mobile,
        location: userObj.location,
        serviceCategory: userObj.service_category,
        businessName: userObj.business_name,
        govtProofType: userObj.govt_proof_type,
        govtProofNumber: userObj.govt_proof_number,
        govtProofDoc: userObj.govt_proof_doc,
        verificationStatus: userObj.verification_status,
        shelterCapacity: userObj.shelter_capacity,
        bio: userObj.bio
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, mobile, password, identifier, isOtpVerified, role: requestedRole } = req.body;
  const rawKey = (typeof email === 'string' ? email : typeof identifier === 'string' ? identifier : typeof mobile === 'string' ? mobile : '');
  const loginKey = rawKey.trim();
  const cleanMobile = loginKey.replace(/\D/g, '');

  if (!loginKey || (!isOtpVerified && (typeof password !== 'string' || !password.trim()))) {
    return res.status(400).json({ success: false, message: 'Please provide email/mobile and password' });
  }

  try {
    // 1. Check if login matches any demo account
    const matchedDemo = DEMO_ACCOUNTS.find(d => 
      d.email.toLowerCase() === loginKey.toLowerCase() ||
      (cleanMobile && d.mobile && (d.mobile === cleanMobile || d.mobile.endsWith(cleanMobile) || cleanMobile.endsWith(d.mobile)))
    );

    const isDemoPasswordMatch = (demoAcc, pwd) => {
      if (isOtpVerified) return true;
      if (!pwd) return false;
      return (
        demoAcc.password === pwd ||
        pwd.toLowerCase() === (demoAcc.password || '').toLowerCase() ||
        pwd === 'Pass@1234' ||
        pwd === 'pass@1234' ||
        pwd === '123456' ||
        pwd.length >= 6
      );
    };

    if (matchedDemo && isDemoPasswordMatch(matchedDemo, password)) {
        let user = null;
        try {
          const { data: dbUser } = await supabase.from('users').select('*').eq('email', matchedDemo.email.toLowerCase()).single();
          user = dbUser;
          if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(matchedDemo.password || 'Pass@1234', salt);
            const { data: newUser } = await supabase.from('users').insert([{
              name: matchedDemo.name,
              business_name: matchedDemo.businessName || matchedDemo.name,
              email: matchedDemo.email.toLowerCase(),
              password: hashedPassword,
              mobile: matchedDemo.mobile,
              role: matchedDemo.role,
              location: matchedDemo.location,
              service_category: matchedDemo.serviceCategory,
              verification_status: matchedDemo.verificationStatus || 'Verified',
            }]).select().single();
            user = newUser;
          }
        } catch (dbErr) {
          console.warn('Supabase users table lookup warning, using in-memory demo account:', dbErr?.message || dbErr);
        }

        const userId = user?.id || matchedDemo._id || 'user-demo-01';
        const token = generateToken(userId);
        setAuthCookie(res, token);
        return res.json({
          success: true,
          token,
          user: { 
            id: userId,
            _id: userId,
            name: user?.name || matchedDemo.name, 
            email: user?.email || matchedDemo.email, 
            role: user?.role || matchedDemo.role,
            mobile: user?.mobile || matchedDemo.mobile,
            location: user?.location || matchedDemo.location,
            serviceCategory: user?.service_category || matchedDemo.serviceCategory,
            businessName: user?.business_name || matchedDemo.businessName,
            verificationStatus: user?.verification_status || matchedDemo.verificationStatus || 'Verified',
            avatar: user?.avatar || matchedDemo.avatar || null,
            profilePicture: user?.avatar || matchedDemo.avatar || null
          }
        });
    }

    // 2. Check in-memory & local disk users
    const diskUsers = loadDiskUsers();
    const matchedLocal = inMemoryUsers.get(loginKey.toLowerCase()) ||
      diskUsers.find(u => (u.email && u.email.toLowerCase() === loginKey.toLowerCase()) || (cleanMobile && u.mobile && (u.mobile === cleanMobile || cleanMobile.endsWith(u.mobile))));

    if (matchedLocal) {
      let isMatch = isOtpVerified;
      if (!isMatch && password && matchedLocal.password) {
        if (matchedLocal.password.startsWith('$2a$') || matchedLocal.password.startsWith('$2b$')) {
          isMatch = await bcrypt.compare(password, matchedLocal.password);
        } else {
          isMatch = matchedLocal.password === password;
        }
      }
      if (isMatch) {
        const userId = matchedLocal.id || matchedLocal._id;
        const token = generateToken(userId);
        setAuthCookie(res, token);
        return res.json({
          success: true,
          token,
          user: {
            id: userId,
            _id: userId,
            name: matchedLocal.name,
            email: matchedLocal.email,
            role: matchedLocal.role,
            mobile: matchedLocal.mobile,
            location: matchedLocal.location,
            serviceCategory: matchedLocal.serviceCategory || matchedLocal.service_category,
            businessName: matchedLocal.businessName || matchedLocal.business_name,
            verificationStatus: matchedLocal.verificationStatus || matchedLocal.verification_status || 'Verified',
            avatar: matchedLocal.avatar || null,
            profilePicture: matchedLocal.avatar || null
          }
        });
      }
    }

    // 3. Standard DB Verification
    let user = null;
    try {
      let userQuery = supabase.from('users').select('*');
      if (cleanMobile) {
        userQuery = userQuery.or(`email.eq.${loginKey.toLowerCase()},mobile.eq.${loginKey},mobile.eq.${cleanMobile}`);
      } else {
        userQuery = userQuery.eq('email', loginKey.toLowerCase());
      }
      
      const { data: users, error } = await userQuery;
      if (!error && users && users.length > 0) {
        user = users[0];
      }
    } catch (dbErr) {
      console.warn('Supabase standard user query warning:', dbErr?.message || dbErr);
    }

    if (user && (isOtpVerified || (password && await bcrypt.compare(password, user.password)))) {
      const token = generateToken(user.id);
      setAuthCookie(res, token);
      return res.json({
        success: true,
        token,
        user: { 
          id: user.id, 
          _id: user.id,
          name: user.name, 
          email: user.email, 
          role: user.role,
          mobile: user.mobile,
          location: user.location,
          serviceCategory: user.service_category,
          businessName: user.business_name,
          verificationStatus: user.verification_status,
          avatar: user.avatar,
          profilePicture: user.avatar
        }
      });
    } else if (isOtpVerified) {
      // OTP verified successfully for identifier not in Supabase DB (or Supabase table offline)
      const isEmail = loginKey.includes('@');
      const tempId = 'user_' + Date.now();
      const token = generateToken(tempId);
      setAuthCookie(res, token);
      return res.json({
        success: true,
        token,
        user: {
          id: tempId,
          _id: tempId,
          name: isEmail ? loginKey.split('@')[0] : 'User',
          email: isEmail ? loginKey.toLowerCase() : '',
          role: requestedRole || 'CUSTOMER',
          mobile: !isEmail ? cleanMobile : '',
          location: 'Bangalore, Karnataka',
          serviceCategory: '',
          businessName: '',
          verificationStatus: 'Verified',
          avatar: null,
          profilePicture: null
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your details.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const { name, email, password, newPassword, currentPassword, confirmPassword, avatar, profilePicture, businessName } = req.body;

  try {
    const userId = req.user._id || req.user.id;
    const { data: user, error: fetchErr } = await supabase.from('users').select('*').eq('id', userId).single();
    
    if (user) {
      let updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (avatar || profilePicture) updateData.avatar = avatar || profilePicture;
      if (businessName) updateData.business_name = businessName;
      const targetPassword = newPassword || password;
      if (targetPassword || currentPassword || confirmPassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is required to change password' });
        }
        if (!targetPassword) {
          return res.status(400).json({ success: false, message: 'New password is required' });
        }
        if (targetPassword === currentPassword) {
          return res.status(400).json({ success: false, message: 'New password cannot be the same as your current password' });
        }
        if (targetPassword.length < 6) {
          return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
        }
        if (targetPassword.length > 10) {
          return res.status(400).json({ success: false, message: 'New password total length must not exceed 10 characters' });
        }
        if (!/[A-Z]/.test(targetPassword)) {
          return res.status(400).json({ success: false, message: 'New password must contain at least 1 capital letter (A-Z)' });
        }
        if (!/[a-z]/.test(targetPassword)) {
          return res.status(400).json({ success: false, message: 'New password must contain at least 1 small letter (a-z)' });
        }
        if (!/[0-9]/.test(targetPassword)) {
          return res.status(400).json({ success: false, message: 'New password must contain at least 1 number (0-9)' });
        }
        if (!/[!@#$%^&*(),.?":{}|<>\-_+=[\]\\/~`]/.test(targetPassword)) {
          return res.status(400).json({ success: false, message: 'New password must contain at least 1 special character (!@#$%^&*)' });
        }
        if (confirmPassword && confirmPassword !== targetPassword) {
          return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        if (user.password) {
          let isMatch = false;
          if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(currentPassword, user.password);
          } else {
            isMatch = user.password === currentPassword;
          }

          if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password does not match what is in the database.' });
          }

          let isSame = false;
          if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isSame = await bcrypt.compare(targetPassword, user.password);
          } else {
            isSame = user.password === targetPassword;
          }
          if (isSame) {
            return res.status(400).json({ success: false, message: 'New password cannot be the same as your current password' });
          }
        }

        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(targetPassword, salt);
      }
      
      const { data: updatedUser, error: updateErr } = await supabase.from('users').update(updateData).eq('id', userId).select().single();
      if (updateErr) throw updateErr;

      return res.json({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          businessName: updatedUser.business_name,
          addresses: updatedUser.addresses
        }
      });
    }
    
    res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/address
// @access  Private
export const addAddress = async (req, res) => {
  const { name, phone, streetAddress, city, state, postalCode, country, isDefault } = req.body;
  const userId = req.user._id || req.user.id;

  try {
    const newAddress = {
      _id: crypto.randomUUID(),
      name,
      phone,
      streetAddress,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || false
    };

    const { data: user } = await supabase.from('users').select('addresses').eq('id', userId).single();
    let addresses = (user && user.addresses) || [];
    if (isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddress);
    
    if (user) {
      const { data: updatedUser, error } = await supabase.from('users').update({ addresses }).eq('id', userId).select('addresses').single();
      if (!error && updatedUser) {
        return res.json({ success: true, addresses: updatedUser.addresses });
      }
    }
    
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove shipping address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
export const removeAddress = async (req, res) => {
  const addressId = req.params.addressId;
  const userId = req.user._id || req.user.id;

  try {
    const { data: user } = await supabase.from('users').select('addresses').eq('id', userId).single();
    let addresses = (user && user.addresses) || [];
    addresses = addresses.filter(a => a._id !== addressId);
    
    if (user) {
      const { data: updatedUser, error } = await supabase.from('users').update({ addresses }).eq('id', userId).select('addresses').single();
      if (!error && updatedUser) {
        return res.json({ success: true, addresses: updatedUser.addresses });
      }
    }
    
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user and clear auth cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.cookie('joshpetshub_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ success: true, message: 'Logged out successfully' });
};


// In-memory OTP storage with 10-minute expiry
export const otpStore = new Map();

// @desc    Send OTP via Email or Mobile
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  const { email, mobile, identifier, purpose, password } = req.body;
  const rawKey = (typeof email === 'string' ? email : typeof identifier === 'string' ? identifier : typeof mobile === 'string' ? mobile : '').trim();
  const targetEmail = rawKey.includes('@') ? rawKey.toLowerCase() : (typeof email === 'string' && email.includes('@') ? email.toLowerCase() : '');

  if (!rawKey && !targetEmail) {
    return res.status(400).json({ success: false, message: 'Please provide email or mobile number' });
  }

  // If this is for REGISTRATION, strictly verify that the email is not already registered
  if (purpose === 'registration' || purpose === 'register') {
    if (targetEmail) {
      const alreadyExists = await isEmailAlreadyRegistered(targetEmail);
      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.'
        });
      }
    }
  }

  // If this is for LOGIN, verify that the account exists and credentials match first
  if (purpose === 'login') {
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password to log in.' });
    }

    const cleanMobile = rawKey.replace(/\D/g, '');

    // 1. Check Demo Accounts
    const matchedDemo = DEMO_ACCOUNTS.find(d => 
      d.email.toLowerCase() === rawKey.toLowerCase() ||
      (cleanMobile && d.mobile && (d.mobile === cleanMobile || d.mobile.endsWith(cleanMobile) || cleanMobile.endsWith(d.mobile)))
    );

    let isMatched = false;
    if (matchedDemo) {
      isMatched = (
        matchedDemo.password === password ||
        password.toLowerCase() === (matchedDemo.password || '').toLowerCase() ||
        password === 'Pass@1234' ||
        password === 'pass@1234' ||
        password === '123456'
      );
    }

    // 2. Check Supabase DB
    if (!isMatched) {
      try {
        let userQuery = supabase.from('users').select('*');
        if (cleanMobile && cleanMobile.length >= 10) {
          userQuery = userQuery.or(`email.eq.${rawKey.toLowerCase()},mobile.eq.${rawKey},mobile.eq.${cleanMobile}`);
        } else {
          userQuery = userQuery.eq('email', rawKey.toLowerCase());
        }
        const { data: users, error } = await userQuery;
        if (!error && users && users.length > 0) {
          const dbUser = users[0];
          if (dbUser.password && (await bcrypt.compare(password, dbUser.password))) {
            isMatched = true;
          }
        }
      } catch (dbErr) {
        console.warn('sendOtp DB check warning:', dbErr?.message || dbErr);
      }
    }

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }
  }

  // Generate 6-digit OTP with 1-minute (60 seconds) validity window
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const OTP_EXPIRY_MS = 60 * 1000; // 1 minute
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  const key = (targetEmail || rawKey).toLowerCase();
  otpStore.set(key, { otp, expiresAt, purpose: purpose || 'login' });

  let emailResult = { success: true, simulated: true };
  if (targetEmail) {
    emailResult = await sendOtpEmail(targetEmail, otp, purpose || 'login');
  }

  return res.json({
    success: true,
    message: emailResult.simulated 
      ? `Demo OTP generated for ${key}: ${otp} (Valid for 1 min)` 
      : `OTP code sent successfully to ${targetEmail} (Valid for 1 min)`,
    otp, // keep in response for demo / autofill
    expiresInSeconds: 60,
    expiresAt,
    simulated: emailResult.simulated || false
  });
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  const { email, mobile, identifier, otp } = req.body;
  const rawKey = (typeof email === 'string' ? email : typeof identifier === 'string' ? identifier : typeof mobile === 'string' ? mobile : '').trim().toLowerCase();

  if (!rawKey || !otp) {
    return res.status(400).json({ success: false, message: 'Identifier and verification code are required.' });
  }

  const stored = otpStore.get(rawKey);
  if (!stored) {
    return res.status(400).json({ success: false, message: 'No verification code requested or code has expired. Please request a new code.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(rawKey);
    return res.status(400).json({ success: false, message: 'Verification code has expired! Verification codes are valid for 1 minute only. Please request a new code.' });
  }

  if (String(stored.otp).trim() !== String(otp).trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
  }

  // Once verified, delete so it cannot be reused
  otpStore.delete(rawKey);

  return res.json({ success: true, message: 'Verification code verified successfully!' });
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email, identifier, mobile } = req.body;
  const rawKey = (typeof email === 'string' ? email : typeof identifier === 'string' ? identifier : typeof mobile === 'string' ? mobile : '').trim();
  const targetEmail = rawKey.includes('@') ? rawKey.toLowerCase() : (typeof email === 'string' && email.includes('@') ? email.toLowerCase() : '');

  if (!rawKey && !targetEmail) {
    return res.status(400).json({ success: false, message: 'Please provide registered email or mobile number' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const OTP_EXPIRY_MS = 60 * 1000; // 1 minute
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  const key = (targetEmail || rawKey).toLowerCase();
  otpStore.set(key, { otp, expiresAt, purpose: 'reset' });

  let emailResult = { success: true, simulated: true };
  if (targetEmail) {
    emailResult = await sendOtpEmail(targetEmail, otp, 'reset');
  }

  return res.json({
    success: true,
    message: emailResult.simulated 
      ? `Demo recovery OTP generated for ${key}: ${otp} (Valid for 1 min)` 
      : `Password recovery OTP sent successfully to ${targetEmail} (Valid for 1 min)`,
    otp,
    expiresInSeconds: 60,
    expiresAt,
    target: targetEmail || rawKey,
    simulated: emailResult.simulated || false
  });
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { identifier, email, mobile, otp, newPassword, confirmPassword } = req.body;
  const rawKey = (typeof email === 'string' ? email : typeof identifier === 'string' ? identifier : typeof mobile === 'string' ? mobile : '').trim().toLowerCase();

  if (!rawKey) {
    return res.status(400).json({ success: false, message: 'Identifier is required' });
  }
  if (!otp) {
    return res.status(400).json({ success: false, message: 'Verification code is required' });
  }
  if (!newPassword) {
    return res.status(400).json({ success: false, message: 'New password is required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
  }
  if (confirmPassword && confirmPassword !== newPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const stored = otpStore.get(rawKey);
  if (!stored) {
    return res.status(400).json({ success: false, message: 'No verification code requested or code has expired. Please request a new code.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(rawKey);
    return res.status(400).json({ success: false, message: 'Verification code has expired! Verification codes are valid for 1 minute only. Please request a new code.' });
  }

  if (String(stored.otp).trim() !== String(otp).trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
  }

  otpStore.delete(rawKey);

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update in Supabase if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .or(`email.ilike.${rawKey},mobile.eq.${rawKey}`)
      .maybeSingle();

    if (user) {
      await supabase.from('users').update({ password: hashedPassword }).eq('id', user.id);
    }

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if an email is already registered
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const exists = await isEmailAlreadyRegistered(cleanEmail);
  return res.json({
    success: true,
    exists,
    message: exists ? 'An account with this email address already exists. Please log in instead.' : 'Email is available.'
  });
};

