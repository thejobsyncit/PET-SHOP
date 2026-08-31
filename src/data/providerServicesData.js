/**
 * Provider Services & Bookings Dataset & Local Storage Helpers
 * Enables full offline / demo state persistence for the Service Provider Dashboard.
 */

// Available Service Categories for Provider Dashboard
export const SERVICE_CATEGORIES = [
  { id: 'Veterinary', name: 'Veterinary & Healthcare', icon: '🩺', color: 'emerald' },
  { id: 'Grooming', name: 'Pet Grooming & Spa', icon: '✂️', color: 'sky' },
  { id: 'Hostel', name: 'Pet Hostel & Boarding', icon: '🏨', color: 'amber' },
  { id: 'Walking', name: 'Dog Walking & Fitness', icon: '🐾', color: 'indigo' },
  { id: 'Training', name: 'Pet Training & Behavior', icon: '🎓', color: 'purple' },
  { id: 'Transport', name: 'Pet Taxi & Relocation', icon: '🚐', color: 'rose' },
  { id: 'Insurance', name: 'Pet Health Insurance', icon: '🛡️', color: 'teal' },
  { id: 'Breeding', name: 'Breeding & Stud Services', icon: '🧬', color: 'pink' },
  { id: 'Daycare', name: 'Pet Daycare & Sitting', icon: '🏡', color: 'amber' }
];

export const SERVICE_MODES = [
  'Clinic / Facility',
  'Home Visit / Doorstep',
  'Online Consultation',
  'Hybrid'
];

export const PET_SPECIES_OPTIONS = ['Dogs', 'Cats', 'Birds', 'Reptiles', 'Fish', 'Small Pets'];

