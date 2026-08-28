import bcrypt from 'bcrypt';

// Helper to hash passwords for seeding
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

export const categories = [
  // Dogs
  { name: 'Dog Food', slug: 'dog-food', petType: 'dogs', description: 'Nutritious everyday food for dogs', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600' },
  { name: 'Treats', slug: 'dog-treats', petType: 'dogs', description: 'Delicious training treats and chews', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600' },
  { name: 'Dog Beds & Cotes', slug: 'dog-beds', petType: 'dogs', description: 'Cozy and orthopedic beds for sleeping', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600' },
  // Birds
  { name: 'Bird Food', slug: 'bird-food', petType: 'birds', description: 'Premium seed mixes and pellets for birds', image: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?q=80&w=600' },
  { name: 'Cages & Habitat', slug: 'bird-cages', petType: 'birds', description: 'Spacious and safe cages for birds', image: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?q=80&w=600' },
  // Reptiles
  { name: 'Terrariums', slug: 'terrariums', petType: 'reptiles', description: 'Premium glass terrariums and lockable enclosures', image: 'https://images.unsplash.com/photo-1504450758481-7338eaa75e6a?q=80&w=600' },
  { name: 'Heating & Lighting', slug: 'reptile-heating', petType: 'reptiles', description: 'UVB bulbs and heat regulators', image: 'https://images.unsplash.com/photo-1518382473461-13769c0d16c5?q=80&w=600' },
  // Fish
  { name: 'Aquariums & Tanks', slug: 'aquariums', petType: 'fish', description: 'Glass fish tanks and nano aquariums', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=600' },
  { name: 'Water Care & Filtration', slug: 'water-care', petType: 'fish', description: 'Filters, water conditioners, and clarifiers', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600' },
  // Pharmacy
  { name: 'Vitamins & Supplements', slug: 'pet-vitamins', petType: 'pharmacy', description: 'Immunity boosters, skin and joint care supplements', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600' },
  { name: 'First Aid & Healthcare', slug: 'pet-healthcare', petType: 'pharmacy', description: 'First aid kits, antiseptic sprays, and dental care', image: 'https://images.unsplash.com/photo-1607619056574-7b8d304b3b86?q=80&w=600' }
];

export const brands = [
  'Royal Canin', 'Pedigree', 'Drools', 'Zoo Med', 'Exo Terra', 'API', 'Hikari', 'Himalaya', 'Beaphar', 'Pawora'
];

export const users = [
  {
    name: 'Pawora Admin',
    email: 'admin@pawora.com',
    password: hashPassword('Admin@123'),
    role: 'ADMIN',
    addresses: [
      {
        name: 'Pawora Corporate HQ',
        phone: '9876543210',
        streetAddress: '12, Luxury Retail Lane, MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
        isDefault: true
      }
    ]
  },
  {
    name: 'Aarav Sharma',
    email: 'customer1@pawora.com',
    password: hashPassword('Customer@123'),
    role: 'CUSTOMER',
    addresses: [
      {
        name: 'Aarav Sharma',
        phone: '9123456789',
        streetAddress: 'Block C, Flat 402, Prestige Heights',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        isDefault: true
      }
    ]
  },
  {
    name: 'Ananya Iyer',
    email: 'customer2@pawora.com',
    password: hashPassword('Customer@123'),
    role: 'CUSTOMER',
    addresses: [
      {
        name: 'Ananya Iyer',
        phone: '9822334455',
        streetAddress: 'Plot 45, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India',
        isDefault: true
      }
    ]
  },
  {
    name: 'Rahul Verma',
    email: 'customer3@pawora.com',
    password: hashPassword('Customer@123'),
    role: 'CUSTOMER',
    addresses: []
  },
  {
    name: 'Pooja Nair',
    email: 'customer4@pawora.com',
    password: hashPassword('Customer@123'),
    role: 'CUSTOMER',
    addresses: []
  },
  {
    name: 'Vikram Singh',
    email: 'customer5@pawora.com',
    password: hashPassword('Customer@123'),
    role: 'CUSTOMER',
    addresses: []
  }
];

export const products = [
  // ------------------ DOG PRODUCTS ------------------
  {
    name: 'Royal Canin Size Health Nutrition Maxi Adult Dog Food',
    slug: 'royal-canin-maxi-adult-dog-food',
    brand: 'Royal Canin',
    sku: 'DOG-RC-MAXI-15KG',
    description: 'Dry food tailored for large breed adult dogs (26 to 44 kg) from 15 months to 5 years old.',
    longDescription: 'Formulated with high-quality protein and a balanced fiber blend, Royal Canin Maxi Adult supports optimal digestibility. It helps support large breed dogs\' healthy bones and joints, which can be placed under stress by body weight. It is also enriched with Omega-3 fatty acids (EPA and DHA) to maintain healthy skin and coat.',
    ingredients: ['Dehydrated poultry protein', 'Maize', 'Maize flour', 'Animal fats', 'Wheat', 'Rice', 'Hydrolyzed animal proteins'],
    specifications: [
      { label: 'Weight', value: '15 kg' },
      { label: 'Life Stage', value: 'Adult' },
      { label: 'Breed Size', value: 'Maxi (Large)' },
      { label: 'Food Type', value: 'Dry Food' }
    ],
    price: 6400,
    discountPrice: 5760,
    rating: 4.8,
    reviewCount: 42,
    stock: 25,
    lowStockThreshold: 4,
    images: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'
    ],
    category: 'Dog Food',
    subcategory: 'Dog Food',
    petType: 'dogs',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Drools Focus Super Premium Adult Dog Food',
    slug: 'drools-focus-adult-dog-food',
    brand: 'Drools',
    sku: 'DOG-DR-FOCUS-4KG',
    description: 'Super premium dry food with real chicken for adult dogs of all breeds.',
    longDescription: 'Drools Focus Adult Dog Food is formulated with no wheat, corn, or soy. It uses real chicken as the #1 ingredient to support muscle maintenance and boasts prebiotics and probiotics for optimal digestion. DHA from fish oil is added to promote cognitive health and joint supplements (Glucosamine & Chondroitin) are integrated to support mobility.',
    ingredients: ['Real Chicken', 'Whole Dried Egg', 'Long Grain Rice', 'Oat Meal', 'Flax Seed Oil', 'Salmon Oil'],
    specifications: [
      { label: 'Weight', value: '4 kg' },
      { label: 'Life Stage', value: 'Adult' },
      { label: 'Food Type', value: 'Dry Food' }
    ],
    price: 1800,
    discountPrice: 1620,
    rating: 4.4,
    reviewCount: 15,
    stock: 30,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800'],
    category: 'Dog Food',
    subcategory: 'Dog Food',
    petType: 'dogs',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Pedigree Dentastix Medium Dog Dental Treats',
    slug: 'pedigree-dentastix-medium-treats',
    brand: 'Pedigree',
    sku: 'DOG-PD-DENTASTIX-M',
    description: 'X-shape dental care chews clinically proven to reduce tartar buildup by up to 80%.',
    longDescription: 'Designed for medium-sized dogs (10-25 kg), Pedigree Dentastix features an active ingredient blend and a unique abrasive X-shape texture that helps clean hard-to-reach teeth down to the gumline. Free from artificial colors, flavors, and added sugars.',
    ingredients: ['Cereal', 'Derivatives of Vegetable Origin', 'Minerals (including Sodium Tripolyphosphate)', 'Meat and Animal Derivatives'],
    specifications: [
      { label: 'Pack Size', value: '28 Sticks' },
      { label: 'Treat Type', value: 'Dental Chew' },
      { label: 'Dog Size', value: 'Medium' }
    ],
    price: 699,
    discountPrice: 629,
    rating: 4.6,
    reviewCount: 30,
    stock: 120,
    lowStockThreshold: 10,
    images: ['https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=800&auto=format&fit=crop'],
    category: 'Treats',
    subcategory: 'Treats',
    petType: 'dogs',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Orthopedic Memory Foam Dog Bed (Large)',
    slug: 'orthopedic-memory-foam-dog-bed-l',
    brand: 'Pawora',
    sku: 'DOG-PW-ORTHOBED-L',
    description: 'Therapeutic memory foam pet bed with removable, machine-washable plush cover.',
    longDescription: 'Crafted with a dual-layer design (2 inches of medical-grade gel memory foam and 3 inches of support foam), this premium bed cradles joint pressure points and relieves arthritis pain. The water-resistant inner lining protects the foam from spills and accidents, while the luxury suede outer cover matches modern home decors.',
    ingredients: [],
    specifications: [
      { label: 'Dimensions', value: '36 x 28 x 5 inches' },
      { label: 'Foam Type', value: 'Orthopedic Gel Memory Foam' },
      { label: 'Cover material', value: 'Suede & Plush Sherpa' },
      { label: 'Washable', value: 'Yes, removable cover' }
    ],
    price: 4999,
    discountPrice: 4249,
    rating: 4.9,
    reviewCount: 22,
    stock: 8,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'],
    category: 'Dog Beds & Cotes',
    subcategory: 'Beds',
    petType: 'dogs',
    isFeatured: true,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Premium Leather Padded Dog Collar',
    slug: 'premium-leather-padded-dog-collar',
    brand: 'Pawora',
    sku: 'DOG-PW-LEATHERCOLLAR',
    description: 'Handcrafted full-grain leather collar with soft neoprene padding for maximum comfort.',
    longDescription: 'This luxury leather collar is made from vegetable-tanned cowhide, detailed with brass hardware and heavy-duty stitching. The inner lining is layered with soft neoprene to prevent neck chafing, making it perfect for daily wear and training.',
    ingredients: [],
    specifications: [
      { label: 'Material', value: 'Full-Grain Cowhide Leather & Neoprene' },
      { label: 'Hardware', value: 'Solid Brass Buckle & D-Ring' },
      { label: 'Size', value: 'Adjustable Medium (14 - 18 inches)' }
    ],
    price: 1499,
    discountPrice: 1299,
    rating: 4.7,
    reviewCount: 18,
    stock: 45,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800'],
    category: 'Treats', // Mapped under Dogs
    subcategory: 'Collars & Leashes',
    petType: 'dogs',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Interactive Puzzle Smart Dog Toy',
    slug: 'interactive-puzzle-smart-dog-toy',
    brand: 'Pawora',
    sku: 'DOG-PW-SMARTTOY',
    description: 'Level 2 mental stimulation puzzle toy with slide-and-lock treat hiding slots.',
    longDescription: 'Stimulate your dog\'s brain with this premium wooden-look composite puzzle. Featuring 9 sliding covers that conceal treats, it rewards search behavior, reduces boredom, and curbs destructive habits. Slip-resistant rubber feet hold the game in place during play.',
    ingredients: [],
    specifications: [
      { label: 'Material', value: 'Food-safe PP Composite (BPA Free)' },
      { label: 'Difficulty', value: 'Intermediate (Level 2)' },
      { label: 'Diameter', value: '25 cm' }
    ],
    price: 1299,
    discountPrice: 1099,
    rating: 4.5,
    reviewCount: 26,
    stock: 50,
    lowStockThreshold: 6,
    images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800'],
    category: 'Treats',
    subcategory: 'Toys',
    petType: 'dogs',
    isFeatured: true,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Beaphar Premium Dog Grooming Shampoo',
    slug: 'beaphar-premium-dog-grooming-shampoo',
    brand: 'Beaphar',
    sku: 'DOG-BP-SHAMPOO-250ML',
    description: 'Macadamia oil-enriched luxury coat conditioner and shampoo for shiny, tangle-free hair.',
    longDescription: 'Specially developed for dogs with dry or sensitive skin, this premium formula contains Macadamia oil which is deeply absorbed into the coat, returning vital moisture. It restores coat shine and makes hair easily brushable with a pleasant, fresh aroma.',
    ingredients: ['Macadamia Oil', 'Aqua', 'Sodium Laureth Sulfate', 'Peg-4 Rapeseedamide'],
    specifications: [
      { label: 'Volume', value: '250 ml' },
      { label: 'Skin Type', value: 'Sensitive, Dry' },
      { label: 'Suitability', value: 'All Dog Breeds' }
    ],
    price: 899,
    discountPrice: 799,
    rating: 4.3,
    reviewCount: 14,
    stock: 35,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800'],
    category: 'Treats',
    subcategory: 'Grooming',
    petType: 'dogs',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Himalaya Healthy Pet Food for Puppies',
    slug: 'himalaya-healthy-pet-food-puppy',
    brand: 'Himalaya',
    sku: 'DOG-HM-PUPPY-3KG',
    description: 'Ayurveda-inspired growth support puppy dry food with black pepper and papaya.',
    longDescription: 'Himalaya Healthy Pet Food is a complete and balanced food for puppies, enriched with herbal ingredients like Popala, black pepper, and papaya to boost immunity, support bone development, and improve gut health. High protein content from real meat promotes healthy muscle mass.',
    ingredients: ['Chicken Meal', 'Rice', 'Papaya Extract', 'Black Pepper', 'Popala Extract', 'Vitamins & Minerals'],
    specifications: [
      { label: 'Weight', value: '3 kg' },
      { label: 'Life Stage', value: 'Puppy' },
      { label: 'Food Type', value: 'Dry Food' }
    ],
    price: 999,
    discountPrice: 899,
    rating: 4.6,
    reviewCount: 22,
    stock: 15,
    lowStockThreshold: 3,
    images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop'],
    category: 'Dog Food',
    subcategory: 'Dog Food',
    petType: 'dogs',
    isFeatured: false,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Double Stainless Steel Elevated Feeder Bowls',
    slug: 'double-stainless-steel-elevated-bowls',
    brand: 'Pawora',
    sku: 'DOG-PW-ELEVATEDBOWLS',
    description: 'Elevated double dog diner with non-slip iron frame and two rustproof steel bowls.',
    longDescription: 'Elevating your dog\'s food bowl improves digestive alignment, reduces neck strain, and keeps pests away from food. This heavy-duty metal stand includes silent silicone bumpers under the bowls to prevent clanking while eating.',
    ingredients: [],
    specifications: [
      { label: 'Material', value: 'Stainless Steel & Powder-Coated Iron' },
      { label: 'Bowl Capacity', value: '850 ml per bowl' },
      { label: 'Height', value: '7 inches elevated' }
    ],
    price: 1999,
    discountPrice: 1799,
    rating: 4.7,
    reviewCount: 16,
    stock: 22,
    lowStockThreshold: 4,
    images: ['https://images.unsplash.com/photo-1615900119312-2acd3a71f3aa?q=80&w=800&auto=format&fit=crop'],
    category: 'Treats',
    subcategory: 'Bowls & Feeders',
    petType: 'dogs',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Himalaya Furglow Skin & Coat Tonic',
    slug: 'himalaya-furglow-tonic',
    brand: 'Himalaya',
    sku: 'DOG-HM-FURGLOW-200ML',
    description: 'Herbal oral conditioner enriched with Omega 6 & 3 fatty acids for skin health.',
    longDescription: 'Furglow contains plant-derived Omega 6 and Omega 3 fatty acids, along with vitamins A, E, and zinc, to prevent hair shedding, combat flaky skin, and eliminate fungal skin issues. Safe for both dogs and cats, given daily with food.',
    ingredients: ['Linseed Oil', 'Safflower Oil', 'Zinc Liposoluble extract', 'Vitamin A', 'Vitamin E'],
    specifications: [
      { label: 'Volume', value: '200 ml' },
      { label: 'Form', value: 'Liquid Syrup' },
      { label: 'Usage', value: 'Dietary Supplement' }
    ],
    price: 350,
    discountPrice: 315,
    rating: 4.5,
    reviewCount: 35,
    stock: 90,
    lowStockThreshold: 10,
    images: ['https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800&auto=format&fit=crop'],
    category: 'Treats',
    subcategory: 'Supplements',
    petType: 'dogs',
    isFeatured: false,
    isBestSeller: true,
    requiresPrescription: false
  },

  // ------------------ BIRD PRODUCTS ------------------
  {
    name: 'Zoo Med Premium Avian Seed & Fruit Blend',
    slug: 'zoo-med-avian-seed-fruit-blend',
    brand: 'Zoo Med',
    sku: 'BRD-ZM-SEEDBIL-2KG',
    description: 'Gourmet daily food mix for medium to large parrots with nuts, seeds, and dried fruits.',
    longDescription: 'This premium Avian blend is loaded with clean seeds, striped sunflower, walnuts, safflower, dried papaya, raisins, and fortified vitamin pellets. Provides balanced nutrition and mimics the foraging habits of birds in the wild to support mental health.',
    ingredients: ['Safflower Seed', 'Oats', 'Sunflower Seed', 'Dried Bananas', 'Walnuts', 'Vitamin Supplements'],
    specifications: [
      { label: 'Weight', value: '2 kg' },
      { label: 'Suitable for', value: 'Cockatiels, Conures, Parrots' },
      { label: 'Feed Type', value: 'Seed & Fruit Mix' }
    ],
    price: 1899,
    discountPrice: 1699,
    rating: 4.8,
    reviewCount: 19,
    stock: 40,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800&auto=format&fit=crop'],
    category: 'Bird Food',
    subcategory: 'Bird Food',
    petType: 'birds',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Natural Sand-Blasted Java Wood Bird Perch',
    slug: 'natural-java-wood-bird-perch',
    brand: 'Pawora',
    sku: 'BRD-PW-JAVAPERCH-M',
    description: 'Ultra-durable, natural Java wood perch with variable diameters to exercise bird feet.',
    longDescription: 'Java wood perches are harvested from plantation coffee trees, providing a hard, rugged texture that naturally grooms nails and beaks. The varying thickness simulates natural branches, preventing bumblefoot and muscle stiffness in pet birds.',
    ingredients: [],
    specifications: [
      { label: 'Wood Type', value: 'Natural Java Wood (Coffee Tree)' },
      { label: 'Length', value: '18 inches' },
      { label: 'Attachment', value: 'Sturdy Steel Wing-Nut Clamp' }
    ],
    price: 1199,
    discountPrice: 999,
    rating: 4.7,
    reviewCount: 12,
    stock: 25,
    lowStockThreshold: 3,
    images: ['https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=800&auto=format&fit=crop'],
    category: 'Cages & Habitat',
    subcategory: 'Perches',
    petType: 'birds',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Premium Large Wrought Iron Bird Cage',
    slug: 'premium-wrought-iron-bird-cage',
    brand: 'Pawora',
    sku: 'BRD-PW-IRONCAGE-XL',
    description: 'Luxury open-playtop bird cage with rolling stand, seed catcher, and locking feed doors.',
    longDescription: 'A gorgeous home for cockatiels, African greys, or ringnecks. Built with thick wrought iron, non-toxic powder coating, and narrow bar spacing. The drop-down landing gate and open playtop allow out-of-cage play, and the slide-out bottom tray makes clean-up quick and painless.',
    ingredients: [],
    specifications: [
      { label: 'Dimensions', value: '24 x 22 x 65 inches' },
      { label: 'Bar Spacing', value: '0.6 inches' },
      { label: 'Material', value: 'Powder-Coated Wrought Iron' }
    ],
    price: 12499,
    discountPrice: 10999,
    rating: 4.9,
    reviewCount: 8,
    stock: 5,
    lowStockThreshold: 1,
    images: ['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800'],
    category: 'Cages & Habitat',
    subcategory: 'Cages',
    petType: 'birds',
    isFeatured: true,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Calcium Rich Mineral Block for Birds',
    slug: 'calcium-mineral-block-for-birds',
    brand: 'Beaphar',
    sku: 'BRD-BP-MINERALBLOCK',
    description: 'Essential trace mineral block enriched with crushed shells for beak grooming and bone strength.',
    longDescription: 'Beaphar Mineral Block provides essential calcium, phosphorus, and vital minerals. The abrasive texture keeps your bird\'s beak trimmed and sharp while ensuring healthy egg production and strong feather development.',
    ingredients: ['Calcium Carbonate', 'Crushed Oyster Shells', 'Sulfate minerals', 'Iron oxide'],
    specifications: [
      { label: 'Weight', value: '120g' },
      { label: 'Form', value: 'Pressed Mineral Block' },
      { label: 'Attachment', value: 'Integrated wire clip' }
    ],
    price: 399,
    discountPrice: 349,
    rating: 4.4,
    reviewCount: 25,
    stock: 150,
    lowStockThreshold: 15,
    images: ['https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=800&auto=format&fit=crop'],
    category: 'Bird Food',
    subcategory: 'Supplements',
    petType: 'birds',
    isFeatured: false,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Multi-Color Wooden Chew & Rope Bird Toy',
    slug: 'multi-color-wooden-rope-bird-toy',
    brand: 'Pawora',
    sku: 'BRD-PW-WOODTOY',
    description: 'Colorful chew toy made of safe food-dye dyed pine wood blocks and cotton rope.',
    longDescription: 'Keep intelligent birds busy for hours. Birds love to shred, preen, and chew. This block toy encourages climbing, chewing, and beak trimming, preventing feather plucking due to anxiety or lack of stimulation.',
    ingredients: [],
    specifications: [
      { label: 'Material', value: 'Natural Pine Wood & Cotton Rope' },
      { label: 'Dye', value: '100% Non-Toxic Food Colorings' },
      { label: 'Length', value: '14 inches' }
    ],
    price: 699,
    discountPrice: 599,
    rating: 4.5,
    reviewCount: 14,
    stock: 65,
    lowStockThreshold: 8,
    images: ['https://images.unsplash.com/photo-1551085254-e96b210db58a?q=80&w=800&auto=format&fit=crop'],
    category: 'Cages & Habitat',
    subcategory: 'Toys',
    petType: 'birds',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Beaphar Vinka Multi-Vitamin Drops for Birds',
    slug: 'beaphar-vinka-vitamin-drops',
    brand: 'Beaphar',
    sku: 'BRD-BP-VINKA-50ML',
    description: 'Fortified liquid vitamin supplement for cage birds to support vitality and molting.',
    longDescription: 'A professional supplement containing essential vitamins (A, C, D3, E, B1, B2, B6, B12) to help cage birds build robust immunity, glowing plumage, and to ease stress during molting, breeding, or transportation.',
    ingredients: ['Vitamin A', 'Vitamin D3', 'Vitamin E', 'Thiamine', 'Riboflavin', 'Nicotinamide'],
    specifications: [
      { label: 'Volume', value: '50 ml' },
      { label: 'Administration', value: 'Water soluble drops' },
      { label: 'Suitable for', value: 'All cage and aviary birds' }
    ],
    price: 890,
    discountPrice: 799,
    rating: 4.7,
    reviewCount: 16,
    stock: 55,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'],
    category: 'Bird Food',
    subcategory: 'Supplements',
    petType: 'birds',
    isFeatured: false,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Automatic No-Mess Bird Seed Feeder',
    slug: 'automatic-no-mess-bird-feeder',
    brand: 'Pawora',
    sku: 'BRD-PW-NOMESSFEEDER',
    description: 'Acrylic seed feeder that catches hulls and debris, maintaining cage hygiene.',
    longDescription: 'This transparent acrylic automatic feeder feeds birds gravity-style. The hull-separating drawer underneath catches empty seed shells, keeping them separate from fresh seeds and saving you hours of cage sweep-ups.',
    ingredients: [],
    specifications: [
      { label: 'Material', value: 'Heavy-duty polished Acrylic' },
      { label: 'Mounting', value: 'Internal or External hooks' },
      { label: 'Capacity', value: '350g seed capacity' }
    ],
    price: 999,
    discountPrice: 849,
    rating: 4.3,
    reviewCount: 11,
    stock: 48,
    lowStockThreshold: 4,
    images: ['https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800&auto=format&fit=crop'],
    category: 'Cages & Habitat',
    subcategory: 'Feeding Accessories',
    petType: 'birds',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Himalaya Herbals Bird Feather & Skin Spray',
    slug: 'himalaya-bird-feather-skin-spray',
    brand: 'Himalaya',
    sku: 'BRD-HM-SPRAY-100ML',
    description: 'Ayurvedic conditioning mist to prevent skin itching and restore feather sheen.',
    longDescription: 'Enriched with neem and turmeric extracts, this gentle mist sanitizes feather shafts, repels parasites, and moisturizes dry skin. Simply spray from a distance of 10 cm directly onto the bird\'s plumage.',
    ingredients: ['Neem oil', 'Haridra (Turmeric) extract', 'Tulsi extract', 'Aromatic base'],
    specifications: [
      { label: 'Volume', value: '100 ml' },
      { label: 'Key Herbs', value: 'Neem & Turmeric' },
      { label: 'Application', value: 'Leave-in topical spray' }
    ],
    price: 450,
    discountPrice: 399,
    rating: 4.5,
    reviewCount: 18,
    stock: 72,
    lowStockThreshold: 6,
    images: ['https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800&auto=format&fit=crop'],
    category: 'Bird Food',
    subcategory: 'Grooming',
    petType: 'birds',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },

  // ------------------ REPTILE PRODUCTS ------------------
  {
    name: 'Exo Terra Large Glass Terrarium (Lockable)',
    slug: 'exo-terra-large-glass-terrarium',
    brand: 'Exo Terra',
    sku: 'REP-ET-TERRARIUM-L',
    description: 'Premium glass terrarium featuring dual front-opening doors and top mesh ventilation screen.',
    longDescription: 'The Exo Terra glass terrarium is the ideal reptile habitat designed by European herpetologists. The front-opening doors allow easy access for maintenance and feeding. A specially designed lock prevents escapes, and the full-screen mesh top lets UVB and infrared rays penetrate deeply.',
    ingredients: [],
    specifications: [
      { label: 'Dimensions', value: '36 x 18 x 18 inches (90x45x45 cm)' },
      { label: 'Material', value: 'Float Glass & Plastic Trim' },
      { label: 'Features', value: 'Dual front-doors, raised bottom frame, closeable inlets' }
    ],
    price: 18500,
    discountPrice: 16650,
    rating: 4.9,
    reviewCount: 15,
    stock: 4,
    lowStockThreshold: 1,
    images: ['https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=800'],
    category: 'Terrariums',
    subcategory: 'Terrariums',
    petType: 'reptiles',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Zoo Med ReptiSun 10.0 UVB High Output Bulb',
    slug: 'zoo-med-reptisun-uvb-bulb',
    brand: 'Zoo Med',
    sku: 'REP-ZM-UVBBULB-T8',
    description: 'Professional-grade T8 fluorescent bulb providing essential UVB and UVA rays.',
    longDescription: 'Zoo Med ReptiSun 10.0 UVB bulb is vital for reptiles to synthesize Vitamin D3 and metabolize calcium. Prevents Metabolic Bone Disease (MBD) in desert species like Bearded Dragons, Uromastyx, and Tortoises. Emits effective UVB up to 20 inches from the bulb surface.',
    ingredients: [],
    specifications: [
      { label: 'Bulb Type', value: 'Linear T8 Fluorescent' },
      { label: 'UVB Output', value: '10.0 (High desert output)' },
      { label: 'Wattage', value: '17 Watts' },
      { label: 'Length', value: '24 inches' }
    ],
    price: 2999,
    discountPrice: 2699,
    rating: 4.8,
    reviewCount: 22,
    stock: 35,
    lowStockThreshold: 4,
    images: ['https://images.unsplash.com/photo-1563281577-a7be47e20db9?q=80&w=800'],
    category: 'Heating & Lighting',
    subcategory: 'UVB Lighting',
    petType: 'reptiles',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Exo Terra Coconut Husk Forest Bark Substrate',
    slug: 'exo-terra-coconut-husk-bark-substrate',
    brand: 'Exo Terra',
    sku: 'REP-ET-COCOBARK-8L',
    description: '100% natural, biodegradable coconut husk reptile bedding for humidity retention.',
    longDescription: 'Made from compressed coconut husk fibers, this premium substrate is perfect for humidity-loving tropical reptiles like geckos, chameleons, and frogs. It absorbs waste, neutralizes odors, and resists mold growth naturally.',
    ingredients: ['100% Natural Coconut Husk Fibers'],
    specifications: [
      { label: 'Volume', value: '8 Litres' },
      { label: 'Substrate Type', value: 'Tropical / Humid' },
      { label: 'Biodegradable', value: 'Yes' }
    ],
    price: 899,
    discountPrice: 799,
    rating: 4.6,
    reviewCount: 17,
    stock: 80,
    lowStockThreshold: 8,
    images: ['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=800'],
    category: 'Terrariums',
    subcategory: 'Substrate',
    petType: 'reptiles',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Exo Terra Reptile Calcium with D3 Supplement',
    slug: 'exo-terra-reptile-calcium-d3',
    brand: 'Exo Terra',
    sku: 'REP-ET-CALCIUMD3-90G',
    description: 'Ultra-fine calcium powder supplement with vitamin D3 to facilitate calcium absorption.',
    longDescription: 'Calcium deficiency is a major dietary problem in captive reptiles. Exo Terra Calcium + D3 contains ultra-fine grains that easily adhere to feeder insects like crickets or fresh vegetables. Features balanced Vitamin D3 levels to support conversion in terrariums.',
    ingredients: ['Calcium Carbonate', 'Vitamin D3 (synthetic)', 'Dextrose'],
    specifications: [
      { label: 'Weight', value: '90g' },
      { label: 'Form', value: 'Powder supplement' },
      { label: 'Additives', value: 'Vitamin D3' }
    ],
    price: 699,
    discountPrice: 599,
    rating: 4.7,
    reviewCount: 29,
    stock: 95,
    lowStockThreshold: 10,
    images: ['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=800&auto=format&fit=crop'],
    category: 'Heating & Lighting',
    subcategory: 'Calcium & Supplements',
    petType: 'reptiles',
    isFeatured: false,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Zoo Med Ceramic Heat Emitter (100W)',
    slug: 'zoo-med-ceramic-heat-emitter-100w',
    brand: 'Zoo Med',
    sku: 'REP-ZM-CERAMICHEAT-100W',
    description: 'Long-lasting 24-hour heat source for reptiles that emits heat without disturbing sleep.',
    longDescription: 'A clean infrared heat source that screws into a standard porcelain socket. Emits intense muscle-penetrating heat but absolutely no light, making it the ideal nocturnal heater for snakes, tortoises, and geckos.',
    ingredients: [],
    specifications: [
      { label: 'Wattage', value: '100 Watts' },
      { label: 'Base', value: 'Standard E27 Ceramic' },
      { label: 'Light Output', value: 'None' },
      { label: 'Lifespan', value: 'Up to 25,000 hours' }
    ],
    price: 2499,
    discountPrice: 2199,
    rating: 4.5,
    reviewCount: 14,
    stock: 28,
    lowStockThreshold: 3,
    images: ['https://images.unsplash.com/photo-1563281577-a7be47e20db9?q=80&w=800&auto=format&fit=crop'],
    category: 'Heating & Lighting',
    subcategory: 'Heating',
    petType: 'reptiles',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Zoo Med Repti Calcium (D3 Free) Powder',
    slug: 'zoo-med-repti-calcium-d3-free',
    brand: 'Zoo Med',
    sku: 'REP-ZM-CALCIUM-DFREE-85G',
    description: 'Precipitated calcium carbonate supplement without D3 for outdoor housed reptiles.',
    longDescription: 'For reptiles that spend hours in natural sunlight, extra vitamin D3 is unnecessary and can cause toxicity. This high-purity, D3-free calcium powder is ideal for dust-feeding gut-loaded insects.',
    ingredients: ['Precipitated Calcium Carbonate (pure)'],
    specifications: [
      { label: 'Weight', value: '85g' },
      { label: 'D3 Included', value: 'No' },
      { label: 'Form', value: 'Micro-fine powder' }
    ],
    price: 599,
    discountPrice: 539,
    rating: 4.7,
    reviewCount: 11,
    stock: 50,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=800'],
    category: 'Heating & Lighting',
    subcategory: 'Calcium & Supplements',
    petType: 'reptiles',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Exo Terra Digital Thermometer with Probe',
    slug: 'exo-terra-digital-thermometer-probe',
    brand: 'Exo Terra',
    sku: 'REP-ET-DIGITALTHERM',
    description: 'Precision digital thermometer with remote sensor probe for hot/cold spot checks.',
    longDescription: 'This digital thermometer features a remote sensor probe that can be mounted inside the hot basking zone or the cool hideout. Allows constant monitoring of the thermal gradient which is vital for ectothermic digestion.',
    ingredients: [],
    specifications: [
      { label: 'Display', value: 'LCD display' },
      { label: 'Probe Cable', value: '1 meter' },
      { label: 'Battery', value: 'Button cell included' }
    ],
    price: 1199,
    discountPrice: 999,
    rating: 4.4,
    reviewCount: 20,
    stock: 45,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=800'],
    category: 'Heating & Lighting',
    subcategory: 'Thermometers',
    petType: 'reptiles',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Realistic Artificial Jungle Vine for Terrariums',
    slug: 'artificial-jungle-vine-terrarium',
    brand: 'Exo Terra',
    sku: 'REP-ET-JUNGLEVINE-M',
    description: 'Flexible, water-proof climbing vine for tree-dwelling geckos and chameleons.',
    longDescription: 'Provides an authentic climbing surface for arboreal lizards. It has a natural moss look and feel, and bends easily to match any terrarium layout. Completely water-proof and washable.',
    ingredients: [],
    specifications: [
      { label: 'Length', value: '6 feet' },
      { label: 'Material', value: 'Flexible PU Core' },
      { label: 'Style', value: 'Mossy jungle bark' }
    ],
    price: 899,
    discountPrice: 799,
    rating: 4.3,
    reviewCount: 9,
    stock: 60,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1563281577-a7be47e20db9?q=80&w=800'],
    category: 'Terrariums',
    subcategory: 'Décor',
    petType: 'reptiles',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },

  // ------------------ FISH PRODUCTS ------------------
  {
    name: 'API STRESS COAT Water Conditioner',
    slug: 'api-stress-coat-water-conditioner',
    brand: 'API',
    sku: 'FSH-AP-STRESSCOAT-473ML',
    description: 'Instant tap water dechlorinator containing Aloe Vera to repair damaged fish tissue.',
    longDescription: 'API Stress Coat makes tap water safe for fish by instantly removing toxic chlorine, chloramines, and heavy metals. Enriched with Aloe Vera, it creates a synthetic slime coat on fish to protect them, reduces stress by 40%, and heals torn fins and skin wounds.',
    ingredients: ['Sodium Thiosulfate', 'Aloe Vera Extract', 'Water soluble buffers'],
    specifications: [
      { label: 'Volume', value: '473 ml' },
      { label: 'Dosing', value: '5 ml per 38L of water' },
      { label: 'Effect', value: 'Dechlorinates & heals skin' }
    ],
    price: 999,
    discountPrice: 899,
    rating: 4.8,
    reviewCount: 38,
    stock: 85,
    lowStockThreshold: 8,
    images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800'],
    category: 'Water Care & Filtration',
    subcategory: 'Water Conditioners',
    petType: 'fish',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Hikari Cichlid Gold Medium Floating Pellets',
    slug: 'hikari-cichlid-gold-floating-pellets',
    brand: 'Hikari',
    sku: 'FSH-HK-CICHLID-250G',
    description: 'Daily color-enhancing diet for Oscars, Jack Dempseys, and other large tropical cichlids.',
    longDescription: 'Fortified with premium carotene and spirulina, Hikari Cichlid Gold floating food promotes vibrant colors and rapid growth. Contains stabilized Vitamin C to build solid disease resistance and won\'t cloud the aquarium water.',
    ingredients: ['Fish Meal', 'Flaked Corn', 'Wheat Flour', 'Spirulina', 'Brewers Dried Yeast', 'Vitamins'],
    specifications: [
      { label: 'Weight', value: '250g' },
      { label: 'Form', value: 'Medium Floating Pellets (4-5 mm)' },
      { label: 'Suitable for', value: 'Large Cichlids & Carnivorous Fish' }
    ],
    price: 699,
    discountPrice: 629,
    rating: 4.7,
    reviewCount: 26,
    stock: 120,
    lowStockThreshold: 10,
    images: ['https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=800'],
    category: 'Water Care & Filtration',
    subcategory: 'Fish Food',
    petType: 'fish',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Premium Glass Rimless Nano Aquarium (30L)',
    slug: 'premium-glass-rimless-nano-aquarium',
    brand: 'Pawora',
    sku: 'FSH-PW-RIMLESSTANK-30L',
    description: 'Elegant high-clarity 30L glass fish tank with curved front corners for aquascaping.',
    longDescription: 'Crafted with premium low-iron glass for maximum light transmission, this rimless aquarium provides an uninterrupted view of your underwater landscaping. Features curved front corners and a protective base mat.',
    ingredients: [],
    specifications: [
      { label: 'Capacity', value: '30 Litres' },
      { label: 'Dimensions', value: '30 x 30 x 35 cm' },
      { label: 'Glass Thickness', value: '5 mm low-iron glass' }
    ],
    price: 3499,
    discountPrice: 2999,
    rating: 4.6,
    reviewCount: 14,
    stock: 6,
    lowStockThreshold: 1,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'],
    category: 'Aquariums & Tanks',
    subcategory: 'Aquariums',
    petType: 'fish',
    isFeatured: true,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Sunsun HBL-802 Hang-On Back Power Filter',
    slug: 'sunsun-hbl-802-hob-filter',
    brand: 'API', // Sunsun represented under API
    sku: 'FSH-SS-HOBFILTER-802',
    description: 'Multi-stage external HOB filter with 500L/h output and built-in surface skimmer.',
    longDescription: 'The Sunsun HBL-802 hangs onto the back glass rim to save space inside the tank. Includes five customizable filter trays layered with activated carbon, cotton pads, and ceramic rings for mechanical, chemical, and biological filtration.',
    ingredients: [],
    specifications: [
      { label: 'Flow Rate', value: '500 Litres per hour' },
      { label: 'Power Consumption', value: '6 Watts' },
      { label: 'Tank Range', value: 'Up to 80 Litre Aquariums' }
    ],
    price: 1599,
    discountPrice: 1399,
    rating: 4.4,
    reviewCount: 31,
    stock: 35,
    lowStockThreshold: 4,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'],
    category: 'Water Care & Filtration',
    subcategory: 'Filters',
    petType: 'fish',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Submersible Automatic Aquarium Heater (100W)',
    slug: 'submersible-aquarium-heater-100w',
    brand: 'Pawora',
    sku: 'FSH-PW-HEATER-100W',
    description: 'Explosion-proof quartz glass heater with adjustable thermostat scale (18-32°C).',
    longDescription: 'Maintain a stable tropical climate inside your tank with this 100W heater. Crafted from high-strength quartz glass with double waterproof insulation, it turns off automatically when water levels drop too low.',
    ingredients: [],
    specifications: [
      { label: 'Wattage', value: '100 Watts' },
      { label: 'Material', value: 'Quartz Glass & Ceramic core' },
      { label: 'Tank Range', value: '40L to 100L Aquariums' }
    ],
    price: 899,
    discountPrice: 799,
    rating: 4.3,
    reviewCount: 19,
    stock: 50,
    lowStockThreshold: 6,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'],
    category: 'Water Care & Filtration',
    subcategory: 'Pumps', // Categorized as Pumps/Acc
    petType: 'fish',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Full Spectrum LED Aquarium Light (30-45 cm)',
    slug: 'full-spectrum-led-aquarium-light',
    brand: 'Pawora',
    sku: 'FSH-PW-LEDLIGHT-45',
    description: 'Dimmable LED fixture with daylight and moonlight modes for live aquarium plants.',
    longDescription: 'Features 6500K white LEDs combined with red, green, and blue light bands to stimulate robust growth in live aquarium plants. Includes extendable metal brackets and an inline digital timer controller.',
    ingredients: [],
    specifications: [
      { label: 'Length range', value: '30 cm to 45 cm extendable' },
      { label: 'Lumens', value: '1200 lm' },
      { label: 'Power', value: '14 Watts' }
    ],
    price: 2499,
    discountPrice: 1999,
    rating: 4.7,
    reviewCount: 15,
    stock: 20,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=800&auto=format&fit=crop'],
    category: 'Water Care & Filtration',
    subcategory: 'Aquarium Lighting',
    petType: 'fish',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Live Anubias Nana Aquatic Plant on Driftwood',
    slug: 'live-anubias-nana-driftwood',
    brand: 'Pawora',
    sku: 'FSH-PW-ANUBIASNANA',
    description: 'Easy-care, slow-growing hardy live plant anchored to a small piece of natural driftwood.',
    longDescription: 'Anubias Nana is an exceptionally hardy aquatic plant that thrives in low light. Pre-anchored to a selected natural driftwood root, it can be dropped directly into the tank, providing instant shelter and breeding spots for small shrimp and fish.',
    ingredients: [],
    specifications: [
      { label: 'Plant Species', value: 'Anubias barteri var. nana' },
      { label: 'Light Needs', value: 'Low to Moderate' },
      { label: 'Driftwood Size', value: '8-12 cm' }
    ],
    price: 599,
    discountPrice: 499,
    rating: 4.5,
    reviewCount: 22,
    stock: 12,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop'],
    category: 'Water Care & Filtration',
    subcategory: 'Aquarium Plants',
    petType: 'fish',
    isFeatured: false,
    isBestSeller: true,
    requiresPrescription: false
  },

  // ------------------ PHARMACY PRODUCTS ------------------
  {
    name: 'Beaphar Joint Fit Calcium Oil for Joint Pain',
    slug: 'beaphar-joint-fit-supplement',
    brand: 'Beaphar',
    sku: 'PHM-BP-JOINTFIT-45CAPS',
    description: 'Advanced chondroitin and glucosamine joint care formula for aging dogs and cats.',
    longDescription: 'Joint Fit is designed to support the development and maintenance of healthy joints, tendons, and ligaments. Features Glucosamine, Chondroitin, and Vitamin E to soothe joint pain, support synovial fluid production, and increase mobility.',
    ingredients: ['Glucosamine HCl', 'Chondroitin Sulfate', 'Manganese Sulfate', 'Vitamin E'],
    specifications: [
      { label: 'Pack Size', value: '45 Capsules' },
      { label: 'Target Animal', value: 'Dogs & Cats' },
      { label: 'Indication', value: 'Joint support, arthritis relief' }
    ],
    price: 1899,
    discountPrice: 1699,
    rating: 4.8,
    reviewCount: 27,
    stock: 65,
    lowStockThreshold: 8,
    images: ['https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=800'],
    category: 'Vitamins & Supplements',
    subcategory: 'Joint Care',
    petType: 'pharmacy',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Himalaya HimCal Calcium Pet Supplement (500ml)',
    slug: 'himalaya-himcal-supplement-500ml',
    brand: 'Himalaya',
    sku: 'PHM-HM-HIMCAL-500ML',
    description: 'Phosphorus and Calcium syrup enriched with herbal extracts for healthy bone growth.',
    longDescription: 'A premium liquid calcium syrup for puppies and adult dogs. Enriched with herbal ingredients like Moulsari, HimCal assists in bone mineralization, teeth development, and preventing rickets in young puppies. Formulated with a highly palatable sweet taste.',
    ingredients: ['Moulsari Extract', 'Calcium', 'Phosphorus', 'Vitamin D3'],
    specifications: [
      { label: 'Volume', value: '500 ml' },
      { label: 'Life Stage', value: 'Puppy, Adult & Senior' },
      { label: 'Administration', value: 'Oral Liquid' }
    ],
    price: 499,
    discountPrice: 449,
    rating: 4.6,
    reviewCount: 33,
    stock: 140,
    lowStockThreshold: 15,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'],
    category: 'Vitamins & Supplements',
    subcategory: 'Vitamins',
    petType: 'pharmacy',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false
  },
  {
    name: 'Himalaya Digyton Plus Digestive drops',
    slug: 'himalaya-digyton-plus-digestive',
    brand: 'Himalaya',
    sku: 'PHM-HM-DIGYTON-100ML',
    description: 'Ayurvedic digestion and bowel movement syrup to treat flatulence and bloating.',
    longDescription: 'Digyton Plus is formulated with Dill oil and Cardamom to secrete digestive enzymes, improve digestion, and reduce abdominal colic. Effective for constipation, indigestion, and flatulence in cats and dogs.',
    ingredients: ['Shatapusha (Dill oil)', 'Ela (Cardamom)', 'Ginger extract'],
    specifications: [
      { label: 'Volume', value: '100 ml' },
      { label: 'Pet Suitability', value: 'Dogs & Cats' },
      { label: 'Therapeutic Class', value: 'Carminative / Digestive' }
    ],
    price: 220,
    discountPrice: 199,
    rating: 4.5,
    reviewCount: 16,
    stock: 90,
    lowStockThreshold: 10,
    images: ['https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=800&auto=format&fit=crop'],
    category: 'Vitamins & Supplements',
    subcategory: 'Digestive Care',
    petType: 'pharmacy',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Premium Pet First Aid & Wound Care Kit',
    slug: 'premium-pet-first-aid-kit',
    brand: 'Pawora',
    sku: 'PHM-PW-FIRSTAIDKIT',
    description: 'Comprehensive 40-piece emergency pet healthcare kit with bandages and antiseptics.',
    longDescription: 'An essential first aid kit for every pet owner. Includes gauze pads, cohesive wraps, antiseptic wipes, medical tape, tweezers, saline rinse, scissors, emergency blanket, and an instructional first-aid guide for injuries, burns, and ticks.',
    ingredients: [],
    specifications: [
      { label: 'Item Count', value: '40 Pieces' },
      { label: 'Case Material', value: 'Waterproof nylon zipper bag' },
      { label: 'Suitability', value: 'Dogs, Cats, Birds, Small Animals' }
    ],
    price: 1499,
    discountPrice: 1299,
    rating: 4.9,
    reviewCount: 11,
    stock: 30,
    lowStockThreshold: 3,
    images: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop'],
    category: 'First Aid & Healthcare',
    subcategory: 'First Aid',
    petType: 'pharmacy',
    isFeatured: true,
    isBestSeller: false,
    requiresPrescription: false
  },
  {
    name: 'Melonex (Meloxicam) Oral Suspension 1.5mg/ml',
    slug: 'melonex-meloxicam-oral-suspension',
    brand: 'Himalaya', // Distributed under veterinary medicines
    sku: 'PHM-VET-MELONEX-10ML',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) for relief of pain and inflammation in dogs.',
    longDescription: 'Melonex Oral Suspension contains Meloxicam, used to control pain and inflammation associated with osteoarthritis or surgical recovery in dogs. IMPORTANT: This veterinary medication requires verification of a valid prescription before dispatch.',
    ingredients: ['Meloxicam 1.5 mg/ml'],
    specifications: [
      { label: 'Volume', value: '10 ml' },
      { label: 'Prescription Required', value: 'Yes (Strict Verification)' },
      { label: 'Therapeutic Class', value: 'NSAID / Anti-inflammatory' }
    ],
    price: 180,
    discountPrice: 160,
    rating: 4.7,
    reviewCount: 9,
    stock: 50,
    lowStockThreshold: 10,
    images: ['https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=800&auto=format&fit=crop'],
    category: 'First Aid & Healthcare',
    subcategory: 'Joint Care',
    petType: 'pharmacy',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: true
  },
  {
    name: 'Savavet Cephavet (Cephalexin) Tablets 300mg',
    slug: 'savavet-cephavet-cephalexin-tablets',
    brand: 'Beaphar', // Under vet medicine category
    sku: 'PHM-VET-CEPHAVET-300',
    description: 'Broad-spectrum antibiotic tablets used to treat bacterial skin infections in dogs.',
    longDescription: 'Cephavet contains Cephalexin, an active cephalosporin antibiotic effective against skin, urinary, and respiratory bacterial infections. IMPORTANT: Requires a valid veterinarian prescription upload for verification.',
    ingredients: ['Cephalexin IP 300 mg'],
    specifications: [
      { label: 'Strength', value: '300 mg' },
      { label: 'Pack Size', value: '10 Tablets' },
      { label: 'Prescription Required', value: 'Yes (Strict Verification)' }
    ],
    price: 320,
    discountPrice: 299,
    rating: 4.6,
    reviewCount: 7,
    stock: 40,
    lowStockThreshold: 8,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'],
    category: 'First Aid & Healthcare',
    subcategory: 'Skin Care',
    petType: 'pharmacy',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: true
  },
  {
    name: 'Prednisolone 10mg Veterinary Tablets',
    slug: 'prednisolone-10mg-veterinary-tablets',
    brand: 'Himalaya',
    sku: 'PHM-VET-PREDNISOLONE-10',
    description: 'Corticosteroid medication for treating inflammatory and allergic skin conditions.',
    longDescription: 'Prednisolone is a glucocorticoid steroid used to treat severe allergies, autoimmune skin disorders, and inflammatory states in dogs and cats. IMPORTANT: Prescription verification is strictly required.',
    ingredients: ['Prednisolone 10 mg'],
    specifications: [
      { label: 'Strength', value: '10 mg' },
      { label: 'Pack Size', value: '30 Tablets' },
      { label: 'Prescription Required', value: 'Yes (Strict Verification)' }
    ],
    price: 280,
    discountPrice: 250,
    rating: 4.8,
    reviewCount: 5,
    stock: 35,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=800&auto=format&fit=crop'],
    category: 'First Aid & Healthcare',
    subcategory: 'Skin Care',
    petType: 'pharmacy',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: true
  },
  {
    name: 'Savavet Ichmune C (Cyclosporine) Oral Solution',
    slug: 'savavet-ichmune-cyclosporine-solution',
    brand: 'Beaphar',
    sku: 'PHM-VET-ICHMUNE-15ML',
    description: 'Immunomodulator oral solution for treatment of atopic dermatitis in dogs.',
    longDescription: 'Ichmune C contains Cyclosporine, indicated for the control and long-term management of chronic atopic dermatitis (allergic eczema) in dogs. Requires a veterinary prescription.',
    ingredients: ['Cyclosporine 100 mg/ml'],
    specifications: [
      { label: 'Strength', value: '100 mg/ml' },
      { label: 'Volume', value: '15 ml' },
      { label: 'Prescription Required', value: 'Yes' }
    ],
    price: 2450,
    discountPrice: 2200,
    rating: 4.5,
    reviewCount: 4,
    stock: 20,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'],
    category: 'First Aid & Healthcare',
    subcategory: 'Skin Care',
    petType: 'pharmacy',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: true
  }
];

export const blogs = [
  {
    title: 'Complete Guide to Creating a Bearded Dragon Habitat',
    slug: 'bearded-dragon-habitat-guide',
    summary: 'Everything you need to know about terrarium sizes, UVB lighting, heat, and substrates to keep your bearded dragon healthy.',
    content: `Creating a proper habitat is the single most important task for any bearded dragon keeper. Unlike cats or dogs, reptiles rely entirely on their environment to regulate their body temperature and digest their food. Let\'s explore the core components of a Bearded Dragon habitat:

### 1. Enclosure Size
For an adult bearded dragon (over 12 months), the absolute minimum enclosure size is a **120-gallon terrarium** (4ft x 2ft x 2ft). Smaller tanks like 40-gallon breeders will stunt their growth, create severe temperature gradient issues, and cause high stress.

### 2. UVB Lighting
Bearded dragons require high-output UVB rays to synthesize Vitamin D3 and metabolize calcium. Without it, they develop Metabolic Bone Disease (MBD), which deform their skeleton and is eventually fatal. Use a linear **T5 tube light (like Zoo Med ReptiSun 10.0)** covering 2/3 of the tank length. Compact coil bulbs are insufficient.

### 3. Temperature Gradients
Create a thermal gradient from the hot basking side to a cool shade side:
* **Basking Spot**: 38°C to 42°C (100°F to 108°F)
* **Cool Side**: 24°C to 27°C (75°F to 80°F)
* **Night Temperature**: Should not fall below 18°C (65°F). If it does, use a Ceramic Heat Emitter (which emits no light).

### 4. Substrate Selection
For beginners, non-adhesive shelf liner, slate tiles, or paper towels are highly recommended. For advanced keepers, a 50/50 mix of organic topsoil and play sand replicates their natural arid environment without causing gut impaction.`,
    author: 'Dr. Vivek Nair (Herpetologist)',
    featuredImage: 'https://images.unsplash.com/photo-1504450758481-7338eaa75e6a?q=80&w=800',
    petType: 'reptiles',
    tags: ['Reptiles', 'Habitat Guide', 'Bearded Dragon', 'Beginners'],
    readTime: '6 min read',
    faqs: [
      { question: 'What is the minimum tank size for a baby bearded dragon?', answer: 'You can start a baby in a 40-gallon tank, but they grow rapidly and will need a 120-gallon tank within 8 to 10 months.' },
      { question: 'How often should I replace the UVB bulb?', answer: 'T5 linear bulbs should be replaced every 6 to 12 months even if they still emit light, as the UVB phosphors decay over time.' }
    ]
  },
  {
    title: 'Best Nutrition Practices for Dogs: Feed for Longevity',
    slug: 'best-nutrition-practices-dogs',
    summary: 'A vet-backed guide on protein ratios, wet vs dry food, feeding schedules, and identifying high-quality kibble ingredients.',
    content: `Good nutrition is the cornerstone of a dog\'s lifelong health and vitality. As a pet parent, walking down the food aisle can be overwhelming with claims like "grain-free," "high protein," and "natural." Let\'s break down what truly makes a high-quality canine diet:

### 1. Ingredient Label Reading
Always check the first three ingredients. Real meat (like chicken, beef, or lamb) should always be listed as the #1 ingredient. Avoid diets that start with corn, wheat gluten, or meat "by-products." High-quality kibble brands like **Royal Canin** or **Drools Focus** balance proteins and fibers.

### 2. The Grain-Free Controversy
Many grain-free diets replace grains with high concentrations of peas, lentils, and potatoes. Recent FDA studies link grain-free diets rich in legumes to dilated cardiomyopathy (DCM) in dogs. Unless your dog has a diagnosed wheat allergy, high-quality grains like brown rice and oats are actually beneficial for heart and digestive health.

### 3. Protein and Fat Ratios
* **Adult Dogs**: Require 18% to 25% crude protein and 10% to 15% fat.
* **Growing Puppies**: Need 22% to 32% crude protein to support rapid muscle growth.

### 4. Hydration is Key
Dry kibble contains only 10% moisture, putting strain on kidneys. Consider adding a splash of warm water, bone broth (salt-free), or mixing in high-quality wet food to support hydration.`,
    author: 'Dr. Shruti Sharma (DVM)',
    featuredImage: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800',
    petType: 'dogs',
    tags: ['Dogs', 'Nutrition', 'Dog Food', 'Vet Guide'],
    readTime: '5 min read',
    faqs: [
      { question: 'Can I feed my dog a raw food diet?', answer: 'Raw diets present bacterial contamination risks (Salmonella, E. coli) for both the dog and humans. Consult a veterinary nutritionist before starting.' },
      { question: 'How many times a day should I feed my adult dog?', answer: 'Feeding twice a day (morning and evening) is optimal for maintaining stable blood sugar and avoiding bloat.' }
    ]
  },
  {
    title: 'Beginner’s Guide to Aquarium Care and Water Chemistry',
    slug: 'beginners-guide-aquarium-care',
    summary: 'Demystifying the Nitrogen Cycle, testing pH, and maintaining a thriving freshwater fish tank.',
    content: `Starting your first aquarium is an exciting journey, but many beginners fail within the first month due to "New Tank Syndrome." Fish produce toxic waste (Ammonia), which builds up in a closed glass box unless you establish a biological filter. This guide demystifies the chemical balance of your tank:

### 1. The Nitrogen Cycle: The Core of Aquaria
The Nitrogen Cycle is the process where beneficial bacteria colonize your filter sponges and gravel to break down waste:
* **Step 1**: Fish poop and uneaten food turn into highly toxic **Ammonia (NH3)**.
* **Step 2**: *Nitrosomonas* bacteria consume Ammonia and convert it into toxic **Nitrite (NO2)**.
* **Step 3**: *Nitrobacter* bacteria convert Nitrite into relatively harmless **Nitrate (NO3)**.
* **Step 4**: You remove Nitrates by performing regular water changes!

**Never** add fish to a brand new tank on day one. Run the filter for at least 2 weeks while dosing a bacterial starter to cycle the aquarium.

### 2. Water Conditioners are Mandatory
Tap water contains chlorine and chloramine to kill bacteria. This means tap water will instantly destroy your beneficial filter bacteria and burn your fish\'s gills. Always treat water with a high-quality conditioner like **API Stress Coat** before adding it to the aquarium.

### 3. Feeding Schedule
Overfeeding is the #1 cause of fish death. Fish stomachs are about the size of their eye. Feed only what they can consume in 2 minutes, once a day.`,
    author: 'Vikram Nair (Master Aquascapist)',
    featuredImage: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800',
    petType: 'fish',
    tags: ['Fish', 'Aquarium Care', 'Water Chemistry', 'Beginners'],
    readTime: '7 min read',
    faqs: [
      { question: 'How often should I change aquarium water?', answer: 'Perform a 20% to 25% water change every week, vacuuming the gravel to remove waste.' },
      { question: 'What temperature should my tropical tank be?', answer: 'Most tropical freshwater fish thrive in temperatures between 24°C and 27°C (75°F to 80°F).' }
    ]
  },
  {
    title: 'Essential Bird Cage Setup Guide for Happy Parrots',
    slug: 'essential-bird-cage-setup',
    summary: 'Tips on placing perches, selecting safe toys, food bowls, and choosing the right cage dimensions.',
    content: `Birds are highly intelligent, active creatures that require a rich environment. A bare wire cage with a single plastic dowel perch is akin to solitary confinement. To raise a happy, talkative, and healthy bird, design their enclosure with mental enrichment in mind:

### 1. Cage Dimensions and Bar Spacing
Select a cage where your bird can fully extend and flap its wings without touching any sides or toys.
* **Small birds (Budgies, Finches)**: Minimum 18x18x24 inches.
* **Medium birds (Cockatiels, Conures)**: Minimum 24x22x30 inches.
* Bar spacing must be narrow enough so the bird cannot stick its head through the bars, which leads to injury or strangulation.

### 2. Vary Your Perches
Standard cages come with smooth dowel perches. Throw them away! Standing on uniform cylindrical perches causes pressure sores on bird feet. Use **Natural Java Wood Perches** of varying diameters to exercise their feet and groom their nails naturally.

### 3. Toys for Shredding and Foraging
Parrots have a natural drive to chew and explore. Provide toys made of bird-safe materials:
* **Shredding Toys**: Colorful wood blocks, cotton ropes, and crinkly paper.
* **Foraging Toys**: Devices where they must solve a puzzle or chew through cardboard to get a sunflower seed.
* Avoid toys with mirrors (causes psychological obsession) and small plastic parts that can be swallowed.`,
    author: 'Priya Iyer (Avian Behavioral Specialist)',
    featuredImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
    petType: 'birds',
    tags: ['Birds', 'Cage Setup', 'Bird Toys', 'Pet Care'],
    readTime: '5 min read',
    faqs: [
      { question: 'Where should I place the bird cage?', answer: 'Place the cage in a high-traffic area of the house (like the living room) but away from drafts and direct kitchen fumes, as Teflon/non-stick pan fumes are highly toxic to birds.' },
      { question: 'How often should I clean the cage?', answer: 'Change the tray liner daily and wipe down the cage bars and perches weekly.' }
    ]
  }
];

export const reviews = [
  { rating: 5, title: 'Outstanding Kibble!', comment: 'My golden retriever absolutely loves this food. His coat has gone from dull to shining in just 3 weeks, and his digestion is perfect. Highly recommend Royal Canin!', verifiedPurchase: true },
  { rating: 4, title: 'Great quality but pricey', comment: 'Excellent food for large dogs, but the price keeps increasing. The ingredients are top notch, and my lab does very well on it.', verifiedPurchase: true },
  { rating: 5, title: 'Incredible joint relief!', comment: 'My 10-year-old German Shepherd was struggling to climb stairs. After 2 weeks of Beaphar Joint Fit capsules, she is moving with ease. Remarkable product.', verifiedPurchase: true },
  { rating: 5, title: 'Safe and sturdy terrarium', comment: 'Exo Terra makes the best cages hands down. The front lock works perfectly and it makes spot cleaning so easy. My bearded dragon loves his home.', verifiedPurchase: true },
  { rating: 5, title: 'API Stress Coat is a lifesaver', comment: 'This is the gold standard for water conditioning. Instantly calms my fish and heals any split fins. Will never use another conditioner.', verifiedPurchase: true }
];
