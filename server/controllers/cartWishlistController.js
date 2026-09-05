import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

// ==========================================
// CART CONTROLLERS
// ==========================================

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).populate('cart.product');
      if (user) {
        return res.json({ success: true, cart: user.cart || [] });
      }
    }
    
    const usersList = readMockData('users');
    const productsList = readMockData('products');
    const user = usersList.find(u => u._id && u._id.toString() === userId.toString());
    
    if (!user) {
      return res.json({ success: true, cart: [] });
    }

      // Populate manually
      const populatedCart = (user.cart || []).map(item => {
        const prod = productsList.find(p => p._id.toString() === item.product.toString());
        return {
          product: prod || { _id: item.product, name: 'Unknown Product', price: 0 },
          quantity: item.quantity
        };
      }).filter(item => item.product !== null);

      res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

      if (cartItemIndex > -1) {
        user.cart[cartItemIndex].quantity += parseInt(quantity);
      } else {
        user.cart.push({ product: productId, quantity: parseInt(quantity) });
      }

      await user.save();
      const populatedUser = await User.findById(userId).populate('cart.product');
      res.json({ success: true, cart: populatedUser.cart });
    } else {
      const usersList = readMockData('users');
      const productsList = readMockData('products');
      const userIdx = usersList.findIndex(u => u._id.toString() === userId.toString());

      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = usersList[userIdx];
      user.cart = user.cart || [];
      const itemIdx = user.cart.findIndex(item => item.product.toString() === productId.toString());

      if (itemIdx > -1) {
        user.cart[itemIdx].quantity += parseInt(quantity);
      } else {
        user.cart.push({ product: productId, quantity: parseInt(quantity) });
      }

      usersList[userIdx] = user;
      writeMockData('users', usersList);

      // Populate manually
      const populatedCart = user.cart.map(item => {
        const prod = productsList.find(p => p._id.toString() === item.product.toString());
        return {
          product: prod || { _id: item.product, name: 'Unknown Product', price: 0 },
          quantity: item.quantity
        };
      });

      res.json({ success: true, cart: populatedCart });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update quantity in cart
// @route   PUT /api/cart
// @access  Private
export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id || req.user.id;

  if (quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  try {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

      if (cartItemIndex > -1) {
        user.cart[cartItemIndex].quantity = parseInt(quantity);
        await user.save();
      }

      const populatedUser = await User.findById(userId).populate('cart.product');
      res.json({ success: true, cart: populatedUser.cart });
    } else {
      const usersList = readMockData('users');
      const productsList = readMockData('products');
      const userIdx = usersList.findIndex(u => u._id.toString() === userId.toString());

      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = usersList[userIdx];
      user.cart = user.cart || [];
      const itemIdx = user.cart.findIndex(item => item.product.toString() === productId.toString());

      if (itemIdx > -1) {
        user.cart[itemIdx].quantity = parseInt(quantity);
        usersList[userIdx] = user;
        writeMockData('users', usersList);
      }

      // Populate manually
      const populatedCart = user.cart.map(item => {
        const prod = productsList.find(p => p._id.toString() === item.product.toString());
        return {
          product: prod || { _id: item.product, name: 'Unknown Product', price: 0 },
          quantity: item.quantity
        };
      });

      res.json({ success: true, cart: populatedCart });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      user.cart = user.cart.filter(item => item.product.toString() !== productId);
      await user.save();
      const populatedUser = await User.findById(userId).populate('cart.product');
      res.json({ success: true, cart: populatedUser.cart });
    } else {
      const usersList = readMockData('users');
      const productsList = readMockData('products');
      const userIdx = usersList.findIndex(u => u._id.toString() === userId.toString());

      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = usersList[userIdx];
      user.cart = (user.cart || []).filter(item => item.product.toString() !== productId.toString());
      usersList[userIdx] = user;
      writeMockData('users', usersList);

      // Populate manually
      const populatedCart = user.cart.map(item => {
        const prod = productsList.find(p => p._id.toString() === item.product.toString());
        return {
          product: prod || { _id: item.product, name: 'Unknown Product', price: 0 },
          quantity: item.quantity
        };
      });

      res.json({ success: true, cart: populatedCart });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      user.cart = [];
      await user.save();
      res.json({ success: true, cart: [] });
    } else {
      const usersList = readMockData('users');
      const userIdx = usersList.findIndex(u => u._id.toString() === userId.toString());

      if (userIdx !== -1) {
        usersList[userIdx].cart = [];
        writeMockData('users', usersList);
        res.json({ success: true, cart: [] });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================================
// WISHLIST CONTROLLERS
// ==========================================

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).populate('wishlist');
      if (user) {
        return res.json({ success: true, wishlist: user.wishlist || [] });
      }
    }

    const usersList = readMockData('users');
    const productsList = readMockData('products');
    const user = usersList.find(u => u._id && u._id.toString() === userId.toString());

    if (!user) {
      return res.json({ success: true, wishlist: [] });
    }

      // Populate manually
      const populatedWishlist = (user.wishlist || []).map(pId => {
        return productsList.find(p => p._id.toString() === pId.toString());
      }).filter(p => p !== undefined && p !== null);

      res.json({ success: true, wishlist: populatedWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      const isWishlisted = user.wishlist.includes(productId);

      if (isWishlisted) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      } else {
        user.wishlist.push(productId);
      }

      await user.save();
      const populatedUser = await User.findById(userId).populate('wishlist');
      res.json({ success: true, wishlist: populatedUser.wishlist });
    } else {
      const usersList = readMockData('users');
      const productsList = readMockData('products');
      const userIdx = usersList.findIndex(u => u._id.toString() === userId.toString());

      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = usersList[userIdx];
      user.wishlist = user.wishlist || [];
      
      const pIdx = user.wishlist.findIndex(id => id.toString() === productId.toString());
      if (pIdx > -1) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
      } else {
        user.wishlist.push(productId);
      }

      usersList[userIdx] = user;
      writeMockData('users', usersList);

      // Populate manually
      const populatedWishlist = user.wishlist.map(pId => {
        return productsList.find(p => p._id.toString() === pId.toString());
      }).filter(p => p !== undefined && p !== null);

      res.json({ success: true, wishlist: populatedWishlist });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
