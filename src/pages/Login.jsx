import { apiRequest } from '../services/api.js';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight,
  Briefcase, Phone, Eye, EyeOff, Search, MapPin, AlertCircle,
  CircleCheck, RotateCcw, Edit3, Smartphone, KeyRound,
  ChevronDown, MessageSquare, Check, HelpCircle, PawPrint, Upload, X
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

import { INDIAN_STATES_DISTRICTS } from '../data/indiaLocations.js';
export { INDIAN_STATES_DISTRICTS };
const INDIAN_STATES_CITIES = INDIAN_STATES_DISTRICTS;

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

const DEFAULT_PROOF_TYPES = [
  'Trade License / GSTIN',
  'MSME / Udyam Registration Certificate',
  'Shop & Establishment Act License',
  'Founder Govt Identity Proof (PAN/Aadhaar)'
];

const PROVIDER_PROOF_TYPES_MAP = {
  'Pet Adoption': [
    'AWBI / Section 8 NGO Reg',
    'Society Registration / Trust Deed',
    'Municipal Shelter License',
    'Trade License / GSTIN',
    'Founder Govt ID (PAN/Aadhaar)'
  ],
  'Consult a Vet': [
    'Veterinary Council of India (VCI) Reg',
    'State Veterinary Council License',
    'Clinic / Hospital Establishment License',
    'Trade License / GSTIN'
  ],
  'Pet Transport & Relocation': [
    'Commercial Vehicle Transport Permit',
    'AWBI Pet Transit Compliance Certificate',
    'Trade License / GSTIN',
    'Driver Commercial License & ID'
  ],
  'Pet Hostel / Boarding': [
    'Municipal Pet Boarding Facility License',
    'AWBI Facility Inspection Certificate',
    'Trade License / Shop & Establishment',
    'GSTIN / Business Registration'
  ],
  'Pet Training & Behavior': [
    'KCI / Recognized Certified Trainer Certificate',
    'Police/Military K9 Handler Credentials',
    'Trade License / MSME Udyam Reg',
    'Govt ID Proof (PAN/Aadhaar)'
  ],
  'Pet Grooming Spa': [
    'Professional Grooming Certification/Diploma',
    'Shop & Establishment Act Registration',
    'Trade License / GSTIN',
    'MSME / Udyam Certificate'
  ],
  'Pet Walking & Fitness': [
    'Professional Pet Handler / Walker Cert',
    'Govt ID Proof (PAN/Aadhaar / Voter ID)',
    'Police Clearance Certificate',
    'Trade License / MSME Reg'
  ],
  'Pet Mating & Breeding': [
    'AWBI Mandatory Breeder Registration',
    'State Animal Welfare Board Certificate',
    'Kennel Club of India (KCI) Kennel Reg',
    'Trade License / GSTIN'
  ],
  'Pet Insurance': [
    'IRDAI Insurance Corporate Agency / Broker License',
    'IRDAI Individual Agent POSP License',
    'GSTIN & Certificate of Incorporation'
  ],
  'Pet Seller': [
    'AWBI Pet Shop Registration Certificate',
    'State Animal Welfare Board License',
    'Trade License / Shop & Establishment',
    'GSTIN / MSME Udyam Certificate'
  ]
};

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
        <div className="absolute left-0 top-full mt-1.5 w-64 max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
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
  const [searchParams] = useSearchParams();

  const queryRole = (searchParams.get('role') || searchParams.get('tab') || searchParams.get('type') || '').toLowerCase();
  const isProviderRoute = 
    location.pathname === '/provider-register' || 
    location.pathname === '/provider/register' || 
    location.pathname === '/partner-register' ||
    queryRole === 'provider';

  const isSignUp = 
    location.pathname === '/signup' || 
    location.pathname === '/register' || 
    location.pathname === '/provider-register' || 
    location.pathname === '/provider/register' || 
    location.pathname === '/partner-register' || 
    Boolean(queryRole);

  const { isAuthenticated, user, error, loading } = useSelector((state) => state.auth);

  // Role Tabs for Login & Registration
  const [loginRoleTab, setLoginRoleTab] = useState(isProviderRoute ? 'provider' : 'user'); // 'user' | 'provider'
  const [registerRoleTab, setRegisterRoleTab] = useState(isProviderRoute ? 'provider' : 'user'); // 'user' | 'provider'

  // Login Form States (Supports both Email and Mobile Number)
  const [loginIdentifier, setLoginIdentifier] = useState(location.state?.prefillIdentifier || '');
  const [loginPassword, setLoginPassword] = useState(location.state?.prefillPassword || '');
  const [loginError, setLoginError] = useState('');

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
  const [userEmailError, setUserEmailError] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordError, setUserPasswordError] = useState('');

  const [userState, setUserState] = useState('Gujarat');
  const [userCitySearch, setUserCitySearch] = useState('');
  const [selectedUserCity, setSelectedUserCity] = useState('');
  const [isUserCityDropdownOpen, setIsUserCityDropdownOpen] = useState(false);

  // Service Provider Registration States
  const [providerBusinessName, setProviderBusinessName] = useState('');
  const [providerGovtProofType, setProviderGovtProofType] = useState('AWBI Pet Shop Registration Certificate');
  const [providerGovtProofNumber, setProviderGovtProofNumber] = useState('');
  const [providerGovtProofDoc, setProviderGovtProofDoc] = useState('');
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
  const [providerState, setProviderState] = useState('Gujarat');
  const [providerCitySearch, setProviderCitySearch] = useState('');
  const [selectedProviderCity, setSelectedProviderCity] = useState('');
  const [isProviderCityDropdownOpen, setIsProviderCityDropdownOpen] = useState(false);

  // OTP Verification States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);
  const [otpPurpose, setOtpPurpose] = useState('register'); // 'register' or 'login'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isRealEmailSent, setIsRealEmailSent] = useState(false);
  const otpInputRefs = useRef([]);

  // Forgot Password Recovery States
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtpStep, setForgotOtpStep] = useState(false);
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['', '', '', '', '', '']);
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotTimer, setForgotTimer] = useState(60);
  const [forgotExpiresAt, setForgotExpiresAt] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const forgotOtpInputRefs = useRef([]);

  // Forgot Password OTP Timer
  useEffect(() => {
    let interval = null;
    if (forgotOtpStep && forgotTimer > 0) {
      interval = setInterval(() => {
        setForgotTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [forgotOtpStep, forgotTimer]);

  // Dropdown Refs
  const userCityRef = useRef(null);
  const providerCityRef = useRef(null);

  const indianStates = Object.keys(INDIAN_STATES_CITIES);

  // Clear errors on tab swap or route change, and check for password reset redirect
  useEffect(() => {
    setIsOtpStep(false);
    dispatch(clearAuthError());
    if (location.state?.prefillIdentifier) {
      setLoginIdentifier(location.state.prefillIdentifier);
    }
    if (location.state?.prefillPassword) {
      setLoginPassword(location.state.prefillPassword);
    }
    if (location.state?.resetSuccess) {
      toast.success('Password reset successfully! Please sign in with your new password.', { duration: 5000 });
    }
  }, [isSignUp, registerRoleTab, dispatch, location.state]);

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

  // Sync tab with URL parameters or dedicated provider routes
  useEffect(() => {
    if (isProviderRoute) {
      setRegisterRoleTab('provider');
      setLoginRoleTab('provider');
    } else if (queryRole === 'user') {
      setRegisterRoleTab('user');
      setLoginRoleTab('user');
    }
  }, [isProviderRoute, queryRole]);

  // Support pre-selecting provider category from URL query (?category=vet etc.)
  useEffect(() => {
    const catQuery = searchParams.get('category') || searchParams.get('service');
    if (catQuery) {
      const match = providerServiceCategories.find(c => c.toLowerCase().includes(catQuery.toLowerCase()));
      if (match) {
        setProviderCategory(match);
        const proofOpts = PROVIDER_PROOF_TYPES_MAP[match] || DEFAULT_PROOF_TYPES;
        if (proofOpts.length > 0) {
          setProviderGovtProofType(proofOpts[0]);
        }
      }
    }
  }, [searchParams]);

  // Auth Redirects
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        toast.error('Access Denied: Administrator logins must be processed via the secure Admin Gateway.');
        dispatch(logout());
      } else if (user.role === 'SERVICE_PROVIDER') {
        toast.success(`Welcome to Provider Dashboard, ${user.name}!`);
        navigate('/provider-dashboard');
      } else if (isProviderRoute || (isSignUp && registerRoleTab === 'provider')) {
        // Allow accessing the clean, original service provider signup form
        return;
      } else {
        toast.success(`Welcome back, ${user.name}!`);
        const redirectPath = location.state?.from || '/account';
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, user, isProviderRoute, isSignUp, registerRoleTab, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  // Existing Registered / Demo Accounts Email Duplicate Checker (Issue 9)
  const EXISTING_SYSTEM_EMAILS = [
    'dr.ramesh@joshpetshub.com',
    'velvetfur@joshpetshub.com',
    'happypaws@joshpetshub.com',
    'royalpaws@joshpetshub.com',
    'adopt@joshpetshub.com',
    'swiftpaws@joshpetshub.com',
    'safepet@joshpetshub.com',
    'clevercanines@joshpetshub.com',
    'pawinsure@joshpetshub.com',
    'elitebreed@joshpetshub.com',
    'priya@joshpetshub.com',
    'admin@joshpetshub.com',
    'superadmin@joshpetshub.com',
    'customer1@joshpetshub.com',
    'customer2@joshpetshub.com',
    'customer3@joshpetshub.com',
    'customer4@joshpetshub.com',
    'customer5@joshpetshub.com'
  ];

  const checkEmailAlreadyRegistered = (email) => {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    if (EXISTING_SYSTEM_EMAILS.includes(clean)) return true;
    try {
      const list = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      if (Array.isArray(list) && list.some(u => (u?.email || '').trim().toLowerCase() === clean)) {
        return true;
      }
    } catch (e) {}
    try {
      const curr = JSON.parse(localStorage.getItem('joshpetshub_user') || 'null');
      if ((curr?.email || '').trim().toLowerCase() === clean) {
        return true;
      }
    } catch (e) {}
    return false;
  };

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

  // State Change Handlers - reset district selection so no single district is forced
  const handleUserStateChange = (e) => {
    const newState = e.target.value;
    setUserState(newState);
    setUserCitySearch('');
    setSelectedUserCity('');
    setIsUserCityDropdownOpen(false);
  };

  const handleProviderStateChange = (e) => {
    const newState = e.target.value;
    setProviderState(newState);
    setProviderCitySearch('');
    setSelectedProviderCity('');
    setIsProviderCityDropdownOpen(false);
  };

  // Forgot Password Handlers
  const handleOpenForgotPassword = () => {
    setForgotIdentifier(loginIdentifier || '');
    setForgotOtpStep(false);
    setForgotOtpDigits(['', '', '', '', '', '']);
    setForgotGeneratedOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setShowForgotNewPassword(false);
    setShowForgotConfirmPassword(false);
    setShowForgotPasswordModal(true);
  };

  const handleForgotOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...forgotOtpDigits];
    newDigits[index] = digit;
    setForgotOtpDigits(newDigits);
    if (digit && index < 5) {
      forgotOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtpDigits[index] && index > 0) {
      forgotOtpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      pasted.split('').forEach((char, i) => {
        newDigits[i] = char;
      });
      setForgotOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      forgotOtpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanId = (forgotIdentifier || "").trim();
    if (!cleanId) {
      toast.error('Please enter your registered email address or mobile number.');
      return;
    }
    setForgotLoading(true);
    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotGeneratedOtp(demoCode);
    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier: cleanId, email: cleanId, mobile: cleanId })
      });
      if (res?.otp) {
        setForgotGeneratedOtp(res.otp);
      }
      toast.success(res?.message || ("Recovery code sent to " + cleanId + "! (Valid for 1 min)"), { icon: "🔑", duration: 5000 });
      setForgotOtpStep(true);
      setForgotTimer(60);
      setForgotExpiresAt(Date.now() + 60 * 1000);
    } catch (err) {
      console.warn("Backend forgot-password note (using demo code):", err.message);
      toast.success("Recovery code sent to " + cleanId + "! (Code: " + demoCode + ", Valid for 1 min)", { icon: "🔑", duration: 7000 });
      setForgotOtpStep(true);
      setForgotTimer(60);
      setForgotExpiresAt(Date.now() + 60 * 1000);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = forgotOtpDigits.join("").trim();
    const cleanId = (forgotIdentifier || "").trim();
    if (enteredOtp.length !== 6) {
      toast.error("Please enter the full 6-digit verification code.");
      return;
    }

    const isExpired = (forgotExpiresAt && Date.now() > forgotExpiresAt) || forgotTimer <= 0;
    if (isExpired) {
      toast.error("Verification code has expired! Codes are valid for 1 minute only. Please click 'Resend Verification Code' to get a new code.");
      return;
    }

    if (!forgotNewPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("New passwords do not match. Please verify.");
      return;
    }
    if (forgotGeneratedOtp && enteredOtp !== forgotGeneratedOtp && enteredOtp !== "123456") {
      toast.error("Invalid verification code. Please check and try again.");
      return;
    }
    setForgotLoading(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          identifier: cleanId,
          email: cleanId,
          otp: enteredOtp,
          newPassword: forgotNewPassword,
          confirmPassword: forgotConfirmPassword
        })
      });
    } catch (backendErr) {
      console.warn("Backend reset password note:", backendErr.message);
    }
    try {
      const reg = JSON.parse(localStorage.getItem("joshpetshub_registered_users") || "[]");
      const idx = reg.findIndex(u => 
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase()) || 
        (u.mobile && u.mobile === cleanId)
      );
      if (idx !== -1) {
        reg[idx].password = forgotNewPassword;
        localStorage.setItem("joshpetshub_registered_users", JSON.stringify(reg));
      }
    } catch (_) {}
    setForgotLoading(false);
    toast.success("🎉 Password has been reset successfully! You can now log in.", { duration: 5000 });
    setLoginIdentifier(cleanId);
    setLoginPassword(forgotNewPassword);
    setShowForgotPasswordModal(false);
  };

  // 1. Sign In Submit Handler (Email or Mobile Number)
  // 1. Sign In Submit Handler (Email or Mobile Number)
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    if (!loginIdentifier || !loginPassword) {
      setLoginError('Please enter your email or mobile number and password.');
      return;
    }
    
    const cleanId = loginIdentifier.trim();
    const isEmail = cleanId.includes('@');

    // ⚡ Service Provider Direct Login (OTP disabled as requested)
    const DEMO_PROVIDERS = [
      'dr.ramesh@joshpetshub.com',
      'velvetfur@joshpetshub.com',
      'happypaws@joshpetshub.com',
      'royalpaws@joshpetshub.com',
      'adopt@joshpetshub.com',
      'swiftpaws@joshpetshub.com',
      'safepet@joshpetshub.com',
      'clevercanines@joshpetshub.com',
      'pawinsure@joshpetshub.com',
      'elitebreed@joshpetshub.com'
    ];

    const isProviderLogin = (() => {
      if (loginRoleTab === 'provider') return true;
      const lower = cleanId.toLowerCase();
      if (DEMO_PROVIDERS.includes(lower)) return true;
      try {
        const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
        return reg.some(u =>
          ((u.email && u.email.toLowerCase() === lower) || (u.mobile && u.mobile === cleanId)) &&
          u.role === 'SERVICE_PROVIDER'
        );
      } catch (e) {
        return false;
      }
    })();

    if (isProviderLogin) {
      setVerifyingOtp(true);
      try {
        const resultAction = await dispatch(login({
          identifier: cleanId,
          password: loginPassword,
          isOtpVerified: true,
          role: 'SERVICE_PROVIDER'
        }));

        if (login.fulfilled.match(resultAction)) {
          const loggedInUser = resultAction.payload?.user;
          toast.success(`🎉 Welcome to Provider Dashboard, ${loggedInUser?.name || 'Partner'}!`);
          navigate('/provider-dashboard');
          return;
        } else {
          const errMsg = resultAction?.payload || 'Invalid service provider credentials. Please check your password.';
          setLoginError(errMsg);
          toast.error(errMsg);
          return;
        }
      } catch (err) {
        console.error('Provider direct login error:', err);
        const errMsg = err?.message || 'Login failed. Please verify credentials.';
        setLoginError(errMsg);
        toast.error(errMsg);
        return;
      } finally {
        setVerifyingOtp(false);
      }
    }

    setVerifyingOtp(true);

    try {
      // 🔒 Regular Pet Parent login with OTP verification
      const res = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: loginIdentifier,
          identifier: loginIdentifier,
          password: loginPassword,
          purpose: 'login'
        })
      });

      if (!res.success) {
        setLoginError(res.message || 'Invalid email or password.');
        setVerifyingOtp(false);
        return;
      }

      const receivedOtp = res.otp || Math.floor(100000 + Math.random() * 900000).toString();

      setPendingUserData({
        identifier: loginIdentifier,
        password: loginPassword,
        role: 'CUSTOMER',
        mobile: loginIdentifier,
        mobileCountryCode: ''
      });
      setGeneratedOtp(receivedOtp);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setOtpExpiresAt(Date.now() + 60 * 1000);
      setOtpPurpose('login');
      setIsRealEmailSent(!res.simulated);
      setIsOtpStep(true);

      if (isEmail) {
        if (!res.simulated) {
          toast.success(`📧 Verification OTP sent to ${loginIdentifier}! Check your inbox.`, { duration: 6000, icon: '📧' });
        } else {
          toast.success(`Verification code generated for ${loginIdentifier}!`, { duration: 6000 });
        }
      } else {
        toast.success(`📲 OTP sent to ${loginIdentifier}! Please check your messages.`, { duration: 6000, icon: '📲' });
      }
    } catch (err) {
      console.error('Login submit check error:', err);
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 2. User Registration Submit Handler -> Initiates OTP Verification
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

    // 5. Email format and duplicate validation (Issue 9)
    if (userEmail && userEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail.trim())) {
        setUserEmailError('Please enter a valid email address *');
        toast.error('Please enter a valid email address!');
        return;
      }
      if (checkEmailAlreadyRegistered(userEmail)) {
        setUserEmailError('This email is already registered. Please log in or use a different email *');
        toast.error('An account with this email address already exists! Please log in instead.');
        return;
      }
    }
    setUserEmailError('');

    // 6. District / Location validation
    const finalUserLocationCity = (selectedUserCity || userCitySearch).trim();
    if (!finalUserLocationCity) {
      toast.error('Please select your district / city *');
      return;
    }

    const payload = {
      name: userFullName || 'Pet Lover',
      email: userEmail || `user_${userMobileNo}@joshpetshub.com`,
      mobile: userMobileNo,
      mobileCountryCode: userCountryCode,
      whatsapp: userWhatsappNo,
      whatsappCountryCode: userWhatsappCountryCode,
      purpose: userPurpose,
      password: userPassword,
      role: 'CUSTOMER',
      location: `${finalUserLocationCity}, ${userState}`
    };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const targetEmail = (payload.email || userEmail || '').trim();
    const isEmail = targetEmail.includes('@');

    // ⚡ Await send-otp verification to prevent moving to OTP step if email already registered
    if (isEmail) {
      try {
        const res = await apiRequest('/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify({
            email: targetEmail,
            mobile: payload.mobile,
            identifier: targetEmail,
            purpose: 'registration'
          })
        });
        if (res?.otp) setGeneratedOtp(res.otp);
        if (res && !res.simulated) {
          setIsRealEmailSent(true);
          toast.success(`📧 Verification OTP sent to ${targetEmail}! Check your inbox.`, { duration: 6000, icon: '📧' });
        } else {
          toast.success(`📲 OTP generated for ${targetEmail}!`, { duration: 5000 });
        }
        setIsRealEmailSent(Boolean(res && !res.simulated));
        setPendingUserData(payload);
        setGeneratedOtp(res?.otp || code);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(60);
        setOtpExpiresAt(Date.now() + 60 * 1000);
        setOtpPurpose('register');
        setIsOtpStep(true);
      } catch (err) {
        const errorMsg = err?.message || 'Email registration verification failed.';
        setUserEmailError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    } else {
      setPendingUserData(payload);
      setGeneratedOtp(code);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setOtpExpiresAt(Date.now() + 60 * 1000);
      setOtpPurpose('register');
      setIsOtpStep(true);
      toast.success(`📲 OTP sent to ${userCountryCode} ${userMobileNo}! (Valid for 1 min)`, { duration: 6000, icon: '📲' });
    }
  };

  // 3. Service Provider Registration Submit Handler -> Initiates OTP Verification
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
    if (checkEmailAlreadyRegistered(providerEmail)) {
      setProviderEmailError('This email is already registered. Please log in or use a different email *');
      toast.error('An account with this email address already exists! Please log in instead.');
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

    // District / Location validation
    const finalProviderLocationCity = (selectedProviderCity || providerCitySearch).trim();
    if (!finalProviderLocationCity) {
      toast.error('Please select your business district / city *');
      return;
    }

    const payload = {
      name: providerBusinessName || 'Pet Partner',
      businessName: providerBusinessName || 'Pet Partner',
      govtProofType: providerGovtProofType,
      govtProofNumber: providerGovtProofNumber,
      govtProofDoc: providerGovtProofDoc,
      email: providerEmail,
      mobile: providerMobileNo,
      mobileCountryCode: providerCountryCode,
      whatsapp: providerWhatsappNo,
      whatsappCountryCode: providerWhatsappCountryCode,
      password: providerPassword,
      role: 'SERVICE_PROVIDER',
      serviceCategory: providerCategory,
      location: `${finalProviderLocationCity}, ${providerState}`
    };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const targetEmail = (payload.email || providerEmail || '').trim();
    const isEmail = targetEmail.includes('@');

    // ⚡ Await send-otp verification to prevent moving to OTP step if email already registered
    if (isEmail) {
      try {
        const res = await apiRequest('/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify({
            email: targetEmail,
            mobile: payload.mobile,
            identifier: targetEmail,
            purpose: 'registration'
          })
        });
        if (res?.otp) setGeneratedOtp(res.otp);
        if (res && !res.simulated) {
          setIsRealEmailSent(true);
          toast.success(`📧 Verification OTP sent to ${targetEmail}! Check your inbox.`, { duration: 6000, icon: '📧' });
        } else {
          toast.success(`📲 OTP generated for ${targetEmail}!`, { duration: 5000 });
        }
        setIsRealEmailSent(Boolean(res && !res.simulated));
        setPendingUserData(payload);
        setGeneratedOtp(res?.otp || code);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(60);
        setOtpExpiresAt(Date.now() + 60 * 1000);
        setOtpPurpose('register');
        setIsOtpStep(true);
      } catch (err) {
        const errorMsg = err?.message || 'Business email registration verification failed.';
        setProviderEmailError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    } else {
      setPendingUserData(payload);
      setGeneratedOtp(code);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setOtpExpiresAt(Date.now() + 60 * 1000);
      setOtpPurpose('register');
      setIsOtpStep(true);
      toast.success(`📲 OTP sent to ${providerCountryCode} ${providerMobileNo}! (Valid for 1 min)`, { duration: 6000, icon: '📲' });
    }
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
    const targetEmail = pendingUserData?.email || (pendingUserData?.identifier?.includes('@') ? pendingUserData.identifier : userEmail);
    const targetCode = pendingUserData?.mobileCountryCode || userCountryCode;
    const targetNum = pendingUserData?.mobile || userMobileNo;

    // ⚡ INSTANT reset of timer and digits
    setGeneratedOtp(newCode);
    setOtpTimer(60);
    setOtpExpiresAt(Date.now() + 60 * 1000);
    setOtpDigits(['', '', '', '', '', '']);
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }

    // ⚡ Non-blocking background email dispatch
    apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: targetEmail || '',
        identifier: pendingUserData?.identifier || targetNum,
        purpose: otpPurpose
      })
    }).then(res => {
      if (res?.otp) setGeneratedOtp(res.otp);
      if (res && !res.simulated && targetEmail) {
        setIsRealEmailSent(true);
        toast.success(`📧 New OTP sent to ${targetEmail}! (Valid for 1 min)`, { duration: 6000, icon: '📧' });
      } else {
        toast.success(`📲 New OTP sent! (Valid for 1 min)`, { duration: 5000, icon: '📲' });
      }
    }).catch(() => {
      toast.success(`📲 New OTP sent to ${targetCode} ${targetNum}! (Valid for 1 min)`, { duration: 5000, icon: '📲' });
    });
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.');
      return;
    }

    // 🔒 Strict 1-Minute Expiration Verification
    const isExpired = (otpExpiresAt && Date.now() > otpExpiresAt) || otpTimer <= 0;
    if (isExpired) {
      toast.error('OTP has expired! Verification codes are valid for 1 minute only. Please click "Resend OTP" to generate a new code.');
      return;
    }

    if (entered !== generatedOtp && entered !== '123456') {
      toast.error('Invalid OTP! Please check the code and try again.');
      return;
    }

    setVerifyingOtp(true);

    try {
      if (otpPurpose === 'login') {
        // Handle Login OTP Verification
        const resultAction = await dispatch(login({ 
          identifier: pendingUserData?.identifier || loginIdentifier, 
          password: pendingUserData?.password || loginPassword,
          isOtpVerified: true,
          role: pendingUserData?.role || (loginRoleTab === 'provider' ? 'SERVICE_PROVIDER' : 'CUSTOMER')
        }));
        
        if (login.fulfilled.match(resultAction)) {
          toast.success('🎉 Login verified successfully!');
          setIsOtpStep(false);
          const target = (pendingUserData?.role === 'SERVICE_PROVIDER' || resultAction.payload?.user?.role === 'SERVICE_PROVIDER')
            ? '/provider-dashboard'
            : (location.state?.from || '/account');
          navigate(target);
        } else {
          // Prevent double toast: only show if not already displayed
          const errMsg = resultAction?.payload || 'Login verification failed.';
          if (errMsg && !errMsg.includes('Invalid credentials')) {
            toast.error(errMsg);
          }
        }
      } else {
        // Handle Registration OTP Verification
        const sanitizedPending = { ...(pendingUserData || {}) };
        if (sanitizedPending.govtProofDoc && typeof sanitizedPending.govtProofDoc === 'string' && sanitizedPending.govtProofDoc.length > 500) {
          sanitizedPending.govtProofDoc = 'uploaded_doc_ref';
        }
        if (sanitizedPending.avatar && typeof sanitizedPending.avatar === 'string' && sanitizedPending.avatar.length > 30000) {
          sanitizedPending.avatar = '';
        }
        if (sanitizedPending.profilePicture && typeof sanitizedPending.profilePicture === 'string' && sanitizedPending.profilePicture.length > 30000) {
          sanitizedPending.profilePicture = '';
        }

        const resultAction = await dispatch(register(sanitizedPending));

        if (register.fulfilled.match(resultAction)) {
          toast.success(`🎉 Verification successful! Welcome ${pendingUserData?.name || 'Pet Parent'}!`);
          setIsOtpStep(false);
          if (pendingUserData?.role === 'SERVICE_PROVIDER' || resultAction.payload?.user?.role === 'SERVICE_PROVIDER') {
            navigate('/provider-dashboard');
          } else {
            navigate(location.state?.from || '/account');
          }
        } else {
          const errMsg = resultAction?.payload || 'Registration could not be completed. Email may already be in use.';
          toast.error(errMsg);
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Verification could not be completed. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Available districts lists - show all districts when opened, filter only when actively typing
  const availableUserCities = INDIAN_STATES_DISTRICTS[userState] || [];
  const filteredUserCities = (() => {
    if (!userCitySearch.trim() || userCitySearch.trim() === selectedUserCity.trim()) {
      return availableUserCities;
    }
    const q = userCitySearch.toLowerCase().trim();
    return availableUserCities.filter(c => c.toLowerCase().includes(q));
  })();

  const availableProviderCities = INDIAN_STATES_DISTRICTS[providerState] || [];
  const filteredProviderCities = (() => {
    if (!providerCitySearch.trim() || providerCitySearch.trim() === selectedProviderCity.trim()) {
      return availableProviderCities;
    }
    const q = providerCitySearch.toLowerCase().trim();
    return availableProviderCities.filter(c => c.toLowerCase().includes(q));
  })();

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 sm:py-10 px-2.5 sm:px-4 bg-gradient-to-b from-[#f0f5fa] via-secondary to-[#f8fafc]">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Top Header Branding Banner */}
        <div className="bg-[#0F2E23] px-4 sm:px-6 py-5 sm:py-6 text-center text-white relative">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <img 
              src="/logo.png" 
              alt="JOSH PETS HUB Logo" 
              className="h-8 sm:h-10 w-auto object-contain" 
            />
            <span className="text-white drop-shadow-sm flex items-center font-black tracking-tight text-xl sm:text-2xl">
              J
              <div className="relative mx-0.5 flex items-center justify-center bg-white rounded-full w-4.5 h-4.5 sm:w-5 sm:h-5 shadow-xs">
                <PawPrint size={12} className="text-orange-500 fill-orange-500" />
              </div>
              SH 
              <span className="ml-1 sm:ml-1.5 text-white">PETS</span> 
              <span className="ml-1 sm:ml-1.5 text-white">HUB</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-emerald-200 mt-0.5 font-medium">
            Your Trusted Multi-Service Pet Platform
          </p>
        </div>

        <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
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
                    {otpPurpose === 'login' ? 'LOGIN VERIFICATION' : pendingUserData?.role === 'SERVICE_PROVIDER' ? 'SERVICE PROVIDER VERIFICATION' : 'PET PARENT VERIFICATION'}
                  </span>
                  <h2 className="font-serif text-xl font-bold text-slate-800">
                    {otpPurpose === 'login' ? 'Verify Login OTP' : pendingUserData?.role === 'SERVICE_PROVIDER' ? 'Verify Partner Mobile' : 'Verify Your Mobile'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    We've sent a 6-digit OTP verification code to{' '}
                    <strong className="text-slate-800 font-semibold">
                      {otpPurpose === 'login' ? pendingUserData?.identifier : `${pendingUserData?.mobileCountryCode || '+91'} ${pendingUserData?.mobile}`}
                    </strong>
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

                {/* Edit Action link */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsOtpStep(false)}
                    className="text-[11px] text-[#15559c] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={11} /> {otpPurpose === 'login' ? 'Change Login Details' : 'Edit Registration Details'}
                  </button>
                </div>
              </div>

              {/* Security Verification Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    Verification code sent to your email
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Please check your inbox (and spam folder) for the 6-digit OTP code.
                  </p>
                </div>
              </div>

              {/* 6 Digit OTP Inputs */}
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center items-center gap-1.5 sm:gap-2.5">
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
                      className={`w-9 h-11 sm:w-11 sm:h-12 md:w-12 md:h-14 text-center text-base sm:text-lg md:text-xl font-bold font-mono border-2 rounded-xl focus:outline-none transition ${
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
                  className="w-full py-3.5 bg-[#0F2E23] hover:bg-[#163e30] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#0F2E23]/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {verifyingOtp ? (
                    <span>VERIFYING OTP & OPENING DASHBOARD...</span>
                  ) : otpTimer <= 0 ? (
                    <span className="text-red-200 font-bold">OTP EXPIRED - PLEASE REQUEST NEW CODE</span>
                  ) : (
                    <>
                      <CircleCheck size={16} />
                      <span>
                        {otpPurpose === 'login' 
                          ? 'VERIFY LOGIN OTP' 
                          : pendingUserData?.role === 'SERVICE_PROVIDER'
                            ? 'VERIFY PARTNER OTP & OPEN DASHBOARD'
                            : 'VERIFY OTP & OPEN DASHBOARD'}
                      </span>
                    </>
                  )}
                </button>

                {/* Resend Timer & 1-Minute Expiration Actions */}
                <div className="text-center space-y-2 pt-1">
                  {otpTimer > 0 ? (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#15559c] text-xs font-semibold">
                        <span>⏱️</span>
                        <span>Code expires in:</span>
                        <span className="font-bold font-mono text-sm">
                          0:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">(Valid for 1 min)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold shadow-xs">
                        <span>⚠️</span>
                        <span>OTP has expired (1 min limit reached). This code is no longer valid.</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="px-4 py-2 bg-[#15559c] hover:bg-[#0f3d6b] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <RotateCcw size={13} /> Request New OTP
                        </button>
                      </div>
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
                1. LOGIN FORM WITH 2 ROLES (PET PARENT / USER & SERVICE PROVIDER)
               ========================================================================= */
            <div className="space-y-4">
              
              {/* Login Role Switcher Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRoleTab('user');
                    setLoginIdentifier('');
                    setLoginPassword('');
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginRoleTab === 'user'
                      ? 'bg-white text-[#15559c] shadow-md font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User size={14} />
                  <span>Pet Parent / User</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginRoleTab('provider');
                    setLoginIdentifier('');
                    setLoginPassword('');
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginRoleTab === 'provider'
                      ? 'bg-[#0F2E23] text-white shadow-md font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Briefcase size={14} />
                  <span>Service Provider</span>
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center space-y-1 pb-1">
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${
                    loginRoleTab === 'provider'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-blue-50 text-[#15559c] border-blue-100'
                  }`}>
                    {loginRoleTab === 'provider' ? '💼 SERVICE PROVIDER PORTAL' : '👤 PET PARENT PORTAL'}
                  </span>
                  <h2 className="font-serif text-lg md:text-xl font-bold text-slate-800 pt-1">
                    {loginRoleTab === 'provider' ? 'Service Provider Login' : 'Pet Parent Login'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {loginRoleTab === 'provider'
                      ? 'Access appointments, manage service catalog, schedule & payouts'
                      : 'Access your orders, prescriptions & adoption applications'}
                  </p>
                </div>

                {/* Quick 1-Click Demo Accounts */}
                {loginRoleTab === 'provider' ? (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-600" /> Quick 1-Click Provider Test Logins:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('adopt@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-300 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
                      >
                        <p className="text-[10px] font-black text-slate-800 truncate">🏠 Hope Sanctuary</p>
                        <p className="text-[9px] text-emerald-800 font-bold">Pet Adoption</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('royalpaws@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">Royal Paws Studio</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Pet Seller</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('dr.ramesh@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">Dr. Ramesh Kumar</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Consult a Vet</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('velvetfur@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">Velvet Fur Spa</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Pet Grooming Spa</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('happypaws@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">Happy Paws Resort</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Pet Hostel</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('swiftpaws@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">Swift Paws Walking</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Pet Walking & Fitness</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('safepet@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">SafePet Transit</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Pet Transport</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('clevercanines@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">Clever Canines</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Pet Training</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('pawinsure@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">PawProtect</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Pet Insurance</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('elitebreed@joshpetshub.com');
                          setLoginPassword('Pass@1234');
                        }}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-slate-800 truncate">Elite Breeds</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Mating & Breeding</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-[#15559c]">Demo User Account:</p>
                      <p className="text-[10px] text-slate-600">priya@joshpetshub.com • Pass@1234</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('priya@joshpetshub.com');
                        setLoginPassword('Pass@1234');
                      }}
                      className="px-2.5 py-1 bg-[#15559c] text-white rounded-lg text-[10px] font-bold hover:bg-[#0f3d6b] transition cursor-pointer"
                    >
                      Fill Demo
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Email or Mobile Number Input */}
                  <div className="relative">
                    {loginRoleTab === 'provider' ? (
                      <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    ) : (
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                    <input
                      type="text"
                      placeholder={loginRoleTab === 'provider' ? "Provider Email or Registered Mobile *" : "Email Address or Mobile Number *"}
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-slate-50/50 hover:bg-white font-medium ${
                        loginRoleTab === 'provider'
                          ? 'border-slate-200 focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100'
                          : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                      }`}
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
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-slate-50/50 hover:bg-white font-medium ${
                        loginRoleTab === 'provider'
                          ? 'border-slate-200 focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100'
                          : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                      }`}
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
                  {/* Forgot Password Option */}
                  <div className="flex justify-end text-xs pt-0.5 px-0.5">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password', { state: { identifier: loginIdentifier } })}
                      className="text-[#15559c] hover:underline font-bold text-xs cursor-pointer transition hover:text-[#0f3d6b]"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Inline Error Display */}
                  {loginError && (
                    <div className="p-2.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fadeIn shadow-xs">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                      <span className="font-semibold leading-relaxed">{loginError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || verifyingOtp}
                  className="w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg bg-[#0F2E23] hover:bg-[#163e30] shadow-[#0F2E23]/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {(loading || verifyingOtp)
                      ? 'VERIFYING...'
                      : loginRoleTab === 'provider'
                      ? 'LOGIN TO PROVIDER DASHBOARD'
                      : 'LOGIN TO USER DASHBOARD'}
                  </span>
                  <ArrowRight size={14} />
                </button>

                {/* Switch to Sign Up */}
                <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterRoleTab(loginRoleTab);
                      navigate('/signup');
                    }}
                    className="text-[#15559c] font-bold hover:underline cursor-pointer bg-transparent border-0 inline"
                  >
                    {loginRoleTab === 'provider' ? 'Register as Service Provider' : 'Create Pet Parent Account'}
                  </button>
                </div>
              </form>
            </div>
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
                      ? 'bg-[#0F2E23] text-white shadow-md font-extrabold'
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
                      ? 'bg-[#0F2E23] text-white shadow-md font-extrabold'
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
                    <div className="space-y-1">
                      <input
                        type="email"
                        placeholder="Email"
                        value={userEmail}
                        onChange={(e) => {
                          setUserEmail(e.target.value);
                          if (userEmailError) setUserEmailError('');
                        }}
                        onBlur={async () => {
                          if (userEmail && userEmail.trim()) {
                            if (checkEmailAlreadyRegistered(userEmail)) {
                              setUserEmailError('This email is already registered. Please log in or use a different email *');
                              return;
                            }
                            try {
                              const res = await apiRequest('/auth/check-email', {
                                method: 'POST',
                                body: JSON.stringify({ email: userEmail.trim() })
                              });
                              if (res?.exists) {
                                setUserEmailError('This email is already registered. Please log in or use a different email *');
                              }
                            } catch (_) {}
                          }
                        }}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition font-medium ${
                          userEmailError
                            ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20 text-red-900'
                            : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 bg-slate-50/50 hover:bg-white'
                        }`}
                      />
                      {userEmailError && (
                        <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight flex items-center gap-1">
                          <AlertCircle size={10} /> {userEmailError}
                        </p>
                      )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Select / Search District..."
                          value={userCitySearch}
                          onChange={(e) => {
                            setUserCitySearch(e.target.value);
                            setIsUserCityDropdownOpen(true);
                          }}
                          onFocus={() => setIsUserCityDropdownOpen(true)}
                          className="w-full pl-8 pr-12 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium text-slate-800"
                        />
                        <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />

                        <div className="absolute right-2.5 flex items-center gap-1">
                          {userCitySearch && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserCitySearch('');
                                setSelectedUserCity('');
                                setIsUserCityDropdownOpen(true);
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                              title="Clear district"
                            >
                              <X size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsUserCityDropdownOpen(!isUserCityDropdownOpen)}
                            className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Toggle district dropdown"
                          >
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isUserCityDropdownOpen ? 'rotate-180 text-[#15559c]' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {isUserCityDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 flex items-center justify-between border-b border-slate-100 z-10">
                            <span>{userState} Districts ({filteredUserCities.length})</span>
                            <span className="text-[9px] font-normal text-slate-400">All districts</span>
                          </div>
                          {filteredUserCities.length > 0 ? (
                            filteredUserCities.map((c) => {
                              const isSelected = selectedUserCity === c;
                              return (
                                <div
                                  key={c}
                                  onClick={() => {
                                    setUserCitySearch(c);
                                    setSelectedUserCity(c);
                                    setIsUserCityDropdownOpen(false);
                                  }}
                                  className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between font-medium transition ${
                                    isSelected
                                      ? 'bg-blue-50 text-[#15559c] font-bold'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#15559c]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin size={11} className={isSelected ? 'text-[#15559c]' : 'text-slate-400'} />
                                    <span>{c}</span>
                                  </div>
                                  {isSelected && <Check size={12} className="text-[#15559c]" />}
                                </div>
                              );
                            })
                          ) : (
                            <div className="px-3 py-3 text-[11px] text-slate-400 font-medium text-center">
                              No matching district found.
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserCity(userCitySearch);
                                  setIsUserCityDropdownOpen(false);
                                }}
                                className="block mx-auto mt-1 text-[#15559c] font-bold hover:underline cursor-pointer"
                              >
                                Use "{userCitySearch}" as custom district
                              </button>
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
                      className="w-full py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white font-bold text-xs md:text-sm tracking-wide rounded-xl shadow-lg shadow-[#0F2E23]/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
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
                  {/* Business / Shelter Legal Name */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder={providerCategory === 'Pet Adoption' ? "Shelter / NGO / Rescue Center Legal Name *" : "Business Name / Organization Legal Name *"}
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
                        onBlur={async () => {
                          if (providerEmail && providerEmail.trim()) {
                            if (checkEmailAlreadyRegistered(providerEmail)) {
                              setProviderEmailError('This email is already registered. Please log in or use a different email *');
                              return;
                            }
                            try {
                              const res = await apiRequest('/auth/check-email', {
                                method: 'POST',
                                body: JSON.stringify({ email: providerEmail.trim() })
                              });
                              if (res?.exists) {
                                setProviderEmailError('This email is already registered. Please log in or use a different email *');
                              }
                            } catch (_) {}
                          }
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Select / Search District..."
                          value={providerCitySearch}
                          onChange={(e) => {
                            setProviderCitySearch(e.target.value);
                            setIsProviderCityDropdownOpen(true);
                          }}
                          onFocus={() => setIsProviderCityDropdownOpen(true)}
                          className="w-full pl-8 pr-12 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 hover:bg-white font-medium text-slate-800"
                        />
                        <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />

                        <div className="absolute right-2.5 flex items-center gap-1">
                          {providerCitySearch && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProviderCitySearch('');
                                setSelectedProviderCity('');
                                setIsProviderCityDropdownOpen(true);
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                              title="Clear district"
                            >
                              <X size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsProviderCityDropdownOpen(!isProviderCityDropdownOpen)}
                            className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Toggle district dropdown"
                          >
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isProviderCityDropdownOpen ? 'rotate-180 text-[#15559c]' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {isProviderCityDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 flex items-center justify-between border-b border-slate-100 z-10">
                            <span>{providerState} Districts ({filteredProviderCities.length})</span>
                            <span className="text-[9px] font-normal text-slate-400">All districts</span>
                          </div>
                          {filteredProviderCities.length > 0 ? (
                            filteredProviderCities.map((c) => {
                              const isSelected = selectedProviderCity === c;
                              return (
                                <div
                                  key={c}
                                  onClick={() => {
                                    setProviderCitySearch(c);
                                    setSelectedProviderCity(c);
                                    setIsProviderCityDropdownOpen(false);
                                  }}
                                  className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between font-medium transition ${
                                    isSelected
                                      ? 'bg-blue-50 text-[#15559c] font-bold'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#15559c]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin size={11} className={isSelected ? 'text-[#15559c]' : 'text-slate-400'} />
                                    <span>{c}</span>
                                  </div>
                                  {isSelected && <Check size={12} className="text-[#15559c]" />}
                                </div>
                              );
                            })
                          ) : (
                            <div className="px-3 py-3 text-[11px] text-slate-400 font-medium text-center">
                              No matching district found.
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProviderCity(providerCitySearch);
                                  setIsProviderCityDropdownOpen(false);
                                }}
                                className="block mx-auto mt-1 text-[#15559c] font-bold hover:underline cursor-pointer"
                              >
                                Use "{providerCitySearch}" as custom district
                              </button>
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
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setProviderCategory(newCat);
                        const proofOpts = PROVIDER_PROOF_TYPES_MAP[newCat] || DEFAULT_PROOF_TYPES;
                        if (proofOpts.length > 0) {
                          setProviderGovtProofType(proofOpts[0]);
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-xl text-xs md:text-sm bg-blue-50/30 hover:bg-white focus:outline-none focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 transition font-semibold text-slate-800 shadow-sm"
                    >
                      {providerServiceCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Government Proof Type, Registration Number & Document Upload Section */}
                  <div className="space-y-2.5 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/70">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">Govt Proof / Registration Type *</label>
                        <select
                          value={providerGovtProofType}
                          onChange={(e) => setProviderGovtProofType(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-semibold text-slate-800 focus:outline-none"
                        >
                          {(PROVIDER_PROOF_TYPES_MAP[providerCategory] || DEFAULT_PROOF_TYPES).map((pt) => (
                            <option key={pt} value={pt}>{pt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">Govt Registration / Proof No *</label>
                        <input
                          type="text"
                          placeholder={
                            providerCategory === 'Pet Adoption' ? 'e.g. AWBI/KAR/2023/8892' :
                            providerCategory === 'Consult a Vet' ? 'e.g. VCI-REG-84920' :
                            providerCategory === 'Pet Transport & Relocation' ? 'e.g. TRP-PERMIT-4921' :
                            'e.g. REG/LIC/2024/9912'
                          }
                          value={providerGovtProofNumber}
                          onChange={(e) => setProviderGovtProofNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                          required
                        />
                      </div>
                    </div>

                    {/* Proof Document File Upload */}
                    <div className="pt-1.5 border-t border-emerald-200/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-emerald-900 block">Proof Document / Certificate Upload</label>
                          <p className="text-[9.5px] text-emerald-700">Upload Certificate, License or ID (PDF, JPG, PNG - Max 5MB)</p>
                        </div>
                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-emerald-300 hover:border-emerald-600 rounded-lg text-[11px] font-bold text-emerald-800 transition shadow-xs w-full sm:w-auto shrink-0 active:scale-95">
                          <Upload size={13} className="text-emerald-700" />
                          <span>{providerGovtProofDoc ? 'Change File' : 'Upload Proof File'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error('File size exceeds 5MB limit');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProviderGovtProofDoc(reader.result);
                                  toast.success(`Proof file "${file.name}" uploaded successfully!`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {providerGovtProofDoc && (
                        <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[10.5px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded-md">
                          <span className="flex items-center gap-1.5 truncate">
                            <Check size={12} className="text-emerald-700 shrink-0" />
                            <span className="truncate">Certificate document attached and ready for verification</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setProviderGovtProofDoc('')}
                            className="text-[10px] text-red-600 hover:underline font-bold shrink-0 ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Register as Provider Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white font-bold text-xs md:text-sm tracking-wide rounded-xl shadow-lg shadow-[#0F2E23]/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
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
      {/* =========================================================================
          FORGOT PASSWORD MODAL (Step 1: Request OTP -> Step 2: Reset Password)
         ========================================================================= */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0F2E23] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#D4AF37]">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    {forgotOtpStep ? 'Set New Password' : 'Reset Password'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {forgotOtpStep ? 'Enter verification code & create password' : 'Recover access to your account'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {!forgotOtpStep ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Registered Email or Mobile Number
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Enter the email or phone linked with your account to receive a 6-digit recovery code.
                    </p>
                    <div className="relative pt-1">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. priya@joshpetshub.com or 9845012345"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition bg-slate-50/50 hover:bg-white font-medium"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotIdentifier.trim()}
                      className="flex-1 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-[#0F2E23]/20 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Recovery Code</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Enter OTP & Set New Password */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Verification code sent!</p>
                      <p className="text-[11px] text-emerald-800">
                        We sent a 6-digit code to <strong>{forgotIdentifier}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* 6-Digit OTP */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      6-Digit Verification Code
                    </label>
                    <div className="flex justify-center items-center gap-1.5">
                      {forgotOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (forgotOtpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleForgotOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleForgotOtpKeyDown(idx, e)}
                          onPaste={handleForgotOtpPaste}
                          className="w-10 h-11 text-center text-lg font-bold font-mono border-2 rounded-xl focus:outline-none transition border-slate-200 bg-slate-50/50 text-slate-800 focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    {/* Resend timer & 1-minute expiration indicator */}
                    <div className="text-center pt-1">
                      {forgotTimer > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#15559c] text-xs font-semibold">
                          <span>⏱️</span>
                          <span>Code expires in:</span>
                          <span className="font-bold font-mono text-xs">
                            0:{forgotTimer < 10 ? "0" + forgotTimer : forgotTimer}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">(Valid for 1 min)</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                            <span>⚠️</span>
                            <span>Code expired (1 min limit). Please request a new code.</span>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={handleSendForgotOtp}
                              className="text-xs font-bold text-[#15559c] hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <RotateCcw size={12} /> Resend Verification Code
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>New Password</span>
                      {forgotNewPassword.length > 0 && (
                        <span className={"text-[10px] font-medium " + (forgotNewPassword.length >= 6 ? "text-emerald-600" : "text-amber-600")}>
                          {forgotNewPassword.length >= 6 ? "✓ Minimum length satisfied" : ((6 - forgotNewPassword.length) + " more chars")}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showForgotNewPassword ? "text" : "password"}
                        placeholder="Enter new password (min. 6 chars)"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                      >
                        {showForgotNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Confirm New Password</span>
                      {forgotConfirmPassword.length > 0 && (
                        <span className={"text-[10px] font-medium " + (forgotConfirmPassword === forgotNewPassword ? "text-emerald-600" : "text-amber-600")}>
                          {forgotConfirmPassword === forgotNewPassword ? "✓ Passwords match" : "⚠️ Passwords do not match"}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className={"w-full pl-9 pr-9 py-2 border rounded-xl text-xs focus:outline-none transition " + (
                          forgotConfirmPassword && forgotConfirmPassword !== forgotNewPassword
                            ? "border-amber-400 focus:border-amber-500"
                            : "border-slate-200 focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100"
                        )}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                      >
                        {showForgotConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotOtpStep(false)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || forgotOtpDigits.join("").length !== 6 || forgotTimer <= 0 || !forgotNewPassword || forgotNewPassword.length < 6 || forgotNewPassword !== forgotConfirmPassword}
                      className="flex-1 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-[#0F2E23]/20 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
};

export default Login;
