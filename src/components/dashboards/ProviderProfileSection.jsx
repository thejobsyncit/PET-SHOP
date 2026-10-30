import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  Clock,
  Receipt,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Award,
  Save,
  Loader2,
  Check,
  X,
  Upload,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { INDIAN_STATES_DISTRICTS } from '../../data/indiaLocations.js';
import { apiRequest } from '../../services/api.js';
import { fetchProfile, fetchSubscriptionStatus, completeProviderProfile, sanitizeUserForStorage, safeSetItem } from '../../store/slices/authSlice.js';
import { resolveStateAndDistrict } from './ProviderProfileCompletionView.jsx';

const GOVT_PROOF_OPTIONS = [
  'AWBI Pet Shop Registration Certificate',
  'Veterinary Council of India (VCI) Registration',
  'State Animal Welfare Board (SAWB) Breeder License',
  'FSSAI Food & Pet Supply License',
  'Municipal Trade License',
  'Section 8 / Trust NGO Animal Welfare Certificate',
  'MSME / Udyam Registration Certificate',
  'GSTIN Registration Certificate'
];

/**
 * ProviderProfileSection
 * Unifies:
 * 1. Active Subscription Plan Details (Plan tier, status, validity countdown, tax invoice, renew/upgrade).
 * 2. Editable Provider Business Profile (Verified credentials, location, license, bio, avatar).
 */