// Demo Service Provider Personas for quick testing
export const DEMO_PROVIDER_PERSONAS = [
  {
    id: 'prov-vet-01',
    name: 'Dr. Ramesh Kumar',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Veterinary',
    title: 'Chief Veterinary Surgeon (B.V.Sc & A.H, M.V.Sc)',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    experience: '12+ Years Clinical Practice',
    rating: 4.9,
    reviewsCount: 142,
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    email: 'dr.ramesh@pawora.com',
    location: 'MG Road, Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    area: 'MG Road & Central',
    pincode: '560001',
    bio: 'Dedicated small animal physician and orthopedic surgeon passionate about preventative health, nutrition, and compassionate pet care.',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200',
    isOnline: true,
    acceptingEmergency: true,
    operatingHours: {
      Monday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Tuesday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Wednesday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Thursday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Friday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Saturday: { open: '09:00 AM', close: '06:00 PM', active: true },
      Sunday: { open: '10:00 AM', close: '02:00 PM', active: true }
    },
    amenities: ['Digital X-Ray', 'In-House Blood Lab', 'Surgical OT', 'Pharmacy On-Site', 'Emergency Oxygen', 'AC Waiting Lounge']
  },
  {
    id: 'prov-groom-02',
    name: 'Velvet Fur Spa Studio',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Grooming',
    title: 'Certified Master Pet Stylist & Spa Specialist',
    clinicName: 'Velvet Fur Luxury Grooming Studio',
    experience: '8+ Years Styling',
    rating: 4.95,
    reviewsCount: 198,
    phone: '+91 98450 11223',
    whatsapp: '+91 98450 11223',
    email: 'velvetfur@pawora.com',
    location: 'Koramangala 4th Block, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    area: 'Koramangala',
    pincode: '560034',
    bio: 'Award-winning pet salon offering stress-free organic hydro-baths, breed-standard haircuts, coat de-matting, and relaxing paw-dicures.',
    avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200',
    isOnline: true,
    acceptingEmergency: false,
    operatingHours: {
      Monday: { open: '10:00 AM', close: '07:30 PM', active: true },
      Tuesday: { open: '10:00 AM', close: '07:30 PM', active: true },
      Wednesday: { open: '10:00 AM', close: '07:30 PM', active: true },
      Thursday: { open: '10:00 AM', close: '07:30 PM', active: true },
      Friday: { open: '10:00 AM', close: '08:00 PM', active: true },
      Saturday: { open: '09:30 AM', close: '08:30 PM', active: true },
      Sunday: { open: '09:30 AM', close: '08:30 PM', active: true }
    },
    amenities: ['Hydro-Bath Tub', 'Aromatherapy Diffusers', 'Quiet Blow Dryers', 'Organic Herbal Shampoos', 'CCTV Waiting Area']
  },
  {
    id: 'prov-hostel-03',
    name: 'Happy Paws Pet Resort',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Hostel',
    title: 'Luxury 5-Star Pet Hotel & Cage-Free Boarding',
    clinicName: 'Happy Paws Luxury Pet Boarding & Daycare',
    experience: '10+ Years Boarding',
    rating: 4.88,
    reviewsCount: 220,
    phone: '+91 97312 99881',
    whatsapp: '+91 97312 99881',
    email: 'happypaws@pawora.com',
    location: 'Sarjapur Road, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    area: 'Sarjapur',
    pincode: '560035',
    bio: 'Spacious 2-acre green resort with temperature-controlled private suites, swimming splash pool, 24/7 live CCTV access for parents, and freshly cooked meals.',
    avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1200',
    isOnline: true,
    acceptingEmergency: true,
    operatingHours: {
      Monday: { open: '07:00 AM', close: '09:00 PM', active: true },
      Tuesday: { open: '07:00 AM', close: '09:00 PM', active: true },
      Wednesday: { open: '07:00 AM', close: '09:00 PM', active: true },
      Thursday: { open: '07:00 AM', close: '09:00 PM', active: true },
      Friday: { open: '07:00 AM', close: '09:00 PM', active: true },
      Saturday: { open: '07:00 AM', close: '09:00 PM', active: true },
      Sunday: { open: '07:00 AM', close: '09:00 PM', active: true }
    },
    amenities: ['24/7 CCTV Access', 'Swimming Pool', 'Private AC Suites', 'Large Play Lawns', 'Vet On Call 24/7', 'Customized Gourmet Meals']
  },
  {
    id: 'prov-seller-04',
    name: 'Royal Paws Elite Pet Sellers',
    role: 'SERVICE_PROVIDER',
    serviceCategory: 'Pet Seller',
    title: 'Certified Ethical Breed Lineage & Pet Marketplace Seller',
    clinicName: 'Royal Paws Certified Kennel & Pet Seller Studio',
    experience: '14+ Years Ethical Breeding & Sales',
    rating: 4.96,
    reviewsCount: 310,
    phone: '+91 99451 22334',
    whatsapp: '+91 99451 22334',
    email: 'royalpaws@pawora.com',
    location: 'Indiranagar, Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    area: 'Indiranagar',
    pincode: '560038',
    bio: 'KCI registered ethical pet seller providing dewormed, vaccinated, microchipped purebred puppies, kittens, birds, and small pets with lifetime lineage health certificates.',
    avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200',
    isOnline: true,
    acceptingEmergency: false,
    operatingHours: {
      Monday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Tuesday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Wednesday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Thursday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Friday: { open: '09:00 AM', close: '08:00 PM', active: true },
      Saturday: { open: '09:00 AM', close: '08:30 PM', active: true },
      Sunday: { open: '10:00 AM', close: '06:00 PM', active: true }
    },
    amenities: ['KCI Lineage Certificate', 'Microchip Implantation', 'Health & Genetic Guarantee', 'First Vaccine Kit Included', 'Free Delivery in Bangalore']
  }
];

