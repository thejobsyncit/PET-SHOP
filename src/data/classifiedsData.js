export const DEFAULT_CLASSIFIEDS = [
  // ===================== FISH & AQUATICS =====================
  {
    _id: 'LIST-FISH-01',
    user: { _id: 'seller-aqua-01', name: 'Karthik Raja (Aqua Exotics)', email: 'aqua.exotics@joshpetshub.com' },
    title: 'Show Grade Super Red Arowana (Microchipped with CITES Certificate)',
    petType: 'fish',
    breed: 'Super Red Arowana',
    age: '1.5 years',
    price: 38000,
    quantity: 2,
    description: 'High-back Super Red Arowana with vibrant crimson gill covers and broad pectoral fins. Comes with international microchip certificate, CITES registration, and pristine water test records. Fed on premium Hikari sticks.',
    images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop'],
    location: 'Bangalore, KA',
    contactPhone: '+91 98450 12345',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'Water Quarantine & Parasite Free Certified',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'LIST-FISH-02',
    user: { _id: 'seller-aqua-02', name: 'Deep Blue Aquatics', email: 'deepblue@joshpetshub.com' },
    title: 'Champion Line Kamfa Flowerhorn (High Kok & Crosshead Pearls)',
    petType: 'fish',
    breed: 'Flowerhorn Cichlid',
    age: '11 months',
    price: 12500,
    quantity: 1,
    description: 'Stunning Kamfa Flowerhorn boasting a massive water kok, metallic pearl distribution, and deep ruby-red chest. Highly energetic, finger-follows, and conditioned in 7.8 pH stabilized water.',
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800&auto=format&fit=crop'],
    location: 'Chennai, TN',
    contactPhone: '+91 94440 98765',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'De-wormed & Health Verified',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'LIST-FISH-03',
    user: { _id: 'seller-aqua-03', name: 'Oceanic Discus Hatchery', email: 'discus@joshpetshub.com' },
    title: 'Breeding Pair of German Blue Diamond Discus',
    petType: 'fish',
    breed: 'Discus Fish (Blue Diamond / Pigeon Blood)',
    age: '9 months',
    price: 7500,
    quantity: 3,
    description: 'Proven bonded breeding pair of pure Blue Diamond Discus. Pristine disc shape, solid turquoise-blue color without stress bars. Accustomed to normal RO/tap water blend and granules.',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'],
    location: 'Mumbai, MH',
    contactPhone: '+91 98200 45678',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'Health & Parasite Free Checked',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'LIST-FISH-04',
    user: { _id: 'seller-aqua-04', name: 'Green Aqua Studios', email: 'greenaqua@joshpetshub.com' },
    title: 'Show Guppy Trio - Pure Full Red Moscow Strain',
    petType: 'fish',
    breed: 'Show Guppy (Full Red / Blue / Moscow)',
    age: '3.5 months',
    price: 1400,
    quantity: 5,
    description: 'High dorsal, wide delta-tail pure Full Red Moscow Guppy trio (1 male + 2 females). Active surface feeders, peaceful temperament, raised in planted live tanks.',
    images: ['https://images.unsplash.com/photo-1520315342629-6ea920342047?q=80&w=800&auto=format&fit=crop'],
    location: 'Kochi, KL',
    contactPhone: '+91 97450 67890',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: null,
    createdAt: new Date().toISOString()
  },

  // ===================== DOGS =====================
  {
    _id: 'LIST-DOG-01',
    user: { _id: 'seller-dog-01', name: 'Royal Paws Kennel', email: 'royalpaws@joshpetshub.com' },
    title: 'KCI Certified Siberian Husky Puppy (Blue-Eyed)',
    petType: 'dogs',
    breed: 'Siberian Husky',
    age: '2.5 months',
    price: 32000,
    quantity: 1,
    description: 'Striking purebred Siberian Husky puppy with piercing dual-blue eyes and silver-white plush double coat. Microchipped, first 7-in-1 vaccination completed, de-wormed.',
    images: ['https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800&auto=format&fit=crop'],
    location: 'Delhi NCR',
    contactPhone: '+91 98765 43210',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: '7-in-1 Vaccinated & Microchipped',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'LIST-DOG-02',
    user: { _id: 'seller-dog-02', name: 'Golden Haven Kennels', email: 'golden@joshpetshub.com' },
    title: 'Golden Retriever Puppies (Heavy Bone Structure)',
    petType: 'dogs',
    breed: 'Golden Retriever',
    age: '2 months',
    price: 24000,
    quantity: 3,
    description: 'Champion line golden retriever puppies. Very affectionate, playful, raised around children and fully vet health verified.',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop'],
    location: 'Pune, MH',
    contactPhone: '+91 91234 56780',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'Puppy DP Complete',
    createdAt: new Date().toISOString()
  },

  // ===================== CATS =====================
  {
    _id: 'LIST-CAT-01',
    user: { _id: 'seller-cat-01', name: 'Fluffy Felines Cattery', email: 'cattery@joshpetshub.com' },
    title: 'Purebred Punch Face Persian Kitten (White Doll Face)',
    petType: 'cats',
    breed: 'Persian Cat',
    age: '3 months',
    price: 18000,
    quantity: 2,
    description: 'Ultra-plush long coat punch-face Persian kitten. Litter trained, de-wormed, gentle lap temperament, fed on Royal Canin Mother & Babycat.',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop'],
    location: 'Bangalore, KA',
    contactPhone: '+91 80123 45678',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'Tricat Vaccinated',
    createdAt: new Date().toISOString()
  },

  // ===================== BIRDS =====================
  {
    _id: 'LIST-BIRD-01',
    user: { _id: 'seller-bird-01', name: 'Parrot Paradise Avian Farm', email: 'aviary@joshpetshub.com' },
    title: 'Hand-Tamed Talking African Grey Parrot',
    petType: 'birds',
    breed: 'African Grey Parrot',
    age: '1.2 years',
    price: 45000,
    quantity: 1,
    description: 'Extremely intelligent hand-reared African Grey. Whistles tunes, responds to names, mimic sounds, loves shoulder perching. Includes closed leg band and health certificate.',
    images: ['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800&auto=format&fit=crop'],
    location: 'Hyderabad, TS',
    contactPhone: '+91 99000 88888',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'Avian Vet Cleared',
    createdAt: new Date().toISOString()
  },

  // ===================== REPTILES =====================
  {
    _id: 'LIST-REP-01',
    user: { _id: 'seller-rep-01', name: 'Exotic Herp Hub', email: 'herphub@joshpetshub.com' },
    title: 'Hypo Citrus Bearded Dragon (Juvenile Captive Bred)',
    petType: 'reptiles',
    breed: 'Bearded Dragon',
    age: '5 months',
    price: 22000,
    quantity: 2,
    description: 'Vibrant yellow/orange Citrus morph Bearded Dragon. Feeding greedily on gut-loaded Dubia roaches and collard greens. Accustomed to gentle handling.',
    images: ['https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?q=80&w=800&auto=format&fit=crop'],
    location: 'Kolkata, WB',
    contactPhone: '+91 98300 11223',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'Captive Bred Certificate',
    createdAt: new Date().toISOString()
  },

  // ===================== SMALL PETS =====================
  {
    _id: 'LIST-SP-01',
    user: { _id: 'seller-sp-01', name: 'Cozy Warren Rabbitry', email: 'rabbits@joshpetshub.com' },
    title: 'Pure Holland Lop Bunny (Broken Blue Eyes)',
    petType: 'small-pets',
    breed: 'Holland Lop Rabbit',
    age: '2.5 months',
    price: 4500,
    quantity: 3,
    description: 'Adorable dwarf Holland Lop bunny with drooping ears and compact body. Calm temperament, litter box trained, loves Timothy hay and green leafy treats.',
    images: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=800&auto=format&fit=crop'],
    location: 'Ahmedabad, GJ',
    contactPhone: '+91 97230 44556',
    isVerified: true,
    status: 'Available',
    vaccinationCertificate: 'Parasite Checked',
    createdAt: new Date().toISOString()
  }
];

