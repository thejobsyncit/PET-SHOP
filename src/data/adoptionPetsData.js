// Shared Adoption Pets dataset with persistent storage, in-memory caching, and image compression

export const CATEGORY_BREEDS = {
  dogs: [
    'Labrador Retriever',
    'Indian Breed (Indie)',
    'Golden Retriever',
    'German Shepherd',
    'Beagle',
    'Pomeranian',
    'Shih Tzu',
    'Indian Spitz',
    'Siberian Husky',
    'Rottweiler',
    'French Bulldog',
    'Pug',
    'Doberman',
    'Other Dog Breed'
  ],
  cats: [
    'Persian Cat',
    'Indie Cat',
    'British Shorthair',
    'Siamese Cat',
    'Maine Coon',
    'Bengal Cat',
    'Ragdoll',
    'Other Cat Breed'
  ],
  birds: [
    'Scarlet Macaw',
    'Cockatiel',
    'Lovebird',
    'Budgerigar (Budgie)',
    'African Grey Parrot',
    'Sun Conure',
    'Canary / Finch',
    'Other Bird Breed'
  ]
};

export const POPULAR_BREEDS = [
  { name: 'Labrador Retriever', count: 122, type: 'dogs' },
  { name: 'Indian Breed (Indie)', count: 119, type: 'dogs' },
  { name: 'Golden Retriever', count: 87, type: 'dogs' },
  { name: 'German Shepherd', count: 48, type: 'dogs' },
  { name: 'Beagle', count: 38, type: 'dogs' },
  { name: 'Pomeranian', count: 27, type: 'dogs' },
  { name: 'Shih Tzu', count: 26, type: 'dogs' },
  { name: 'Persian Cat', count: 45, type: 'cats' },
  { name: 'Indie Cat', count: 34, type: 'cats' },
  { name: 'British Shorthair', count: 21, type: 'cats' },
  { name: 'Scarlet Macaw', count: 18, type: 'birds' },
  { name: 'Cockatiel', count: 24, type: 'birds' },
  { name: 'Lovebird', count: 19, type: 'birds' }
];

