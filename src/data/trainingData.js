// Pet Training Providers Dataset, Modalities, Storage Helpers & Event Dispatchers

export const TRAINING_TYPES = [
  {
    id: 'puppy-basics',
    name: 'Puppy Socialization & Potty Basics',
    subtitle: 'Ages 2 to 6 Months',
    icon: '🐶',
    badge: 'Puppy Starter',
    desc: 'Foundational house-training, crate training, bite inhibition, socialization with sights & sounds, and gentle leash manners.'
  },
  {
    id: 'basic-obedience',
    name: 'Basic & Advanced Obedience',
    subtitle: 'All Dog Breeds & Ages',
    icon: '🎓',
    badge: 'Core Commands',
    desc: 'Rock-solid Sit, Down, Stay, Reliable Recall (Come), Leave It, Heel, and impulse control around heavy distractions.'
  },
  {
    id: 'behavioral-reboot',
    name: 'Aggression & Anxiety Modification',
    subtitle: 'Clinical Behavioral Therapy',
    icon: '🧠',
    badge: 'Behavior Therapy',
    desc: 'Positive desensitization for separation anxiety, incessant barking, leash reactivity, resource guarding, and fearfulness.'
  },
  {
    id: 'agility-tricks',
    name: 'Agility, Obstacles & Tricks',
    subtitle: 'High-Energy & Canine Sports',
    icon: '🎪',
    badge: 'Sport & Agility',
    desc: 'Hoop jumping, weave poles, tunnel runs, fetch retrieval, high-fives, and advanced mental enrichment games.'
  },
  {
    id: 'protection-guard',
    name: 'Guard Dog & Protection Protocol',
    subtitle: 'Working Breeds (GSD, Rottweilers, Dobermans)',
    icon: '🛡️',
    badge: 'Guard & Defense',
    desc: 'Territory perimeter awareness, controlled bite work on command, alert barking, and obedient handler safety.'
  },
  {
    id: 'show-conformation',
    name: 'Show Ring & Conformation Prep',
    subtitle: 'Kennel Club of India (KCI) Standards',
    icon: '🏆',
    badge: 'KCI Show Prep',
    desc: 'Ring gaiting, stacking stance, judge table inspection comfort, free standing, and championship presentation.'
  }
];

export const TRAINING_BENEFITS = [
  {
    id: 'organized-home',
    title: 'Your home stays organized',
    desc: 'No more chewed furniture, shoe hoarding, or messy indoor accidents.',
    bgColor: 'bg-amber-400',
    textColor: 'text-amber-950',
    icon: '🏠'
  },
  {
    id: 'easier-communication',
    title: 'Communication gets easier',
    desc: "Understand your dog's subtle body language, cues, and tail wags effortlessly.",
    bgColor: 'bg-sky-400',
    textColor: 'text-sky-950',
    icon: '👧'
  },
  {
    id: 'stress-free-walks',
    title: 'Walks turn stress-free',
    desc: 'Enjoy relaxed loose-leash neighborhood strolls with zero lunging or pulling.',
    bgColor: 'bg-pink-300',
    textColor: 'text-pink-950',
    icon: '🤲'
  },
  {
    id: 'stronger-bond',
    title: 'Your bond gets stronger',
    desc: 'Build deep mutual trust, respect, and a positive reinforcement lifelong connection.',
    bgColor: 'bg-purple-400',
    textColor: 'text-purple-950',
    icon: '🐕'
  }
];

export const TRAINING_MODULE_BADGES = [
  { num: 1, title: 'Private Training', color: 'bg-purple-600' },
  { num: 2, title: 'Targeted Training', color: 'bg-pink-500' },
  { num: 3, title: 'Personalised Training', color: 'bg-sky-500' },
  { num: 4, title: 'Training for Shows', color: 'bg-amber-500' }
];

