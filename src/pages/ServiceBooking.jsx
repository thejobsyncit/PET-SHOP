import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Search, MapPin, Star, ShieldCheck, 
  ChevronRight, ArrowRight, Heart, Award,
  Scissors, Home, Footprints, Truck, GraduationCap, ShieldAlert, Stethoscope,
  CircleCheck, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/ScrollReveal.jsx';

const SERVICES = [
  {
    id: 'grooming',
    title: 'Pet Grooming',
    path: '/grooming',
    icon: <Scissors size={28} className="text-pink-600" />,
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    hover: 'hover:border-pink-400',
    shadow: 'hover:shadow-pink-900/10',
    desc: 'Professional spa, styling, and hygiene care for your pets.',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'hostel',
    title: 'Pet Hostel',
    path: '/hostel',
    icon: <Home size={28} className="text-blue-600" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:border-blue-400',
    shadow: 'hover:shadow-blue-900/10',
    desc: 'Safe, comfortable boarding and daycare when you are away.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'walking',
    title: 'Dog Walking',
    path: '/walking',
    icon: <Footprints size={28} className="text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hover: 'hover:border-amber-400',
    shadow: 'hover:shadow-amber-900/10',
    desc: 'Daily walks to boost your dogs health, behavior, and happiness.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'transport',
    title: 'Pet Transport',
    path: '/transport',
    icon: <Truck size={28} className="text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hover: 'hover:border-emerald-400',
    shadow: 'hover:shadow-emerald-900/10',
    desc: 'Reliable and AC cabs for local vet visits or intercity relocation.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'training',
    title: 'Pet Training',
    path: '/training',
    icon: <GraduationCap size={28} className="text-indigo-600" />,
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    hover: 'hover:border-indigo-400',
    shadow: 'hover:shadow-indigo-900/10',
    desc: 'Expert behavioral training and obedience classes.',
    image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'insurance',
    title: 'Pet Insurance',
    path: '/services?category=Insurance',
    icon: <ShieldAlert size={28} className="text-red-600" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    hover: 'hover:border-red-400',
    shadow: 'hover:shadow-red-900/10',
    desc: 'Comprehensive health coverage and emergency medical plans.',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'vet',
    title: 'Consult a Vet',
    path: '/veterinary',
    icon: <Stethoscope size={28} className="text-teal-600" />,
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    hover: 'hover:border-teal-400',
    shadow: 'hover:shadow-teal-900/10',
    desc: 'Online consultations and clinic bookings with top veterinarians.',
    image: 'https://images.unsplash.com/photo-1629909613654-20e3650275cc?q=80&w=800&auto=format&fit=crop'
  }
];

