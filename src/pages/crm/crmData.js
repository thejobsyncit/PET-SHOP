// crmData.js - Reactive Mock Store for Enterprise Pet Care CRM with LocalStorage Persistence

export const CRM_ROLES = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    name: 'Super Admin / CEO',
    holder: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Founder & Chief Executive Officer',
    department: 'Executive Leadership',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    description: 'Unrestricted master access to all financial KPIs, operational departments, role assignments, audit logs, and system settings.',
    directReportsCount: 5,
    permissions: ['ALL_PERMISSIONS', 'FINANCIAL_OVERRIDE', 'ROLE_MANAGEMENT', 'SYSTEM_CONFIG', 'AUDIT_LOGS']
  },
  OPERATIONS_MANAGER: {
    id: 'OPERATIONS_MANAGER',
    name: 'Operations Manager',
    holder: 'Rajesh Menon',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Director of Facility & Clinic Operations',
    department: 'Operations & Facilities',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    description: 'Manages facility capacity, staff shift rosters, equipment maintenance, supply chain restock approvals, and daily throughput.',
    directReportsCount: 4,
    permissions: ['CAPACITY_MANAGE', 'STAFF_SCHEDULING', 'INVENTORY_RESTOCK', 'TASK_DELEGATION', 'INCIDENT_REPORTS']
  },
  VETERINARIAN: {
    id: 'VETERINARIAN',
    name: 'Head Veterinarian',
    holder: 'Dr. Ananya Sen',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    title: 'Chief Veterinary Surgeon & Medical Director',
    department: 'Veterinary & Clinical Medicine',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    description: 'Oversees diagnosis, surgery schedules, Electronic Health Records (EHR), prescription generation, triage, and vaccination calendars.',
    directReportsCount: 2,
    permissions: ['EHR_ACCESS', 'PRESCRIPTION_WRITE', 'SURGERY_BOOK', 'VACCINE_CERTIFY', 'TRIAGE_CONTROL']
  },
  GROOMING_LEAD: {
    id: 'GROOMING_LEAD',
    name: 'Lead Groomer & Stylist',
    holder: 'Meera Kapoor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Head of Pet Styling & Spa Services',
    department: 'Pet Grooming & Spa Studio',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    description: 'Coordinates styling tables, coat conditioning notes, service timers, grooming checklists, and before/after transformation logs.',
    directReportsCount: 3,
    permissions: ['GROOMING_QUEUE', 'STYLING_NOTES', 'STATION_TIMER', 'SERVICE_CHECKLIST', 'CLIENT_GALLERY']
  },
  BOARDING_SUPERVISOR: {
    id: 'BOARDING_SUPERVISOR',
    name: 'Daycare & Boarding Supervisor',
    holder: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Daycare Playpen & Boarding Suites Manager',
    department: 'Boarding & Daycare Suites',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    description: 'Oversees kennel allocations, feeding & medication regimens, dog playgroup temperament matches, and outdoor potty/walking logs.',
    directReportsCount: 4,
    permissions: ['KENNEL_MATRIX', 'FEEDING_LOGS', 'PLAYGROUP_TEMPERAMENT', 'WALK_TRACKER', 'PARENT_UPDATES']
  },
  FRONT_DESK: {
    id: 'FRONT_DESK',
    name: 'Front Desk & Client Concierge',
    holder: 'Kavya Nair',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Receptionist & Client Relations Specialist',
    department: 'Customer Experience & Reception',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    description: 'Manages instant check-in/out, appointment booking wizard, customer WhatsApp/chat inbox, billing, and point-of-sale invoicing.',
    directReportsCount: 1,
    permissions: ['WALKIN_CHECKIN', 'BOOKING_CREATE', 'POS_BILLING', 'CLIENT_MESSAGING', 'PAYMENT_RECEIVE']
  }
};

