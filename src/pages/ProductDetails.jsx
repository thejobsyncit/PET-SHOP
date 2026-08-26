import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, ShoppingBag, Heart, Star, ShieldAlert, Award, ArrowRight, ClipboardList, Plus, Minus, Check, MessageSquare } from 'lucide-react';
import { fetchProductDetail, fetchProducts, clearProductDetail } from '../store/slices/productSlice.js';
import { addToCartAPI } from '../store/slices/cartSlice.js';
import { toggleWishlistAPI } from '../store/slices/wishlistSlice.js';
import { apiRequest } from '../services/api.js';
import RatingStars from '../components/RatingStars.jsx';
import ProductCard from '../components/ProductCard.jsx';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProduct: product, detailLoading: loading, items: products } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = product && wishlistItems.some(item => item._id === product._id);

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetail(slug));
    return () => {
      dispatch(clearProductDetail());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (product) {
      // Load product recommendations
      dispatch(fetchProducts({ petType: product.petType, limit: 8 }));
      // Load product reviews
      loadReviews(product._id);
      // Reset image index
      setActiveImage(0);
      setQuantity(1);
    }
  }, [product, dispatch]);

  const loadReviews = async (productId) => {
    setReviewsLoading(true);
    try {
      const data = await apiRequest(`/reviews/product/${productId}`);
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlistAPI(product));
    if (isWishlisted) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = () => {
    if (product.requiresPrescription) {
      toast('Prescription verification needed. Order will process under Rx Review status.', { icon: '📝' });
    }
    dispatch(addToCartAPI({ product, quantity }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    dispatch(addToCartAPI({ product, quantity }));
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error('Please provide a title and comment.');
      return;
    }

    const token = localStorage.getItem('pawora_token');
    if (!token) {
      toast.error('Please log in to submit a product review.');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const data = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });

      if (data.success) {
        toast.success('Thank you! Your review has been saved.');
        setReviewTitle('');
        setReviewComment('');
        // Reload reviews
        loadReviews(product._id);
      }
    } catch (error) {
      toast.error(error.message || 'Already reviewed this product.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Curating product details...</p>
      </div>
    );
  }

  // Filter recommendations
  const recommendedItems = products.filter(p => p._id !== product._id).slice(0, 4);
  const frequentlyBoughtTogether = products.filter(p => p._id !== product._id).slice(4, 6);

  return (
    <div className="pb-20 space-y-16">
      
      {/* Breadcrumbs */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          <Link to="/" className="hover:text-primary transition">HOME</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-primary transition">SHOP</Link>
          <ChevronRight size={10} />
          <Link to={`/shop?petType=${product.petType}`} className="hover:text-primary transition">{product.petType}</Link>
          <ChevronRight size={10} />
          <span className="text-primary truncate max-w-xs">{product.name}</span>
        </div>
      </section>

      {/* Main product pane */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 bg-white border border-beige p-6 md:p-10 shadow-sm">
          
          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="aspect-square bg-gray-50 border border-beige overflow-hidden">
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Gallery thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 border object-cover bg-gray-50 cursor-pointer overflow-hidden transition ${
                      activeImage === idx ? 'border-primary' : 'border-beige hover:border-accent'
                    }`}
                  >
                    <img src={img} alt="Product Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Detail factsheet */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Brand and category */}
              <div>
                <span className="text-xs uppercase tracking-widest text-accent font-bold">
                  {product.brand}
                </span>
                <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1 leading-snug">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-2 mt-2">
                  <RatingStars rating={product.rating} size={14} />
                  <span className="text-xs text-gray-500 font-medium">({reviews.length} customer reviews)</span>
                </div>
              </div>

              {/* Pricing details */}
              <div className="flex items-baseline gap-2.5">
                {product.discountPrice ? (
                  <>
                    <span className="text-2xl font-bold text-primary">₹{product.discountPrice}</span>
                    <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 border border-accent/20">
                      SAVE {product.discountPercentage}%
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                )}
              </div>

              {/* Prescription indicator banner */}
              {product.requiresPrescription && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
                  <ClipboardList size={20} className="mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold uppercase tracking-wider">Prescription Verification Required</p>
                    <p className="leading-relaxed text-[11px]">
                      This is a veterinary-grade pharmaceutical product. You must upload a valid veterinarian prescription during checkout to receive pharmacist verification.
                    </p>
                  </div>
                </div>
              )}

              {/* Short description */}
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Specifications snippet */}
              {product.specifications.length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-beige pt-4">
                  {product.specifications.map((spec) => (
                    <div key={spec.label} className="text-xs flex gap-2">
                      <span className="text-gray-400 font-medium">{spec.label}:</span>
                      <span className="text-primary font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Inventory details */}
              <div className="flex items-center gap-2 text-xs pt-2">
                <span className="text-gray-400 font-semibold">Availability Status:</span>
                {product.stock === 0 ? (
                  <span className="text-red-500 font-bold uppercase">Out of Stock</span>
                ) : product.stock <= product.lowStockThreshold ? (
                  <span className="text-orange-500 font-bold uppercase flex items-center gap-1">
                    <ShieldAlert size={14} /> Low Stock (Only {product.stock} items left)
                  </span>
                ) : (
                  <span className="text-green-600 font-bold uppercase flex items-center gap-1">
                    <Check size={14} /> In Stock (Shipped in 24 hours)
                  </span>
                )}
              </div>
            </div>

            {/* Actions triggers */}
            <div className="pt-6 border-t border-beige space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                
                {/* Quantity */}
                <div className="flex items-center border border-beige bg-white">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={product.stock === 0}
                    className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 cursor-pointer disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 py-2.5 font-bold text-primary text-sm">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    disabled={product.stock === 0}
                    className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 cursor-pointer disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-grow btn-premium py-3.5 text-xs text-center justify-center gap-2 disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} /> ADD TO CART
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  className="p-3.5 border border-beige hover:border-primary hover:text-red-500 text-gray-400 transition rounded-none bg-white cursor-pointer"
                  title="Add to Wishlist"
                >
                  <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </button>
              </div>

              {product.stock > 0 && (
                <button 
                  onClick={handleBuyNow}
                  className="w-full btn-secondary-premium py-3.5 text-xs"
                >
                  BUY IT NOW
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Tab details: descriptions, key benefits, ingredients, shipping */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white border border-beige shadow-sm">
          {/* Tab buttons bar */}
          <div className="flex border-b border-beige overflow-x-auto">
            {[
              { id: 'description', label: 'Description' },
              { id: 'benefits', label: 'Key Benefits' },
              { id: 'ingredients', label: 'Ingredients' },
              { id: 'shipping', label: 'Shipping & Returns' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-xs uppercase tracking-wider font-semibold border-r border-beige last:border-r-0 transition cursor-pointer shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-secondary text-primary font-bold border-b-2 border-b-primary' 
                    : 'text-gray-400 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="p-6 md:p-8 text-xs text-gray-600 leading-relaxed space-y-4">
            {activeTab === 'description' && (
              <div className="space-y-3">
                <p className="font-semibold text-primary font-serif text-sm">Product Overview</p>
                <div className="whitespace-pre-line text-[11px] leading-relaxed">{product.longDescription}</div>
              </div>
            )}
            
            {activeTab === 'benefits' && (
              <div className="space-y-3">
                <p className="font-semibold text-primary font-serif text-sm">Key Benefits for Companions</p>
                <ul className="list-disc pl-5 space-y-2 text-[11px]">
                  <li>Formulated with absolute pharmaceutical-grade safety compliance.</li>
                  <li>Free from artificial fillers, corn, wheat, or soy in dietary kibbles.</li>
                  <li>Rich in trace minerals and specialized calcium to ensure bone mineralization.</li>
                  <li>Promotes healthy immunity, digestive alignment, and coat gloss.</li>
                </ul>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-3">
                <p className="font-semibold text-primary font-serif text-sm">Nutritional Composition & Ingredients</p>
                {product.ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.ingredients.map((ing) => (
                      <span key={ing} className="px-3 py-1 bg-secondary text-primary text-[10px] font-medium border border-beige">
                        {ing}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Nutritional ingredients list not applicable for this item category.</p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3">
                <p className="font-semibold text-primary font-serif text-sm">Shipping Information & Returns Policy</p>
                <div className="space-y-2 text-[11px]">
                  <p><strong>Shipping:</strong> Free shipping is unlocked on all orders totaling ₹999 and above. Orders below this threshold incur a flat delivery fee of ₹99. Dispatch takes place within 24 hours, and delivery across major Indian cities is complete within 3-5 business days.</p>
                  <p><strong>Returns:</strong> We accept returns on unopened packaging (non-medication) within 15 days of delivery. For safety reasons, pharmaceutical items (Rx) and dietary supplements cannot be returned or refunded once dispatched.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Frequently bought together */}
      {frequentlyBoughtTogether.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white border border-beige p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-bold text-primary">Frequently Bought Together</h3>
            <div className="flex flex-col lg:flex-row items-center gap-6">
              
              {/* Product list */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 border border-beige p-3 bg-secondary">
                  <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover bg-white" />
                  <div>
                    <p className="text-[11px] font-bold text-primary truncate max-w-xs">{product.name}</p>
                    <p className="text-xs font-semibold text-accent">₹{product.discountPrice || product.price}</p>
                  </div>
                </div>

                <span className="text-lg font-bold text-gray-400">+</span>

                {frequentlyBoughtTogether.map((item) => (
                  <React.Fragment key={item._id}>
                    <div className="flex items-center gap-3 border border-beige p-3 bg-secondary">
                      <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-cover bg-white" />
                      <div>
                        <p className="text-[11px] font-bold text-primary truncate max-w-[120px]">{item.name}</p>
                        <p className="text-xs font-semibold text-accent">₹{item.discountPrice || item.price}</p>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Total buy details */}
              <div className="lg:border-l lg:border-beige lg:pl-6 py-2 flex flex-col justify-center space-y-3 shrink-0">
                <p className="text-xs text-gray-500 font-semibold">Total bundle cost:</p>
                <p className="text-xl font-bold text-primary">
                  ₹{frequentlyBoughtTogether.reduce((sum, item) => sum + (item.discountPrice || item.price), product.discountPrice || product.price)}
                </p>
                <button
                  onClick={() => {
                    dispatch(addToCartAPI({ product, quantity: 1 }));
                    frequentlyBoughtTogether.forEach(item => {
                      dispatch(addToCartAPI({ product: item, quantity: 1 }));
                    });
                    toast.success('Bundle added to cart!');
                  }}
                  className="btn-premium py-2 text-xs uppercase"
                >
                  ADD BUNDLE TO CART
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Recommendations carousels */}
      {recommendedItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <h2 className="font-serif text-lg font-bold text-primary">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedItems.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Checklist */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Reviews list column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-lg font-bold text-primary">Customer Reviews</h2>
            
            {reviewsLoading ? (
              <p className="text-xs text-gray-400">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="bg-white border border-beige p-5 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-primary">{r.userName || 'Verified Buyer'}</p>
                        <p className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <RatingStars rating={r.rating} size={12} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-primary text-xs font-serif">{r.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic bg-white border border-beige p-6 shadow-sm">
                No reviews yet. Be the first to share your experience with this premium selection!
              </p>
            )}
          </div>

          {/* Write a review form */}
          <div className="bg-white border border-beige p-6 shadow-sm h-fit space-y-4">
            <h3 className="font-serif text-base font-bold text-primary border-b border-beige pb-2">
              Write a Review
            </h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Rating selection */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold block">Product Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-gray-300 hover:text-accent focus:outline-none cursor-pointer"
                    >
                      <Star 
                        size={20} 
                        className={star <= reviewRating ? 'fill-accent text-accent' : 'text-gray-300'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold block">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent formula!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold block">Review Body</label>
                <textarea
                  rows={4}
                  placeholder="Tell other pet parents about your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full btn-premium py-2.5 text-xs"
              >
                {submittingReview ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
};

export default ProductDetails;
