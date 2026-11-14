import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Gift, 
  CreditCard,
  PawPrint,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { 
  removeFromCartAPI, 
  updateCartQuantityAPI, 
  applyCouponCode, 
  removeCoupon,
  fetchCart,
  getCartItemIdStr
} from '../../store/slices/cartSlice.js';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pricing, appliedCoupon, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (productId, currentQty, delta, maxStock = 999) => {
    const effectiveStock = typeof maxStock === 'number' && maxStock > 0 ? maxStock : 999;
    if (delta > 0 && currentQty >= effectiveStock) {
      toast.error(`Only ${effectiveStock} unit${effectiveStock === 1 ? '' : 's'} available.`);
      return;
    }
    const newQty = currentQty + delta;
    if (newQty > effectiveStock) {
      toast.error(`Only ${effectiveStock} unit${effectiveStock === 1 ? '' : 's'} available.`);
      return;
    }
    if (newQty >= 1) {
      dispatch(updateCartQuantityAPI({ productId, quantity: Math.min(effectiveStock, newQty) }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCartAPI(productId));
    toast.success('Item removed from cart.');
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage('');
    
    const result = await dispatch(applyCouponCode(couponCode.trim()));
    if (applyCouponCode.fulfilled.match(result)) {
      setCouponMessage('Promo code applied successfully!');
      setCouponCode('');
    } else {
      setCouponMessage(result.payload || 'Failed to apply promo code.');
    }
  };

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    const overstockItem = items.find(item => {
      const stock = typeof item.product?.stock === 'number' 
        ? item.product.stock 
        : (item.product?.stock !== undefined && !isNaN(Number(item.product.stock)) ? Number(item.product.stock) : 999);
      return item.quantity > stock;
    });

    if (overstockItem) {
      const available = typeof overstockItem.product?.stock === 'number' ? overstockItem.product.stock : 0;
      toast.error(`"${overstockItem.product?.name || 'Item'}" quantity (${overstockItem.quantity}) exceeds available stock (${available}). Please adjust quantity before checkout.`);
      return;
    }

    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'cart' }
        })
      );
      return;
    }

    try {
      sessionStorage.removeItem('joshpetshub_buynow_item');
      sessionStorage.removeItem('joshpetshub_buynow_active');
    } catch (_) {}
    navigate('/checkout', { state: { isBuyNow: false } });
  };

  // Free shipping threshold = ₹999
  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (pricing.subtotal / freeShippingThreshold) * 100);
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - pricing.subtotal);

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight size={14} />
          <span className="text-primary font-bold">Shopping Cart</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-3">
              <ShoppingBag className="text-accent" size={28} />
              Shopping Cart
              <span className="text-sm font-sans font-bold bg-primary text-accent px-2.5 py-0.5 rounded-full ml-1">
                {items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)} items
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Review and manage your selected pets, food, accessories, and veterinary care products.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-accent tracking-wider uppercase transition self-start sm:self-auto"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white border border-beige rounded-2xl p-8 sm:p-16 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-5 text-primary">
              <ShoppingBag size={38} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-8">
              Looks like you haven't added anything to your cart yet. Explore our verified pedigree pets, veterinary-grade nutrition, and premium pet care accessories.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/shop" 
                className="py-3 px-6 bg-primary text-white font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-primary-light transition shadow-sm inline-flex items-center justify-center gap-2"
              >
                Browse Shop <ArrowRight size={14} />
              </Link>
              <Link 
                to="/pets" 
                className="py-3 px-6 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs tracking-widest uppercase rounded-xl transition shadow-sm inline-flex items-center justify-center gap-2"
              >
                <PawPrint size={14} /> Explore Pets
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Shipping Notification Banner */}
              <div className="bg-white border border-beige p-4 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-2 text-primary font-bold">
                    <Truck size={16} className="text-accent" />
                    {pricing.subtotal >= freeShippingThreshold 
                      ? 'FREE SHIPPING UNLOCKED!' 
                      : `Add ₹${neededForFreeShipping} more for FREE shipping`}
                  </span>
                  <span className="text-gray-500 font-mono">
                    {pricing.subtotal >= freeShippingThreshold 
                      ? '₹0 Delivery' 
                      : `Target: ₹${freeShippingThreshold}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-accent h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white border border-beige rounded-2xl shadow-xs divide-y divide-gray-100 overflow-hidden">
                {items.map((item) => {
                  const pId = getCartItemIdStr(item);
                  const isPet = Boolean(
                    item.product?.isPet || item.product?.petType || item.product?.breed || 
                    item.product?.itemType === 'pet' || item.product?.itemType === 'adoption'
                  );
                  const pStock = isPet 
                    ? 1 
                    : (typeof item.product?.stock === 'number'
                        ? Math.max(0, item.product.stock)
                        : (item.product?.stock !== undefined && item.product?.stock !== null && !isNaN(Number(item.product.stock))
                            ? Math.max(0, Number(item.product.stock))
                            : 999));
                  const originalPrice = Number(item.product?.price ?? item.product?.fee ?? 0) || 0;
                  const productPrice = item.product?.discountPrice !== null && item.product?.discountPrice !== undefined
                    ? Number(item.product.discountPrice)
                    : (item.product?.discount_price !== null && item.product?.discount_price !== undefined
                      ? Number(item.product.discount_price)
                      : originalPrice);
                  const hasDiscount = (item.product?.discountPrice || item.product?.discount_price) && productPrice < originalPrice;
                  const itemImage = item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800';

                  return (
                    <div 
                      key={pId} 
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-gray-50/60"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <img 
                          src={itemImage} 
                          alt={item.product?.name || 'Item'} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800';
                          }}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-50 border border-beige shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                              {item.product?.brand || (isPet ? 'Verified Pet' : 'Josh Pets Hub')}
                            </span>
                            {isPet && (
                              <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <PawPrint size={10} /> Live Pet
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-primary truncate max-w-sm">
                            {item.product?.name || item.product?.title || 'Product'}
                          </h3>

                          {item.product?.breed && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Breed: <span className="font-semibold text-gray-700">{item.product.breed}</span>
                            </p>
                          )}

                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-primary">
                              ₹{productPrice.toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        
                        {/* Quantity Controls */}
                        {!isPet ? (
                          <div className="flex items-center border border-beige rounded-lg bg-white shadow-2xs">
                            <button 
                              onClick={() => handleQuantityChange(pId, item.quantity, -1, pStock)}
                              disabled={item.quantity <= 1}
                              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-l-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 text-xs font-bold text-primary min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(pId, item.quantity, 1, pStock)}
                              disabled={item.quantity >= pStock}
                              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-r-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={item.quantity >= pStock ? `Max stock (${pStock}) reached` : 'Increase quantity'}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            Qty: 1 (Individual Pet)
                          </span>
                        )}

                        {/* Item Total Price */}
                        <div className="text-right min-w-[90px]">
                          <span className="font-black text-sm sm:text-base text-primary block">
                            ₹{(productPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Remove Action Button */}
                        <button 
                          onClick={() => handleRemove(pId)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Remove from Cart"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Secure Checkout Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-beige flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">100% Genuine Care</h4>
                    <p className="text-[10px] text-gray-500">Verified breeders & products</p>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-beige flex items-center gap-3">
                  <Truck size={20} className="text-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Safe Delivery</h4>
                    <p className="text-[10px] text-gray-500">Express nationwide transit</p>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-beige flex items-center gap-3">
                  <CreditCard size={20} className="text-accent shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Secure Payments</h4>
                    <p className="text-[10px] text-gray-500">Cards, UPI & Cash on Delivery</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Checkout */}
            <div className="lg:col-span-4 space-y-4">
              
              <div className="bg-white border border-beige rounded-2xl p-6 shadow-xs space-y-5">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-3">
                  Order Summary
                </h2>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow px-3 py-2 border border-beige rounded-lg text-xs uppercase tracking-wider focus:outline-none focus:border-primary font-mono"
                    />
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-primary text-white text-xs font-bold tracking-wider rounded-lg hover:bg-primary-light cursor-pointer uppercase transition"
                    >
                      APPLY
                    </button>
                  </div>
                  {couponMessage && (
                    <p className="text-[11px] font-semibold text-accent">{couponMessage}</p>
                  )}
                </form>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs bg-accent/10 text-primary p-2.5 rounded-lg border border-accent/20">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Gift size={14} className="text-accent" /> Coupon {appliedCoupon.code} applied!
                    </span>
                    <button 
                      onClick={() => dispatch(removeCoupon())} 
                      className="text-primary hover:text-red-600 underline text-[10px] uppercase font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Pricing Line Items */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-accent font-bold">
                      <span>Promo Discount</span>
                      <span>-₹{pricing.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax (18% GST)</span>
                    <span className="font-medium">₹{pricing.tax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee</span>
                    <span className={`font-bold ${pricing.shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {pricing.shipping === 0 ? 'FREE' : `₹${pricing.shipping}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-primary border-t border-beige pt-3">
                    <span>Total Amount</span>
                    <span className="text-lg">₹{pricing.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-primary text-white font-bold text-xs tracking-widest hover:bg-primary-light rounded-xl transition duration-300 uppercase shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard size={16} /> PROCEED TO CHECKOUT
                </button>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  Taxes and shipping fees calculated at checkout. Safe & encrypted 256-bit payment gateway.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;

