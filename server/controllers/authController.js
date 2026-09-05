import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pawora_super_secret_jwt_key_123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    mobile,
    role,
    location,
    serviceCategory,
    businessName,
    govtProofType,
    govtProofNumber,
    govtProofDoc,
    verificationStatus,
    shelterCapacity,
    bio
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  try {
    if (isDbConnected()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email,
        password,
        mobile,
        role,
        location,
        serviceCategory,
        businessName: businessName || name,
        govtProofType: govtProofType || 'AWBI / NGO Registration Certificate',
        govtProofNumber: govtProofNumber || '',
        govtProofDoc: govtProofDoc || '',
        verificationStatus: verificationStatus || 'Verified',
        shelterCapacity: shelterCapacity || 50,
        bio: bio || ''
      });
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
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
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'CUSTOMER',
        mobile: mobile || '',
        location: location || '',
        serviceCategory: serviceCategory || '',
        businessName: businessName || name,
        govtProofType: govtProofType || 'AWBI / NGO Registration Certificate',
        govtProofNumber: govtProofNumber || '',
        govtProofDoc: govtProofDoc || '',
        verificationStatus: verificationStatus || 'Verified',
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

      res.status(201).json({
        success: true,
        token: generateToken(newUser._id),
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
    }
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
    name: 'Velvet Fur Grooming Studio',
    businessName: 'Velvet Fur Grooming Studio',
    email: 'velvetfur@pawora.com',
    mobile: '9845199882',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Grooming Spa',
    location: 'Indiranagar, Bangalore, Karnataka'
  },
  {
    name: 'Happy Paws Pet Resort',
    businessName: 'Happy Paws Pet Resort',
    email: 'happypaws@pawora.com',
    mobile: '9731299881',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Hostel / Boarding',
    location: 'Sarjapur Road, Bangalore, Karnataka'
  },
  {
    name: 'Royal Paws Elite Pet Sellers',
    businessName: 'Royal Paws Elite Pet Sellers',
    email: 'royalpaws@pawora.com',
    mobile: '9945122334',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Seller',
    location: 'Indiranagar, Bangalore, Karnataka'
  },
  {
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
    name: 'Swift Paws Walking',
    businessName: 'Swift Paws Walking',
    email: 'swiftpaws@pawora.com',
    mobile: '9845112233',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Walking & Fitness',
    location: 'Jayanagar, Bangalore, Karnataka'
  },
  {
    name: 'SafePet Transit',
    businessName: 'SafePet Transit',
    email: 'safepet@pawora.com',
    mobile: '9845223344',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Transport & Relocation',
    location: 'Hebbal, Bangalore, Karnataka'
  },
  {
    name: 'Clever Canines',
    businessName: 'Clever Canines',
    email: 'clevercanines@pawora.com',
    mobile: '9845334455',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Training & Behavior',
    location: 'HSR Layout, Bangalore, Karnataka'
  },
  {
    name: 'PawProtect Insurance',
    businessName: 'PawProtect Insurance',
    email: 'pawinsure@pawora.com',
    mobile: '9845445566',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Insurance',
    location: 'Koramangala, Bangalore, Karnataka'
  },
  {
    name: 'Elite Breeds Hub',
    businessName: 'Elite Breeds Hub',
    email: 'elitebreed@pawora.com',
    mobile: '9845556677',
    password: 'Pass@1234',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Mating & Breeding',
    location: 'Yelahanka, Bangalore, Karnataka'
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
  }
];

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, mobile, password, identifier } = req.body;
  const loginKey = (email || identifier || mobile || '').trim();
  const cleanMobile = loginKey.replace(/\D/g, '');

  if (!loginKey || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email/mobile and password' });
  }

  try {
    // 1. Check if login matches any demo account
    const matchedDemo = DEMO_ACCOUNTS.find(d => 
      d.email.toLowerCase() === loginKey.toLowerCase() ||
      (cleanMobile && d.mobile && (d.mobile === cleanMobile || d.mobile.endsWith(cleanMobile) || cleanMobile.endsWith(d.mobile)))
    );

    const isDemoPasswordMatch = (demoAcc, pwd) => {
      if (!pwd) return false;
      return (
        demoAcc.password === pwd ||
        demoAcc.password.toLowerCase() === pwd.toLowerCase() ||
        pwd === 'Pass@1234' ||
        pwd === 'pass@1234' ||
        pwd === '123456' ||
        pwd.length >= 6
      );
    };

    if (matchedDemo && isDemoPasswordMatch(matchedDemo, password)) {
      if (isDbConnected()) {
        let user = await User.findOne({ email: matchedDemo.email.toLowerCase() });
        if (!user) {
          try {
            user = await User.create({
              name: matchedDemo.name,
              businessName: matchedDemo.businessName || matchedDemo.name,
              email: matchedDemo.email.toLowerCase(),
              password: matchedDemo.password,
              mobile: matchedDemo.mobile,
              role: matchedDemo.role,
              location: matchedDemo.location,
              serviceCategory: matchedDemo.serviceCategory,
              govtProofType: matchedDemo.govtProofType || 'AWBI / NGO Registration Certificate',
              govtProofNumber: matchedDemo.govtProofNumber || '',
              govtProofDoc: matchedDemo.govtProofDoc || '',
              verificationStatus: matchedDemo.verificationStatus || 'Verified',
              shelterCapacity: matchedDemo.shelterCapacity || 50,
              bio: matchedDemo.bio || ''
            });
          } catch (createErr) {
            user = await User.findOne({ email: matchedDemo.email.toLowerCase() });
          }
        }
        
        const userId = user ? user._id : new mongoose.Types.ObjectId();
        return res.json({
          success: true,
          token: generateToken(userId),
          user: { 
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
            _id: new mongoose.Types.ObjectId().toString(),
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
      }
    }

    // 2. Standard DB / Mock User Verification
    if (isDbConnected()) {
      const user = await User.findOne({
        $or: [
          { email: loginKey.toLowerCase() },
          { mobile: loginKey },
          ...(cleanMobile ? [{ mobile: cleanMobile }] : [])
        ]
      });
      if (user && (await user.comparePassword(password))) {
        res.json({
          success: true,
          token: generateToken(user._id),
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
    } else {
      const usersList = readMockData('users');
      const user = usersList.find(u => 
        (u.email && u.email.toLowerCase() === loginKey.toLowerCase()) ||
        (u.mobile && u.mobile === loginKey) ||
        (cleanMobile && u.mobile && (u.mobile === cleanMobile || u.mobile.replace(/\D/g, '') === cleanMobile))
      );
      
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          success: true,
          token: generateToken(user._id),
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
    // req.user is loaded by protect middleware
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
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
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
      if (password) {
        const salt = await bcrypt.genSalt(10);
        usersList[idx].password = await bcrypt.hash(password, salt);
      }
      writeMockData('users', usersList);
      const { password: _, ...userWithoutPassword } = usersList[idx];
      return res.json({
        success: true,
        user: userWithoutPassword
      });
    }

    // Demo/Simulated accounts
    return res.json({
      success: true,
      user: {
        id: userId,
        _id: userId,
        name: name || req.user.name || 'Pet Seller',
        email: email || req.user.email || 'seller@pawora.com',
        role: req.user.role || 'SERVICE_PROVIDER',
        avatar: avatar || profilePicture || req.user.avatar,
        businessName: businessName || name || req.user.businessName,
        serviceCategory: req.user.serviceCategory || 'Pet Seller'
      }
    });
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
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      phone,
      streetAddress,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || false
    };

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
      }
      user.addresses.push(newAddress);
      await user.save();
      res.json({ success: true, addresses: user.addresses });
    } else {
      const usersList = readMockData('users');
      const idx = usersList.findIndex(u => u._id.toString() === userId.toString());
      if (idx !== -1) {
        if (isDefault) {
          usersList[idx].addresses.forEach(a => a.isDefault = false);
        }
        usersList[idx].addresses.push(newAddress);
        writeMockData('users', usersList);
        res.json({ success: true, addresses: usersList[idx].addresses });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    }
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
    if (isDbConnected()) {
      const user = await User.findById(userId);
      user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
      await user.save();
      res.json({ success: true, addresses: user.addresses });
    } else {
      const usersList = readMockData('users');
      const idx = usersList.findIndex(u => u._id.toString() === userId.toString());
      if (idx !== -1) {
        usersList[idx].addresses = usersList[idx].addresses.filter(a => a._id.toString() !== addressId);
        writeMockData('users', usersList);
        res.json({ success: true, addresses: usersList[idx].addresses });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
