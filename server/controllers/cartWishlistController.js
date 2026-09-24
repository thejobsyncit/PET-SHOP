<<<<<<< HEAD
import User from '../models/User.js';
import Product from '../models/Product.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

// ==========================================
// CART CONTROLLERS
// ==========================================

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
<<<<<<< HEAD
    if (isDbConnected() && userId) {
      const user = await User.findById(userId).populate('cart.product');
      if (user) {
        return res.json({ success: true, cart: user.cart || [] });
      }
    }
    
    const usersList = readMockData('users');
    const productsList = readMockData('products');
    const user = usersList.find(u => u._id && u._id.toString() === userId.toString());
    
    if (!user) {
=======
    const { data: user, error: userError } = await supabase.from('users').select('cart').eq('id', userId).single();
    if (userError) throw userError;

    const cart = user?.cart || [];
    if (cart.length === 0) {
>>>>>>> origin/main
      return res.json({ success: true, cart: [] });
    }

    const productIds = cart.map(item => item.product);
    const { data: products, error: prodError } = await supabase.from('products').select('*').in('id', productIds);
    if (prodError) throw prodError;

    const populatedCart = cart.map(item => {
      const prod = products?.find(p => p.id === item.product);
      return {
        product: prod || { _id: item.product, id: item.product, name: 'Unknown Product', price: 0 },
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
    const { data: user, error: userError } = await supabase.from('users').select('cart').eq('id', userId).single();
    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let cart = user.cart || [];
    const itemIndex = cart.findIndex(item => item.product === productId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity += parseInt(quantity);
    } else {
      cart.push({ product: productId, quantity: parseInt(quantity) });
    }

    const { error: updateError } = await supabase.from('users').update({ cart }).eq('id', userId);
    if (updateError) throw updateError;

    // Fetch populated cart to return
    const productIds = cart.map(item => item.product);
    const { data: products } = await supabase.from('products').select('*').in('id', productIds);
    
    const populatedCart = cart.map(item => {
      const prod = products?.find(p => p.id === item.product);
      return {
        product: prod || { _id: item.product, id: item.product, name: 'Unknown Product', price: 0 },
        quantity: item.quantity
      };
    });

    res.json({ success: true, cart: populatedCart });
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
    const { data: user, error: userError } = await supabase.from('users').select('cart').eq('id', userId).single();
    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let cart = user.cart || [];
    const itemIndex = cart.findIndex(item => item.product === productId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity = parseInt(quantity);
      const { error: updateError } = await supabase.from('users').update({ cart }).eq('id', userId);
      if (updateError) throw updateError;
    }

    // Fetch populated cart to return
    const productIds = cart.map(item => item.product);
    const { data: products } = await supabase.from('products').select('*').in('id', productIds);
    
    const populatedCart = cart.map(item => {
      const prod = products?.find(p => p.id === item.product);
      return {
        product: prod || { _id: item.product, id: item.product, name: 'Unknown Product', price: 0 },
        quantity: item.quantity
      };
    });

    res.json({ success: true, cart: populatedCart });
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
    const { data: user, error: userError } = await supabase.from('users').select('cart').eq('id', userId).single();
    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let cart = user.cart || [];
    cart = cart.filter(item => item.product !== productId);

    const { error: updateError } = await supabase.from('users').update({ cart }).eq('id', userId);
    if (updateError) throw updateError;

    // Fetch populated cart to return
    const productIds = cart.map(item => item.product);
    const { data: products } = await supabase.from('products').select('*').in('id', productIds);
    
    const populatedCart = cart.map(item => {
      const prod = products?.find(p => p.id === item.product);
      return {
        product: prod || { _id: item.product, id: item.product, name: 'Unknown Product', price: 0 },
        quantity: item.quantity
      };
    });

    res.json({ success: true, cart: populatedCart });
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
    const { error: updateError } = await supabase.from('users').update({ cart: [] }).eq('id', userId);
    if (updateError) throw updateError;
    res.json({ success: true, cart: [] });
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
<<<<<<< HEAD
    if (isDbConnected() && userId) {
      const user = await User.findById(userId).populate('wishlist');
      if (user) {
        return res.json({ success: true, wishlist: user.wishlist || [] });
      }
    }
=======
    const { data: user, error: userError } = await supabase.from('users').select('wishlist').eq('id', userId).single();
    if (userError) throw userError;
>>>>>>> origin/main

    const wishlist = user?.wishlist || [];
    if (wishlist.length === 0) {
      return res.json({ success: true, wishlist: [] });
    }

    const { data: products, error: prodError } = await supabase.from('products').select('*').in('id', wishlist);
    if (prodError) throw prodError;

    res.json({ success: true, wishlist: products || [] });
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
    const { data: user, error: userError } = await supabase.from('users').select('wishlist').eq('id', userId).single();
    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let wishlist = user.wishlist || [];
    const isWishlisted = wishlist.includes(productId);

    if (isWishlisted) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }

    const { error: updateError } = await supabase.from('users').update({ wishlist }).eq('id', userId);
    if (updateError) throw updateError;

    const { data: products } = await supabase.from('products').select('*').in('id', wishlist);
    res.json({ success: true, wishlist: products || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
