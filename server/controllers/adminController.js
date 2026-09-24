import { supabase } from '../config/supabase.js';

// @desc    Get admin dashboard metrics & charts data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client not initialized' });
    }

    // 1. Fetch basic counts
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER');
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: pendingOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('shipping_status', 'Pending');
    const { count: enquiriesCount } = await supabase.from('enquiries').select('*', { count: 'exact', head: true });
    
    // Low stock products (approximate without RPC)
    const { data: allProducts } = await supabase.from('products').select('stock, low_stock_threshold');
    const lowStockCount = allProducts ? allProducts.filter(p => p.stock <= p.low_stock_threshold).length : 0;
    
    // Since we can't do complex agg easily without RPC, let's fetch orders for revenue
    const { data: allOrders } = await supabase.from('orders').select('pricing, order_items, shipping_status, created_at, users(name, email)').neq('shipping_status', 'Cancelled');
    
    let totalRevenue = 0;
    let soldProductIds = new Set();
    
    if (allOrders) {
      allOrders.forEach(o => {
        totalRevenue += (o.pricing?.total || 0);
        if (o.order_items && Array.isArray(o.order_items)) {
          o.order_items.forEach(item => {
            if (item.product) soldProductIds.add(item.product);
          });
        }
      });
    }

    const soldProductsCount = soldProductIds.size;
    const unsoldProductsCount = Math.max(0, (productsCount || 0) - soldProductsCount);

    // Recent orders
    const { data: recentOrders } = await supabase.from('orders')
      .select('*, user:users(name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Mock charts for now to avoid complex SQL grouping
    const chartsData = {
      salesHistory: [
        { month: '2026-03', revenue: 35000, orders: 12 },
        { month: '2026-04', revenue: 48000, orders: 18 },
        { month: '2026-05', revenue: 64000, orders: 25 },
        { month: '2026-06', revenue: 78000, orders: 30 },
        { month: '2026-07', revenue: 95000, orders: 42 },
        { month: '2026-08', revenue: totalRevenue, orders: ordersCount || 0 }
      ],
      categorySales: [
        { name: 'Dogs', value: 45000 },
        { name: 'Birds', value: 12000 },
        { name: 'Reptiles', value: 28000 },
        { name: 'Fish', value: 18000 },
        { name: 'Pharmacy', value: 24000 }
      ],
      userGrowth: [
        { month: 'March', users: 10 },
        { month: 'April', users: 25 },
        { month: 'May', users: 48 },
        { month: 'June', users: 80 },
        { month: 'July', users: 110 },
        { month: 'August', users: Math.max(usersCount || 0, 12) }
      ]
    };

    res.json({
      success: true,
      stats: {
        usersCount: usersCount || 0,
        productsCount: productsCount || 0,
        ordersCount: ordersCount || 0,
        totalRevenue,
        lowStockCount: lowStockCount || 0,
        pendingOrdersCount: pendingOrdersCount || 0,
        enquiriesCount: enquiriesCount || 0,
        soldProductsCount,
        unsoldProductsCount
      },
      recentOrders: recentOrders || [],
      charts: chartsData
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, mobile, location, verification_status, created_at') // omit password
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, users: users || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['CUSTOMER', 'ADMIN', 'SERVICE_PROVIDER', 'SUPERADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