export const getStoredClassifieds = () => {
  try {
    const raw = localStorage.getItem('joshpetshub_classified_listings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const customIds = new Set(parsed.map(p => (p._id || p.id)?.toString()));
        const missingDefaults = DEFAULT_CLASSIFIEDS.filter(d => !customIds.has(d._id));
        return [...parsed, ...missingDefaults];
      }
    }
  } catch (err) {
    console.warn('Error reading stored classifieds:', err);
  }
  return DEFAULT_CLASSIFIEDS;
};

export const getPetListingById = (id) => {
  if (!id) return null;
  const all = getStoredClassifieds();
  const searchId = id.toString().trim().toLowerCase();
  return all.find(p => {
    const pid = (p._id || p.id || '').toString().trim().toLowerCase();
    return pid === searchId;
  }) || null;
};

/**
 * Persist a pet purchase order in local storage for order history & invoices
 */
export const savePetOrder = (order) => {
  if (!order || !(order._id || order.id)) return null;
  try {
    const rawAll = localStorage.getItem('joshpetshub_orders');
    const allOrders = rawAll ? JSON.parse(rawAll) : [];
    const targetId = order._id || order.id;

    const existingIdx = allOrders.findIndex(o => (o._id || o.id) === targetId);
    if (existingIdx >= 0) {
      allOrders[existingIdx] = { ...allOrders[existingIdx], ...order };
    } else {
      allOrders.unshift(order);
    }
    localStorage.setItem('joshpetshub_orders', JSON.stringify(allOrders));

    // Also save in user-specific namespace
    const userIdentifier = order.userId || order.user?._id || order.user || order.userEmail || order.email;
    if (userIdentifier) {
      const safeKey = String(userIdentifier).replace(/[^a-zA-Z0-9]/g, '_');
      const rawUser = localStorage.getItem(`joshpetshub_user_orders_${safeKey}`);
      const userOrders = rawUser ? JSON.parse(rawUser) : [];
      const userIdx = userOrders.findIndex(o => (o._id || o.id) === targetId);
      if (userIdx >= 0) {
        userOrders[userIdx] = { ...userOrders[userIdx], ...order };
      } else {
        userOrders.unshift(order);
      }
      localStorage.setItem(`joshpetshub_user_orders_${safeKey}`, JSON.stringify(userOrders));
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('pet-order-created', { detail: order }));
      } catch (_) {}
    }

    return order;
  } catch (err) {
    console.error('Error saving pet order to localStorage:', err);
    return order;
  }
};

