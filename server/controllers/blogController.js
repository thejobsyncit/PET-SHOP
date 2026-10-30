import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BLOGS_FILE = path.join(__dirname, '..', 'data', 'blogs.json');
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

export const loadDiskBlogs = () => {
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      const raw = fs.readFileSync(BLOGS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Blogs] Error reading blogs.json:', err?.message);
  }
  return [];
};

export const saveDiskBlogs = (blogs) => {
  try {
    const dir = path.dirname(BLOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Blogs] Error saving blogs.json:', err?.message);
  }
};

const loadDiskProducts = () => {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
};

const normalizeBlog = (b) => {
  if (!b) return null;
  const pType = b.petType || b.pet_type || 'dogs';
  const img = b.featuredImage || b.featured_image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200';
  const rTime = b.readTime || b.read_time || '5 min read';
  const pubDate = b.publishedDate || b.published_date || b.createdAt || new Date().toISOString();

  return {
    ...b,
    _id: b._id || b.id || b.slug,
    id: b.id || b._id || b.slug,
    title: b.title || 'Pet Care Guide',
    slug: b.slug,
    summary: b.summary || '',
    content: b.content || '',
    author: b.author || 'JOSH PETS HUB Editorial Team',
    petType: pType,
    pet_type: pType,
    featuredImage: img,
    featured_image: img,
    readTime: rTime,
    read_time: rTime,
    publishedDate: pubDate,
    published_date: pubDate,
    tags: Array.isArray(b.tags) ? b.tags : [],
    faqs: Array.isArray(b.faqs) ? b.faqs : [],
    relatedProducts: Array.isArray(b.relatedProducts) ? b.relatedProducts : (Array.isArray(b.related_products) ? b.related_products : [])
  };
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { petType } = req.query;
    let blogsList = [];

    if (supabase) {
      try {
        let query = supabase.from('blogs').select('*').order('published_date', { ascending: false });
        if (petType && petType !== 'all') {
          query = query.eq('pet_type', petType);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          blogsList = data;
        }
      } catch (_) {}
    }

    if (blogsList.length === 0) {
      let diskBlogs = loadDiskBlogs();
      if (petType && petType !== 'all') {
        diskBlogs = diskBlogs.filter(b => (b.petType === petType || b.pet_type === petType));
      }
      blogsList = diskBlogs;
    }

    const normalized = blogsList.map(normalizeBlog);
    return res.json({ success: true, blogs: normalized, count: normalized.length });
  } catch (error) {
    console.error('[Blogs] Error in getBlogs:', error);
    const diskBlogs = loadDiskBlogs().map(normalizeBlog);
    return res.json({ success: true, blogs: diskBlogs, count: diskBlogs.length });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ success: false, message: 'Slug is required' });
  }

  const cleanSlug = String(slug).toLowerCase().trim();
  let blog = null;

  // 1. Try Supabase if table exists
  if (supabase) {
    try {
      const { data, error } = await supabase.from('blogs').select('*').eq('slug', cleanSlug).maybeSingle();
      if (!error && data) {
        blog = data;
      }
    } catch (_) {}
  }

  // 2. Fallback to disk blogs
  if (!blog) {
    const diskBlogs = loadDiskBlogs();
    blog = diskBlogs.find(b => 
      String(b.slug || '').toLowerCase() === cleanSlug ||
      String(b._id || b.id || '').toLowerCase() === cleanSlug
    );
  }

  if (!blog) {
    return res.status(404).json({ success: false, message: `Article with slug "${slug}" not found` });
  }

  const normalized = normalizeBlog(blog);

  // 3. Populate related products
  const allProducts = loadDiskProducts();
  let populatedProducts = [];
  const relIds = normalized.relatedProducts || [];

  if (relIds.length > 0) {
    populatedProducts = allProducts.filter(p => 
      relIds.includes(String(p._id)) || 
      relIds.includes(String(p.id)) ||
      relIds.some(r => typeof r === 'object' && (r._id === p._id || r.id === p.id))
    );
  }

  // If no products matched via IDs, select products matching the pet type
  if (populatedProducts.length === 0 && allProducts.length > 0) {
    const pType = normalized.petType?.toLowerCase() || 'dogs';
    populatedProducts = allProducts
      .filter(p => String(p.petType || p.category || '').toLowerCase().includes(pType))
      .slice(0, 4);
    if (populatedProducts.length === 0) {
      populatedProducts = allProducts.slice(0, 4);
    }
  }

  const result = {
    ...normalized,
    relatedProducts: populatedProducts
  };

  return res.json({ success: true, blog: result });
};

// @desc    Create a blog article (Admin only)
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
  const { title, summary, content, author, featuredImage, petType, tags, readTime, faqs, relatedProducts } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const now = new Date().toISOString();

  const newBlog = normalizeBlog({
    _id: `BLG-${Date.now().toString().slice(-6)}`,
    title,
    slug,
    summary: summary || '',
    content,
    author: author || 'JOSH PETS HUB Editorial Team',
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200',
    petType: petType || 'dogs',
    tags: tags || [],
    readTime: readTime || '5 min read',
    faqs: faqs || [],
    relatedProducts: relatedProducts || [],
    publishedDate: now,
    createdAt: now
  });

  // Save to disk
  try {
    const currentBlogs = loadDiskBlogs();
    const updated = [newBlog, ...currentBlogs.filter(b => b.slug !== slug)];
    saveDiskBlogs(updated);
  } catch (err) {
    console.error('[Blogs] Failed writing to disk:', err);
  }

  // Attempt Supabase insert if table exists
  if (supabase) {
    try {
      await supabase.from('blogs').insert([{
        title: newBlog.title,
        slug: newBlog.slug,
        summary: newBlog.summary,
        content: newBlog.content,
        author: newBlog.author,
        featured_image: newBlog.featuredImage,
        pet_type: newBlog.petType,
        tags: newBlog.tags,
        read_time: newBlog.readTime,
        faqs: newBlog.faqs,
        related_products: newBlog.relatedProducts,
        is_published: true,
        published_date: now
      }]);
    } catch (_) {}
  }

  return res.status(201).json({ success: true, blog: newBlog });
};
