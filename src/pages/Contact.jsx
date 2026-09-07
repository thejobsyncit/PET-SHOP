import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, MapPin, Clock, Send, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiRequest } from '../services/api.js';
import ScrollReveal from '../components/ScrollReveal.jsx';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await apiRequest('/enquiries', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, message })
      });
      if (data.success) {
        toast.success('Your message has been received! Our support team will respond within 24 hours.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactFAQs = [
    { q: 'How long does prescription verification take?', a: 'Prescription verifications are processed by our licensed veterinary team within 2 hours of upload, between 9 AM and 6 PM. Orders containing Rx items are packaged immediately after approval.' },
    { q: 'What is your refund policy on medications?', a: 'To comply with pharmaceutical regulations and ensure clinical safety, we cannot accept returns, exchanges, or issue refunds for veterinary medicines or dietary supplements once dispatched.' },
    { q: 'Where is your physical flagship store located?', a: 'Our corporate office and retail space are located at 12, Luxury Retail Lane, MG Road, Bangalore, Karnataka. Visitors are welcome from 10 AM to 8 PM.' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Header - Premium Glassmorphism & Floating Animations */}
      <ScrollReveal variant="fade" className="relative overflow-hidden bg-gradient-to-br from-[#0f2e23] via-[#1c4b3a] to-[#0a1f18] text-white pt-12 pb-24 px-4 md:px-8 shadow-2xl">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#fde047] rounded-full mix-blend-overlay filter blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981] rounded-full mix-blend-overlay filter blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm text-[#fde047] font-bold tracking-widest uppercase"
          >
            <MessageSquare size={16} /> DISPATCH CARE & SUPPORT
          </motion.span>
          
          <h1 className="font-sans font-black text-4xl md:text-6xl text-white tracking-tight leading-[1.1] drop-shadow-lg">
            Contact Pawora <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fde047] to-[#f59e0b]">
              Care Team
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Have questions about prescriptions, custom habitats, or shipping logistics? Our support desk is ready.
          </p>
        </div>
      </ScrollReveal>

      {/* 2. Main Contact Panels grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Details & Map Pane (Left 5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal variant="slideRight" delay={0.1}>
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-100 space-y-8">
                <div>
                  <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                    Reach Out Directly
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-2">Get in touch with us via phone, email, or visit our flagship store.</p>
                </div>

                <div className="space-y-4">
                  <div className="group flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                    <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <Phone size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">Phone Support</h4>
                      <p className="text-sm text-slate-600 font-bold mt-1">+91 80 4012 3456</p>
                      <p className="text-xs text-slate-400 mt-1">Mon - Sat (9:00 AM - 6:00 PM)</p>
                    </div>
                  </div>

                  <div className="group flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                    <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                      <Mail size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">Email Support</h4>
                      <p className="text-sm text-emerald-600 font-bold mt-1">care@pawora.com</p>
                      <p className="text-xs text-slate-400 mt-1">Response timeframe: Under 24 hours</p>
                    </div>
                  </div>

                  <div className="group flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                    <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <MapPin size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">Flagship Showroom</h4>
                      <p className="text-sm text-slate-600 font-bold mt-1 leading-relaxed">12, Luxury Retail Lane, MG Road, Bangalore, KA, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Premium Map Mock Up */}
            <ScrollReveal variant="slideUp" delay={0.2}>
              <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-slate-100 overflow-hidden relative group">
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden relative flex flex-col justify-center items-center text-center">
                  <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}></div>
                  <div className="relative z-10 space-y-4 p-6 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-full shadow-lg">
                      <MapPin size={28} className="text-blue-600 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">Bangalore Flagship Showroom</h3>
                      <p className="text-xs text-slate-500 font-medium max-w-xs mt-2 leading-relaxed">
                        Map data loading... Coordinates: 12.9716° N, 77.5946° E.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* MESSAGE FORM (Right 7 Columns) */}
          <div className="lg:col-span-7">
            <ScrollReveal variant="slideLeft" delay={0.3}>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-2xl space-y-8">
                <div>
                  <h2 className="font-sans text-3xl font-black text-slate-900 tracking-tight">
                    Send a Secure Message
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-2">Fill out the form below and we'll get back to you shortly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest block pl-1">Your Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1c4b3a]/20 focus:bg-white transition-all"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest block pl-1">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1c4b3a]/20 focus:bg-white transition-all"
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest block pl-1">Subject *</label>
                    <input
                      type="text"
                      placeholder="e.g. Prescription issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1c4b3a]/20 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest block pl-1">Message Body *</label>
                    <textarea
                      rows={6}
                      placeholder="Type your detailed message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1c4b3a]/20 focus:bg-white transition-all resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#fde047] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] text-[#0f2e23] font-black py-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 border border-amber-300/50"
                  >
                    <Send size={18} /> {submitting ? 'TRANSMITTING MESSAGE...' : 'SEND SECURE MESSAGE'}
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 3. QUICK FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 space-y-8 pt-10">
        <ScrollReveal variant="slideUp">
          <div className="text-center space-y-3">
            <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-[#1c4b3a] bg-[#1c4b3a]/10 px-4 py-1.5 rounded-full border border-[#1c4b3a]/20 shadow-sm">
              SUPPORT
            </span>
            <h3 className="font-sans text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4 mt-10">
            {contactFAQs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:border-[#1c4b3a]/30 hover:shadow-md">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left p-5 md:p-6 text-sm font-black text-slate-900 hover:text-[#1c4b3a] transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${faqOpen === idx ? 'bg-[#1c4b3a] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <ChevronDown size={16} className={`transform transition-transform duration-300 ${faqOpen === idx ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <div 
                  className={`px-5 md:px-6 transition-all duration-300 ease-in-out ${faqOpen === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  <p className="text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
};

export default Contact;
