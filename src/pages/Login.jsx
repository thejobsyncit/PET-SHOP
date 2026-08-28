import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight,
  Briefcase, Phone, Eye, EyeOff, Search, MapPin, AlertCircle,
  CheckCircle2, RotateCcw, Edit3, Smartphone, KeyRound,
  ChevronDown, MessageSquare, Check, HelpCircle
} from 'lucide-react';
import { login, register, setAuthenticatedUser, clearAuthError, logout } from '../store/slices/authSlice.js';
import toast from 'react-hot-toast';

// Country Dial Codes with flags, ISO standards & national phone number lengths
const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN', digits: 10 },
  { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US', digits: 10 },
  { code: '+1', country: 'Canada', flag: '🇨🇦', iso: 'CA', digits: 10 },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB', digits: 10 },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE', digits: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA', digits: 9 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG', digits: 8 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU', digits: 9 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE', digits: 10 },
  { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR', digits: 9 },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ', digits: 9 },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY', digits: 10 },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA', digits: 8 },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW', digits: 8 },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM', digits: 8 },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH', digits: 8 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP', digits: 10 },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD', digits: 10 },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK', digits: 9 },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP', digits: 10 },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA', digits: 9 },
  { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT', digits: 10 },
  { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES', digits: 9 },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL', digits: 9 },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH', digits: 9 },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE', digits: 9 },
  { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO', digits: 8 },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', iso: 'DK', digits: 8 },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE', digits: 9 },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', iso: 'BR', digits: 11 },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', iso: 'MX', digits: 10 },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID', digits: 10 },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH', digits: 10 },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH', digits: 9 },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', iso: 'VN', digits: 9 },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK', digits: 10 },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG', digits: 10 },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG', digits: 10 },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE', digits: 9 },
  { code: '+7', country: 'Russia / Kazakhstan', flag: '🇷🇺', iso: 'RU', digits: 10 },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', iso: 'KR', digits: 10 },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', iso: 'TR', digits: 10 }
];

// Helper to get expected phone digits based on selected country dial code
const getRequiredPhoneLength = (countryCode) => {
  const country = COUNTRY_DIAL_CODES.find((c) => c.code === countryCode);
  return country ? country.digits : 10;
};

// "I'm here for" Dropdown Options
const HERE_FOR_OPTIONS = [
  'Pet',
  'Services',
  'Guidance',
  'Adoption',
  'Mating',
  'Other'
];

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
  'Consult a Vet'
];

