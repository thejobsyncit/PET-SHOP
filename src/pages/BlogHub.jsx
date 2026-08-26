import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { apiRequest } from '../services/api.js';

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
      
      {/* Editorial Header */}
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden border-b border-beige">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=1200" 
            alt="Pawora Editorial Pet Care Hub" 
            className="w-full h-full object-cover filter brightness-[0.55]"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-4">
          <span className="text-[10px] tracking-widest font-bold text-accent uppercase flex items-center justify-center gap-1.5">
            <BookOpen size={12} /> PAWORA PET LIVING HUB
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-secondary">Expert Care & Nutrition</h1>
          <p className="text-xs md:text-sm text-secondary-dark max-w-xl mx-auto leading-relaxed font-light">
            Vet-reviewed guides covering bearded dragon enclosures, canine dietary balance, and freshwater aquarium chemistry.
          </p>
        </div>
      </section>

      {/* Tabs Filter */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap gap-2 justify-center pb-4 border-b border-beige">
          {['all', 'dogs', 'birds', 'reptiles', 'fish'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-primary text-white border border-primary' 
                  : 'bg-white text-gray-500 border border-beige hover:border-primary'
              }`}
            >
              {tab === 'all' ? 'All Pet Care' : tab === 'fish' ? 'Fish & Aquatics' : tab}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(idx => (
              <div key={idx} className="bg-white border border-beige h-[320px] animate-pulse"></div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div 
                key={blog.slug}
                onClick={() => navigate(`/pet-care/${blog.slug}`)}
                className="card-premium group flex flex-col justify-between cursor-pointer h-full bg-white"
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden border-b border-beige bg-gray-50">
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-accent tracking-widest uppercase">
                      <Tag size={10} />
                      <span>{getPetTypeLabel(blog.petType)}</span>
                    </div>
                    <h3 className="font-serif text-sm font-semibold text-primary leading-snug group-hover:text-accent transition duration-300">
                      {blog.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
                      {blog.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-auto flex items-center justify-between text-[10px] text-gray-400 font-semibold border-t border-beige pt-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime}</span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:text-accent transition">
                    READ <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-beige max-w-md mx-auto text-gray-500 text-xs">
            No articles found. Check back later for expert publications.
          </div>
        )}
      </section>

    </div>
  );
};

export default BlogHub;
