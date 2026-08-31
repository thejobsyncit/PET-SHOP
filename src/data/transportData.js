// Pet Transport & Relocation Dataset, Offerings & Persistent Storage Helpers

export const TRANSPORT_MODES = [
  {
    id: 'road',
    name: 'Road Transport',
    subtitle: 'Private AC Pet Cabs & Interstate Vans',
    icon: '🚐',
    badge: 'Doorstep Pickup',
    desc: 'Fully climate-controlled vehicles with non-slip flooring, double ventilation, sanitized kennels, and scheduled hydration & walking stops every 3 hours.',
    features: ['100% AC Temperature Controlled', 'Live GPS Tracking & Dashcam', 'Certified Pet Handler Onboard', 'Hydration & Food Schedule', 'Sanitized IATA Kennels'],
    idealFor: 'Intra-city pet taxi, short to medium inter-state relocations (up to 1,200 km).'
  },
  {
    id: 'rail',
    name: 'Rail Transport',
    subtitle: 'Indian Railways 1st AC Coupé / Guard Van Escort',
    icon: '🚆',
    badge: 'Budget Long-Distance',
    desc: 'Dedicated railway escort in 1st AC 2-berth / 4-berth coupés with official Indian Railways pet booking paperwork, veterinary fitness clearance, and attendant care.',
    features: ['Confirmed 1st AC Coupé Allocation Support', 'Official IRCTC Luggage Office Clearance', 'Station Escort & Porter Handling', 'Vet Health & Fit-to-Travel Paperwork', 'Regular Feeding & Waste Management'],
    idealFor: 'Long-haul inter-state journeys across India (1,000+ km) with minimal motion stress.'
  },
  {
    id: 'air',
    name: 'Air Transport',
    subtitle: 'IATA Compliant Cabin & Cargo Flight Relocation',
    icon: '✈️',
    badge: 'Fastest Travel',
    desc: 'Domestic & International flight relocations following strict IATA Live Animals Regulations (LAR), temperature-controlled pressurized cargo holds, and customs clearance.',
    features: ['IATA Approved Flight Crates Provided', 'Airport Cargo Clearance Assistance', 'Pet Aviation Passport & Health Certificate', 'Priority Boarding & Handover', 'Real-time Flight Status Alerts'],
    idealFor: 'Urgent moves, long-distance domestic relocations (e.g. Delhi to Bangalore in 3 hrs), and international transfers.'
  },
  {
    id: 'ship',
    name: 'Ship / Sea Transport',
    subtitle: 'Ferry & Coastal Pet Relocation',
    icon: '🚢',
    badge: 'Coastal & Island Routes',
    desc: 'Safe coastal and island pet passage (e.g., Mumbai–Goa, mainland to Andaman & Lakshadweep) with shaded deck spaces, sea-sickness monitoring, and private cabins.',
    features: ['Sea-Sickness & Hydration Support', 'Dedicated Shaded Pet Cabin Space', 'Harbor Clearance & Port Authority Paperwork', 'Life Vests for Canines', 'Constant Attendant Supervision'],
    idealFor: 'Coastal travel, island transfers, and scenic stress-free relocations.'
  }
];

export const TRANSPORT_STEPS = [
  {
    step: 'STEP 01',
    title: 'Fill Up the Data',
    desc: 'Tell us about your beloved pet, travel origin, destination, preferred dates, and specific comfort requirements by filling out our quick relocation form.',
    icon: '📋',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800'
  },
  {
    step: 'STEP 02',
    title: 'Prepare the Movement',
    desc: 'Our pet relocation coordinator connects with you to design a customized travel plan, crate sizing, vehicle sanitization, and route timeline.',
    icon: '⏱️',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'
  },
  {
    step: 'STEP 03',
    title: 'Start the Paperwork',
    desc: 'We handle all necessary vet health certifications, vaccination verifications, fit-to-travel permits, and airline/railway authority clearances.',
    icon: '📑',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=800'
  },
  {
    step: 'STEP 04',
    title: 'Smooth Delivery',
    desc: 'From doorstep pickup in sanitized climate-controlled vehicles to real-time GPS tracking and safe doorstep delivery with happy reunions.',
    icon: '🚚',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800'
  }
];

