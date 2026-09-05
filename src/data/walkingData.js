// Walking Service Providers Dataset & Persistent Storage Helpers

export const WALKING_OFFERINGS = [
  { id: 'all', name: 'All Walks', icon: '🐾', desc: 'Browse all verified dog walking formats' },
  { id: 'solo-walk', name: 'Daily Solo Walk', icon: '🦮', desc: 'Dedicated 1-on-1 walk with undivided walker attention' },
  { id: 'group-stride', name: 'Group Fitness Stride', icon: '🐕‍🦺', desc: 'Social pack walks for energy burning & play' },
  { id: 'puppy-care', name: 'Puppy Walk & Potty', icon: '🐶', desc: 'Gentle leash training & potty routine for pups' },
  { id: 'senior-stroll', name: 'Senior Dog Stroll', icon: '🦥', desc: 'Slow-paced, joint-friendly scenic walks' },
  { id: 'gps-tracked', name: 'Live GPS Tracked', icon: '📍', desc: 'Real-time route, distance & potty updates' },
  { id: 'monthly-pass', name: 'Monthly Pass', icon: '📅', desc: 'Daily morning & evening subscription plan' },
  { id: 'adventure-trail', name: 'Weekend Adventure', icon: '🌲', desc: 'Long park trails, sniffaris & fitness running' }
];

