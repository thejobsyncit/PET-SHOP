import Blog from '../models/Blog.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
import mongoose from 'mongoose';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { petType } = req.query;

    if (isDbConnected()) {
      const filter = petType ? { petType } : {};
      const blogs = await Blog.find(filter).sort({ publishedDate: -1 });
      res.json({ success: true, blogs });
    } else {
      let blogs = readMockData('blogs');
      if (petType) {
        blogs = blogs.filter(b => b.petType === petType);
      }
      blogs.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      res.json({ success: true, blogs });
    }
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
    if (isDbConnected()) {
      const blog = await Blog.findOne({ slug }).populate('relatedProducts');
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }
      res.json({ success: true, blog });
    } else {
      const blogs = readMockData('blogs');
      const products = readMockData('products');
      const blog = blogs.find(b => b.slug === slug);

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }

      // Manual populate of related products
      const related = (blog.relatedProducts || []).map(pId => {
        return products.find(p => p._id.toString() === pId.toString());
      }).filter(p => p !== undefined && p !== null);

      const populatedBlog = {
        ...blog,
        relatedProducts: related
      };

      res.json({ success: true, blog: populatedBlog });
    }
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
    if (isDbConnected()) {
      const newBlog = new Blog({
        title,
        slug,
        summary,
        content,
        author,
        featuredImage,
        petType,
        tags: tags || [],
        readTime,
        faqs: faqs || [],
        relatedProducts: relatedProducts || []
      });
      await newBlog.save();
      res.status(201).json({ success: true, blog: newBlog });
    } else {
      const blogs = readMockData('blogs');
      const newBlog = {
        _id: new mongoose.Types.ObjectId().toString(),
        title,
        slug,
        summary,
        content,
        author: author || 'Pawora Editorial Team',
        featuredImage,
        petType,
        tags: tags || [],
        readTime: readTime || '5 min read',
        faqs: faqs || [],
        relatedProducts: relatedProducts || [],
        publishedDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        isPublished: true
      };
      blogs.push(newBlog);
      writeMockData('blogs', blogs);
      res.status(201).json({ success: true, blog: newBlog });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
