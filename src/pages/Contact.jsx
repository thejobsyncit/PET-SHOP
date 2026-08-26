import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, MapPin, Clock, Send, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been received! Our support team will respond within 24 hours.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 1200);
  };

  const contactFAQs = [
    { q: 'How long does prescription verification take?', a: 'Prescription verifications are processed by our licensed veterinary team within 2 hours of upload, between 9 AM and 6 PM. Orders containing Rx items are packaged immediately after approval.' },
    { q: 'What is your refund policy on medications?', a: 'To comply with pharmaceutical regulations and ensure clinical safety, we cannot accept returns, exchanges, or issue refunds for veterinary medicines or dietary supplements once dispatched.' },
    { q: 'Where is your physical flagship store located?', a: 'Our corporate office and retail space are located at 12, Luxury Retail Lane, MG Road, Bangalore, Karnataka. Visitors are welcome from 10 AM to 8 PM.' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Header */}
      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden border-b border-beige">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200" 
            alt="Contact Pawora Support" 
            className="w-full h-full object-cover filter brightness-[0.55]"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-4">
          <span className="text-[10px] tracking-widest font-bold text-accent uppercase flex items-center justify-center gap-1">
            <MessageSquare size={12} /> DISPATCH CARE & SUPPORT
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-secondary">Contact Pawora Care</h1>
          <p className="text-xs md:text-sm text-secondary-dark max-w-xl mx-auto leading-relaxed font-light">
            Have questions about prescriptions, custom habitats, or shipping logistics? Our support desk is ready.
          </p>
        </div>
      </section>

      {/* 2. Main Contact Panels grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Details & Map Pane (Left 5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-3">
              Reach Out Directly
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3 bg-white p-4 border border-beige">
                <Phone size={18} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary">Phone Support</h4>
                  <p className="text-gray-500 mt-0.5">+91 80 4012 3456</p>
                  <p className="text-[10px] text-gray-400">Monday - Saturday (9:00 AM - 6:00 PM)</p>
                </div>
              </div>
              <div className="flex gap-3 bg-white p-4 border border-beige">
                <Mail size={18} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary">Email Support</h4>
                  <p className="text-gray-500 mt-0.5">care@pawora.com</p>
                  <p className="text-[10px] text-gray-400">Response timeframe: Under 24 hours</p>
                </div>
              </div>
              <div className="flex gap-3 bg-white p-4 border border-beige">
                <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary">Flagship Retail Store</h4>
                  <p className="text-gray-500 mt-0.5">12, Luxury Retail Lane, MG Road, Bangalore, KA, India</p>
                </div>
              </div>
            </div>

            {/* Google Map Mock Up */}
            <div className="aspect-[4/3] bg-sand border border-beige flex flex-col justify-center items-center text-center p-6 space-y-3">
              <MapPin size={32} className="text-accent animate-bounce" />
              <h3 className="font-serif text-sm font-semibold text-primary">Bangalore Flagship Showroom</h3>
              <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
                Map data loading... Google Maps integrated API coordinates: 12.9716° N, 77.5946° E.
              </p>
            </div>
          </div>

          {/* MESSAGE FORM (Right 7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-beige p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-3">
              Send a Secure Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold block">Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Prescription issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold block">Message Body *</label>
                <textarea
                  rows={5}
                  placeholder="Type your message detail here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-premium py-3 text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={14} /> {submitting ? 'TRANSMITTING MESSAGE...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 3. QUICK FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 space-y-6 pt-10">
        <h3 className="font-serif text-lg text-primary text-center">Frequently Asked Questions</h3>
        <div className="space-y-3 bg-white border border-beige p-6 shadow-sm">
          {contactFAQs.map((faq, idx) => (
            <div key={idx} className="border-b border-beige last:border-b-0 pb-4 last:pb-0">
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full flex justify-between items-center text-left py-1 text-xs font-bold text-primary hover:text-accent transition cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown size={14} className={`transform transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
              </button>
              {faqOpen === idx && (
                <p className="text-xs text-gray-500 leading-relaxed pt-2">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Contact;
