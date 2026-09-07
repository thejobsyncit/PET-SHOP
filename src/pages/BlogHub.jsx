import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Tag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '../services/api.js';
import ScrollReveal from '../components/ScrollReveal.jsx';

const BlogHub = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadBlogs(activeTab);
  }, [activeTab]);

  const loadBlogs = async (petType) => {
    setLoading(true);
    try {
      const endpoint = petType && petType !== 'all' ? `/blogs?petType=${petType}` : '/blogs';
      const data = await apiRequest(endpoint);
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPetTypeLabel = (type) => {
    switch (type) {
      case 'dogs': return 'Dogs';
      case 'birds': return 'Birds';
      case 'reptiles': return 'Reptiles';
      case 'fish': return 'Fish & Aquatics';
      default: return 'General Care';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Editorial Header - Premium Glassmorphism & Floating Animations */}
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
            <BookOpen size={16} /> PAWORA PET LIVING HUB
          </motion.span>
          
          <h1 className="font-sans font-black text-4xl md:text-6xl text-white tracking-tight leading-[1.1] drop-shadow-lg">
            Expert Care & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fde047] to-[#f59e0b]">
              Nutrition
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Vet-reviewed guides covering bearded dragon enclosures, canine dietary balance, and freshwater aquarium chemistry.
          </p>
        </div>
      </ScrollReveal>

      {/* Tabs Filter - Premium Toggles */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        <div className="flex flex-wrap gap-3 justify-center pb-8">
          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl flex flex-wrap justify-center gap-2 border border-slate-100 ring-1 ring-black/5">
            {['all', 'dogs', 'birds', 'reptiles', 'fish'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-[#1c4b3a] to-[#0f2e23] text-[#fde047] shadow-lg scale-105' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {tab === 'all' ? 'All Pet Care' : tab === 'fish' ? 'Fish & Aquatics' : tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid - Premium Cards & Micro-animations */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(idx => (
              <div key={idx} className="bg-slate-100 rounded-[2rem] h-[400px] animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <ScrollReveal key={blog.slug} variant="slideUp" delay={0.1 + (index * 0.1)}>
                <div 
                  onClick={() => navigate(`/pet-care/${blog.slug}`)}
                  className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full cursor-pointer overflow-hidden"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[10px] font-black text-[#1c4b3a] px-3 py-1.5 rounded-lg shadow-sm z-20 flex items-center gap-1.5">
                      <Tag size={12} />
                      {getPetTypeLabel(blog.petType)}
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-4 flex-1 flex flex-col justify-between relative z-20 bg-white">
                    <div className="space-y-3">
                      <h3 className="font-sans text-xl md:text-2xl font-black text-slate-900 leading-snug group-hover:text-[#1c4b3a] transition-colors duration-300">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3">
                        {blog.summary}
                      </p>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md"><Clock size={14} /> {blog.readTime}</span>
                      <span className="text-[#1c4b3a] flex items-center gap-1.5 group-hover:text-amber-600 transition-colors">
                        READ ARTICLE <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal variant="fade">
            <div className="text-center py-20 bg-white border border-slate-200 rounded-[2rem] max-w-md mx-auto shadow-sm">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">No articles found.</p>
              <p className="text-xs text-slate-400 mt-2">Check back later for expert publications.</p>
            </div>
          </ScrollReveal>
        )}
      </section>

    </div>
  );
};

export default BlogHub;