export default function ProviderProfileSection({
  serviceCategory,
  onOpenSubscriptionModal = () => {},
  onOpenPlanDetails = () => {}
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const subscription = user?.subscription;
  const now = new Date();
  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;
  const startDate = subscription?.startDate ? new Date(subscription.startDate) : null;
  const daysRemaining = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const activePlanName = subscription?.planName || (subscription?.planId ? `${subscription.planId.toUpperCase()} Plan` : 'Active Partner Plan');
  const activePlanBadge = subscription?.planId === 'yearly' ? 'Yearly (Best Value)' : subscription?.planId === 'quarterly' ? 'Quarterly' : 'Monthly';
  const totalInvoicedAmount = subscription?.totalAmount || (subscription?.basePrice ? Math.round(subscription.basePrice * 1.18 * 100) / 100 : 'Paid');

  // Extract initial state/city from location
  const { state: initialState, city: initialCity } = resolveStateAndDistrict(user);

  const [formData, setFormData] = useState({
    businessName: user?.businessName || user?.name || '',
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    whatsapp: user?.whatsapp || user?.whatsappNumber || user?.mobile || '',
    state: initialState,
    city: initialCity,
    address: user?.address || user?.streetAddress || user?.location || '',
    govtProofType: user?.govtProofType || user?.govt_proof_type || GOVT_PROOF_OPTIONS[0],
    govtProofNumber: user?.govtProofNumber || user?.govt_proof_number || '',
    experienceYears: user?.experienceYears || user?.experience || 3,
    bio: user?.bio || '',
    avatar: user?.avatar || user?.profilePicture || '',
    degrees: user?.degrees || '',
    vciRegistration: user?.vciRegistration || '',
    certifications: user?.certifications || '',
    capacity: user?.capacity || user?.shelterCapacity || '',
    breedingLicense: user?.breedingLicense || '',
    kennelName: user?.kennelName || '',
    trainingSpecialization: user?.trainingSpecialization || '',
    vehicleTypes: user?.vehicleTypes || '',
    emergencyHelpline: user?.emergencyHelpline || ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const { state: resolvedSt, city: resolvedCt } = resolveStateAndDistrict(user);
      setFormData((prev) => ({
        ...prev,
        businessName: user.businessName || user.name || prev.businessName,
        name: user.name || prev.name,
        email: user.email || prev.email,
        mobile: user.mobile || prev.mobile,
        whatsapp: user.whatsapp || user.whatsappNumber || user.mobile || prev.whatsapp,
        state: user.state || resolvedSt || prev.state,
        city: user.city || resolvedCt || prev.city,
        address: user.address || user.streetAddress || user.location || prev.address,
        govtProofType: user.govtProofType || user.govt_proof_type || prev.govtProofType,
        govtProofNumber: user.govtProofNumber || user.govt_proof_number || prev.govtProofNumber,
        experienceYears: user.experienceYears || user.experience || prev.experienceYears,
        bio: user.bio || prev.bio,
        avatar: user.avatar || user.profilePicture || prev.avatar,
        degrees: user.degrees || prev.degrees,
        vciRegistration: user.vciRegistration || prev.vciRegistration,
        certifications: user.certifications || prev.certifications,
        capacity: user.capacity || user.shelterCapacity || prev.capacity,
        breedingLicense: user.breedingLicense || prev.breedingLicense,
        kennelName: user.kennelName || prev.kennelName,
        trainingSpecialization: user.trainingSpecialization || prev.trainingSpecialization,
        vehicleTypes: user.vehicleTypes || prev.vehicleTypes,
        emergencyHelpline: user.emergencyHelpline || prev.emergencyHelpline
      }));
    }
  }, [user]);

  const indianStates = Object.keys(INDIAN_STATES_DISTRICTS);
  const availableDistricts = formData.state ? INDIAN_STATES_DISTRICTS[formData.state] || [] : [];

  const catLower = (serviceCategory || user?.serviceCategory || '').toLowerCase();
  const isVet = catLower.includes('vet');
  const isGrooming = catLower.includes('groom');
  const isHostel = catLower.includes('hostel') || catLower.includes('board');
  const isBreeding = catLower.includes('breed') || catLower.includes('mating');
  const isTransport = catLower.includes('transport') || catLower.includes('transit');
  const isTraining = catLower.includes('train');
  const isAdoption = catLower.includes('adopt');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: ''
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatar: event.target?.result }));
      toast.success('Profile avatar updated preview!');
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.businessName.trim()) errs.businessName = 'Business or Studio name is required *';
    if (!formData.name.trim()) errs.name = 'Contact person name is required *';
    if (!formData.mobile.trim() || formData.mobile.replace(/\D/g, '').length < 10) {
      errs.mobile = 'Valid 10-digit mobile number is required *';
    }
    if (!formData.whatsapp.trim() || formData.whatsapp.replace(/\D/g, '').length < 10) {
      errs.whatsapp = 'Valid 10-digit WhatsApp number is required *';
    }
    if (!formData.state) errs.state = 'State is required *';
    if (!formData.city) errs.city = 'District / City is required *';
    if (!formData.address.trim()) errs.address = 'Detailed operating address is required *';
    if (!formData.govtProofType) errs.govtProofType = 'License type is required *';
    if (!formData.govtProofNumber.trim()) errs.govtProofNumber = 'License / Registration number is required *';
    if (!formData.bio.trim() || formData.bio.trim().length < 10) {
      errs.bio = 'Please provide a bio / facility description (min 10 characters) *';
    }
    if (isVet && !formData.vciRegistration.trim() && !formData.degrees.trim()) {
      errs.vciRegistration = 'VCI Registration Number or Veterinary Degrees are required *';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please complete all required fields marked with an asterisk (*).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        location: `${formData.city}, ${formData.state}`,
        serviceCategory: serviceCategory || user?.serviceCategory || 'Service Provider'
      };

      const result = await dispatch(completeProviderProfile(payload));
      if (completeProviderProfile.fulfilled.match(result)) {
        const updatedUser = result.payload.user;
        toast.success(result.payload.message || 'Profile saved successfully!');
        if (updatedUser) {
          safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(updatedUser)));
          setFormData((prev) => ({
            ...prev,
            ...updatedUser
          }));
        }
        dispatch(fetchProfile());
        dispatch(fetchSubscriptionStatus());
      } else {
        throw new Error(result.payload || 'Failed to save profile.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.message || 'Failed to submit profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 
        ========================================================
        1. ACTIVE SUBSCRIPTION PLAN DETAILS & BILLING CARD
        ========================================================
      */}
      <div className="bg-gradient-to-br from-[#0F2E23] via-[#143d2f] to-[#0a2018] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-800/80">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-emerald-800/60 pb-5">
          {/* Plan Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
                {activePlanBadge} Plan Active
              </span>
              <span className="text-[11px] text-emerald-200/80">
                Authorized for <strong>{serviceCategory || user?.serviceCategory || 'Provider'}</strong>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              {activePlanName}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/90 pt-1">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock size={14} className="text-emerald-300" />
                <span>
                  Valid until:{' '}
                  <strong className="text-white">
                    {expiryDate
                      ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Active'}
                  </strong>
                </span>
                {daysRemaining > 0 && (
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md ml-1">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <span>Invoiced:</span>
                <strong className="text-white">₹{totalInvoicedAmount}</strong>
                <span className="text-emerald-300/70 text-[10px]">(incl. 18% GST)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={onOpenPlanDetails}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-white/15"
            >
              <Receipt size={14} className="text-amber-300" />
              <span>Plan Details & Invoice</span>
            </button>

            <button
              type="button"
              onClick={onOpenSubscriptionModal}
              className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Renew / Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Benefits Strip */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-emerald-100/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Active Listings & Bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Direct Client Messaging</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Verified Provider Badge</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>Zero Booking Commission</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================
        2. VERIFIED PROVIDER PROFILE & EDIT FORM
        ========================================================
      */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <h3 className="font-serif font-black text-xl text-slate-900 flex items-center gap-2">
              <Building2 size={22} className="text-[#0F2E23]" />
              <span>Provider Business Profile Settings</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Keep your verified contact, location, and operational credentials up to date.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Verified Service Partner</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="relative group shrink-0">
              <img
                src={formData.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop'}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0F2E23] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#1D3B2E] transition"
                title="Change Photo"
              >
                <Upload size={14} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-base text-slate-900">
                {formData.businessName || 'Your Business Name'}
              </h4>
              <p className="text-xs text-slate-500">
                {formData.name ? `Contact Person: ${formData.name}` : 'Contact person name'} • {serviceCategory || 'Service Partner'}
              </p>
              <p className="text-[11px] text-slate-400">
                Upload your studio logo or personal professional portrait (Max 2MB).
              </p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Business / Studio Name */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Business / Studio / Clinic Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Royal Paws Elite Studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
              {errors.businessName && <span className="text-red-500 text-[10px] mt-1 block">{errors.businessName}</span>}
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Contact Person Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
              {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
            </div>

            {/* Business Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Business Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Years of Professional Experience *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Primary Contact Mobile (10-Digit) *
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
              {errors.mobile && <span className="text-red-500 text-[10px] mt-1 block">{errors.mobile}</span>}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Client WhatsApp Number *
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
              {errors.whatsapp && <span className="text-red-500 text-[10px] mt-1 block">{errors.whatsapp}</span>}
            </div>

            {/* State Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Operating State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] bg-white cursor-pointer"
              >
                <option value="">Select State</option>
                {indianStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {errors.state && <span className="text-red-500 text-[10px] mt-1 block">{errors.state}</span>}
            </div>

            {/* District / City Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Operating District / City *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Select District / City</option>
                {availableDistricts.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <span className="text-red-500 text-[10px] mt-1 block">{errors.city}</span>}
            </div>

            {/* Street Address */}
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1.5">
                Detailed Operating Address (Street / Building / Landmark) *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 42 Indiranagar 100ft Road, Near Metro Station"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
              {errors.address && <span className="text-red-500 text-[10px] mt-1 block">{errors.address}</span>}
            </div>

            {/* Government License / Proof Type */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Government License / Proof Type *
              </label>
              <select
                name="govtProofType"
                value={formData.govtProofType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] bg-white cursor-pointer"
              >
                {!GOVT_PROOF_OPTIONS.includes(formData.govtProofType) && formData.govtProofType && (
                  <option value={formData.govtProofType}>{formData.govtProofType}</option>
                )}
                {GOVT_PROOF_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Government License / Proof Number */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                License / Registration Certificate Number *
              </label>
              <input
                type="text"
                name="govtProofNumber"
                value={formData.govtProofNumber}
                onChange={handleChange}
                placeholder="e.g. AWBI-2024-88492 / VCI-98124"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
              {errors.govtProofNumber && <span className="text-red-500 text-[10px] mt-1 block">{errors.govtProofNumber}</span>}
            </div>

            {/* Service-Specific: Vet VCI & Degrees */}
            {isVet && (
              <>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    VCI Registration Number *
                  </label>
                  <input
                    type="text"
                    name="vciRegistration"
                    value={formData.vciRegistration}
                    onChange={handleChange}
                    placeholder="e.g. VCI/KA/2012/0491"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                  />
                  {errors.vciRegistration && <span className="text-red-500 text-[10px] mt-1 block">{errors.vciRegistration}</span>}
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Degrees / Qualifications *
                  </label>
                  <input
                    type="text"
                    name="degrees"
                    value={formData.degrees}
                    onChange={handleChange}
                    placeholder="e.g. B.V.Sc & A.H, M.V.Sc"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                  />
                </div>
              </>
            )}

            {/* Service-Specific: Breeder Kennel & License */}
            {isBreeding && (
              <>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Registered Kennel Name
                  </label>
                  <input
                    type="text"
                    name="kennelName"
                    value={formData.kennelName}
                    onChange={handleChange}
                    placeholder="e.g. Royal Golden Kennel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    SAWB Breeder License Number
                  </label>
                  <input
                    type="text"
                    name="breedingLicense"
                    value={formData.breedingLicense}
                    onChange={handleChange}
                    placeholder="e.g. SAWB-BRD-2023-019"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                  />
                </div>
              </>
            )}

            {/* Service-Specific: Grooming Certifications */}
            {isGrooming && (
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1.5">
                  Grooming Certifications & Spa Equipment
                </label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="e.g. Certified Master Groomer (NDGAA), Hydrobath & Deshedding Specialization"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                />
              </div>
            )}

            {/* Service-Specific: Hostel Capacity */}
            {isHostel && (
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Maximum Pet Boarding Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                />
              </div>
            )}

            {/* Service-Specific: Transport Fleet & Helplines */}
            {isTransport && (
              <>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Transit Vehicle Fleet & IATA Crates
                  </label>
                  <input
                    type="text"
                    name="vehicleTypes"
                    value={formData.vehicleTypes}
                    onChange={handleChange}
                    placeholder="e.g. AC Van, Flight Cargo Crates"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    24x7 Emergency Helplines
                  </label>
                  <input
                    type="text"
                    name="emergencyHelpline"
                    value={formData.emergencyHelpline}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                  />
                </div>
              </>
            )}

            {/* Service-Specific: Training Specialization */}
            {isTraining && (
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1.5">
                  Training Specializations & Accreditations
                </label>
                <input
                  type="text"
                  name="trainingSpecialization"
                  value={formData.trainingSpecialization}
                  onChange={handleChange}
                  placeholder="e.g. Obedience, Protection, Behavioral Rehabilitation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                />
              </div>
            )}

            {/* Service-Specific: Adoption Shelter Capacity */}
            {isAdoption && (
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Shelter Rescue Capacity (Animals)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 85"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                />
              </div>
            )}

            {/* Bio / Facility Description */}
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1.5">
                Business Bio & Description (Min 10 characters) *
              </label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your facility, specializations, care standards, and equipment..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
              />
              {errors.bio && <span className="text-red-500 text-[10px] mt-1 block">{errors.bio}</span>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0F2E23] hover:bg-[#1D3B2E] text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin text-amber-300" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save & Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

