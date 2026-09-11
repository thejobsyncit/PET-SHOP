import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, Sparkles, ArrowRight, Flame, ShieldCheck, PawPrint } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import WalkingDogOnLine from './WalkingDogOnLine.jsx';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus input on open & bind Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Debounced Search API call
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiRequest(`/products?search=${encodeURIComponent(query)}&limit=6`);
        if (data.success) {
          setResults(data.products || []);
        }
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (keyword) => {
    setQuery(keyword);
    onClose();
    navigate(`/shop?search=${encodeURIComponent(keyword)}`);
  };

  const handleProductClick = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  // Original Popular Searches in White & Gold Theme
  const popularSearches = [
    { label: 'Royal Canin Kibble', icon: '🍖' },
    { label: 'UVB Reptile Lamp', icon: '💡' },
    { label: 'Terrarium Substrate', icon: '🌿' },
    { label: 'Tropical Fish Food', icon: '🐠' },
    { label: 'Joint Multivitamins', icon: '💊' },
    { label: 'Orthopedic Dog Bed', icon: '🦮' },
  ];

  // Original Animal Departments in White & Gold Theme
  const departments = [
    { name: 'Dogs', icon: '🐕', desc: 'Nutrition, Toys & Wellness', path: '/shop?petType=dogs' },
    { name: 'Cats', icon: '🐈', desc: 'Kibble, Scratchers & Litter', path: '/shop?petType=cats' },
    { name: 'Birds', icon: '🦜', desc: 'Avian Seeds, Cages & Toys', path: '/shop?petType=birds' },
    { name: 'Reptiles', icon: '🦎', desc: 'Terrariums, Heat & Diet', path: '/shop?petType=reptiles' },
    { name: 'Fish & Aquatic', icon: '🐠', desc: 'Aquariums, Filters & Feed', path: '/shop?petType=fish' },
    { name: 'Veterinary Rx', icon: '🩺', desc: 'Supplements & Doctors', path: '/pharmacy' },
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F5EFE0] text-stone-900 flex flex-col transition-all duration-300">
      
      {/* Ambient Luxury Gold Aura Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Header matching Navbar Branding & Color Scheme */}
      <div className="relative z-20 w-full bg-primary text-white border-b border-white/10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Left: Brand Logo matching home page Navbar exactly */}
            <Link
              to="/"
              onClick={onClose}
              className="mr-1 sm:mr-4 flex items-center font-extrabold tracking-tight shrink-0 group cursor-pointer"
            >
              {/* J-Animal Logo (True Transparent Background) */}
              <img 
                src="/logo.png" 
                alt="Josh Pet Hub Logo" 
                className="h-8 sm:h-10 md:h-12 w-auto object-contain mr-1 sm:mr-2 shrink-0" 
              />
              
              {/* JOSH PETS HUB (Uniform White matching Home Page Navbar) */}
              <span className="text-white drop-shadow-sm flex items-center font-black tracking-tight text-lg sm:text-2xl md:text-3xl">
                J
                <div className="relative mx-0.5 flex items-center justify-center bg-white rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shadow-sm shrink-0">
                  <PawPrint size={10} className="text-orange-500 fill-orange-500 sm:w-3.5 sm:h-3.5" />
                </div>
                SH 
                <span className="ml-1 sm:ml-1.5 md:ml-2">PETS</span> 
                <span className="ml-1 sm:ml-1.5 md:ml-2">HUB</span>
              </span>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-amber-400/40 text-[10px] uppercase font-bold tracking-widest text-[#ffd000] shadow-xs">
              <Sparkles size={11} className="text-[#ffd000]" />
              Verified Search
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-white/80 shadow-xs">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono text-white border border-white/20">ESC</kbd>
              <span>to close</span>
            </div>

            <button
              onClick={onClose}
              className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-[#ffd000] transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
              title="Close Search (Esc)"
            >
              <X size={20} className="transition-transform duration-200 group-hover:rotate-90 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Content Area */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-6 flex-grow flex flex-col justify-start pt-8 md:pt-14 pb-16">
        
        {/* =========================================================================
            SEARCH BAR AREA WITH ANIMATED COMPANION ON GOLDEN LINE
           ========================================================================= */}
        <div className="relative mb-12">
          
          {/* Luxury White & Gold Signature Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative group flex items-center bg-white hover:bg-white focus-within:bg-white rounded-2xl border-2 border-[#D4AF37] focus-within:border-[#B8860B] transition-all duration-200 shadow-[0_10px_35px_rgba(212,175,55,0.18)] hover:shadow-[0_14px_45px_rgba(212,175,55,0.25)] focus-within:ring-4 focus-within:ring-amber-200/50 px-5 md:px-7 pt-3.5 pb-5 md:pt-4 md:pb-6 min-h-[72px] overflow-visible"
          >
            {/* Search Icon */}
            <div className="mr-3.5 text-[#B8860B] flex items-center justify-center relative z-20 shrink-0 mb-1.5">
              <Search size={26} className="transition-transform duration-200 group-focus-within:scale-110" />
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search premium pet food, treats, breeds, toys, vet care..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-base md:text-xl font-sans font-medium text-stone-900 placeholder-stone-400 focus:outline-none tracking-wide relative z-20 mb-1.5"
            />

            {/* Walking Companion on the golden baseline */}
            <WalkingDogOnLine isSearching={query.trim().length > 0} />

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 ml-3 relative z-20 shrink-0 mt-1 md:mt-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-stone-600 hover:text-stone-900 border border-amber-200 transition cursor-pointer"
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}

              <button
                type="submit"
                className="hidden sm:flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E8CD69] to-[#B8860B] hover:from-[#C59B27] hover:to-[#9E6F09] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_14px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.45)] transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Search</span>
              </button>
            </div>
          </form>

        </div>

        {/* =========================================================================
            DYNAMIC SEARCH RESULTS / EMPTY STATE / SUGGESTIONS
           ========================================================================= */}
        {query.trim() ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-amber-200/80 pb-3">
              <h3 className="font-serif text-base md:text-lg text-[#996515] tracking-wider uppercase flex items-center gap-2">
                <Search size={18} className="text-[#C59B27]" />
                Search Results for <span className="text-stone-900 font-sans font-bold">"{query}"</span>
              </h3>
              {results.length > 0 && (
                <span className="text-xs text-stone-500 font-medium">
                  Showing {results.length} top matches
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 lg:py-16 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-200 border-t-[#D4AF37] animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center text-sm">🐾</span>
                </div>
                <span className="text-sm font-medium text-stone-600">Fetching verified pet products...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product.slug)}
                      className="group flex items-center gap-4 p-3.5 bg-white hover:bg-gradient-to-r hover:from-white hover:to-amber-50/50 border border-amber-200/80 hover:border-[#D4AF37] rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="w-18 h-18 rounded-xl overflow-hidden bg-amber-50/60 border border-amber-200/60 shrink-0 flex items-center justify-center">
                        <img
                          src={product.images?.[0] || '/placeholder-pet.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#996515] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 truncate max-w-[120px]">
                            {product.brand || 'PET HUB'}
                          </span>
                          <span className="text-[11px] text-stone-500 capitalize truncate">
                            {product.petType}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#B8860B] transition-colors truncate">
                          {product.name}
                        </h4>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-bold text-[#B8860B]">
                            ₹{product.discountPrice || product.price}
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                          {product.discountPrice && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-stone-400 group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Results Button */}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-[#E8CD69] to-[#B8860B] hover:from-[#C59B27] hover:to-[#9E6F09] text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_4px_14px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.45)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4 active:scale-98"
                >
                  <span>View All Results for "{query}"</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center py-14 px-6 bg-white border border-amber-200/80 rounded-2xl shadow-sm">
                <span className="text-4xl block mb-3">🔍</span>
                <h4 className="font-serif text-lg text-stone-900 font-semibold mb-1">No exact product matches found</h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto mb-6">
                  Try searching for general keywords like "kibble", "leash", "bird cage", "shampoo", or "vitamins".
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Dog Food', 'Cat Toys', 'Fish Tank', 'Veterinary'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-[#D4AF37] hover:text-stone-950 text-xs text-stone-800 border border-amber-200/80 transition cursor-pointer font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
              DEFAULT STATE: POPULAR SEARCHES & DEPARTMENTS (WHITE & GOLD)
             ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 animate-in fade-in duration-200">
            
            {/* Popular Searches Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#C59B27]" />
                <h3 className="font-serif text-sm font-bold tracking-widest uppercase text-stone-900">
                  Trending Searches
                </h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {popularSearches.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSuggestionClick(item.label)}
                    className="group px-4 py-2.5 bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 border border-amber-200/80 hover:border-[#D4AF37] rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 shadow-xs hover:shadow-md hover:shadow-amber-500/10"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 p-4 rounded-xl bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/30 border border-amber-200/80 flex items-start gap-3 shadow-xs">
                <ShieldCheck size={20} className="text-[#C59B27] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-stone-900">100% Genuine Pet Care</h5>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    All products & services verified by certified Indian pet care & veterinary professionals.
                  </p>
                </div>
              </div>
            </div>

            {/* Departments Grid Column (Original Departments in White & Gold) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#C59B27]" />
                <h3 className="font-serif text-sm font-bold tracking-widest uppercase text-stone-900">
                  Shop by Department
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.name}
                    onClick={() => {
                      onClose();
                      navigate(dept.path);
                    }}
                    className="group p-3.5 bg-white hover:bg-gradient-to-br hover:from-white hover:via-amber-50/50 hover:to-yellow-50/60 border border-amber-200/80 hover:border-[#D4AF37] rounded-xl text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer shadow-xs"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                      {dept.icon}
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#B8860B] transition-colors">
                      {dept.name}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                      {dept.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SearchOverlay;
