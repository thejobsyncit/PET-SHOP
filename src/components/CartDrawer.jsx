import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, Gift, Truck } from 'lucide-react';
import { 
  removeFromCartAPI, 
  updateCartQuantityAPI, 
  applyCouponCode, 
  removeCoupon 
} from '../store/slices/cartSlice.js';

const CartDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pricing, appliedCoupon, error } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  if (!isOpen) return null;

  const handleQuantityChange = (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      dispatch(updateCartQuantityAPI({ productId, quantity: newQty }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCartAPI(productId));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage('');
    
    const result = await dispatch(applyCouponCode(couponCode));
    if (applyCouponCode.fulfilled.match(result)) {
      setCouponMessage('Promo code applied!');
      setCouponCode('');
    } else {
      setCouponMessage(result.payload || 'Failed to apply coupon.');
    }
  };

  // Free shipping progress calculation (threshold = 999)
  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (pricing.subtotal / freeShippingThreshold) * 100);
  const neededForFreeShipping = freeShippingThreshold - pricing.subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-secondary flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-6 bg-primary text-white flex justify-between items-center border-b border-white/10">
            <h2 className="font-serif text-xl tracking-wider text-accent flex items-center gap-2">
              <ShoppingBag size={20} /> SHOPPING CART ({items.length})
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 text-white cursor-pointer">
              <X size={24} />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-grow overflow-y-auto px-6 py-4">
            {/* Free Shipping Progress Indicator */}
            {items.length > 0 && (
              <div className="mb-6 p-4 bg-white border border-beige shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Truck size={14} /> 
                    {pricing.subtotal >= freeShippingThreshold 
                      ? 'FREE SHIPPING UNLOCKED!' 
                      : 'FREE SHIPPING TARGET'}
                  </span>
                  <span className="text-gray-500">
                    {pricing.subtotal >= freeShippingThreshold 
                      ? '₹0' 
                      : `Add ₹${neededForFreeShipping} more`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-accent h-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                {pricing.subtotal < freeShippingThreshold && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    Add ₹{neededForFreeShipping} more to unlock free delivery (saves ₹99).
                  </p>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex justify-center items-center mb-4 text-primary">
                  <ShoppingBag size={36} />
                </div>
                <h3 className="font-serif text-lg text-primary mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Fill it with our premium health supplements, organic food, and habitat essentials.
                </p>
                <button 
                  onClick={() => { onClose(); navigate('/shop'); }}
                  className="btn-premium"
                >
                  SHOP NOW
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const productPrice = item.product.discountPrice || item.product.price;
                  return (
                    <div 
                      key={item.product._id} 
                      className="flex bg-white border border-beige p-3 shadow-sm hover:shadow-md transition duration-300"
                    >
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-20 h-20 object-cover bg-gray-50 border border-beige"
                      />
                      <div className="ml-4 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">
                                {item.product.brand}
                              </span>
                              <h4 className="text-xs font-semibold text-primary truncate max-w-[180px]">
                                {item.product.name}
                              </h4>
                            </div>
                            <button 
                              onClick={() => handleRemove(item.product._id)}
                              className="text-gray-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-primary mt-1 block">
                            ₹{productPrice} 
                            {item.product.discountPrice && (
                              <span className="text-[10px] text-gray-400 line-through ml-2 font-normal">
                                ₹{item.product.price}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Quantity trigger */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-beige">
                            <button 
                              onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 py-1 text-xs font-semibold text-primary">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-primary">
                            ₹{productPrice * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Calculations */}
          {items.length > 0 && (
            <div className="bg-white border-t border-beige p-6 space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow px-3 py-2 border border-beige text-xs uppercase tracking-wider focus:outline-none focus:border-primary"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white text-xs tracking-widest hover:bg-primary-light cursor-pointer uppercase"
                >
                  APPLY
                </button>
              </form>
              
              {/* Coupon message */}
              {couponMessage && (
                <p className="text-[11px] font-semibold text-accent">{couponMessage}</p>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-accent/10 text-primary p-2 border border-accent/20">
                  <span className="flex items-center gap-1 font-semibold">
                    <Gift size={14} /> Coupon {appliedCoupon.code} applied!
                  </span>
                  <button 
                    onClick={() => dispatch(removeCoupon())} 
                    className="text-primary hover:text-red-500 underline text-[10px] uppercase font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Invoice calculation summary */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{pricing.subtotal}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-accent font-semibold">
                    <span>Discount</span>
                    <span>-₹{pricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Estimated Tax (18% GST)</span>
                  <span>₹{pricing.tax}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{pricing.shipping === 0 ? 'FREE' : `₹${pricing.shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary border-t border-beige pt-3">
                  <span>Total Amount</span>
                  <span>₹{pricing.total}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 bg-primary text-white font-medium text-xs tracking-widest hover:bg-primary-light transition duration-300 uppercase cursor-pointer"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