export const INITIAL_WALKING_PROVIDERS = [
  {
    id: 'WLK-101',
    name: 'PawSteps Pro Dog Walkers',
    tagline: 'Certified Canine Fitness Coaches & GPS Live Route Tracking',
    walkerName: 'Aditya Sen (Certified Dog Behaviorist)',
    experience: '6+ Years Exp',
    verified: true,
    rating: 4.9,
    reviews: 168,
    petTypes: ['Dogs', 'Puppies'],
    dogSizes: ['Small', 'Medium', 'Large'],
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Indiranagar & Koramangala',
    serviceMode: 'Solo Walk & Group Fitness',
    price: 350,
    discountPrice: 299,
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800',
    phone: '8306688827',
    offerings: ['Daily Solo Walk', 'Group Fitness Stride', 'Live GPS Tracked', 'Monthly Pass', 'Puppy Walk & Potty'],
    features: ['Live GPS Route Map', 'Post-Walk Paws Cleaned', 'Water Hydration Given', 'Poop Scooped & Disposed'],
    packages: [
      { name: '30-Min Solo Stride', price: 299, duration: '30 mins', desc: 'Dedicated 1-on-1 energetic walk, hydration break & paw wipe down' },
      { name: '60-Min Power Fitness Walk', price: 499, duration: '60 mins', desc: 'Brisk cardio walk, obedience reinforcement & high-energy burn' },
      { name: 'Monthly 30-Day Solo Pass (2 Walks/Day)', price: 4999, duration: '30 Days', desc: 'Daily Morning (7 AM) & Evening (6 PM) regular exercise routine' }
    ]
  },
  {
    id: 'WLK-102',
    name: 'Urban Paws Canine Fitness Squad',
    tagline: 'Safety-First Double-Leashed Walks with Live Video Snaps',
    walkerName: 'Varun Grover (K9 Leash Master)',
    experience: '5+ Years Exp',
    verified: true,
    rating: 4.8,
    reviews: 134,
    petTypes: ['Dogs', 'Puppies', 'Senior Dogs'],
    dogSizes: ['Small', 'Medium', 'Large', 'Giant'],
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Bandra West & Khar',
    serviceMode: 'Solo Walk & Senior Strolls',
    price: 400,
    discountPrice: 349,
    image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800',
    phone: '8306688827',
    offerings: ['Daily Solo Walk', 'Senior Dog Stroll', 'Live GPS Tracked', 'Monthly Pass'],
    features: ['Live Photo Updates', 'GPS Tracked Route', 'Tear-Free Gentle Handling', 'Fresh Drinking Water'],
    packages: [
      { name: 'Bandra Coastal Walk (40 Min)', price: 349, duration: '40 mins', desc: 'Stimulating promenade walk, full potty tracking & cool-down rest' },
      { name: 'Senior Gentle Stroll (30 Min)', price: 299, duration: '30 mins', desc: 'Slow, joint-friendly sniffing walk with frequent shady rest breaks' },
      { name: 'Monthly Unlimited Care Package', price: 5499, duration: '30 Days', desc: '60 total walks per month with emergency vet priority escort' }
    ]
  },
  {
    id: 'WLK-103',
    name: 'HappyPaws Morning & Evening Walkers',
    tagline: 'Stress-Free Leash Walks & Puppy Socialization',
    walkerName: 'Neha Sharma (Pet Care Specialist)',
    experience: '4+ Years Exp',
    verified: true,
    rating: 5.0,
    reviews: 92,
    petTypes: ['Dogs', 'Puppies'],
    dogSizes: ['Small', 'Medium'],
    state: 'Delhi',
    city: 'Delhi',
    area: 'Hauz Khas & Green Park',
    serviceMode: 'Puppy Care & Solo Walks',
    price: 300,
    discountPrice: 249,
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800',
    phone: '8306688827',
    offerings: ['Puppy Walk & Potty', 'Daily Solo Walk', 'Group Fitness Stride', 'Weekend Adventure'],
    features: ['Trained in Puppy Behavior', 'Gentle Positive Reinforcement', 'Post-Walk Feeding Assistance', 'Poop Report'],
    packages: [
      { name: 'Puppy Socialization & Potty Walk', price: 249, duration: '30 mins', desc: 'Patience-driven potty habit building, leash habituation & basic cues' },
      { name: 'Standard 45-Min Neighborhood Walk', price: 349, duration: '45 mins', desc: 'Full sniffari, mental stimulation exercises and hydration' },
      { name: 'Weekend Green Park Trail (90 Min)', price: 699, duration: '90 mins', desc: 'Off-road park adventure trail with sniffing games & fetch' }
    ]
  },
  {
    id: 'WLK-104',
    name: 'SafeStride Dog Escorts & Pack Walks',
    tagline: 'Structured Pack Walks & High-Energy Cardio Jogs',
    walkerName: 'Rajesh Reddy (Canine Athletics Coach)',
    experience: '7+ Years Exp',
    verified: true,
    rating: 4.8,
    reviews: 145,
    petTypes: ['Dogs'],
    dogSizes: ['Medium', 'Large', 'Giant'],
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Jubilee Hills & HITEC City',
    serviceMode: 'Group Fitness & Adventure Trails',
    price: 450,
    discountPrice: 379,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
    phone: '8306688827',
    offerings: ['Group Fitness Stride', 'Weekend Adventure', 'Daily Solo Walk', 'Live GPS Tracked'],
    features: ['GPS Route & Speed Tracking', 'Pack Dynamics Expert', 'Tick Check Post-Walk', 'Paw Balm Applied'],
    packages: [
      { name: 'Pack Energy Burn Walk', price: 379, duration: '45 mins', desc: 'Structured group stride with balanced dogs for social enrichment' },
      { name: 'Canine Jogging & Agility Session', price: 599, duration: '60 mins', desc: 'Trot & run conditioning for high-drive athletic breeds' },
      { name: 'Monthly Dual-Stride Premium', price: 5999, duration: '30 Days', desc: 'Two 45-min walks daily with weekly health & weight checkups' }
    ]
  },
  {
    id: 'WLK-105',
    name: 'Chennai Coast Canine Walkers',
    tagline: 'Beach Walks, Sea-Breeze Sniffaris & Sunset Exercise',
    walkerName: 'Karthik Raman (Dog Walker & Marine Biologist)',
    experience: '8+ Years Exp',
    verified: true,
    rating: 4.9,
    reviews: 198,
    petTypes: ['Dogs', 'Senior Dogs'],
    dogSizes: ['Small', 'Medium', 'Large'],
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Besant Nagar & ECR',
    serviceMode: 'Solo Walk & Weekend Adventure',
    price: 400,
    discountPrice: 320,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800',
    phone: '8306688827',
    offerings: ['Weekend Adventure', 'Daily Solo Walk', 'Senior Dog Stroll', 'Monthly Pass'],
    features: ['Beach & Sand Running', 'Full Salt Rinse & Paw Clean', 'GPS Distance Tracker', 'Fresh Tender Coconut Water'],
    packages: [
      { name: 'Beachside Morning Sniffari', price: 320, duration: '40 mins', desc: 'Gentle sand walk, sea breeze sniffing & sensory enrichment' },
      { name: 'ECR Weekend Trail Trek', price: 750, duration: '90 mins', desc: 'Safe wooded & park trail walk with recall practice' },
      { name: 'Monthly Shoreline Pass', price: 4799, duration: '30 Days', desc: '30 morning walks with dedicated walker and weekly report card' }
    ]
  },
  {
    id: 'WLK-106',
    name: 'K9 Speedsters Pune Walking Squad',
    tagline: 'Reliable Daily Leash Exercise & Behavioral Walking',
    walkerName: 'Sameer Joshi (Certified K9 Handler)',
    experience: '5+ Years Exp',
    verified: true,
    rating: 4.7,
    reviews: 88,
    petTypes: ['Dogs', 'Puppies'],
    dogSizes: ['Small', 'Medium', 'Large'],
    state: 'Maharashtra',
    city: 'Pune',
    area: 'Koregaon Park & Kalyani Nagar',
    serviceMode: 'Solo Walk & Group Fitness',
    price: 280,
    discountPrice: 220,
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800',
    phone: '8306688827',
    offerings: ['Daily Solo Walk', 'Puppy Walk & Potty', 'Live GPS Tracked', 'Monthly Pass'],
    features: ['Punctual Doorstep Pickup', 'No-Pull Leash Training', 'Sanitized Equipment', 'Emergency First Aid Kit'],
    packages: [
      { name: 'Quick 30-Min Neighborhood Stride', price: 220, duration: '30 mins', desc: 'Quick energetic walk, potty break & clean-up' },
      { name: 'Monthly Essential Plan (1 Walk/Day)', price: 3299, duration: '30 Days', desc: '30 daily scheduled morning or evening walks' }
    ]
  }
];

const STORAGE_KEY_PROVIDERS = 'pawora_walking_providers_v1';
const STORAGE_KEY_BOOKINGS = 'pawora_walking_bookings_v1';

export const getStoredWalkingProviders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse walking providers from storage', e);
  }
  return INITIAL_WALKING_PROVIDERS;
};

export const saveWalkingBooking = (bookingData) => {
  try {
    const existing = getStoredWalkingBookings();
    const updated = [bookingData, ...existing];
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save walking booking', e);
    return false;
  }
};

export const getStoredWalkingBookings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load walking bookings', e);
  }
  return [];
};

export const saveWalkingProvider = (providerData) => {
  try {
    const existing = getStoredWalkingProviders();
    const index = existing.findIndex(p => p.id === providerData.id);
    
    let updated;
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...updated[index], ...providerData };
    } else {
      updated = [providerData, ...existing];
    }
    
    localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save walking provider', e);
    return false;
  }
};