export const INITIAL_STAFF = [
  {
    id: 'staff-1',
    name: 'Priya Sharma',
    roleId: 'SUPER_ADMIN',
    title: 'Founder & CEO',
    email: 'priya@pawora-crm.com',
    phone: '+91 98401 23456',
    status: 'Online',
    shift: 'Full Day (Exec)',
    department: 'Executive Leadership',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-2',
    name: 'Rajesh Menon',
    roleId: 'OPERATIONS_MANAGER',
    title: 'Director of Operations',
    email: 'rajesh.m@pawora-crm.com',
    phone: '+91 98402 34567',
    status: 'On Floor',
    shift: '08:00 AM - 05:00 PM',
    department: 'Operations & Facilities',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-3',
    name: 'Dr. Ananya Sen',
    roleId: 'VETERINARIAN',
    title: 'Chief Veterinary Surgeon',
    email: 'dr.ananya@pawora-crm.com',
    phone: '+91 98403 45678',
    status: 'In Consultation',
    shift: '09:00 AM - 04:00 PM',
    department: 'Veterinary & Clinical Medicine',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-4',
    name: 'Meera Kapoor',
    roleId: 'GROOMING_LEAD',
    title: 'Master Pet Stylist',
    email: 'meera.k@pawora-crm.com',
    phone: '+91 98404 56789',
    status: 'Active Grooming',
    shift: '09:30 AM - 06:30 PM',
    department: 'Pet Grooming & Spa Studio',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-5',
    name: 'Asha Sundaram',
    roleId: 'GROOMING_LEAD',
    title: 'Senior Groomer',
    email: 'asha.s@pawora-crm.com',
    phone: '+91 98405 67890',
    status: 'Available',
    shift: '10:00 AM - 07:00 PM',
    department: 'Pet Grooming & Spa Studio',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-6',
    name: 'Rahul Verma',
    roleId: 'BOARDING_SUPERVISOR',
    title: 'Daycare Supervisor',
    email: 'rahul.v@pawora-crm.com',
    phone: '+91 98406 78901',
    status: 'In Playpen B',
    shift: '07:30 AM - 04:30 PM',
    department: 'Boarding & Daycare Suites',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff-7',
    name: 'Kavya Nair',
    roleId: 'FRONT_DESK',
    title: 'Front Desk Lead',
    email: 'kavya.n@pawora-crm.com',
    phone: '+91 98407 89012',
    status: 'At Counter',
    shift: '08:30 AM - 05:30 PM',
    department: 'Customer Experience & Reception',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-1',
    time: '10:00 AM',
    petName: 'Bruno',
    petType: 'Dog',
    petBreed: 'Golden Retriever',
    petAvatar: '🐶',
    parentName: 'Arun Kumar',
    parentPhone: '+91 98840 11223',
    service: 'Full grooming',
    serviceCategory: 'Grooming',
    staffName: 'Meera',
    staffRole: 'GROOMING_LEAD',
    status: 'In-Progress',
    amount: 1850,
    paid: true,
    notes: 'Teddy cut styling, hypoallergenic oatmeal bath. Sensitive ears.',
    date: 'Today'
  },
  {
    id: 'apt-2',
    time: '11:30 AM',
    petName: 'Luna',
    petType: 'Cat',
    petBreed: 'Persian Cat',
    petAvatar: '🐱',
    parentName: 'Divya S.',
    parentPhone: '+91 98410 44556',
    service: 'Daycare check-in',
    serviceCategory: 'Daycare',
    staffName: 'Rahul',
    staffRole: 'BOARDING_SUPERVISOR',
    status: 'Checked-In',
    amount: 800,
    paid: true,
    notes: 'Solo playtime only. Needs soothing sound in Cat Penthouse #3.',
    date: 'Today'
  },
  {
    id: 'apt-3',
    time: '02:00 PM',
    petName: 'Oreo',
    petType: 'Dog',
    petBreed: 'Shih Tzu',
    petAvatar: '🐶',
    parentName: 'Naveen R.',
    parentPhone: '+91 97900 66778',
    service: 'Nail & ear care',
    serviceCategory: 'Grooming',
    staffName: 'Asha',
    staffRole: 'GROOMING_LEAD',
    status: 'Confirmed',
    amount: 650,
    paid: false,
    notes: 'Gentle handling required, ticklish front paws.',
    date: 'Today'
  },
  {
    id: 'apt-4',
    time: '03:15 PM',
    petName: 'Milo',
    petType: 'Dog',
    petBreed: 'Beagle',
    petAvatar: '🐕',
    parentName: 'Kiran Patel',
    parentPhone: '+91 99620 33445',
    service: 'Rabies Booster & Checkup',
    serviceCategory: 'Veterinary',
    staffName: 'Dr. Ananya',
    staffRole: 'VETERINARIAN',
    status: 'Confirmed',
    amount: 1200,
    paid: false,
    notes: 'Annual vaccination due. Check minor skin redness on abdomen.',
    date: 'Today'
  },
  {
    id: 'apt-5',
    time: '04:30 PM',
    petName: 'Simba',
    petType: 'Dog',
    petBreed: 'German Shepherd',
    petAvatar: '🐕‍🦺',
    parentName: 'Vikram Mehta',
    parentPhone: '+91 98409 88776',
    service: 'De-shedding & Hydrobath',
    serviceCategory: 'Grooming',
    staffName: 'Meera',
    staffRole: 'GROOMING_LEAD',
    status: 'Confirmed',
    amount: 2200,
    paid: true,
    notes: 'High shedding season, blow-out coat thoroughly.',
    date: 'Today'
  },
  {
    id: 'apt-6',
    time: '05:45 PM',
    petName: 'Bella',
    petType: 'Dog',
    petBreed: 'Labrador Retriever',
    petAvatar: '🦮',
    parentName: 'Sneha Roy',
    parentPhone: '+91 98845 22334',
    service: 'Boarding suite check-in (3 Days)',
    serviceCategory: 'Boarding',
    staffName: 'Rahul',
    staffRole: 'BOARDING_SUPERVISOR',
    status: 'Confirmed',
    amount: 4500,
    paid: true,
    notes: 'Deluxe Suite #7. Owner providing Royal Canin Maxi adult kibble.',
    date: 'Today'
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    title: 'Vaccination due',
    subtitle: 'Milo — due in 2 days',
    type: 'vaccine',
    severity: 'warning',
    petName: 'Milo',
    ownerName: 'Kiran Patel',
    phone: '+91 99620 33445',
    actionText: 'Send WhatsApp Reminder',
    resolved: false
  },
  {
    id: 'alt-2',
    title: 'Grooming reminder',
    subtitle: 'Simba — last visit 6 weeks ago',
    type: 'grooming',
    severity: 'info',
    petName: 'Simba',
    ownerName: 'Vikram Mehta',
    phone: '+91 98409 88776',
    actionText: 'Book Slot',
    resolved: false
  },
  {
    id: 'alt-3',
    title: 'Pending payment',
    subtitle: '₹1,200 — Maya\'s boarding',
    type: 'payment',
    severity: 'danger',
    petName: 'Maya',
    ownerName: 'Sunita Rao',
    phone: '+91 98400 55112',
    actionText: 'Collect ₹1,200',
    resolved: false
  },
  {
    id: 'alt-4',
    title: 'Prescription Refill',
    subtitle: 'Rocky — Joint supplements due',
    type: 'medical',
    severity: 'warning',
    petName: 'Rocky',
    ownerName: 'Deepak V.',
    phone: '+91 98841 77665',
    actionText: 'Refill Rx',
    resolved: false
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Prepare Bruno for grooming',
    assignee: 'Meera',
    department: 'Grooming',
    dueTime: '09:45 AM',
    completed: true,
    priority: 'High'
  },
  {
    id: 'task-2',
    title: 'Send vaccine reminder to Milo\'s parent',
    assignee: 'Kavya',
    department: 'Reception',
    dueTime: '11:00 AM',
    completed: false,
    priority: 'Medium'
  },
  {
    id: 'task-3',
    title: 'Restock hypoallergenic shampoo',
    assignee: 'Store',
    department: 'Operations',
    dueTime: '01:30 PM',
    completed: false,
    priority: 'Urgent'
  },
  {
    id: 'task-4',
    title: 'Sanitize Daycare Playpen B after morning run',
    assignee: 'Rahul',
    department: 'Boarding',
    dueTime: '02:00 PM',
    completed: false,
    priority: 'Medium'
  },
  {
    id: 'task-5',
    title: 'Review post-surgery bloodwork for Leo',
    assignee: 'Dr. Ananya',
    department: 'Veterinary',
    dueTime: '03:00 PM',
    completed: false,
    priority: 'High'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    customerName: 'Aishwarya R.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    message: 'Can I book Coco for Saturday at 3 PM?',
    timeAgo: '2 min ago',
    petName: 'Coco (Poodle)',
    unread: true,
    replied: false
  },
  {
    id: 'msg-2',
    customerName: 'Karthik S.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    message: 'Excellent grooming service! Bruno smells amazing!',
    timeAgo: '18 min ago',
    petName: 'Bruno (Golden Retriever)',
    unread: false,
    replied: true
  },
  {
    id: 'msg-3',
    customerName: 'Vikram Mehta',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    message: 'Callback requested regarding boarding suite reservation for Diwali weekend.',
    timeAgo: '35 min ago',
    petName: 'Simba (GSD)',
    unread: true,
    replied: false
  },
  {
    id: 'msg-4',
    customerName: 'Pooja Iyer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    message: 'Does Dr. Ananya have slots tomorrow for dental scaling?',
    timeAgo: '1 hour ago',
    petName: 'Toby (Beagle)',
    unread: false,
    replied: false
  }
];

