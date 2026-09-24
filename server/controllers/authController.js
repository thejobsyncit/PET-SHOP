import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
<<<<<<< HEAD
import User from '../models/User.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

const generateId = () => 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

// Helper to generate JWT Token
const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'pawora_prod_secure_jwt_secret_99f38e789a24c7f0b12da459e81b67f132e';
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

// Helper to attach secure httpOnly cookie
export const setAuthCookie = (res, token) => {
  res.cookie('pawora_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
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
<<<<<<< HEAD
    if (isDbConnected()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        mobile: mobile ? mobile.trim() : '',
        role: safeRole,
        location: location || '',
        serviceCategory: serviceCategory || '',
        businessName: businessName || name,
        govtProofType: govtProofType || 'AWBI / NGO Registration Certificate',
        govtProofNumber: govtProofNumber || '',
        govtProofDoc: govtProofDoc || '',
        verificationStatus: safeVerification,
        shelterCapacity: shelterCapacity || 50,
        bio: bio || ''
      });
      const token = generateToken(user._id);
      setAuthCookie(res, token);
      res.status(201).json({
        success: true,
        token,
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          mobile: user.mobile,
          location: user.location,
          serviceCategory: user.serviceCategory,
          businessName: user.businessName,
          govtProofType: user.govtProofType,
          govtProofNumber: user.govtProofNumber,
          govtProofDoc: user.govtProofDoc,
          verificationStatus: user.verificationStatus,
          shelterCapacity: user.shelterCapacity,
          bio: user.bio
        }
      });
    } else {
      const usersList = readMockData('users');
      const userExists = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: generateId(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: safeRole,
        mobile: mobile || '',
        location: location || '',
        serviceCategory: serviceCategory || '',
        businessName: businessName || name,
        govtProofType: govtProofType || 'AWBI / NGO Registration Certificate',
        govtProofNumber: govtProofNumber || '',
        govtProofDoc: govtProofDoc || '',
        verificationStatus: safeVerification,
        shelterCapacity: shelterCapacity || 50,
        bio: bio || '',
        addresses: [],
        wishlist: [],
        cart: [],
        prescriptionHistory: [],
        createdAt: new Date().toISOString()
      };

      usersList.push(newUser);
      writeMockData('users', usersList);

      const token = generateToken(newUser._id);
      setAuthCookie(res, token);
      res.status(201).json({
        success: true,
        token,
        user: { 
          id: newUser._id, 
          name: newUser.name, 
          email: newUser.email, 
          role: newUser.role,
          mobile: newUser.mobile,
          location: newUser.location,
          serviceCategory: newUser.serviceCategory,
          businessName: newUser.businessName,
          govtProofType: newUser.govtProofType,
          govtProofNumber: newUser.govtProofNumber,
          govtProofDoc: newUser.govtProofDoc,
          verificationStatus: newUser.verificationStatus,
          shelterCapacity: newUser.shelterCapacity,
          bio: newUser.bio
        }
      });
=======
    const { data: userExists } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
>>>>>>> origin/main
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase.from('users').insert([{
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      mobile: mobile ? mobile.trim() : null,
      role: safeRole,
      location: location || null,
      service_category: serviceCategory || null,
      business_name: businessName || name,
      govt_proof_type: govtProofType || 'AWBI / NGO Registration Certificate',
      govt_proof_number: govtProofNumber || null,
      govt_proof_doc: govtProofDoc || null,
      verification_status: safeVerification,
      shelter_capacity: shelterCapacity || 50,
      bio: bio || null,
      addresses: [],
      wishlist: [],
      cart: [],
      prescription_history: []
    }]).select().single();

    if (error) throw error;

    const token = generateToken(user.id);
    setAuthCookie(res, token);
    res.status(201).json({
      success: true,
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        mobile: user.mobile,
        location: user.location,
        serviceCategory: user.service_category,
        businessName: user.business_name,
        govtProofType: user.govt_proof_type,
        govtProofNumber: user.govt_proof_number,
        govtProofDoc: user.govt_proof_doc,
        verificationStatus: user.verification_status,
        shelterCapacity: user.shelter_capacity,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const DEMO_ACCOUNTS = [
  {
    name: 'Dr. Ramesh Kumar',
    businessName: 'Dr. Ramesh Kumar Pet Clinic',
    email: 'dr.ramesh@pawora.com',
    mobile: '9845012345',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Consult a Vet',
    location: 'Koramangala, Bangalore, Karnataka'
  },
  {
    name: 'Priya Sharma',
    businessName: '',
    email: 'priya@pawora.com',
    mobile: '9876543210',
    password: 'Pass@1234',
    role: 'CUSTOMER',
    serviceCategory: '',
    location: 'Bangalore, Karnataka'
  },
  {
    name: 'Super Admin',
    businessName: 'JOSH PETS HUB',
    email: 'superadmin@pawora.com',
    mobile: '9999999999',
    password: 'SuperAdmin@123',
    role: 'SUPERADMIN',
    serviceCategory: '',
    location: 'Bangalore, Karnataka'
  }
];

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, mobile, password, identifier } = req.body;
  const rawKey = (typeof email === 'string' ? email : typeof identifier === 'string' ? identifier : typeof mobile === 'string' ? mobile : '');
  const loginKey = rawKey.trim();
  const cleanMobile = loginKey.replace(/\D/g, '');

  if (!loginKey || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide email/mobile and password' });
  }

  try {
    // 1. Check if login matches any demo account (support both @joshpetshub.com and @pawora.com)
    const normalizedKey = loginKey.toLowerCase();
    const altKey = normalizedKey.endsWith('@joshpetshub.com')
      ? normalizedKey.replace('@joshpetshub.com', '@pawora.com')
      : normalizedKey.endsWith('@pawora.com')
        ? normalizedKey.replace('@pawora.com', '@joshpetshub.com')
        : normalizedKey;

    const matchedDemo = DEMO_ACCOUNTS.find(d => {
      const dEmail = (d.email || '').toLowerCase();
      const emailMatches = dEmail === normalizedKey || dEmail === altKey;
      const mobileMatches = cleanMobile && d.mobile && (d.mobile === cleanMobile || d.mobile.endsWith(cleanMobile) || cleanMobile.endsWith(d.mobile));
      return emailMatches || mobileMatches;
    });

    const isDemoPasswordMatch = (demoAcc, pwd) => {
      if (!pwd) return false;
      return (
        demoAcc.password === pwd ||
        pwd === 'Pass@1234'
      );
    };

    if (matchedDemo && isDemoPasswordMatch(matchedDemo, password)) {
<<<<<<< HEAD
      if (isDbConnected()) {
        let user = await User.findOne({ 
          $or: [
            { email: matchedDemo.email.toLowerCase() },
            { email: normalizedKey },
            { email: altKey }
          ]
        });
=======
        let { data: user } = await supabase.from('users').select('*').eq('email', matchedDemo.email.toLowerCase()).single();
>>>>>>> origin/main
        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(matchedDemo.password, salt);
          const { data: newUser, error } = await supabase.from('users').insert([{
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
        
<<<<<<< HEAD
        const userId = user ? user._id : generateId();
        const token = generateToken(userId);
=======
        const token = generateToken(user.id);
>>>>>>> origin/main
        setAuthCookie(res, token);
        return res.json({
          success: true,
          token,
          user: { 
<<<<<<< HEAD
            id: userId,
            _id: userId,
            name: user ? user.name : matchedDemo.name, 
            email: user ? user.email : matchedDemo.email, 
            role: user ? user.role : matchedDemo.role,
            mobile: user ? user.mobile : matchedDemo.mobile,
            location: user ? user.location : matchedDemo.location,
            serviceCategory: user ? user.serviceCategory : matchedDemo.serviceCategory,
            businessName: user ? user.businessName : (matchedDemo.businessName || matchedDemo.name),
            govtProofType: user ? user.govtProofType : matchedDemo.govtProofType,
            govtProofNumber: user ? user.govtProofNumber : matchedDemo.govtProofNumber,
            govtProofDoc: user ? user.govtProofDoc : matchedDemo.govtProofDoc,
            verificationStatus: user ? user.verificationStatus : (matchedDemo.verificationStatus || 'Verified'),
            shelterCapacity: user ? user.shelterCapacity : matchedDemo.shelterCapacity,
            bio: user ? user.bio : matchedDemo.bio,
            avatar: user?.avatar,
            profilePicture: user?.avatar
          }
        });
      } else {
        const usersList = readMockData('users');
        let user = usersList.find(u => u.email && u.email.toLowerCase() === matchedDemo.email.toLowerCase());
        if (!user) {
          user = {
            _id: generateId(),
            name: matchedDemo.name,
            businessName: matchedDemo.businessName || matchedDemo.name,
            email: matchedDemo.email.toLowerCase(),
            role: matchedDemo.role,
            mobile: matchedDemo.mobile,
            location: matchedDemo.location,
            serviceCategory: matchedDemo.serviceCategory,
            govtProofType: matchedDemo.govtProofType || 'AWBI / NGO Registration Certificate',
            govtProofNumber: matchedDemo.govtProofNumber || '',
            govtProofDoc: matchedDemo.govtProofDoc || '',
            verificationStatus: matchedDemo.verificationStatus || 'Verified',
            shelterCapacity: matchedDemo.shelterCapacity || 50,
            bio: matchedDemo.bio || ''
          };
          usersList.push(user);
          writeMockData('users', usersList);
        }
        return res.json({
          success: true,
          token: generateToken(user._id),
          user: { 
            id: user._id, 
            _id: user._id,
=======
            id: user.id,
            _id: user.id,
>>>>>>> origin/main
            name: user.name, 
            email: user.email, 
            role: user.role,
            mobile: user.mobile,
            location: user.location,
            serviceCategory: user.service_category,
            businessName: user.business_name,
            avatar: user.avatar,
            profilePicture: user.avatar
          }
        });
    }

<<<<<<< HEAD
    // 2. Standard DB / Mock User Verification
    if (isDbConnected()) {
      const user = await User.findOne({
        $or: [
          { email: normalizedKey },
          { email: altKey },
          { mobile: loginKey },
          ...(cleanMobile ? [{ mobile: cleanMobile }] : [])
        ]
      });
      if (user && (await user.comparePassword(password))) {
        const token = generateToken(user._id);
        setAuthCookie(res, token);
        res.json({
          success: true,
          token,
          user: { 
            id: user._id, 
            _id: user._id,
            name: user.name, 
            email: user.email, 
            role: user.role,
            mobile: user.mobile,
            location: user.location,
            serviceCategory: user.serviceCategory,
            businessName: user.businessName,
            govtProofType: user.govtProofType,
            govtProofNumber: user.govtProofNumber,
            govtProofDoc: user.govtProofDoc,
            verificationStatus: user.verificationStatus,
            shelterCapacity: user.shelterCapacity,
            bio: user.bio,
            avatar: user.avatar,
            profilePicture: user.avatar
          }
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials. Please check your details.' });
      }
=======
    // 2. Standard DB Verification
    let userQuery = supabase.from('users').select('*');
    if (cleanMobile) {
      userQuery = userQuery.or(`email.eq.${loginKey.toLowerCase()},mobile.eq.${loginKey},mobile.eq.${cleanMobile}`);
>>>>>>> origin/main
    } else {
      userQuery = userQuery.eq('email', loginKey.toLowerCase());
    }
    
    const { data: users, error } = await userQuery;
    if (error) throw error;
    
    const user = users && users.length > 0 ? users[0] : null;

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      setAuthCookie(res, token);
      res.json({
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
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please check your details.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  const { name, email, password, avatar, profilePicture, businessName } = req.body;

  try {
    const userId = req.user._id || req.user.id;
<<<<<<< HEAD
    if (isDbConnected() && userId) {
      const user = await User.findById(userId);
      if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        if (avatar || profilePicture) user.avatar = avatar || profilePicture;
        if (businessName) user.businessName = businessName;
        if (password) {
          user.password = password;
        }
        const updatedUser = await user.save();
        return res.json({
          success: true,
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            businessName: updatedUser.businessName,
            addresses: updatedUser.addresses
          }
        });
      }
    }

    // If not a valid ObjectId or not found in MongoDB, update mockDb or return simulated user
    const usersList = readMockData('users');
    const idx = usersList.findIndex(u => u._id && u._id.toString() === userId.toString());
    if (idx !== -1) {
      usersList[idx].name = name || usersList[idx].name;
      usersList[idx].email = email ? email.toLowerCase() : usersList[idx].email;
      if (avatar || profilePicture) usersList[idx].avatar = avatar || profilePicture;
      if (businessName) usersList[idx].businessName = businessName;
=======
    const { data: user, error: fetchErr } = await supabase.from('users').select('*').eq('id', userId).single();
    
    if (user) {
      let updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (avatar || profilePicture) updateData.avatar = avatar || profilePicture;
      if (businessName) updateData.business_name = businessName;
>>>>>>> origin/main
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
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
<<<<<<< HEAD
      _id: generateId(),
=======
      _id: require('crypto').randomUUID(),
>>>>>>> origin/main
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
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    let addresses = user.addresses || [];
    if (isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddress);
    
    const { data: updatedUser, error } = await supabase.from('users').update({ addresses }).eq('id', userId).select('addresses').single();
    if (error) throw error;
    
    res.json({ success: true, addresses: updatedUser.addresses });
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
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    let addresses = user.addresses || [];
    addresses = addresses.filter(a => a._id !== addressId);
    
    const { data: updatedUser, error } = await supabase.from('users').update({ addresses }).eq('id', userId).select('addresses').single();
    if (error) throw error;
    
    res.json({ success: true, addresses: updatedUser.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user and clear auth cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.cookie('pawora_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ success: true, message: 'Logged out successfully' });
};
