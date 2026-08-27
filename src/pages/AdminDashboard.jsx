import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, Users, Layers, AlertTriangle, Clock, 
  Plus, Edit, Trash, Check, X, FileText, CheckCircle, RefreshCw, ChevronRight, MessageSquare, Heart, Lock, Mail, ShieldAlert, Award, ShieldCheck
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { login, logout } from '../store/slices/authSlice.js';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Tab control
  const [activeSection, setActiveSection] = useState('overview');

  // Admin login states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Stats and lists states
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [charts, setCharts] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [studsList, setStudsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Product form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodLongDescription, setProdLongDescription] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodPetType, setProdPetType] = useState('dogs');
  const [prodRequiresPrescription, setProdRequiresPrescription] = useState(false);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodImage, setProdImage] = useState('');

  // Prescription verification modal state
  const [showPrescModal, setShowPrescModal] = useState(false);
  const [activePresc, setActivePresc] = useState(null);
  const [prescNotes, setPrescNotes] = useState('');

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'ADMIN') {
      loadStats();
      loadProducts();
      loadOrders();
      loadPrescriptions();
      loadAdminMarketplaceData();
    }
  }, [isAuthenticated, user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/dashboard');
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setCharts(data.charts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiRequest('/products?limit=100');
      if (data.success) {
        setProductsList(data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await apiRequest('/orders');
      if (data.success) {
        setOrdersList(data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const data = await apiRequest('/prescriptions');
      if (data.success) {
        setPrescriptionsList(data.prescriptions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdminMarketplaceData = async () => {
    try {
      const lData = await apiRequest('/listings');
      if (lData.success) setListingsList(lData.listings);
      
      const sData = await apiRequest('/breeding');
      if (sData.success) setStudsList(sData.studs);

      const bData = await apiRequest('/bookings');
      if (bData.success) setBookingsList(bData.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // ADMIN AUTHENTICATION SUBMIT
  // ==========================================
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error('Please enter both administrator email and password.');
      return;
    }
    setLoginLoading(true);
    const result = await dispatch(login({ email: adminEmail, password: adminPassword }));
    setLoginLoading(false);
    
    if (login.fulfilled.match(result)) {
      const loggedUser = result.payload.user;
      if (loggedUser.role === 'ADMIN') {
        toast.success('Successfully authenticated as Administrator!');
      } else {
        toast.error('Access Denied: Standard customer accounts cannot access the admin console.');
        dispatch(logout());
      }
    } else {
      toast.error(result.payload || 'Invalid administrator credentials.');
    }
  };

  // ==========================================
  // PRODUCT CRUD HANDLERS
  // ==========================================

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdBrand('');
    setProdSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setProdPrice('');
    setProdDiscountPrice('');
    setProdStock('');
    setProdDescription('');
    setProdLongDescription('');
    setProdCategory('Dog Food');
    setProdSubcategory('Dog Food');
    setProdPetType('dogs');
    setProdRequiresPrescription(false);
    setProdIsFeatured(false);
    setProdIsBestSeller(false);
    setProdImage('https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p) => {
    setEditingProductId(p._id);
    setProdName(p.name);
    setProdBrand(p.brand);
    setProdSku(p.sku);
    setProdPrice(p.price);
    setProdDiscountPrice(p.discountPrice || '');
    setProdStock(p.stock);
    setProdDescription(p.description);
    setProdLongDescription(p.longDescription);
    setProdCategory(p.category);
    setProdSubcategory(p.subcategory);
    setProdPetType(p.petType);
    setProdRequiresPrescription(p.requiresPrescription);
    setProdIsFeatured(p.isFeatured);
    setProdIsBestSeller(p.isBestSeller);
    setProdImage(p.images[0]);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodBrand || !prodPrice || !prodStock || !prodCategory || !prodSubcategory) {
      toast.error('Please enter all required fields.');
      return;
    }

    const payload = {
      name: prodName,
      brand: prodBrand,
      sku: prodSku,
      price: parseFloat(prodPrice),
      discountPrice: prodDiscountPrice ? parseFloat(prodDiscountPrice) : undefined,
      stock: parseInt(prodStock),
      description: prodDescription,
      longDescription: prodLongDescription,
      category: prodCategory,
      subcategory: prodSubcategory,
      petType: prodPetType,
      requiresPrescription: prodRequiresPrescription,
      isFeatured: prodIsFeatured,
      isBestSeller: prodIsBestSeller,
      images: [prodImage]
    };

    try {
      let data;
      if (editingProductId) {
        data = await apiRequest(`/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        data = await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (data.success) {
        toast.success(editingProductId ? 'Product details updated!' : 'Product added successfully!');
        setShowProductModal(false);
        loadProducts();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Saving product failed.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const data = await apiRequest(`/products/${productId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        toast.success('Product deleted.');
        loadProducts();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Deletion failed.');
    }
  };

  // ==========================================
  // ORDER ACTIONS HANDLERS
  // ==========================================

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const data = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        loadOrders();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
    }
  };

  // ==========================================
  // PRESCRIPTION VERIFICATION HANDLERS
  // ==========================================

  const handleOpenVerifyPresc = (p) => {
    setActivePresc(p);
    setPrescNotes(p.reviewNotes || '');
    setShowPrescModal(true);
  };

  const handleVerifyPrescription = async (status) => {
    try {
      const data = await apiRequest(`/prescriptions/${activePresc._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          reviewNotes: prescNotes
        })
      });
      if (data.success) {
        toast.success(`Prescription ${status.toLowerCase()}!`);
        setShowPrescModal(false);
        loadPrescriptions();
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    }
  };

  // ==========================================
  // INDIA PET HUB MODERATION HANDLERS
  // ==========================================

  const handleVerifyListing = async (listingId, isVerified) => {
    try {
      const data = await apiRequest(`/listings/${listingId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ isVerified })
      });
      if (data.success) {
        toast.success(isVerified ? 'Classified listing verified!' : 'Listing verification revoked.');
        loadAdminMarketplaceData();
      }
    } catch (err) {
      toast.error('Listing verification failed.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const data = await apiRequest(`/listings/${listingId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        toast.success('Classified listing removed.');
        loadAdminMarketplaceData();
      }
    } catch (err) {
      toast.error('Deletion failed.');
    }
  };

  const handleVerifyStud = async (studId, isVerified) => {
    try {
      const data = await apiRequest(`/breeding/${studId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ isVerified })
      });
      if (data.success) {
        toast.success(isVerified ? 'Stud KCI certification approved!' : 'KCI status revoked.');
        loadAdminMarketplaceData();
      }
    } catch (err) {
      toast.error('Breeding verification failed.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const data = await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (data.success) {
        toast.success(`Booking appointment status updated to ${status}`);
        loadAdminMarketplaceData();
      }
    } catch (err) {
      toast.error('Booking status update failed.');
    }
  };

  const COLORS = ['#1D3B2E', '#7CA085', '#C2D3C6', '#A1C0AA', '#DFE5DF'];

  // CONDITIONAL RENDER: IF NOT ADMIN, RENDER THE ADMIN SIGN IN PANEL INSTEAD OF REDIRECTING
  if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md bg-white border border-[#E3EBE5] p-8 shadow-md space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#7CA085] font-bold">INDIA PET HUB</span>
            <h2 className="font-serif text-xl font-bold text-primary">Admin Gateway</h2>
            <p className="text-xs text-gray-400">Please authenticate with administrator credentials.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="ADMINISTRATOR EMAIL"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-[#E3EBE5] text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="PASSWORD"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-[#E3EBE5] text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full btn-premium py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              {loginLoading ? 'AUTHENTICATING...' : 'ACCESS CONSOLE'}
            </button>
          </form>

          {/* Demo Details box */}
          <div className="bg-[#F1F6F2] p-4 border border-[#E3EBE5] text-[10px] text-gray-500 leading-relaxed space-y-1">
            <p className="font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#7CA085]" /> Admin Credentials Notice
            </p>
            <p><strong>Admin Email:</strong> admin@pawora.com</p>
            <p><strong>Password:</strong> Admin@123</p>
          </div>

          <div className="text-center pt-2">
            <button 
              onClick={() => navigate('/')} 
              className="text-[10px] text-gray-400 hover:text-primary uppercase tracking-widest font-semibold cursor-pointer"
            >
              ← Back to main site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER DYNAMIC EXECUTIVE CONSOLE FOR LOGGED-IN ADMINS WITH VERTICAL SIDEBAR
  return (
    <div className="min-h-screen bg-[#F4F6F4] flex">
      
      {/* 1. LEFT SIDEBAR PANEL (Width 250px) */}
      <aside className="w-64 bg-[#1D3B2E] text-white flex flex-col justify-between p-6 shrink-0 border-r border-[#2E5947]">
        <div className="space-y-8">
          
          {/* Logo Heading */}
          <div className="border-b border-[#2E5947] pb-4">
            <span className="text-[9px] uppercase tracking-widest text-[#7CA085] font-bold block">CONTROL PANEL</span>
            <h1 className="font-serif text-lg font-bold tracking-wider text-[#FAFBF9] mt-0.5 whitespace-nowrap">
              INDIA PET HUB
            </h1>
          </div>

          {/* Tab Selection Lists */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Stats Overview', icon: <TrendingUp size={15} /> },
              { id: 'products', label: 'Manage Products', icon: <Layers size={15} /> },
              { id: 'orders', label: 'Client Orders', icon: <ShoppingBag size={15} /> },
              { id: 'prescriptions', label: 'Rx Verifications', icon: <FileText size={15} /> },
              { id: 'listings', label: 'Moderating Listings', icon: <Heart size={15} /> },
              { id: 'studs', label: 'Verify Breeders', icon: <Award size={15} /> },
              { id: 'bookings', label: 'Services Bookings', icon: <Clock size={15} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-md transition duration-200 cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-[#7CA085] text-[#1D3B2E] shadow-sm'
                    : 'text-[#C2D3C6] hover:bg-[#2E5947] hover:text-[#FAFBF9]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer profile & Logout */}
        <div className="border-t border-[#2E5947] pt-4 text-xs space-y-3">
          <div>
            <p className="font-bold text-[#FAFBF9] truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-[#A1C0AA] truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="w-full py-2 border border-[#7CA085]/35 hover:border-red-500 hover:text-red-500 rounded-md text-[10px] tracking-widest uppercase font-bold text-[#7CA085] hover:bg-red-500/10 transition cursor-pointer"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* 2. RIGHT VIEW MAIN CONSOLE */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen">
        
        {/* Top bar Header */}
        <div className="flex justify-between items-center border-b border-[#E3EBE5] pb-6 mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7CA085] font-bold block">ADMINISTRATION PORTAL</span>
            <h2 className="font-serif text-2xl text-[#1D3B2E] font-medium mt-0.5">
              {activeSection === 'overview' && 'Executive Metrics Overview'}
              {activeSection === 'products' && 'Product Catalogue Manager'}
              {activeSection === 'orders' && 'Client Transaction Logs'}
              {activeSection === 'prescriptions' && 'Vet Prescriptions Review'}
              {activeSection === 'listings' && 'Classified Listings Moderation'}
              {activeSection === 'studs' && 'Breeder KCI Validations'}
              {activeSection === 'bookings' && 'Care Appointment Bookings'}
            </h2>
          </div>

          <button
            onClick={() => { loadStats(); loadAdminMarketplaceData(); }}
            className="px-4 py-2 bg-white border border-[#E3EBE5] hover:border-primary hover:text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition rounded-md shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} /> REFRESH STATS
          </button>
        </div>

        {loading || !stats ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#7CA085] mx-auto mb-4"></div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Compiling metrics logs...</p>
          </div>
        ) : (
          <>
            {/* SECTION 1: OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-12 animate-in fade-in duration-200">
                
                {/* Summary Cards Row with premium tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                  {[
                    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <TrendingUp size={16} />, iconBg: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Total Orders', value: stats.ordersCount, icon: <ShoppingBag size={16} />, iconBg: 'bg-blue-50 text-blue-700' },
                    { label: 'Customers', value: stats.usersCount, icon: <Users size={16} />, iconBg: 'bg-purple-50 text-purple-700' },
                    { label: 'Product SKU Count', value: stats.productsCount, icon: <Layers size={16} />, iconBg: 'bg-amber-50 text-amber-700' },
                    { label: 'Pending Orders', value: stats.pendingOrdersCount, icon: <Clock size={16} />, iconBg: 'bg-orange-50 text-orange-700' },
                    { label: 'Low Stock Alert', value: stats.lowStockCount, icon: <AlertTriangle size={16} />, iconBg: 'bg-rose-50 text-rose-700' }
                  ].map((c) => (
                    <div key={c.label} className="bg-white border border-[#E3EBE5] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{c.label}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${c.iconBg}`}>
                          {c.icon}
                        </div>
                      </div>
                      <p className="text-xl font-bold font-serif text-[#1D3B2E]">{c.value}</p>
                    </div>
                  ))}
                </div>

                {/* Analytical Charts */}
                {charts && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Revenue over time */}
                    <div className="lg:col-span-8 bg-white border border-[#E3EBE5] p-6 shadow-sm space-y-4">
                      <h3 className="font-serif text-sm font-bold text-primary border-b border-[#E3EBE5] pb-2">Sales Revenue History</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={charts.salesHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBE5" />
                            <XAxis dataKey="month" stroke="#A99B8C" fontSize={10} />
                            <YAxis stroke="#A99B8C" fontSize={10} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Sales (INR)" stroke="#1D3B2E" strokeWidth={2.5} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="orders" name="Order count" stroke="#7CA085" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Category distributions */}
                    <div className="lg:col-span-4 bg-white border border-[#E3EBE5] p-6 shadow-sm space-y-4">
                      <h3 className="font-serif text-sm font-bold text-primary border-b border-[#E3EBE5] pb-2">Department Distributions</h3>
                      <div className="h-72 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={charts.categorySales}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {charts.categorySales.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Orders Overview */}
                <div className="bg-white border border-[#E3EBE5] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-[#E3EBE5] pb-2">Recent Order Logs</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-secondary text-primary font-bold border-b border-[#E3EBE5]">
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Shipping Status</th>
                          <th className="p-3 text-right">Total (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE5]">
                        {recentOrders.map((o) => (
                          <tr key={o._id} className="hover:bg-[#FAFBF9] transition">
                            <td className="p-3 font-semibold text-primary">{o._id}</td>
                            <td className="p-3">
                              <p className="font-semibold">{o.user.name}</p>
                              <p className="text-[10px] text-gray-400">{o.user.email}</p>
                            </td>
                            <td className="p-3">{o.paymentMethod}</td>
                            <td className="p-3 font-bold uppercase text-[#7CA085]">{o.shippingStatus}</td>
                            <td className="p-3 text-right font-bold text-primary">₹{o.pricing.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* SECTION 2: PRODUCTS MANAGER */}
            {activeSection === 'products' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-[#E3EBE5] pb-3">
                  <h2 className="font-serif text-lg font-bold text-primary">Product Catalogue ({productsList.length})</h2>
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-primary text-white font-bold tracking-widest text-xs hover:bg-[#7CA085] hover:text-primary transition uppercase flex items-center gap-1.5 cursor-pointer rounded-md"
                  >
                    <Plus size={14} /> ADD NEW PRODUCT
                  </button>
                </div>

                <div className="overflow-x-auto bg-white border border-[#E3EBE5] shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-3">Image</th>
                        <th className="p-3">Product details</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Pricing</th>
                        <th className="p-3">Stock count</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5]">
                      {productsList.map((p) => (
                        <tr key={p._id} className="hover:bg-[#FAFBF9] transition">
                          <td className="p-3">
                            <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover bg-gray-50 border border-[#E3EBE5]" />
                          </td>
                          <td className="p-3 space-y-1">
                            <p className="font-bold text-primary truncate max-w-xs">{p.name}</p>
                            <p className="text-[10px] text-accent uppercase font-bold tracking-wider">{p.brand} • {p.petType}</p>
                            {p.requiresPrescription && <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full">Rx Required</span>}
                          </td>
                          <td className="p-3 font-semibold text-gray-500">{p.sku}</td>
                          <td className="p-3">
                            <p className="font-bold text-primary">₹{p.discountPrice || p.price}</p>
                            {p.discountPrice && <p className="text-[10px] text-gray-400 line-through">₹{p.price}</p>}
                          </td>
                          <td className="p-3">
                            <span className={`font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= p.lowStockThreshold ? 'text-orange-500' : 'text-green-600'}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-2 border border-[#E3EBE5] hover:border-primary hover:bg-[#FAFBF9] transition cursor-pointer text-gray-500"
                                title="Edit product"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="p-2 border border-[#E3EBE5] hover:border-red-500 hover:text-red-500 transition cursor-pointer text-gray-500"
                                title="Delete product"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 3: CLIENT ORDERS MANAGER */}
            {activeSection === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Client Order Logs ({ordersList.length})</h2>

                <div className="overflow-x-auto bg-white border border-[#E3EBE5] shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Customer info</th>
                        <th className="p-3 text-right">Pricing (INR)</th>
                        <th className="p-3">Shipping Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5]">
                      {ordersList.map((o) => (
                        <tr key={o._id} className="hover:bg-[#FAFBF9] transition text-xs">
                          <td className="p-3 font-semibold text-primary">{o._id}</td>
                          <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <p className="font-bold">{o.user?.name || 'Guest user'}</p>
                            <p className="text-[10px] text-gray-400">{o.user?.email}</p>
                          </td>
                          <td className="p-3 text-right font-bold text-primary">₹{o.pricing.total}</td>
                          <td className="p-3">
                            <span className={`font-bold uppercase text-[10px] ${
                              o.shippingStatus === 'Delivered' ? 'text-green-600' :
                              o.shippingStatus === 'Cancelled' ? 'text-red-500' : 'text-accent'
                            }`}>{o.shippingStatus}</span>
                          </td>
                          <td className="p-3 text-center">
                            <select
                              value={o.shippingStatus}
                              onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                              className="bg-transparent border border-[#E3EBE5] p-1 font-bold text-[10px] focus:outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Refunded">Refunded</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 4: RX VERIFICATIONS MANAGER */}
            {activeSection === 'prescriptions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Prescriptions Queue ({prescriptionsList.length})</h2>

                <div className="overflow-x-auto bg-white border border-[#E3EBE5] shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-3">Presc ID</th>
                        <th className="p-3">Upload Date</th>
                        <th className="p-3">Customer info</th>
                        <th className="p-3">Patient & Doctor details</th>
                        <th className="p-3">Review Status</th>
                        <th className="p-3 text-center">Verify Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {prescriptionsList.map((p) => (
                        <tr key={p._id} className="hover:bg-[#FAFBF9] transition">
                          <td className="p-3 font-semibold text-primary">{p._id}</td>
                          <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <p className="font-bold">{p.user?.name}</p>
                            <p className="text-[10px] text-gray-400">{p.user?.email}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-primary">Pet: {p.patientName}</p>
                            <p className="text-[10px] text-gray-400">Dr. {p.veterinarianName} ({p.clinicName || 'No Clinic'})</p>
                          </td>
                          <td className="p-3">
                            <span className={`font-bold uppercase text-[10px] ${
                              p.status === 'Approved' ? 'text-green-600' :
                              p.status === 'Rejected' ? 'text-red-500' : 'text-accent'
                            }`}>{p.status}</span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleOpenVerifyPresc(p)}
                              className="px-3 py-1.5 border border-[#E3EBE5] hover:border-primary text-[10px] tracking-wider uppercase font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <FileText size={12} /> EVALUATE
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 5: CLASSIFIED LISTINGS MODERATION */}
            {activeSection === 'listings' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Moderate Classified Listings ({listingsList.length})</h2>

                <div className="overflow-x-auto bg-white border border-[#E3EBE5] shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-3">Listing Details</th>
                        <th className="p-3">Owner Contact</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Location</th>
                        <th className="p-3 text-center">Verification Stamp</th>
                        <th className="p-3 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {listingsList.map((l) => (
                        <tr key={l._id} className="hover:bg-[#FAFBF9] transition">
                          <td className="p-3 space-y-1">
                            <p className="font-bold text-primary">{l.title}</p>
                            <p className="text-[10px] text-gray-400">Breed: {l.breed} • Age: {l.age}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold">{l.user?.name}</p>
                            <p className="text-[10px] text-gray-400">{l.contactPhone}</p>
                          </td>
                          <td className="p-3 font-bold text-primary">
                            {l.price === 0 ? 'Free Rehoming' : `₹${l.price}`}
                          </td>
                          <td className="p-3">{l.location}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleVerifyListing(l._id, !l.isVerified)}
                              className={`px-3 py-1.5 font-bold tracking-widest text-[9px] uppercase transition cursor-pointer ${
                                l.isVerified 
                                  ? 'bg-[#FAFBF9] text-green-700 border border-green-200' 
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}
                            >
                              {l.isVerified ? 'VERIFIED' : 'PENDING'}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteListing(l._id)}
                              className="p-2 border border-beige hover:border-red-500 hover:text-red-500 transition cursor-pointer"
                            >
                              <Trash size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 6: BREEDERS & STUDS MODERATION */}
            {activeSection === 'studs' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Verify Breeder KCI Registrations ({studsList.length})</h2>

                <div className="overflow-x-auto bg-white border border-[#E3EBE5] shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-3">Stud Profile</th>
                        <th className="p-3">KCI License No.</th>
                        <th className="p-3">Breeder Contact</th>
                        <th className="p-3">Stud Fee</th>
                        <th className="p-3 text-center">Breeder Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {studsList.map((s) => (
                        <tr key={s._id} className="hover:bg-[#FAFBF9] transition">
                          <td className="p-3 space-y-1">
                            <p className="font-bold text-primary">{s.studName}</p>
                            <p className="text-[10px] text-gray-400">Breed: {s.breed} • Age: {s.age}</p>
                          </td>
                          <td className="p-3 font-semibold text-gray-500 uppercase">{s.kciNumber}</td>
                          <td className="p-3">
                            <p className="font-semibold">{s.user?.name}</p>
                            <p className="text-[10px] text-gray-400">{s.contactPhone}</p>
                          </td>
                          <td className="p-3 font-bold text-primary">₹{s.studFee}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleVerifyStud(s._id, !s.isVerified)}
                              className={`px-3 py-1.5 font-bold tracking-widest text-[9px] uppercase transition cursor-pointer ${
                                s.isVerified 
                                  ? 'bg-[#FAFBF9] text-green-700 border border-green-200' 
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}
                            >
                              {s.isVerified ? 'KCI CERTIFIED' : 'PENDING CHECK'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 7: GLOBAL APPOINTMENTS BOOKINGS */}
            {activeSection === 'bookings' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Service Appointments & Bookings ({bookingsList.length})</h2>

                <div className="overflow-x-auto bg-white border border-[#E3EBE5] shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-3">Appointment ID</th>
                        <th className="p-3">Service & Provider</th>
                        <th className="p-3">Customer & Pet</th>
                        <th className="p-3">Date & Time Slot</th>
                        <th className="p-3">Consultation Fee</th>
                        <th className="p-3 text-center">Booking Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {bookingsList.map((b) => (
                        <tr key={b._id} className="hover:bg-[#FAFBF9] transition">
                          <td className="p-3 font-semibold text-primary">{b._id}</td>
                          <td className="p-3 space-y-1">
                            <p className="font-bold text-primary">{b.serviceType}</p>
                            <p className="text-[10px] text-gray-400">Dr./Groomer: {b.providerName}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold">{b.user?.name || 'Client'}</p>
                            <p className="text-[10px] text-[#7CA085] uppercase font-bold">Pet: {b.petDetails?.name} ({b.petDetails?.breed})</p>
                          </td>
                          <td className="p-3 space-y-1">
                            <p className="font-semibold">{b.date}</p>
                            <p className="text-[10px] text-gray-400">{b.timeSlot}</p>
                          </td>
                          <td className="p-3 font-bold text-primary">₹{b.fee}</td>
                          <td className="p-3 text-center">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                              className="bg-transparent border border-beige p-1 font-bold text-[10px] focus:outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </>
        )}

      </main>

      {/* POPUP MODAL: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowProductModal(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>
          
          <form 
            onSubmit={handleSaveProduct}
            className="relative bg-white w-full max-w-2xl border border-beige shadow-2xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-serif text-sm font-bold tracking-wider text-accent uppercase">
                {editingProductId ? 'Edit Product Parameters' : 'Add New Product Record'}
              </h3>
              <button type="button" onClick={() => setShowProductModal(false)} className="text-white hover:text-accent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Product Name *</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Brand *</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">SKU *</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Price (INR) *</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Discount Price</label>
                  <input
                    type="number"
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Stock Units *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pet Department *</label>
                  <select
                    value={prodPetType}
                    onChange={(e) => setProdPetType(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="dogs">Dogs</option>
                    <option value="birds">Birds</option>
                    <option value="reptiles">Reptiles</option>
                    <option value="fish">Fish</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Category *</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Subcategory *</label>
                  <input
                    type="text"
                    value={prodSubcategory}
                    onChange={(e) => setProdSubcategory(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 font-semibold block">Main Image URL *</label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 font-semibold block">Short Description</label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 font-semibold block">Long Detailed Description</label>
                <textarea
                  rows={3}
                  value={prodLongDescription}
                  onChange={(e) => setProdLongDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={prodRequiresPrescription}
                    onChange={(e) => setProdRequiresPrescription(e.target.checked)}
                    className="rounded-none border-beige text-primary focus:ring-0"
                  />
                  <span>Requires Vet Prescription (Rx)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="rounded-none border-beige text-primary focus:ring-0"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={prodIsBestSeller}
                    onChange={(e) => setProdIsBestSeller(e.target.checked)}
                    className="rounded-none border-beige text-primary focus:ring-0"
                  />
                  <span>Bestseller</span>
                </label>
              </div>
            </div>

            <div className="bg-secondary px-6 py-4 border-t border-beige flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowProductModal(false)}
                className="btn-secondary-premium py-2 text-xs"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="btn-premium py-2 text-xs"
              >
                SAVE CATALOG RECORD
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP MODAL: EVALUATE PRESCRIPTION */}
      {showPrescModal && activePresc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowPrescModal(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>
          
          <div className="relative bg-white w-full max-w-2xl border border-beige shadow-2xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-serif text-sm font-bold tracking-wider text-[#7CA085] uppercase flex items-center gap-1.5">
                <FileText size={16} /> Evaluate Prescription Document
              </h3>
              <button onClick={() => setShowPrescModal(false)} className="text-white hover:text-[#7CA085] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex flex-col md:flex-row gap-6">
              {/* Document Image view */}
              <div className="w-full md:w-1/2 aspect-square border border-beige bg-gray-50 overflow-hidden shrink-0">
                <a 
                  href={activePresc.prescriptionFileUrl.startsWith('/uploads') ? `http://localhost:5000${activePresc.prescriptionFileUrl}` : activePresc.prescriptionFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Click to view full screen file"
                >
                  <img 
                    src={activePresc.prescriptionFileUrl.startsWith('/uploads') ? `http://localhost:5000${activePresc.prescriptionFileUrl}` : activePresc.prescriptionFileUrl} 
                    alt="Prescription Document file scan" 
                    className="w-full h-full object-contain cursor-zoom-in" 
                  />
                </a>
              </div>

              {/* Review Info */}
              <div className="flex-grow space-y-4">
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Customer Details</p>
                  <p className="font-bold text-primary">{activePresc.user?.name} ({activePresc.user?.email})</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Patient Pet Name</p>
                  <p className="font-bold text-primary">{activePresc.patientName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Doctor Name & Clinic</p>
                  <p className="font-bold text-primary">Dr. {activePresc.veterinarianName} ({activePresc.clinicName || 'None'})</p>
                </div>
                {activePresc.customerComments && (
                  <div className="space-y-1 bg-secondary p-2.5 border border-beige">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Customer Comments</p>
                    <p className="text-[11px] leading-relaxed text-gray-600">{activePresc.customerComments}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pharmacist Review Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter stamp checks, validation approvals or rejection reason notes..."
                    value={prescNotes}
                    onChange={(e) => setPrescNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-secondary px-6 py-4 border-t border-beige flex justify-end gap-3 shrink-0">
              <button
                onClick={() => handleVerifyPrescription('Rejected')}
                className="px-4 py-2 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-bold tracking-widest text-[10px] uppercase transition cursor-pointer"
              >
                REJECT SLIP
              </button>
              <button
                onClick={() => handleVerifyPrescription('Approved')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold tracking-widest text-[10px] uppercase transition cursor-pointer"
              >
                APPROVE PRESCRIPTION
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
