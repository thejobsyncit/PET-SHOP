import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  SlidersHorizontal, ArrowUpDown, RefreshCw, X, ChevronDown, Check, 
  ChevronRight, Sparkles, Filter, SearchX 
} from 'lucide-react';
import { fetchProducts, setFilter, resetFilters } from '../store/slices/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

// Brand mappings per pet department & pharmacy pet type
const DEPARTMENT_BRANDS = {
  all: ['Royal Canin', 'Pedigree', 'Drools', 'Zoo Med', 'Exo Terra', 'API', 'Hikari', 'Himalaya', 'Beaphar', 'Pawora'],
  dogs: ['Royal Canin', 'Pedigree', 'Drools', 'Himalaya', 'Beaphar', 'Pawora'],
  cats: ['Royal Canin', 'Drools', 'Himalaya', 'Beaphar', 'Pawora'],
  birds: ['Zoo Med', 'Beaphar', 'Himalaya', 'Pawora'],
  reptiles: ['Exo Terra', 'Zoo Med', 'Pawora'],
  fish: ['API', 'Hikari', 'Pawora'],
  pharmacy: ['Himalaya', 'Beaphar', 'Pawora']
};

const PHARMACY_PET_BRANDS = {
  all: ['Himalaya', 'Beaphar', 'Pawora'],
  dog: ['Himalaya', 'Beaphar', 'Pawora'],
  cat: ['Himalaya', 'Beaphar', 'Pawora'],
  bird: ['Beaphar', 'Himalaya', 'Pawora'],
  reptile: ['Zoo Med', 'Exo Terra', 'Pawora'],
  fish: ['API', 'Hikari', 'Pawora']
};

const PHARMACY_PET_OPTIONS = [
  { id: 'all', label: 'All Pharmacy' },
  { id: 'dog', label: 'Dogs' },
  { id: 'cat', label: 'Cats' },
  { id: 'bird', label: 'Birds' },
  { id: 'reptile', label: 'Reptiles' },
  { id: 'fish', label: 'Fish & Aquatics' }
];

