import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing to the Pawora Newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-primary text-secondary border-t border-white/5 pt-16 pb-8 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="font-serif text-2xl tracking-widest text-accent font-bold">
            JOSH PET HUB
          </Link>
          <p className="text-xs text-secondary-dark leading-relaxed max-w-sm">
            Fictional premium pet care and lifestyle brand. Dedicated to providing veterinary-grade care products, organic foods, and luxury habitats for every kind of companion.
          </p>
          <div className="space-y-2 pt-2 text-xs text-secondary-dark">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-accent" />
              <span>+91 80 4012 3456 (9 AM - 6 PM IST)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-accent" />
              <span>care@pawora.com</span>
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
            <li><Link to="/pharmacy" className="hover:text-white transition duration-200">Pharmacy & Health</Link></li>
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
              placeholder="ENTER EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 py-2.5 pl-3 pr-10 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-accent"
              required
            />
            <button 
              type="submit" 
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-white transition cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>

          {/* Social / WhatsApp Trigger */}
          <div className="pt-2">
            <a 
              href="https://wa.me/918040123456" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1ebd59] text-white text-[11px] font-bold tracking-wider rounded-none transition duration-300"
            >
              <MessageSquare size={14} /> WHATSAPP CHAT SUPPORT
            </a>
          </div>
        </div>

      </div>

      {/* Footer Bottom copyright and legal */}
      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-secondary-dark tracking-wider space-y-4 md:space-y-0">
        <div>
          © {new Date().getFullYear()} JOSH PET HUB. All Rights Reserved. Crafted with care.
        </div>
        <div className="flex flex-wrap gap-4 font-semibold">
          <Link to="/about" className="hover:text-white transition">PRIVACY POLICY</Link>
          <Link to="/about" className="hover:text-white transition">TERMS & CONDITIONS</Link>
          <Link to="/about" className="hover:text-white transition">SHIPPING POLICY</Link>
          <Link to="/about" className="hover:text-white transition">REFUND POLICY</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