const TOP_PROVIDERS = [
  { id: 1, name: 'Dr. Ramesh Kumar', category: 'Veterinary', rating: 4.9, reviews: 120, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop' },
  { id: 2, name: 'Velvet Fur Spa', category: 'Grooming', rating: 5.0, reviews: 75, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1544568100-eba616a6ce76?q=80&w=800&auto=format&fit=crop' },
  { id: 3, name: 'Pawsome Walkers', category: 'Dog Walking', rating: 4.8, reviews: 115, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop' },
  { id: 4, name: 'Happy Paws Resort', category: 'Hostel', rating: 4.9, reviews: 145, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop' }
];

import ServiceAccessLock, { isServicePathLockedForUser } from '../components/ServiceAccessLock.jsx';

const ServiceBooking = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (isServicePathLockedForUser(user, '/services')) {
    return <ServiceAccessLock serviceName="Pet Services Hub" attemptedPath="/services" />;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProviderClick = (category) => {
    if (category === 'Grooming') navigate('/grooming');
    else if (category === 'Dog Walking') navigate('/walking');
    else if (category === 'Hostel') navigate('/hostel');
    else if (category === 'Veterinary') navigate('/veterinary');
    else navigate('/veterinary');
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 pb-24">
      
      {/* 1. HERO BANNER - Premium Glassmorphism & Floating Elements */}
      <ScrollReveal variant="fade" className="relative overflow-hidden bg-gradient-to-br from-[#0f2e23] via-[#1c4b3a] to-[#0a1f18] text-white pt-8 pb-20 px-4 md:px-8 shadow-2xl">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#fde047] rounded-full mix-blend-overlay filter blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981] rounded-full mix-blend-overlay filter blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-white/70 mb-8 font-medium bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-[#fde047]">Pet Services</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm text-[#fde047] font-bold tracking-wide"
              >
                <Sparkles size={16} /> Premium Care, Delivered.
              </motion.span>

              <h1 className="text-5xl md:text-7xl font-black text-white font-sans tracking-tight leading-[1.1] drop-shadow-lg">
                Pet Services at <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fde047] to-[#f59e0b]">
                  Your Doorstep
                </span>
              </h1>

              <p className="text-base md:text-lg text-white/80 font-medium max-w-xl leading-relaxed">
                Connect with verified, top-rated professionals for grooming, walking, training, and healthcare. India's #1 trusted network for pet parents.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">
                  <ShieldCheck size={18} className="text-[#10b981]" />
                  <span className="text-xs sm:text-sm font-bold text-white/90">100% Verified</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">
                  <Heart size={18} className="text-pink-400" />
                  <span className="text-xs sm:text-sm font-bold text-white/90">10K+ Happy Pets</span>
                </div>
              </div>

              {/* Glassmorphism Quick Search */}
              <div className="pt-8">
                <div className="bg-white/10 backdrop-blur-xl p-3 rounded-3xl shadow-2xl flex flex-col sm:flex-row gap-3 max-w-2xl border border-white/20 ring-1 ring-white/10">
                  <div className="flex-1 relative">
                    <label className="absolute -top-3 left-4 bg-[#1c4b3a] px-2 text-[10px] font-black text-[#fde047] uppercase tracking-widest rounded-md z-10 shadow-sm border border-white/10">Select Service</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#fde047]/50 appearance-none cursor-pointer backdrop-blur-md transition-all"
                    >
                      <option value="All" className="text-slate-800">All Pet Services</option>
                      <option value="Grooming" className="text-slate-800">Pet Grooming Spa</option>
                      <option value="Hostel" className="text-slate-800">Pet Hostel & Boarding</option>
                      <option value="Dog Walking" className="text-slate-800">Dog Walking</option>
                      <option value="Transport" className="text-slate-800">Pet Transport Cab</option>
                      <option value="Training" className="text-slate-800">Behavioral Training</option>
                      <option value="Insurance" className="text-slate-800">Health Insurance</option>
                      <option value="Veterinary" className="text-slate-800">Consult a Vet</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs font-bold">
                      ▼
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('services-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-gradient-to-r from-[#fde047] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] text-[#0f2e23] font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap cursor-pointer active:scale-95 flex items-center justify-center gap-2 border border-amber-300/50"
                  >
                    <Search size={18} /> FIND PROS
                  </button>
                </div>
              </div>
            </div>

            {/* Right Illustration - Floating Animation */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end mt-10 lg:mt-0">
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full max-w-md aspect-square"
              >
                {/* Decorative background ring */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#fde047]/20 to-transparent rounded-full blur-3xl transform scale-110"></div>
                
                <img
                  src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop"
                  alt="Happy Dog with Professional"
                  className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl border border-white/20 ring-4 ring-white/5 z-10"
                />
                
                {/* Floating Rating Badge */}
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4 z-20"
                >
                  <div className="bg-gradient-to-br from-[#fde047] to-[#f59e0b] p-3 rounded-full shadow-inner">
                    <Star fill="currentColor" size={24} className="text-amber-900" />
                  </div>
                  <div>
                    <span className="text-xs text-white/70 font-bold uppercase tracking-widest block mb-0.5">Top Rated</span>
                    <span className="text-2xl font-black text-white">4.9/5.0</span>
                  </div>
                </motion.div>
                
                {/* Floating Verification Badge */}
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 z-20"
                >
                  <div className="bg-gradient-to-br from-[#10b981] to-[#059669] p-2 rounded-full shadow-inner">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-white pr-2">Certified Pros</span>
                </motion.div>
                
              </motion.div>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* 2. SERVICES GRID */}
      <section id="services-grid" className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-16 -mt-8 relative z-10 scroll-mt-20">
        <ScrollReveal variant="slideUp" delay={0.1}>
          <div className="text-center space-y-4 mb-14">
            <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-[#1c4b3a] bg-[#1c4b3a]/10 px-4 py-1.5 rounded-full border border-[#1c4b3a]/20 shadow-sm">
              OUR EXPERTISE
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 font-sans tracking-tight">
              Explore Pet Services
            </h2>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto font-medium">
              From daily walks to luxurious spa days, find everything your pet needs under one roof.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {SERVICES.map((service, index) => (
            <ScrollReveal key={service.id} variant="slideUp" delay={0.1 + (index * 0.05)}>
              <Link
                to={service.path}
                className={`group relative bg-white rounded-[2rem] border ${service.border} ${service.hover} p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden`}
              >
                {/* Decorative background shape */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 ${service.bg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>

                <div className={`relative ${service.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${service.border} group-hover:rotate-6 transition-transform duration-300 shadow-inner z-10`}>
                  {service.icon}
                </div>
                <h3 className="relative text-xl md:text-2xl font-black text-slate-900 mb-3 z-10">{service.title}</h3>
                <p className="relative text-sm text-slate-500 font-medium leading-relaxed flex-1 z-10">
                  {service.desc}
                </p>
                <div className="relative mt-6 pt-6 border-t border-slate-100 flex items-center text-[#1c4b3a] font-bold text-sm group-hover:text-amber-600 transition-colors z-10">
                  <span>Explore {service.title}</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
          
          {/* Become a Partner Card */}
          <ScrollReveal variant="slideUp" delay={0.5}>
            <Link
              to="/provider-dashboard"
              className="group relative bg-gradient-to-br from-slate-900 to-[#0f2e23] rounded-[2rem] border border-slate-700/50 p-6 md:p-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-center items-center text-center text-white h-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0"></div>
              
              <div className="relative bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-white/20 backdrop-blur-md group-hover:scale-110 transition-transform duration-500 shadow-xl z-10">
                <Award size={36} className="text-[#fde047]" />
              </div>
              <h3 className="relative text-2xl font-black mb-3 z-10 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Become a Partner</h3>
              <p className="relative text-sm text-white/70 font-medium leading-relaxed mb-8 z-10">
                Are you a pet professional? Join our network and grow your business today.
              </p>
              <div className="relative mt-auto w-full bg-gradient-to-r from-[#fde047] to-[#f59e0b] text-[#0f2e23] font-black py-4 rounded-xl text-sm group-hover:shadow-[0_0_20px_rgba(253,224,71,0.4)] transition-all shadow-md z-10">
                Register Now
              </div>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. FEATURED PROVIDERS */}
      <section className="bg-white py-10 lg:py-20 border-y border-slate-100">
        <ScrollReveal variant="slideUp" delay={0.2} className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
                TOP RATED
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Featured Professionals
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Book with confidence. Handpicked experts loved by pet parents.
              </p>
            </div>
            <Link to="/services" className="text-sm font-black text-[#1c4b3a] bg-[#1c4b3a]/5 hover:bg-[#1c4b3a]/10 px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
              View All Providers <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {TOP_PROVIDERS.map((provider, index) => (
              <ScrollReveal key={provider.id} variant="slideUp" delay={0.1 + (index * 0.1)}>
                <div 
                  className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                  onClick={() => handleProviderClick(provider.category)}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                    <img 
                      src={provider.image} 
                      alt={provider.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[10px] font-black px-3 py-1.5 rounded-md shadow-sm text-slate-800 z-20 tracking-wider uppercase">
                      {provider.category}
                    </div>
                  </div>
                  <div className="p-5 md:p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <h3 className="font-black text-xl text-slate-900 line-clamp-1">{provider.name}</h3>
                    <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                        <Star size={14} fill="currentColor" />
                        <span>{provider.rating} <span className="text-amber-700/50">({provider.reviews})</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                        <MapPin size={12} />
                        <span>{provider.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-20 relative">
        <ScrollReveal variant="slideUp">
          <div className="text-center space-y-4 mb-14">
            <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-[#1c4b3a] bg-[#1c4b3a]/10 px-4 py-1.5 rounded-full border border-[#1c4b3a]/20 shadow-sm">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Trust the Pet Hub Standard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                title: "Verified & Vetted",
                desc: "Every professional undergoes a strict 5-step verification process before joining our platform.",
                icon: <ShieldCheck size={36} className="text-emerald-500" />,
                bg: "bg-emerald-50",
                border: "border-emerald-200"
              },
              {
                title: "Secure Booking",
                desc: "Book instantly online. Your payments are held securely until the service is successfully completed.",
                icon: <CircleCheck size={36} className="text-blue-500" />,
                bg: "bg-blue-50",
                border: "border-blue-200"
              },
              {
                title: "24/7 Support",
                desc: "Our dedicated support team is available around the clock to assist you with any queries or emergencies.",
                icon: <Heart size={36} className="text-pink-500" />,
                bg: "bg-pink-50",
                border: "border-pink-200"
              }
            ].map((feature, idx) => (
              <ScrollReveal key={idx} variant="zoomIn" delay={0.2 + (idx * 0.1)}>
                <div className="group bg-white p-8 md:p-4 lg:p-10 rounded-[2rem] border border-slate-100 text-center space-y-5 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                  <div className={`w-20 h-20 mx-auto ${feature.bg} rounded-2xl flex items-center justify-center border ${feature.border} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{feature.title}</h3>
                  <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed flex-1">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 mb-16 relative">
        <ScrollReveal variant="blurIn" delay={0.3}>
          <div className="relative overflow-hidden bg-gradient-to-r from-[#fde047] to-[#f59e0b] rounded-[2.5rem] p-8 md:p-14 shadow-2xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-10 text-[#0f2e23]">
            {/* Background design elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-5 text-center md:text-left relative z-10 flex-1">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">Ready to pamper your pet?</h2>
              <p className="font-bold text-[#0f2e23]/80 text-base md:text-lg max-w-xl">
                Sign up today and get <span className="text-white bg-red-500 px-2 py-0.5 rounded-md shadow-sm transform -rotate-2 inline-block">20% OFF</span> on your first service booking with code <span className="bg-white px-3 py-1 rounded-lg text-amber-600 font-black border border-amber-200 shadow-sm font-mono tracking-wider ml-1">WELCOME20</span>
              </p>
            </div>
            <button 
              onClick={() => !isAuthenticated && window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user' } }))}
              className="relative z-10 shrink-0 bg-[#0f2e23] hover:bg-black text-white font-black py-4 px-4 lg:px-10 rounded-[1.25rem] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-lg flex items-center gap-2 border border-[#1c4b3a]"
            >
              {isAuthenticated ? 'Explore Services' : 'Sign Up Now'}
              <Sparkles size={20} className="text-[#fde047]" />
            </button>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
};

export default ServiceBooking;
