import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Block */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden border-b border-beige">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200" 
            alt="About Pawora Brand" 
            className="w-full h-full object-cover filter brightness-[0.55]"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-4">
          <span className="text-[10px] tracking-widest font-bold text-accent uppercase flex items-center justify-center gap-1.5 animate-pulse">
            <Sparkles size={12} /> THE PAWORA MANIFESTO
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-secondary">Our Animal Philosophy</h1>
          <p className="text-xs md:text-sm text-secondary-dark max-w-xl mx-auto leading-relaxed font-light">
            Crafting luxury, veterinary-grade lifestyles for the companions who enrich our lives daily.
          </p>
        </div>
      </section>

      {/* 2. Brand Core Text */}
      <section className="max-w-4xl mx-auto px-6 space-y-6 text-xs text-gray-600 leading-relaxed text-center">
        <h2 className="font-serif text-xl md:text-2xl text-primary font-medium">“Everything They Need. Everything They Love.”</h2>
        <p className="max-w-2xl mx-auto font-light">
          Founded in 2026, **PAWORA** arose from a simple realization: modern pet supply stores treat animal husbandry like a secondary commodity. Cheap grains, toxic cage wires, lack of lighting regulation, and confusing medical channels put the health of our companions at risk.
        </p>
        <p className="max-w-2xl mx-auto font-light">
          We designed Pawora as an international-standard pet lifestyle brand. Combining expert veterinary medicine research, high-quality organic ingredients sourcing, and luxury D2C design aesthetics, we create products and enclosures that harmonize with your home and elevate your pet\'s quality of life.
        </p>
      </section>

      {/* 3. Core Values Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white border border-beige p-6 text-center space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto">
              <Award size={20} className="text-accent" />
            </div>
            <h3 className="font-serif text-sm font-semibold text-primary">Uncompromising Quality</h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">No cheap fillers, standard raw meats only, and solid high-strength glass and iron structures.</p>
          </div>
          <div className="bg-white border border-beige p-6 text-center space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={20} className="text-accent" />
            </div>
            <h3 className="font-serif text-sm font-semibold text-primary">Veterinary Endorsement</h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">All therapeutic pharmacy formulations checked by internal licensed pharmacists.</p>
          </div>
          <div className="bg-white border border-beige p-6 text-center space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto">
              <Heart size={20} className="text-accent" />
            </div>
            <h3 className="font-serif text-sm font-semibold text-primary">Animal Well-being First</h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">Promoting active mental stimulation through custom composite puzzles and natural Java wood.</p>
          </div>
          <div className="bg-white border border-beige p-6 text-center space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto">
              <Sparkles size={20} className="text-accent" />
            </div>
            <h3 className="font-serif text-sm font-semibold text-primary">Modern Design aesthetics</h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">Clean, spacious, modern palettes that fit perfectly into premium high-end home environments.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