/**
 * Retrieve all pet purchase orders belonging to the user
 */
export const getStoredPetOrders = (currentUser) => {
  try {
    const rawAll = localStorage.getItem('joshpetshub_orders');
    const allOrders = rawAll ? JSON.parse(rawAll) : [];

    const userIdentifier = currentUser?._id || currentUser?.id || currentUser?.email;
    let userSpecific = [];
    if (userIdentifier) {
      const safeKey = String(userIdentifier).replace(/[^a-zA-Z0-9]/g, '_');
      const rawUser = localStorage.getItem(`joshpetshub_user_orders_${safeKey}`);
      if (rawUser) {
        userSpecific = JSON.parse(rawUser);
      }
    }

    const combined = [...userSpecific];
    const seenIds = new Set(combined.map(o => (o._id || o.id)?.toString()));

    for (const o of allOrders) {
      const oId = (o._id || o.id)?.toString();
      if (!seenIds.has(oId)) {
        if (!currentUser) {
          combined.push(o);
          seenIds.add(oId);
        } else {
          const match =
            (o.userId && (o.userId === currentUser._id || o.userId === currentUser.id)) ||
            (o.user && (o.user === currentUser._id || o.user === currentUser.id || o.user?._id === currentUser._id)) ||
            (o.userEmail && currentUser.email && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
            (o.buyerEmail && currentUser.email && o.buyerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
            (o.orderType === 'PET_PURCHASE'); // allow newly placed pet orders to display for current session

          if (match) {
            combined.push(o);
            seenIds.add(oId);
          }
        }
      }
    }

    return combined.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
  } catch (err) {
    console.warn('Error reading stored pet orders:', err);
    return [];
  }
};

/**
 * Update a pet listing's status to Sold Out after purchase
 */
export const markPetListingAsSold = (listingId) => {
  if (!listingId) return;
  try {
    const allListings = getStoredClassifieds();
    const updated = allListings.map(l => {
      if ((l._id || l.id)?.toString() === listingId.toString()) {
        return { ...l, status: 'Sold Out', quantity: 0 };
      }
      return l;
    });
    localStorage.setItem('joshpetshub_classified_listings', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not mark listing as sold in storage:', e);
  }
};
