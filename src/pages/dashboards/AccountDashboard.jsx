import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, MapPin, ClipboardList, ShoppingBag, Plus, Trash2, CircleCheck,
  ShieldAlert, Clock, LogOut, Heart, ShieldCheck, MessageSquare, Phone,
  ExternalLink, Check, AlertCircle, ArrowRight, Sparkles, Filter, ChevronRight,
  Truck, Calendar, Eye, EyeOff, Lock, KeyRound, Download, FileText, Printer, X
} from 'lucide-react';
import { 
  fetchProfile, 
  updateProfile, 
  addUserAddress, 
  removeUserAddress, 
  logout 
} from '../../store/slices/authSlice.js';
import { 
  getUserAdoptionApplications, 
  getGuardianListedPets, 
  getGuardianAdoptionApplications, 
  updateAdoptionApplicationStatus 
} from '../../data/adoptionPetsData.js';
import { 
  getUserTransportEnquiries, 
  getStoredTransportEnquiries 
} from '../../data/transportData.js';
import { apiRequest } from '../../services/api.js';
import toast from 'react-hot-toast';
import LogoutConfirmModal from '../../components/ui/LogoutConfirmModal.jsx';
import { getActiveUserMembership } from '../../components/widgets/ServicePackageAccessModal.jsx';
import { downloadBill } from '../../utils/billGenerator.js';

const AccountDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  
  // Navigation Tabs state
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');

  // Form Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password Change Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const validateNewPassword = (pwd, currPwd = currentPassword) => {
    if (!pwd) return '';
    if (currPwd && pwd === currPwd) return 'New password cannot be the same as your current password *';
    if (pwd.length < 6) return 'Password must be at least 6 characters *';
    if (pwd.length > 10) return 'Password total length must not exceed 10 characters *';
    if (!/[A-Z]/.test(pwd)) return 'Must contain at least 1 capital letter (A-Z) *';
    if (!/[a-z]/.test(pwd)) return 'Must contain at least 1 small letter (a-z) *';
    if (!/[0-9]/.test(pwd)) return 'Must contain at least 1 number (0-9) *';
    if (!/[!@#$%^&*(),.?":{}|<>\-_+=[\]\\/~`]/.test(pwd)) return 'Must contain at least 1 special character (!@#$%^&*) *';
    return '';
  };

  // Form Address State
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // History logs states
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Adoption applications & listed pets states
  const [userAdoptionApps, setUserAdoptionApps] = useState([]);
  const [guardianPets, setGuardianPets] = useState([]);
  const [guardianApps, setGuardianApps] = useState([]);

  // Transport relocation enquiries states
  const [userTransportEnquiries, setUserTransportEnquiries] = useState([]);

  // Service Membership state for 199 and 499 package indications
  const [membership, setMembership] = useState(() => {
    return getActiveUserMembership(user);
  });
  const [showBillModal, setShowBillModal] = useState(false);

  const handleDownloadMembershipBill = async (m = membership) => {
    if (!m) {
      toast.error('No active payment bill found');
      return;
    }
    const invNo = m.transactionId || 'TXN_PET_69033320';
    const invDate = m.activatedAt ? new Date(m.activatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const base = m.basePrice || (m.tier === 'VIP' ? 499 : 199);
    const cgst = Number((base * 0.09).toFixed(2));
    const sgst = Number((base * 0.09).toFixed(2));
    const total = Number((base * 1.18).toFixed(2));
    const pkg = m.packageName || (m.tier === 'VIP' ? 'VIP All-Access & Priority Pass' : 'Standard Service Access Pass');
    const payMode = m.paymentMethod || 'UPI';

    const success = await downloadBill({
      invoiceNumber: invNo,
      invoiceTitle: 'TAX INVOICE',
      invoiceDate: invDate,
      statusText: '✓ PAYMENT COMPLETED',
      customer: {
        name: user?.name || 'Valued Member',
        email: user?.email || '',
        phone: user?.mobile ? `${user?.mobileCountryCode || '+91'} ${user?.mobile}` : '',
      },
      payment: {
        method: payMode,
        validity: '1 Year Unlimited Pass',
      },
      items: [
        {
          name: pkg,
          description: 'Annual verified service provider direct connect & priority booking pass',
          sacOrHsn: '998399',
          amount: base,
        }
      ],
      totals: {
        baseAmount: base,
        cgst: cgst,
        sgst: sgst,
        total: total,
      }
    });

    if (success) {
      toast.success('Payment bill downloaded successfully');
    } else {
      toast.error('Could not download payment bill');
    }
  };

  const handleDownloadOrderBill = async (order) => {
    if (!order) return;
    const invNo = order.trackingNumber || `ORD-${order._id?.slice(-8) || Date.now()}`;
    const invDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const total = order.pricing?.total || order.total || 0;
    const baseSubtotal = Number((total / 1.18).toFixed(2));
    const cgst = Number((baseSubtotal * 0.09).toFixed(2));
    const sgst = Number((baseSubtotal * 0.09).toFixed(2));

    const items = (order.orderItems || []).map((it) => ({
      name: it.name,
      quantity: it.quantity || 1,
      sacOrHsn: 'HSN: 2309',
      amount: (it.price || 0) * (it.quantity || 1),
    }));

    const success = await downloadBill({
      invoiceNumber: invNo,
      invoiceTitle: 'TAX INVOICE / ORDER RECEIPT',
      invoiceDate: invDate,
      statusText: order.shippingStatus === 'Delivered' ? '✓ ORDER DELIVERED' : '✓ PAYMENT CONFIRMED',
      customer: {
        name: user?.name || 'Valued Customer',
        email: user?.email || '',
        phone: user?.mobile ? `${user?.mobileCountryCode || '+91'} ${user?.mobile}` : '',
        address: order.shippingAddress ? `${order.shippingAddress.streetAddress || ''}, ${order.shippingAddress.city || ''} ${order.shippingAddress.postalCode || ''}` : '',
      },
      payment: {
        method: order.paymentMethod || 'Prepaid Online',
        validity: `Tracking: ${order.trackingNumber || 'Active'}`,
      },
      items: items.length > 0 ? items : [{ name: 'Pet Products Order', sacOrHsn: 'HSN: 2309', amount: baseSubtotal }],
      totals: {
        baseAmount: baseSubtotal,
        cgst: cgst,
        sgst: sgst,
        total: total,
      }
    });

    if (success) {
      toast.success('Order invoice downloaded successfully');
    }
  };

  const handleDownloadBookingBill = async (booking) => {
    if (!booking) return;
    const invNo = `BKG-${booking._id?.slice(-8) || Date.now()}`;
    const invDate = booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const fee = Number(booking.fee) || 0;
    const base = Number((fee / 1.18).toFixed(2));
    const cgst = Number((base * 0.09).toFixed(2));
    const sgst = Number((base * 0.09).toFixed(2));

    const success = await downloadBill({
      invoiceNumber: invNo,
      invoiceTitle: 'SERVICE BOOKING RECEIPT',
      invoiceDate: invDate,
      statusText: booking.paymentStatus === 'Paid' ? '✓ PAYMENT COMPLETED' : 'BOOKING CONFIRMED',
      customer: {
        name: user?.name || 'Valued Client',
        email: user?.email || '',
        phone: user?.mobile ? `${user?.mobileCountryCode || '+91'} ${user?.mobile}` : '',
      },
      payment: {
        method: booking.paymentStatus === 'Paid' ? 'Online / App' : 'Pay on Service',
        validity: `Service Date: ${invDate} at ${booking.timeSlot || ''}`,
      },
      items: [
        {
          name: `${booking.serviceType || 'Pet Service'} - Provider: ${booking.providerName || 'Josh Verified Partner'}`,
          description: `Location: ${booking.location || 'Doorstep / Clinic'}`,
          sacOrHsn: '998399',
          amount: base,
        }
      ],
      totals: {
        baseAmount: base,
        cgst: cgst,
        sgst: sgst,
        total: fee,
      }
    });

    if (success) {
      toast.success('Service booking receipt downloaded successfully');
    }
  };

  useEffect(() => {
    const updateMem = () => {
      setMembership(getActiveUserMembership(user));
    };
    updateMem();

    const handleMemUpdate = (e) => {
      if (e?.detail) setMembership(e.detail);
      else updateMem();
    };
    window.addEventListener('user-membership-updated', handleMemUpdate);
    window.addEventListener('storage', handleMemUpdate);
    return () => {
      window.removeEventListener('user-membership-updated', handleMemUpdate);
      window.removeEventListener('storage', handleMemUpdate);
    };
  }, [user]);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('profile');
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'SERVICE_PROVIDER') {
      navigate('/provider-dashboard', { replace: true });
    } else {
      dispatch(fetchProfile());
      loadUserHistory();
      loadAdoptionData();
      loadTransportData();
    }
  }, [isAuthenticated, user?.role, dispatch, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || user.profilePicture || '');
      loadAdoptionData();
      loadTransportData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const handleEnquiryUpdated = () => {
      loadTransportData();
    };
    window.addEventListener('transport-enquiry-updated', handleEnquiryUpdated);
    window.addEventListener('transport-enquiry-created', handleEnquiryUpdated);
    return () => {
      window.removeEventListener('transport-enquiry-updated', handleEnquiryUpdated);
      window.removeEventListener('transport-enquiry-created', handleEnquiryUpdated);
    };
  }, [user]);

  const loadTransportData = () => {
    if (user) {
      const enquiries = getUserTransportEnquiries(user);
      setUserTransportEnquiries(enquiries);
    }
  };

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
      const bookingsData = await apiRequest('/bookings/my');
      if (bookingsData.success) {
        setBookings(bookingsData.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAdoptionData = () => {
    if (user) {
      const myApps = getUserAdoptionApplications(user);
      setUserAdoptionApps(myApps);

      const myPets = getGuardianListedPets(user);
      setGuardianPets(myPets);

      const receivedApps = getGuardianAdoptionApplications(user);
      setGuardianApps(receivedApps);
    }
  };

  const handleUpdateApplicantStatus = (appId, newStatus) => {
    updateAdoptionApplicationStatus(appId, newStatus);
    loadAdoptionData();
    toast.success(`Application status updated to "${newStatus}"!`, {
      icon: '🐾'
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setCurrentPasswordError('');

    const isPasswordChangeAttempted = Boolean(currentPassword || newPassword || confirmPassword);

    if (isPasswordChangeAttempted) {
      if (!currentPassword) {
        setCurrentPasswordError('Please enter your current password *');
        toast.error('Please enter your current password.', { icon: '🔒' });
        return;
      }

      // Check current password against database / stored account records
      const getDatabasePassword = () => {
        if (user?.password) return user.password;
        try {
          const saved = JSON.parse(localStorage.getItem('joshpetshub_user') || 'null');
          if (saved?.password) return saved.password;
          const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
          const found = reg.find(u => (user?._id && u._id === user._id) || (user?.email && u.email && u.email.toLowerCase() === user.email.toLowerCase()) || (user?.mobile && u.mobile && u.mobile === user.mobile));
          if (found?.password) return found.password;
        } catch (e) {}

        const DEMO_PWDS = {
          'admin@joshpetshub.com': 'Admin@123',
          'superadmin@joshpetshub.com': 'SuperAdmin@123'
        };
        if (user?.email && DEMO_PWDS[user.email.toLowerCase()]) {
          return DEMO_PWDS[user.email.toLowerCase()];
        }
        return 'Pass@1234';
      };

      const dbPassword = getDatabasePassword();
      if (dbPassword && !dbPassword.startsWith('$2') && currentPassword !== dbPassword) {
        setCurrentPasswordError('Current password does not match what is in the database *');
        toast.error('Current password does not match what is in the database. Please try again.', { icon: '❌' });
        return;
      }

      if (!newPassword) {
        setNewPasswordError('Please enter your new password *');
        toast.error('Please enter your new password.', { icon: '🔑' });
        return;
      }
      if (newPassword === currentPassword) {
        setNewPasswordError('New password cannot be the same as your current password *');
        toast.error('New password cannot be the same as your current password.', { icon: '⚠️' });
        return;
      }
      if (newPassword.length < 6) {
        setNewPasswordError('New password must be at least 6 characters *');
        toast.error('New password must be at least 6 characters long.', { icon: '⚠️' });
        return;
      }
      if (newPassword.length > 10) {
        setNewPasswordError('New password total length must not exceed 10 characters *');
        toast.error('New password total length must not exceed 10 characters.', { icon: '⚠️' });
        return;
      }
      if (!/[A-Z]/.test(newPassword)) {
        setNewPasswordError('Must contain at least 1 capital letter (A-Z) *');
        toast.error('New password must contain at least 1 capital letter (A-Z).', { icon: '⚠️' });
        return;
      }
      if (!/[a-z]/.test(newPassword)) {
        setNewPasswordError('Must contain at least 1 small letter (a-z) *');
        toast.error('New password must contain at least 1 small letter (a-z).', { icon: '⚠️' });
        return;
      }
      if (!/[0-9]/.test(newPassword)) {
        setNewPasswordError('Must contain at least 1 number (0-9) *');
        toast.error('New password must contain at least 1 number (0-9).', { icon: '⚠️' });
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>\-_+=[\]\\/~`]/.test(newPassword)) {
        setNewPasswordError('Must contain at least 1 special character (!@#$%^&*) *');
        toast.error('New password must contain at least 1 special character (!@#$%^&*).', { icon: '⚠️' });
        return;
      }
      if (!confirmPassword) {
        toast.error('Please re-enter your new password to confirm.', { icon: '🔑' });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match. Please verify.', { icon: '❌' });
        return;
      }
    }

    setIsUpdatingProfile(true);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      avatar
    };

    if (isPasswordChangeAttempted) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
      payload.confirmPassword = confirmPassword;
    }

    const result = await dispatch(updateProfile(payload));
    setIsUpdatingProfile(false);

    if (updateProfile.fulfilled.match(result)) {
      if (isPasswordChangeAttempted) {
        toast.success('Profile and password updated successfully!');
      } else {
        toast.success('Profile details updated successfully!');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError('');
      setNewPasswordError('');
      setPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      const errMsg = result.payload || 'Profile update failed.';
      if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('current password')) {
        setCurrentPasswordError('Current password does not match what is in the database *');
      }
      toast.error(errMsg, { icon: '❌' });
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrName.trim() || !addrPhone.trim() || !addrStreet.trim() || !addrCity.trim() || !addrState.trim() || !addrZip.trim()) {
      toast.error('Please enter all address parameters.');
      return;
    }

    const payload = {
      name: addrName.trim(),
      phone: addrPhone.trim(),
      streetAddress: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      postalCode: addrZip.trim(),
      isDefault: !user?.addresses || user.addresses.length === 0
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
      toast.error(result.payload || 'Could not save address.');
    }
  };

  const handleRemoveAddress = (addressId) => {
    dispatch(removeUserAddress(addressId));
    toast.success('Address removed.');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully.');
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CircleCheck size={12} className="text-emerald-700" /> Approved & Ready
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#f8efcd] text-[#0F2E23] border border-[#e6c968]">
            <Phone size={12} className="text-[#0F2E23]" /> Guardian Contacted
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-700" /> Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert size={12} className="text-rose-700" /> Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            <Clock size={12} className="text-blue-700" /> Application Submitted
          </span>
        );
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading user profile...</p>
      </div>
    );
  }

  const isVipMember = Boolean(
    membership && (
      membership.tier === 'VIP' ||
      membership.tier?.toLowerCase()?.includes('vip') ||
      membership.packageTier?.toLowerCase()?.includes('vip') ||
      membership.packageName?.toLowerCase()?.includes('vip') ||
      membership.basePrice === 499 ||
      membership.amount === 589
    )
  );

  const isStandardMember = Boolean(
    membership && !isVipMember && (membership.status === 'ACTIVE' || membership.tier || membership.packageName)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      
      {/* Overview Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-beige pb-6 mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium flex flex-wrap items-center gap-2.5">
            <span>Welcome Back, {user.name}</span>
            {isVipMember && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] bg-[#0F2E23] text-[#D4AF37] border border-[#D4AF37]/60 shadow-sm ring-1 ring-[#D4AF37]/25">
                VIP PASSHOLDER
              </span>
            )}
            {isStandardMember && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] bg-[#0F2E23] text-emerald-300 border border-emerald-400/50 shadow-sm ring-1 ring-emerald-400/25">
                STANDARD PASSHOLDER
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Logged in as <strong className="text-gray-600">{user.email}</strong>
            {user.mobile && <span> • Mobile: <strong className="text-gray-600">{user.mobileCountryCode || '+91'} {user.mobile}</strong></span>}
            {user.whatsapp && <span> • WhatsApp: <strong className="text-emerald-700">{user.whatsappCountryCode || '+91'} {user.whatsapp}</strong></span>}
            {user.purpose && <span> • Purpose: <strong className="text-primary font-bold">✨ {user.purpose}</strong></span>}
            {user.location && <span> • Location: <strong className="text-gray-600">{user.location}</strong></span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar (Left 3 Columns) */}
        <aside className="lg:col-span-3 bg-white border border-beige p-6 space-y-2 shadow-sm rounded-xl">
          {[
            { id: 'profile', label: 'Profile Details', icon: <User size={16} /> },
            { id: 'bookings', label: 'Service Bookings', icon: <Calendar size={16} /> },
            { id: 'orders', label: 'Order History', icon: <ShoppingBag size={16} /> },
            { 
              id: 'transport-enquiries', 
              label: `Pet Relocation (${userTransportEnquiries.length})`, 
              icon: <Truck size={16} /> 
            },
            { 
              id: 'my-applications', 
              label: `My Adoption Enquiries (${userAdoptionApps.length})`, 
              icon: <Heart size={16} /> 
            },
            { 
              id: 'adoption-listings', 
              label: `My Listed Pets (${guardianPets.length})`, 
              icon: <ShieldCheck size={16} /> 
            },
            { id: 'prescriptions', label: 'Prescriptions', icon: <ClipboardList size={16} /> },
            { id: 'addresses', label: 'Address Book', icon: <MapPin size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold tracking-wider uppercase transition rounded-xl text-left cursor-pointer group ${
                activeTab === tab.id 
                  ? 'bg-[#0F2E23] text-[#d4af37] shadow-md border border-[#163f30]' 
                  : 'text-gray-500 hover:bg-[#f8efcd]/40 hover:text-[#0F2E23] border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-[#163f30] text-[#d4af37]' : 'bg-gray-100 text-gray-400 group-hover:bg-[#d4af37]/20 group-hover:text-[#0F2E23]'}`}>
                {tab.icon}
              </div>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}

          {/* Sidebar Logout Button */}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider uppercase transition rounded-xl text-left cursor-pointer group bg-rose-50/70 hover:bg-rose-100 text-rose-600 border border-rose-200/80 active:scale-95"
            >
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 group-hover:bg-rose-200 transition-colors">
                <LogOut size={16} />
              </div>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Display Panel (Right 9 Columns) */}
        <div className="lg:col-span-9 bg-white border border-beige p-6 md:p-8 shadow-sm rounded-xl">
          
          {/* =========================================================================
              TAB: SERVICE BOOKINGS
             ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Service Bookings
              </h2>
              
              {historyLoading ? (
                <p className="text-xs text-gray-400">Loading bookings...</p>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border border-beige p-5 text-xs space-y-4 rounded-xl">
                      <div className="flex flex-wrap justify-between items-center bg-secondary p-3 border-b border-beige gap-2 rounded-lg">
                        <div>
                          <p className="text-gray-400 font-medium">BOOKING ID</p>
                          <p className="font-bold text-primary">{booking._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">SERVICE</p>
                          <p className="font-semibold text-primary">{booking.serviceType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">DATE & TIME</p>
                          <p className="font-semibold text-primary">{new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">STATUS</p>
                          <span className={`font-bold uppercase ${
                            booking.status === 'Completed' ? 'text-green-600' :
                            booking.status === 'Cancelled' ? 'text-red-500' : 'text-accent'
                          }`}>{booking.status}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center border border-[#e6c968]">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-primary truncate max-w-xs">{booking.providerName}</p>
                            <p className="text-[10px] text-gray-400">Location: {booking.location}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="font-bold text-primary block">₹{booking.fee}</span>
                          <span className={`text-[10px] uppercase font-bold block ${booking.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-500'}`}>
                            {booking.paymentStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadBookingBill(booking)}
                            className="px-2.5 py-1 bg-[#0F2E23] hover:bg-[#163f30] text-[#D4AF37] hover:text-white rounded-lg text-[10px] font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Download size={10} />
                            <span>Download Bill</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 lg:p-10 border border-dashed border-[#d4af37]/40 rounded-2xl text-center space-y-3 bg-[#fdfaf2] shadow-sm">
                  <div className="w-14 h-14 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center mx-auto border border-[#e6c968]">
                    <Calendar size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F2E23]">No Bookings Yet</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    You haven't scheduled any premium services yet. Treat your pet to grooming, walking, or veterinary care!
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/premium-services"
                      className="px-5 py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Explore Services</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 1: ORDER HISTORY
             ========================================================================= */}
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
                    <div key={order._id} className="border border-beige p-5 text-xs space-y-4 rounded-xl">
                      {/* Top metadata */}
                      <div className="flex flex-wrap justify-between items-center bg-secondary p-3 border-b border-beige gap-2 rounded-lg">
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
                          <p className="font-bold text-primary">₹{order.pricing?.total || order.total || 0}</p>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-3">
                        {(order.orderItems || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'} alt={item.name} className="w-10 h-10 object-cover bg-gray-100 border border-beige rounded-md" />
                              <div>
                                <p className="font-semibold text-primary truncate max-w-xs">{item.name}</p>
                                <p className="text-[10px] text-gray-400">Qty: {item.quantity} • Price: ₹{item.price}</p>
                              </div>
                            </div>
                            <span className="font-bold text-primary">₹{(item.price || 0) * (item.quantity || 1)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tracking detail */}
                      <div className="flex flex-wrap justify-between items-center border-t border-beige pt-3 text-[11px] gap-2">
                        <span className="text-gray-400 font-semibold">Tracking Code: <strong>{order.trackingNumber}</strong></span>
                        <div className="flex items-center gap-2">
                          {order.prescriptionId && (
                            <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 font-semibold uppercase text-[9px] rounded">
                              Prescription order under review
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDownloadOrderBill(order)}
                            className="px-3 py-1 bg-[#0F2E23] hover:bg-[#163f30] text-[#D4AF37] hover:text-white rounded-lg text-[10.5px] font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Download size={11} />
                            <span>Download Bill</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 lg:p-10 border border-dashed border-[#d4af37]/40 rounded-2xl text-center space-y-3 bg-[#fdfaf2] shadow-sm">
                  <div className="w-14 h-14 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center mx-auto border border-[#e6c968]">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F2E23]">No Orders Placed Yet</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    You haven't made any purchases yet. Explore our premium selection of pet food, accessories, and grooming products!
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/shop"
                      className="px-5 py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Explore Shop</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: MY ADOPTION ENQUIRIES & APPLICATION STATUS
             ========================================================================= */}
          {activeTab === 'my-applications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-beige pb-3 gap-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-primary">
                    My Adoption Enquiries ({userAdoptionApps.length})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track the real-time application and screening status of pets you've applied to adopt.
                  </p>
                </div>
                <Link
                  to="/adopt"
                  className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#163f30] text-[#d4af37] hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={13} />
                  <span>Browse More Pets</span>
                </Link>
              </div>

              {userAdoptionApps.length > 0 ? (
                <div className="space-y-5">
                  {userAdoptionApps.map((app) => (
                    <div
                      key={app.id}
                      className="border border-[#e6c968]/50 rounded-2xl p-5 bg-white shadow-xs space-y-4 hover:border-[#d4af37] transition"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center border border-[#e6c968] shrink-0">
                            <Heart size={14} />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {app.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Applied on: {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          {renderStatusBadge(app.status)}
                        </div>
                      </div>

                      {/* Main Application Details Row */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* Pet Thumbnail & Basic Info */}
                        <div className="md:col-span-4 flex items-start gap-3">
                          <img
                            src={app.petImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'}
                            alt={app.petName}
                            className="w-16 h-16 rounded-xl object-cover border border-[#e6c968]/60 shrink-0 bg-[#fdfaf2]"
                          />
                          <div className="min-w-0">
                            <h3 className="font-serif font-bold text-slate-900 text-sm truncate">
                              {app.petName}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">{app.petBreed}</p>
                            <p className="text-[11px] text-[#0F2E23] font-semibold mt-0.5">{app.petCity}</p>
                            <Link
                              to={`/adopt/${app.petId}`}
                              className="text-[11px] text-[#0F2E23] hover:text-[#d4af37] font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
                            >
                              <span>View Pet Listing</span>
                              <ArrowRight size={11} />
                            </Link>
                          </div>
                        </div>

                        {/* Guardian Contact Info */}
                        <div className="md:col-span-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pet Guardian</span>
                          <p className="font-bold text-slate-800">{app.guardianName || 'Verified Guardian'}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone size={11} className="text-slate-400" />
                            <span>{app.guardianPhone || 'Contact details via Chat'}</span>
                          </p>

                          {app.guardianPhone && (
                            <div className="pt-2 flex items-center gap-2">
                              <a
                                href={`https://wa.me/${app.guardianPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${app.guardianName || 'Guardian'}, I am following up on my adoption application for "${app.petName}" (Ref: ${app.id}) on JOSH PETS HUB.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] inline-flex items-center gap-1 transition shadow-xs"
                              >
                                <MessageSquare size={11} />
                                <span>WhatsApp</span>
                              </a>
                              <a
                                href={`tel:${app.guardianPhone}`}
                                className="py-1 px-2.5 bg-[#0F2E23] hover:bg-[#163f30] text-[#d4af37] hover:text-white rounded-lg font-bold text-[10px] inline-flex items-center gap-1 transition shadow-xs"
                              >
                                <Phone size={11} />
                                <span>Call</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Your Application Summary */}
                        <div className="md:col-span-4 bg-[#fdfaf2] p-3 rounded-xl border border-[#e6c968]/50 text-xs space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-[#0F2E23] block">Your Submission</span>
                          <p className="text-slate-600">
                            <strong className="text-slate-800">Home:</strong> {app.homeType || 'Apartment'} • <strong className="text-slate-800">Exp:</strong> {app.hasPetExperience || 'Yes'}
                          </p>
                          <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-[#e6c968]/30 line-clamp-3">
                            "{app.adoptionReason}"
                          </p>
                        </div>
                      </div>

                      {/* Status Advice Box */}
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                        <span className="text-[11px]">
                          {app.status === 'Approved'
                            ? '🎉 Great news! Your application is approved. Coordinate with the guardian to bring your new pet home!'
                            : app.status === 'Contacted'
                            ? '📞 The guardian has initiated contact. Check your WhatsApp/phone calls for updates.'
                            : app.status === 'Under Review'
                            ? '⏳ The guardian is reviewing applications. You will be notified once shortlisted.'
                            : '🐾 Your application is in the queue. The guardian will reach out within 24–48 hours.'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 lg:p-10 border border-dashed border-[#d4af37]/40 rounded-2xl text-center space-y-3 bg-[#fdfaf2] shadow-sm">
                  <div className="w-14 h-14 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center mx-auto border border-[#e6c968]">
                    <Heart size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F2E23]">No Adoption Applications Yet</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    You have not applied for any pet adoptions yet. Find your perfect companion from our loving rescue pets!
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/adopt"
                      className="px-5 py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Explore Free Adoption Pets</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: MY LISTED PETS & RECEIVED APPLICANTS TRACKING
             ========================================================================= */}
          {activeTab === 'adoption-listings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-beige pb-3 gap-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-primary">
                    My Listed Pets & Received Applications ({guardianPets.length})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track all adoption listings you created, manage applicant profiles, and update status in real-time.
                  </p>
                </div>
                <Link
                  to="/adopt"
                  className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#163f30] text-[#d4af37] hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>List Pet For Free Adoption</span>
                </Link>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#fdfaf2] border border-[#e6c968]/60 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-[#0F2E23] uppercase tracking-wider block">Pets Listed</span>
                  <span className="text-xl font-extrabold text-[#0F2E23]">{guardianPets.length}</span>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Total Applicants</span>
                  <span className="text-xl font-extrabold text-[#15559c]">{guardianApps.length}</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Under Review</span>
                  <span className="text-xl font-extrabold text-amber-700">
                    {guardianApps.filter((a) => a.status === 'Under Review' || a.status === 'Submitted').length}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Approved Adoptions</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {guardianApps.filter((a) => a.status === 'Approved').length}
                  </span>
                </div>
              </div>

              {guardianPets.length > 0 ? (
                <div className="space-y-6">
                  {guardianPets.map((pet) => {
                    const petApplicants = guardianApps.filter((a) => String(a.petId) === String(pet.id));

                    return (
                      <div
                        key={pet.id}
                        className="border border-[#e6c968]/60 rounded-2xl p-5 bg-white shadow-sm space-y-5"
                      >
                        {/* Pet Info Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-[#e6c968]/50 shrink-0 bg-[#fdfaf2] shadow-xs"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-slate-900 text-base">
                                  {pet.name}
                                </h3>
                                <span className="text-[10px] font-bold bg-[#f8efcd] text-[#0F2E23] border border-[#e6c968] px-2 py-0.5 rounded-full">
                                  {pet.gender} • {pet.age}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{pet.breed} • {pet.city}</p>
                              <Link
                                to={`/adopt/${pet.id}`}
                                className="text-[11px] text-[#0F2E23] hover:text-[#d4af37] font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>View Public Pet Profile</span>
                                <ExternalLink size={11} />
                              </Link>
                            </div>
                          </div>

                          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Inquiries</span>
                            <span className="px-3 py-1 bg-[#fdfaf2] text-[#0F2E23] font-extrabold text-xs rounded-full border border-[#e6c968]">
                              👥 {petApplicants.length} Applicant{petApplicants.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Applicants Section */}
                        <div className="space-y-3">
                          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span>Applicants for {pet.name}</span>
                            <span className="text-[10px] font-normal text-slate-400">({petApplicants.length})</span>
                          </h4>

                          {petApplicants.length > 0 ? (
                            <div className="space-y-3">
                              {petApplicants.map((app) => (
                                <div
                                  key={app.id}
                                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3 hover:bg-white hover:border-[#d4af37] transition"
                                >
                                  {/* Applicant Header */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-[#f8efcd] text-[#0F2E23] border border-[#e6c968] font-bold text-xs flex items-center justify-center">
                                        {app.applicantName ? app.applicantName.charAt(0) : 'U'}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900 text-xs">{app.applicantName}</p>
                                        <p className="text-[10px] text-slate-400">Ref: {app.id} • {new Date(app.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>

                                    {/* Action Status Selector */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">Status:</span>
                                      <select
                                        value={app.status || 'Submitted'}
                                        onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                                        className="text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#0F2E23] cursor-pointer shadow-2xs"
                                      >
                                        <option value="Submitted">Submitted (New)</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Profile Details Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone & WhatsApp</span>
                                      <p className="font-bold text-slate-800">{app.applicantPhone}</p>
                                    </div>

                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                                      <p className="font-semibold text-slate-700 truncate">{app.applicantEmail || 'Not provided'}</p>
                                    </div>

                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Living Environment</span>
                                      <p className="text-slate-700">
                                        <strong className="text-slate-900">{app.homeType || 'Apartment'}</strong> • Exp: {app.hasPetExperience || 'Yes'}
                                      </p>
                                    </div>

                                    <div className="sm:col-span-3 pt-1 border-t border-slate-100">
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant's Note / Adoption Reason:</span>
                                      <p className="text-slate-700 italic mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-100">
                                        "{app.adoptionReason}"
                                      </p>
                                    </div>
                                  </div>

                                  {/* Contact Buttons */}
                                  <div className="flex items-center justify-end gap-2 pt-1">
                                    <a
                                      href={`https://wa.me/${(app.applicantPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${app.applicantName}! Regarding your adoption application for "${pet.name}" on JOSH PETS HUB, I would like to connect with you.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                    >
                                      <MessageSquare size={13} />
                                      <span>WhatsApp Chat</span>
                                    </a>

                                    <a
                                      href={`tel:${app.applicantPhone}`}
                                      className="py-1.5 px-3 bg-[#0F2E23] hover:bg-[#163f30] text-[#d4af37] hover:text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                    >
                                      <Phone size={13} />
                                      <span>Call Applicant</span>
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-medium">
                              No one has applied for {pet.name} yet. Share your listing to find loving pet parents!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 lg:p-10 border border-dashed border-[#d4af37]/40 rounded-2xl text-center space-y-3 bg-[#fdfaf2] shadow-sm">
                  <div className="w-14 h-14 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center mx-auto border border-[#e6c968]">
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className="font-serif text-base font-bold text-slate-800">You Haven't Listed Any Pets For Adoption Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Are you fostering or rehoming a pet? List them for free adoption on JOSH PETS HUB to connect with verified adopters.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/adopt"
                      className="px-5 py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Post Pet For Free Adoption</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 4: PRESCRIPTION HISTORY
             ========================================================================= */}
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
                    <div key={presc._id} className="border border-beige p-5 text-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center rounded-xl">
                      <div className="md:col-span-2 space-y-1">
                        <p className="font-bold text-primary text-sm font-serif">Pet: {presc.patientName}</p>
                        <p className="text-gray-500">Doctor: {presc.veterinarianName} ({presc.clinicName || 'No Clinic'})</p>
                        <p className="text-[10px] text-gray-400">Date: {new Date(presc.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        {presc.status === 'Approved' ? (
                          <span className="text-green-600 font-bold uppercase flex items-center gap-1">
                            <CircleCheck size={16} /> Approved
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
                          className="px-3 py-1.5 bg-primary text-white font-bold tracking-widest text-[10px] hover:bg-accent hover:text-primary transition uppercase inline-block text-center cursor-pointer rounded"
                        >
                          VIEW DOCUMENT
                        </a>
                      </div>
                      
                      {presc.reviewNotes && (
                        <div className="col-span-full bg-secondary p-3 border border-beige text-[11px] text-gray-600 rounded">
                          <strong>Pharmacist Notes:</strong> {presc.reviewNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 lg:p-10 border border-dashed border-[#d4af37]/40 rounded-2xl text-center space-y-3 bg-[#fdfaf2] shadow-sm">
                  <div className="w-14 h-14 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center mx-auto border border-[#e6c968]">
                    <ClipboardList size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-800">No Prescriptions Uploaded</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    You haven't uploaded any veterinary prescriptions yet. Securely upload them at the pharmacy to purchase medicines.
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/pharmacy"
                      className="px-5 py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Visit Pharmacy</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 5: ADDRESS BOOK
             ========================================================================= */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-beige pb-3">
                <h2 className="font-serif text-lg font-bold text-primary">
                  Shipping Addresses
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#163f30] text-[#d4af37] hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus size={14} /> <span>{showAddressForm ? 'Close Form' : 'Add New Address'}</span>
                </button>
              </div>

              {/* Address Addition Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="border border-[#e6c968]/60 p-5 space-y-4 bg-[#fdfaf2] rounded-2xl shadow-xs">
                  <h3 className="font-serif text-sm font-bold text-[#0F2E23]">New Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Receiver Name"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded-lg"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (10 Digits)"
                      maxLength={10}
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded-lg"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded-lg"
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Postal Code (6 Digits)"
                      maxLength={6}
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded-lg"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] font-bold text-xs rounded-xl transition shadow cursor-pointer">
                    SAVE ADDRESS
                  </button>
                </form>
              )}

              {/* Address list */}
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((a) => (
                    <div key={a._id} className="border border-[#e6c968]/50 p-5 text-xs flex justify-between items-start rounded-2xl bg-white shadow-xs hover:border-[#d4af37] transition">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center border border-[#e6c968] shrink-0 mt-0.5">
                          <MapPin size={16} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-primary flex items-center gap-2">
                            <span>{a.name}</span> 
                            {a.isDefault && <span className="bg-[#f8efcd] text-[#0F2E23] border border-[#e6c968] text-[9px] px-1.5 py-0.5 uppercase font-bold rounded">Default</span>}
                          </p>
                          <p className="text-gray-500">{a.streetAddress}</p>
                          <p className="text-gray-500">{a.city}, {a.state} - {a.postalCode}</p>
                          <p className="text-gray-400">Phone: {a.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAddress(a._id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 lg:p-10 border border-dashed border-[#d4af37]/40 rounded-2xl text-center space-y-3 bg-[#fdfaf2] shadow-sm">
                  <div className="w-14 h-14 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center mx-auto border border-[#e6c968]">
                    <MapPin size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F2E23]">No Addresses Saved</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    You haven't added any shipping addresses yet. Add one now for a faster checkout experience on your next order.
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-5 py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add New Address</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 6: PROFILE DETAILS
             ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Profile Details
              </h2>

              {/* Active Service Pass / Membership Section in Profile */}
              {membership ? (
                <div className={`rounded-2xl p-4 sm:p-5 border text-white relative transition-all ${
                  isVipMember
                    ? 'bg-[#0F2E23] border-[#D4AF37]/90 shadow-[0_4px_18px_rgba(212,175,55,0.18)]'
                    : 'bg-[#0F2E23] border-[#D4AF37]/60 shadow-sm'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/25">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${
                        isVipMember
                          ? 'bg-gradient-to-r from-[#D4AF37] via-[#E8CD69] to-[#B8860B] text-stone-950'
                          : 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                      }`}>
                        {isVipMember ? 'VIP ELITE MEMBER' : 'STANDARD MEMBER'}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#F3E5AB]">
                        {membership.packageName || (isVipMember ? 'VIP All-Access & Priority Pass' : 'Standard Service Pass')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Upgrade Subscription Button for Standard Members */}
                      {isStandardMember && (
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent('open-service-access-modal', { detail: { serviceType: 'All Services', packageId: 'pass-vip-499', isUpgrade: true, forceOpen: true } }))}
                          title="Upgrade to VIP All-Access & Priority Pass"
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-[#E5A922] to-amber-500 hover:brightness-110 text-stone-950 font-black rounded-xl text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                        >
                          <Sparkles size={13} className="text-stone-950" />
                          <span>Upgrade Subscription</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDownloadMembershipBill(membership)}
                        title="Download Payment Bill"
                        className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E8CD69] text-stone-950 font-black rounded-xl text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Download size={13} />
                        <span>Download Bill</span>
                      </button>
                      <span className="text-[10.5px] font-bold text-[#E8CD69] bg-black/35 px-3 py-1.5 rounded-xl border border-[#D4AF37]/35 inline-flex items-center gap-2 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Clean, well-spaced metadata and perks */}
                  <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 pt-3 text-xs">
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider">Ref:</span>
                        <span className="font-mono text-white text-xs font-bold">{membership.transactionId || 'TXN-ACTIVE'}</span>
                      </div>
                      <span className="text-white/25 hidden sm:inline">•</span>
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider">Validity:</span>
                        <span className="text-white text-xs font-semibold">1 Year Unlimited</span>
                      </div>
                      <span className="text-white/25 hidden sm:inline">•</span>
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider">Payment:</span>
                        <span className="text-white text-xs font-semibold">{membership.paymentMethod || 'UPI'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90 text-[11.5px] font-medium">
                      <span className="flex items-center gap-1.5"><span className="text-[#D4AF37] font-black text-xs">✓</span> Direct phone & chat</span>
                      <span className="flex items-center gap-1.5"><span className="text-[#D4AF37] font-black text-xs">✓</span> Verified background credentials</span>
                      <span className="flex items-center gap-1.5"><span className="text-[#D4AF37] font-black text-xs">✓</span> All services nationwide</span>
                    </div>
                  </div>

                  {/* ONLY SHOW UPGRADE BANNER FOR STANDARD MEMBERS */}
                  {isStandardMember && (
                    <div className="mt-3.5 pt-3 border-t border-[#D4AF37]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/15 via-amber-400/5 to-transparent -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3.5 sm:px-5 rounded-b-2xl border-t border-amber-400/30">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                          <Sparkles size={15} />
                        </div>
                        <div>
                          <span className="text-amber-300 font-bold text-xs block leading-tight">
                            Upgrade to VIP All-Access &amp; Priority Pass
                          </span>
                          <span className="text-white/75 text-[11px] leading-tight block mt-0.5">
                            Unlock 24/7 Priority Concierge, Express Bookings &amp; Senior Vet Consultations for ₹499 + GST
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-service-access-modal', { detail: { serviceType: 'All Services', packageId: 'pass-vip-499', isUpgrade: true, forceOpen: true } }))}
                        className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] via-[#E8CD69] to-[#B8860B] hover:brightness-110 text-stone-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center gap-1.5 shrink-0 active:scale-95"
                      >
                        <span>Upgrade Subscription</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* NO ACTIVE MEMBERSHIP CARD */
                <div className="rounded-xl border border-dashed border-beige bg-amber-50/40 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-primary font-serif text-sm flex items-center gap-1.5">
                      <Sparkles size={15} className="text-amber-500" />
                      <span>Service Access Membership</span>
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      No active pass. Choose Standard Pass (₹199 + GST) or VIP Pass (₹499 + GST) to unlock direct provider access.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-service-access-modal', { detail: { serviceType: 'Grooming' } }))}
                    className="px-3.5 py-1.5 bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer shrink-0"
                  >
                    Get Access Pass
                  </button>
                </div>
              )}


              
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                
                {/* Avatar Upload */}
                <div className="flex items-center gap-4 border border-beige bg-white p-4 rounded-xl">
                  <div className="w-16 h-16 rounded-full border-2 border-beige bg-sand flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-gray-400" />
                    )}
                    <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[9px] font-bold tracking-wider">
                      <span>CHANGE</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setAvatar(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary font-serif">Profile Picture</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary rounded"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary rounded"
                    required
                  />
                </div>

                {/* Password Change Section */}
                <div className="pt-4 border-t border-beige/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider">
                      Change Password
                    </label>
                  </div>

                  {/* 1. Current Password */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 font-semibold flex items-center justify-between">
                      <span>Current Password</span>
                      {currentPassword && (
                        <span className="text-[10px] text-gray-400">Required to change password</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Current Password *"
                        value={currentPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentPassword(val);
                          if (currentPasswordError) {
                            setCurrentPasswordError('');
                          }
                          if (newPassword) {
                            setNewPasswordError(validateNewPassword(newPassword, val));
                          }
                        }}
                        className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition font-medium ${
                          currentPasswordError
                            ? 'border-red-500 ring-2 ring-red-100 text-red-900 bg-red-50/20'
                            : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 bg-slate-50/50 hover:bg-white'
                        }`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#15559c] transition p-1 cursor-pointer"
                        title={showCurrentPassword ? 'Hide Password' : 'View Password'}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {currentPasswordError && (
                      <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight">{currentPasswordError}</p>
                    )}
                  </div>

                  {/* 2. New Password */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 font-semibold flex items-center justify-between">
                      <span>New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        maxLength={10}
                        placeholder="Password *"
                        value={newPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewPassword(val);
                          setNewPasswordError(validateNewPassword(val, currentPassword));
                        }}
                        className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white ${
                          newPasswordError
                            ? 'border-red-500 ring-2 ring-red-100 text-red-900'
                            : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100'
                        }`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#15559c] transition p-1 cursor-pointer"
                        title={showNewPassword ? 'Hide Password' : 'View Password'}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPasswordError && (
                      <p className="text-[10px] font-bold text-red-500 pl-1 leading-tight">{newPasswordError}</p>
                    )}

                    {/* Password Rules Badge */}
                    <div className="bg-blue-50/60 p-2.5 rounded-lg text-[10px] text-[#0f3d6b] font-medium space-y-0.5 border border-blue-100">
                      <span className="font-bold text-[#15559c] block">Password Rules (Max 10 chars):</span>
                      <p>• At least 1 Capital (A-Z), 1 Small (a-z), 1 Number (0-9), & 1 Special char (!@#$%^&*)</p>
                    </div>
                  </div>

                  {/* 3. Re-enter New Password */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 font-semibold flex items-center justify-between">
                      <span>Re-enter New Password</span>
                      {confirmPassword.length > 0 && (
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${confirmPassword === newPassword ? "text-emerald-600" : "text-amber-600"}`}>
                          {confirmPassword === newPassword ? (
                            <>✓ Passwords match</>
                          ) : (
                            <>⚠️ Passwords do not match</>
                          )}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        maxLength={10}
                        placeholder="Re-enter your new password *"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition font-medium ${
                          confirmPassword && confirmPassword !== newPassword
                            ? 'border-amber-400 ring-2 ring-amber-100 text-amber-900 bg-amber-50/20'
                            : 'border-slate-200 focus:border-[#15559c] focus:ring-2 focus:ring-blue-100 bg-slate-50/50 hover:bg-white'
                        }`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#15559c] transition p-1 cursor-pointer"
                        title={showConfirmPassword ? 'Hide Password' : 'View Password'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn-premium py-2 text-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      UPDATING DETAILS...
                    </>
                  ) : (
                    'UPDATE DETAILS'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB: PET RELOCATION & TRANSPORT ENQUIRIES
             ========================================================================= */}
          {activeTab === 'transport-enquiries' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-beige pb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-primary">
                    My Pet Relocation Enquiries & Quotations ({userTransportEnquiries.length})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track real-time status of your relocation requests, received transporter quotes, and journey schedules.
                  </p>
                </div>

                <Link
                  to="/transport"
                  className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#163f30] text-[#d4af37] hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>New Relocation Request</span>
                </Link>
              </div>

              {userTransportEnquiries.length === 0 ? (
                <div className="p-4 lg:p-10 border border-dashed border-[#d4af37]/40 rounded-2xl text-center space-y-3 bg-[#fdfaf2] shadow-sm">
                  <div className="w-14 h-14 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center mx-auto border border-[#e6c968]">
                    <Truck size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F2E23]">No Relocation Enquiries Submitted Yet</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    Planning to move your dog, cat, or bird across cities? Submit a quick enquiry to get customized quotes from verified pet transporters.
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/transport"
                      className="px-5 py-2.5 bg-[#0F2E23] text-[#d4af37] hover:text-white hover:bg-[#163f30] rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Explore Pet Transport Services</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTransportEnquiries.map((enq) => {
                    const hasQuote = enq.status === 'Quote Sent' || enq.quoteAmount;
                    return (
                      <div
                        key={enq.id}
                        className="border border-beige p-5 rounded-2xl bg-white shadow-sm space-y-4 hover:border-primary/40 transition"
                      >
                        {/* Header & Status */}
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-beige/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#f8efcd] text-[#0F2E23] rounded-full flex items-center justify-center border border-[#e6c968] shrink-0">
                              <Truck size={18} />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary font-serif">{enq.providerName}</span>
                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                  ID: {enq.id}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                Submitted on: {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                              hasQuote
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : enq.status.includes('Pending') || enq.status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {enq.status}
                            </span>
                          </div>
                        </div>

                        {/* Route & Pet Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-sand/30 p-3.5 rounded-xl border border-beige/70 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Route</span>
                            <strong className="text-gray-800">{enq.departureCity} ➔ {enq.destinationCity}</strong>
                            <span className="text-[10px] text-gray-500 block">({enq.relocationType})</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Pet</span>
                            <strong className="text-gray-800">{enq.petBreed} ({enq.petSpecies || 'Dog'})</strong>
                            <span className="text-[10px] text-gray-500 block">{enq.petGender}, {enq.petAge}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Date</span>
                            <strong className="text-gray-800">{enq.expectedDate || 'Flexible'}</strong>
                            <span className="text-[10px] text-gray-500 block">{enq.preferredModes?.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Vaccination</span>
                            <strong className="text-gray-800">{enq.vaccinationStatus}</strong>
                            <span className="text-[10px] text-gray-500 block">{enq.travelFriendly}</span>
                          </div>
                        </div>

                        {/* Customer Note */}
                        {enq.note && (
                          <div className="text-xs text-gray-600 italic bg-white p-2.5 rounded-lg border border-beige/60">
                            <strong>My Note:</strong> "{enq.note}"
                          </div>
                        )}

                        {/* Transporter Response / Official Quote */}
                        {enq.providerReply ? (
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                <ShieldCheck size={15} className="text-emerald-700" />
                                <span>Official Quotation & Travel Plan from Transporter</span>
                              </div>
                              {enq.quoteAmount && (
                                <span className="text-base font-serif font-extrabold text-[#0F2E23]">
                                  ₹{enq.quoteAmount.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700">{enq.providerReply}</p>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                ✓ Sanitized Crate & GPS Updates Included
                              </span>
                              {enq.coordinatorPhone || import.meta.env?.VITE_WHATSAPP_NUMBER ? (
                                <a
                                  href={`https://wa.me/${(enq.coordinatorPhone || import.meta.env.VITE_WHATSAPP_NUMBER).replace(/\D/g, '')}?text=Hello%2C%20I%20received%20quote%20for%20enquiry%20${enq.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                                >
                                  <MessageSquare size={13} /> Confirm with Coordinator
                                </a>
                              ) : (
                                <Link
                                  to="/contact"
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                                >
                                  <MessageSquare size={13} /> Contact Support Desk
                                </Link>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <Clock size={14} className="animate-spin text-amber-600" />
                              Transporter is reviewing vehicle availability & formulating your quote.
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">Expected in 1-2 hours</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.name}
      />

      {/* Payment Bill / Tax Invoice Modal */}
      {showBillModal && membership && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-slate-800 relative">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Josh Pets Hub" className="h-10 w-auto object-contain" />
                <div>
                  <div className="text-xl font-black text-[#0F2E23] tracking-wide">
                    JOSH PETS <span className="text-[#D4AF37]">HUB</span>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Official Payment Bill & Tax Invoice</p>
                </div>
              </div>
              <button
                onClick={() => setShowBillModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Invoice / Txn ID</span>
                <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {membership.transactionId || 'TXN_PET_69033320'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-extrabold uppercase text-[9px] tracking-wider block">Billed To</span>
                  <strong className="text-slate-900 block text-xs">{user?.name}</strong>
                  <span className="text-slate-500 text-[11px] block">{user?.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-extrabold uppercase text-[9px] tracking-wider block">Payment Date</span>
                  <strong className="text-slate-900 block text-xs">
                    {membership.activatedAt ? new Date(membership.activatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </strong>
                  <span className="text-emerald-600 font-bold text-[10px]">● Paid via {membership.paymentMethod || 'UPI'}</span>
                </div>
              </div>

              <div className="space-y-1.5 pb-2 border-b border-slate-200/60">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-bold">{membership.packageName || (membership.tier === 'VIP' ? 'VIP All-Access & Priority Pass' : 'Standard Service Access Pass')}</span>
                  <span className="font-bold">₹{(membership.basePrice || (membership.tier === 'VIP' ? 499 : 199)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>CGST (9%)</span>
                  <span>₹{((membership.basePrice || (membership.tier === 'VIP' ? 499 : 199)) * 0.09).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>SGST (9%)</span>
                  <span>₹{((membership.basePrice || (membership.tier === 'VIP' ? 499 : 199)) * 0.09).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-[#0F2E23] pt-1">
                <span>Total Amount Paid</span>
                <span className="text-base text-emerald-700">
                  ₹{((membership.basePrice || (membership.tier === 'VIP' ? 499 : 199)) * 1.18).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 gap-2">
              <span className="text-[10px] text-slate-400 font-medium">GSTIN: 29AABCU9603R1ZM</span>
              <button
                type="button"
                onClick={() => handleDownloadMembershipBill(membership)}
                className="px-4 py-2 bg-[#0F2E23] hover:bg-[#163f30] text-[#D4AF37] rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download size={13} />
                <span>Download Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.name}
      />

    </div>
  );
};

export default AccountDashboard;
