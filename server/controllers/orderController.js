import { supabase } from '../config/supabase.js';

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

  const userId = req.user ? (req.user._id || req.user.id) : null;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required to place an order' });
  }

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items provided' });
  }

  try {
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // Map order items to products in DB
    const productIds = orderItems.map(item => item.product);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productError) throw productError;

    for (const item of orderItems) {
      const product = products?.find(p => p.id === item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name || item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
      }

      const unitPrice = (product.discount_price !== undefined && product.discount_price !== null && product.discount_price > 0)
        ? product.discount_price 
        : product.price;

      calculatedSubtotal += unitPrice * item.quantity;
      verifiedItems.push({
        product: product.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : item.image,
        price: unitPrice,
        quantity: item.quantity
      });
    }

    const shippingCost = calculatedSubtotal > 499 ? 0 : 49;
    const discount = (pricing && typeof pricing.discount === 'number' && pricing.discount >= 0) ? Math.min(pricing.discount, calculatedSubtotal) : 0;
    const totalAmount = Math.max(0, calculatedSubtotal + shippingCost - discount);

    const serverPricing = {
      subtotal: calculatedSubtotal,
      shipping: shippingCost,
      discount: discount,
      total: totalAmount
    };

    const paymentDetails = {
      status: 'Pending',
      transactionId: transactionId || `TXN-${Date.now()}`,
      paidAt: null
    };

    const { data: newOrder, error: orderError } = await supabase.from('orders').insert([{
      user_id: userId,
      order_items: verifiedItems,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_result: paymentDetails,
      pricing: serverPricing,
      shipping_status: 'Pending',
      is_paid: false
    }]).select().single();

    if (orderError) throw orderError;

    // Update stock
    for (const item of verifiedItems) {
      const p = products.find(prod => prod.id === item.product);
      await supabase.from('products').update({ stock: p.stock - item.quantity }).eq('id', item.product);
    }

    // Clear user cart
    await supabase.from('users').update({ cart: [] }).eq('id', userId);

    res.status(201).json({ success: true, order: newOrder });
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
    const requesterId = (req.user._id || req.user.id).toString();
    const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN');

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, user:users(name, email)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user_id !== requesterId && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view this order' });
    }

    res.json({ success: true, order });
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
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, orders: orders || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, user:users(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, orders: orders || [] });
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
    const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
    if (fetchErr || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updates = { shipping_status: status };
    if (status === 'Delivered') {
      const paymentResult = order.payment_result || {};
      paymentResult.status = 'Completed';
      paymentResult.paidAt = new Date().toISOString();
      updates.payment_result = paymentResult;
      updates.is_paid = true;
      updates.paid_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
