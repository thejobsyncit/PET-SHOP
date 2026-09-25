import { supabase } from '../config/supabase.js';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { petType } = req.query;

    let query = supabase.from('blogs').select('*').order('published_date', { ascending: false });
    if (petType) {
      query = query.eq('pet_type', petType);
    }
    
    const { data: blogs, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, blogs: blogs || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const { data: blog, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
    if (error || !blog) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Manual populate of related products if they exist
    const relatedProductsList = blog.related_products || [];
    let populatedProducts = [];
    if (relatedProductsList.length > 0) {
      const { data: products } = await supabase.from('products').select('*').in('id', relatedProductsList);
      populatedProducts = products || [];
    }

    const populatedBlog = {
      ...blog,
      relatedProducts: populatedProducts
    };

    res.json({ success: true, blog: populatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a blog article (Admin only)
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
  const { title, summary, content, author, featuredImage, petType, tags, readTime, faqs, relatedProducts } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const { data: newBlog, error } = await supabase.from('blogs').insert([{
      title,
      slug,
      summary,
      content,
      author: author || 'Pawora Editorial Team',
      featured_image: featuredImage,
      pet_type: petType,
      tags: tags || [],
      read_time: readTime || '5 min read',
      faqs: faqs || [],
      related_products: relatedProducts || [],
      is_published: true
    }]).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
