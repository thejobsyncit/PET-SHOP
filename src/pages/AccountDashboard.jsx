import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, ClipboardList, ShoppingBag, Plus, Trash2, CheckCircle2, ShieldAlert, Clock, LogOut } from 'lucide-react';
import { 
  fetchProfile, 
  updateProfile, 
  addUserAddress, 
  removeUserAddress, 
  logout 
} from '../store/slices/authSlice.js';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const AccountDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState('orders');

  // Form Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Form Address State
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // History logs states
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchProfile());
      loadUserHistory();
    }
  }, [isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const loadUserHistory = async () => {
    setHistoryLoading(true);
    try {
      const ordersData = await apiRequest('/orders/myorders');
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
      const prescData = await apiRequest('/prescriptions/my');
      if (prescData.success) {
        setPrescriptions(prescData.prescriptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile({ name, email, password }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile details updated successfully!');
      setPassword('');
    } else {
      toast.error(result.payload || 'Profile update failed.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrStreet || !addrCity || !addrState || !addrZip) {
      toast.error('Please enter all address parameters.');
      return;
    }

    const payload = {
      name: addrName,
      phone: addrPhone,
      streetAddress: addrStreet,
      city: addrCity,
      state: addrState,
      postalCode: addrZip,
      isDefault: user.addresses.length === 0
    };

    const result = await dispatch(addUserAddress(payload));
    if (addUserAddress.fulfilled.match(result)) {
      toast.success('Address added to your book!');
      setShowAddressForm(false);
      // Clear address inputs
      setAddrName('');
      setAddrPhone('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
    } else {
      toast.error('Could not save address.');
    }
  };

  const handleRemoveAddress = (addressId) => {
    dispatch(removeUserAddress(addressId));
    toast.success('Address removed.');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully.');
  };

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      
      {/* Overview Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-beige pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">CUSTOMER AREA</span>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1">
            Welcome Back, {user.name}
          </h1>
          <p className="text-xs text-gray-400 font-medium">Logged in as {user.email}</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-beige hover:border-red-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut size={14} /> LOGOUT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar (Left 3 Columns) */}
        <aside className="lg:col-span-3 bg-white border border-beige p-6 space-y-2 shadow-sm">
          {[
            { id: 'orders', label: 'Order History', icon: <ShoppingBag size={16} /> },
            { id: 'prescriptions', label: 'Prescriptions', icon: <ClipboardList size={16} /> },
            { id: 'addresses', label: 'Address Book', icon: <MapPin size={16} /> },
            { id: 'profile', label: 'Profile Details', icon: <User size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab.id 
                  ? 'bg-primary text-white font-bold' 
                  : 'text-gray-500 hover:bg-secondary hover:text-primary'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Dynamic Display Panel (Right 9 Columns) */}
        <div className="lg:col-span-9 bg-white border border-beige p-6 md:p-8 shadow-sm">
          
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Order History
              </h2>
              
              {historyLoading ? (
                <p className="text-xs text-gray-400">Loading orders...</p>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-beige p-5 text-xs space-y-4">
                      {/* Top metadata */}
                      <div className="flex flex-wrap justify-between items-center bg-secondary p-3 border-b border-beige gap-2">
                        <div>
                          <p className="text-gray-400 font-medium">ORDER ID</p>
                          <p className="font-bold text-primary">{order._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">DATE PLACED</p>
                          <p className="font-semibold text-primary">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">SHIPPING STATUS</p>
                          <span className={`font-bold uppercase ${
                            order.shippingStatus === 'Delivered' ? 'text-green-600' :
                            order.shippingStatus === 'Cancelled' ? 'text-red-500' : 'text-accent'
                          }`}>{order.shippingStatus}</span>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">TOTAL AMOUNT</p>
                          <p className="font-bold text-primary">₹{order.pricing.total}</p>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-3">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover bg-gray-100 border border-beige" />
                              <div>
                                <p className="font-semibold text-primary truncate max-w-xs">{item.name}</p>
                                <p className="text-[10px] text-gray-400">Qty: {item.quantity} • Price: ₹{item.price}</p>
                              </div>
                            </div>
                            <span className="font-bold text-primary">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tracking detail */}
                      <div className="flex justify-between items-center border-t border-beige pt-3 text-[11px]">
                        <span className="text-gray-400 font-semibold">Tracking Code: <strong>{order.trackingNumber}</strong></span>
                        {order.prescriptionId && (
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 font-semibold uppercase text-[9px]">
                            Prescription order under review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">You have not placed any orders yet.</p>
              )}
            </div>
          )}

          {/* TAB 2: PRESCRIPTION HISTORY */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Prescription Uploads
              </h2>

              {historyLoading ? (
                <p className="text-xs text-gray-400">Loading prescriptions...</p>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((presc) => (
                    <div key={presc._id} className="border border-beige p-5 text-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="md:col-span-2 space-y-1">
                        <p className="font-bold text-primary text-sm font-serif">Pet: {presc.patientName}</p>
                        <p className="text-gray-500">Doctor: {presc.veterinarianName} ({presc.clinicName || 'No Clinic'})</p>
                        <p className="text-[10px] text-gray-400">Date: {new Date(presc.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        {presc.status === 'Approved' ? (
                          <span className="text-green-600 font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 size={16} /> Approved
                          </span>
                        ) : presc.status === 'Rejected' ? (
                          <span className="text-red-500 font-bold uppercase flex items-center gap-1">
                            <ShieldAlert size={16} /> Rejected
                          </span>
                        ) : (
                          <span className="text-accent font-bold uppercase flex items-center gap-1">
                            <Clock size={16} /> Under Review
                          </span>
                        )}
                      </div>

                      {/* File Link */}
                      <div className="text-right">
                        <a 
                          href={presc.prescriptionFileUrl.startsWith('/uploads') ? `http://localhost:5000${presc.prescriptionFileUrl}` : presc.prescriptionFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-primary text-white font-bold tracking-widest text-[10px] hover:bg-accent hover:text-primary transition uppercase inline-block text-center cursor-pointer"
                        >
                          VIEW DOCUMENT
                        </a>
                      </div>
                      
                      {presc.reviewNotes && (
                        <div className="col-span-full bg-secondary p-3 border border-beige text-[11px] text-gray-600">
                          <strong>Pharmacist Notes:</strong> {presc.reviewNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No prescriptions uploaded yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESS BOOK */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-beige pb-2">
                <h2 className="font-serif text-lg font-bold text-primary">Shipping Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3 py-1.5 bg-primary text-white font-bold tracking-widest text-[10px] hover:bg-accent hover:text-primary transition uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> {showAddressForm ? 'CLOSE FORM' : 'ADD NEW'}
                </button>
              </div>

              {/* Address Addition Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="border border-beige p-5 space-y-4 bg-secondary">
                  <h3 className="font-serif text-sm font-semibold text-primary">New Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Receiver Name"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-premium py-2 text-xs">
                    SAVE ADDRESS
                  </button>
                </form>
              )}

              {/* Address list */}
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((a) => (
                    <div key={a._id} className="border border-beige p-5 text-xs flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-bold text-primary">
                          {a.name} 
                          {a.isDefault && <span className="ml-2 bg-accent/20 text-primary border border-accent/30 text-[9px] px-1.5 py-0.5 uppercase font-bold">Default</span>}
                        </p>
                        <p className="text-gray-500">{a.streetAddress}</p>
                        <p className="text-gray-500">{a.city}, {a.state} - {a.postalCode}</p>
                        <p className="text-gray-400">Phone: {a.phone}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAddress(a._id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No addresses saved. Add a default shipping address above.</p>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Profile Details
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <button type="submit" className="btn-premium py-2 text-xs">
                  UPDATE DETAILS
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AccountDashboard;