export const INITIAL_PET_PARENTS = [
  {
    id: 'parent-1',
    name: 'Arun Kumar',
    email: 'arun.k@gmail.com',
    phone: '+91 98840 11223',
    address: 'Indiranagar, Bangalore',
    pets: ['Bruno (Golden Retriever)'],
    totalVisits: 14,
    lifetimeSpend: 32400,
    memberTier: 'Platinum Club',
    lastVisit: 'Today',
    status: 'Active'
  },
  {
    id: 'parent-2',
    name: 'Divya S.',
    email: 'divya.s@yahoo.com',
    phone: '+91 98410 44556',
    address: 'Koramangala, Bangalore',
    pets: ['Luna (Persian Cat)'],
    totalVisits: 9,
    lifetimeSpend: 19800,
    memberTier: 'Gold Club',
    lastVisit: 'Today',
    status: 'Active'
  },
  {
    id: 'parent-3',
    name: 'Naveen R.',
    email: 'naveen.r@outlook.com',
    phone: '+91 97900 66778',
    address: 'Whitefield, Bangalore',
    pets: ['Oreo (Shih Tzu)'],
    totalVisits: 6,
    lifetimeSpend: 11200,
    memberTier: 'Silver Member',
    lastVisit: 'Today',
    status: 'Active'
  },
  {
    id: 'parent-4',
    name: 'Kiran Patel',
    email: 'kiran.patel@gmail.com',
    phone: '+91 99620 33445',
    address: 'HSR Layout, Bangalore',
    pets: ['Milo (Beagle)'],
    totalVisits: 18,
    lifetimeSpend: 41500,
    memberTier: 'Platinum Club',
    lastVisit: 'Last week',
    status: 'Active'
  },
  {
    id: 'parent-5',
    name: 'Vikram Mehta',
    email: 'vikram.m@corporatemail.com',
    phone: '+91 98409 88776',
    address: 'Jayanagar, Bangalore',
    pets: ['Simba (German Shepherd)'],
    totalVisits: 22,
    lifetimeSpend: 54900,
    memberTier: 'Diamond VIP',
    lastVisit: '6 weeks ago',
    status: 'Active'
  }
];

