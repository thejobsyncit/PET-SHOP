import React from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
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

/**
 * ServiceProviderDashboard
 * Dynamically routes to the correct dashboard based on the provider's service category or query param.
 */
const ServiceProviderDashboard = (props) => {
  const { user } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const typeParam = (searchParams.get('type') || searchParams.get('category') || '').toLowerCase();
  const userCat = (user?.serviceCategory || '').toLowerCase();

  // Robust safe defaults for provider props
  const defaultProvider = {
    id: user?.id || user?._id || 'provider-default',
    name: user?.businessName || user?.name || 'Service Partner',
    email: user?.email || '',
    phone: user?.mobile || '+91 98765 43210',
    serviceCategory: user?.serviceCategory || 'Pet Seller',
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

  // 1. Pet Adoption
  if (typeParam === 'adoption' || typeParam === 'shelter' || userCat.includes('adoption') || userCat.includes('shelter')) {
    return <PetAdoptionDashboard {...safeProps} />;
  }

  // 2. Consult a Vet
  if (typeParam === 'vet' || typeParam === 'veterinary' || userCat.includes('vet') || user?.name?.includes('Dr.')) {
    return <VetProviderDashboard {...safeProps} />;
  }
  
  // 3. Grooming Spa
  if (typeParam === 'grooming' || typeParam === 'spa' || userCat.includes('grooming') || user?.name?.includes('Grooming')) {
    return <GroomingProviderDashboard {...safeProps} />;
  }

  // 4. Pet Hostel / Boarding
  if (typeParam === 'hostel' || typeParam === 'boarding' || typeParam === 'resort' || userCat.includes('hostel') || userCat.includes('boarding') || user?.name?.includes('Hostel') || user?.name?.includes('Resort')) {
    return <HostelProviderDashboard {...safeProps} />;
  }

  // 5. Dog Walking & Fitness
  if (typeParam === 'walking' || typeParam === 'walker' || userCat.includes('walking') || userCat.includes('fitness')) {
    return <WalkingProviderDashboard {...safeProps} />;
  }

  // 6. Pet Transport & Relocation
  if (typeParam === 'transport' || typeParam === 'relocation' || userCat.includes('transport') || userCat.includes('relocation') || userCat.includes('ambulance')) {
    return <TransportProviderDashboard {...safeProps} />;
  }

  // 7. Training & Behavior
  if (typeParam === 'training' || typeParam === 'trainer' || userCat.includes('training') || userCat.includes('behavior')) {
    return <TrainingProviderDashboard {...safeProps} />;
  }

  // 8. Pet Insurance
  if (typeParam === 'insurance' || userCat.includes('insurance')) {
    return <InsuranceProviderDashboard {...safeProps} />;
  }

  // 9. Mating & Breeding
  if (typeParam === 'breeding' || typeParam === 'mating' || userCat.includes('breeding') || userCat.includes('mating')) {
    return <BreedingProviderDashboard {...safeProps} />;
  }

  // 10. Pet Classifieds / Seller / Default
  return <PetSellerDashboard {...safeProps} />;
};

export default ServiceProviderDashboard;
