import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Sparkles, ArrowRight, CornerDownLeft, Flame, ShieldCheck, PawPrint } from 'lucide-react';
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

  const popularSearches = [
    { label: 'Royal Canin Kibble', icon: '🍖' },
    { label: 'UVB Reptile Lamp', icon: '💡' },
    { label: 'Terrarium Substrate', icon: '🌿' },
    { label: 'Tropical Fish Food', icon: '🐠' },
    { label: 'Joint Multivitamins', icon: '💊' },
    { label: 'Orthopedic Dog Bed', icon: '🦮' },
  ];

  const departments = [
    { name: 'Dogs', icon: '🐕', desc: 'Nutrition, Toys & Wellness', path: '/shop?petType=dogs' },
    { name: 'Cats', icon: '🐈', desc: 'Kibble, Scratchers & Litter', path: '/shop?petType=cats' },
    { name: 'Birds', icon: '🦜', desc: 'Avian Seeds, Cages & Toys', path: '/shop?petType=birds' },
    { name: 'Reptiles', icon: '🦎', desc: 'Terrariums, Heat & Diet', path: '/shop?petType=reptiles' },
    { name: 'Fish & Aquatic', icon: '🐠', desc: 'Aquariums, Filters & Feed', path: '/shop?petType=fish' },
    { name: 'Veterinary Rx', icon: '🩺', desc: 'Supplements & Doctors', path: '/pharmacy' },
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#091f36] text-white flex flex-col transition-all duration-300">
      
      {/* Top Bar Header matching JOSH PETS HUB navbar */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 md:py-8 flex justify-between items-center border-b border-[#184575]">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="JOSH PETS HUB Logo" 
            className="h-10 w-auto object-contain" 
          />
          <div className="flex items-center">
            <span className="text-white drop-shadow-sm flex items-center font-black tracking-tight text-xl md:text-2xl">
              J
              <div className="relative mx-0.5 flex items-center justify-center bg-white rounded-full w-5 h-5 shadow-xs">
                <PawPrint size={13} className="text-orange-500 fill-orange-500" />
              </div>
              SH 
              <span className="ml-1.5 text-white">PETS</span> 
              <span className="ml-1.5 text-white">HUB</span>
            </span>
            <span className="hidden md:inline-block ml-3 px-2.5 py-0.5 rounded-full bg-[#15559c] border border-[#ffd000]/40 text-[10px] uppercase font-bold tracking-widest text-[#ffd000]">
              Verified Search
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e2c4d] border border-[#1d4c80] text-xs text-slate-300">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-[#173e6b] rounded text-[10px] font-mono text-white border border-[#235891]">ESC</kbd>
            <span>to close</span>
          </div>

          <button
            onClick={onClose}
            className="group relative p-2.5 rounded-full bg-[#0e2c4d] hover:bg-[#15559c] border border-[#1d4c80] hover:border-[#ffd000] text-slate-200 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
            title="Close Search (Esc)"
          >
            <X size={20} className="transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>
      </div>

      {/* Main Search Content Area */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-6 flex-grow flex flex-col justify-start pt-8 md:pt-14 pb-16">
        
        {/* =========================================================================
            SEARCH BAR AREA WITH ANIMATED WALKING DOG INSIDE
           ========================================================================= */}
        <div className="relative mb-12">
          
          {/* India Pet Hub Signature Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative group flex items-center bg-[#0c2744] hover:bg-[#0f3054] focus-within:bg-[#0f3054] rounded-2xl border-2 border-[#1c4a7c] focus-within:border-[#ffd000] transition-all duration-200 shadow-2xl px-5 md:px-7 pt-3.5 pb-5 md:pt-4 md:pb-6 min-h-[72px] overflow-visible"
          >
            {/* Search Icon */}
            <div className="mr-3.5 text-[#ffd000] flex items-center justify-center relative z-20 shrink-0 mb-1.5">
              <Search size={26} className="transition-transform duration-200 group-focus-within:scale-110" />
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search premium pet food, treats, breeds, toys, vet care..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-base md:text-xl font-sans font-medium text-white placeholder-slate-400 focus:outline-none tracking-wide relative z-20 mb-1.5"
            />

            {/* Walking Dog Component: Trots right on the bottom line of the search bar */}
            <WalkingDogOnLine isSearching={query.trim().length > 0} />

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 ml-3 relative z-20 shrink-0 mb-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-full bg-[#18426d] hover:bg-[#20548a] text-slate-200 hover:text-white transition cursor-pointer"
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}

              <button
                type="submit"
                className="hidden sm:flex items-center gap-1.5 px-4.5 py-2.5 bg-[#ffd000] hover:bg-white text-[#0f3d6b] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Search</span>
                <CornerDownLeft size={14} />
              </button>
            </div>
          </form>

        </div>

        {/* =========================================================================
            DYNAMIC SEARCH RESULTS / EMPTY STATE / SUGGESTIONS
           ========================================================================= */}
        {query.trim() ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#184575] pb-3">
              <h3 className="font-serif text-base md:text-lg text-[#ffd000] tracking-wider uppercase flex items-center gap-2">
                <Search size={18} />
                Search Results for <span className="text-white font-sans font-bold">"{query}"</span>
              </h3>
              {results.length > 0 && (
                <span className="text-xs text-slate-300 font-medium">
                  Showing {results.length} top matches
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[#ffd000]/30 border-t-[#ffd000] animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center text-sm">🐾</span>
                </div>
                <span className="text-sm font-medium text-slate-300">Fetching verified pet products...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product.slug)}
                      className="group flex items-center gap-4 p-3.5 bg-[#0c2744] hover:bg-[#12365a] border border-[#1b4673] hover:border-[#ffd000]/50 rounded-2xl transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-0.5"
                    >
                      <div className="w-18 h-18 rounded-xl overflow-hidden bg-[#07192b] border border-[#1b4673] shrink-0 flex items-center justify-center">
                        <img
                          src={product.images?.[0] || '/placeholder-pet.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffd000] bg-[#ffd000]/10 px-2 py-0.5 rounded border border-[#ffd000]/20 truncate max-w-[120px]">
                            {product.brand || 'PET HUB'}
                          </span>
                          <span className="text-[11px] text-slate-300 capitalize truncate">
                            {product.petType}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-white group-hover:text-[#ffd000] transition-colors truncate">
                          {product.name}
                        </h4>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-bold text-[#ffd000]">
                            ₹{product.discountPrice || product.price}
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                          {product.discountPrice && (
                            <span className="text-[10px] font-bold text-emerald-400">
                              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-slate-400 group-hover:text-[#ffd000] group-hover:translate-x-1 transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Results Button */}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-4 bg-[#ffd000] hover:bg-white text-[#0f3d6b] font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4 active:scale-98"
                >
                  <span>View All Results for "{query}"</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center py-14 px-6 bg-[#0c2744] border border-[#1b4673] rounded-2xl">
                <span className="text-4xl block mb-3">🔍</span>
                <h4 className="font-serif text-lg text-white font-semibold mb-1">No exact product matches found</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
                  Try searching for general keywords like "kibble", "leash", "bird cage", "shampoo", or "vitamins".
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Dog Food', 'Cat Toys', 'Fish Tank', 'Veterinary'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-lg bg-[#12365a] hover:bg-[#ffd000] hover:text-[#0f3d6b] text-xs text-white border border-[#1d4c80] transition cursor-pointer"
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
              DEFAULT STATE: POPULAR SEARCHES & DEPARTMENTS
             ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 animate-in fade-in duration-200">
            
            {/* Popular Searches Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 text-[#ffd000]">
                <Flame size={18} className="text-[#ffd000]" />
                <h3 className="font-serif text-sm font-bold tracking-widest uppercase text-white">
                  Trending Searches
                </h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {popularSearches.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSuggestionClick(item.label)}
                    className="group px-4 py-2.5 bg-[#0c2744] hover:bg-[#ffd000] hover:text-[#0f3d6b] border border-[#1b4673] hover:border-[#ffd000] rounded-xl text-xs font-medium text-slate-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 p-4 rounded-xl bg-[#0c2744] border border-[#1b4673] flex items-start gap-3">
                <ShieldCheck size={20} className="text-[#ffd000] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-white">100% Genuine Pet Care</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    All products & services verified by certified Indian pet care & veterinary professionals.
                  </p>
                </div>
              </div>
            </div>

            {/* Departments Grid Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-[#ffd000]">
                <Sparkles size={18} className="text-[#ffd000]" />
                <h3 className="font-serif text-sm font-bold tracking-widest uppercase text-white">
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
                    className="group p-3.5 bg-[#0c2744] hover:bg-[#12365a] border border-[#1b4673] hover:border-[#ffd000]/60 rounded-xl text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                      {dept.icon}
                    </div>
                    <h4 className="font-serif text-sm font-bold text-white group-hover:text-[#ffd000] transition-colors">
                      {dept.name}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">
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