export const INDIAN_STATES_CITIES = {
  'All States': ['All Cities'],
  'Karnataka': ['All Cities', 'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
  'Maharashtra': ['All Cities', 'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  'Delhi NCR': ['All Cities', 'New Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'],
  'Tamil Nadu': ['All Cities', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Telangana': ['All Cities', 'Hyderabad', 'Warangal', 'Nizamabad'],
  'Gujarat': ['All Cities', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Uttar Pradesh': ['All Cities', 'Lucknow', 'Jhansi', 'Kanpur', 'Agra', 'Varanasi', 'Noida'],
  'Rajasthan': ['All Cities', 'Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Punjab': ['All Cities', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali'],
  'West Bengal': ['All Cities', 'Kolkata', 'Howrah', 'Durgapur', 'Siliguri']
};

export const DEFAULT_ADOPTION_PETS = [
  {
    id: 'adopt_1',
    name: 'Prince',
    type: 'dogs',
    breed: 'Golden Retriever',
    gender: 'Male',
    age: '8 Weeks',
    ageGroup: 'puppy',
    city: 'Jhansi',
    state: 'Uttar Pradesh',
    quality: 'Pet Quality',
    personality: 'Playful, Friendly, intelligent',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Ramesh Sharma',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Prince is a joyous, active Golden Retriever puppy who loves cuddles, belly rubs, and playing with squeaky toys. Great with kids and first-time owners! He has completed his first round of DHPP puppy vaccinations and is healthy, active, and super eager to learn.'
  },
  {
    id: 'adopt_2',
    name: 'Leo',
    type: 'dogs',
    breed: 'Golden Retriever',
    gender: 'Male',
    age: '10 Weeks',
    ageGroup: 'puppy',
    city: 'Pune',
    state: 'Maharashtra',
    quality: 'Pet Quality',
    personality: 'Loyal, energetic, loving',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Pooja Verma',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Leo is an affectionate, healthy Golden pup looking for a loving home with a yard or regular park visits. Very sociable and loves humans.'
  },
  {
    id: 'adopt_3',
    name: 'Daisy',
    type: 'dogs',
    breed: 'Shih Tzu',
    gender: 'Female',
    age: '12 Weeks',
    ageGroup: 'puppy',
    city: 'Bangalore',
    state: 'Karnataka',
    quality: 'Pet Quality',
    personality: 'Gentle, Calm, affectionate',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Ananya Reddy',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Daisy is a tiny ball of fluff who enjoys lap naps, gentle brushing, and indoor play. Ideal companion for apartments and quiet homes.'
  },
  {
    id: 'adopt_4',
    name: 'Dollar',
    type: 'dogs',
    breed: 'Rottweiler',
    gender: 'Male',
    age: '14 Weeks',
    ageGroup: 'puppy',
    city: 'Jhansi',
    state: 'Uttar Pradesh',
    quality: 'Pet Quality',
    personality: 'Gentle Giant, patient, sweet',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Kapil Joshi',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Dollar is an adorable big-pawed puppy with a heart of gold. Loves lazy afternoon stretches and gentle walks.'
  },
  {
    id: 'adopt_5',
    name: 'Simba',
    type: 'dogs',
    breed: 'Indian Breed (Indie)',
    gender: 'Male',
    age: '6 Months',
    ageGroup: 'puppy',
    city: 'Pune',
    state: 'Maharashtra',
    quality: 'Pet Quality',
    personality: 'Intelligent, hardy, loyal',
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Sanjay Nair',
    fee: 0,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    description: 'Simba is a rescued Indie hero with high natural immunity, sharp intelligence, and unconditional loyalty. Fully vaccinated and dewormed.'
  },
  {
    id: 'adopt_6',
    name: 'Cooper Sharma',
    type: 'dogs',
    breed: 'Golden Retriever',
    gender: 'Male',
    age: '1 Year',
    ageGroup: 'young',
    city: 'Jaipur',
    state: 'Rajasthan',
    quality: 'Pet Quality',
    personality: 'Playful, Friendly, intelligent',
    image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Vikram Sharma',
    fee: 0,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    description: 'Cooper is a trained 1-year-old family Golden who knows basic commands (sit, stay, paw). Looking for an active family.'
  },
  {
    id: 'adopt_7',
    name: 'Bella',
    type: 'dogs',
    breed: 'Siberian Husky',
    gender: 'Female',
    age: '1.5 Years',
    ageGroup: 'young',
    city: 'New Delhi',
    state: 'Delhi NCR',
    quality: 'Champion Bloodline',
    personality: 'Vocal, energetic, stunning',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Meera Khanna',
    fee: 0,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    description: 'Bella is a gorgeous blue-eyed Siberian Husky. Needs daily exercise and an air-conditioned room in peak summer.'
  },
  {
    id: 'adopt_8',
    name: 'Milo',
    type: 'cats',
    breed: 'Persian Cat',
    gender: 'Male',
    age: '5 Months',
    ageGroup: 'puppy',
    city: 'Mumbai',
    state: 'Maharashtra',
    quality: 'KCI Registered',
    personality: 'Calm, cuddly, fluffy',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Sneha Patel',
    fee: 0,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    description: 'Milo is a serene white Persian kitten with fluffy fur and amber eyes. Fully litter-trained and peaceful.'
  },
  {
    id: 'adopt_9',
    name: 'Bruno',
    type: 'dogs',
    breed: 'Beagle',
    gender: 'Male',
    age: '4 Months',
    ageGroup: 'puppy',
    city: 'Chennai',
    state: 'Tamil Nadu',
    quality: 'Pet Quality',
    personality: 'Curious, happy, food lover',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eaa75e6a?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1504450758481-7338eaa75e6a?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Karthik Raja',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Bruno is an alert tri-color Beagle puppy with floppy ears and a wagging tail. Very friendly with other pets and kids.'
  },
  {
    id: 'adopt_10',
    name: 'Rocky',
    type: 'dogs',
    breed: 'German Shepherd',
    gender: 'Male',
    age: '7 Months',
    ageGroup: 'puppy',
    city: 'Bangalore',
    state: 'Karnataka',
    quality: 'KCI Registered',
    personality: 'Attentive, Courageous, loyal',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Deepak Rao',
    fee: 0,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    description: 'Rocky is an active German Shepherd with great obedience training foundations. Looking for an enthusiastic guardian.'
  },
  {
    id: 'adopt_11',
    name: 'Chloe',
    type: 'dogs',
    breed: 'Pomeranian',
    gender: 'Female',
    age: '6 Months',
    ageGroup: 'puppy',
    city: 'Kolkata',
    state: 'West Bengal',
    quality: 'Pet Quality',
    personality: 'Playful, lively, friendly',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Rina Mukherjee',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Chloe is a joyful white Pomeranian with a puffy coat and cheerful personality. Loves playing fetch and lap cuddles.'
  },
  {
    id: 'adopt_12',
    name: 'Rio',
    type: 'birds',
    breed: 'Cockatiel',
    gender: 'Male',
    age: '1 Year',
    ageGroup: 'young',
    city: 'Bangalore',
    state: 'Karnataka',
    quality: 'Pet Quality',
    personality: 'Whistling, Friendly, curious',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Manish Hegde',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Rio is a hand-tamed yellow crested Cockatiel that whistles sweet tunes and steps up on fingers effortlessly.'
  },
  {
    id: 'adopt_13',
    name: 'Mango',
    type: 'birds',
    breed: 'Scarlet Macaw',
    gender: 'Male',
    age: '2 Years',
    ageGroup: 'young',
    city: 'Mumbai',
    state: 'Maharashtra',
    quality: 'Champion Bloodline',
    personality: 'Vibrant, Talking, friendly',
    image: 'https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=800',
      'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=800'
    ],
    parentContact: '+91 8306-688-827',
    parentName: 'Rohan Deshmukh',
    fee: 0,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    description: 'Mango is a hand-raised, talkative Scarlet Macaw with bright red, yellow, and blue plumage. Very intelligent, knows a few words, and enjoys fruit treats.'
  }
];

// Global in-memory cache to guarantee instant cross-page synchronization in SPA
let memoryPetsCache = null;

export const getStoredAdoptionPets = () => {
  if (memoryPetsCache && Array.isArray(memoryPetsCache) && memoryPetsCache.length > 0) {
    return memoryPetsCache;
  }
  try {
    const saved = localStorage.getItem('pawora_adoption_pets') || sessionStorage.getItem('pawora_adoption_pets');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPetsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Storage read warning:', e);
  }
  memoryPetsCache = DEFAULT_ADOPTION_PETS;
  return DEFAULT_ADOPTION_PETS;
};

export const saveAdoptionPet = (newPet) => {
  const current = getStoredAdoptionPets();
  // Ensure no duplicate IDs
  const filtered = current.filter((p) => p.id !== newPet.id);
  const updated = [newPet, ...filtered];
  memoryPetsCache = updated;

  try {
    localStorage.setItem('pawora_adoption_pets', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage quota warning, falling back to sessionStorage & memory cache', e);
    try {
      sessionStorage.setItem('pawora_adoption_pets', JSON.stringify(updated));
    } catch (se) {}
  }
  return updated;
};

// Canvas-based image compressor to turn any 5MB-10MB camera photo into a lightweight ~60KB web image
export const compressImageFile = (file, maxWidth = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// =========================================================================
// ADOPTION APPLICATIONS & ENQUIRIES STORAGE SYSTEM
// =========================================================================
let memoryApplicationsCache = null;

export const getStoredAdoptionApplications = () => {
  if (memoryApplicationsCache && Array.isArray(memoryApplicationsCache)) {
    return memoryApplicationsCache;
  }
  try {
    const saved = localStorage.getItem('pawora_adoption_applications') || sessionStorage.getItem('pawora_adoption_applications');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        memoryApplicationsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Applications storage read error:', e);
  }
  memoryApplicationsCache = [];
  return [];
};

export const saveAdoptionApplication = (newApp) => {
  const current = getStoredAdoptionApplications();
  const filtered = current.filter((a) => a.id !== newApp.id);
  const updated = [newApp, ...filtered];
  memoryApplicationsCache = updated;

  try {
    localStorage.setItem('pawora_adoption_applications', JSON.stringify(updated));
  } catch (e) {
    try {
      sessionStorage.setItem('pawora_adoption_applications', JSON.stringify(updated));
    } catch (se) {}
  }
  return updated;
};

export const updateAdoptionApplicationStatus = (appId, newStatus, guardianNotes = '') => {
  const current = getStoredAdoptionApplications();
  const updated = current.map((app) => {
    if (app.id === appId) {
      return {
        ...app,
        status: newStatus,
        guardianNotes: guardianNotes || app.guardianNotes,
        updatedAt: new Date().toISOString()
      };
    }
    return app;
  });
  memoryApplicationsCache = updated;

  try {
    localStorage.setItem('pawora_adoption_applications', JSON.stringify(updated));
  } catch (e) {
    try {
      sessionStorage.setItem('pawora_adoption_applications', JSON.stringify(updated));
    } catch (se) {}
  }
  return updated;
};

// Get all applications submitted BY a specific user
export const getUserAdoptionApplications = (user) => {
  if (!user) return [];
  const all = getStoredAdoptionApplications();
  const userId = user._id || user.id;
  const userEmail = (user.email || '').toLowerCase().trim();
  const userPhoneClean = (user.mobile || '').replace(/\D/g, '');

  return all.filter((app) => {
    const appUserId = app.applicantId;
    const appEmail = (app.applicantEmail || '').toLowerCase().trim();
    const appPhoneClean = (app.applicantPhone || '').replace(/\D/g, '');

    const idMatch = userId && appUserId && (appUserId === userId || String(appUserId) === String(userId));
    const emailMatch = userEmail && appEmail && appEmail === userEmail;
    const phoneMatch = userPhoneClean.length >= 10 && appPhoneClean && (
      appPhoneClean === userPhoneClean ||
      appPhoneClean.endsWith(userPhoneClean) ||
      userPhoneClean.endsWith(appPhoneClean)
    );

    return idMatch || emailMatch || phoneMatch;
  });
};

// Get all pets listed BY a specific user
export const getGuardianListedPets = (user) => {
  if (!user) return [];
  const allPets = getStoredAdoptionPets();
  const userId = user._id || user.id;
  const userEmail = (user.email || '').toLowerCase().trim();
  const userPhoneClean = (user.mobile || '').replace(/\D/g, '');

  return allPets.filter((pet) => {
    const petOwnerId = pet.ownerId;
    const petOwnerEmail = (pet.ownerEmail || '').toLowerCase().trim();
    const petOwnerPhone = (pet.ownerPhone || pet.parentContact || '').replace(/\D/g, '');

    const idMatch = userId && petOwnerId && (petOwnerId === userId || String(petOwnerId) === String(userId));
    const emailMatch = userEmail && petOwnerEmail && petOwnerEmail === userEmail;
    const phoneMatch = userPhoneClean.length >= 10 && petOwnerPhone && (
      petOwnerPhone === userPhoneClean ||
      petOwnerPhone.endsWith(userPhoneClean) ||
      userPhoneClean.endsWith(petOwnerPhone)
    );

    return idMatch || emailMatch || phoneMatch;
  });
};

// Get all applications received FOR pets listed by this guardian
export const getGuardianAdoptionApplications = (user) => {
  if (!user) return [];
  const guardianPets = getGuardianListedPets(user);
  const guardianPetIds = new Set(guardianPets.map((p) => String(p.id)));

  const allApps = getStoredAdoptionApplications();
  const userId = user._id || user.id;
  const userEmail = (user.email || '').toLowerCase().trim();
  const userPhoneClean = (user.mobile || '').replace(/\D/g, '');

  return allApps.filter((app) => {
    // Matches if the application is for one of the guardian's pets
    if (app.petId && guardianPetIds.has(String(app.petId))) {
      return true;
    }
    // Or matches guardian ID / phone / email recorded on application
    const gId = app.guardianId;
    const gEmail = (app.guardianEmail || '').toLowerCase().trim();
    const gPhoneClean = (app.guardianPhone || '').replace(/\D/g, '');

    const idMatch = userId && gId && (gId === userId || String(gId) === String(userId));
    const emailMatch = userEmail && gEmail && gEmail === userEmail;
    const phoneMatch = userPhoneClean.length >= 10 && gPhoneClean && (
      gPhoneClean === userPhoneClean ||
      gPhoneClean.endsWith(userPhoneClean) ||
      userPhoneClean.endsWith(gPhoneClean)
    );

    return idMatch || emailMatch || phoneMatch;
  });
};