export const THREE_STEP_PROCESS = [
  {
    step: 1,
    title: 'Choose your package',
    desc: 'Select from Puppy Starter, 10-Session Obedience, or Behavioral Rehab.',
    icon: '👤',
    color: 'bg-amber-400 text-amber-900'
  },
  {
    step: 2,
    title: 'Share the Details',
    desc: "Tell us about your pet's breed, age, behavioral quirks, and convenient timings.",
    icon: '📱',
    color: 'bg-pink-400 text-pink-900'
  },
  {
    step: 3,
    title: 'Pay & Relax',
    desc: 'A certified force-free trainer visits your doorstep or welcomes you at the academy.',
    icon: '💳',
    color: 'bg-purple-600 text-white'
  }
];

export const TRAINING_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Aditya & Priya Sharma',
    dog: 'Rocky (Golden Retriever)',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    quote: 'Our team ensures that your pet is in safe and secure hands. Rocky used to pull intensely on the leash; after 6 sessions he walks right by our side!',
    rating: 5
  },
  {
    id: 't-2',
    name: 'Kabir & Sneha Sen',
    dog: 'Milo (Beagle)',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
    quote: 'Our team comprises professional trainers with hands-on positive reinforcement skills. Milo stopped his separation barking within 2 weeks.',
    rating: 5
  },
  {
    id: 't-3',
    name: 'Rohit & Natasha Verma',
    dog: 'Bella (German Shepherd)',
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400',
    quote: 'We believe in humane, force-free science. Bella learned perfect recall, agility jumps, and stays calm around strangers. Highly recommend Pawora trainers!',
    rating: 5
  }
];

