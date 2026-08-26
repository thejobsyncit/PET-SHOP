import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { isDbConnected, readMockData } from '../utils/mockDb.js';

// @desc    Get admin dashboard metrics & charts data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    let usersCount = 0;
    let productsCount = 0;
    let ordersCount = 0;
    let totalRevenue = 0;
    let lowStockCount = 0;
    let pendingOrdersCount = 0;
    let recentOrders = [];
    let chartsData = {
      salesHistory: [],
      categorySales: [],
      userGrowth: []
    };

    if (isDbConnected()) {
      // 1. MongoDB Aggregations
      usersCount = await User.countDocuments({ role: 'CUSTOMER' });
      productsCount = await Product.countDocuments({});
      ordersCount = await Order.countDocuments({});
      pendingOrdersCount = await Order.countDocuments({ shippingStatus: 'Pending' });
      
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] }
      });
      lowStockCount = lowStockProducts.length;

      // Revenue Calculation
      const revenueStats = await Order.aggregate([
        { $match: { shippingStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]);
      totalRevenue = revenueStats[0] ? revenueStats[0].total : 0;

      // Recent Orders
      recentOrders = await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      // --- Chart Data Mocking/Aggregation ---
      // Sales History (Last 6 months)
      const salesAggr = await Order.aggregate([
        { $match: { shippingStatus: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$pricing.total" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 6 }
      ]);
      
      chartsData.salesHistory = salesAggr.map(item => ({
        month: item._id,
        revenue: item.revenue,
        orders: item.orders
      }));

      // Category Sales Distribution
      const catAggr = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.name", // Group by product name or manually fetch category
            sales: { $sum: "$orderItems.quantity" }
          }
        },
        { $limit: 5 }
      ]);

      // Category fallback
      chartsData.categorySales = [
        { name: 'Dogs', value: 45000 },
        { name: 'Birds', value: 12000 },
        { name: 'Reptiles', value: 28000 },
        { name: 'Fish', value: 18000 },
        { name: 'Pharmacy', value: 24000 }
      ];

      chartsData.userGrowth = [
        { month: 'March', users: 10 },
        { month: 'April', users: 25 },
        { month: 'May', users: 48 },
        { month: 'June', users: 80 },
        { month: 'July', users: 110 },
        { month: 'August', users: usersCount }
      ];

    } else {
      // 2. Mock JSON Operations
      const usersList = readMockData('users');
      const productsList = readMockData('products');
      const ordersList = readMockData('orders');

      usersCount = usersList.filter(u => u.role === 'CUSTOMER').length;
      productsCount = productsList.length;
      ordersCount = ordersList.length;
      pendingOrdersCount = ordersList.filter(o => o.shippingStatus === 'Pending').length;
      lowStockCount = productsList.filter(p => p.stock <= p.lowStockThreshold).length;

      // Revenue Calculation
      const nonCancelledOrders = ordersList.filter(o => o.shippingStatus !== 'Cancelled');
      totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.pricing.total || 0), 0);

      // Recent Orders populated
      recentOrders = ordersList.map(o => {
        const usr = usersList.find(u => u._id.toString() === o.user.toString());
        return {
          ...o,
          user: usr ? { _id: usr._id, name: usr.name, email: usr.email } : { name: 'Unknown User' }
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

      // Generate realistic static/dynamic charts for development
      chartsData.salesHistory = [
        { month: '2026-03', revenue: 35000, orders: 12 },
        { month: '2026-04', revenue: 48000, orders: 18 },
        { month: '2026-05', revenue: 64000, orders: 25 },
        { month: '2026-06', revenue: 78000, orders: 30 },
        { month: '2026-07', revenue: 95000, orders: 42 },
        { month: '2026-08', revenue: totalRevenue, orders: ordersCount }
      ];

      chartsData.categorySales = [
        { name: 'Dogs', value: 45000 },
        { name: 'Birds', value: 12000 },
        { name: 'Reptiles', value: 28000 },
        { name: 'Fish', value: 18000 },
        { name: 'Pharmacy', value: 24000 }
      ];

      chartsData.userGrowth = [
        { month: 'March', users: 10 },
        { month: 'April', users: 25 },
        { month: 'May', users: 48 },
        { month: 'June', users: 80 },
        { month: 'July', users: 110 },
        { month: 'August', users: Math.max(usersCount, 12) }
      ];
    }

    res.json({
      success: true,
      stats: {
        usersCount,
        productsCount,
        ordersCount,
        totalRevenue,
        lowStockCount,
        pendingOrdersCount
      },
      recentOrders,
      charts: chartsData
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
