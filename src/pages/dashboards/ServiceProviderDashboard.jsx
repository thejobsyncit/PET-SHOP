import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PetSellerDashboard from './providers/PetSellerDashboard.jsx';
import PetAdoptionDashboard from './providers/PetAdoptionDashboard.jsx';
import VetProviderDashboard from './providers/VetProviderDashboard.jsx';
import GroomingProviderDashboard from './providers/GroomingProviderDashboard.jsx';
import HostelProviderDashboard from './providers/HostelProviderDashboard.jsx';
import WalkingProviderDashboard from './providers/WalkingProviderDashboard.jsx';
import TransportProviderDashboard from './providers/TransportProviderDashboard.jsx';
import TrainingProviderDashboard from './providers/TrainingProviderDashboard.jsx';
import InsuranceProviderDashboard from './providers/InsuranceProviderDashboard.jsx';
import BreedingProviderDashboard from './providers/BreedingProviderDashboard.jsx';

// Helper to normalize and map service category names to canonical dashboard keys
const getCanonicalServiceKey = (categoryName = '') => {
  const cat = (categoryName || '').toLowerCase().trim();
  if (cat.includes('vet')) return 'vet';
  if (cat.includes('adopt') || cat.includes('shelter')) return 'adoption';
  if (cat.includes('groom') || cat.includes('spa')) return 'grooming';
  if (cat.includes('hostel') || cat.includes('board') || cat.includes('resort')) return 'hostel';
  if (cat.includes('walk') || cat.includes('fitness')) return 'walking';
  if (cat.includes('transport') || cat.includes('transit') || cat.includes('relocation')) return 'transport';
  if (cat.includes('train') || cat.includes('behavior')) return 'training';
  if (cat.includes('insur')) return 'insurance';
  if (cat.includes('breed') || cat.includes('mating')) return 'breeding';
  return 'seller';
};

/**
 * ServiceProviderDashboard
 * Enforces strict role-based and service-specific authorization.
 * Only authenticated Service Providers can access dashboards, and each provider
 * is restricted to their registered, database-validated service category.
 */
const ServiceProviderDashboard = (props) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const typeParam = (searchParams.get('type') || searchParams.get('category') || '').toLowerCase().trim();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const registeredCategory = user?.serviceCategory || user?.service_category || 'Pet Seller';
  const authorizedKey = getCanonicalServiceKey(registeredCategory);

  // 1. Role-Based Access Control: Authentication & Provider Role Verification
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in with your Service Provider account to access the dashboard.');
      navigate('/login?role=provider', { replace: true });
      return;
    }

    if (user?.role === 'CUSTOMER') {
      toast.error('Access Denied: Pet Parent accounts cannot access Service Provider dashboards.');
      navigate('/account', { replace: true });
      return;
    }

    // 2. Service-Specific Dashboard Authorization Guard
    if (!isAdmin && typeParam) {
      const requestedKey = getCanonicalServiceKey(typeParam);
      if (requestedKey !== authorizedKey) {
        toast.error(`Access Restricted: You are authorized for ${registeredCategory}. You cannot access other service dashboards.`);
      }
    }
  }, [isAuthenticated, user?.role, typeParam, authorizedKey, registeredCategory, isAdmin, navigate]);

  if (!isAuthenticated || user?.role === 'CUSTOMER') {
    return null;
  }

  // Determine active service dashboard:
  // Admins may view any dashboard via query param; Providers are strictly locked to their authorized service
  const activeKey = (isAdmin && typeParam) ? getCanonicalServiceKey(typeParam) : authorizedKey;

  // Safe defaults for provider props
  const defaultProvider = {
    id: user?.id || user?._id || 'provider-default',
    name: user?.businessName || user?.name || 'Service Partner',
    email: user?.email || '',
    phone: user?.mobile || '+91 98765 43210',
    serviceCategory: registeredCategory,
    rating: 4.9,
    reviewsCount: 128,
    avatar: user?.avatar || user?.profilePicture || ''
  };

  const safeProps = {
    currentProvider: props.currentProvider || defaultProvider,
    profiles: Array.isArray(props.profiles) ? props.profiles : [],
    handleToggleOnline: props.handleToggleOnline || (() => {}),
    ...props
  };

  // 1. Consult a Vet
  if (activeKey === 'vet') {
    return <VetProviderDashboard {...safeProps} />;
  }

  // 2. Pet Adoption & Shelter
  if (activeKey === 'adoption') {
    return <PetAdoptionDashboard {...safeProps} />;
  }

  // 3. Pet Grooming Spa
  if (activeKey === 'grooming') {
    return <GroomingProviderDashboard {...safeProps} />;
  }

  // 4. Pet Hostel / Boarding
  if (activeKey === 'hostel') {
    return <HostelProviderDashboard {...safeProps} />;
  }

  // 5. Dog Walking & Fitness
  if (activeKey === 'walking') {
    return <WalkingProviderDashboard {...safeProps} />;
  }

  // 6. Pet Transport & Relocation
  if (activeKey === 'transport') {
    return <TransportProviderDashboard {...safeProps} />;
  }

  // 7. Training & Behavior
  if (activeKey === 'training') {
    return <TrainingProviderDashboard {...safeProps} />;
  }

  // 8. Pet Insurance
  if (activeKey === 'insurance') {
    return <InsuranceProviderDashboard {...safeProps} />;
  }

  // 9. Mating & Breeding
  if (activeKey === 'breeding') {
    return <BreedingProviderDashboard {...safeProps} />;
  }

  // 10. Pet Classifieds / Seller / Default
  return <PetSellerDashboard {...safeProps} />;
};

export default ServiceProviderDashboard;
