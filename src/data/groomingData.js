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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    phone: '9876543210',
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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    phone: '9876543210',
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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    phone: '9876543210',
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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    phone: '9876543210',
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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    phone: '9876543210',
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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    phone: '9876543210',
    offerings: ['Spa Bath', 'Nail Clipping', 'Medical Bath', 'Anti-Tick Treatment'],
    packages: [
      { name: 'Pocket-Friendly Puppy Bath', price: 399, duration: '35 mins', desc: 'Tearless shampoo, warm blow dry, nail cut & ear wipe' },
      { name: 'Tick Defense & Bath Combo', price: 749, duration: '55 mins', desc: 'Anti-parasite wash, full coat brushing & lavender scent' }
    ]
  }
];

const STORAGE_KEY_PROVIDERS = 'joshpetshub_grooming_providers_v1';
const STORAGE_KEY_BOOKINGS = 'joshpetshub_grooming_bookings_v1';

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

export const DEFAULT_GROOMING_SCHEDULE = {
  acceptingWalkIns: true,
  days: {
    Monday: { isOpen: true, start: '10:00', end: '20:00' },
    Tuesday: { isOpen: true, start: '10:00', end: '20:00' },
    Wednesday: { isOpen: true, start: '10:00', end: '20:00' },
    Thursday: { isOpen: true, start: '10:00', end: '20:00' },
    Friday: { isOpen: true, start: '10:00', end: '20:00' },
    Saturday: { isOpen: true, start: '09:00', end: '21:00' },
    Sunday: { isOpen: false, start: '10:00', end: '18:00' },
  }
};

export const sanitizeGroomingSchedule = (raw) => {
  if (!raw || typeof raw !== 'object') return DEFAULT_GROOMING_SCHEDULE;
  const acceptingWalkIns = raw.acceptingWalkIns !== false;
  const mergedDays = { ...DEFAULT_GROOMING_SCHEDULE.days };
  if (raw.days && typeof raw.days === 'object') {
    Object.keys(DEFAULT_GROOMING_SCHEDULE.days).forEach(day => {
      if (raw.days[day]) {
        mergedDays[day] = {
          isOpen: Boolean(raw.days[day].isOpen),
          start: raw.days[day].start || DEFAULT_GROOMING_SCHEDULE.days[day].start,
          end: raw.days[day].end || DEFAULT_GROOMING_SCHEDULE.days[day].end
        };
      }
    });
  }
  return { acceptingWalkIns, days: mergedDays };
};

export const getStoredGroomingSchedule = (user = null) => {
  const emailKey = (user?.email || '').toLowerCase().trim();
  const userKey = user?._id
    ? 'joshpetshub_grooming_schedule_' + user._id
    : emailKey
      ? 'joshpetshub_grooming_schedule_' + emailKey
      : null;

  try {
    if (userKey) {
      const userSaved = localStorage.getItem(userKey);
      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        if (parsed && parsed.days) return sanitizeGroomingSchedule(parsed);
      }
    }

    if (user?.groomingSchedule && user.groomingSchedule.days) {
      return sanitizeGroomingSchedule(user.groomingSchedule);
    }
    if (user?.schedule && user.schedule.days) {
      return sanitizeGroomingSchedule(user.schedule);
    }

    if (emailKey) {
      const byEmail = localStorage.getItem('joshpetshub_grooming_schedule_' + emailKey);
      if (byEmail) {
        const parsed = JSON.parse(byEmail);
        if (parsed && parsed.days) return sanitizeGroomingSchedule(parsed);
      }
    }

    const velvetSaved = localStorage.getItem('velvet_grooming_schedule');
    if (velvetSaved) {
      const parsed = JSON.parse(velvetSaved);
      if (parsed && parsed.days) return sanitizeGroomingSchedule(parsed);
    }

    if (emailKey) {
      const regUsers = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      const matched = regUsers.find(u => u.email && u.email.toLowerCase() === emailKey);
      if (matched?.groomingSchedule && matched.groomingSchedule.days) {
        return sanitizeGroomingSchedule(matched.groomingSchedule);
      }
    }
  } catch (e) {
    console.warn('Failed to load stored grooming schedule:', e);
  }

  return DEFAULT_GROOMING_SCHEDULE;
};

export const saveGroomingSchedule = (schedule, user = null) => {
  try {
    const emailKey = (user?.email || 'velvetfur@joshpetshub.com').toLowerCase().trim();
    const sanitized = sanitizeGroomingSchedule(schedule);
    const jsonStr = JSON.stringify(sanitized);

    localStorage.setItem('velvet_grooming_schedule', jsonStr);
    if (emailKey) {
      localStorage.setItem('joshpetshub_grooming_schedule_' + emailKey, jsonStr);
    }
    if (user?._id) {
      localStorage.setItem('joshpetshub_grooming_schedule_' + user._id, jsonStr);
    }

    try {
      const regUsers = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      const idx = regUsers.findIndex(u => (u.email && u.email.toLowerCase() === emailKey) || (user?._id && u._id === user._id));
      if (idx !== -1) {
        regUsers[idx] = { ...regUsers[idx], groomingSchedule: sanitized };
        localStorage.setItem('joshpetshub_registered_users', JSON.stringify(regUsers));
      }
    } catch (_) {}

    return sanitized;
  } catch (e) {
    console.warn('Failed to save grooming schedule:', e);
    return schedule;
  }
};

