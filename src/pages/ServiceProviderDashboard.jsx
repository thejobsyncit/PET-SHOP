import React from 'react';
import { useSelector } from 'react-redux';
import PetSellerDashboard from './PetSellerDashboard.jsx';
import PetAdoptionDashboard from './PetAdoptionDashboard.jsx';
import VetProviderDashboard from './VetProviderDashboard.jsx';
import GroomingProviderDashboard from './GroomingProviderDashboard.jsx';
import HostelProviderDashboard from './HostelProviderDashboard.jsx';

/**
 * ServiceProviderDashboard
 * Dynamically routes to the correct dashboard based on the provider's service category.
 */
const ServiceProviderDashboard = (props) => {
  const { user } = useSelector(state => state.auth);

  if (user?.serviceCategory === 'Pet Adoption') {
    return <PetAdoptionDashboard {...props} />;
  }

  if (user?.serviceCategory === 'Consult a Vet' || user?.name?.includes('Dr.')) {
    return <VetProviderDashboard {...props} />;
  }
  
  if (user?.serviceCategory === 'Pet Grooming Spa' || user?.serviceCategory === 'Grooming' || user?.name?.includes('Grooming')) {
    return <GroomingProviderDashboard {...props} />;
  }

  if (user?.serviceCategory === 'Pet Hostel / Boarding' || user?.serviceCategory === 'Hostel' || user?.name?.includes('Hostel') || user?.name?.includes('Resort')) {
    return <HostelProviderDashboard {...props} />;
  }

  // Fallback to PetSellerDashboard
  return <PetSellerDashboard {...props} />;
};

export default ServiceProviderDashboard;
