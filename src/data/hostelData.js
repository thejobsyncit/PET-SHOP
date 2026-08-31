// Pet Hostel & Boarding Service Providers Dataset & Persistent Storage Helpers

export const HOSTEL_OFFERINGS = [
  { id: 'all', name: 'All Features', icon: '🐾', desc: 'Browse all verified pet hostels & resorts' },
  { id: 'ac-rooms', name: 'AC Suites', icon: '❄️', desc: 'Climate-controlled private rooms & suites' },
  { id: 'cctv', name: '24/7 CCTV Live Stream', icon: '📹', desc: 'Live mobile video streaming for pet parents' },
  { id: 'lawn', name: 'Outdoor Lawn & Play Area', icon: '🌳', desc: 'Green lawns, agility tracks & open spaces' },
  { id: 'vet-on-call', name: 'Vet On Call', icon: '🩺', desc: '24/7 emergency medical & vet supervision' },
  { id: 'video-updates', name: 'Daily Video Updates', icon: '📱', desc: 'Daily WhatsApp photos & video updates' },
  { id: 'home-cooked-meals', name: 'Customized Meals', icon: '🍲', desc: 'Fresh home-cooked diet & medical meals' },
  { id: 'swimming-pool', name: 'Pet Pool / Splash Zone', icon: '🏊', desc: 'Supervised pet pool & splash play zones' }
];

export const HOSTEL_AMENITIES = HOSTEL_OFFERINGS;

