import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  Calendar,
  Stethoscope,
  Scissors,
  Home,
  Truck,
  GraduationCap,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { INDIAN_STATES_DISTRICTS } from '../../data/indiaLocations.js';
import { apiRequest } from '../../services/api.js';
import { fetchProfile, completeProviderProfile, sanitizeUserForStorage, safeSetItem } from '../../store/slices/authSlice.js';

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

export const resolveStateAndDistrict = (user) => {
  const indianStates = Object.keys(INDIAN_STATES_DISTRICTS);
  let state = user?.state || '';
  let city = user?.city || '';
  const locStr = user?.location || user?.address || '';

  // 1. Resolve State
  if (!state && locStr) {
    const parts = locStr.split(',').map((p) => p.trim()).filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const matched = indianStates.find((s) => s.toLowerCase() === p.toLowerCase());
      if (matched) {
        state = matched;
        break;
      }
    }
  }

  // Fallback state if still empty: check if any state name is in locStr
  if (!state && locStr) {
    const matched = indianStates.find((s) => locStr.toLowerCase().includes(s.toLowerCase()));
    if (matched) state = matched;
  }

  // 2. Resolve District in that State
  if (state && INDIAN_STATES_DISTRICTS[state]) {
    const districts = INDIAN_STATES_DISTRICTS[state];
    // If city is already in districts, keep it
    if (city && districts.includes(city)) {
      return { state, city };
    }
    // Check if city matches any district (case-insensitive or partial)
    if (city) {
      const matchedCity = districts.find(
        (d) => d.toLowerCase() === city.toLowerCase() || d.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(d.toLowerCase())
      );
      if (matchedCity) {
        city = matchedCity;
        return { state, city };
      }
    }
    // Search parts of location string
    if (locStr) {
      const parts = locStr.split(',').map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        const matchedDist = districts.find(
          (d) => d.toLowerCase() === p.toLowerCase() || d.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(d.toLowerCase())
        );
        if (matchedDist) {
          city = matchedDist;
          return { state, city };
        }
      }
    }
  }

  return { state, city };
};

