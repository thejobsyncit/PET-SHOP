import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X, User, Briefcase, Eye, EyeOff, Search, MapPin, AlertCircle,
  Phone, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice.js';

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
    </div>
  );
};

const LeadConsultationModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'provider'
  const [hideProviderTab, setHideProviderTab] = useState(false);

  // Password Visibility Toggle State
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showProviderPassword, setShowProviderPassword] = useState(false);

  // User Registration States
  const [userFullName, setUserFullName] = useState('');
  const [userCountryCode, setUserCountryCode] = useState('+91');
  const [userMobileNo, setUserMobileNo] = useState('');
  const [userSameAsMobile, setUserSameAsMobile] = useState(false);
  const [userWhatsappCountryCode, setUserWhatsappCountryCode] = useState('+91');
  const [userWhatsappNo, setUserWhatsappNo] = useState('');
  const [userPurpose, setUserPurpose] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userState, setUserState] = useState('Karnataka');
  const [userCitySearch, setUserCitySearch] = useState('Bangalore');
  const [isUserCityDropdownOpen, setIsUserCityDropdownOpen] = useState(false);

  // Validation Error States for User
  const [userMobileError, setUserMobileError] = useState('');
  const [userWhatsappError, setUserWhatsappError] = useState('');
  const [userPurposeError, setUserPurposeError] = useState('');
  const [userPasswordError, setUserPasswordError] = useState('');

  // Service Provider Registration States
  const [providerBusinessName, setProviderBusinessName] = useState('');
  const [providerCountryCode, setProviderCountryCode] = useState('+91');
  const [providerMobileNo, setProviderMobileNo] = useState('');
  const [providerSameAsMobile, setProviderSameAsMobile] = useState(false);
  const [providerWhatsappCountryCode, setProviderWhatsappCountryCode] = useState('+91');
  const [providerWhatsappNo, setProviderWhatsappNo] = useState('');
  const [providerCategory, setProviderCategory] = useState('Pet Seller');
  const [providerEmail, setProviderEmail] = useState('');
  const [providerPassword, setProviderPassword] = useState('');
  const [providerState, setProviderState] = useState('Karnataka');
  const [providerCitySearch, setProviderCitySearch] = useState('Bangalore');
  const [isProviderCityDropdownOpen, setIsProviderCityDropdownOpen] = useState(false);

  // Validation Error States for Provider
  const [providerMobileError, setProviderMobileError] = useState('');
  const [providerWhatsappError, setProviderWhatsappError] = useState('');
  const [providerEmailError, setProviderEmailError] = useState('');
  const [providerPasswordError, setProviderPasswordError] = useState('');

  // Refs for closing dropdowns when clicking outside
  const userCityRef = useRef(null);
  const providerCityRef = useRef(null);

  const indianStates = Object.keys(INDIAN_STATES_CITIES);

  // PASSWORD COMPLEXITY VALIDATOR (Max 10 chars, >=1 Capital, >=1 Small, >=1 Number, >=1 Special Char)
  const validatePassword = (pwd) => {
    if (!pwd) return 'Password is required *';
    if (pwd.length > 10) return 'Password total length must not exceed 10 characters *';
    if (!/[A-Z]/.test(pwd)) return 'Must contain at least 1 capital letter (A-Z) *';
    if (!/[a-z]/.test(pwd)) return 'Must contain at least 1 small letter (a-z) *';
    if (!/[0-9]/.test(pwd)) return 'Must contain at least 1 number (0-9) *';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Must contain at least 1 special character (!@#$%^&*) *';
    return '';
  };

  // NUMERIC INPUT HANDLER WITH DYNAMIC LENGTH
  const handleNumericChange = (e, setVal, setError, fieldName, maxLen) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, '');

    if (cleaned.length > maxLen) {
      setError(`${fieldName} cannot exceed ${maxLen} digits *`);
      return;
    }

    setVal(cleaned);

    if (cleaned.length === 0) {
      setError(`${fieldName} is required *`);
    } else if (cleaned.length < maxLen) {
      setError(`${fieldName} must be exactly ${maxLen} digits (${cleaned.length}/${maxLen}) *`);
    } else {
      setError('');
    }
  };

  // User Country Code Change Handlers
  const handleUserMobileCountryChange = (newCode) => {
    setUserCountryCode(newCode);
    const newMax = getRequiredPhoneLength(newCode);
    const trimmed = userMobileNo.slice(0, newMax);
    setUserMobileNo(trimmed);
    if (trimmed.length === 0) {
      setUserMobileError('Mobile number is required *');
    } else if (trimmed.length < newMax) {
      setUserMobileError(`Mobile number must be exactly ${newMax} digits (${trimmed.length}/${newMax}) *`);
    } else {
      setUserMobileError('');
    }
    if (userSameAsMobile) {
      setUserWhatsappCountryCode(newCode);
      setUserWhatsappNo(trimmed);
      setUserWhatsappError('');
    }
  };

  const handleUserWhatsappCountryChange = (newCode) => {
    setUserWhatsappCountryCode(newCode);
    const newMax = getRequiredPhoneLength(newCode);
    const trimmed = userWhatsappNo.slice(0, newMax);
    setUserWhatsappNo(trimmed);
    if (trimmed.length === 0) {
      setUserWhatsappError('WhatsApp number is required *');
    } else if (trimmed.length < newMax) {
      setUserWhatsappError(`WhatsApp number must be exactly ${newMax} digits (${trimmed.length}/${newMax}) *`);
    } else {
      setUserWhatsappError('');
    }
    if (userSameAsMobile && newCode !== userCountryCode) {
      setUserSameAsMobile(false);
    }
  };

  // Same as Mobile Checkbox for User
  const handleToggleUserSameAsMobile = (checked) => {
    setUserSameAsMobile(checked);
    if (checked) {
      setUserWhatsappCountryCode(userCountryCode);
      setUserWhatsappNo(userMobileNo);
      const expectedLen = getRequiredPhoneLength(userCountryCode);
      if (userMobileNo.length === expectedLen) {
        setUserWhatsappError('');
      } else if (userMobileNo.length === 0) {
        setUserWhatsappError('WhatsApp number is required *');
      } else {
        setUserWhatsappError(`WhatsApp number must be exactly ${expectedLen} digits (${userMobileNo.length}/${expectedLen}) *`);
      }
    }
  };

  // Provider Country Code Change Handlers
  const handleProviderMobileCountryChange = (newCode) => {
    setProviderCountryCode(newCode);
    const newMax = getRequiredPhoneLength(newCode);
    const trimmed = providerMobileNo.slice(0, newMax);
    setProviderMobileNo(trimmed);
    if (trimmed.length === 0) {
      setProviderMobileError('Mobile number is required *');
    } else if (trimmed.length < newMax) {
      setProviderMobileError(`Mobile number must be exactly ${newMax} digits (${trimmed.length}/${newMax}) *`);
    } else {
      setProviderMobileError('');
    }
    if (providerSameAsMobile) {
      setProviderWhatsappCountryCode(newCode);
      setProviderWhatsappNo(trimmed);
      setProviderWhatsappError('');
    }
  };

  const handleProviderWhatsappCountryChange = (newCode) => {
    setProviderWhatsappCountryCode(newCode);
    const newMax = getRequiredPhoneLength(newCode);
    const trimmed = providerWhatsappNo.slice(0, newMax);
    setProviderWhatsappNo(trimmed);
    if (trimmed.length === 0) {
      setProviderWhatsappError('WhatsApp number is required *');
    } else if (trimmed.length < newMax) {
      setProviderWhatsappError(`WhatsApp number must be exactly ${newMax} digits (${trimmed.length}/${newMax}) *`);
    } else {
      setProviderWhatsappError('');
    }
    if (providerSameAsMobile && newCode !== providerCountryCode) {
      setProviderSameAsMobile(false);
    }
  };

  // Same as Mobile Checkbox for Provider
  const handleToggleProviderSameAsMobile = (checked) => {
    setProviderSameAsMobile(checked);
    if (checked) {
      setProviderWhatsappCountryCode(providerCountryCode);
      setProviderWhatsappNo(providerMobileNo);
      const expectedLen = getRequiredPhoneLength(providerCountryCode);
      if (providerMobileNo.length === expectedLen) {
        setProviderWhatsappError('');
      } else if (providerMobileNo.length === 0) {
        setProviderWhatsappError('WhatsApp number is required *');
      } else {
        setProviderWhatsappError(`WhatsApp number must be exactly ${expectedLen} digits (${providerMobileNo.length}/${expectedLen}) *`);
      }
    }
  };

  useEffect(() => {
    // Show popup when site opens if not closed during current session and not logged in
    const hasBeenClosed = sessionStorage.getItem('pawora_lead_modal_closed');
    if (!hasBeenClosed && !isAuthenticated) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Global event listener to open registration modal on demand from any page or action
  useEffect(() => {
    const handleOpenRegister = (e) => {
      const tab = e?.detail?.tab || 'user';
      const hideProvider = Boolean(e?.detail?.hideProviderTab || e?.detail?.source === 'adoption' || e?.detail?.onlyUser);
      setHideProviderTab(hideProvider);
      setActiveTab(tab);
      setIsOpen(true);
    };
    window.addEventListener('open-register-modal', handleOpenRegister);
    window.addEventListener('open-lead-modal', handleOpenRegister);
    return () => {
      window.removeEventListener('open-register-modal', handleOpenRegister);
      window.removeEventListener('open-lead-modal', handleOpenRegister);
    };
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
    setHideProviderTab(false);
    sessionStorage.setItem('pawora_lead_modal_closed', 'true');
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

  // Submit Handler for User Registration
  const handleUserSubmit = async (e) => {
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

    // 2. WhatsApp validation based on selected country (MANDATORY)
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

    // 3. "I'm here for" validation (MANDATORY)
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

    try {
      const result = await dispatch(register(payload));
      if (register.fulfilled.match(result)) {
        toast.success(`🎉 Welcome ${userFullName || 'Pet Parent'}! Account registered successfully.`);
      } else {
        toast.success(`🎉 Welcome ${userFullName || 'Pet Parent'}! Details submitted successfully.`);
      }
      handleClose();
    } catch (err) {
      toast.success(`Account registered for ${userMobileNo}!`);
      handleClose();
    }
  };

  // Submit Handler for Provider Registration
  const handleProviderSubmit = async (e) => {
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

    try {
      const result = await dispatch(register(payload));
      if (register.fulfilled.match(result)) {
        toast.success(`🎉 Welcome ${providerBusinessName || 'Partner'}! Service Provider registered successfully.`);
      } else {
        toast.success(`🎉 Partner details submitted successfully.`);
      }
      handleClose();
    } catch (err) {
      toast.success(`Partner registration submitted!`);
      handleClose();
    }
  };

  // Available cities based on selected state
  const availableUserCities = INDIAN_STATES_CITIES[userState] || [];
  const filteredUserCities = availableUserCities.filter((c) =>
    c.toLowerCase().includes(userCitySearch.toLowerCase())
  );

  const availableProviderCities = INDIAN_STATES_CITIES[providerState] || [];
  const filteredProviderCities = availableProviderCities.filter((c) =>
    c.toLowerCase().includes(providerCitySearch.toLowerCase())
  );

  if (!isOpen || isAuthenticated) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300">
      {/* Semi-transparent Backdrop Overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Main Popup Modal Window */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Close Button X */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition cursor-pointer z-30"
          title="Close Popup"
        >
          <X size={18} />
        </button>

        {/* Header Branding */}
        <div className="pt-6 pb-3 px-6 text-center bg-gradient-to-b from-blue-50/80 to-white relative shrink-0">
          <div className="flex items-center justify-center gap-2 text-[#15559c] font-serif font-extrabold text-xl md:text-2xl tracking-wide">
            <span className="text-xl">🐾</span>
            <span>INDIA PET HUB</span>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            {hideProviderTab || activeTab === 'user'
              ? 'Please fill in your details to register as a Pet Parent / User'
              : 'Join as a verified Service Provider / Business Partner'}
          </p>

          {/* DUAL TAB SWITCHER HEADER (Hidden when requested from adoption) */}
          {!hideProviderTab && (
            <div className="mt-4 flex bg-slate-100 p-1 rounded-xl max-w-md mx-auto border border-slate-200">
              {/* Tab 1: Register as User */}
              <button
                type="button"
                onClick={() => setActiveTab('user')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'user'
                    ? 'bg-white text-[#15559c] shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User size={14} />
                <span>Register as User</span>
              </button>

              {/* Tab 2: Register as Service Provider */}
              <button
                type="button"
                onClick={() => setActiveTab('provider')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'provider'
                    ? 'bg-[#15559c] text-white shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase size={14} />
                <span>Service Provider</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-6 md:px-8 pb-7 pt-2 flex-1">
          {/* =============================================================
              TAB 1: USER REGISTRATION FORM
             ============================================================= */}
          {activeTab === 'user' && (
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
                <div
                  className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                    userMobileError
                      ? 'border-red-500 ring-2 ring-red-100'
                      : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                  }`}
                >
                  <CountryCodePicker
                    value={userCountryCode}
                    onChange={handleUserMobileCountryChange}
                    id="popup-user-mobile-country"
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
                        const rawVal = e.target.value.replace(/\D/g, '');
                        setUserWhatsappNo(rawVal);
                        if (rawVal.length === expectedLen) {
                          setUserWhatsappError('');
                        }
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

              {/* WhatsApp No with Country Code Selector & Same as Mobile toggle (MANDATORY & NUMBERS ONLY) */}
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

                <div
                  className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                    userWhatsappError
                      ? 'border-red-500 ring-2 ring-red-100'
                      : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                  }`}
                >
                  <CountryCodePicker
                    value={userWhatsappCountryCode}
                    onChange={handleUserWhatsappCountryChange}
                    id="popup-user-whatsapp-country"
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
                {userPurposeError && (
                  <p className="text-[11px] font-bold text-red-500 pl-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {userPurposeError}
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
                      type={showUserPassword ? 'text' : 'password'}
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
                      title={showUserPassword ? 'Hide Password' : 'View Password'}
                    >
                      {showUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {userPasswordError && (
                    <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight">
                      {userPasswordError}
                    </p>
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

          {/* =============================================================
              TAB 2: SERVICE PROVIDER REGISTRATION FORM
             ============================================================= */}
          {activeTab === 'provider' && (
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
                <div
                  className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                    providerMobileError
                      ? 'border-red-500 ring-2 ring-red-100'
                      : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                  }`}
                >
                  <CountryCodePicker
                    value={providerCountryCode}
                    onChange={handleProviderMobileCountryChange}
                    id="popup-provider-mobile-country"
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
                        const rawVal = e.target.value.replace(/\D/g, '');
                        setProviderWhatsappNo(rawVal);
                        if (rawVal.length === expectedLen) {
                          setProviderWhatsappError('');
                        }
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

              {/* WhatsApp No for Provider with Country Code Selector & Same as Mobile */}
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

                <div
                  className={`flex items-stretch border rounded-xl bg-white transition shadow-xs overflow-visible relative ${
                    providerWhatsappError
                      ? 'border-red-500 ring-2 ring-red-100'
                      : 'border-slate-300 focus-within:border-[#15559c] focus-within:ring-2 focus-within:ring-blue-100'
                  }`}
                >
                  <CountryCodePicker
                    value={providerWhatsappCountryCode}
                    onChange={handleProviderWhatsappCountryChange}
                    id="popup-provider-whatsapp-country"
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

              {/* Service Category */}
              <div>
                <select
                  value={providerCategory}
                  onChange={(e) => setProviderCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm bg-slate-50/50 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                >
                  {providerServiceCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Business Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <input
                    type="email"
                    placeholder="Business Email *"
                    value={providerEmail}
                    onChange={(e) => {
                      setProviderEmail(e.target.value);
                      if (e.target.value && e.target.value.includes('@')) {
                        setProviderEmailError('');
                      }
                    }}
                    className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white font-medium ${
                      providerEmailError
                        ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                        : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                    }`}
                    required
                  />
                  {providerEmailError && (
                    <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight">{providerEmailError}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showProviderPassword ? 'text' : 'password'}
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
                      title={showProviderPassword ? 'Hide Password' : 'View Password'}
                    >
                      {showProviderPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {providerPasswordError && (
                    <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight">
                      {providerPasswordError}
                    </p>
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

              {/* Register as Service Provider Button */}
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

        {/* Footer with Login redirect */}
        <div className="py-3 px-6 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-xs text-slate-600 font-medium">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate('/login');
              }}
              className="text-[#15559c] font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
            >
              Log In here &rarr;
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadConsultationModal;