export const INITIAL_TRAINING_PROVIDERS = [
  {
    id: 'TRN-101',
    name: 'Pawora Elite K9 Academy & Behaviorists',
    tagline: 'Certified Canine Behaviorists & 100% Force-Free Positive Reinforcement',
    leadTrainer: 'Capt. Aryan Roy (CCPDT-KA Certified & Canine Ethologist)',
    experience: '12+ Years Experience',
    verified: true,
    rating: 4.96,
    reviews: 328,
    trainedCount: 3800,
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Bandra West, Juhu & Powai',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp', 'Online Video Consultation'],
    petTypes: ['Dogs', 'Puppies'],
    specialties: ['Puppy Socialization', 'Basic & Advanced Obedience', 'Aggression Modification', 'Agility Training'],
    pricePerSession: 899,
    packageStarting: 5499,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800',
    certifications: ['CCPDT-KA Certified', 'Fear Free Certified Professional', 'KCI Obedience Judge'],
    packages: [
      {
        id: 'pkg-101-1',
        name: 'Puppy Foundations & Potty Fast-Track (6 Sessions)',
        price: 5499,
        sessions: '6 Doorstep Sessions',
        desc: 'Potty scheduling, bite inhibition, crate adaptation, loose-leash walking, and essential pup manners.'
      },
      {
        id: 'pkg-101-2',
        name: 'Master Complete Obedience (12 Sessions)',
        price: 9999,
        sessions: '12 Doorstep Sessions',
        desc: 'Sit, Down, 60-second Stay, Bulletproof Recall, Leave It, Off, and distraction-proofing in busy parks.'
      },
      {
        id: 'pkg-101-3',
        name: 'Clinical Behavior Rehabilitation (8 Sessions)',
        price: 8499,
        sessions: '8 Focused Sessions',
        desc: 'Targeted desensitization for leash reactivity, resource guarding, separation anxiety, and fear aggression.'
      }
    ]
  },
  {
    id: 'TRN-102',
    name: 'ZenPaws Canine Behavior Clinic',
    tagline: 'Gentle Science-Backed Dog Training & Leash Reactivity Solutions',
    leadTrainer: 'Ananya Deshmukh (KPA CTP Dog Trainer & Animal Behaviorist)',
    experience: '9+ Years Experience',
    verified: true,
    rating: 4.92,
    reviews: 210,
    trainedCount: 2600,
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Indiranagar, HSR Layout & Whitefield',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp'],
    petTypes: ['Dogs', 'Puppies', 'Cats'],
    specialties: ['Puppy Socialization', 'Basic Obedience', 'Anxiety Modification', 'Clicker Training'],
    pricePerSession: 850,
    packageStarting: 4999,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800',
    certifications: ['Karen Pryor Academy (KPA CTP)', 'Pet First Aid & CPR Certified'],
    packages: [
      {
        id: 'pkg-102-1',
        name: 'Zen Puppy Kindergarten (6 Sessions)',
        price: 4999,
        sessions: '6 Sessions',
        desc: 'Gentle clicker training for pups aged 2-5 months with potty mastery and positive socialization.'
      },
      {
        id: 'pkg-102-2',
        name: 'Everyday Manners & Loose Leash (10 Sessions)',
        price: 7999,
        sessions: '10 Sessions',
        desc: 'Stop jumping on guests, no-pull walking, stay on bed cue, and polite greeting behavior.'
      }
    ]
  },
  {
    id: 'TRN-103',
    name: 'Capital K9 Sports & Protection Club',
    tagline: 'High-Drive Working Dog Obedience, Agility & Guard Training',
    leadTrainer: 'Vikramaditya Malik (Ex-NSG Commando Canine Instructor)',
    experience: '15+ Years Experience',
    verified: true,
    rating: 4.95,
    reviews: 380,
    trainedCount: 4500,
    state: 'Delhi',
    city: 'Delhi',
    area: 'Vasant Kunj, Chhatarpur & Gurgaon',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp'],
    petTypes: ['Dogs'],
    specialties: ['Protection & Guard Training', 'Agility & Obstacle Sports', 'Advanced Off-Leash Obedience'],
    pricePerSession: 1100,
    packageStarting: 8999,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
    certifications: ['Certified Protection Dog Decoy', 'IPDTA Master Trainer'],
    packages: [
      {
        id: 'pkg-103-1',
        name: 'Off-Leash Reliability & Agility (10 Sessions)',
        price: 8999,
        sessions: '10 Sessions',
        desc: 'Complete control off-leash, distance commands, hurdle jumps, and recall under high distraction.'
      },
      {
        id: 'pkg-103-2',
        name: 'Executive Family Protection & Guard (15 Sessions)',
        price: 14999,
        sessions: '15 Sessions',
        desc: 'Controlled perimeter alert, threat deterrence, handler defense, and instant stand-down command.'
      }
    ]
  },
  {
    id: 'TRN-104',
    name: 'HappyTails Coastal Training Ground',
    tagline: 'Beach Agility, Social Pack Walks & Family Companion Training',
    leadTrainer: 'Nikhil D’Souza (Certified Animal Behavior Consultant)',
    experience: '7+ Years Experience',
    verified: true,
    rating: 4.88,
    reviews: 145,
    trainedCount: 1650,
    state: 'Goa',
    city: 'Panaji',
    area: 'Miramar, Porvorim & Candolim',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp'],
    petTypes: ['Dogs', 'Puppies'],
    specialties: ['Puppy Socialization', 'Basic Obedience', 'Swimming & Water Retrieval'],
    pricePerSession: 750,
    packageStarting: 5499,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800',
    certifications: ['IAABC Member', 'Positive Dog Trainers Union'],
    packages: [
      {
        id: 'pkg-104-1',
        name: 'Coastal Family Dog Program (8 Sessions)',
        price: 5499,
        sessions: '8 Sessions',
        desc: 'Essential home manners, outdoor distraction training, and fun beach social games.'
      }
    ]
  },
  {
    id: 'TRN-105',
    name: 'Nawabi Paws Dog Training Institute',
    tagline: 'Structured Home Obedience & Show Dog Ring Presentation',
    leadTrainer: 'K. Venkatesh Rao (KCI Championship Handler & Master Trainer)',
    experience: '11+ Years Experience',
    verified: true,
    rating: 4.87,
    reviews: 172,
    trainedCount: 2200,
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Banjara Hills, Jubilee Hills & Gachibowli',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp', 'Online Video Consultation'],
    petTypes: ['Dogs', 'Puppies'],
    specialties: ['Basic & Advanced Obedience', 'Show Ring Prep', 'Puppy Socialization'],
    pricePerSession: 800,
    packageStarting: 5999,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800',
    certifications: ['KCI Ring Handler Certification', 'Force-Free Trainer Award 2024'],
    packages: [
      {
        id: 'pkg-105-1',
        name: 'Comprehensive Home Pet Course (10 Sessions)',
        price: 6999,
        sessions: '10 Sessions',
        desc: 'Potty habits, zero biting, greeting visitors calmly, and reliable recall.'
      },
      {
        id: 'pkg-105-2',
        name: 'KCI Conformation Show Stance (8 Sessions)',
        price: 7499,
        sessions: '8 Sessions',
        desc: 'Gaiting stride, stacking position, judge teeth examination, and temperament composure.'
      }
    ]
  },
  {
    id: 'TRN-106',
    name: 'Chennai Canine Sports & Agility Arena',
    tagline: 'Play-Based Positive Dog Training, Flyball & Park Manners',
    leadTrainer: 'R. Senthil Nathan (Canine Sports Coach)',
    experience: '8+ Years Experience',
    verified: true,
    rating: 4.89,
    reviews: 198,
    trainedCount: 2400,
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Adyar, Anna Nagar & ECR Road',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp'],
    petTypes: ['Dogs', 'Puppies'],
    specialties: ['Agility & Tricks', 'Basic Obedience', 'Puppy Socialization'],
    pricePerSession: 799,
    packageStarting: 5799,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=800',
    certifications: ['Certified Canine Fitness Trainer (CCFT)', 'First Aid Certified'],
    packages: [
      {
        id: 'pkg-106-1',
        name: 'Agility & Trick Master (8 Sessions)',
        price: 5799,
        sessions: '8 Sessions',
        desc: 'Hoop jumps, weave poles, roll over, high-five, crawl, and mental puzzle training.'
      }
    ]
  },
  {
    id: 'TRN-107',
    name: 'Bengal Paws Positive Dog Training Club',
    tagline: 'Gentle Behavioral Therapy, Puppy Basics & Guard Protocol',
    leadTrainer: 'Debasish Banerjee (Veterinary Behavior Specialist)',
    experience: '10+ Years Experience',
    verified: true,
    rating: 4.85,
    reviews: 160,
    trainedCount: 1900,
    state: 'West Bengal',
    city: 'Kolkata',
    area: 'Salt Lake, New Town & Alipore',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp'],
    petTypes: ['Dogs', 'Puppies'],
    specialties: ['Basic Obedience', 'Aggression Modification', 'Puppy Socialization'],
    pricePerSession: 750,
    packageStarting: 5299,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?q=80&w=800',
    certifications: ['Certified Applied Animal Behaviorist', 'Force-Free Guild Member'],
    packages: [
      {
        id: 'pkg-107-1',
        name: 'Kolkata Smart Pup Package (8 Sessions)',
        price: 5299,
        sessions: '8 Sessions',
        desc: 'Indoor manners, no food stealing, friendly greeting, and leash walking.'
      }
    ]
  },
  {
    id: 'TRN-108',
    name: 'Royal Rajputana K9 Training School',
    tagline: 'Personalized At-Home Dog Training & Guard Dog Conditioning',
    leadTrainer: 'Harshvardhan Singh Rathore (Canine Training Specialist)',
    experience: '9+ Years Experience',
    verified: true,
    rating: 4.84,
    reviews: 135,
    trainedCount: 1550,
    state: 'Rajasthan',
    city: 'Jaipur',
    area: 'Vaishali Nagar, C-Scheme & Malviya Nagar',
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp'],
    petTypes: ['Dogs', 'Puppies'],
    specialties: ['Basic Obedience', 'Protection & Guard Training', 'Puppy Socialization'],
    pricePerSession: 700,
    packageStarting: 4999,
    phone: '+91 8306-944-422',
    whatsapp: '+91 8306-944-422',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800',
    certifications: ['Professional Dog Trainers Association of India', 'K9 Handler Level 2'],
    packages: [
      {
        id: 'pkg-108-1',
        name: 'Pink City Basic Obedience (8 Sessions)',
        price: 4999,
        sessions: '8 Sessions',
        desc: 'Core voice commands, door bolting prevention, sit-stay, and polite walking.'
      }
    ]
  }
];