// Initial Seed Services
export const INITIAL_SERVICES = [
  {
    id: 'SRV-101',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    title: 'Comprehensive Physical Exam & Wellness Consult',
    category: 'Veterinary',
    price: 600,
    discountPrice: 499,
    priceUnit: 'per consult',
    duration: '30 mins',
    petTypes: ['Dogs', 'Cats', 'Birds'],
    serviceMode: 'Clinic / Facility',
    location: 'MG Road, Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'MG Road',
    contactPhone: '+91 98765 43210',
    contactWhatsapp: '+91 98765 43210',
    description: 'Thorough head-to-tail clinical examination covering heart, lungs, dental health, joint mobility, weight tracking, and digital e-prescription.',
    highlights: ['Stethoscope Vitals Check', 'Dental & Gum Inspection', 'Digital Prescription PDF', 'Nutrition & Diet Guidance'],
    packages: [
      { name: 'Standard Consult', price: 499, duration: '25 mins', desc: 'Clinical evaluation, vitals & prescription' },
      { name: 'Consult + Preventive Deworming', price: 749, duration: '40 mins', desc: 'Standard consult plus high-potency oral deworming treatment' },
      { name: 'Executive Senior Pet Screening', price: 1299, duration: '60 mins', desc: 'Consult, blood pressure, glucose check & arthritis mobility assessment' }
    ],
    images: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 84,
    status: 'Active',
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'SRV-102',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    title: 'Core 7-in-1 Combo Vaccination & Rabies Booster',
    category: 'Veterinary',
    price: 1100,
    discountPrice: 950,
    priceUnit: 'per pet',
    duration: '20 mins',
    petTypes: ['Dogs', 'Cats'],
    serviceMode: 'Clinic / Facility',
    location: 'MG Road, Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'MG Road',
    contactPhone: '+91 98765 43210',
    contactWhatsapp: '+91 98765 43210',
    description: 'Protect your puppy or adult pet against Parvovirus, Distemper, Hepatitis, Leptospirosis, Parainfluenza, and Rabies.',
    highlights: ['Official Stamp & Passport Record', 'Cold-Chain Certified Vaccines', '15-min Post Injection Observation', 'Health Certificate Included'],
    packages: [
      { name: 'Rabies ARV Only', price: 450, duration: '15 mins', desc: 'Single anti-rabies dose with immunization certificate' },
      { name: 'DHPPIL 7-in-1 Booster Combo', price: 950, duration: '25 mins', desc: 'Complete multi-virus combo vaccine + physical evaluation' }
    ],
    images: ['https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=800'],
    rating: 4.95,
    reviewsCount: 58,
    status: 'Active',
    createdAt: '2026-08-18T11:00:00.000Z'
  },
  {
    id: 'SRV-103',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    title: 'Instant Online Video Vet Consultation',
    category: 'Veterinary',
    price: 450,
    discountPrice: 399,
    priceUnit: 'per 20 min session',
    duration: '20 mins',
    petTypes: ['Dogs', 'Cats', 'Birds', 'Reptiles', 'Small Pets'],
    serviceMode: 'Online Consultation',
    location: 'Pan India Video Consult',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Online',
    contactPhone: '+91 98765 43210',
    contactWhatsapp: '+91 98765 43210',
    description: 'Direct high-definition video call with Dr. Ramesh for second opinions, dietary guidance, behavioral questions, rash analysis, and instant PDF prescriptions.',
    highlights: ['No Travel Stress for Pet', 'Instant WhatsApp / Google Meet Link', 'Official E-Prescription with Reg No.'],
    packages: [
      { name: 'Quick 15 Min Consult', price: 399, duration: '15 mins', desc: 'Fast prescription refill or symptom triage' },
      { name: '30 Min Deep Clinical Video Call', price: 699, duration: '30 mins', desc: 'Comprehensive medical review & diet chart' }
    ],
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800'],
    rating: 4.8,
    reviewsCount: 42,
    status: 'Active',
    createdAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'SRV-201',
    providerId: 'prov-groom-02',
    providerName: 'Velvet Fur Spa Studio',
    title: 'Luxury Aroma Spa Bath & Deep Conditioning',
    category: 'Grooming',
    price: 999,
    discountPrice: 799,
    priceUnit: 'per pet',
    duration: '60 mins',
    petTypes: ['Dogs', 'Cats'],
    serviceMode: 'Clinic / Facility',
    location: 'Koramangala, Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Koramangala 4th Block',
    contactPhone: '+91 98450 11223',
    contactWhatsapp: '+91 98450 11223',
    description: 'Herbal organic shampoo massage, deep fur conditioning mask, warm velocity blow-dry, ear cleaning, paw balm massage, and luxury spritz.',
    highlights: ['100% Vegan Hypoallergenic Shampoos', 'Ear Plucking & Gentle Cleaning', 'Nail Trimming & Filing', 'Paw Butter Hydration'],
    packages: [
      { name: 'Basic Foam & Dry', price: 799, duration: '45 mins', desc: 'Shampoo, conditioner & blow dry' },
      { name: 'Full Luxury Pamper Spa', price: 1299, duration: '75 mins', desc: 'Aroma bath + paw massage + sanitary trim + ear flush' }
    ],
    images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 110,
    status: 'Active',
    createdAt: '2026-08-16T10:00:00.000Z'
  },
  {
    id: 'SRV-202',
    providerId: 'prov-groom-02',
    providerName: 'Velvet Fur Spa Studio',
    title: 'Full Styling Haircut & Breed Specific Grooming',
    category: 'Grooming',
    price: 1800,
    discountPrice: 1499,
    priceUnit: 'per pet',
    duration: '90 mins',
    petTypes: ['Dogs', 'Cats'],
    serviceMode: 'Clinic / Facility',
    location: 'Koramangala, Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Koramangala',
    contactPhone: '+91 98450 11223',
    contactWhatsapp: '+91 98450 11223',
    description: 'Signature designer haircut by master groomers tailored to your pet breed (Teddy cut, Summer clip, Puppy cut) with complete sanitization.',
    highlights: ['Breed Standard Scissor Styling', 'Sanitary Hygiene Trim', 'Tick & Flea Prevention Dip', 'Bandana & Fragrance Finishing'],
    packages: [
      { name: 'Summer Maintenance Clip', price: 1499, duration: '75 mins', desc: 'Cool hygienic trim + warm bath + ear care' },
      { name: 'Show Quality Master Styling', price: 2199, duration: '110 mins', desc: 'Precision hand-scissoring, facial shaping, spa bath & coat fluffing' }
    ],
    images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 96,
    status: 'Active',
    createdAt: '2026-08-19T12:00:00.000Z'
  },
  {
    id: 'SRV-301',
    providerId: 'prov-hostel-03',
    providerName: 'Happy Paws Pet Resort',
    title: 'Deluxe Climate-Controlled Boarding Suite',
    category: 'Hostel',
    price: 999,
    discountPrice: 799,
    priceUnit: 'per night',
    duration: '24 Hours',
    petTypes: ['Dogs', 'Cats'],
    serviceMode: 'Clinic / Facility',
    location: 'Sarjapur Road, Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Sarjapur',
    contactPhone: '+91 97312 99881',
    contactWhatsapp: '+91 97312 99881',
    description: 'Private 100 sq ft AC suite with orthopaedic bedding, 4 daily outdoor play sessions on natural grass, 24/7 mobile CCTV access, and fresh home-cooked meals.',
    highlights: ['24/7 Mobile CCTV Stream', '3 Fresh Nutritious Meals Daily', '4 Outdoor Play Sessions', '24/7 Resident Vet On Site'],
    packages: [
      { name: 'Standard AC Suite', price: 799, duration: 'Per Night', desc: 'AC room + 3 meals + 4 lawn walks + daily video updates' },
      { name: 'Royal Garden Suite with Splash Pool', price: 1399, duration: 'Per Night', desc: 'Large private garden access, splash pool session, raw chew treats & checkout bath' }
    ],
    images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 165,
    status: 'Active',
    createdAt: '2026-08-14T08:00:00.000Z'
  }
];

