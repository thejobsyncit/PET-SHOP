import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, Award } from 'lucide-react';
import { fetchProducts } from '../store/slices/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading } = useSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState('dogs');

  useEffect(() => {
    // Fetch featured items
    dispatch(fetchProducts({ isFeatured: 'true', limit: 30 }));
  }, [dispatch]);

  // Categories grid data
  const categoriesList = [
    {
      title: 'DOGS',
      desc: 'Nutritious kibble, organic treats, orthopedic beds, and luxury training gear.',
      img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
      path: '/shop?petType=dogs'
    },
    {
      title: 'BIRDS',
      desc: 'Gourmet seed mixes, natural wood perches, wrought-iron cages, and vitamins.',
      img: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800&auto=format&fit=crop',
      path: '/shop?petType=birds'
    },
    {
      title: 'REPTILES',
      desc: 'Glass terrariums, desert UVB bulbs, organic coco substrates, and calcium powders.',
      img: 'https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=800&auto=format&fit=crop',
      path: '/shop?petType=reptiles'
    },
    {
      title: 'FISH & AQUATICS',
      desc: 'Rimless low-iron tanks, external power filters, LED light panels, and live plants.',
      img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
      path: '/shop?petType=fish'
    },
    {
      title: 'PHARMACY',
      desc: 'Veterinary prescription support, joint formulas, skin lotions, and digestive drops.',
      img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
      path: '/pharmacy'
    }
  ];

  // Filter products by active tab type
  const tabProducts = products.filter(p => p.petType === activeTab).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0 z-0 bg-[#0F2E23]">
          {/* Base Image */}
          <img 
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1920" 
            alt="Pawora Luxury Pet Care" 
            className="w-full h-full object-cover filter brightness-[0.8] saturate-[1.1] contrast-[1.05]"
          />
          
          {/* Color Grading & Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-black/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-primary/80"></div>
          
          {/* Premium Light Leaks */}
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold/15 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>

        {/* Hero Copy overlay */}
        <ScrollReveal variant="blurIn" className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-6">
          <span className="text-xs font-semibold tracking-widest text-gold uppercase flex items-center justify-center gap-1.5 animate-pulse drop-shadow-md">
            <Sparkles size={14} className="text-gold" /> Pawora Premium Living
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight drop-shadow-lg">
            Better Care For Every <br />Kind Of Companion.
          </h1>
          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
            Thoughtfully chosen premium foods, medical-grade healthcare supplements, veterinary products, and elegant habitat accessories for the pets you love.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <button 
              onClick={() => navigate('/shop')}
              className="btn-premium"
            >
              SHOP COLLECTION
            </button>
            <button 
              onClick={() => navigate('/pet-care')}
              className="px-8 py-3.5 bg-black/20 backdrop-blur-md border border-white text-white font-medium text-sm tracking-widest hover:bg-white hover:text-primary transition duration-300 uppercase cursor-pointer rounded-sm"
            >
              EXPLORE PET CARE
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* 2. D2C TRUST FEATURES */}
      <ScrollReveal variant="slideUp">
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-[-30px] relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white rounded-2xl p-8 shadow-premium-soft">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary text-primary shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-primary mb-1">Veterinary Credibility</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Every medical product, food formula, and habitat item undergoes expert quality review for your safety.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary text-primary shrink-0">
                <HeartPulse size={24} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-primary mb-1">Health First Architecture</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Dedicated prescription workflow handles sensitive veterinary needs with strict legal care.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary text-primary shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-primary mb-1">Premium Quality Promise</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Free shipping above ₹999 across India. Hassle-free packaging ensuring fresh, stable feed delivery.</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 3. PET DEPARTMENTS / CATEGORIES SECTION */}
      <ScrollReveal variant="fade">
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-accent font-bold">DISCOVER DEPARTMENTS</span>
            <h2 className="text-2xl md:text-3xl">Shop By Companion Type</h2>
            <p className="text-xs text-gray-500 leading-relaxed">Explore customized health, diet, and enrichment categories for dogs, birds, reptiles, and aquatics.</p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categoriesList.map((cat, idx) => (
              <div 
                key={cat.title}
                onClick={() => navigate(cat.path)}
                className="card-premium group relative flex flex-col justify-between h-[360px] cursor-pointer bg-white"
              >
                <div className="relative h-2/3 overflow-hidden border-b border-beige">
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors"></div>
                </div>
                
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-semibold mb-1 text-primary group-hover:text-accent transition duration-300">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">
                      {cat.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:text-accent transition mt-3">
                    EXPLORE <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 4. SHOP BY PET (DYNAMIC TABS DISCOVERY) */}
      <ScrollReveal variant="slideUp">
        <section className="bg-sand border-y border-beige py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold">HEALTHY & ACTIVE LIFE</span>
                <h2 className="text-2xl md:text-3xl">Pet Parent Favourites</h2>
              </div>
              
              {/* Tab switchers */}
              <div className="flex flex-wrap gap-2 border-b border-beige pb-1 shrink-0">
                {['dogs', 'birds', 'reptiles', 'fish', 'pharmacy'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab 
                        ? 'text-primary border-b-2 border-primary font-bold' 
                        : 'text-gray-400 hover:text-primary'
                    }`}
                  >
                    {tab === 'fish' ? 'Fish & Aquatics' : tab}
                  </button>
                ))}
              </div>
            </div>
  
            {/* Dynamic grid container */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="bg-white border border-beige h-[380px] animate-pulse"></div>
                ))}
              </div>
            ) : tabProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {tabProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white border border-beige text-gray-500 text-xs">
                No products found for this tab department.
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* 5. BEST SELLERS CAROUSEL SECTION */}
      <ScrollReveal variant="slideUp">
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-accent font-bold">TRUSTED CHOICE</span>
            <h2 className="text-2xl md:text-3xl">Most Popular Essentials</h2>
            <p className="text-xs text-gray-500">Highest rated products chosen by thousands of veterinary professionals and pet parents.</p>
          </div>
  
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-white border border-beige h-[380px] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* 6. EDITORIAL LIFESTYLE BLOCK */}
      <ScrollReveal variant="fade">
        <section className="bg-gradient-premium text-sand py-24 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                PAWORA BRAND CONCEPT
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-secondary leading-tight">
                “Because they deserve <br />more than ordinary.”
              </h2>
              <p className="text-xs md:text-sm text-secondary-dark leading-relaxed font-light">
                At Pawora, we believe that pets are family members who deserve premium care, premium food, and rich habitats. We reject low-grade fillers, poor-quality cage materials, and ambiguous pharmacy solutions. Every single brand we carry, from Royal Canin to Exo Terra, is handpicked for nutritional stability and biological safety.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => navigate('/about')}
                  className="px-8 py-3.5 bg-gold text-primary font-bold text-xs tracking-widest hover:bg-gold-light transition duration-300 uppercase cursor-pointer rounded-sm shadow-md"
                >
                  OUR ANIMAL PRINCIPLES
                </button>
              </div>
            </div>
            
            {/* Editorial images right */}
            <div className="aspect-[4/3] bg-white/5 border border-white/10 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1666777247416-ee7a95235559?q=80&w=800" 
                alt="Premium pet life care" 
                className="w-full h-full object-cover filter brightness-[0.85]"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 7. LATEST SCIENTIFIC BLOGS HUB */}
      <ScrollReveal variant="slideUp">
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-accent font-bold">VETERINARY RESEARCH</span>
              <h2 className="text-2xl md:text-3xl">Expert Guides & Insights</h2>
            </div>
            <Link 
              to="/pet-care"
              className="text-xs font-bold text-primary hover:text-accent transition flex items-center gap-1 group pb-1"
            >
              VIEW ALL ARTICLES <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Complete Guide to Creating a Bearded Dragon Habitat',
                slug: 'bearded-dragon-habitat-guide',
                summary: 'Everything you need to know about terrarium sizes, UVB lighting, heat, and substrates to keep your bearded dragon healthy.',
                img: 'https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=800&auto=format&fit=crop',
                tag: 'REPTILES'
              },
              {
                title: 'Best Nutrition Practices for Dogs: Feed for Longevity',
                slug: 'best-nutrition-practices-dogs',
                summary: 'A vet-backed guide on protein ratios, wet vs dry food, feeding schedules, and identifying high-quality kibble ingredients.',
                img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600',
                tag: 'DOGS'
              },
              {
                title: 'Beginner’s Guide to Aquarium Care and Water Chemistry',
                slug: 'beginners-guide-aquarium-care',
                summary: 'Demystifying the Nitrogen Cycle, testing pH, and maintaining a thriving freshwater fish tank.',
                img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
                tag: 'FISH'
              }
            ].map((blog) => (
              <div 
                key={blog.slug}
                onClick={() => navigate(`/pet-care/${blog.slug}`)}
                className="card-premium group flex flex-col justify-between cursor-pointer h-full bg-white"
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden border-b border-beige bg-gray-50">
                    <img 
                      src={blog.img} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-accent tracking-widest uppercase block">
                      {blog.tag}
                    </span>
                    <h3 className="font-serif text-sm font-semibold text-primary leading-snug group-hover:text-accent transition duration-300">
                      {blog.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
                      {blog.summary}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 mt-auto">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:text-accent transition">
                    READ ARTICLE <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

    </div>
  );
};

export default Home;
