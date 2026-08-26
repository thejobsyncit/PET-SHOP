import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Sparkles } from 'lucide-react';
import { apiRequest } from '../services/api.js';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Debounced Search API call
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiRequest(`/products?search=${query}&limit=5`);
        if (data.success) {
          setResults(data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${query}`);
    }
  };

  const handleSuggestionClick = (keyword) => {
    onClose();
    navigate(`/shop?search=${keyword}`);
  };

  const handleProductClick = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const popularSearches = ['Kibble', 'UVB Light', 'Terrarium Substrate', 'Fish Food', 'Multivitamins'];

  return (
    <div className="fixed inset-0 z-50 bg-primary/95 text-white flex flex-col p-6 md:p-12 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full mb-8">
        <span className="font-serif text-2xl tracking-widest text-accent">PAWORA</span>
        <button 
          onClick={onClose}
          className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition duration-300 cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Search Input */}
      <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col justify-start pt-12 md:pt-20">
        <form onSubmit={handleSearchSubmit} className="relative mb-8">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search premium products, brands, or health needs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-b-2 border-white/20 py-4 pl-2 pr-12 text-2xl md:text-4xl font-serif text-white focus:outline-none focus:border-accent placeholder-white/30 transition-colors"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-accent cursor-pointer">
            <Search size={32} />
          </button>
        </form>

        {/* Dynamic Results or Popular Suggestions */}
        {query ? (
          <div>
            <h3 className="font-serif text-lg text-accent/80 mb-4 tracking-wider uppercase">Search Results</h3>
            {loading ? (
              <div className="flex items-center space-x-3 text-white/60">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-accent"></div>
                <span>Curating suggestions...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((product) => (
                  <div 
                    key={product._id}
                    onClick={() => handleProductClick(product.slug)}
                    className="flex items-center space-x-4 p-3 bg-white/5 hover:bg-white/10 border border-white/5 transition duration-300 cursor-pointer"
                  >
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover bg-white/10" 
                    />
                    <div className="flex-grow">
                      <span className="text-xs uppercase tracking-widest text-accent">{product.brand}</span>
                      <h4 className="text-sm font-semibold text-white truncate max-w-md">{product.name}</h4>
                      <p className="text-xs text-white/50">{product.category} • {product.petType}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-accent">₹{product.discountPrice || product.price}</span>
                      {product.discountPrice && (
                        <p className="text-xs text-white/40 line-through">₹{product.price}</p>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-3 bg-accent text-primary font-semibold text-sm tracking-widest hover:bg-white transition duration-300 cursor-pointer"
                >
                  VIEW ALL RESULTS
                </button>
              </div>
            ) : (
              <p className="text-white/60">No products found. Try looking for "food", "perch", or "supplement".</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Popular Keywords */}
            <div>
              <h3 className="font-serif text-lg text-accent/80 mb-4 tracking-wider flex items-center gap-2">
                <TrendingUp size={18} /> POPULAR SEARCHES
              </h3>
              <div className="flex flex-wrap gap-3">
                {popularSearches.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => handleSuggestionClick(keyword)}
                    className="px-4 py-2 bg-white/5 hover:bg-accent hover:text-primary border border-white/10 rounded-full text-sm transition duration-300 cursor-pointer"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop by Pet Categories */}
            <div>
              <h3 className="font-serif text-lg text-accent/80 mb-4 tracking-wider flex items-center gap-2">
                <Sparkles size={18} /> DEPARTMENTS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['Dogs', 'Birds', 'Reptiles', 'Fish', 'Pharmacy'].map((pet) => (
                  <button
                    key={pet}
                    onClick={() => {
                      onClose();
                      navigate(pet === 'Pharmacy' ? '/pharmacy' : `/shop?petType=${pet.toLowerCase() === 'fish' ? 'fish' : pet.toLowerCase()}`);
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-left font-serif text-base transition duration-300 cursor-pointer"
                  >
                    {pet}
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