// Initial Seed Bookings for tracking
export const INITIAL_BOOKINGS = [
  {
    id: 'BOOK-801',
    bookingNumber: 'PAW-BK-9201',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    serviceId: 'SRV-101',
    serviceTitle: 'Comprehensive Physical Exam & Wellness Consult',
    serviceType: 'Veterinary',
    serviceMode: 'Clinic / Facility',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    customerPhone: '+91 98234 56789',
    customerLocation: 'Indiranagar, Bangalore',
    petDetails: {
      name: 'Bruno',
      type: 'Dog',
      breed: 'Golden Retriever',
      age: '2.5 Years',
      gender: 'Male',
      weight: '28 kg',
      notes: 'Mild scratching around left ear since 3 days. Up to date on vaccines.'
    },
    date: '2026-08-31',
    timeSlot: '11:00 AM - 11:30 AM',
    fee: 499,
    packageSelected: 'Standard Consult',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI / Online',
    createdAt: '2026-08-29T14:20:00.000Z'
  },
  {
    id: 'BOOK-802',
    bookingNumber: 'PAW-BK-9202',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    serviceId: 'SRV-102',
    serviceTitle: 'Core 7-in-1 Combo Vaccination & Rabies Booster',
    serviceType: 'Veterinary',
    serviceMode: 'Clinic / Facility',
    customerName: 'Priya Sundaram',
    customerEmail: 'priya.sundaram@example.com',
    customerPhone: '+91 97412 34567',
    customerLocation: 'Koramangala, Bangalore',
    petDetails: {
      name: 'Coco',
      type: 'Dog',
      breed: 'Shih Tzu',
      age: '11 Months',
      gender: 'Female',
      weight: '6.2 kg',
      notes: 'First annual booster shot. Bring passport for stamp.'
    },
    date: '2026-08-31',
    timeSlot: '03:30 PM - 04:00 PM',
    fee: 950,
    packageSelected: 'DHPPIL 7-in-1 Booster Combo',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Pay at Clinic',
    createdAt: '2026-08-30T09:15:00.000Z'
  },
  {
    id: 'BOOK-803',
    bookingNumber: 'PAW-BK-9203',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    serviceId: 'SRV-103',
    serviceTitle: 'Instant Online Video Vet Consultation',
    serviceType: 'Veterinary',
    serviceMode: 'Online Consultation',
    customerName: 'Vikram Joshi',
    customerEmail: 'vikram.j@example.com',
    customerPhone: '+91 99001 88223',
    customerLocation: 'Whitefield, Bangalore',
    petDetails: {
      name: 'Milo',
      type: 'Cat',
      breed: 'Persian Longhair',
      age: '3 Years',
      gender: 'Male',
      weight: '4.1 kg',
      notes: 'Hairball vomiting twice yesterday. Need diet recommendations.'
    },
    date: '2026-09-01',
    timeSlot: '05:00 PM - 05:20 PM',
    fee: 399,
    packageSelected: 'Quick 15 Min Consult',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Card Payment',
    createdAt: '2026-08-30T16:40:00.000Z'
  },
  {
    id: 'BOOK-804',
    bookingNumber: 'PAW-BK-9204',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    serviceId: 'SRV-101',
    serviceTitle: 'Comprehensive Physical Exam & Wellness Consult',
    serviceType: 'Veterinary',
    serviceMode: 'Clinic / Facility',
    customerName: 'Ananya Deshmukh',
    customerEmail: 'ananya.d@example.com',
    customerPhone: '+91 98801 11223',
    customerLocation: 'HSR Layout, Bangalore',
    petDetails: {
      name: 'Rocky',
      type: 'Dog',
      breed: 'German Shepherd',
      age: '5 Years',
      gender: 'Male',
      weight: '34 kg',
      notes: 'Limping slightly after sprint play in garden.'
    },
    date: '2026-08-30',
    timeSlot: '10:00 AM - 10:30 AM',
    fee: 749,
    packageSelected: 'Consult + Deworming',
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    createdAt: '2026-08-28T11:00:00.000Z'
  },
  {
    id: 'BOOK-805',
    bookingNumber: 'PAW-BK-9205',
    providerId: 'prov-vet-01',
    providerName: 'Dr. Ramesh Kumar',
    serviceId: 'SRV-101',
    serviceTitle: 'Comprehensive Physical Exam & Wellness Consult',
    serviceType: 'Veterinary',
    serviceMode: 'Clinic / Facility',
    customerName: 'Rohan Gupta',
    customerEmail: 'rohan.g@example.com',
    customerPhone: '+91 91234 56780',
    customerLocation: 'Malleshwaram, Bangalore',
    petDetails: {
      name: 'Simba',
      type: 'Dog',
      breed: 'Labrador Retriever',
      age: '4 Years',
      gender: 'Male',
      weight: '32 kg',
      notes: 'Customer had to travel out of town urgently.'
    },
    date: '2026-08-29',
    timeSlot: '02:00 PM - 02:30 PM',
    fee: 499,
    packageSelected: 'Standard Consult',
    status: 'Cancelled',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash on visit',
    cancellationReason: 'Pet parent rescheduled due to urgent work travel.',
    createdAt: '2026-08-27T18:10:00.000Z'
  },
  {
    id: 'BOOK-806',
    bookingNumber: 'PAW-BK-9206',
    providerId: 'prov-groom-02',
    providerName: 'Velvet Fur Spa Studio',
    serviceId: 'SRV-201',
    serviceTitle: 'Luxury Aroma Spa Bath & Deep Conditioning',
    serviceType: 'Grooming',
    serviceMode: 'Clinic / Facility',
    customerName: 'Sneha Roy',
    customerEmail: 'sneha.roy@example.com',
    customerPhone: '+91 96112 33445',
    customerLocation: 'Koramangala 5th Block, Bangalore',
    petDetails: {
      name: 'Bella',
      type: 'Dog',
      breed: 'Cocker Spaniel',
      age: '2 Years',
      gender: 'Female',
      weight: '12 kg',
      notes: 'Sensitive skin. Use hypoallergenic lavender bath.'
    },
    date: '2026-08-31',
    timeSlot: '01:00 PM - 02:15 PM',
    fee: 1299,
    packageSelected: 'Full Luxury Pamper Spa',
    status: 'In-Progress',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    createdAt: '2026-08-30T10:00:00.000Z'
  },
  {
    id: 'BOOK-807',
    bookingNumber: 'PAW-BK-9207',
    providerId: 'prov-hostel-03',
    providerName: 'Happy Paws Pet Resort',
    serviceId: 'SRV-301',
    serviceTitle: 'Deluxe Climate-Controlled Boarding Suite',
    serviceType: 'Hostel',
    serviceMode: 'Clinic / Facility',
    customerName: 'Kavita Menon',
    customerEmail: 'kavita.m@example.com',
    customerPhone: '+91 95350 44889',
    customerLocation: 'Bellandur, Bangalore',
    petDetails: {
      name: 'Oreo & Hazel',
      type: 'Dog',
      breed: 'Beagle Duo',
      age: '3 & 4 Years',
      gender: 'Male & Female',
      weight: '14 kg each',
      notes: 'Need sharing room together. Meals: 200g chicken & pumpkin mash at 8am and 7pm.'
    },
    date: '2026-09-02 to 2026-09-06',
    timeSlot: '4 Nights Stay',
    fee: 3196,
    packageSelected: 'Standard AC Suite (4 Nights)',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Net Banking',
    createdAt: '2026-08-28T09:00:00.000Z'
  }
];

