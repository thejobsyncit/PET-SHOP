import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight,
  Briefcase, Phone, Eye, EyeOff, Search, MapPin, AlertCircle
} from 'lucide-react';
import { login, register, clearAuthError, logout } from '../store/slices/authSlice.js';
import toast from 'react-hot-toast';

// Indian States & Major Cities Data for Searchable Autocomplete
const INDIAN_STATES_CITIES = {
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Davangere', 'Bellary', 'Shimoga', 'Tumkur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Solapur'],
  'Delhi NCR': ['New Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Noida'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bhatinda', 'Mohali'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer']
};

const providerServiceCategories = [
  'Pet Seller',
  'Pet Adoption',
  'Pet Hostel / Boarding',
  'Pet Grooming Spa',
  'Pet Walking & Fitness',
  'Pet Transport & Relocation',
  'Pet Insurance',
  'Pet Training & Behavior',
  'Pet Mating & Breeding',
  'Vet'
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, error, loading } = useSelector((state) => state.auth);

  // Main Auth Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Registration Sub-Tab: 'user' | 'provider'
  const [registerRoleTab, setRegisterRoleTab] = useState('user');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Visibility Toggle States
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showProviderPassword, setShowProviderPassword] = useState(false);

  // User Registration States
  const [userFullName, setUserFullName] = useState('');
  const [userMobileNo, setUserMobileNo] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userState, setUserState] = useState('Karnataka');
  const [userCitySearch, setUserCitySearch] = useState('Bangalore');
  const [isUserCityDropdownOpen, setIsUserCityDropdownOpen] = useState(false);
  const [userMobileError, setUserMobileError] = useState('');
  const [userPasswordError, setUserPasswordError] = useState('');

  // Service Provider Registration States
  const [providerBusinessName, setProviderBusinessName] = useState('');
  const [providerMobileNo, setProviderMobileNo] = useState('');
  const [providerEmail, setProviderEmail] = useState('');
  const [providerPassword, setProviderPassword] = useState('');
  const [providerCategory, setProviderCategory] = useState('Pet Seller');
  const [providerState, setProviderState] = useState('Karnataka');
  const [providerCitySearch, setProviderCitySearch] = useState('Bangalore');
  const [isProviderCityDropdownOpen, setIsProviderCityDropdownOpen] = useState(false);
  const [providerMobileError, setProviderMobileError] = useState('');
  const [providerEmailError, setProviderEmailError] = useState('');
  const [providerPasswordError, setProviderPasswordError] = useState('');

  // Dropdown Refs
  const userCityRef = useRef(null);
  const providerCityRef = useRef(null);

  const indianStates = Object.keys(INDIAN_STATES_CITIES);

  // Clear errors on tab swap
  useEffect(() => {
    dispatch(clearAuthError());
  }, [activeTab, registerRoleTab, dispatch]);

  // Click outside listener for city search popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userCityRef.current && !userCityRef.current.contains(event.target)) {
        setIsUserCityDropdownOpen(false);
      }
      if (providerCityRef.current && !providerCityRef.current.contains(event.target)) {
        setIsProviderCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auth Redirects
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        toast.error('Access Denied: Administrator logins must be processed via the secure Admin Gateway.');
        dispatch(logout());
      } else {
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/account');
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  // Password Complexity Validator (Max 10 chars, Cap, Small, Num, Spec)
  const validatePassword = (pwd) => {
    if (!pwd) return 'Password is required *';
    if (pwd.length > 10) return 'Password total length must not exceed 10 characters *';
    if (!/[A-Z]/.test(pwd)) return 'Must contain at least 1 capital letter (A-Z) *';
    if (!/[a-z]/.test(pwd)) return 'Must contain at least 1 small letter (a-z) *';
    if (!/[0-9]/.test(pwd)) return 'Must contain at least 1 number (0-9) *';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Must contain at least 1 special character (!@#$%^&*) *';
    return '';
  };

  // Mobile Number Handler (Strict 10 Digits)
  const handleMobileChange = (e, setVal, setError) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length > 10) {
      setError('Mobile number cannot exceed 10 digits *');
      return;
    }
    setVal(cleaned);
    if (cleaned.length === 0) {
      setError('Mobile number is required *');
    } else if (cleaned.length < 10) {
      setError(`Mobile number must be exactly 10 digits (${cleaned.length}/10) *`);
    } else {
      setError('');
    }
  };

  // State Change Handlers
  const handleUserStateChange = (e) => {
    const newState = e.target.value;
    setUserState(newState);
    const availableCities = INDIAN_STATES_CITIES[newState] || [];
    setUserCitySearch(availableCities[0] || '');
  };

  const handleProviderStateChange = (e) => {
    const newState = e.target.value;
    setProviderState(newState);
    const availableCities = INDIAN_STATES_CITIES[newState] || [];
    setProviderCitySearch(availableCities[0] || '');
  };

  // 1. Sign In Submit Handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password.');
      return;
    }
    dispatch(login({ email: loginEmail, password: loginPassword }));
  };

  // 2. User Registration Submit Handler
  const handleUserSubmit = async (e) => {
    e.preventDefault();

    if (!userMobileNo || userMobileNo.length !== 10) {
      setUserMobileError(
        !userMobileNo
          ? 'Mobile number is required *'
          : `Mobile number must be exactly 10 digits (${userMobileNo.length}/10) *`
      );
      toast.error('Mobile number must be exactly 10 digits!');
      return;
    }
    setUserMobileError('');

    const pwdErr = validatePassword(userPassword);
    if (pwdErr) {
      setUserPasswordError(pwdErr);
      toast.error(pwdErr);
      return;
    }
    setUserPasswordError('');

    const payload = {
      name: userFullName || 'Pet Lover',
      email: userEmail || `user_${userMobileNo}@pawora.com`,
      mobile: userMobileNo,
      password: userPassword,
      role: 'CUSTOMER',
      location: `${userCitySearch}, ${userState}`
    };

    try {
      const result = await dispatch(register(payload));
      if (register.fulfilled.match(result)) {
        toast.success(`Welcome ${userFullName || 'Pet Parent'}! Account registered successfully.`);
        navigate('/account');
      }
    } catch (err) {
      toast.error('Registration could not be completed. Please try again.');
    }
  };

  // 3. Service Provider Registration Submit Handler
  const handleProviderSubmit = async (e) => {
    e.preventDefault();

    if (!providerMobileNo || providerMobileNo.length !== 10) {
      setProviderMobileError(
        !providerMobileNo
          ? 'Mobile number is required *'
          : `Mobile number must be exactly 10 digits (${providerMobileNo.length}/10) *`
      );
      toast.error('Mobile number must be exactly 10 digits!');
      return;
    }
    setProviderMobileError('');

    if (!providerEmail || !providerEmail.includes('@')) {
      setProviderEmailError('Business Email is mandatory for Service Providers *');
      toast.error('Business Email is required for Service Providers!');
      return;
    }
    setProviderEmailError('');

    const pwdErr = validatePassword(providerPassword);
    if (pwdErr) {
      setProviderPasswordError(pwdErr);
      toast.error(pwdErr);
      return;
    }
    setProviderPasswordError('');

    const payload = {
      name: providerBusinessName || 'Pet Partner',
      email: providerEmail,
      mobile: providerMobileNo,
      password: providerPassword,
      role: 'SERVICE_PROVIDER',
      serviceCategory: providerCategory,
      location: `${providerCitySearch}, ${providerState}`
    };

    try {
      const result = await dispatch(register(payload));
      if (register.fulfilled.match(result)) {
        toast.success(`Partner registration successful! Welcome ${providerBusinessName || 'Provider'}.`);
        navigate('/account');
      }
    } catch (err) {
      toast.error('Partner registration could not be completed. Please try again.');
    }
  };

  // Available cities lists
  const availableUserCities = INDIAN_STATES_CITIES[userState] || [];
  const filteredUserCities = availableUserCities.filter(c =>
    c.toLowerCase().includes(userCitySearch.toLowerCase())
  );

  const availableProviderCities = INDIAN_STATES_CITIES[providerState] || [];
  const filteredProviderCities = availableProviderCities.filter(c =>
    c.toLowerCase().includes(providerCitySearch.toLowerCase())
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#f0f5fa] via-secondary to-[#f8fafc]">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Top Header Branding Banner */}
        <div className="bg-[#15559c] px-6 py-6 text-center text-white relative">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/10 border border-[#ffd000]/40 flex items-center justify-center shadow-md">
            <span className="text-xl">🐾</span>
          </div>
          <h1 className="font-serif text-xl font-bold tracking-wider text-white">
            INDIA PET HUB
          </h1>
          <p className="text-xs text-blue-100 mt-0.5 font-medium">
            Your Trusted Multi-Service Pet Platform
          </p>
        </div>

        {/* Main Dual Tab Switcher: SIGN IN vs CREATE ACCOUNT */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-[#15559c] shadow-md font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#15559c] text-white shadow-md font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* =========================================================================
              1. SIGN IN FORM
             ========================================================================= */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center space-y-0.5 pb-1">
                <span className="text-[10px] uppercase tracking-widest text-[#15559c] font-bold">WELCOME BACK</span>
                <h2 className="font-serif text-lg font-bold text-slate-800">Login to India Pet Hub</h2>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Password *"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#15559c] hover:bg-[#0f3d6b] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
                <ArrowRight size={14} />
              </button>

              {/* Developer Demo Details box */}
              <div className="bg-[#f0f6fc] p-3.5 rounded-xl border border-[#cbe0f5] text-[11px] text-[#0f3d6b] leading-relaxed space-y-1">
                <p className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#15559c]">
                  <ShieldCheck size={14} className="text-[#15559c]" /> Developer Demo Credentials
                </p>
                <p className="text-slate-600"><strong>Customer:</strong> customer1@pawora.com / Customer@123</p>
              </div>
            </form>
          ) : (
            /* =========================================================================
                2. CREATE ACCOUNT WITH 2 SECTIONS (USER / SERVICE PROVIDER)
               ========================================================================= */
            <div className="space-y-4">
              
              {/* Registration Sub-Role Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRegisterRoleTab('user')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    registerRoleTab === 'user'
                      ? 'bg-white text-[#15559c] shadow-md font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User size={14} />
                  <span>Register as User</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterRoleTab('provider')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    registerRoleTab === 'provider'
                      ? 'bg-[#15559c] text-white shadow-md font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Briefcase size={14} />
                  <span>Service Provider</span>
                </button>
              </div>

              {/* Description Header */}
              <p className="text-xs text-center text-slate-500 font-medium pb-1">
                {registerRoleTab === 'user'
                  ? 'Please fill in the details to register as a Pet Parent / User'
                  : 'Join as a verified Service Provider / Business Partner'
                }
              </p>

              {/* -----------------------------------------------------------------
                  SECTION A: USER REGISTRATION FORM
                 ----------------------------------------------------------------- */}
              {registerRoleTab === 'user' && (
                <form onSubmit={handleUserSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                    />
                  </div>

                  {/* Mobile No with 10 Digits Strict Validation & REQUIRED Badge */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Mobile No *"
                        value={userMobileNo}
                        onChange={(e) => handleMobileChange(e, setUserMobileNo, setUserMobileError)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-24 font-semibold ${
                          userMobileError
                            ? 'border-red-500 ring-2 ring-red-100 text-red-900 placeholder-red-400'
                            : 'border-blue-300 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 shadow-sm'
                        }`}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 text-[#15559c] font-bold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider pointer-events-none flex items-center gap-1">
                        <Phone size={10} /> REQUIRED *
                      </span>
                    </div>
                    {userMobileError ? (
                      <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {userMobileError}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 pl-1 font-semibold flex items-center gap-1">
                        <Sparkles size={10} className="text-[#15559c]" />
                        Must be exactly 10 digits for instant account access
                      </p>
                    )}
                  </div>

                  {/* Email & Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type={showUserPassword ? "text" : "password"}
                          maxLength={10}
                          placeholder="Password *"
                          value={userPassword}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserPassword(val);
                            setUserPasswordError(validatePassword(val));
                          }}
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-10 ${
                            userPasswordError
                              ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                              : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowUserPassword(!showUserPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#15559c] transition p-1 cursor-pointer"
                          title={showUserPassword ? "Hide Password" : "View Password"}
                        >
                          {showUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {userPasswordError && (
                        <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight">{userPasswordError}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Rules Badge */}
                  <div className="bg-blue-50/60 p-2.5 rounded-lg text-[10px] text-[#0f3d6b] font-medium space-y-0.5 border border-blue-100">
                    <span className="font-bold text-[#15559c] block">Password Rules (Max 10 chars):</span>
                    <p>• At least 1 Capital (A-Z), 1 Small (a-z), 1 Number (0-9), & 1 Special char (!@#$%^&*)</p>
                  </div>

                  {/* State & Searchable City Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        value={userState}
                        onChange={handleUserStateChange}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm bg-slate-50/50 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                      >
                        {indianStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative" ref={userCityRef}>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search / Type City..."
                          value={userCitySearch}
                          onChange={(e) => {
                            setUserCitySearch(e.target.value);
                            setIsUserCityDropdownOpen(true);
                          }}
                          onFocus={() => setIsUserCityDropdownOpen(true)}
                          className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                        />
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      {isUserCityDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-36 overflow-y-auto divide-y divide-slate-50 animate-in fade-in zoom-in-95">
                          {filteredUserCities.length > 0 ? (
                            filteredUserCities.map((c) => (
                              <div
                                key={c}
                                onClick={() => {
                                  setUserCitySearch(c);
                                  setIsUserCityDropdownOpen(false);
                                }}
                                className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#15559c] cursor-pointer flex items-center justify-between font-medium transition"
                              >
                                <span>{c}</span>
                                <MapPin size={10} className="text-blue-400" />
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-[11px] text-slate-400 font-medium text-center">
                              Use "{userCitySearch}" as custom city
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Register as User Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#15559c] hover:bg-[#0f3d6b] text-white font-bold text-xs md:text-sm tracking-wide rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <User size={16} />
                      <span>{loading ? 'REGISTERING...' : 'Register as User'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* -----------------------------------------------------------------
                  SECTION B: SERVICE PROVIDER REGISTRATION FORM
                 ----------------------------------------------------------------- */}
              {registerRoleTab === 'provider' && (
                <form onSubmit={handleProviderSubmit} className="space-y-3.5">
                  {/* Business Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Business Name / Full Name *"
                      value={providerBusinessName}
                      onChange={(e) => setProviderBusinessName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                      required
                    />
                  </div>

                  {/* Mobile No with 10 Digits Strict Validation */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Mobile No *"
                        value={providerMobileNo}
                        onChange={(e) => handleMobileChange(e, setProviderMobileNo, setProviderMobileError)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-24 font-semibold ${
                          providerMobileError
                            ? 'border-red-500 ring-2 ring-red-100 text-red-900 placeholder-red-400'
                            : 'border-blue-300 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 shadow-sm'
                        }`}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 text-[#15559c] font-bold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider pointer-events-none flex items-center gap-1">
                        <Phone size={10} /> REQUIRED *
                      </span>
                    </div>
                    {providerMobileError ? (
                      <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {providerMobileError}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 pl-1 font-semibold flex items-center gap-1">
                        <Sparkles size={10} className="text-[#15559c]" />
                        Must be exactly 10 digits for verified client bookings & leads
                      </p>
                    )}
                  </div>

                  {/* Email & Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <input
                        type="email"
                        placeholder="Business Email *"
                        value={providerEmail}
                        onChange={(e) => {
                          setProviderEmail(e.target.value);
                          if (providerEmailError) setProviderEmailError('');
                        }}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition ${
                          providerEmailError
                            ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                            : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 bg-slate-50/50 hover:bg-white font-medium'
                        }`}
                        required
                      />
                      {providerEmailError && (
                        <p className="text-[10px] font-bold text-red-500 pl-1">{providerEmailError}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type={showProviderPassword ? "text" : "password"}
                          maxLength={10}
                          placeholder="Password *"
                          value={providerPassword}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProviderPassword(val);
                            setProviderPasswordError(validatePassword(val));
                          }}
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-10 ${
                            providerPasswordError
                              ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                              : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowProviderPassword(!showProviderPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#15559c] transition p-1 cursor-pointer"
                          title={showProviderPassword ? "Hide Password" : "View Password"}
                        >
                          {showProviderPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {providerPasswordError && (
                        <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight">{providerPasswordError}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Rules Badge */}
                  <div className="bg-blue-50/60 p-2.5 rounded-lg text-[10px] text-[#0f3d6b] font-medium space-y-0.5 border border-blue-100">
                    <span className="font-bold text-[#15559c] block">Password Rules (Max 10 chars):</span>
                    <p>• At least 1 Capital (A-Z), 1 Small (a-z), 1 Number (0-9), & 1 Special char (!@#$%^&*)</p>
                  </div>

                  {/* State & Searchable City Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        value={providerState}
                        onChange={handleProviderStateChange}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm bg-slate-50/50 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                      >
                        {indianStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative" ref={providerCityRef}>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search / Type City..."
                          value={providerCitySearch}
                          onChange={(e) => {
                            setProviderCitySearch(e.target.value);
                            setIsProviderCityDropdownOpen(true);
                          }}
                          onFocus={() => setIsProviderCityDropdownOpen(true)}
                          className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                        />
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      {isProviderCityDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-36 overflow-y-auto divide-y divide-slate-50 animate-in fade-in zoom-in-95">
                          {filteredProviderCities.length > 0 ? (
                            filteredProviderCities.map((c) => (
                              <div
                                key={c}
                                onClick={() => {
                                  setProviderCitySearch(c);
                                  setIsProviderCityDropdownOpen(false);
                                }}
                                className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#15559c] cursor-pointer flex items-center justify-between font-medium transition"
                              >
                                <span>{c}</span>
                                <MapPin size={10} className="text-blue-400" />
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-[11px] text-slate-400 font-medium text-center">
                              Use "{providerCitySearch}" as custom city
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Category Dropdown */}
                  <div>
                    <label className="text-[11px] font-bold text-[#0f3d6b] mb-1 block pl-1">Select Provided Service Category *</label>
                    <select
                      value={providerCategory}
                      onChange={(e) => setProviderCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-xl text-xs md:text-sm bg-blue-50/30 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-semibold text-slate-800 shadow-sm"
                    >
                      {providerServiceCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Register as Provider Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#15559c] hover:bg-[#0f3d6b] text-white font-bold text-xs md:text-sm tracking-wide rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Briefcase size={16} />
                      <span>{loading ? 'REGISTERING...' : 'Register as Service Provider'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