const DEPARTMENTS = [
  { id: 'dogs', label: 'Dogs' },
  { id: 'cats', label: 'Cats' },
  { id: 'birds', label: 'Birds' },
  { id: 'reptiles', label: 'Reptiles' },
  { id: 'fish', label: 'Fish & Aquatics' },
  { id: 'pharmacy', label: 'Pharmacy', hasDropdown: true }
];

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, total, page, pages, filters, loading } = useSelector((state) => state.products);
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  
  // Pharmacy sub-dropdown state
  const [isPharmacyDropdownOpen, setIsPharmacyDropdownOpen] = useState(false);
  const [selectedPharmacyPet, setSelectedPharmacyPet] = useState('all');

  // Read URL parameters on mount and load them into Redux state
  useEffect(() => {
    const path = window.location.pathname;
    let petTypeParam = searchParams.get('petType') || '';
    if (!petTypeParam) {
      if (path.includes('/dogs')) petTypeParam = 'dogs';
      else if (path.includes('/cats')) petTypeParam = 'cats';
      else if (path.includes('/birds')) petTypeParam = 'birds';
      else if (path.includes('/reptiles')) petTypeParam = 'reptiles';
      else if (path.includes('/fish')) petTypeParam = 'fish';
      else if (path.includes('/pharmacy')) petTypeParam = 'pharmacy';
    }
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    const pharmacyPetParam = searchParams.get('pharmacyPet') || 'all';

    if (petTypeParam === 'pharmacy') {
      setIsPharmacyDropdownOpen(true);
      if (pharmacyPetParam) {
        setSelectedPharmacyPet(pharmacyPetParam);
      }
    }
    
    dispatch(setFilter({
      petType: petTypeParam,
      category: categoryParam,
      search: searchParam,
      page: 1
    }));
  }, [searchParams, dispatch]);

  // Trigger product fetch when Redux filters change
  useEffect(() => {
    dispatch(fetchProducts({
      ...filters,
      page
    }));
  }, [filters, page, dispatch]);

  // Compute available brands based on current Department / Pharmacy pet selection
  const currentAvailableBrands = useMemo(() => {
    if (filters.petType === 'pharmacy') {
      return PHARMACY_PET_BRANDS[selectedPharmacyPet] || PHARMACY_PET_BRANDS.all;
    }
    return DEPARTMENT_BRANDS[filters.petType] || DEPARTMENT_BRANDS.all;
  }, [filters.petType, selectedPharmacyPet]);

  const handleFilterChange = (newFilters) => {
    // If brand is not explicitly being updated, ensure existing active brands are compatible with new petType
    if (newFilters.petType !== undefined && newFilters.brand === undefined && filters.brand) {
      const targetBrands = newFilters.petType === 'pharmacy'
        ? (PHARMACY_PET_BRANDS[selectedPharmacyPet] || PHARMACY_PET_BRANDS.all)
        : (DEPARTMENT_BRANDS[newFilters.petType] || DEPARTMENT_BRANDS.all);

      const activeBrandsList = filters.brand.split(',').filter(b => targetBrands.includes(b));
      newFilters.brand = activeBrandsList.join(',');
    }
    dispatch(setFilter(newFilters));
  };

  const handleSelectDepartment = (deptId) => {
    if (deptId === 'pharmacy') {
      setIsPharmacyDropdownOpen(!isPharmacyDropdownOpen);
      handleFilterChange({
        petType: 'pharmacy',
        category: '',
        subcategory: '',
        search: selectedPharmacyPet !== 'all' ? selectedPharmacyPet : ''
      });
      setSearchParams({ petType: 'pharmacy', pharmacyPet: selectedPharmacyPet });
    } else {
      setIsPharmacyDropdownOpen(false);
      setSelectedPharmacyPet('all');
      handleFilterChange({
        petType: deptId,
        category: '',
        subcategory: '',
        search: ''
      });
      setSearchParams({ petType: deptId });
    }
  };

  const handleSelectPharmacyPet = (petId) => {
    setSelectedPharmacyPet(petId);
    handleFilterChange({
      petType: 'pharmacy',
      category: '',
      subcategory: '',
      search: petId !== 'all' ? petId : ''
    });
    setSearchParams({ petType: 'pharmacy', pharmacyPet: petId });
  };

  const handlePageChange = (pageNum) => {
    dispatch(fetchProducts({
      ...filters,
      page: pageNum
    }));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    dispatch(resetFilters());
    setSelectedPharmacyPet('all');
    setIsPharmacyDropdownOpen(false);
    setSearchParams({});
  };

  // Static meta categories listings
  const petMetadata = {
    dogs: {
      title: 'Dogs & Canines',
      desc: 'Expertly selected nutrition, organic treats, supportive memory-foam beds, leashes, and veterinary healthcare formulations tailored for large, medium, and small breed companions.',
      hero: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      subcategories: [
        { name: 'Dog Food', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&auto=format&fit=crop' },
        { name: 'Treats', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&auto=format&fit=crop' },
        { name: 'Dog Beds & Cotes', img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&auto=format&fit=crop' },
        { name: 'Collars & Leashes', img: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=300&auto=format&fit=crop' },
        { name: 'Supplements', img: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=300&auto=format&fit=crop' },
        { name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1527526029430-319f10814151?w=300&auto=format&fit=crop' }
      ],
      faqs: [
        { q: 'How do I choose the correct food type for my puppy?', a: 'Puppies require highly digestible proteins and specialized fat ratios for rapid bone growth. Look for specialized labels like Himalaya Healthy Pet Food for Puppies.' },
        { q: 'Why should I buy an elevated food bowl stand?', a: 'Elevating feeding bowls improves digestive alignment, reduces neck strain, and prevents gas bloating during meals in medium and large breeds.' }
      ]
    },
    cats: {
      title: 'Cats & Felines',
      desc: 'Nutritious gourmet wet and dry food, scratching trees, catnip toys, grooming brushes, and gentle healthcare products designed for happy, healthy cats.',
      hero: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200&auto=format&fit=crop',
      subcategories: [
        { name: 'Cat Food', img: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=300&auto=format&fit=crop' },
        { name: 'Treats', img: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=300&auto=format&fit=crop' },
        { name: 'Supplements', img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&auto=format&fit=crop' },
        { name: 'Beds & Scratchers', img: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=300&auto=format&fit=crop' },
        { name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop' }
      ],
      faqs: [
        { q: 'Why is wet food essential for cats?', a: 'Cats have a low thirst drive. Wet food provides vital hydration to prevent urinary tract infections and kidney issues.' },
        { q: 'How do I choose the best scratching post?', a: 'Choose tall, sturdy posts made with natural sisal rope so cats can stretch their full body while maintaining their claws.' }
      ]
    },
    birds: {
      title: 'Birds & Aviary',
      desc: 'Premium seed blends, trace mineral blocks, Java wood perches, cage systems, and multivitamin drops formulated to maintain optimal plumage, beak size, and bird vitality.',
      hero: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1200&auto=format&fit=crop',
      subcategories: [
        { name: 'Bird Food', img: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=300&auto=format&fit=crop' },
        { name: 'Cages & Habitat', img: 'https://images.unsplash.com/photo-1522849508890-ce0f90768b20?w=300&auto=format&fit=crop' },
        { name: 'Perches', img: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=300&auto=format&fit=crop' },
        { name: 'Toys', img: 'https://images.unsplash.com/photo-1602058376483-e8eeeb63b320?w=300&auto=format&fit=crop' },
        { name: 'Supplements', img: 'https://images.unsplash.com/photo-1533591380302-3c1a3556d4ea?w=300&auto=format&fit=crop' },
        { name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1517789123015-77983ffef1c9?w=300&auto=format&fit=crop' }
      ],
      faqs: [
        { q: 'Why are natural wood perches better than plastic dowels?', a: 'Uniform plastic or smooth wood perches cause pressure sores and nail overgrowth. Natural java perches have varying diameters which exercise foot muscles and trim nails naturally.' },
        { q: 'How often should a bird have mineral blocks?', a: 'Mineral blocks must be kept inside the cage at all times. They provide vital calcium for bones and shells and keep their beaks trimmed.' }
      ]
    },
    reptiles: {
      title: 'Reptiles & Terrariums',
      desc: 'Specialized lockable glass terrariums, linear desert UVB bulbs, heating lamps, mold-resistant substrates, and pure calcium powders for chameleons, bearded dragons, and snakes.',
      hero: 'https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=1200&auto=format&fit=crop',
      subcategories: [
        { name: 'Reptile Food', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&auto=format&fit=crop' },
        { name: 'Terrariums', img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=300&auto=format&fit=crop' },
        { name: 'Heating & Lighting', img: 'https://images.unsplash.com/photo-1472645977521-95bbf4f0a748?w=300&auto=format&fit=crop' },
        { name: 'Calcium & Supplements', img: 'https://images.unsplash.com/photo-1627398225058-20d3de3ef908?w=300&auto=format&fit=crop' },
        { name: 'Décor', img: 'https://images.unsplash.com/photo-1580226955007-88eb7c71d3d6?w=300&auto=format&fit=crop' },
        { name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=300&auto=format&fit=crop' }
      ],
      faqs: [
        { q: 'Why is UVB lighting mandatory for bearded dragons?', a: 'Bearded dragons are desert species that require high UVB output to synthesize vitamin D3. Without it, they cannot metabolize dietary calcium, leading to fatal Metabolic Bone Disease.' },
        { q: 'When do I use calcium with vs without Vitamin D3?', a: 'Use calcium with D3 for indoor reptiles relying on artificial lighting. Use D3-free calcium for reptiles housed outdoors in natural sunlight, to prevent D3 overdose.' }
      ]
    },
    fish: {
      title: 'Fish & Aquatics',
      desc: 'Premium rimless glass aquariums, multi-stage filtration kits, full spectrum plant LEDs, dechlorinating stress coat conditioners, and biological starter aids.',
      hero: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop',
      subcategories: [
        { name: 'Aquariums & Tanks', img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=300&auto=format&fit=crop' },
        { name: 'Water Care & Filtration', img: 'https://images.unsplash.com/photo-1535591273668-578e3111ea3c?w=300&auto=format&fit=crop' },
        { name: 'Fish Food', img: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=300&auto=format&fit=crop' },
        { name: 'Aquarium Lighting', img: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=300&auto=format&fit=crop' },
        { name: 'Plants & Décor', img: 'https://images.unsplash.com/photo-1580226955007-88eb7c71d3d6?w=300&auto=format&fit=crop' },
        { name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=300&auto=format&fit=crop' }
      ],
      faqs: [
        { q: 'What is the Nitrogen Cycle in aquaria?', a: 'It is the biological process where beneficial filter bacteria convert highly toxic fish waste (Ammonia) into toxic Nitrites, and then into harmless Nitrates, which you remove with weekly 25% water changes.' },
        { q: 'How does API Stress Coat protect fish?', a: 'It dechlorinates tap water instantly and features an Aloe Vera extract layer that repairs skin tissue and creates a synthetic slime coating to reduce transportation stress.' }
      ]
    },
    pharmacy: {
      title: 'Veterinary Pharmacy',
      desc: 'Authorized pharmacy department providing vitamins, joint care chondroitin capsules, digestion syrups, wound antiseptic kits, and strict prescription verification medications.',
      hero: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
      subcategories: [
        { name: 'Vitamins & Supplements', img: 'https://images.unsplash.com/photo-1627398225058-20d3de3ef908?w=300&auto=format&fit=crop' },
        { name: 'First Aid & Healthcare', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop' },
        { name: 'Skin Care', img: 'https://images.unsplash.com/photo-1584036109968-36e78dbf1454?w=300&auto=format&fit=crop' },
        { name: 'Joint Care', img: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=300&auto=format&fit=crop' },
        { name: 'Digestive Care', img: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=300&auto=format&fit=crop' },
        { name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop' }
      ],
      faqs: [
        { q: 'How do I purchase prescription items (marked with Rx)?', a: 'Add the items to your cart, upload your veterinary prescription on the checkout/pharmacy page, and our licensed pharmacist will verify the upload within 2 hours to confirm shipping.' },
        { q: 'Can I return veterinary medicines or supplements?', a: 'For safety, we cannot accept returns on veterinary pharmaceutical products once dispatched.' }
      ]
    }
  };

  const activePet = filters.petType;
  const currentMeta = petMetadata[activePet] || {
    title: 'Pawora Luxury Collection',
    desc: 'Everything they need. Everything they love. Browse our collection of premium pet lifestyle foods, veterinary healthcare supplements, and designer enclosures.',
    hero: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200',
    subcategories: [],
    faqs: []
  };

  // Build the list of images to slide
  const heroImages = useMemo(() => {
    const images = [currentMeta.hero];
    if (currentMeta.subcategories && currentMeta.subcategories.length > 0) {
       currentMeta.subcategories.slice(0, 3).forEach(sub => {
         const hqImg = sub.img.replace('w=300', 'w=1200');
         images.push(hqImg);
       });
    }
    return images;
  }, [currentMeta]);

  const [heroIndex, setHeroIndex] = useState(0);

  // Reset index when pet type changes
  useEffect(() => {
    setHeroIndex(0);
  }, [activePet]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Reusable Filter Content (Used for both Desktop Sidebar and Mobile Drawer)
  const renderFilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-beige pb-3">
        <span className="font-serif text-base text-primary font-bold">FILTERS</span>
        <button 
          onClick={handleClearFilters}
          className="text-[10px] text-accent font-bold hover:text-primary transition uppercase flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw size={10} /> CLEAR ALL
        </button>
      </div>

      {/* 1. Department Selection with Pharmacy Dropdown */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-widest text-primary font-bold">DEPARTMENT</h4>
        <div className="space-y-1 text-xs">
          
          {/* "All Items" Option */}
          <button
            onClick={() => {
              setIsPharmacyDropdownOpen(false);
              setSelectedPharmacyPet('all');
              handleFilterChange({ petType: '', category: '', subcategory: '', search: '' });
              setSearchParams({});
            }}
            className={`flex items-center justify-between w-full py-1.5 px-2 rounded-md font-semibold uppercase tracking-wider text-left transition cursor-pointer ${
              !filters.petType ? 'bg-primary text-white font-bold' : 'text-gray-600 hover:bg-secondary hover:text-primary'
            }`}
          >
            <span>All Departments</span>
            {!filters.petType && <Check size={12} />}
          </button>

          {/* Department Items */}
          {DEPARTMENTS.map((dept) => {
            const isDeptActive = filters.petType === dept.id;
            const hasSubcategories = dept.id !== 'pharmacy' && petMetadata[dept.id]?.subcategories?.length > 0;

            if (dept.id === 'pharmacy' || hasSubcategories) {
              return (
                <div key={dept.id} className="space-y-1">
                  {/* Department Main Button */}
                  <button
                    onClick={() => handleSelectDepartment(dept.id)}
                    className={`flex items-center justify-between w-full py-1.5 px-2 rounded-md font-semibold uppercase tracking-wider text-left transition cursor-pointer ${
                      isDeptActive 
                        ? 'bg-primary text-white font-bold' 
                        : 'text-gray-600 hover:bg-secondary hover:text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{dept.label}</span>
                      {dept.id === 'pharmacy' && selectedPharmacyPet !== 'all' && isDeptActive && (
                        <span className="text-[10px] normal-case bg-accent text-primary px-1.5 py-0.2 rounded font-bold">
                          ({selectedPharmacyPet})
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transform transition-transform duration-200 ${
                        (dept.id === 'pharmacy' ? isPharmacyDropdownOpen : isDeptActive) ? 'rotate-180 text-white' : isDeptActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {/* Sub-Dropdown */}
                  {dept.id === 'pharmacy' ? (
                    isPharmacyDropdownOpen && (
                      <div className="pl-3 pr-1 py-1 space-y-1 bg-secondary/70 border-l-2 border-primary rounded-r-md animate-in fade-in slide-in-from-top-1 duration-150">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block pl-2 pt-1">
                          Filter Pharmacy By Pet:
                        </span>
                        {PHARMACY_PET_OPTIONS.map((subPet) => {
                          const isSubActive = isDeptActive && selectedPharmacyPet === subPet.id;
                          return (
                            <button
                              key={subPet.id}
                              onClick={() => handleSelectPharmacyPet(subPet.id)}
                              className={`flex items-center justify-between w-full py-1.5 px-2.5 rounded text-xs transition cursor-pointer ${
                                isSubActive
                                  ? 'bg-primary text-white font-bold shadow-xs'
                                  : 'text-gray-600 hover:text-primary hover:bg-white/80 font-medium'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-[10px]">🐾</span>
                                <span>{subPet.label}</span>
                              </span>
                              {isSubActive && <Check size={11} />}
                            </button>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    isDeptActive && (
                      <div className="pl-3 pr-1 py-1 space-y-1 bg-secondary/70 border-l-2 border-primary rounded-r-md animate-in fade-in slide-in-from-top-1 duration-150">
                        <button
                          onClick={() => handleFilterChange({ subcategory: '' })}
                          className={`flex items-center justify-between w-full py-1.5 px-2.5 rounded text-xs transition cursor-pointer ${
                            !filters.subcategory
                              ? 'bg-primary text-white font-bold shadow-xs'
                              : 'text-gray-600 hover:text-primary hover:bg-white/80 font-medium'
                          }`}
                        >
                          <span>All {dept.label}</span>
                          {!filters.subcategory && <Check size={11} />}
                        </button>
                        {petMetadata[dept.id].subcategories.map((sub) => {
                          const isSubActive = filters.subcategory === sub.name;
                          return (
                            <button
                              key={sub.name}
                              onClick={() => handleFilterChange({ subcategory: sub.name })}
                              className={`flex items-center justify-between w-full py-1.5 px-2.5 rounded text-xs transition cursor-pointer ${
                                isSubActive
                                  ? 'bg-primary text-white font-bold shadow-xs'
                                  : 'text-gray-600 hover:text-primary hover:bg-white/80 font-medium'
                              }`}
                            >
                              <span>{sub.name}</span>
                              {isSubActive && <Check size={11} />}
                            </button>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              );
            }

            return (
              <button
                key={dept.id}
                onClick={() => handleSelectDepartment(dept.id)}
                className={`flex items-center justify-between w-full py-1.5 px-2 rounded-md font-semibold uppercase tracking-wider text-left transition cursor-pointer ${
                  isDeptActive ? 'bg-primary text-white font-bold' : 'text-gray-600 hover:bg-secondary hover:text-primary'
                }`}
              >
                <span>{dept.label}</span>
                {isDeptActive && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Brands Filter Based on Selected Pet / Department */}
      <div className="space-y-2 pt-4 border-t border-beige">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-widest text-primary font-bold">BRANDS</h4>
          <span className="text-[10px] text-accent font-bold">
            {filters.petType ? `${filters.petType.toUpperCase()}` : 'ALL'}
          </span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {currentAvailableBrands.length > 0 ? (
            currentAvailableBrands.map((b) => {
              const activeBrands = filters.brand ? filters.brand.split(',') : [];
              const isChecked = activeBrands.includes(b);
              return (
                <label key={b} className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary cursor-pointer transition">
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const updated = isChecked 
                        ? activeBrands.filter(x => x !== b) 
                        : [...activeBrands, b];
                      handleFilterChange({ brand: updated.join(',') });
                    }}
                    className="rounded-none border-beige text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className={isChecked ? 'font-bold text-primary' : 'font-medium'}>{b}</span>
                </label>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic">No brands listed for this pet.</p>
          )}
        </div>
      </div>

      {/* 3. Price Filter */}
      <div className="space-y-2 pt-4 border-t border-beige">
        <h4 className="text-xs uppercase tracking-widest text-primary font-bold">PRICE RANGE</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
            className="px-2.5 py-1.5 border border-beige text-xs focus:outline-none focus:border-primary rounded"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
            className="px-2.5 py-1.5 border border-beige text-xs focus:outline-none focus:border-primary rounded"
          />
        </div>
      </div>

      {/* 4. Ratings Filter */}
      <div className="space-y-2 pt-4 border-t border-beige">
        <h4 className="text-xs uppercase tracking-widest text-primary font-bold">RATINGS</h4>
        <div className="space-y-1 text-xs">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => handleFilterChange({ rating: parseFloat(filters.rating) === stars ? '' : stars })}
              className={`flex items-center justify-between py-1 px-1.5 rounded w-full text-left font-semibold cursor-pointer transition ${
                parseFloat(filters.rating) === stars ? 'bg-secondary text-primary font-bold' : 'text-gray-500 hover:text-primary hover:bg-secondary/50'
              }`}
            >
              <span>{stars} Stars & Above</span>
              {parseFloat(filters.rating) === stars && <Check size={12} className="text-accent" />}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Prescription Filter */}
      <div className="space-y-2 pt-4 border-t border-beige">
        <h4 className="text-xs uppercase tracking-widest text-primary font-bold">PRESCRIPTION</h4>
        <label className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary cursor-pointer">
          <input
            type="checkbox"
            checked={filters.requiresPrescription === 'true'}
            onChange={(e) => handleFilterChange({ requiresPrescription: e.target.checked ? 'true' : '' })}
            className="rounded-none border-beige text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span className="font-medium">Requires Vet Prescription</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative h-[50vh] md:h-[55vh] flex items-center justify-center overflow-hidden">
        {heroImages.map((img, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img 
              src={img} 
              alt={`${currentMeta.title} slide ${idx + 1}`} 
              className="w-full h-full object-cover filter brightness-75 scale-105 transform origin-center transition-transform duration-[20s] hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F2E23] via-[#0F2E23]/20 to-transparent opacity-80"></div>
          </div>
        ))}
        <ScrollReveal variant="blurIn" className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-5">
          <span className="inline-block text-[10px] md:text-xs tracking-[0.25em] font-bold text-amber-400 uppercase bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
            PAWORA LIFE EXCLUSIVE
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white drop-shadow-2xl tracking-tight leading-tight">
            {currentMeta.title}
          </h1>
          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-lg">
            {currentMeta.desc}
          </p>
        </ScrollReveal>
      </section>



      {/* 3. CATALOG & FILTERS GRID */}
      <ScrollReveal variant="fade">
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden mb-6 flex justify-between items-center bg-white border border-gray-100 px-5 py-4 rounded-2xl shadow-sm">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"
            >
              <SlidersHorizontal size={14} />
              <span>Filter Catalog ({currentAvailableBrands.length} Brands)</span>
            </button>
            <span className="text-xs text-gray-500 font-medium">
              {products.length} Products
            </span>
          </div>
  
          {/* Mobile Filter Modal Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden flex justify-end">
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setMobileFiltersOpen(false)}
              ></div>
              <div className="relative bg-white w-80 max-w-full h-full shadow-2xl p-6 overflow-y-auto z-10 space-y-6">
                <div className="flex justify-between items-center border-b border-beige pb-3">
                  <span className="font-serif text-lg font-bold text-primary">Catalog Filters</span>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-gray-400 hover:text-primary rounded-full"
                  >
                    <X size={18} />
                  </button>
                </div>
                {renderFilterSidebar()}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full btn-premium py-2.5 text-xs font-bold"
                >
                  Apply Filters & View Products
                </button>
              </div>
            </div>
          )}
  
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT FILTER PANEL (Desktop) */}
            <aside className="hidden lg:block w-72 shrink-0 bg-white/60 backdrop-blur-3xl border border-beige/60 p-7 space-y-6 rounded-3xl shadow-glass sticky top-32 z-10">
              {renderFilterSidebar()}
            </aside>
  
            {/* RIGHT PRODUCT GRID PANEL */}
            <div className="flex-1 min-w-0 space-y-6">
  
              {/* Premium Subcategories Image Grid */}
              {currentMeta.subcategories && currentMeta.subcategories.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar">
                    <div 
                      onClick={() => handleFilterChange({ subcategory: '' })}
                      className={`relative min-w-[150px] h-[110px] rounded-2xl overflow-hidden cursor-pointer group shadow-md transition-all duration-300 ${!filters.subcategory ? 'ring-2 ring-primary ring-offset-4 shadow-xl' : 'hover:shadow-xl hover:-translate-y-1'}`}
                    >
                      <img src={currentMeta.hero} alt={`All ${currentMeta.title.split(' ')[0]}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter group-hover:brightness-110" />
                      <div className={`absolute inset-0 transition-all duration-500 flex flex-col justify-end p-4 ${!filters.subcategory ? 'bg-gradient-to-t from-primary/90 via-primary/30 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-primary/80 group-hover:via-primary/20'}`}>
                        <span className={`text-white font-bold text-xs uppercase tracking-wider ${!filters.subcategory ? 'translate-y-0' : 'translate-y-2 group-hover:translate-y-0'} transition-transform duration-300 drop-shadow-md`}>All {currentMeta.title.split(' ')[0]}</span>
                      </div>
                    </div>
                    
                    {currentMeta.subcategories.map((sub) => {
                      const isActive = filters.subcategory === sub.name;
                      return (
                        <div 
                          key={sub.name}
                          onClick={() => handleFilterChange({ subcategory: sub.name })}
                          className={`relative min-w-[150px] h-[110px] rounded-2xl overflow-hidden cursor-pointer group shadow-md transition-all duration-300 ${isActive ? 'ring-2 ring-primary ring-offset-4 shadow-xl' : 'hover:shadow-xl hover:-translate-y-1'}`}
                        >
                          <img src={sub.img} alt={sub.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter group-hover:brightness-110" />
                          <div className={`absolute inset-0 transition-all duration-500 flex flex-col justify-end p-4 ${isActive ? 'bg-gradient-to-t from-primary/90 via-primary/30 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-primary/80 group-hover:via-primary/20'}`}>
                            <span className={`text-white font-bold text-xs uppercase tracking-wider ${isActive ? 'translate-y-0' : 'translate-y-2 group-hover:translate-y-0'} transition-transform duration-300 drop-shadow-md`}>{sub.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Toolbar: Result Counts & Sorting */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-3xl border border-beige/60 px-7 py-5 shadow-glass rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Showing <span className="text-primary">{products.length}</span> of {total} products
                  </span>
                  {filters.petType && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-primary text-secondary px-3 py-1 rounded-full shadow-sm">
                      {filters.petType} {selectedPharmacyPet !== 'all' ? `• ${selectedPharmacyPet}` : ''}
                    </span>
                  )}
                </div>
  
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <ArrowUpDown size={14} />
                    <span>Sort:</span>
                  </div>
                  <div className="relative group">
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange({ sort: e.target.value })}
                      className="appearance-none bg-secondary/50 border border-beige hover:border-primary text-primary px-4 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="date_desc">New Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating_desc">Best Rated</option>
                      <option value="featured">Featured Collection</option>
                      <option value="bestseller">Bestsellers</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </div>
  
              {/* Active search tag */}
              {filters.search && (
                <div className="flex items-center gap-2 text-xs bg-white border border-beige p-3 shadow-sm rounded-xl">
                  <span className="text-gray-400">Search query:</span>
                  <span className="font-bold text-primary">"{filters.search}"</span>
                  <button 
                    onClick={() => handleFilterChange({ search: '' })}
                    className="p-0.5 hover:bg-gray-100 rounded-full cursor-pointer ml-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
  
              {/* Products grid container */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(idx => (
                    <div key={idx} className="bg-white border border-gray-100 h-[400px] animate-pulse rounded-2xl"></div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white border border-gray-100 rounded-2xl space-y-4 flex flex-col items-center shadow-sm">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-2">
                    <SearchX size={40} className="text-primary/40" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary">No products found</h3>
                  <p className="text-gray-400 text-sm max-w-sm">We couldn't find anything matching your current filters. Try exploring other categories.</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-md hover:bg-primary/90 transition-all hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
  
              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-9 h-9 border text-xs font-bold transition flex items-center justify-center cursor-pointer rounded ${
                        page === pNum 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-white text-gray-500 border-beige hover:border-primary'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
  
          </div>
        </section>
      </ScrollReveal>

      {/* 4. EDUCATIONAL FAQ ACCORDION SECTION */}
      {currentMeta.faqs && currentMeta.faqs.length > 0 && (
        <ScrollReveal variant="slideUp">
          <section className="max-w-4xl mx-auto px-6 space-y-6 pt-10">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-accent font-bold">LEARNING & CARE</span>
              <h2 className="text-2xl font-serif text-primary">Expert FAQ & Advice</h2>
            </div>
            <div className="space-y-4 bg-white border border-beige p-6 shadow-sm rounded-xl">
              {currentMeta.faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-beige last:border-b-0 pb-4 last:pb-0">
                  <button
                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                    className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-semibold text-primary hover:text-accent transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`transform transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpen === idx && (
                    <p className="text-xs text-gray-500 leading-relaxed pt-2 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

    </div>
  );
};

export default Shop;