// Seed Reviews
export const INITIAL_REVIEWS = [
  {
    id: 'REV-901',
    providerId: 'prov-vet-01',
    customerName: 'Aarav Sharma',
    petName: 'Bruno (Golden Retriever)',
    serviceName: 'Comprehensive Physical Exam',
    rating: 5,
    date: '2026-08-25',
    comment: 'Dr. Ramesh is phenomenal! He treated Bruno with utmost tenderness and took the time to answer all my nutrition questions. Highly recommended for any pet parent!',
    reply: 'Thank you Aarav! Bruno was very well-behaved and a pleasure to treat. Glad to see his vitals in top condition.'
  },
  {
    id: 'REV-902',
    providerId: 'prov-vet-01',
    customerName: 'Kriti Nair',
    petName: 'Bella (Persian Cat)',
    serviceName: 'Online Video Consult',
    rating: 5,
    date: '2026-08-20',
    comment: 'The video consultation was so smooth and saved us from putting Bella in stressful traffic. The digital prescription worked immediately at my local pharmacy.',
    reply: 'Delighted to hear Bella is doing great, Kriti! Always here whenever you need virtual guidance.'
  },
  {
    id: 'REV-903',
    providerId: 'prov-vet-01',
    customerName: 'Karan Mehra',
    petName: 'Max (German Shepherd)',
    serviceName: 'Vaccination Shield',
    rating: 4.8,
    date: '2026-08-14',
    comment: 'Very professional clinic setup with hygienic premises and quick vaccination with zero hassle.',
    reply: null
  }
];

