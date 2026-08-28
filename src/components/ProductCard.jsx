import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, ShieldAlert, Check, X, ClipboardList, Minus, Plus } from 'lucide-react';
import { addToCartAPI } from '../store/slices/cartSlice.js';
import { toggleWishlistAPI } from '../store/slices/wishlistSlice.js';
import RatingStars from './RatingStars.jsx';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some(item => item._id === product._id);

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlistAPI(product));
    if (isWishlisted) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    
    if (product.requiresPrescription) {
      toast('Prescription required! Redirecting to detail page...', { icon: '📝' });
      navigate(`/product/${product.slug}`);
      return;
    }

    dispatch(addToCartAPI({ product, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleOpenQuickView = (e) => {
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleQuickViewAddToCart = () => {
    if (product.requiresPrescription) {
      setQuickViewOpen(false);
      toast('Prescription required! Redirecting to detail page...', { icon: '📝' });
      navigate(`/product/${product.slug}`);
      return;
    }
    dispatch(addToCartAPI({ product, quantity }));
    setQuickViewOpen(false);
    toast.success('Added to cart!');
  };

  const discountPrice = product.discountPrice;
  const price = product.price;

  return (
    <>
      <div 
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="card-premium group relative flex flex-col h-full cursor-pointer bg-white"
      >
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isBestSeller && (
            <span className="px-2.5 py-1 bg-primary text-secondary text-[9px] font-bold tracking-wider uppercase">
              Bestseller
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="px-2.5 py-1 bg-accent text-primary text-[9px] font-bold tracking-wider uppercase">
              Save {product.discountPercentage}%
            </span>
          )}
          {product.requiresPrescription && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
              <ClipboardList size={10} /> Rx Required
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2.5 py-1 bg-gray-400 text-white text-[9px] font-bold tracking-wider uppercase">
              Out of stock
            </span>
          )}
          {product.stock > 0 && product.stock <= product.lowStockThreshold && (
            <span className="px-2.5 py-1 bg-orange-500 text-white text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
              <ShieldAlert size={10} /> Low Stock
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm border border-beige hover:bg-white hover:text-red-500 transition duration-300 rounded-full cursor-pointer text-gray-400"
        >
          <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Image Display */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-beige">
          <img
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Quick Buttons Hover Overlay */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleOpenQuickView}
              className="p-3 bg-white text-primary hover:bg-accent hover:text-primary transition duration-300 rounded-full shadow-md cursor-pointer"
              title="Quick View"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className={`p-3 rounded-full shadow-md transition duration-300 cursor-pointer ${
                product.stock === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-accent hover:text-primary'
              }`}
              title="Add to Cart"
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">
              {product.brand}
            </span>
            <h3 className="font-serif text-sm text-primary font-medium line-clamp-2 min-h-[40px] group-hover:text-accent transition duration-300">
              {product.name}
            </h3>
            
            {/* Reviews display */}
            <div className="flex items-center gap-1.5 pt-1">
              <RatingStars rating={product.rating} size={12} />
              <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount})</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-beige mt-3">
            <div className="flex flex-col">
              {discountPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-primary">₹{discountPrice}</span>
                  <span className="text-xs text-gray-400 line-through">₹{price}</span>
                </div>
              ) : (
                <span className="text-sm font-bold text-primary">₹{price}</span>
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
              {product.petType === 'dogs' ? 'For Dogs' :
               product.petType === 'birds' ? 'For Birds' :
               product.petType === 'reptiles' ? 'For Reptiles' :
               product.petType === 'fish' ? 'For Aquatics' : 'Pharmacy'}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setQuickViewOpen(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>
          
          <div className="relative bg-secondary w-full max-w-3xl border border-beige shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
            <button 
              onClick={() => setQuickViewOpen(false)}
              className="absolute top-4 right-4 p-1 bg-white border border-beige hover:bg-gray-100 rounded-full z-20 cursor-pointer"
            >
              <X size={18} className="text-primary" />
            </button>

            {/* Left Image Pane */}
            <div className="w-full md:w-1/2 aspect-square bg-gray-50 border-r border-beige">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Right Information Pane */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                  {product.brand}
                </span>
                <h2 className="font-serif text-lg text-primary font-medium mt-1 mb-2">
                  {product.name}
                </h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <RatingStars rating={product.rating} size={14} />
                  <span className="text-xs text-gray-500 font-medium">({product.reviewCount} customer reviews)</span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  {discountPrice ? (
                    <>
                      <span className="text-xl font-bold text-primary">₹{discountPrice}</span>
                      <span className="text-sm text-gray-400 line-through">₹{price}</span>
                      <span className="text-xs text-red-600 font-bold">({product.discountPercentage}% OFF)</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-primary">₹{price}</span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-4">
                  {product.description}
                </p>

                {/* Stock status indicator */}
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-4">
                  <span className="text-gray-400">Stock Status:</span>
                  {product.stock === 0 ? (
                    <span className="text-red-500 uppercase">Out of stock</span>
                  ) : (
                    <span className="text-green-600 uppercase flex items-center gap-1">
                      <Check size={14} /> {product.stock} items left
                    </span>
                  )}
                </div>

                {product.requiresPrescription && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs mb-4 flex items-start gap-2">
                    <ClipboardList size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Prescription Required</p>
                      <p className="text-[10px]">Veterinary verification is mandatory for this purchase.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Cart Actions */}
              <div className="pt-4 border-t border-beige flex gap-3 items-center">
                <div className="flex items-center border border-beige">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 font-semibold text-primary text-sm">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleQuickViewAddToCart}
                  disabled={product.stock === 0}
                  className="flex-grow btn-premium py-2.5 text-xs text-center justify-center gap-2"
                >
                  <ShoppingBag size={16} /> ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