export const INITIAL_PET_PROFILES = [
  {
    id: 'pet-1',
    name: 'Bruno',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '3 Years 2 Months',
    weight: '31.5 kg',
    gender: 'Male (Neutered)',
    parentName: 'Arun Kumar',
    parentPhone: '+91 98840 11223',
    allergies: 'Chicken protein, flea bite sensitivity',
    temperament: 'Friendly, playful, gentle with children',
    dietNotes: 'Lamb & Rice kibble only, 2x daily',
    vaccinations: [
      { name: 'Rabies Booster', date: '2026-02-10', validUntil: '2027-02-10', status: 'Valid' },
      { name: 'DHPP Core', date: '2025-11-15', validUntil: '2026-11-15', status: 'Valid' },
      { name: 'Kennel Cough (Bordetella)', date: '2026-01-20', validUntil: '2027-01-20', status: 'Valid' }
    ],
    groomingNotes: 'Prefers scissors cut on head, sensitive around paw pads, use lavender conditioner.',
    avatarEmoji: '🐶'
  },
  {
    id: 'pet-2',
    name: 'Luna',
    type: 'Cat',
    breed: 'Persian Longhair',
    age: '2 Years',
    weight: '4.2 kg',
    gender: 'Female (Spayed)',
    parentName: 'Divya S.',
    parentPhone: '+91 98410 44556',
    allergies: 'None recorded',
    temperament: 'Reserved, dislikes sudden loud noises, enjoys gentle head scratches',
    dietNotes: 'Royal Canin Persian Wet Gravy, warmed slightly',
    vaccinations: [
      { name: 'FVRCP Tri-cat', date: '2025-08-14', validUntil: '2026-08-14', status: 'Valid' },
      { name: 'Rabies Feline', date: '2025-08-14', validUntil: '2026-08-14', status: 'Valid' }
    ],
    groomingNotes: 'Requires daily detangling comb, prone to tear stains (use gentle eye wipes).',
    avatarEmoji: '🐱'
  },
  {
    id: 'pet-3',
    name: 'Milo',
    type: 'Dog',
    breed: 'Beagle',
    age: '4 Years',
    weight: '14.8 kg',
    gender: 'Male',
    parentName: 'Kiran Patel',
    parentPhone: '+91 99620 33445',
    allergies: 'Dust mites',
    temperament: 'Curious hound, high food motivation, energetic',
    dietNotes: 'Weight control formula, strictly no table scraps',
    vaccinations: [
      { name: 'Rabies Booster', date: '2025-03-24', validUntil: '2026-03-24', status: 'DUE IN 2 DAYS' },
      { name: 'Leptospirosis', date: '2025-09-10', validUntil: '2026-09-10', status: 'Valid' }
    ],
    groomingNotes: 'Quick bather, loves towel massage.',
    avatarEmoji: '🐕'
  }
];