// Seed Payout History
export const INITIAL_PAYOUTS = [
  {
    id: 'PO-701',
    payoutId: 'TRX-948271',
    date: '2026-08-25',
    amount: 14850,
    feeDeducted: 0,
    netAmount: 14850,
    status: 'Transferred',
    bankAccount: 'HDFC Bank - •••• 4892',
    period: 'Aug 10 - Aug 24, 2026'
  },
  {
    id: 'PO-702',
    payoutId: 'TRX-831920',
    date: '2026-08-10',
    amount: 19400,
    feeDeducted: 0,
    netAmount: 19400,
    status: 'Transferred',
    bankAccount: 'HDFC Bank - •••• 4892',
    period: 'Jul 26 - Aug 09, 2026'
  }
];

// Local Storage Keys
const STORAGE_SERVICES_KEY = 'pawora_provider_services';
const STORAGE_BOOKINGS_KEY = 'pawora_provider_bookings';
const STORAGE_REVIEWS_KEY = 'pawora_provider_reviews';
const STORAGE_PAYOUTS_KEY = 'pawora_provider_payouts';
const STORAGE_PROFILES_KEY = 'pawora_provider_profiles';

// ==========================================
// PERSISTENCE GETTERS & SETTERS
// ==========================================

export const getAllStoredServices = () => {
  try {
    const raw = localStorage.getItem(STORAGE_SERVICES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
  return INITIAL_SERVICES;
};

export const saveAllStoredServices = (services) => {
  try {
    localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(services));
  } catch (e) {}
};

export const getAllStoredBookings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
};

export const saveAllStoredBookings = (bookings) => {
  try {
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {}
};

export const getAllStoredReviews = () => {
  try {
    const raw = localStorage.getItem(STORAGE_REVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
};

export const saveAllStoredReviews = (reviews) => {
  try {
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {}
};

export const getAllStoredPayouts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_PAYOUTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_PAYOUTS_KEY, JSON.stringify(INITIAL_PAYOUTS));
  return INITIAL_PAYOUTS;
};

export const saveAllStoredPayouts = (payouts) => {
  try {
    localStorage.setItem(STORAGE_PAYOUTS_KEY, JSON.stringify(payouts));
  } catch (e) {}
};

export const getStoredProviderProfiles = () => {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(DEMO_PROVIDER_PERSONAS));
  return DEMO_PROVIDER_PERSONAS;
};

export const saveStoredProviderProfiles = (profiles) => {
  try {
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {}
};
