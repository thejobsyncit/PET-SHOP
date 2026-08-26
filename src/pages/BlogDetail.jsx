import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, User, Clock, ChevronDown, Award } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/blogs/slug/${slug}`);
      if (data.success) {
        setBlog(data.blog);
      }
    } catch (err) {
      console.error(err);
      navigate('/pet-care');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !blog) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading publication details...</p>
      </div>
    );
  }

  // Parse sections for table of contents
  const sections = [
    { id: 'sec-1', label: '1. Core Overview' },
    { id: 'sec-2', label: '2. Environmental Criteria' },
    { id: 'sec-3', label: '3. Nutrition & Feed' },
    { id: 'faq-sec', label: '4. Common FAQs' }
  ];

  return (
    <div className="pb-20 space-y-12">
      
      {/* Breadcrumbs */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          <Link to="/" className="hover:text-primary transition">HOME</Link>
          <ChevronRight size={10} />
          <Link to="/pet-care" className="hover:text-primary transition">PET CARE HUB</Link>
          <ChevronRight size={10} />
          <span className="text-primary truncate max-w-xs">{blog.title}</span>
        </div>
      </section>

      {/* Hero Header Article Info */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-4">
        <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold tracking-widest uppercase">
          {blog.petType} Department Guide
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-tight">
          {blog.title}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed font-light max-w-2xl mx-auto">
          {blog.summary}
        </p>

        {/* Metadata info */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] text-gray-400 font-bold uppercase pt-4 border-t border-b border-beige py-3 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5"><User size={14} className="text-accent" /> {blog.author}</div>
          <div className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" /> {new Date(blog.publishedDate).toLocaleDateString()}</div>
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-accent" /> {blog.readTime}</div>
        </div>
      </section>

      {/* Featured Cover Image */}
      <section className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="aspect-[21/9] overflow-hidden border border-beige bg-gray-50 shadow-sm">
          <img 
            src={blog.featuredImage} 
            alt={blog.title} 
            className="w-full h-full object-cover filter brightness-[0.9]" 
          />
        </div>
      </section>

      {/* Main content grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Table of contents (Left 3 Columns) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 bg-white border border-beige p-5 space-y-4">
            <h3 className="font-serif text-xs font-bold text-primary uppercase tracking-widest border-b border-beige pb-2">
              Table of Contents
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-500 font-medium">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} className="hover:text-accent transition">{sec.label}</a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Article Text Content (Right 9 Columns) */}
          <article className="lg:col-span-9 space-y-10 bg-white border border-beige p-6 md:p-10 shadow-sm">
            
            {/* Structured Content blocks mapping standard Markdown outputs */}
            <div className="text-xs text-gray-600 leading-relaxed space-y-6">
              <div id="sec-1" className="space-y-3 scroll-mt-24">
                <h2 className="font-serif text-base font-bold text-primary">1. Core Overview & Foundations</h2>
                <div className="whitespace-pre-line text-[11px] leading-relaxed">
                  {blog.content.split('### 1.')[0]}
                </div>
              </div>

              {blog.content.includes('### 1.') && (
                <div id="sec-2" className="space-y-3 scroll-mt-24">
                  <h2 className="font-serif text-base font-bold text-primary">2. Environmental and Care Criteria</h2>
                  <div className="whitespace-pre-line text-[11px] leading-relaxed">
                    {'### 1.' + blog.content.split('### 1.')[1].split('### 3.')[0]}
                  </div>
                </div>
              )}

              {blog.content.includes('### 3.') && (
                <div id="sec-3" className="space-y-3 scroll-mt-24">
                  <h2 className="font-serif text-base font-bold text-primary">3. Diet, Health, & Longevity Practices</h2>
                  <div className="whitespace-pre-line text-[11px] leading-relaxed">
                    {'### 3.' + blog.content.split('### 3.')[1]}
                  </div>
                </div>
              )}
            </div>

            {/* Author Profile block */}
            <div className="border-t border-beige pt-8 mt-8 flex items-center gap-4 bg-secondary p-5 border border-beige">
              <div className="w-12 h-12 bg-primary text-accent rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                MD
              </div>
              <div className="text-xs">
                <p className="font-bold text-primary uppercase tracking-wider">{blog.author}</p>
                <p className="text-gray-400">Veterinary Science Advisory Board Member at Pawora</p>
                <p className="text-gray-500 mt-1 leading-relaxed">Specializing in preventative care medicine and customized companion habitats.</p>
              </div>
            </div>

            {/* FAQ Accordions */}
            {blog.faqs && blog.faqs.length > 0 && (
              <div id="faq-sec" className="space-y-4 pt-8 border-t border-beige scroll-mt-24">
                <h3 className="font-serif text-base font-bold text-primary">Common Article FAQs</h3>
                <div className="space-y-3">
                  {blog.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-beige p-4">
                      <button
                        onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                        className="w-full flex justify-between items-center text-left py-1 text-xs font-bold text-primary hover:text-accent transition cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={14} className={`transform transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {faqOpen === idx && (
                        <p className="text-xs text-gray-500 leading-relaxed pt-2 border-t border-beige mt-2">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

        </div>
      </section>

      {/* Related Products Section */}
      {blog.relatedProducts && blog.relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6 pt-10">
          <h3 className="font-serif text-lg font-bold text-primary text-center">Suggested Companion Products</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {blog.relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default BlogDetail;