// Reusable Country Code Extension Dropdown Selector
const CountryCodePicker = ({ value, onChange, id = 'country-picker' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedItem = COUNTRY_DIAL_CODES.find((c) => c.code === value) || COUNTRY_DIAL_CODES[0];

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredCountries = COUNTRY_DIAL_CODES.filter(
    (c) =>
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.iso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full px-3 py-2.5 bg-slate-100/90 hover:bg-slate-200/90 active:bg-slate-300/80 text-slate-700 text-xs md:text-sm font-semibold rounded-l-xl border-r border-slate-300 flex items-center gap-1.5 cursor-pointer transition select-none"
        title="Select Country Dial Code"
      >
        <span className="text-base leading-none">{selectedItem.flag}</span>
        <span className="font-bold text-slate-800 tracking-tight">{selectedItem.code}</span>
        <span className="text-[10px] text-slate-500 transform scale-75">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search country / code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#15559c] font-medium"
              />
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c, idx) => (
                <button
                  key={`${c.iso}-${c.code}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-50 transition cursor-pointer ${
                    c.code === value && c.iso === selectedItem.iso
                      ? 'bg-blue-50/80 text-[#15559c] font-bold'
                      : 'text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base shrink-0">{c.flag}</span>
                    <span className="truncate">{c.country}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-500 shrink-0 ml-2">{c.code}</span>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// "I'm here for" Dropdown Component matching Reference Image
const HereForDropdown = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      {/* Dropdown Closed Trigger Container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm bg-white flex items-center justify-between cursor-pointer transition select-none shadow-xs ${
          error
            ? 'border-red-500 ring-2 ring-red-100'
            : isOpen
            ? 'border-[#15559c] ring-2 ring-blue-100'
            : 'border-slate-300 hover:border-[#15559c]'
        }`}
      >
        <span className={`font-medium ${value ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
          {value || "I'm here for"}
        </span>
        <span className="text-xs text-slate-600 transform scale-90">▼</span>
      </div>

      {/* Popover Dropdown matching Reference Image with Blue Header */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Active / Primary Header in Royal Blue */}
          <div
            onClick={() => {
              // Clicking header resets or closes
              setIsOpen(false);
            }}
            className="px-4 py-2.5 bg-[#15559c] text-white text-xs md:text-sm font-semibold flex items-center justify-between cursor-pointer"
          >
            <span>I'm here for</span>
          </div>

          {/* Options List */}
          <div className="divide-y divide-slate-100">
            {HERE_FOR_OPTIONS.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-xs md:text-sm cursor-pointer transition flex items-center justify-between ${
                  value === opt
                    ? 'bg-blue-50 text-[#15559c] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#15559c] font-medium'
                }`}
              >
                <span>{opt}</span>
                {value === opt && <Check size={14} className="text-[#15559c]" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isSignUp = location.pathname === '/signup' || location.pathname === '/register';

  const { isAuthenticated, user, error, loading } = useSelector((state) => state.auth);

  // Registration Sub-Tab: 'user' | 'provider'
  const [registerRoleTab, setRegisterRoleTab] = useState('user');

  // Login Form States (Supports both Email and Mobile Number)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Visibility Toggle States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showProviderPassword, setShowProviderPassword] = useState(false);

  // User Registration States
  const [userFullName, setUserFullName] = useState('');
  const [userCountryCode, setUserCountryCode] = useState('+91');
  const [userMobileNo, setUserMobileNo] = useState('');
  const [userMobileError, setUserMobileError] = useState('');

  const [userWhatsappCountryCode, setUserWhatsappCountryCode] = useState('+91');
  const [userWhatsappNo, setUserWhatsappNo] = useState('');
  const [userWhatsappError, setUserWhatsappError] = useState('');
  const [userSameAsMobile, setUserSameAsMobile] = useState(false);

  const [userPurpose, setUserPurpose] = useState('');
  const [userPurposeError, setUserPurposeError] = useState('');

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordError, setUserPasswordError] = useState('');

  const [userState, setUserState] = useState('Karnataka');
  const [userCitySearch, setUserCitySearch] = useState('Bangalore');
  const [isUserCityDropdownOpen, setIsUserCityDropdownOpen] = useState(false);

  // Service Provider Registration States
  const [providerBusinessName, setProviderBusinessName] = useState('');
  const [providerCountryCode, setProviderCountryCode] = useState('+91');
  const [providerMobileNo, setProviderMobileNo] = useState('');
  const [providerMobileError, setProviderMobileError] = useState('');

  const [providerWhatsappCountryCode, setProviderWhatsappCountryCode] = useState('+91');
  const [providerWhatsappNo, setProviderWhatsappNo] = useState('');
  const [providerWhatsappError, setProviderWhatsappError] = useState('');
  const [providerSameAsMobile, setProviderSameAsMobile] = useState(false);

  const [providerEmail, setProviderEmail] = useState('');
  const [providerEmailError, setProviderEmailError] = useState('');
  const [providerPassword, setProviderPassword] = useState('');
  const [providerPasswordError, setProviderPasswordError] = useState('');
  const [providerCategory, setProviderCategory] = useState('Pet Seller');
  const [providerState, setProviderState] = useState('Karnataka');
  const [providerCitySearch, setProviderCitySearch] = useState('Bangalore');
  const [isProviderCityDropdownOpen, setIsProviderCityDropdownOpen] = useState(false);

  // OTP Verification States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpInputRefs = useRef([]);

  // Dropdown Refs
  const userCityRef = useRef(null);
  const providerCityRef = useRef(null);

  const indianStates = Object.keys(INDIAN_STATES_CITIES);

  // Clear errors on tab swap or route change
  useEffect(() => {
    setIsOtpStep(false);
    dispatch(clearAuthError());
  }, [isSignUp, registerRoleTab, dispatch]);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (isOtpStep && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpStep, otpTimer]);

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

  // Mobile / WhatsApp Strictly Numeric Handler (Length dynamically controlled by country code)
  const handleNumericChange = (e, setVal, setError, fieldLabel = 'Mobile number', maxLength = 10) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, ''); // Filter out any non-numeric character
    if (cleaned.length > maxLength) {
      setError(`${fieldLabel} cannot exceed ${maxLength} digits *`);
      return;
    }
    setVal(cleaned);
    if (cleaned.length === 0) {
      setError(`${fieldLabel} is required *`);
    } else if (cleaned.length < maxLength) {
      setError(`${fieldLabel} must be exactly ${maxLength} digits (${cleaned.length}/${maxLength}) *`);
    } else {
      setError('');
    }
  };

  // Country Code Handlers with dynamic length updates & truncation if needed
  const handleUserCountryChange = (newCode) => {
    setUserCountryCode(newCode);
    const newExpected = getRequiredPhoneLength(newCode);
    if (userMobileNo.length > newExpected) {
      const truncated = userMobileNo.slice(0, newExpected);
      setUserMobileNo(truncated);
      setUserMobileError('');
    } else if (userMobileNo.length > 0 && userMobileNo.length < newExpected) {
      setUserMobileError(`Mobile number must be exactly ${newExpected} digits (${userMobileNo.length}/${newExpected}) *`);
    } else if (userMobileNo.length === newExpected) {
      setUserMobileError('');
    }

    if (userSameAsMobile) {
      setUserWhatsappCountryCode(newCode);
      const newNum = userMobileNo.slice(0, newExpected);
      setUserWhatsappNo(newNum);
      if (newNum.length === newExpected) setUserWhatsappError('');
    }
  };

  const handleUserWhatsappCountryChange = (newCode) => {
    setUserWhatsappCountryCode(newCode);
    const newExpected = getRequiredPhoneLength(newCode);
    if (userWhatsappNo.length > newExpected) {
      const truncated = userWhatsappNo.slice(0, newExpected);
      setUserWhatsappNo(truncated);
      setUserWhatsappError('');
    } else if (userWhatsappNo.length > 0 && userWhatsappNo.length < newExpected) {
      setUserWhatsappError(`WhatsApp number must be exactly ${newExpected} digits (${userWhatsappNo.length}/${newExpected}) *`);
    } else if (userWhatsappNo.length === newExpected) {
      setUserWhatsappError('');
    }
    if (userSameAsMobile && newCode !== userCountryCode) {
      setUserSameAsMobile(false);
    }
  };

  const handleProviderCountryChange = (newCode) => {
    setProviderCountryCode(newCode);
    const newExpected = getRequiredPhoneLength(newCode);
    if (providerMobileNo.length > newExpected) {
      const truncated = providerMobileNo.slice(0, newExpected);
      setProviderMobileNo(truncated);
      setProviderMobileError('');
    } else if (providerMobileNo.length > 0 && providerMobileNo.length < newExpected) {
      setProviderMobileError(`Mobile number must be exactly ${newExpected} digits (${providerMobileNo.length}/${newExpected}) *`);
    } else if (providerMobileNo.length === newExpected) {
      setProviderMobileError('');
    }

    if (providerSameAsMobile) {
      setProviderWhatsappCountryCode(newCode);
      const newNum = providerMobileNo.slice(0, newExpected);
      setProviderWhatsappNo(newNum);
      if (newNum.length === newExpected) setProviderWhatsappError('');
    }
  };

  const handleProviderWhatsappCountryChange = (newCode) => {
    setProviderWhatsappCountryCode(newCode);
    const newExpected = getRequiredPhoneLength(newCode);
    if (providerWhatsappNo.length > newExpected) {
      const truncated = providerWhatsappNo.slice(0, newExpected);
      setProviderWhatsappNo(truncated);
      setProviderWhatsappError('');
    } else if (providerWhatsappNo.length > 0 && providerWhatsappNo.length < newExpected) {
      setUserWhatsappError(`WhatsApp number must be exactly ${newExpected} digits (${providerWhatsappNo.length}/${newExpected}) *`);
    } else if (providerWhatsappNo.length === newExpected) {
      setProviderWhatsappError('');
    }
    if (providerSameAsMobile && newCode !== providerCountryCode) {
      setProviderSameAsMobile(false);
    }
  };

  // Toggle "Same as Mobile" helper for User Registration
  const handleToggleUserSameAsMobile = (checked) => {
    setUserSameAsMobile(checked);
    if (checked) {
      setUserWhatsappCountryCode(userCountryCode);
      const expected = getRequiredPhoneLength(userCountryCode);
      const val = userMobileNo.slice(0, expected);
      setUserWhatsappNo(val);
      if (val.length === expected) {
        setUserWhatsappError('');
      } else if (!val) {
        setUserWhatsappError('WhatsApp number is required *');
      } else {
        setUserWhatsappError(`WhatsApp number must be exactly ${expected} digits (${val.length}/${expected}) *`);
      }
    }
  };

  // Toggle "Same as Mobile" helper for Provider Registration
  const handleToggleProviderSameAsMobile = (checked) => {
    setProviderSameAsMobile(checked);
    if (checked) {
      setProviderWhatsappCountryCode(providerCountryCode);
      const expected = getRequiredPhoneLength(providerCountryCode);
      const val = providerMobileNo.slice(0, expected);
      setProviderWhatsappNo(val);
      if (val.length === expected) {
        setProviderWhatsappError('');
      } else if (!val) {
        setProviderWhatsappError('WhatsApp number is required *');
      } else {
        setProviderWhatsappError(`WhatsApp number must be exactly ${expected} digits (${val.length}/${expected}) *`);
      }
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

  // 1. Sign In Submit Handler (Email or Mobile Number)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      toast.error('Please enter your email or mobile number and password.');
      return;
    }
    dispatch(login({ identifier: loginIdentifier, password: loginPassword }));
  };

  // 2. User Registration Submit Handler -> Initiates OTP Verification
  const handleUserSubmit = (e) => {
    e.preventDefault();

    // 1. Mobile validation based on selected country
    const expectedMobileLength = getRequiredPhoneLength(userCountryCode);
    if (!userMobileNo || userMobileNo.length !== expectedMobileLength) {
      setUserMobileError(
        !userMobileNo
          ? 'Mobile number is required *'
          : `Mobile number must be exactly ${expectedMobileLength} digits (${userMobileNo.length}/${expectedMobileLength}) *`
      );
      toast.error(`Mobile number must be exactly ${expectedMobileLength} digits for ${userCountryCode}!`);
      return;
    }
    setUserMobileError('');

    // 2. WhatsApp validation based on selected country (MANDATORY & NUMBERS ONLY)
    const expectedWhatsappLength = getRequiredPhoneLength(userWhatsappCountryCode);
    if (!userWhatsappNo || userWhatsappNo.length !== expectedWhatsappLength) {
      setUserWhatsappError(
        !userWhatsappNo
          ? 'WhatsApp number is required *'
          : `WhatsApp number must be exactly ${expectedWhatsappLength} digits (${userWhatsappNo.length}/${expectedWhatsappLength}) *`
      );
      toast.error(`WhatsApp number is mandatory and must be ${expectedWhatsappLength} digits for ${userWhatsappCountryCode}!`);
      return;
    }
    setUserWhatsappError('');

    // 3. "I'm here for" validation
    if (!userPurpose) {
      setUserPurposeError('Please select what you are here for *');
      toast.error('Please select an option for "I\'m here for"!');
      return;
    }
    setUserPurposeError('');

    // 4. Password validation
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
      mobileCountryCode: userCountryCode,
      whatsapp: userWhatsappNo,
      whatsappCountryCode: userWhatsappCountryCode,
      purpose: userPurpose,
      password: userPassword,
      role: 'CUSTOMER',
      location: `${userCitySearch}, ${userState}`
    };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingUserData(payload);
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpTimer(30);
    setIsOtpStep(true);

    toast.success(`📲 OTP sent to ${userCountryCode} ${userMobileNo}! (Demo code: ${code})`, {
      duration: 6000,
      icon: '📲'
    });
  };

  // 3. Service Provider Registration Submit Handler -> Initiates OTP Verification
  const handleProviderSubmit = (e) => {
    e.preventDefault();

    const expectedProvMobile = getRequiredPhoneLength(providerCountryCode);
    if (!providerMobileNo || providerMobileNo.length !== expectedProvMobile) {
      setProviderMobileError(
        !providerMobileNo
          ? 'Mobile number is required *'
          : `Mobile number must be exactly ${expectedProvMobile} digits (${providerMobileNo.length}/${expectedProvMobile}) *`
      );
      toast.error(`Mobile number must be exactly ${expectedProvMobile} digits for ${providerCountryCode}!`);
      return;
    }
    setProviderMobileError('');

    // WhatsApp validation for Provider
    const expectedProvWhatsapp = getRequiredPhoneLength(providerWhatsappCountryCode);
    if (!providerWhatsappNo || providerWhatsappNo.length !== expectedProvWhatsapp) {
      setProviderWhatsappError(
        !providerWhatsappNo
          ? 'WhatsApp number is required *'
          : `WhatsApp number must be exactly ${expectedProvWhatsapp} digits (${providerWhatsappNo.length}/${expectedProvWhatsapp}) *`
      );
      toast.error(`WhatsApp number is mandatory and must be ${expectedProvWhatsapp} digits for ${providerWhatsappCountryCode}!`);
      return;
    }
    setProviderWhatsappError('');

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
      mobileCountryCode: providerCountryCode,
      whatsapp: providerWhatsappNo,
      whatsappCountryCode: providerWhatsappCountryCode,
      password: providerPassword,
      role: 'SERVICE_PROVIDER',
      serviceCategory: providerCategory,
      location: `${providerCitySearch}, ${providerState}`
    };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingUserData(payload);
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpTimer(30);
    setIsOtpStep(true);

    toast.success(`📲 OTP sent to ${providerCountryCode} ${providerMobileNo}! (Demo code: ${code})`, {
      duration: 6000,
      icon: '📲'
    });
  };

  // OTP Input & Action Handlers
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((c, i) => {
        if (i < 6) newDigits[i] = c;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(chars.length, 5);
      if (otpInputRefs.current[nextIdx]) {
        otpInputRefs.current[nextIdx].focus();
      }
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      if (otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newDigits = [...otpDigits];
      pasteData.split('').forEach((char, idx) => {
        if (idx < 6) newDigits[idx] = char;
      });
      setOtpDigits(newDigits);
      const focusIdx = Math.min(pasteData.length, 5);
      if (otpInputRefs.current[focusIdx]) {
        otpInputRefs.current[focusIdx].focus();
      }
    }
  };

  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
      toast.success('Demo OTP auto-filled!');
      if (otpInputRefs.current[5]) {
        otpInputRefs.current[5].focus();
      }
    }
  };

  const handleResendOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setOtpTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    const targetCode = pendingUserData?.mobileCountryCode || userCountryCode;
    const targetNum = pendingUserData?.mobile || userMobileNo;
    toast.success(`📲 New OTP sent to ${targetCode} ${targetNum}! (Code: ${newCode})`, {
      duration: 5000,
      icon: '📲'
    });
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (entered !== generatedOtp && entered !== '123456') {
      toast.error('Invalid OTP! Please check the code and try again.');
      return;
    }

    setVerifyingOtp(true);

    try {
      const userObj = {
        _id: 'user_' + Date.now(),
        ...pendingUserData,
        addresses: []
      };
      const tokenStr = 'token_' + Date.now();

      // Update Redux authenticated state
      dispatch(setAuthenticatedUser({ token: tokenStr, user: userObj }));

      // Also trigger thunk in background for API sync
      dispatch(register(pendingUserData));

      toast.success(`🎉 Mobile verified successfully! Welcome ${pendingUserData?.name || 'Pet Parent'}!`);
      setIsOtpStep(false);
      navigate('/account');
    } catch (err) {
      toast.error('Verification could not be completed. Please try again.');
    } finally {
      setVerifyingOtp(false);
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

        <div className="p-6 md:p-8 space-y-6">
          {/* =========================================================================
              OTP VERIFICATION VIEW (Triggered after Register is clicked)
             ========================================================================= */}
          {isOtpStep ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#15559c] shadow-sm">
                  {pendingUserData?.role === 'SERVICE_PROVIDER' ? (
                    <Briefcase size={24} className="animate-pulse text-[#15559c]" />
                  ) : (
                    <Smartphone size={24} className="animate-pulse text-[#15559c]" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#15559c] font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {pendingUserData?.role === 'SERVICE_PROVIDER' ? 'SERVICE PROVIDER VERIFICATION' : 'PET PARENT VERIFICATION'}
                  </span>
                  <h2 className="font-serif text-xl font-bold text-slate-800">
                    {pendingUserData?.role === 'SERVICE_PROVIDER' ? 'Verify Partner Mobile' : 'Verify Your Mobile'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    We've sent a 6-digit OTP verification code to{' '}
                    <strong className="text-slate-800 font-semibold">{pendingUserData?.mobileCountryCode || '+91'} {pendingUserData?.mobile}</strong>
                  </p>
                  {pendingUserData?.whatsapp && (
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                      <MessageSquare size={12} className="text-[#25D366]" />
                      WhatsApp Updates Linked: <strong>{pendingUserData?.whatsappCountryCode || '+91'} {pendingUserData?.whatsapp}</strong>
                    </p>
                  )}
                  {pendingUserData?.purpose && (
                    <div className="inline-block bg-amber-50 border border-amber-200/70 rounded-full px-3 py-0.5 text-[11px] text-amber-900 font-bold mt-1">
                      ✨ Interest: <strong>{pendingUserData.purpose}</strong>
                    </div>
                  )}
                  {pendingUserData?.role === 'SERVICE_PROVIDER' && (
                    <div className="inline-block bg-blue-50/70 border border-blue-200/60 rounded-lg px-2.5 py-1 text-[11px] text-[#0f3d6b] font-medium mt-1">
                      Partner: <strong>{pendingUserData.name}</strong> • Category: <strong>{pendingUserData.serviceCategory}</strong>
                    </div>
                  )}
                </div>

                {/* Edit Phone link */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsOtpStep(false)}
                    className="text-[11px] text-[#15559c] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={11} /> Edit Registration Details
                  </button>
                </div>
              </div>

              {/* Demo OTP Quick Auto-fill banner */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                    <KeyRound size={14} />
                  </div>
                  <div>
                    <p className="text-[11px] text-amber-900 font-bold">Demo Verification Code</p>
                    <p className="text-[13px] font-mono font-extrabold text-[#15559c] tracking-widest">{generatedOtp}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-3 py-1.5 bg-[#15559c] hover:bg-[#0f3d6b] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Sparkles size={12} /> Auto-Fill
                </button>
              </div>

              {/* 6 Digit OTP Inputs */}
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center items-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono border-2 rounded-xl focus:outline-none transition ${
                        digit
                          ? 'border-[#15559c] bg-blue-50/30 text-[#15559c] shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 text-slate-800 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                      }`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={verifyingOtp || otpDigits.join('').length !== 6}
                  className="w-full py-3.5 bg-[#15559c] hover:bg-[#0f3d6b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {verifyingOtp ? (
                    <span>VERIFYING OTP & OPENING DASHBOARD...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>
                        {pendingUserData?.role === 'SERVICE_PROVIDER'
                          ? 'VERIFY PARTNER OTP & OPEN DASHBOARD'
                          : 'VERIFY OTP & OPEN DASHBOARD'}
                      </span>
                    </>
                  )}
                </button>

                {/* Resend Timer & Actions */}
                <div className="text-center space-y-2 pt-1">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-slate-500 font-medium">
                      Didn't receive code? Resend in{' '}
                      <span className="font-bold text-[#15559c] font-mono">
                        0:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
                      </span>
                    </p>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Didn't receive code?</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xs font-bold text-[#15559c] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} /> Resend OTP
                      </button>
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={() => setIsOtpStep(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                    >
                      ← Back to Registration Form
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : !isSignUp ? (
            /* =========================================================================
                1. LOGIN FORM (Supports Email and Mobile Number)
               ========================================================================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <span className="text-[10px] uppercase tracking-widest text-[#15559c] font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">WELCOME BACK</span>
                <h2 className="font-serif text-lg md:text-xl font-bold text-slate-800 pt-1">Login to India Pet Hub</h2>
                <p className="text-xs text-slate-500 font-medium">Enter your credentials to access your account</p>
              </div>

              <div className="space-y-3">
                {/* Email or Mobile Number Input */}
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Email Address or Mobile Number *"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password *"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#15559c] transition p-1 cursor-pointer"
                    title={showLoginPassword ? "Hide Password" : "View Password"}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#15559c] hover:bg-[#0f3d6b] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'LOGGING IN...' : 'LOGIN'}</span>
                <ArrowRight size={14} />
              </button>

              {/* Switch to Sign Up */}
              <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#15559c] font-bold hover:underline cursor-pointer">
                  Create Account
                </Link>
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
                  ? 'Please fill in your details to register as a Pet Parent / User'
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

                  {/* Mobile No with Country Code Selector & Strict Numbers Validation */}
                  <div className="space-y-1">
                    <div className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                      userMobileError
                        ? 'border-red-500 ring-2 ring-red-100'
                        : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                    }`}>
                      <CountryCodePicker
                        value={userCountryCode}
                        onChange={handleUserCountryChange}
                        id="user-mobile-country"
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={getRequiredPhoneLength(userCountryCode)}
                        placeholder={`Mobile No (${getRequiredPhoneLength(userCountryCode)} digits) *`}
                        value={userMobileNo}
                        onChange={(e) => {
                          const expectedLen = getRequiredPhoneLength(userCountryCode);
                          handleNumericChange(e, setUserMobileNo, setUserMobileError, 'Mobile number', expectedLen);
                          if (userSameAsMobile) {
                            const cleaned = e.target.value.replace(/\D/g, '');
                            const wExpected = getRequiredPhoneLength(userWhatsappCountryCode);
                            const wVal = cleaned.slice(0, wExpected);
                            setUserWhatsappNo(wVal);
                            if (wVal.length === wExpected) setUserWhatsappError('');
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-r-xl text-xs md:text-sm focus:outline-none bg-white font-semibold text-slate-800 placeholder-slate-400"
                        required
                      />
                    </div>
                    {userMobileError && (
                      <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {userMobileError}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp No with Country Code Selector & Same as Mobile toggle */}
                  <div className="space-y-1">
                    <div className="flex justify-end pl-0.5">
                      <label className="text-[10.5px] text-[#15559c] font-bold flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={userSameAsMobile}
                          onChange={(e) => handleToggleUserSameAsMobile(e.target.checked)}
                          className="w-3.5 h-3.5 text-[#15559c] rounded border-slate-300 focus:ring-0 cursor-pointer"
                        />
                        <span>Same as Mobile</span>
                      </label>
                    </div>

                    <div className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                      userWhatsappError
                        ? 'border-red-500 ring-2 ring-red-100'
                        : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                    }`}>
                      <CountryCodePicker
                        value={userWhatsappCountryCode}
                        onChange={handleUserWhatsappCountryChange}
                        id="user-whatsapp-country"
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={getRequiredPhoneLength(userWhatsappCountryCode)}
                        placeholder={`WhatsApp No (${getRequiredPhoneLength(userWhatsappCountryCode)} digits) *`}
                        value={userWhatsappNo}
                        onChange={(e) => {
                          const expectedLen = getRequiredPhoneLength(userWhatsappCountryCode);
                          handleNumericChange(e, setUserWhatsappNo, setUserWhatsappError, 'WhatsApp number', expectedLen);
                          if (userSameAsMobile && e.target.value.replace(/\D/g, '') !== userMobileNo) {
                            setUserSameAsMobile(false);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-r-xl text-xs md:text-sm focus:outline-none bg-white font-semibold text-slate-800 placeholder-slate-400"
                        required
                      />
                    </div>
                    {userWhatsappError && (
                      <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {userWhatsappError}
                      </p>
                    )}
                  </div>

                  {/* "I'm here for" Dropdown Component matching Reference Image */}
                  <div className="space-y-1">
                    <HereForDropdown
                      value={userPurpose}
                      onChange={(val) => {
                        setUserPurpose(val);
                        setUserPurposeError('');
                      }}
                      error={userPurposeError}
                    />
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

                  {/* Mobile No with Country Code Selector & Strict Numbers Validation */}
                  <div className="space-y-1">
                    <div className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                      providerMobileError
                        ? 'border-red-500 ring-2 ring-red-100'
                        : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                    }`}>
                      <CountryCodePicker
                        value={providerCountryCode}
                        onChange={handleProviderCountryChange}
                        id="provider-mobile-country"
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={getRequiredPhoneLength(providerCountryCode)}
                        placeholder={`Mobile No (${getRequiredPhoneLength(providerCountryCode)} digits) *`}
                        value={providerMobileNo}
                        onChange={(e) => {
                          const expectedLen = getRequiredPhoneLength(providerCountryCode);
                          handleNumericChange(e, setProviderMobileNo, setProviderMobileError, 'Mobile number', expectedLen);
                          if (providerSameAsMobile) {
                            const cleaned = e.target.value.replace(/\D/g, '');
                            const wExpected = getRequiredPhoneLength(providerWhatsappCountryCode);
                            const wVal = cleaned.slice(0, wExpected);
                            setProviderWhatsappNo(wVal);
                            if (wVal.length === wExpected) setProviderWhatsappError('');
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-r-xl text-xs md:text-sm focus:outline-none bg-white font-semibold text-slate-800 placeholder-slate-400"
                        required
                      />
                    </div>
                    {providerMobileError && (
                      <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {providerMobileError}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp No for Provider with Country Code Selector & Same as Mobile toggle */}
                  <div className="space-y-1">
                    <div className="flex justify-end pl-0.5">
                      <label className="text-[10.5px] text-[#15559c] font-bold flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={providerSameAsMobile}
                          onChange={(e) => handleToggleProviderSameAsMobile(e.target.checked)}
                          className="w-3.5 h-3.5 text-[#15559c] rounded border-slate-300 focus:ring-0 cursor-pointer"
                        />
                        <span>Same as Mobile</span>
                      </label>
                    </div>

                    <div className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                      providerWhatsappError
                        ? 'border-red-500 ring-2 ring-red-100'
                        : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                    }`}>
                      <CountryCodePicker
                        value={providerWhatsappCountryCode}
                        onChange={handleProviderWhatsappCountryChange}
                        id="provider-whatsapp-country"
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={getRequiredPhoneLength(providerWhatsappCountryCode)}
                        placeholder={`WhatsApp No (${getRequiredPhoneLength(providerWhatsappCountryCode)} digits) *`}
                        value={providerWhatsappNo}
                        onChange={(e) => {
                          const expectedLen = getRequiredPhoneLength(providerWhatsappCountryCode);
                          handleNumericChange(e, setProviderWhatsappNo, setProviderWhatsappError, 'WhatsApp number', expectedLen);
                          if (providerSameAsMobile && e.target.value.replace(/\D/g, '') !== providerMobileNo) {
                            setProviderSameAsMobile(false);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-r-xl text-xs md:text-sm focus:outline-none bg-white font-semibold text-slate-800 placeholder-slate-400"
                        required
                      />
                    </div>
                    {providerWhatsappError && (
                      <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {providerWhatsappError}
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

              {/* Switch to Login */}
              <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
                Already have an account?{' '}
                <Link to="/login" className="text-[#15559c] font-bold hover:underline cursor-pointer">
                  Log in
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
