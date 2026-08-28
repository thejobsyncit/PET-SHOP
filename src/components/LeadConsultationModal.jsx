import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Phone, Sparkles, User, Briefcase, Eye, EyeOff, Search, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { register } from '../store/slices/authSlice.js';

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

const LeadConsultationModal = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'provider'

    // Password Visibility Toggle State
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [showProviderPassword, setShowProviderPassword] = useState(false);

    // User Registration State
    const [userFullName, setUserFullName] = useState('');
    const [userMobileNo, setUserMobileNo] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userState, setUserState] = useState('Karnataka');
    const [userCitySearch, setUserCitySearch] = useState('Bangalore');
    const [isUserCityDropdownOpen, setIsUserCityDropdownOpen] = useState(false);

    // Validation Error States for User
    const [userMobileError, setUserMobileError] = useState('');
    const [userPasswordError, setUserPasswordError] = useState('');

    // Service Provider Registration State
    const [providerBusinessName, setProviderBusinessName] = useState('');
    const [providerMobileNo, setProviderMobileNo] = useState('');
    const [providerEmail, setProviderEmail] = useState('');
    const [providerPassword, setProviderPassword] = useState('');
    const [providerCategory, setProviderCategory] = useState('Pet Seller');
    const [providerState, setProviderState] = useState('Karnataka');
    const [providerCitySearch, setProviderCitySearch] = useState('Bangalore');
    const [isProviderCityDropdownOpen, setIsProviderCityDropdownOpen] = useState(false);

    // Validation Error States for Provider
    const [providerMobileError, setProviderMobileError] = useState('');
    const [providerEmailError, setProviderEmailError] = useState('');
    const [providerPasswordError, setProviderPasswordError] = useState('');

    // Refs for closing dropdowns when clicking outside
    const userCityRef = useRef(null);
    const providerCityRef = useRef(null);

    const indianStates = Object.keys(INDIAN_STATES_CITIES);

    // Refined Service Categories
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

    // PASSWORD COMPLEXITY VALIDATOR
    // Rules: Required, <= 10 chars, >=1 Capital, >=1 Small, >=1 Number, >=1 Special Char
    const validatePassword = (pwd) => {
        if (!pwd) return 'Password is required *';
        if (pwd.length > 10) return 'Password total length must not exceed 10 characters *';
        if (!/[A-Z]/.test(pwd)) return 'Must contain at least 1 capital letter (A-Z) *';
        if (!/[a-z]/.test(pwd)) return 'Must contain at least 1 small letter (a-z) *';
        if (!/[0-9]/.test(pwd)) return 'Must contain at least 1 number (0-9) *';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Must contain at least 1 special character (!@#$%^&*) *';
        return '';
    };

    // MOBILE NUMBER INPUT HANDLER (EXACTLY 10 DIGITS)
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

    useEffect(() => {
        // Show popup when site opens if not closed during current session
        const hasBeenClosed = sessionStorage.getItem('pawora_lead_modal_closed');
        if (!hasBeenClosed) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, []);

    // Click outside listener to close city search dropdowns
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

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('pawora_lead_modal_closed', 'true');
    };

    // User State Change Handler
    const handleUserStateChange = (e) => {
        const newState = e.target.value;
        setUserState(newState);
        const availableCities = INDIAN_STATES_CITIES[newState] || [];
        setUserCitySearch(availableCities[0] || '');
    };

    // Provider State Change Handler
    const handleProviderStateChange = (e) => {
        const newState = e.target.value;
        setProviderState(newState);
        const availableCities = INDIAN_STATES_CITIES[newState] || [];
        setProviderCitySearch(availableCities[0] || '');
    };

    // Submit Handler for User Registration
    const handleUserSubmit = async (e) => {
        e.preventDefault();

        // 1. Mobile Validation (Strictly 10 Digits)
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

        // 2. Password Complexity Validation
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
            } else {
                toast.success(`Thank you ${userFullName || 'Pet Parent'}! Registration details submitted.`);
            }
            handleClose();
        } catch (err) {
            toast.success(`Registration received for ${userMobileNo}!`);
            handleClose();
        }
    };

    // Submit Handler for Provider Registration
    const handleProviderSubmit = async (e) => {
        e.preventDefault();

        // 1. Mobile Validation (Strictly 10 Digits)
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

        // 2. Email Validation (Mandatory for Service Provider)
        if (!providerEmail || !providerEmail.includes('@')) {
            setProviderEmailError('Business Email is mandatory for Service Providers *');
            toast.error('Business Email is required for Service Providers!');
            return;
        }
        setProviderEmailError('');

        // 3. Password Complexity Validation
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
            } else {
                toast.success(`Thank you ${providerBusinessName || 'Provider'}! Service Provider profile submitted.`);
            }
            handleClose();
        } catch (err) {
            toast.success(`Service Provider registration received for ${providerMobileNo}!`);
            handleClose();
        }
    };

    // Available cities based on selected state
    const availableUserCities = INDIAN_STATES_CITIES[userState] || [];
    const filteredUserCities = availableUserCities.filter(c =>
        c.toLowerCase().includes(userCitySearch.toLowerCase())
    );

    const availableProviderCities = INDIAN_STATES_CITIES[providerState] || [];
    const filteredProviderCities = availableProviderCities.filter(c =>
        c.toLowerCase().includes(providerCitySearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300">

            {/* Semi-transparent Backdrop Overlay */}
            <div
                onClick={handleClose}
                className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            ></div>

            {/* Main Popup Modal Window */}
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-purple-100 z-10 animate-in zoom-in-95 duration-200">

                {/* Close Button X */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition cursor-pointer z-20"
                    title="Close Popup"
                >
                    <X size={18} />
                </button>

                {/* Header Branding */}
                <div className="pt-6 pb-3 px-6 text-center bg-gradient-to-b from-blue-50/80 to-white relative">

                    <div className="flex items-center justify-center gap-2 text-[#15559c] font-serif font-extrabold text-xl md:text-2xl tracking-wide">
                        <span className="text-xl">🐾</span>
                        <span>INDIA PET HUB</span>
                    </div>

                    <p className="text-xs text-gray-500 font-medium mt-1 max-w-sm mx-auto">
                        {activeTab === 'user'
                            ? 'Please fill in the details to register as a Pet Parent / User'
                            : 'Join as a verified Service Provider / Business Partner'
                        }
                    </p>

                    {/* DUAL TAB SWITCHER HEADER */}
                    <div className="mt-4 flex bg-gray-100 p-1 rounded-xl max-w-md mx-auto border border-gray-200">

                        {/* Tab 1: Register as User */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('user')}
                            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'user'
                                    ? 'bg-white text-[#15559c] shadow-md font-extrabold'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <User size={14} />
                            <span>Register as User</span>
                        </button>

                        {/* Tab 2: Register as Service Provider */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('provider')}
                            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'provider'
                                    ? 'bg-[#15559c] text-white shadow-md font-extrabold'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <Briefcase size={14} />
                            <span>Service Provider</span>
                        </button>

                    </div>
                </div>

                {/* TAB 1: USER REGISTRATION FORM */}
                {activeTab === 'user' && (
                    <form onSubmit={handleUserSubmit} className="px-6 md:px-8 pb-7 space-y-3.5 pt-2">

                        {/* Full Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={userFullName}
                                onChange={(e) => setUserFullName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Mobile No (EXACTLY 10 DIGITS STRICT VALIDATION) */}
                        <div className="space-y-1">
                            <div className="relative">
                                <input
                                    type="tel"
                                    maxLength={10}
                                    placeholder="Mobile No *"
                                    value={userMobileNo}
                                    onChange={(e) => handleMobileChange(e, setUserMobileNo, setUserMobileError)}
                                    className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-24 font-semibold ${userMobileError
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
                                <p className="text-[10px] text-gray-400 pl-1 font-semibold flex items-center gap-1">
                                    <Sparkles size={10} className="text-[#15559c]" />
                                    Must be exactly 10 digits for instant account access
                                </p>
                            )}
                        </div>

                        {/* Email & Password Grid (MANDATORY & STRICT COMPLEXITY PASSWORD) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-gray-50/50 hover:bg-white"
                                />
                            </div>

                            {/* Password Field with View Password Toggle & Mandatory Validation */}
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
                                        className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-10 ${userPasswordError
                                                ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                                                : 'border-gray-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowUserPassword(!showUserPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#15559c] transition p-1 cursor-pointer"
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

                        {/* Password Requirement Hints Badge */}
                        <div className="bg-blue-50/60 p-2.5 rounded-lg text-[10px] text-[#0f3d6b] font-medium space-y-0.5 border border-blue-100">
                            <span className="font-bold text-[#15559c] block">Password Rules (Max 10 chars):</span>
                            <p>• At least 1 Capital (A-Z), 1 Small (a-z), 1 Number (0-9), & 1 Special char (!@#$%^&*)</p>
                        </div>

                        {/* State & SEARCHABLE City Grid */}
                        <div className="grid grid-cols-2 gap-3">

                            {/* State Dropdown */}
                            <div>
                                <select
                                    value={userState}
                                    onChange={handleUserStateChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm bg-gray-50/50 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-medium text-gray-700"
                                >
                                    {indianStates.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Searchable City Input Dropdown */}
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
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-gray-50/50 hover:bg-white font-medium"
                                    />
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Popover List for Searchable Cities */}
                                {isUserCityDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-36 overflow-y-auto divide-y divide-gray-50 animate-in fade-in zoom-in-95">
                                        {filteredUserCities.length > 0 ? (
                                            filteredUserCities.map((c) => (
                                                <div
                                                    key={c}
                                                    onClick={() => {
                                                        setUserCitySearch(c);
                                                        setIsUserCityDropdownOpen(false);
                                                    }}
                                                    className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#15559c] cursor-pointer flex items-center justify-between font-medium transition"
                                                >
                                                    <span>{c}</span>
                                                    <MapPin size={10} className="text-blue-400" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-[11px] text-gray-400 font-medium text-center">
                                                Use "{userCitySearch}" as custom city
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Submit Button: "Register as User" */}
                        <div className="pt-2 flex justify-center">
                            <button
                                type="submit"
                                className="w-56 py-3 bg-[#15559c] hover:bg-[#0f3d6b] text-white font-bold text-xs md:text-sm tracking-wide rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <User size={16} />
                                Register as User
                            </button>
                        </div>

                    </form>
                )}

                {/* TAB 2: SERVICE PROVIDER REGISTRATION FORM */}
                {activeTab === 'provider' && (
                    <form onSubmit={handleProviderSubmit} className="px-6 md:px-8 pb-7 space-y-3 pt-2">

                        {/* Business / Full Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Business Name / Full Name *"
                                value={providerBusinessName}
                                onChange={(e) => setProviderBusinessName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-gray-50/50 hover:bg-white font-medium"
                                required
                            />
                        </div>

                        {/* Mobile No (EXACTLY 10 DIGITS STRICT VALIDATION) */}
                        <div className="space-y-1">
                            <div className="relative">
                                <input
                                    type="tel"
                                    maxLength={10}
                                    placeholder="Mobile No *"
                                    value={providerMobileNo}
                                    onChange={(e) => handleMobileChange(e, setProviderMobileNo, setProviderMobileError)}
                                    className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-24 font-semibold ${providerMobileError
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
                                <p className="text-[10px] text-gray-400 pl-1 font-semibold flex items-center gap-1">
                                    <Sparkles size={10} className="text-[#15559c]" />
                                    Must be exactly 10 digits for verified client bookings & leads
                                </p>
                            )}
                        </div>

                        {/* Email (MANDATORY FOR PROVIDER) & Password (STRICT COMPLEXITY) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            {/* Business Email (MANDATORY) */}
                            <div className="space-y-1">
                                <input
                                    type="email"
                                    placeholder="Business Email *"
                                    value={providerEmail}
                                    onChange={(e) => {
                                        setProviderEmail(e.target.value);
                                        if (providerEmailError) setProviderEmailError('');
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition ${providerEmailError
                                            ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                                            : 'border-gray-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 bg-gray-50/50 hover:bg-white'
                                        }`}
                                    required
                                />
                                {providerEmailError && (
                                    <p className="text-[10px] font-bold text-red-500 pl-1">{providerEmailError}</p>
                                )}
                            </div>

                            {/* Password Field with View Password Toggle & Mandatory Validation */}
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
                                        className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-10 ${providerPasswordError
                                                ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                                                : 'border-gray-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowProviderPassword(!showProviderPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#15559c] transition p-1 cursor-pointer"
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

                        {/* Password Requirement Hints Badge */}
                        <div className="bg-blue-50/60 p-2.5 rounded-lg text-[10px] text-[#0f3d6b] font-medium space-y-0.5 border border-blue-100">
                            <span className="font-bold text-[#15559c] block">Password Rules (Max 10 chars):</span>
                            <p>• At least 1 Capital (A-Z), 1 Small (a-z), 1 Number (0-9), & 1 Special char (!@#$%^&*)</p>
                        </div>

                        {/* State & SEARCHABLE City Grid */}
                        <div className="grid grid-cols-2 gap-3">

                            {/* State Dropdown */}
                            <div>
                                <select
                                    value={providerState}
                                    onChange={handleProviderStateChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm bg-gray-50/50 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-medium text-gray-700"
                                >
                                    {indianStates.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Searchable City Input Dropdown */}
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
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-gray-50/50 hover:bg-white font-medium"
                                    />
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Popover List for Searchable Cities */}
                                {isProviderCityDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-36 overflow-y-auto divide-y divide-gray-50 animate-in fade-in zoom-in-95">
                                        {filteredProviderCities.length > 0 ? (
                                            filteredProviderCities.map((c) => (
                                                <div
                                                    key={c}
                                                    onClick={() => {
                                                        setProviderCitySearch(c);
                                                        setIsProviderCityDropdownOpen(false);
                                                    }}
                                                    className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#15559c] cursor-pointer flex items-center justify-between font-medium transition"
                                                >
                                                    <span>{c}</span>
                                                    <MapPin size={10} className="text-blue-400" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-[11px] text-gray-400 font-medium text-center">
                                                Use "{providerCitySearch}" as custom city
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* SERVICE CATEGORY DROPDOWN */}
                        <div>
                            <label className="text-[11px] font-bold text-[#0f3d6b] mb-1 block pl-1">Select Provided Service Category *</label>
                            <select
                                value={providerCategory}
                                onChange={(e) => setProviderCategory(e.target.value)}
                                className="w-full px-4 py-2.5 border border-blue-300 rounded-xl text-xs md:text-sm bg-blue-50/30 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-semibold text-gray-800 shadow-sm"
                            >
                                {providerServiceCategories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Submit Button: "Register as Service Provider" */}
                        <div className="pt-1.5 flex justify-center">
                            <button
                                type="submit"
                                className="w-64 py-3 bg-[#15559c] hover:bg-[#0f3d6b] text-white font-bold text-xs md:text-sm tracking-wide rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Briefcase size={16} />
                                Register as Service Provider
                            </button>
                        </div>

                    </form>
                )}

            </div>

        </div>
    );
};

export default LeadConsultationModal;