export const INITIAL_KENNEL_SUITES = [
  { id: 'suite-1', name: 'Penthouse Suite 1', type: 'Boarding', pet: 'Max (Rottweiler)', status: 'Occupied', checkOut: 'Tomorrow 11 AM' },
  { id: 'suite-2', name: 'Deluxe Suite 2', type: 'Boarding', pet: 'Bella (Labrador)', status: 'Reserved', checkOut: 'In 3 Days' },
  { id: 'suite-3', name: 'Cat Condo Penthouse 3', type: 'Daycare', pet: 'Luna (Persian)', status: 'Occupied', checkOut: 'Today 6 PM' },
  { id: 'suite-4', name: 'Cozy Suite 4', type: 'Boarding', pet: null, status: 'Sanitizing', checkOut: '-' },
  { id: 'suite-5', name: 'Standard Suite 5', type: 'Boarding', pet: null, status: 'Available', checkOut: '-' },
  { id: 'suite-6', name: 'Playpen Yard Alpha', type: 'Daycare', pet: '6 Active Dogs', status: 'In Play', checkOut: 'Ongoing' }
];

export const INITIAL_SUPPLY_INVENTORY = [
  { id: 'sup-1', name: 'Hypoallergenic Oatmeal Shampoo (5L)', stock: 2, minRequired: 5, status: 'Order Required', department: 'Grooming' },
  { id: 'sup-2', name: 'Rabies Multi-Dose Vials (Nobivac)', stock: 18, minRequired: 10, status: 'Adequate', department: 'Veterinary' },
  { id: 'sup-3', name: 'Grain-Free Salmon Adult Kibble (15kg)', stock: 4, minRequired: 8, status: 'Low Stock', department: 'Boarding' },
  { id: 'sup-4', name: 'Hospital-Grade Enzyme Disinfectant', stock: 12, minRequired: 6, status: 'Adequate', department: 'Operations' }
];

const CRM_STORAGE_KEY = 'pawora_crm_enterprise_state_v1';

export const getCrmState = () => {
  try {
    const saved = localStorage.getItem(CRM_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load CRM state from localStorage:', err);
  }
  return {
    appointments: INITIAL_APPOINTMENTS,
    alerts: INITIAL_ALERTS,
    tasks: INITIAL_TASKS,
    messages: INITIAL_MESSAGES,
    parents: INITIAL_PET_PARENTS,
    pets: INITIAL_PET_PROFILES,
    suites: INITIAL_KENNEL_SUITES,
    inventory: INITIAL_SUPPLY_INVENTORY,
    staff: INITIAL_STAFF
  };
};

export const saveCrmState = (state) => {
  try {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save CRM state:', err);
  }
};