export const INITIAL_TRANSPORT_PROVIDERS = [
  {
    id: 'TRP-101',
    name: 'Pawora Air & Road Pet Relocators',
    tagline: 'Pan-India IATA Certified Air & Road Doorstep Pet Relocation',
    leadCoordinator: 'Capt. Rajesh Sharma (Ex-Aviation Pet Safety Officer)',
    experience: '11+ Years Experience',
    verified: true,
    iataCertified: true,
    rating: 4.95,
    reviews: 342,
    deliveredCount: 4200,
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Andheri East (Airport Hub) & Bandra',
    coverage: 'Pan-India & Global Relocations',
    corridors: ['Mumbai ⇄ Delhi', 'Mumbai ⇄ Bangalore', 'Mumbai ⇄ Goa', 'Pan-India Flights'],
    petTypes: ['Dogs', 'Cats', 'Birds', 'Fish', 'Small Animals'],
    modes: ['Road Transport', 'Air Transport', 'Rail Transport'],
    basePrice: 1499,
    pricePerKm: 28,
    interstateMin: 8500,
    vehicleTypes: ['AC Pet Ambulance & Van', 'IATA Flight Hold', 'Private 1st AC Train Coupé'],
    amenities: ['100% Climate Controlled AC', 'Live WhatsApp & GPS Tracking', 'Vet Onboard Available', 'IATA Approved Crate Included', 'Doorstep Pickup & Drop', 'Hydration Stops Every 3 Hrs'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-101-1',
        name: 'City Pet Cab (Doorstep AC Taxi)',
        price: 1499,
        ratePerKm: 25,
        desc: 'Local doorstep transport within city limits with sanitized partition, AC comfort, and gentle driver handler.'
      },
      {
        id: 'pkg-trp-101-2',
        name: 'Express Inter-State Relocation Van',
        price: 12500,
        ratePerKm: 28,
        desc: 'Private direct road journey with dual drivers, live GPS link, custom bedding, rest breaks, and continuous photo updates.'
      },
      {
        id: 'pkg-trp-101-3',
        name: 'Priority Domestic Flight Escort',
        price: 18500,
        ratePerKm: 0,
        desc: 'Airport check-in assistance, pressurized temperature-regulated cargo or cabin booking, vet clearance & doorstep delivery.'
      }
    ]
  },
  {
    id: 'TRP-102',
    name: 'SafePaws India Pet Transit Hub',
    tagline: 'Specialized 1st AC Rail & Express AC Van Corridors',
    leadCoordinator: 'Ananya Deshmukh (Certified Animal Behaviorist)',
    experience: '8+ Years Experience',
    verified: true,
    iataCertified: false,
    rating: 4.88,
    reviews: 215,
    deliveredCount: 2800,
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Indiranagar & Airport Road',
    coverage: 'South & Central India Corridors',
    corridors: ['Bangalore ⇄ Chennai', 'Bangalore ⇄ Hyderabad', 'Bangalore ⇄ Kochi', 'Bangalore ⇄ Pune'],
    petTypes: ['Dogs', 'Cats'],
    modes: ['Road Transport', 'Rail Transport'],
    basePrice: 1200,
    pricePerKm: 24,
    interstateMin: 7200,
    vehicleTypes: ['Custom AC Transit Scorpio/Innova', '1st AC Indian Railways Coupé'],
    amenities: ['100% Climate Controlled AC', 'Live GPS Tracking', 'Attendant Escort', 'Sanitized Bedding & Kennels', 'Doorstep Pickup & Drop'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-102-1',
        name: 'Bangalore City Pet Shuttle',
        price: 1200,
        ratePerKm: 22,
        desc: 'Safe inter-neighborhood transport for vet visits, grooming sessions, or boarding.'
      },
      {
        id: 'pkg-trp-102-2',
        name: 'South Corridor Express Road Transit',
        price: 9800,
        ratePerKm: 24,
        desc: 'Dedicated AC car for routes like Bangalore to Chennai/Hyderabad with live location sharing and rest stops.'
      },
      {
        id: 'pkg-trp-102-3',
        name: 'First AC Train Companion Escort',
        price: 11500,
        ratePerKm: 0,
        desc: 'Official 1st AC train paperwork, attendant accompaniment throughout journey, and station reception.'
      }
    ]
  },
  {
    id: 'TRP-103',
    name: 'Capital Pet Express & Aviation Logistics',
    tagline: 'North India Relocation Specialists & International Pet Passport Assistance',
    leadCoordinator: 'Vikramaditya Malik (IATA Live Animals Specialist)',
    experience: '14+ Years Experience',
    verified: true,
    iataCertified: true,
    rating: 4.92,
    reviews: 410,
    deliveredCount: 5600,
    state: 'Delhi',
    city: 'Delhi',
    area: 'IGI Airport Aerocity & South Delhi',
    coverage: 'North India & Pan-India Air Corridors',
    corridors: ['Delhi ⇄ Mumbai', 'Delhi ⇄ Kolkata', 'Delhi ⇄ Chandigarh', 'Delhi ⇄ Jaipur', 'Global Exports'],
    petTypes: ['Dogs', 'Cats', 'Birds', 'Fish', 'Reptiles', 'Small Animals'],
    modes: ['Air Transport', 'Road Transport', 'Rail Transport'],
    basePrice: 1799,
    pricePerKm: 30,
    interstateMin: 9500,
    vehicleTypes: ['Aviation Grade Climate Vans', 'Commercial Air Cargo Regulated', 'Private Coupés'],
    amenities: ['IATA Approved Flight Crates Provided', '24/7 Veterinary On-Call', 'Full Customs & Health Cert Paperwork', 'Live Video Calls with Pet Parent', 'Doorstep Delivery'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-103-1',
        name: 'NCR Metro Pet Taxi',
        price: 1799,
        ratePerKm: 28,
        desc: 'Doorstep pickup across Delhi, Gurgaon, Noida, and Faridabad in sanitized AC vehicles.'
      },
      {
        id: 'pkg-trp-103-2',
        name: 'Pan-India Domestic Air Express',
        price: 19500,
        ratePerKm: 0,
        desc: 'Fastest transit across metro cities with IATA crate, health check, airline check-in, and airport clearance.'
      },
      {
        id: 'pkg-trp-103-3',
        name: 'Golden Triangle Highway Pet Cruiser',
        price: 8500,
        ratePerKm: 30,
        desc: 'Dedicated private vehicle for Delhi-Jaipur-Agra-Chandigarh with pet rest stops.'
      }
    ]
  },
  {
    id: 'TRP-104',
    name: 'Coastal Tails Ferry & Road Shippers',
    tagline: 'Specialized in West Coast, Goa, & Island Pet Passage',
    leadCoordinator: 'Capt. Sunil Fernandez (Maritime & Road Pet Transporter)',
    experience: '9+ Years Experience',
    verified: true,
    iataCertified: false,
    rating: 4.85,
    reviews: 168,
    deliveredCount: 1950,
    state: 'Goa',
    city: 'Panaji',
    area: 'Panaji Harbor & Margao',
    coverage: 'Konkan Coast, Goa, Mumbai, Mangalore & Andaman Ferry',
    corridors: ['Mumbai ⇄ Goa Ferry & Road', 'Goa ⇄ Bangalore', 'Chennai ⇄ Port Blair Ferry'],
    petTypes: ['Dogs', 'Cats', 'Fish', 'Small Animals'],
    modes: ['Road Transport', 'Ship Transport'],
    basePrice: 1100,
    pricePerKm: 22,
    interstateMin: 6500,
    vehicleTypes: ['Coastal AC SUVs', 'Ro-Ro Ship Pet Enclosure', 'Ferry Private Cabin'],
    amenities: ['Sea-Sickness Monitoring', 'Life Jackets for Dogs', 'Shaded Deck Cabins', 'Live WhatsApp Updates', 'Sanitized Kennels'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-104-1',
        name: 'Goa Coastal Cab & Beach Transit',
        price: 1100,
        ratePerKm: 22,
        desc: 'Local transit across North and South Goa in pet-friendly vehicles.'
      },
      {
        id: 'pkg-trp-104-2',
        name: 'Mumbai–Goa Scenic Road & Ferry Relay',
        price: 13500,
        ratePerKm: 25,
        desc: 'Relaxed journey with coastal breeze stops, pet hydration, and seamless home drop.'
      }
    ]
  },
  {
    id: 'TRP-105',
    name: 'Telangana Pet Movers & Rail Escorts',
    tagline: 'Reliable South-Central Train Coupé & AC Highway Transfers',
    leadCoordinator: 'K. Venkatesh (Certified Animal Transportation Handler)',
    experience: '7+ Years Experience',
    verified: true,
    iataCertified: false,
    rating: 4.80,
    reviews: 154,
    deliveredCount: 1700,
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Banjara Hills & Secunderabad Railway Hub',
    coverage: 'Telangana, Andhra Pradesh, Maharashtra & Karnataka',
    corridors: ['Hyderabad ⇄ Bangalore', 'Hyderabad ⇄ Mumbai', 'Hyderabad ⇄ Vijayawada', 'Hyderabad ⇄ Chennai'],
    petTypes: ['Dogs', 'Cats', 'Birds'],
    modes: ['Road Transport', 'Rail Transport'],
    basePrice: 1150,
    pricePerKm: 23,
    interstateMin: 6800,
    vehicleTypes: ['Custom AC Relocation Van', '1st AC Train Coupé Companion'],
    amenities: ['100% Climate Controlled', 'Live Location Sharing', 'Trained Handler Companion', 'Sanitized Bedding', 'Scheduled Food/Water'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-105-1',
        name: 'Hyderabad City Pet Taxi',
        price: 1150,
        ratePerKm: 20,
        desc: 'Safe transit within twin cities Hyderabad & Secunderabad.'
      },
      {
        id: 'pkg-trp-105-2',
        name: 'First AC Train Escort to Bangalore/Mumbai',
        price: 9900,
        ratePerKm: 0,
        desc: 'Confirmed coupé travel assistance with personal attendant caring for the pet.'
      }
    ]
  },
  {
    id: 'TRP-106',
    name: 'Eastern Paws Intercity Transporters',
    tagline: 'Kolkata, East & North-East India Pet Relocation Network',
    leadCoordinator: 'Debasish Banerjee (Veterinary Assistant & Transporter)',
    experience: '10+ Years Experience',
    verified: true,
    iataCertified: true,
    rating: 4.87,
    reviews: 192,
    deliveredCount: 2300,
    state: 'West Bengal',
    city: 'Kolkata',
    area: 'Salt Lake & Dum Dum Airport',
    coverage: 'East India, North-East Corridors & Pan-India Air',
    corridors: ['Kolkata ⇄ Delhi', 'Kolkata ⇄ Guwahati', 'Kolkata ⇄ Bhubaneswar', 'Kolkata ⇄ Patna'],
    petTypes: ['Dogs', 'Cats', 'Birds', 'Small Animals'],
    modes: ['Road Transport', 'Air Transport', 'Rail Transport'],
    basePrice: 1300,
    pricePerKm: 26,
    interstateMin: 7800,
    vehicleTypes: ['AC Pet Carrier Van', 'Air Cargo Compliant', 'Howrah 1st AC Rail Coupé'],
    amenities: ['Vet Check on Departure', 'Climate Controlled', 'Live WhatsApp Updates', 'Free Crate Sanitization', 'Food & Hydration Care'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-106-1',
        name: 'Kolkata Metro Pet Shuttle',
        price: 1300,
        ratePerKm: 24,
        desc: 'Comfortable city ride for your pets with experienced animal drivers.'
      },
      {
        id: 'pkg-trp-106-2',
        name: 'North-East Express Relocation',
        price: 16500,
        ratePerKm: 28,
        desc: 'Specialized highway journey to Siliguri, Assam, and Meghalaya with mountain-ready vans.'
      }
    ]
  },
  {
    id: 'TRP-107',
    name: 'Southern Express Pet Air & Roadline',
    tagline: 'Tamil Nadu & Kerala Premier Relocation Specialists',
    leadCoordinator: 'R. Senthil Nathan (Licensed Pet Transport Escort)',
    experience: '8+ Years Experience',
    verified: true,
    iataCertified: true,
    rating: 4.89,
    reviews: 230,
    deliveredCount: 3100,
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Nungambakkam & Meenambakkam Hub',
    coverage: 'Tamil Nadu, Kerala, Andhra Pradesh & Pan-India Flights',
    corridors: ['Chennai ⇄ Bangalore', 'Chennai ⇄ Coimbatore', 'Chennai ⇄ Kochi', 'Chennai ⇄ Delhi Flights'],
    petTypes: ['Dogs', 'Cats'],
    modes: ['Road Transport', 'Air Transport', 'Rail Transport'],
    basePrice: 1250,
    pricePerKm: 25,
    interstateMin: 7500,
    vehicleTypes: ['AC Innova / Force Pet Cruiser', 'IATA Air Crates', '1st AC Train Escorts'],
    amenities: ['100% AC Climate Control', 'Live GPS Tracking', 'Attendant Feeding Support', 'IATA Flight Crates', 'Doorstep Pickup & Drop'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-107-1',
        name: 'Chennai Doorstep Pet Cab',
        price: 1250,
        ratePerKm: 22,
        desc: 'Smooth and sanitized local transfers with gentle handling.'
      },
      {
        id: 'pkg-trp-107-2',
        name: 'Chennai ⇄ Bangalore Highway Express',
        price: 8200,
        ratePerKm: 24,
        desc: 'Direct same-day highway relocation in private air-conditioned vehicle.'
      }
    ]
  },
  {
    id: 'TRP-108',
    name: 'Royal Gujarat & Rajasthan Pet Relocations',
    tagline: 'Western India Direct Highway Vans & Interstate Air Transfers',
    leadCoordinator: 'Harshvardhan Jadeja (Pet Transportation Specialist)',
    experience: '6+ Years Experience',
    verified: true,
    iataCertified: false,
    rating: 4.82,
    reviews: 145,
    deliveredCount: 1600,
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'SG Highway & Airport Road',
    coverage: 'Gujarat, Rajasthan, Maharashtra & Pan-India',
    corridors: ['Ahmedabad ⇄ Mumbai', 'Ahmedabad ⇄ Jaipur', 'Ahmedabad ⇄ Pune', 'Ahmedabad ⇄ Delhi'],
    petTypes: ['Dogs', 'Cats', 'Birds', 'Small Animals'],
    modes: ['Road Transport', 'Air Transport'],
    basePrice: 1100,
    pricePerKm: 24,
    interstateMin: 6900,
    vehicleTypes: ['AC Multi-Utility Vans', 'IATA Air Crates'],
    amenities: ['100% Climate Control', 'Live Location Updates', 'Sanitized Crates', 'Food & Hydration Care', 'Emergency Vet Network'],
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800',
    packages: [
      {
        id: 'pkg-trp-108-1',
        name: 'Ahmedabad City Pet Cab',
        price: 1100,
        ratePerKm: 20,
        desc: 'Comfortable local transit for veterinary visits and grooming appointments.'
      },
      {
        id: 'pkg-trp-108-2',
        name: 'Gujarat ⇄ Mumbai Highway Pet Cruiser',
        price: 9500,
        ratePerKm: 24,
        desc: 'Private air-conditioned highway transfer with rest and water stops.'
      }
    ]
  }
];

