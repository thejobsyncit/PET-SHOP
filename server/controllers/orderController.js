import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
import mongoose from 'mongoose';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    pricing,
    prescriptionId,
    transactionId
  } = req.body;

  const userId = req.user._id || req.user.id;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items provided' });
  }

  try {
    if (isDbConnected()) {
      // 1. Check stock & validate
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for product: ${item.name}` });
        }
      }

      // 2. Create Order
      const newOrder = new Order({
        user: userId,
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentDetails: {
          status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
          transactionId: transactionId || `TXN-${Date.now()}`,
          paidAt: paymentMethod === 'Cash on Delivery' ? undefined : new Date()
        },
        pricing,
        prescriptionId: prescriptionId || undefined,
        trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`
      });

      const savedOrder = await newOrder.save();

      // 3. Update stock and clear cart
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

      await User.findByIdAndUpdate(userId, { cart: [] });

      res.status(201).json({ success: true, order: savedOrder });

    } else {
      // 2. Mock JSON Implementation
      const productsList = readMockData('products');
      const usersList = readMockData('users');
      const ordersList = readMockData('orders');

      // Check stock
      for (const item of orderItems) {
        const product = productsList.find(p => p._id.toString() === item.product.toString());
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for product: ${item.name}` });
        }
      }

      // Create Order object
      const newOrder = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: userId.toString(),
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentDetails: {
          status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
          transactionId: transactionId || `TXN-${Date.now()}`,
          paidAt: paymentMethod === 'Cash on Delivery' ? undefined : new Date().toISOString()
        },
        shippingStatus: 'Pending',
        pricing,
        prescriptionId: prescriptionId || undefined,
        trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString()
      };

      ordersList.push(newOrder);
      writeMockData('orders', ordersList);

      // Decrement stock
      for (const item of orderItems) {
        const idx = productsList.findIndex(p => p._id.toString() === item.product.toString());
        if (idx !== -1) {
          productsList[idx].stock -= item.quantity;
        }
      }
      writeMockData('products', productsList);

      // Clear user cart
      const userIdx = usersList.findIndex(u => u._id.toString() === userId.toString());
      if (userIdx !== -1) {
        usersList[userIdx].cart = [];
        writeMockData('users', usersList);
      }

      res.status(201).json({ success: true, order: newOrder });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      const order = await Order.findById(id).populate('user', 'name email').populate('orderItems.product');
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, order });
    } else {
      const ordersList = readMockData('orders');
      const usersList = readMockData('users');
      const order = ordersList.find(o => o._id.toString() === id.toString());

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Populate user info manually
      const user = usersList.find(u => u._id.toString() === order.user.toString());
      const populatedOrder = {
        ...order,
        user: user ? { _id: user._id, name: user.name, email: user.email } : { name: 'Unknown User' }
      };

      res.json({ success: true, order: populatedOrder });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected()) {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      res.json({ success: true, orders });
    } else {
      const ordersList = readMockData('orders');
      const myOrders = ordersList
        .filter(o => o.user.toString() === userId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, orders: myOrders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    if (isDbConnected()) {
      const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
      res.json({ success: true, orders });
    } else {
      const ordersList = readMockData('orders');
      const usersList = readMockData('users');
      
      const populatedOrders = ordersList.map(o => {
        const userObj = usersList.find(u => u._id.toString() === o.user.toString());
        return {
          ...o,
          user: userObj ? { _id: userObj._id, name: userObj.name, email: userObj.email } : { name: 'Unknown User' }
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, orders: populatedOrders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (isDbConnected()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.shippingStatus = status;
      if (status === 'Delivered') {
        order.paymentDetails.status = 'Completed';
        order.paymentDetails.paidAt = new Date();
      }

      await order.save();
      res.json({ success: true, order });
    } else {
      const ordersList = readMockData('orders');
      const idx = ordersList.findIndex(o => o._id.toString() === id.toString());

      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      ordersList[idx].shippingStatus = status;
      if (status === 'Delivered') {
        ordersList[idx].paymentDetails.status = 'Completed';
        ordersList[idx].paymentDetails.paidAt = new Date().toISOString();
      }

      writeMockData('orders', ordersList);
      res.json({ success: true, order: ordersList[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
