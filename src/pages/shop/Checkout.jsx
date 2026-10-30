import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, CircleCheck, ChevronRight, ShoppingBag, ClipboardList, Download, Zap } from 'lucide-react';
import { clearCartAPI, calculateTotals } from '../../store/slices/cartSlice.js';
import { fetchProducts } from '../../store/slices/productSlice.js';
import { apiRequest } from '../../services/api.js';
import { downloadBill } from '../../utils/billGenerator.js';
import { openAuthModal } from '../../store/slices/authSlice.js';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items: cartItems, pricing: cartPricing, appliedCoupon } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Check if this is a direct "Buy Now" checkout vs standard cart checkout
  const isBuyNow = Boolean(
    location.state?.isBuyNow || 
    location.state?.buyNowItem ||
    (sessionStorage.getItem('joshpetshub_buynow_active') === 'true' && sessionStorage.getItem('joshpetshub_buynow_item'))
  );

  const buyNowItem = useMemo(() => {
    if (location.state?.buyNowItem) {
      return location.state.buyNowItem;
    }
    if (isBuyNow) {
      try {
        const saved = sessionStorage.getItem('joshpetshub_buynow_item');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return null;
  }, [location.state, isBuyNow]);

  // Determine active checkout items and pricing
  const items = useMemo(() => {
    if (isBuyNow && buyNowItem?.product) {
      return [buyNowItem];
    }
    return cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const pricing = useMemo(() => {
    if (isBuyNow && buyNowItem?.product) {
      return calculateTotals([buyNowItem], appliedCoupon);
    }
    return cartPricing;
  }, [isBuyNow, buyNowItem, appliedCoupon, cartPricing]);

  // Stepper state
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [prescriptionId, setPrescriptionId] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'checkout-page' }
        })
      );
    }
  }, [isAuthenticated, dispatch]);

  // Load user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || '');
      if (user.addresses && user.addresses.length > 0) {
        const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setPhone(def.phone || '');
        setStreetAddress(def.streetAddress || '');
        setCity(def.city || '');
        setState(def.state || '');
        setPostalCode(def.postalCode || '');
      }
      // Look for latest prescription if any pharmacy items exist
      const hasRxItems = items.some(i => i.product.requiresPrescription || i.product.requires_prescription);
      if (hasRxItems && user.prescriptionHistory && user.prescriptionHistory.length > 0) {
        // Take the latest prescription ID
        setPrescriptionId(user.prescriptionHistory[user.prescriptionHistory.length - 1]);
      }
    }
  }, [isAuthenticated, user, items]);

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-20 flex flex-col items-center justify-center space-y-4">
        <ShoppingBag size={48} className="text-gray-300" />
        <h2 className="font-serif text-lg text-primary">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-premium py-2 text-xs">
          BACK TO SHOP
        </button>
      </div>
    );
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !phone || !streetAddress || !city || !state || !postalCode) {
        toast.error('Please fill in all shipping details.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    
    // Check if prescription required and missing
    const hasRx = items.some(i => i.product.requiresPrescription || i.product.requires_prescription);
    if (hasRx && !prescriptionId) {
      toast.error('A veterinary prescription is required for pharmacy items. Please upload one first.');
      setPlacingOrder(false);
      return;
    }

    const orderPayload = {
      orderItems: items.map(item => ({
        product: item.product._id || item.product.id,
        name: item.product.name,
        price: item.product.discountPrice ?? item.product.discount_price ?? item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || item.product.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'
      })),
      shippingAddress: {
        name,
        phone,
        streetAddress,
        city,
        state,
        postalCode,
        country: 'India'
      },
      paymentMethod,
      pricing: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shipping: pricing.shipping,
        tax: pricing.tax,
        total: pricing.total
      },
      prescriptionId: prescriptionId || undefined
    };

    try {
      // Allow Guest Checkout to hit the backend API (since backend now supports it)
      if (paymentMethod !== 'Cash on Delivery') {
        toast('Opening Payment Gateway...', { icon: '💳' });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate gateway latency
        orderPayload.transactionId = `PAY-${Date.now()}`;
      }

      const data = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (data.success) {
        setConfirmedOrder(data.order);
        if (isBuyNow) {
          try {
            sessionStorage.removeItem('joshpetshub_buynow_item');
            sessionStorage.removeItem('joshpetshub_buynow_active');
          } catch (_) {}
        } else {
          dispatch(clearCartAPI());
        }
        // Sync products stock to reflect purchases immediately
        dispatch(fetchProducts());
        setStep(4);
        toast.success('Order placed successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Order creation failed.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-accent font-bold flex items-center justify-center gap-1">
          {isBuyNow ? (
            <>
              <Zap size={13} className="text-amber-500 fill-amber-500" /> DIRECT INSTANT CHECKOUT
            </>
          ) : (
            'SECURE CHECKOUT'
          )}
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-primary">
          {isBuyNow ? 'Instant Buy Checkout' : 'Checkout Wizard'}
        </h1>
        {isBuyNow && (
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Directly purchasing this item without adding it to your shopping cart.
          </p>
        )}
      </div>

      {/* Stepper Steps Indicators */}
      <div className="max-w-xl mx-auto flex justify-between items-center text-xs font-semibold text-gray-400">
        <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-primary font-bold' : ''}`}>
          <span className={`w-5 h-5 flex items-center justify-center border rounded-full ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>1</span>
          <span>Address</span>
        </div>
        <ChevronRight size={14} />
        <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-primary font-bold' : ''}`}>
          <span className={`w-5 h-5 flex items-center justify-center border rounded-full ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>2</span>
          <span>Delivery</span>
        </div>
        <ChevronRight size={14} />
        <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-primary font-bold' : ''}`}>
          <span className={`w-5 h-5 flex items-center justify-center border rounded-full ${step >= 3 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>3</span>
          <span>Payment</span>
        </div>
      </div>

      {step === 4 && confirmedOrder ? (
        // STEP 4: ORDER CONFIRMED VIEW
        <div className="max-w-2xl mx-auto bg-white border border-beige p-8 text-center space-y-6 shadow-sm">
          <CircleCheck size={56} className="mx-auto text-green-600 animate-bounce" />
          <h2 className="font-serif text-xl font-bold text-primary">Your order is confirmed!</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Thank you for shopping at Josh Pets Hub. Your order has been registered under ID <strong>{confirmedOrder._id}</strong>. We sent a receipt to your registered email address.
          </p>

          <div className="border-t border-b border-beige py-4 text-xs space-y-2 max-w-md mx-auto text-left">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Tracking Number:</span>
              <span className="font-bold text-primary">{confirmedOrder.trackingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Shipping Status:</span>
              <span className="font-bold text-accent uppercase">{confirmedOrder.shippingStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Total Paid Amount:</span>
              <span className="font-bold text-primary">₹{confirmedOrder.pricing.total}</span>
            </div>
            {confirmedOrder.prescriptionId && (
              <div className="flex justify-between text-red-600 font-semibold bg-red-50 p-2 border border-red-200 mt-2">
                <span className="flex items-center gap-1"><ClipboardList size={14} /> PRESCRIPTION STATUS:</span>
                <span>UNDER PHARMACIST REVIEW</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 pt-4">
            <button
              onClick={() => {
                const total = confirmedOrder.pricing?.total || 0;
                const base = Number((total / 1.18).toFixed(2));
                downloadBill({
                  invoiceNumber: confirmedOrder.trackingNumber || `ORD-${confirmedOrder._id?.slice(-8)}`,
                  invoiceTitle: 'TAX INVOICE / ORDER RECEIPT',
                  statusText: '✓ PAYMENT COMPLETED',
                  customer: {
                    name: confirmedOrder.shippingAddress?.fullName || name || user?.name || 'Customer',
                    email: user?.email || '',
                    phone: confirmedOrder.shippingAddress?.phone || phone || user?.mobile || '',
                    address: `${confirmedOrder.shippingAddress?.streetAddress || streetAddress || ''}, ${confirmedOrder.shippingAddress?.city || city || ''} ${confirmedOrder.shippingAddress?.postalCode || postalCode || ''}`,
                  },
                  payment: {
                    method: 'Prepaid Online',
                    validity: `Tracking: ${confirmedOrder.trackingNumber}`,
                  },
                  items: (confirmedOrder.orderItems || []).map((it) => ({
                    name: it.name,
                    quantity: it.quantity || 1,
                    sacOrHsn: 'HSN: 2309',
                    amount: (it.price || 0) * (it.quantity || 1),
                  })),
                  totals: {
                    baseAmount: base,
                    cgst: Number((base * 0.09).toFixed(2)),
                    sgst: Number((base * 0.09).toFixed(2)),
                    total: total,
                  }
                });
                toast.success('Payment bill downloaded successfully');
              }}
              className="px-5 py-2.5 bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Download size={13} />
              <span>Download Payment Bill</span>
            </button>
            <button onClick={() => navigate('/shop')} className="btn-premium py-2 text-xs">
              CONTINUE SHOPPING
            </button>
            {isAuthenticated && (
              <button onClick={() => navigate('/account')} className="btn-secondary-premium py-2 text-xs">
                MY PROFILE
              </button>
            )}
          </div>
        </div>
      ) : (
        // ACTIVE STEP WIZARD
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Columns */}
          <div className="lg:col-span-8 bg-white border border-beige p-6 md:p-8 shadow-sm space-y-6">
            {step === 1 && (
              // Step 1: Address
              <div className="space-y-4">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2 flex items-center gap-2">
                  <Truck size={18} className="text-accent" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-semibold block">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-semibold block">Phone Number *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Street Address *</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-semibold block">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-semibold block">State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-semibold block">Postal Code *</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <button onClick={handleNextStep} className="w-full btn-premium py-2.5 text-xs">
                  CONTINUE TO DELIVERY
                </button>
              </div>
            )}

            {step === 2 && (
              // Step 2: Delivery options
              <div className="space-y-4">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2 flex items-center gap-2">
                  <Truck size={18} className="text-accent" /> Delivery Options
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-primary bg-secondary cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="radio" checked readOnly className="text-primary focus:ring-0" />
                      <div className="text-xs">
                        <p className="font-bold text-primary">Standard Home Delivery (3-5 business days)</p>
                        <p className="text-gray-400">Insured express packaging for feed safety</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {pricing.subtotal >= 999 ? 'FREE' : '₹99'}
                    </span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={handlePrevStep} className="btn-secondary-premium py-2.5 text-xs flex-grow">
                    BACK
                  </button>
                  <button onClick={handleNextStep} className="btn-premium py-2.5 text-xs flex-grow">
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              // Step 3: Payment
              <div className="space-y-4">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2 flex items-center gap-2">
                  <CreditCard size={18} className="text-accent" /> Select Payment Method
                </h2>

                <div className="space-y-3">
                  {['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'].map((method) => (
                    <label 
                      key={method}
                      className={`flex items-center gap-3 p-4 border cursor-pointer text-xs font-semibold ${
                        paymentMethod === method ? 'border-primary bg-secondary text-primary' : 'border-beige text-gray-500 hover:border-primary'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="text-primary focus:ring-0" 
                      />
                      <span>{method === 'Credit Card' || method === 'Debit Card' ? `${method} / Razorpay Secure` : method}</span>
                    </label>
                  ))}
                </div>

                {/* Prescription Warning inside checkout if Rx is present */}
                {items.some(i => i.product.requiresPrescription) && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[11px] space-y-1.5">
                    <p className="font-bold flex items-center gap-1"><ClipboardList size={14} /> PRESCRIPTION WARNING</p>
                    <p>Some items in your cart require a veterinary prescription. We matched your profile with prescription verification ID: <strong>{prescriptionId || 'None Found (Upload needed)'}</strong>.</p>
                    {!prescriptionId && (
                      <button 
                        onClick={() => navigate('/pharmacy')}
                        className="text-red-700 underline font-bold"
                      >
                        Click here to upload your prescription first.
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button onClick={handlePrevStep} className="btn-secondary-premium py-2.5 text-xs flex-grow">
                    BACK
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="btn-premium py-2.5 text-xs flex-grow uppercase"
                  >
                    {placingOrder ? 'PROCESSING PAYMENT...' : `PLACE ORDER (₹${pricing.total})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Summary (Right 4 Columns) */}
          <div className="lg:col-span-4 bg-white border border-beige p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-bold text-primary border-b border-beige pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              {isBuyNow && (
                <span className="text-[10px] font-sans font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Instant Buy
                </span>
              )}
            </h3>
            
            {/* Products brief list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.map((item, idx) => {
                const pId = item.product._id || item.product.id || idx;
                const imgSrc = (item.product.images && item.product.images[0]) || item.product.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800';
                return (
                  <div key={pId} className="flex gap-3 text-xs">
                    <img src={imgSrc} alt={item.product.name} className="w-12 h-12 object-cover bg-gray-50 border border-beige" />
                    <div className="flex-grow">
                      <p className="font-semibold text-primary truncate max-w-[150px]">{item.product.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-primary">
                      ₹{(item.product.discountPrice || item.product.price) * item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-beige pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{pricing.subtotal}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Promo Discount</span>
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
                <span>Grand Total</span>
                <span>₹{pricing.total}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Checkout;