// Persistent LocalStorage Helpers

export const getStoredTransportProviders = () => {
  try {
    const data = localStorage.getItem('pawora_transport_providers');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_e) {}
  return INITIAL_TRANSPORT_PROVIDERS;
};

export const saveStoredTransportProviders = (providers) => {
  try {
    localStorage.setItem('pawora_transport_providers', JSON.stringify(providers));
  } catch (_e) {}
};

// Bookings
export const getStoredTransportBookings = () => {
  try {
    const data = localStorage.getItem('pawora_transport_bookings');
    if (data) return JSON.parse(data);
  } catch (_e) {}
  return [];
};

export const saveTransportBooking = (bookingData) => {
  try {
    const current = getStoredTransportBookings();
    current.unshift(bookingData);
    localStorage.setItem('pawora_transport_bookings', JSON.stringify(current));
    
    // Also dispatch an event for any listener
    window.dispatchEvent(new CustomEvent('transport-booking-created', { detail: bookingData }));
    return true;
  } catch (_e) {
    return false;
  }
};

// Enquiries
export const INITIAL_DEMO_ENQUIRIES = [
  {
    id: 'ENQ-TRP-901',
    providerId: 'TRP-101',
    providerName: 'Pawora Air & Road Pet Relocators',
    userId: 'usr-demo-01',
    userName: 'Riya Sen',
    userEmail: 'riya.sen@example.com',
    userPhone: '+91 98201 12345',
    relocationType: 'Inter-State Relocation',
    departureState: 'Maharashtra',
    departureCity: 'Mumbai',
    destinationState: 'Delhi',
    destinationCity: 'Delhi',
    expectedDate: '2026-09-15',
    preferredModes: ['Air Transport', 'Private Car'],
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    petGender: 'Male',
    petAge: '3 Years',
    vaccinationStatus: 'Fully Vaccinated & Up to Date',
    travelFriendly: 'Yes, Very Friendly',
    note: 'Needs a large IATA compliant crate. Please arrange doorstep pickup from Bandra West and direct handover in South Delhi.',
    status: 'Quote Sent',
    quoteAmount: 18500,
    providerReply: 'Hello Riya! We can arrange priority direct air cargo with an IATA-400 crate and vet health check. Doorstep pickup at 8 AM in Bandra included.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ENQ-TRP-902',
    providerId: 'TRP-102',
    providerName: 'SafePaws India Pet Transit Hub',
    userId: 'usr-demo-02',
    userName: 'Anand Kulkarni',
    userEmail: 'anand.k@example.com',
    userPhone: '+91 98450 78901',
    relocationType: 'Inter-State Relocation',
    departureState: 'Karnataka',
    departureCity: 'Bangalore',
    destinationState: 'Tamil Nadu',
    destinationCity: 'Chennai',
    expectedDate: '2026-09-10',
    preferredModes: ['Train / Rail', 'Private Car'],
    petSpecies: 'Cat',
    petBreed: 'Persian Cat',
    petGender: 'Female',
    petAge: '2 Years',
    vaccinationStatus: 'Fully Vaccinated & Up to Date',
    travelFriendly: 'Anxious / Needs Extra Care',
    note: 'She is sensitive to loud sounds. Please provide climate-controlled transport and calming spray.',
    status: 'Under Review',
    quoteAmount: null,
    providerReply: null,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

export const getStoredTransportEnquiries = () => {
  try {
    const data = localStorage.getItem('pawora_transport_enquiries');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_e) {}
  return INITIAL_DEMO_ENQUIRIES;
};

export const saveStoredTransportEnquiries = (enquiries) => {
  try {
    localStorage.setItem('pawora_transport_enquiries', JSON.stringify(enquiries));
  } catch (_e) {}
};

export const saveTransportEnquiry = (enquiryData) => {
  try {
    const current = getStoredTransportEnquiries();
    const newEnquiry = {
      id: 'ENQ-TRP-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Submitted / Pending Review',
      quoteAmount: null,
      providerReply: null,
      ...enquiryData
    };
    current.unshift(newEnquiry);
    saveStoredTransportEnquiries(current);
    window.dispatchEvent(new CustomEvent('transport-enquiry-created', { detail: newEnquiry }));
    return newEnquiry;
  } catch (_e) {
    return null;
  }
};

export const updateTransportEnquiryStatus = (enquiryId, status, providerReply = null, quoteAmount = null) => {
  try {
    const current = getStoredTransportEnquiries();
    const idx = current.findIndex(e => e.id === enquiryId);
    if (idx !== -1) {
      current[idx].status = status;
      current[idx].updatedAt = new Date().toISOString();
      if (providerReply !== null) current[idx].providerReply = providerReply;
      if (quoteAmount !== null) current[idx].quoteAmount = quoteAmount;
      saveStoredTransportEnquiries(current);
      window.dispatchEvent(new CustomEvent('transport-enquiry-updated', { detail: current[idx] }));
      return current[idx];
    }
  } catch (_e) {}
  return null;
};

export const getUserTransportEnquiries = (user) => {
  const current = getStoredTransportEnquiries();
  if (!user) return [];
  return current.filter(e => 
    e.userId === user.id || 
    e.userId === user._id || 
    e.userEmail?.toLowerCase() === user.email?.toLowerCase() ||
    e.userPhone === user.mobile
  );
};

export const getProviderTransportEnquiries = (providerIdOrName) => {
  const current = getStoredTransportEnquiries();
  if (!providerIdOrName) return current;
  return current.filter(e => 
    e.providerId === providerIdOrName || 
    (e.providerName && providerIdOrName && e.providerName.toLowerCase().includes(providerIdOrName.toLowerCase().split(' ')[0]))
  );
};
