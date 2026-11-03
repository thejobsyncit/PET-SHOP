import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mail, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = ({ compact = false }) => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing to the Josh Pets Hub Newsletter!');
      setEmail('');
    }
  };

  if (compact) {
    return (
      <footer className="bg-primary text-secondary border-t border-white/10 py-5 px-4 sm:px-6 lg:px-8 mt-auto z-10 shrink-0">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Top Row: Brand & Contacts | Shop | Company | Newsletter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 items-center">
            
            {/* Brand & Contacts */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex items-center gap-2">
                <Link to="/" className="font-serif text-lg tracking-widest text-accent font-bold hover:text-white transition">
                  JOSH PETS HUB
                </Link>
                <span className="text-[9px] uppercase tracking-wider text-emerald-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-semibold">
                  Partner Console
                </span>
              </div>
              <p className="text-[11px] text-secondary-dark line-clamp-1 font-light">
                Veterinary-grade pet care, nutrition & luxury habitats.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-secondary-dark pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Mail size={12} className="text-accent shrink-0" />
                  <span>care@joshpetshub.com</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-accent shrink-0" />
                  <span>Mon - Sat: 09:00 - 18:00</span>
                </div>
              </div>
            </div>

            {/* Shop Categories */}
            <div className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-1">SHOP</h4>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-secondary-dark font-medium">
                <Link to="/shop?petType=dogs" className="hover:text-white transition">Dogs</Link>
                <Link to="/shop?petType=birds" className="hover:text-white transition">Birds</Link>
                <Link to="/shop?petType=reptiles" className="hover:text-white transition">Reptiles</Link>
                <Link to="/shop?petType=fish" className="hover:text-white transition">Fish</Link>
              </div>
            </div>

            {/* Company Links */}
            <div className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-1">COMPANY</h4>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-secondary-dark font-medium">
                <Link to="/about" className="hover:text-white transition">About Us</Link>
                <Link to="/pet-care" className="hover:text-white transition">Pet Care</Link>
                <Link to="/contact" className="hover:text-white transition">Contact</Link>
              </div>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-4 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold">NEWSLETTER</h4>
                <span className="text-[10px] text-secondary-dark font-light hidden sm:inline">Exclusive releases & updates</span>
              </div>
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 py-1.5 pl-3 pr-8 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-accent rounded-lg"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-accent hover:text-white transition cursor-pointer"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Row: Legal & Copyright */}
          <div className="border-t border-white/5 pt-2.5 flex flex-col md:flex-row justify-between items-center text-[10px] text-secondary-dark tracking-wider gap-2">
            <div>
              © {new Date().getFullYear()} JOSH PETS HUB. All Rights Reserved. Crafted with care.
            </div>
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <Link to="/about" className="hover:text-white transition">PRIVACY POLICY</Link>
              <Link to="/about" className="hover:text-white transition">TERMS & CONDITIONS</Link>
              <Link to="/about" className="hover:text-white transition">SHIPPING POLICY</Link>
              <Link to="/about" className="hover:text-white transition">REFUND POLICY</Link>
              <button 
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    if (typeof window.openCookieSettings === 'function') {
                      window.openCookieSettings();
                    }
                    window.dispatchEvent(new CustomEvent('open-cookie-settings'));
                  }
                }}
                className="hover:text-[#fde047] transition uppercase cursor-pointer font-semibold"
              >
                COOKIE SETTINGS
              </button>
            </div>
          </div>

        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-primary text-secondary border-t border-white/5 pt-16 pb-8 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="font-serif text-2xl tracking-widest text-accent font-bold">
            JOSH PETS HUB
          </Link>
          <p className="text-xs text-secondary-dark leading-relaxed max-w-sm">
            Fictional premium pet care and lifestyle brand. Dedicated to providing veterinary-grade care products, organic foods, and luxury habitats for every kind of companion.
          </p>
          <div className="space-y-2 pt-2 text-xs text-secondary-dark">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-accent" />
              <span>care@joshpetshub.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-accent" />
              <span>Monday - Saturday: 09:00 - 18:00</span>
            </div>
          </div>
        </div>

        {/* Column 1: Shop */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-accent font-bold">SHOP</h3>
          <ul className="space-y-2.5 text-xs text-secondary-dark font-medium">
            <li><Link to="/shop?petType=dogs" className="hover:text-white transition duration-200">Dogs</Link></li>
            <li><Link to="/shop?petType=birds" className="hover:text-white transition duration-200">Birds</Link></li>
            <li><Link to="/shop?petType=reptiles" className="hover:text-white transition duration-200">Reptiles</Link></li>
            <li><Link to="/shop?petType=fish" className="hover:text-white transition duration-200">Fish & Aquatics</Link></li>
          </ul>
        </div>

        {/* Column 2: Company */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-accent font-bold">COMPANY</h3>
          <ul className="space-y-2.5 text-xs text-secondary-dark font-medium">
            <li><Link to="/about" className="hover:text-white transition duration-200">About Us</Link></li>
            <li><Link to="/pet-care" className="hover:text-white transition duration-200">Pet Care Hub</Link></li>
            <li><Link to="/contact" className="hover:text-white transition duration-200">Contact Us</Link></li>
            <li><span className="text-white/40 cursor-not-allowed">Careers (Soon)</span></li>
          </ul>
        </div>

        {/* Column 3: Newsletter */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-accent font-bold">NEWSLETTER</h3>
          <p className="text-xs text-secondary-dark leading-relaxed">
            Get expert pet-care tips, nutritional advice, and exclusive product releases.
          </p>
          <form onSubmit={handleSubscribe} className="relative">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 py-2.5 pl-3 pr-10 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-accent"
              required
            />
            <button
              type="submit"
              aria-label="Subscribe to newsletter"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-white transition cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>

      {/* Footer Bottom copyright and legal */}
      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-secondary-dark tracking-wider space-y-4 md:space-y-0">
        <div>
          © {new Date().getFullYear()} JOSH PETS HUB. All Rights Reserved. Crafted with care.
        </div>
        <div className="flex flex-wrap items-center gap-4 font-semibold">
          <Link to="/about" className="hover:text-white transition">PRIVACY POLICY</Link>
          <Link to="/about" className="hover:text-white transition">TERMS & CONDITIONS</Link>
          <Link to="/about" className="hover:text-white transition">SHIPPING POLICY</Link>
          <Link to="/about" className="hover:text-white transition">REFUND POLICY</Link>
          <button 
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (typeof window.openCookieSettings === 'function') {
                  window.openCookieSettings();
                }
                window.dispatchEvent(new CustomEvent('open-cookie-settings'));
              }
            }}
            className="hover:text-[#fde047] transition uppercase cursor-pointer text-left font-semibold"
          >
            COOKIE SETTINGS
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