// Persistent LocalStorage Helpers

export const getStoredTrainingProviders = () => {
  try {
    const data = localStorage.getItem('pawora_training_providers');
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed reading stored training providers:', err);
  }
  return INITIAL_TRAINING_PROVIDERS;
};

export const saveTrainingBooking = (booking) => {
  try {
    const current = JSON.parse(localStorage.getItem('pawora_training_bookings') || '[]');
    const updated = [booking, ...current];
    localStorage.setItem('pawora_training_bookings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('training-booking-created', { detail: booking }));
    return updated;
  } catch (err) {
    console.error('Failed to save training booking:', err);
    return [];
  }
};

export const getStoredTrainingBookings = () => {
  try {
    return JSON.parse(localStorage.getItem('pawora_training_bookings') || '[]');
  } catch (err) {
    console.error('Failed to read training bookings:', err);
    return [];
  }
};

export const saveTrainingEnquiry = (enquiry) => {
  try {
    const current = JSON.parse(localStorage.getItem('pawora_training_enquiries') || '[]');
    const newEnquiry = {
      id: 'TRN-ENQ-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      status: 'Under Review',
      quoteAmount: null,
      quoteMessage: null,
      ...enquiry
    };
    const updated = [newEnquiry, ...current];
    localStorage.setItem('pawora_training_enquiries', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('training-enquiry-created', { detail: newEnquiry }));
    return newEnquiry;
  } catch (err) {
    console.error('Failed to save training enquiry:', err);
    return null;
  }
};

export const getStoredTrainingEnquiries = () => {
  try {
    return JSON.parse(localStorage.getItem('pawora_training_enquiries') || '[]');
  } catch (err) {
    console.error('Failed to read training enquiries:', err);
    return [];
  }
};

export const updateTrainingEnquiryStatus = (enquiryId, status, quoteAmount = null, quoteMessage = null) => {
  try {
    const current = getStoredTrainingEnquiries();
    const updated = current.map((enq) => {
      if (enq.id === enquiryId) {
        return {
          ...enq,
          status,
          ...(quoteAmount !== null ? { quoteAmount } : {}),
          ...(quoteMessage !== null ? { quoteMessage } : {}),
          updatedAt: new Date().toISOString()
        };
      }
      return enq;
    });
    localStorage.setItem('pawora_training_enquiries', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('training-enquiry-updated', { detail: { enquiryId, status, quoteAmount, quoteMessage } }));
    return updated;
  } catch (err) {
    console.error('Failed to update training enquiry status:', err);
    return [];
  }
};

export const getUserTrainingEnquiries = (user) => {
  const all = getStoredTrainingEnquiries();
  if (!user) return [];
  const uId = user._id || user.id;
  return all.filter((enq) => enq.userId === uId || enq.userEmail === user.email);
};

export const getProviderTrainingEnquiries = (providerId) => {
  const all = getStoredTrainingEnquiries();
  if (!providerId) return all;
  return all.filter((enq) => enq.providerId === providerId || enq.providerId === 'ALL-TRAINERS');
};