export default function ProviderProfileCompletionView({
  user,
  serviceCategory,
  onProfileSaved = () => {},
  isMandatory = false
}) {
  const dispatch = useDispatch();

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
    govtProofDoc: user?.govtProofDoc || null,
    experienceYears: user?.experienceYears || user?.experience || 3,
    bio: user?.bio || '',
    avatar: user?.avatar || user?.profilePicture || '',
    // Service-specific
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
        govtProofDoc: user.govtProofDoc || prev.govtProofDoc,
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
      toast.success('Profile image updated!');
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
        onProfileSaved(updatedUser || result.payload?.user);
      } else {
        throw new Error(result.payload || 'Failed to save profile.');
      }
    } catch (err) {
      console.error('Profile submission error:', err);
      toast.error(err.message || 'Failed to submit profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner if Profile Incomplete */}
      {isMandatory && (
        <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
            ⚠️
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-sm sm:text-base text-amber-950">
              Mandatory Profile Completion Required
            </h3>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Welcome to the <strong>{serviceCategory || 'Service Provider'}</strong> dashboard! Before taking bookings or accessing operational features, you must complete all required profile details below and press <strong>"Save & Submit Profile"</strong> to select your subscription plan.
            </p>
          </div>
        </div>
      )}

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm space-y-6">
        
        {/* Header with Title & Service Category Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-stone-200">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
              {serviceCategory || 'Service Provider'} Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-1">
              Professional Business Profile
            </h2>
            <p className="text-xs text-slate-500">
              Fields marked with an asterisk (<strong className="text-red-500">*</strong>) are mandatory for verification and public listing.
            </p>
          </div>
        </div>

        {/* Avatar & Core Identity */}
        <div className="flex flex-col sm:flex-row items-start gap-6 p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-stone-200 overflow-hidden flex items-center justify-center shadow-xs">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={36} className="text-slate-400" />
              )}
            </div>
            <label className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg cursor-pointer transition">
              <span>Change Photo</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Business / Studio / Clinic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Royal Paws Studio"
                className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] ${
                  errors.businessName ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
                }`}
              />
              {errors.businessName && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.businessName}</span>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Authorized Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Rajesh Sharma"
                className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] ${
                  errors.name ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
                }`}
              />
              {errors.name && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.name}</span>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Business Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Years of Professional Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23]"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & Operating Region */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. 9845012345"
              className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] ${
                errors.mobile ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            />
            {errors.mobile && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.mobile}</span>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp Business Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="e.g. 9845012345"
              className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] ${
                errors.whatsapp ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            />
            {errors.whatsapp && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.whatsapp}</span>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Operating State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] ${
                errors.state ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            >
              <option value="">Select State</option>
              {indianStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.state}</span>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Operating District / City <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
              className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.city ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            >
              <option value="">{formData.state ? 'Select District' : 'Select State first'}</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.city && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.city}</span>}
          </div>
        </div>

        {/* Detailed Address */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Full Street / Facility / Hub Address <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="2"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Plot 42, 100 Feet Road, Indiranagar, Bangalore - 560038"
            className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] resize-none ${
              errors.address ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
            }`}
          />
          {errors.address && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.address}</span>}
        </div>

        {/* Government Proof & Licensing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Govt License / Proof Type <span className="text-red-500">*</span>
            </label>
            <select
              name="govtProofType"
              value={formData.govtProofType}
              onChange={handleChange}
              className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23]"
            >
              {!GOVT_PROOF_OPTIONS.includes(formData.govtProofType) && formData.govtProofType && (
                <option value={formData.govtProofType}>{formData.govtProofType}</option>
              )}
              {GOVT_PROOF_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Certificate / License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="govtProofNumber"
              value={formData.govtProofNumber}
              onChange={handleChange}
              placeholder="e.g. VCI/2012/KA-08492 or AWBI/REG/992"
              className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] ${
                errors.govtProofNumber ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            />
            {errors.govtProofNumber && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.govtProofNumber}</span>}
          </div>
        </div>

        {/* Service-Specific Fields */}
        {isVet && (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                Veterinary Degrees & Qualifications <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="degrees"
                value={formData.degrees}
                onChange={handleChange}
                placeholder="e.g. B.V.Sc & A.H, M.V.Sc (Surgery)"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                VCI Registration ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vciRegistration"
                value={formData.vciRegistration}
                onChange={handleChange}
                placeholder="e.g. VCI/2015/DL-09923"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
              />
              {errors.vciRegistration && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.vciRegistration}</span>}
            </div>
          </div>
        )}

        {isGrooming && (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
              Grooming Certifications & Spa Equipment
            </label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              placeholder="e.g. Certified Master Groomer (NDGAA), Hydrobath & Deshedding Specialization"
              className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
            />
          </div>
        )}

        {isHostel && (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
              Maximum Pet Boarding Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 45"
              className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
            />
          </div>
        )}

        {isBreeding && (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                Kennel / Cattery Registered Name
              </label>
              <input
                type="text"
                name="kennelName"
                value={formData.kennelName}
                onChange={handleChange}
                placeholder="e.g. Elite Royal Kennels"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                Breeding License / Kennel Club Reg No.
              </label>
              <input
                type="text"
                name="breedingLicense"
                value={formData.breedingLicense}
                onChange={handleChange}
                placeholder="e.g. KCI/REG/2021/8892"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
              />
            </div>
          </div>
        )}

        {isTransport && (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                Transit Vehicle Fleet & IATA Crates
              </label>
              <input
                type="text"
                name="vehicleTypes"
                value={formData.vehicleTypes}
                onChange={handleChange}
                placeholder="e.g. AC Van, Flight Cargo Crates"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                24x7 Emergency Helplines
              </label>
              <input
                type="text"
                name="emergencyHelpline"
                value={formData.emergencyHelpline}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-medium"
              />
            </div>
          </div>
        )}

        {/* Bio / Description */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Professional Bio & Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="3"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Describe your facilities, team qualifications, pet care philosophy, and standard operating hours..."
            className={`w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23] resize-none ${
              errors.bio ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
            }`}
          />
          {errors.bio && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.bio}</span>}
        </div>

        {/* Bottom Submission Bar */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={16} className="text-emerald-700" />
            <span>Profile submission unlocks the 3 Subscription Plans (Monthly, Quarterly, Yearly).</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#0F2E23]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin text-emerald-300" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Save & Submit Profile</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}