export const INITIAL_HOSTEL_PROVIDERS = [
  {
    id: 'HST-201',
    name: 'Happy Paws Luxury Pet Resort & Hostel',
    tagline: '5-Star AC Suites, Swimming Pool & 24/7 CCTV Access',
    hostName: 'Captain Ramesh (Retd.) & Sunita',
    experience: '9+ Years Boarding',
    verified: true,
    rating: 4.9,
    reviews: 195,
    petTypes: ['Dogs', 'Cats'],
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Sarjapur & Bellandur',
    stayType: 'AC Suite & Private Garden',
    pricePerNight: 999,
    discountPrice: 799,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
    phone: '8306688827',
    amenities: ['AC Suites', '24/7 CCTV Live Stream', 'Outdoor Lawn & Play Area', 'Vet On Call', 'Daily Video Updates', 'Customized Meals', 'Pet Pool / Splash Zone'],
    packages: [
      { name: 'Deluxe AC Room (Single Pet)', price: 799, desc: 'Climate controlled private room, 3 fresh meals, 3 daily walks & video updates' },
      { name: 'Royal Presidential Suite', price: 1399, desc: 'Large suite with sofa, CCTV mobile access, pool time & complimentary bath on checkout' }
    ]
  },
  {
    id: 'HST-202',
    name: 'Cozy Tails Homely Boarding House',
    tagline: 'Cage-Free Homely Environment with Loving Family Care',
    hostName: 'Meera Deshmukh & Family',
    experience: '6+ Years Boarding',
    verified: true,
    rating: 4.8,
    reviews: 134,
    petTypes: ['Dogs', 'Cats'],
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Andheri West & Lokhandwala',
    stayType: 'Cage-Free Home Boarding',
    pricePerNight: 750,
    discountPrice: 599,
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800',
    phone: '8306688827',
    amenities: ['AC Suites', 'Outdoor Lawn & Play Area', 'Daily Video Updates', 'Customized Meals', 'Vet On Call'],
    packages: [
      { name: 'Homely Day & Night Care', price: 599, desc: 'Cage-free living in spacious bungalow, home-cooked chicken & rice, daily photos' },
      { name: 'Extended Vacation Stay (7+ Days)', price: 499, desc: 'Discounted long-term boarding with weekly bath and personalized play routines' }
    ]
  },
  {
    id: 'HST-203',
    name: 'Bark & Stay Farmhouse Resort',
    tagline: '2-Acre Green Play Lawns, Agility Track & 24/7 Supervision',
    hostName: 'Vikramjit Singh',
    experience: '8+ Years Boarding',
    verified: true,
    rating: 5.0,
    reviews: 168,
    petTypes: ['Dogs'],
    state: 'Delhi',
    city: 'Delhi',
    area: 'Chattarpur Farms & Mehrauli',
    stayType: 'Farmhouse Resort with Agility Ground',
    pricePerNight: 1200,
    discountPrice: 999,
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=800',
    phone: '8306688827',
    amenities: ['AC Suites', '24/7 CCTV Live Stream', 'Outdoor Lawn & Play Area', 'Vet On Call', 'Pet Pool / Splash Zone', 'Customized Meals'],
    packages: [
      { name: 'Farm Play & Stay Pass', price: 999, desc: 'Private enclosure, 2 hours supervised lawn play, splash pool & organic diet' },
      { name: 'VIP Executive Stay', price: 1699, desc: 'Private indoor suite, agility session, personal handler & daily WhatsApp videos' }
    ]
  },
  {
    id: 'HST-204',
    name: 'Snuggle Paws Cat & Dog Boarding',
    tagline: 'Quiet Cat Condos & Sound-Insulated Dog Suites',
    hostName: 'Dr. Shruti Iyer (Veterinarian Host)',
    experience: '5+ Years Boarding',
    verified: true,
    rating: 4.8,
    reviews: 92,
    petTypes: ['Dogs', 'Cats'],
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Gachibowli & Madhapur',
    stayType: 'Vet-Supervised Boarding',
    pricePerNight: 650,
    discountPrice: 499,
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?q=80&w=800',
    phone: '8306688827',
    amenities: ['AC Suites', 'Vet On Call', 'Daily Video Updates', 'Customized Meals'],
    packages: [
      { name: 'Cat Condo / Small Dog Suite', price: 499, desc: 'Multi-level cat climbing condo or cozy dog pen, vet checkup included' },
      { name: 'Medical / Senior Pet Boarding', price: 799, desc: 'Special geriatric care, medicine administration & 24/7 vet monitoring' }
    ]
  },
  {
    id: 'HST-205',
    name: 'Green Meadows Pet Paradise',
    tagline: 'Spacious Eco-Cottages, Herbal Tick Dip & Safe Socializing',
    hostName: 'Anand & Radhika',
    experience: '7+ Years Boarding',
    verified: true,
    rating: 4.9,
    reviews: 145,
    petTypes: ['Dogs', 'Cats'],
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'ECR & Neelankarai',
    stayType: 'Beachside Eco Cottages',
    pricePerNight: 1100,
    discountPrice: 899,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800',
    phone: '8306688827',
    amenities: ['AC Suites', 'Outdoor Lawn & Play Area', '24/7 CCTV Live Stream', 'Daily Video Updates', 'Customized Meals'],
    packages: [
      { name: 'Cottage Comfort Stay', price: 899, desc: 'Eco friendly breezy cottage, beach breeze walks, customized menu' },
      { name: 'Holiday Deluxe Care', price: 1499, desc: 'Full AC room, grooming bath on last day, 24/7 video monitoring' }
    ]
  },
  {
    id: 'HST-206',
    name: 'Urban Pet Haven Boarding House',
    tagline: 'Budget-Friendly, Clean & Caring Neighborhood Hostel',
    hostName: 'Sanjay Kulkarni',
    experience: '4+ Years Boarding',
    verified: true,
    rating: 4.7,
    reviews: 78,
    petTypes: ['Dogs', 'Cats'],
    state: 'Maharashtra',
    city: 'Pune',
    area: 'Kothrud & Baner',
    stayType: 'Homely Boarding',
    pricePerNight: 450,
    discountPrice: 380,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
    phone: '8306688827',
    amenities: ['Daily Video Updates', 'Customized Meals', 'Vet On Call'],
    packages: [
      { name: 'Budget Essential Boarding', price: 380, desc: 'Clean bedding, 3 daily meals, morning & evening walk, photo updates' }
    ]
  }
];

const STORAGE_KEY_HOSTELS = 'pawora_hostel_providers_v1';
const STORAGE_KEY_HOSTEL_BOOKINGS = 'pawora_hostel_bookings_v1';

export const getStoredHostelProviders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_HOSTELS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse hostel providers from storage', e);
  }
  return INITIAL_HOSTEL_PROVIDERS;
};

export const saveHostelBooking = (bookingData) => {
  try {
    const existing = getStoredHostelBookings();
    const updated = [bookingData, ...existing];
    localStorage.setItem(STORAGE_KEY_HOSTEL_BOOKINGS, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save hostel booking', e);
    return false;
  }
};

export const getStoredHostelBookings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_HOSTEL_BOOKINGS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load hostel bookings', e);
  }
  return [];
};
