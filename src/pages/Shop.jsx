import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, ArrowUpDown, ChevronRight, RefreshCw, X, ChevronDown, Check } from 'lucide-react';
import { fetchProducts, setFilter, resetFilters } from '../store/slices/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, total, page, pages, filters, loading } = useSelector((state) => state.products);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  // Read URL parameters on mount and load them into Redux state
  useEffect(() => {
    const path = window.location.pathname;
    let petTypeParam = searchParams.get('petType') || '';
    if (!petTypeParam) {
      if (path.includes('/dogs')) petTypeParam = 'dogs';
      else if (path.includes('/birds')) petTypeParam = 'birds';
      else if (path.includes('/reptiles')) petTypeParam = 'reptiles';
      else if (path.includes('/fish')) petTypeParam = 'fish';
    }
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    
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

  const handleFilterChange = (newFilters) => {
    dispatch(setFilter(newFilters));
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
    setSearchParams({});
  };

  // Static meta categories listings
  const petMetadata = {
    dogs: {
      title: 'Dogs & Canines',
      desc: 'Expertly selected nutrition, organic treats, supportive memory-foam beds, leashes, and veterinary healthcare formulations tailored for large, medium, and small breed companions.',
      hero: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      subcategories: ['Dog Food', 'Treats', 'Beds', 'Grooming', 'Collars & Leashes', 'Bowls & Feeders', 'Training', 'Supplements'],
      faqs: [
        { q: 'How do I choose the correct food type for my puppy?', a: 'Puppies require highly digestible proteins and specialized fat ratios for rapid bone growth. Look for specialized labels like Himalaya Healthy Pet Food for Puppies.' },
        { q: 'Why should I buy an elevated food bowl stand?', a: 'Elevating feeding bowls improves digestive alignment, reduces neck strain, and prevents gas bloating during meals in medium and large breeds.' }
      ]
    },
    birds: {
      title: 'Birds & Aviary',
      desc: 'Premium seed blends, trace mineral blocks, Java wood perches, cage systems, and multivitamin drops formulated to maintain optimal plumage, beak size, and bird vitality.',
      hero: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1200&auto=format&fit=crop',
      subcategories: ['Bird Food', 'Cages', 'Perches', 'Toys', 'Supplements', 'Grooming', 'Feeding Accessories'],
      faqs: [
        { q: 'Why are natural wood perches better than plastic dowels?', a: 'Uniform plastic or smooth wood perches cause pressure sores and nail overgrowth. Natural java perches have varying diameters which exercise foot muscles and trim nails naturally.' },
        { q: 'How often should a bird have mineral blocks?', a: 'Mineral blocks must be kept inside the cage at all times. They provide vital calcium for bones and shells and keep their beaks trimmed.' }
      ]
    },
    reptiles: {
      title: 'Reptiles & Terrariums',
      desc: 'Specialized lockable glass terrariums, linear desert UVB bulbs, heating lamps, mold-resistant substrates, and pure calcium powders for chameleons, bearded dragons, and snakes.',
      hero: 'https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=1200&auto=format&fit=crop',
      subcategories: ['Terrariums', 'Heating', 'UVB Lighting', 'Substrate', 'Food', 'Calcium & Supplements', 'Décor', 'Humidity Equipment', 'Thermometers'],
      faqs: [
        { q: 'Why is UVB lighting mandatory for bearded dragons?', a: 'Bearded dragons are desert species that require high UVB output to synthesize vitamin D3. Without it, they cannot metabolize dietary calcium, leading to fatal Metabolic Bone Disease.' },
        { q: 'When do I use calcium with vs without Vitamin D3?', a: 'Use calcium with D3 for indoor reptiles relying on artificial lighting. Use D3-free calcium for reptiles housed outdoors in natural sunlight, to prevent D3 overdose.' }
      ]
    },
    fish: {
      title: 'Fish & Aquatics',
      desc: 'Premium rimless glass aquariums, multi-stage filtration kits, full spectrum plant LEDs, dechlorinating stress coat conditioners, and biological starter aids.',
      hero: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop',
      subcategories: ['Fish Food', 'Aquariums', 'Filters', 'Pumps', 'Aquarium Lighting', 'Water Conditioners', 'Aquarium Plants', 'Décor', 'Cleaning Equipment'],
      faqs: [
        { q: 'What is the Nitrogen Cycle in aquaria?', a: 'It is the biological process where beneficial filter bacteria convert highly toxic fish waste (Ammonia) into toxic Nitrites, and then into harmless Nitrates, which you remove with weekly 25% water changes.' },
        { q: 'How does API Stress Coat protect fish?', a: 'It dechlorinates tap water instantly and features an Aloe Vera extract layer that repairs skin tissue and creates a synthetic slime coating to reduce transportation stress.' }
      ]
    },
    pharmacy: {
      title: 'Veterinary Pharmacy',
      desc: 'Authorized pharmacy department providing vitamins, joint care chondroitin capsules, digestion syrups, wound antiseptic kits, and strict prescription verification medications.',
      hero: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
      subcategories: ['Vitamins', 'Supplements', 'Skin Care', 'Joint Care', 'Digestive Care', 'Dental Care', 'First Aid', 'Grooming Healthcare'],
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

  const availableBrands = ['Royal Canin', 'Pedigree', 'Drools', 'Zoo Med', 'Exo Terra', 'API', 'Hikari', 'Himalaya', 'Beaphar', 'Pawora'];

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden border-b border-beige">
        <div className="absolute inset-0">
          <img 
            src={currentMeta.hero} 
            alt={currentMeta.title} 
            className="w-full h-full object-cover filter brightness-[0.65]"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-4">
          <span className="text-[10px] tracking-widest font-bold text-accent uppercase">PAWORA LIFE</span>
          <h1 className="font-serif text-3xl md:text-5xl text-secondary">{currentMeta.title}</h1>
          <p className="text-xs md:text-sm text-secondary-dark max-w-xl mx-auto leading-relaxed font-light">
            {currentMeta.desc}
          </p>
        </div>
      </section>

      {/* 2. SUBCATEGORY PILLS ROW */}
      {currentMeta.subcategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-2 justify-center pb-4 border-b border-beige">
            <button
              onClick={() => handleFilterChange({ subcategory: '' })}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border transition ${
                !filters.subcategory
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-500 border-beige hover:border-primary'
              }`}
            >
              All Items
            </button>
            {currentMeta.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => handleFilterChange({ subcategory: sub })}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border transition ${
                  filters.subcategory === sub 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-gray-500 border-beige hover:border-primary'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. CATALOG & FILTERS GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT FILTER PANEL (Desktop only) */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white border border-beige p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-beige pb-3">
              <span className="font-serif text-base text-primary font-bold">FILTERS</span>
              <button 
                onClick={handleClearFilters}
                className="text-[10px] text-accent font-bold hover:text-primary transition uppercase flex items-center gap-1"
              >
                <RefreshCw size={10} /> CLEAR ALL
              </button>
            </div>

            {/* Department Selection */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold">Department</h4>
              <div className="space-y-1 text-xs">
                {['dogs', 'birds', 'reptiles', 'fish', 'pharmacy'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => handleFilterChange({ petType: dept, category: '', subcategory: '' })}
                    className={`flex items-center justify-between w-full py-1 font-semibold uppercase tracking-wider ${
                      filters.petType === dept ? 'text-accent' : 'text-gray-500 hover:text-primary'
                    }`}
                  >
                    <span>{dept === 'fish' ? 'Fish & Aquatics' : dept}</span>
                    {filters.petType === dept && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 pt-4 border-t border-beige">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold">BRANDS</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {availableBrands.map((b) => {
                  const activeBrands = filters.brand ? filters.brand.split(',') : [];
                  const isChecked = activeBrands.includes(b);
                  return (
                    <label key={b} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updated = isChecked 
                            ? activeBrands.filter(x => x !== b) 
                            : [...activeBrands, b];
                          handleFilterChange({ brand: updated.join(',') });
                        }}
                        className="rounded-none border-beige text-primary focus:ring-0 focus:ring-offset-0"
                      />
                      <span>{b}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 pt-4 border-t border-beige">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold">PRICE RANGE</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
                  className="px-2 py-1.5 border border-beige text-xs focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
                  className="px-2 py-1.5 border border-beige text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Ratings Filter */}
            <div className="space-y-2 pt-4 border-t border-beige">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold">RATINGS</h4>
              <div className="space-y-1 text-xs">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => handleFilterChange({ rating: stars })}
                    className={`flex items-center gap-2 py-1 w-full text-left font-semibold ${
                      parseFloat(filters.rating) === stars ? 'text-accent' : 'text-gray-500 hover:text-primary'
                    }`}
                  >
                    <span>{stars} Stars & Above</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription Filter */}
            <div className="space-y-2 pt-4 border-t border-beige">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold">Prescription</h4>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.requiresPrescription === 'true'}
                  onChange={(e) => handleFilterChange({ requiresPrescription: e.target.checked ? 'true' : '' })}
                  className="rounded-none border-beige text-primary focus:ring-0 focus:ring-offset-0"
                />
                <span>Requires Vet Prescription</span>
              </label>
            </div>
          </aside>

          {/* RIGHT PRODUCT GRID PANEL */}
          <div className="flex-grow w-full space-y-6">
            
            {/* Toolbar: Result Counts & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-beige px-6 py-4 shadow-sm">
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Showing {products.length} of {total} products
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  <span className="text-gray-500 uppercase">Sort By:</span>
                </div>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                  className="bg-transparent border-0 font-bold text-primary focus:outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="date_desc">New Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Best Rated</option>
                  <option value="featured">Featured Collection</option>
                  <option value="bestseller">Bestsellers</option>
                </select>
              </div>
            </div>

            {/* Active search tag */}
            {filters.search && (
              <div className="flex items-center gap-2 text-xs bg-white border border-beige p-3 shadow-sm">
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
                  <div key={idx} className="bg-white border border-beige h-[380px] animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-beige text-gray-500 text-xs">
                No products found matching the criteria. Try clearing some filters.
              </div>
            )}

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                {Array.from({ length: pages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`w-9 h-9 border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      page === pNum 
                        ? 'bg-primary text-white border-primary' 
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

      {/* 4. EDUCATIONAL FAQ ACCORDION SECTION */}
      {currentMeta.faqs && currentMeta.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 space-y-6 pt-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-accent font-bold">LEARNING & CARE</span>
            <h2 className="text-2xl">Expert FAQ & Advice</h2>
          </div>
          <div className="space-y-4 bg-white border border-beige p-6 shadow-sm">
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
      )}

    </div>
  );
};

export default Shop;
