import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Search, MapPin, Star, ShieldCheck, 
  ChevronRight, ArrowRight, Heart, Award,
  Scissors, Home, Footprints, Truck, GraduationCap, ShieldAlert, Stethoscope,
  CircleCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800'
  }
];

const TOP_PROVIDERS = [
  { id: 1, name: 'Dr. Ramesh Kumar', category: 'Veterinary', rating: 4.9, reviews: 120, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800' },
  { id: 2, name: 'Velvet Fur Spa', category: 'Grooming', rating: 5.0, reviews: 75, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800' },
  { id: 3, name: 'Pawsome Walkers', category: 'Dog Walking', rating: 4.8, reviews: 115, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800' },
  { id: 4, name: 'Happy Paws Resort', category: 'Hostel', rating: 4.9, reviews: 145, location: 'Bangalore', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800' }
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
      
      {/* 1. HERO BANNER */}
      <section className="relative bg-gradient-to-r from-[#173d2f] via-[#1c4b3a] to-[#25634d] text-white pt-8 pb-16 px-4 md:px-8 shadow-sm border-b border-[#0f2e23]">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-white/70 mb-6 font-medium">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-white">Pet Services Hub</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <span className="italic font-serif text-lg md:text-xl text-[#fde047] font-semibold tracking-wide block">
                Premium Care, Delivered.
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white font-sans tracking-tight leading-tight drop-shadow-sm">
                Pet Services at <br /> Your Doorstep
              </h1>

              <p className="text-sm md:text-base text-white/90 font-medium max-w-xl leading-relaxed">
                Connect with verified, top-rated professionals for grooming, walking, training, and healthcare. India's #1 trusted network for pet parents.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                  <ShieldCheck size={16} className="text-[#fde047]" />
                  <span className="text-xs font-bold">100% Verified Providers</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                  <Heart size={16} className="text-pink-400" />
                  <span className="text-xs font-bold">10K+ Happy Pets</span>
                </div>
              </div>

              {/* Quick Search with Select */}
              <div className="pt-6">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 max-w-2xl border border-white/20">
                  <div className="flex-1 relative">
                    <label className="absolute -top-2.5 left-4 bg-white px-1 text-[10px] font-extrabold text-[#1c4b3a] uppercase tracking-wider rounded z-10">Select Service</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c4b3a]/20 appearance-none cursor-pointer"
                    >
                      <option value="All">All Pet Services</option>
                      <option value="Grooming">Pet Grooming Spa</option>
                      <option value="Hostel">Pet Hostel & Boarding</option>
                      <option value="Dog Walking">Dog Walking</option>
                      <option value="Transport">Pet Transport Cab</option>
                      <option value="Training">Behavioral Training</option>
                      <option value="Insurance">Health Insurance</option>
                      <option value="Veterinary">Consult a Vet</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs font-bold">
                      ▼
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('services-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#1c4b3a] hover:bg-[#15382b] text-white font-extrabold px-8 py-3.5 rounded-xl text-sm transition shadow-md whitespace-nowrap cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Search size={16} /> Find Services
                  </button>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square max-h-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800"
                  alt="Happy Dog with Professional"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/10"
                />
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="bg-[#fde047] p-2 rounded-full">
                    <Star fill="currentColor" size={20} className="text-amber-700" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Average Rating</span>
                    <span className="text-lg font-extrabold text-slate-900">4.9/5.0</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SERVICES GRID */}
      <section id="services-grid" className="max-w-7xl mx-auto px-4 md:px-8 py-16 -mt-8 relative z-10 scroll-mt-20">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#1c4b3a] bg-[#1c4b3a]/10 px-3 py-1 rounded-full border border-[#1c4b3a]/20">
            OUR EXPERTISE
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-sans">
            Explore Pet Services
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            From daily walks to luxurious spa days, find everything your pet needs under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              to={service.path}
              className={`group bg-white rounded-3xl border ${service.border} ${service.hover} p-6 shadow-sm ${service.shadow} transition-all duration-300 hover:-translate-y-1 flex flex-col`}
            >
              <div className={`${service.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border ${service.border} group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
                {service.desc}
              </p>
              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center text-[#1c4b3a] font-bold text-sm group-hover:text-amber-600 transition-colors">
                <span>Explore {service.title}</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
          
          {/* Become a Partner Card */}
          <Link
            to="/provider-dashboard"
            className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center items-center text-center text-white"
          >
            <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border border-white/20">
              <Award size={32} className="text-[#fde047]" />
            </div>
            <h3 className="text-xl font-extrabold mb-2">Become a Partner</h3>
            <p className="text-sm text-white/70 font-medium leading-relaxed">
              Are you a pet professional? Join our network and grow your business today.
            </p>
            <div className="mt-5 w-full bg-white text-slate-900 font-extrabold py-3 rounded-xl text-sm group-hover:bg-[#fde047] transition-colors shadow-md">
              Register Now
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED PROVIDERS */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Top Rated Professionals
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Book with confidence. Handpicked experts loved by pet parents.
              </p>
            </div>
            <Link to="/services" className="text-sm font-bold text-[#1c4b3a] hover:text-amber-600 flex items-center gap-1 transition">
              View All Providers <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOP_PROVIDERS.map((provider) => (
              <div 
                key={provider.id} 
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group cursor-pointer hover:shadow-xl hover:border-[#1c4b3a]/30 transition-all duration-300"
                onClick={() => handleProviderClick(provider.category)}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={provider.image} 
                    alt={provider.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm text-slate-800">
                    {provider.category}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-lg text-slate-900 truncate">{provider.name}</h3>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span>{provider.rating} <span className="text-slate-400 font-normal">({provider.reviews})</span></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin size={12} />
                      <span>{provider.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Why Trust Pet Hub Services?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Verified & Background Checked",
              desc: "Every professional undergoes a strict 5-step verification process before joining our platform.",
              icon: <ShieldCheck size={32} className="text-emerald-500" />
            },
            {
              title: "Secure Payments & Booking",
              desc: "Book instantly online. Your payments are held securely until the service is successfully completed.",
              icon: <CircleCheck size={32} className="text-blue-500" />
            },
            {
              title: "24/7 Pet Parent Support",
              desc: "Our dedicated support team is available around the clock to assist you with any queries or emergencies.",
              icon: <Heart size={32} className="text-pink-500" />
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mb-8">
        <div className="bg-[#fde047] rounded-3xl p-8 md:p-12 shadow-xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-900">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">Ready to pamper your pet?</h2>
            <p className="font-medium text-amber-900/80 text-sm md:text-base max-w-md">
              Sign up today and get <strong>20% OFF</strong> on your first service booking with code <span className="bg-white px-2 py-0.5 rounded text-amber-700 font-bold border border-amber-200 shadow-sm">WELCOME20</span>
            </p>
          </div>
          <button 
            onClick={() => !isAuthenticated && window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user' } }))}
            className="shrink-0 bg-slate-900 hover:bg-black text-white font-extrabold py-4 px-8 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            {isAuthenticated ? 'Explore Services' : 'Sign Up Now'}
          </button>
        </div>
      </section>

    </div>
  );
};

export default ServiceBooking;
