// Grooming Service Providers Dataset & Persistent Storage Helpers

export const GROOMING_OFFERINGS = [
  { id: 'all', name: 'All Services', icon: '🐾', desc: 'Browse all professional grooming care' },
  { id: 'spa-bath', name: 'Spa Bath', icon: '🛁', desc: 'Shampoo, conditioner & warm blow dry' },
  { id: 'full-grooming', name: 'Full Grooming', icon: '✂️', desc: 'Bath, haircut, styling & sanitization' },
  { id: 'nail-clipping', name: 'Nail Clipping', icon: '💅', desc: 'Painless claw trimming & filing' },
  { id: 'hair-cuts', name: 'Hair Cuts', icon: '🐩', desc: 'Breed standard & summer styling trims' },
  { id: 'medical-bath', name: 'Medical Bath', icon: '🧼', desc: 'Anti-fungal & soothing medicated baths' },
  { id: 'knot-mats-removal', name: 'Knot/Mats Removal', icon: '🪮', desc: 'Gentle detangling & fur de-shedding' },
  { id: 'anti-tick-treatment', name: 'Anti-Tick Treatment', icon: '🛡️', desc: 'Flea, tick & parasite protection dip' }
];

export const INITIAL_GROOMING_PROVIDERS = [
  {
    id: 'GRM-101',
    name: 'Velvet Fur Luxury Spa Studio',
    tagline: 'Signature Organic Aromatherapy & Coat Restoration',
    groomerName: 'Priya Sundaram (Certified Master Stylist)',
    experience: '8+ Years Exp',
    verified: true,
    rating: 4.9,
    reviews: 184,
    petTypes: ['Dogs', 'Cats'],
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Koramangala 4th Block',
    serviceMode: 'Salon Studio & Home Visit',
    price: 999,
    discountPrice: 799,
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800',
    phone: '8306688827',
    offerings: ['Spa Bath', 'Full Grooming', 'Nail Clipping', 'Hair Cuts', 'Knot/Mats Removal', 'Anti-Tick Treatment'],
    packages: [
      { name: 'Basic Bath & Dry', price: 799, duration: '45 mins', desc: 'Organic herbal shampoo, blow dry, ear cleaning & paw sanitization' },
      { name: 'Complete Full Grooming', price: 1499, duration: '90 mins', desc: 'Full body haircut, sanitary trim, nail filing, bath, ear plucking & perfume' },
      { name: 'Anti-Tick & Flea Spa', price: 1199, duration: '60 mins', desc: 'Medicated tick removal bath, herbal dip & coat conditioning spray' }
    ]
  },
  {
    id: 'GRM-102',
    name: 'Paws & Bubbles Doorstep Van',
    tagline: 'Fully Air-Conditioned Mobile Spa at Your Doorstep',
    groomerName: 'Rohan Mehra (Mobile Van Specialist)',
    experience: '6+ Years Exp',
    verified: true,
    rating: 4.8,
    reviews: 142,
    petTypes: ['Dogs'],
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Bandra West & Juhu',
    serviceMode: 'Doorstep Van',
    price: 1200,
    discountPrice: 999,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800',
    phone: '8306688827',
    offerings: ['Spa Bath', 'Full Grooming', 'Nail Clipping', 'Hair Cuts', 'Anti-Tick Treatment'],
    packages: [
      { name: 'Doorstep Express Bath', price: 999, duration: '40 mins', desc: 'Warm hydro-bath inside AC van, organic shampoo & towel dry' },
      { name: 'Royal Mobile Styling', price: 1799, duration: '80 mins', desc: 'Full custom breed haircut, deshedding, nail clipping & ear wash' }
    ]
  },
  {
    id: 'GRM-103',
    name: 'Sniff & Shine Pet Salon',
    tagline: 'Gentle, Stress-Free Care for Puppies & Seniors',
    groomerName: 'Ananya Verma (Pet Behaviorist & Groomer)',
    experience: '5+ Years Exp',
    verified: true,
    rating: 5.0,
    reviews: 96,
    petTypes: ['Dogs', 'Cats'],
    state: 'Delhi',
    city: 'Delhi',
    area: 'Hauz Khas & Greater Kailash',
    serviceMode: 'Salon Studio',
    price: 599,
    discountPrice: 499,
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?q=80&w=800',
    phone: '8306688827',
    offerings: ['Spa Bath', 'Nail Clipping', 'Hair Cuts', 'Medical Bath', 'Knot/Mats Removal'],
    packages: [
      { name: 'Essential Hygiene Package', price: 499, duration: '30 mins', desc: 'Nail clipping, ear cleaning, paw pad trimming & teeth brushing' },
      { name: 'Herbal Medicated Bath', price: 899, duration: '60 mins', desc: 'Veterinary antiseptic bath for itching, dandruff & skin allergies' }
    ]
  },
  {
    id: 'GRM-104',
    name: 'Happy Tails Grooming & Spa Hub',
    tagline: 'Premium De-Shedding & Breed Standard Haircuts',
    groomerName: 'Karthik Nair (Avian & Canine Specialist)',
    experience: '7+ Years Exp',
    verified: true,
    rating: 4.8,
    reviews: 110,
    petTypes: ['Dogs', 'Cats'],
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Jubilee Hills & Gachibowli',
    serviceMode: 'Home Visit',
    price: 850,
    discountPrice: 699,
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=800',
    phone: '8306688827',
    offerings: ['Spa Bath', 'Full Grooming', 'Nail Clipping', 'Medical Bath', 'Anti-Tick Treatment'],
    packages: [
      { name: 'Home Comfort Bath & Trim', price: 699, duration: '50 mins', desc: 'Groomer brings all sanitized equipment directly to your home' },
      { name: 'Ultimate Breed Makeover', price: 1399, duration: '90 mins', desc: 'Full show haircut, de-matting, deep fur conditioning & teeth wash' }
    ]
  },
  {
    id: 'GRM-105',
    name: 'The Fur Barbershop & Spa',
    tagline: 'Certified Feline & Canine Show Grooming Experts',
    groomerName: 'Vikram Joshi (Master Fur Sculptor)',
    experience: '10+ Years Exp',
    verified: true,
    rating: 4.9,
    reviews: 215,
    petTypes: ['Dogs', 'Cats'],
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Adyar & Nungambakkam',
    serviceMode: 'Salon Studio & Home Visit',
    price: 1500,
    discountPrice: 1299,
    image: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=800',
    phone: '8306688827',
    offerings: ['Spa Bath', 'Full Grooming', 'Nail Clipping', 'Hair Cuts', 'Knot/Mats Removal', 'Anti-Tick Treatment', 'Medical Bath'],
    packages: [
      { name: 'Show Grooming & Style Cut', price: 1299, duration: '75 mins', desc: 'Custom silhouette trim, feather styling, nail buffing & conditioning' },
      { name: 'Full De-Matting & Skin Therapy', price: 1899, duration: '110 mins', desc: 'Painless knot separation, deep coat hydration mask & tick dip' }
    ]
  },
  {
    id: 'GRM-106',
    name: 'Fluffy Cleaners Mobile Pet Spa',
    tagline: 'Fast, Sanitized & Budget-Friendly Grooming for All Pets',
    groomerName: 'Suresh Patil (Senior Pet Care Giver)',
    experience: '4+ Years Exp',
    verified: true,
    rating: 4.7,
    reviews: 68,
    petTypes: ['Dogs', 'Cats'],
    state: 'Maharashtra',
    city: 'Pune',
    area: 'Kothrud & Viman Nagar',
    serviceMode: 'Home Visit',
    price: 450,
    discountPrice: 399,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
    phone: '8306688827',
    offerings: ['Spa Bath', 'Nail Clipping', 'Medical Bath', 'Anti-Tick Treatment'],
    packages: [
      { name: 'Pocket-Friendly Puppy Bath', price: 399, duration: '35 mins', desc: 'Tearless shampoo, warm blow dry, nail cut & ear wipe' },
      { name: 'Tick Defense & Bath Combo', price: 749, duration: '55 mins', desc: 'Anti-parasite wash, full coat brushing & lavender scent' }
    ]
  }
];

const STORAGE_KEY_PROVIDERS = 'pawora_grooming_providers_v1';
const STORAGE_KEY_BOOKINGS = 'pawora_grooming_bookings_v1';

export const getStoredGroomingProviders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse grooming providers from storage', e);
  }
  return INITIAL_GROOMING_PROVIDERS;
};

export const saveGroomingBooking = (bookingData) => {
  try {
    const existing = getStoredGroomingBookings();
    const updated = [bookingData, ...existing];
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save grooming booking', e);
    return false;
  }
};

export const getStoredGroomingBookings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load grooming bookings', e);
  }
  return [];
};
