import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Share2 } from 'lucide-react';
import { addToCartAPI } from '../store/slices/cartSlice.js';
import { toggleWishlistAPI } from '../store/slices/wishlistSlice.js';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);

  const handleRemove = (product) => {
    dispatch(toggleWishlistAPI(product));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (product) => {
    if (product.requiresPrescription) {
      toast('Prescription required! Redirecting to details...', { icon: '📝' });
      navigate(`/product/${product.slug}`);
      return;
    }
    dispatch(addToCartAPI({ product, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleShareWishlist = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Wishlist link copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12 pb-20">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-beige pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">SAVED COLLECTION</span>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1">My Wishlist</h1>
        </div>
        
        {items.length > 0 && (
          <button
            onClick={handleShareWishlist}
            className="px-4 py-2 border border-beige hover:border-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 size={14} /> SHARE WISHLIST
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-white border border-beige h-[380px] animate-pulse"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-beige max-w-xl mx-auto space-y-6 shadow-sm">
          <Heart size={48} className="mx-auto text-gray-300 animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-primary">Your wishlist is empty</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              Create a personalized collection of premium food, habitats, and trace vitamins you love.
            </p>
          </div>
          <button 
            onClick={() => navigate('/shop')} 
            className="btn-premium py-2 text-xs"
          >
            DISCOVER COLLECTION
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const productPrice = product.discountPrice || product.price;
            return (
              <div 
                key={product._id}
                className="card-premium relative bg-white flex flex-col justify-between h-[380px]"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(product)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 rounded-full cursor-pointer shadow-sm border border-beige"
                  title="Remove Item"
                >
                  <Trash2 size={14} />
                </button>

                {/* Image */}
                <div 
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="relative aspect-square overflow-hidden bg-gray-50 border-b border-beige cursor-pointer"
                >
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">{product.brand}</span>
                    <h4 
                      onClick={() => navigate(`/product/${product.slug}`)}
                      className="font-serif text-xs font-semibold text-primary truncate cursor-pointer hover:text-accent mt-0.5"
                    >
                      {product.name}
                    </h4>
                    <span className="text-xs font-bold text-primary block mt-1">
                      ₹{productPrice}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full btn-premium py-2 text-[10px] tracking-widest uppercase flex items-center justify-center gap-1.5 mt-4"
                  >
                    <ShoppingBag size={12} /> ADD TO CART
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Wishlist;
