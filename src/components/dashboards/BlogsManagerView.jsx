import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Edit, Trash2, X, ExternalLink,
  RefreshCw, Upload, Sparkles, Search, Filter, AlertCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest, apiUploadRequest } from '../../services/api.js';

const QUICK_IMAGE_PRESETS = [
  { label: 'Dog', url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Bird', url: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Reptile', url: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Fish', url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=1200' }
];

const CATEGORIES = [
  { id: 'all', label: 'All Articles' },
  { id: 'dogs', label: 'Dogs' },
  { id: 'cats', label: 'Cats' },
  { id: 'birds', label: 'Birds' },
  { id: 'reptiles', label: 'Reptiles' },
  { id: 'fish', label: 'Fish & Aquatics' }
];

const BlogsManagerView = () => {
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Form Fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogPetType, setBlogPetType] = useState('dogs');
  const [blogAuthor, setBlogAuthor] = useState('JOSH PETS HUB Editorial Team');
  const [blogReadTime, setBlogReadTime] = useState('5 min read');
  const [blogFeaturedImage, setBlogFeaturedImage] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogFaqs, setBlogFaqs] = useState([{ question: '', answer: '' }]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/blogs');
      if (data && data.success) {
        setBlogsList(Array.isArray(data.blogs) ? data.blogs : []);
      }
    } catch (err) {
      console.warn('Failed to load blogs:', err);
      toast.error('Failed to load pet care blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleOpenModal = (b = null) => {
    if (b) {
      setEditingBlogId(b._id || b.id || b.slug);
      setBlogTitle(b.title || '');
      setBlogSlug(b.slug || '');
      setBlogPetType(b.petType || b.pet_type || 'dogs');
      setBlogAuthor(b.author || 'JOSH PETS HUB Editorial Team');
      setBlogReadTime(b.readTime || b.read_time || '5 min read');
      setBlogFeaturedImage(b.featuredImage || b.featured_image || '');
      setBlogSummary(b.summary || '');
      setBlogContent(b.content || '');
      setBlogTags(Array.isArray(b.tags) ? b.tags.join(', ') : (b.tags || ''));
      setBlogFaqs(Array.isArray(b.faqs) && b.faqs.length > 0 ? b.faqs : [{ question: '', answer: '' }]);
    } else {
      setEditingBlogId(null);
      setBlogTitle('');
      setBlogSlug('');
      setBlogPetType('dogs');
      setBlogAuthor('JOSH PETS HUB Editorial Team');
      setBlogReadTime('5 min read');
      setBlogFeaturedImage('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200');
      setBlogSummary('');
      setBlogContent('');
      setBlogTags('Dogs, Nutrition, Wellness');
      setBlogFaqs([{ question: '', answer: '' }]);
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image exceeds 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingCover(true);
    try {
      const res = await apiUploadRequest('/blogs/upload-cover', formData);
      if (res?.success && res?.imageUrl) {
        setBlogFeaturedImage(res.imageUrl);
        toast.success('Cover image uploaded!');
      } else {
        throw new Error(res?.message || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogTitle.trim()) {
      toast.error('Article title is required.');
      return;
    }
    if (!blogContent.trim()) {
      toast.error('Article body content is required.');
      return;
    }

    setSavingBlog(true);
    try {
      const cleanFaqs = blogFaqs.filter(f => f.question?.trim() && f.answer?.trim());
      const payload = {
        title: blogTitle.trim(),
        slug: blogSlug ? blogSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '') : undefined,
        summary: blogSummary.trim(),
        content: blogContent.trim(),
        author: blogAuthor.trim() || 'JOSH PETS HUB Editorial Team',
        featuredImage: blogFeaturedImage.trim() || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200',
        petType: blogPetType,
        readTime: blogReadTime.trim() || '5 min read',
        tags: blogTags.split(',').map(t => t.trim()).filter(Boolean),
        faqs: cleanFaqs
      };

      let res;
      if (editingBlogId) {
        res = await apiRequest(`/blogs/${editingBlogId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/blogs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.success) {
        toast.success(editingBlogId ? 'Article updated successfully!' : 'Article published successfully!');
        setShowModal(false);
        loadBlogs();
      } else {
        throw new Error(res?.message || 'Failed to save article');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving article');
    } finally {
      setSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (blog) => {
    const id = blog._id || blog.id || blog.slug;
    if (!id) return;
    if (!window.confirm(`Are you sure you want to delete "${blog.title}"?`)) return;

    try {
      const res = await apiRequest(`/blogs/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        toast.success('Article removed successfully!');
        setBlogsList(prev => prev.filter(b => (b._id || b.id || b.slug) !== id));
      } else {
        throw new Error(res?.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting article');
    }
  };

  const handleFaqChange = (index, field, value) => {
    setBlogFaqs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddFaq = () => {
    setBlogFaqs(prev => [...prev, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index) => {
    setBlogFaqs(prev => prev.filter((_, i) => i !== index));
  };

  const filteredBlogs = (blogsList || []).filter(b => {
    const pType = (b.petType || b.pet_type || '').toLowerCase();
    const matchesCat = categoryFilter === 'all' || pType === categoryFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-[#0F2E23]" />
            Pet Care Publications & Blogs ({blogsList.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish veterinary-reviewed care guides, nutritional tips, and pet wellness articles to the public blog hub.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/pet-care"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open public blog hub in a new tab"
          >
            <ExternalLink size={14} />
            <span>View Live Hub</span>
          </a>
          <button
            type="button"
            onClick={() => handleOpenModal(null)}
            className="px-4 py-2 bg-[#0F2E23] hover:bg-[#1c4b3a] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} /> POST NEW ARTICLE
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#0F2E23] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search title, author, summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Articles List / Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <RefreshCw size={24} className="mx-auto text-slate-400 animate-spin mb-2" />
          <p className="text-xs font-bold text-slate-500">Loading pet care publications...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-200 space-y-3">
          <BookOpen size={36} className="mx-auto text-slate-300" />
          <p className="font-bold text-sm text-slate-900">No matching articles found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all' 
              ? 'Try clearing the search query or category filter.' 
              : 'Click "POST NEW ARTICLE" above to publish your first veterinary or pet care guide.'}
          </p>
          {(!searchQuery && categoryFilter === 'all') && (
            <button
              type="button"
              onClick={() => handleOpenModal(null)}
              className="px-4 py-2 bg-[#0F2E23] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Create First Article
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th className="p-4 uppercase tracking-wider">Article Details</th>
                  <th className="p-4 uppercase tracking-wider">Pet Category</th>
                  <th className="p-4 uppercase tracking-wider">Author & Read Time</th>
                  <th className="p-4 uppercase tracking-wider">Published Date</th>
                  <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBlogs.map((b) => {
                  const pType = b.petType || b.pet_type || 'dogs';
                  const badgeColors = {
                    dogs: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    cats: 'bg-amber-50 text-amber-700 border-amber-200',
                    birds: 'bg-sky-50 text-sky-700 border-sky-200',
                    reptiles: 'bg-purple-50 text-purple-700 border-purple-200',
                    fish: 'bg-blue-50 text-blue-700 border-blue-200'
                  };
                  const badgeClass = badgeColors[pType.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr key={b._id || b.id || b.slug} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 max-w-[340px]">
                        <div className="flex items-start gap-3">
                          <img
                            src={b.featuredImage || b.featured_image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=300'}
                            alt={b.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200 bg-slate-100"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=300';
                            }}
                          />
                          <div className="space-y-1 min-w-0">
                            <p className="font-bold text-slate-900 text-xs leading-snug truncate" title={b.title}>
                              {b.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {b.summary || 'No summary provided.'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              /pet-care/{b.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${badgeClass}`}>
                          {pType}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800 text-[11px]">{b.author || 'Editorial Team'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.readTime || b.read_time || '5 min read'}</p>
                      </td>

                      <td className="p-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {b.publishedDate || b.published_date 
                          ? new Date(b.publishedDate || b.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Recent'}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/pet-care/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-[#0F2E23] hover:bg-emerald-50 rounded-md transition-colors"
                            title="View Public Article"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(b)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(b)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP MODAL: ADD / EDIT BLOG ARTICLE */}
      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div onClick={() => !savingBlog && setShowModal(false)} className="fixed inset-0 bg-transparent"></div>

          <form
            onSubmit={handleSaveBlog}
            className="relative bg-white w-full max-w-3xl border border-slate-200 shadow-2xl flex flex-col min-h-0 max-h-[90vh] z-10 my-auto overflow-hidden rounded-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#0F2E23] text-white flex justify-between items-center border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#D4AF37]" />
                <h3 className="font-serif text-sm font-bold tracking-wider text-[#D4AF37] uppercase">
                  {editingBlogId ? 'Edit Pet Care Article' : 'Publish New Pet Care Article'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                disabled={savingBlog}
                className="text-white hover:text-[#D4AF37] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
              
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-slate-700 font-bold block">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Puppy Nutrition & Diet Guide"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Pet Category</label>
                  <select
                    value={blogPetType}
                    onChange={(e) => setBlogPetType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23] bg-white capitalize cursor-pointer"
                  >
                    <option value="dogs">Dogs</option>
                    <option value="cats">Cats</option>
                    <option value="birds">Birds</option>
                    <option value="reptiles">Reptiles</option>
                    <option value="fish">Fish & Aquatics</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Author & Read Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Author / Byline</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Shruti Sharma (DVM)"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 min read"
                    value={blogReadTime}
                    onChange={(e) => setBlogReadTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              {/* Row 3: Custom Slug & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">
                    URL Slug <span className="text-[10px] text-slate-400 font-normal">(Optional, auto-generated from title)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. complete-puppy-nutrition-guide"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23] font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Nutrition, Puppies, Health, Vet Guide"
                    value={blogTags}
                    onChange={(e) => setBlogTags(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              {/* Row 4: Cover Image URL & File Upload */}
              <div className="space-y-2">
                <label className="text-slate-700 font-bold block">
                  Cover Image URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={blogFeaturedImage}
                    onChange={(e) => setBlogFeaturedImage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23]"
                    required
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition border border-slate-300 flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload size={14} />
                    <span>{uploadingCover ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                  {blogFeaturedImage && (
                    <img 
                      src={blogFeaturedImage} 
                      alt="Preview" 
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>

                {/* 1-Click Image Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Preset:</span>
                  {QUICK_IMAGE_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBlogFeaturedImage(preset.url)}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 5: Summary */}
              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">
                  Short Summary / Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="A concise, engaging 2-3 sentence overview shown on blog index cards..."
                  value={blogSummary}
                  onChange={(e) => setBlogSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F2E23]"
                  required
                />
              </div>

              {/* Row 6: Article Content */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 font-bold block">
                    Article Body Content <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Supports Markdown (### Headings, * bullets, **bold**)</span>
                </div>
                <textarea
                  rows={10}
                  placeholder="Write or paste your article content here. You can write paragraphs, use bullet points, or markdown headers..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0F2E23] leading-relaxed"
                  required
                />
              </div>

              {/* Row 7: FAQs Section */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 font-bold block">
                    Frequently Asked Questions (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="text-[11px] font-bold text-[#0F2E23] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add FAQ
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {blogFaqs.map((faq, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 relative">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Q{idx + 1}:</span>
                        <input
                          type="text"
                          placeholder="e.g. How often should I feed my puppy?"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0F2E23] bg-white"
                        />
                        {blogFaqs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            title="Remove FAQ"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase pt-1">A:</span>
                        <textarea
                          rows={2}
                          placeholder="Clear vet-backed answer..."
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0F2E23] bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={savingBlog}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={savingBlog}
                className="px-5 py-2 bg-[#0F2E23] hover:bg-[#1c4b3a] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                {savingBlog ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> SAVING...
                  </>
                ) : editingBlogId ? (
                  'UPDATE ARTICLE'
                ) : (
                  'PUBLISH ARTICLE'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BlogsManagerView;

