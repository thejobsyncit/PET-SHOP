// Centralized Pet Breeds Dataset and Category Mappings

export const PET_BREEDS_BY_CATEGORY = {
  dogs: [
    'Labrador Retriever',
    'Golden Retriever',
    'German Shepherd',
    'Siberian Husky',
    'Shih Tzu',
    'Pug',
    'Beagle',
    'Pomeranian',
    'Rottweiler',
    'Doberman Pinscher',
    'French Bulldog',
    'Indian Spitz',
    'Indian Breed (Indie / Pariah)',
    'Lhasa Apso',
    'Cocker Spaniel',
    'Chow Chow',
    'Tibetan Mastiff',
    'Samoyed',
    'Boxer',
    'Great Dane',
    'Saint Bernard',
    'Dalmatian',
    'Maltese',
    'Chihuahua',
    'Alaskan Malamute',
    'Poodle (Toy / Standard)',
    'Cane Corso',
    'Bullmastiff'
  ],
  cats: [
    'Persian Cat',
    'Maine Coon',
    'British Shorthair',
    'Siamese Cat',
    'Ragdoll',
    'Bengal Cat',
    'Scottish Fold',
    'Sphynx',
    'Indie / Domestic Shorthair',
    'Russian Blue',
    'American Shorthair',
    'Himalayan Cat',
    'Birman',
    'Abyssinian'
  ],
  birds: [
    'Cockatiel',
    'Budgerigar (Budgie)',
    'Lovebird (Fischer / Peach-faced)',
    'African Grey Parrot',
    'Sun Conure',
    'Macaw (Blue & Gold / Scarlet)',
    'Amazon Parrot',
    'Canary',
    'Finch (Zebra / Gouldian)',
    'Cockatoo',
    'Eclectus Parrot',
    'Indian Ringneck Parakeet',
    'Pigeon / Dove (Fantail / Jacobin)'
  ]
};

/**
 * Normalizes user-facing or filter pet type strings into standard keys
 * @param {string} petType - e.g. 'Dogs', 'Dog', 'Puppy', 'Cats', 'Cat', 'Birds', 'All', etc.
 * @returns {string} - 'dogs' | 'cats' | 'birds' | 'all'
 */
export const normalizePetCategory = (petType) => {
  if (!petType) return 'all';
  const clean = petType.toString().trim().toLowerCase();

  if (
    clean === 'dog' ||
    clean === 'dogs' ||
    clean === 'puppy' ||
    clean === 'puppies' ||
    clean === 'senior dogs' ||
    clean === 'adult dogs'
  ) {
    return 'dogs';
  }

  if (clean === 'cat' || clean === 'cats' || clean === 'kitten' || clean === 'kittens') {
    return 'cats';
  }

  if (clean === 'bird' || clean === 'birds' || clean === 'avian') {
    return 'birds';
  }

  return 'all';
};

/**
 * Retrieves the breed list for a specified pet category
 * @param {string} petType
 * @returns {string[]}
 */
export const getBreedsForPetType = (petType) => {
  const cat = normalizePetCategory(petType);
  if (cat === 'all') {
    return [
      ...PET_BREEDS_BY_CATEGORY.dogs,
      ...PET_BREEDS_BY_CATEGORY.cats,
      ...PET_BREEDS_BY_CATEGORY.birds
    ];
  }
  return PET_BREEDS_BY_CATEGORY[cat] || PET_BREEDS_BY_CATEGORY.dogs;
};
