import React from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
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
 * Dynamically routes to the correct dashboard based on the provider's service category or query param.
 */
const ServiceProviderDashboard = (props) => {
  const { user } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const typeParam = (searchParams.get('type') || searchParams.get('category') || '').toLowerCase();

  if (typeParam === 'adoption' || user?.serviceCategory === 'Pet Adoption') {
    return <PetAdoptionDashboard {...props} />;
  }

  if (typeParam === 'vet' || user?.serviceCategory === 'Consult a Vet' || user?.name?.includes('Dr.')) {
    return <VetProviderDashboard {...props} />;
  }
  
  if (typeParam === 'grooming' || user?.serviceCategory === 'Pet Grooming Spa' || user?.serviceCategory === 'Grooming' || user?.name?.includes('Grooming')) {
    return <GroomingProviderDashboard {...props} />;
  }

  if (typeParam === 'hostel' || user?.serviceCategory === 'Pet Hostel / Boarding' || user?.serviceCategory === 'Hostel' || user?.name?.includes('Hostel') || user?.name?.includes('Resort')) {
    return <HostelProviderDashboard {...props} />;
  }

  if (typeParam === 'walking' || user?.serviceCategory === 'Pet Walking & Fitness') {
    return <WalkingProviderDashboard {...props} />;
  }

  if (typeParam === 'transport' || user?.serviceCategory === 'Pet Transport & Relocation') {
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
