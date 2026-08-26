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
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  try {
    if (isDbConnected()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({ name, email, password });
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
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
        role: 'CUSTOMER',
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
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    if (isDbConnected()) {
      const user = await User.findOne({ email });
      if (user && (await user.comparePassword(password))) {
        res.json({
          success: true,
          token: generateToken(user._id),
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      const usersList = readMockData('users');
      const user = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          success: true,
          token: generateToken(user._id),
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
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
  const { name, email, password } = req.body;

  try {
    const userId = req.user._id || req.user.id;
    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        if (password) {
          user.password = password;
        }
        const updatedUser = await user.save();
        res.json({
          success: true,
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            addresses: updatedUser.addresses
          }
        });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } else {
      const usersList = readMockData('users');
      const idx = usersList.findIndex(u => u._id.toString() === userId.toString());
      if (idx !== -1) {
        usersList[idx].name = name || usersList[idx].name;
        usersList[idx].email = email ? email.toLowerCase() : usersList[idx].email;
        if (password) {
          const salt = await bcrypt.genSalt(10);
          usersList[idx].password = await bcrypt.hash(password, salt);
        }
        writeMockData('users', usersList);
        const { password: _, ...userWithoutPassword } = usersList[idx];
        res.json({
          success: true,
          user: userWithoutPassword
        });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    }
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
