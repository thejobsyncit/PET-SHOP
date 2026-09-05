import React from 'react';
import { useSelector } from 'react-redux';
import PetSellerDashboard from './PetSellerDashboard.jsx';
import PetAdoptionDashboard from './PetAdoptionDashboard.jsx';
import VetProviderDashboard from './VetProviderDashboard.jsx';
import GroomingProviderDashboard from './GroomingProviderDashboard.jsx';
import HostelProviderDashboard from './HostelProviderDashboard.jsx';
import WalkingProviderDashboard from './WalkingProviderDashboard.jsx';
import TransportProviderDashboard from './TransportProviderDashboard.jsx';
import TrainingProviderDashboard from './TrainingProviderDashboard.jsx';
import InsuranceProviderDashboard from './InsuranceProviderDashboard.jsx';
import BreedingProviderDashboard from './BreedingProviderDashboard.jsx';

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

  if (user?.serviceCategory === 'Pet Walking & Fitness') {
    return <WalkingProviderDashboard {...props} />;
  }

  if (user?.serviceCategory === 'Pet Transport & Relocation') {
    return <TransportProviderDashboard {...props} />;
  }

  if (user?.serviceCategory === 'Pet Training & Behavior') {
    return <TrainingProviderDashboard {...props} />;
  }

  if (user?.serviceCategory === 'Pet Insurance') {
    return <InsuranceProviderDashboard {...props} />;
  }

  if (user?.serviceCategory === 'Pet Mating & Breeding') {
    return <BreedingProviderDashboard {...props} />;
  }

  // Fallback to PetSellerDashboard
  return <PetSellerDashboard {...props} />;
};

export default ServiceProviderDashboard;
