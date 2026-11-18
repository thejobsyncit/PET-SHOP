import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, CircleCheck, ChevronRight, ShoppingBag, ClipboardList, Download, Zap, AlertCircle, Tag, Check, X, Sparkles } from 'lucide-react';
import { clearCartAPI, calculateTotals, applyCouponCode, removeCoupon } from '../../store/slices/cartSlice.js';
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
    return calculateTotals(items, appliedCoupon);
  }, [isBuyNow, buyNowItem, items, appliedCoupon]);

  // Check if any checkout item exceeds actual available stock
  const overstockItem = useMemo(() => {
    return items.find(item => {
      const stock = typeof item.product?.stock === 'number'
        ? item.product.stock
        : (item.product?.stock !== undefined && item.product?.stock !== null && !isNaN(Number(item.product.stock)) ? Number(item.product.stock) : 999);
      return (Number(item.quantity) || 1) > stock;
    });
  }, [items]);

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

  // Coupon / Offer code state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Load available active coupons for quick-suggestion pills
  useEffect(() => {
    apiRequest('/coupons')
      .then((res) => {
        if (res && res.success && Array.isArray(res.coupons)) {
          setAvailableCoupons(res.coupons.filter(c => c.isActive !== false));
        }
      })
      .catch(() => {});
  }, []);

  const handleApplyOfferCode = async (rawCode) => {
    const code = (typeof rawCode === 'string' ? rawCode : couponInput || '').trim();
    if (!code) {
      setCouponError('Please enter an offer code.');
      return;
    }
    setCouponError('');
    setIsApplyingCoupon(true);
    try {
      const activeSubtotal = pricing.subtotal;
      const res = await dispatch(applyCouponCode({ code, cartTotal: activeSubtotal })).unwrap();
      const disc = res.calculatedDiscount !== undefined ? res.calculatedDiscount : (res.discountValue || 0);
      toast.success(`🎉 Offer code "${res.code}" applied! You save ₹${disc}.`, {
        icon: '🏷️',
        id: 'checkout-coupon-success'
      });
      setCouponInput('');
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.message || 'Invalid or inapplicable offer code.');
      setCouponError(msg);
      toast.error(msg, { id: 'checkout-coupon-error' });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveOfferCode = () => {
    dispatch(removeCoupon());
    setCouponError('');
    toast('Offer code removed', { icon: 'ℹ️' });
  };

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
        setPhone((def.phone || '').replace(/\D/g, '').slice(0, 10));
        setStreetAddress(def.streetAddress || '');
        setCity(def.city || '');
        setState(def.state || '');
        setPostalCode((def.postalCode || '').replace(/\D/g, '').slice(0, 6));
      } else if (user.phone || user.mobile) {
        setPhone((user.phone || user.mobile || '').replace(/\D/g, '').slice(0, 10));
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
    if (overstockItem) {
      toast.error(`Cannot proceed: "${overstockItem.product?.name || 'Item'}" quantity (${overstockItem.quantity}) exceeds available stock (${overstockItem.product?.stock ?? 0}).`);
      return;
    }
    if (step === 1) {
      if (!name || !phone || !streetAddress || !city || !state || !postalCode) {
        toast.error('Please fill in all shipping details.');
        return;
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        toast.error('Please enter a valid 10-digit numerical phone number.');
        return;
      }
      const cleanPostal = (postalCode || '').replace(/\D/g, '');
      if (cleanPostal.length !== 6) {
        toast.error('Please enter a valid 6-digit numerical pincode.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    if (overstockItem) {
      toast.error(`Cannot place order: "${overstockItem.product?.name || 'Item'}" quantity (${overstockItem.quantity}) exceeds available stock (${overstockItem.product?.stock ?? 0}).`);
      return;
    }
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
      couponCode: appliedCoupon?.code || undefined,
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
            {confirmedOrder.pricing?.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Tag size={13} /> Offer Discount ({confirmedOrder.couponCode || appliedCoupon?.code || 'Promo'}):
                </span>
                <span>-₹{confirmedOrder.pricing.discount}</span>
              </div>
            )}
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
                const discount = confirmedOrder.pricing?.discount || pricing.discount || 0;
                const base = Number((total / 1.18).toFixed(2));
                downloadBill({
                  invoiceNumber: confirmedOrder.trackingNumber || (confirmedOrder._id ? `ORD-${String(confirmedOrder._id).slice(-8)}` : `ORD-${Date.now().toString().slice(-8)}`),
                  invoiceTitle: 'TAX INVOICE / ORDER RECEIPT',
                  invoiceDate: confirmedOrder.createdAt ? new Date(confirmedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                  statusText: '✓ PAYMENT COMPLETED',
                  customer: {
                    name: confirmedOrder.shippingAddress?.fullName || name || user?.name || 'Customer',
                    email: user?.email || '',
                    phone: confirmedOrder.shippingAddress?.phone || phone || user?.mobile || '',
                    address: `${confirmedOrder.shippingAddress?.streetAddress || streetAddress || ''}, ${confirmedOrder.shippingAddress?.city || city || ''} ${confirmedOrder.shippingAddress?.postalCode || postalCode || ''}`,
                  },
                  payment: {
                    method: confirmedOrder.paymentMethod || paymentMethod || 'Prepaid Online',
                    validity: `Tracking: ${confirmedOrder.trackingNumber || 'Active'}`,
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
                    discount: discount,
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
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                          !e.ctrlKey && !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasteData = (e.clipboardData || window.clipboardData).getData('text') || '';
                        const clean = pasteData.replace(/\D/g, '').slice(0, 10);
                        setPhone(clean);
                      }}
                      placeholder="10-digit mobile number"
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
                    <label className="text-xs text-gray-500 font-semibold block">Pincode / Postal Code *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={postalCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPostalCode(val);
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                          !e.ctrlKey && !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasteData = (e.clipboardData || window.clipboardData).getData('text') || '';
                        const clean = pasteData.replace(/\D/g, '').slice(0, 6);
                        setPostalCode(clean);
                      }}
                      placeholder="6-digit pincode"
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

                {/* Offer Status Banner right above payment method */}
                {appliedCoupon ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">
                          Offer Code Applied: <span className="font-mono uppercase">{appliedCoupon.code}</span>
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          {pricing.discount > 0 ? `₹${pricing.discount} has been discounted from your payable total!` : 'Discount applied to this order'}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md text-xs">
                      FINAL: ₹{pricing.total}
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 text-amber-900 text-xs rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-amber-600 shrink-0" />
                      <span>
                        Have an offer code? Apply <strong>PAWFIRST</strong> for 15% OFF your order.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyOfferCode('PAWFIRST')}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs active:scale-95"
                    >
                      Apply PAWFIRST (15% OFF)
                    </button>
                  </div>
                )}

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
                    className="btn-premium py-2.5 text-xs flex-grow uppercase font-black tracking-wider"
                  >
                    {placingOrder ? 'PROCESSING PAYMENT...' : `PLACE ORDER (₹${pricing.total})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Summary (Right 4 Columns) */}
          <div className="lg:col-span-4 bg-white border border-beige p-6 shadow-sm space-y-6">
            {overstockItem && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={15} className="shrink-0 text-red-600" />
                  <span>Insufficient Stock</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong>{overstockItem.product?.name}</strong> exceeds available inventory. Only <strong>{overstockItem.product?.stock ?? 0}</strong> unit(s) available in stock, but <strong>{overstockItem.quantity}</strong> requested.
                </p>
              </div>
            )}
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

            {/* Dedicated Promo / Offer Code Input Section (Always visible across Address, Delivery & Payment) */}
            <div className="border-t border-beige pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Tag size={13} className="text-accent" /> Offer / Promo Code
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Applied
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs transition-all shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-emerald-900 tracking-wider text-xs">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[9px] bg-emerald-200 text-emerald-800 font-black px-1.5 py-0.2 rounded uppercase">
                          {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        {pricing.discount > 0 ? `You are saving ₹${pricing.discount} on this order!` : 'Offer applied'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveOfferCode}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove coupon code"
                    aria-label="Remove coupon code"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApplyOfferCode();
                    }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (couponError) setCouponError('');
                        }}
                        placeholder="Enter code (e.g. PAWFIRST)"
                        className="w-full pl-3 pr-8 py-2 border border-beige text-xs uppercase tracking-wider font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-primary rounded-sm bg-white"
                      />
                      {couponInput && (
                        <button
                          type="button"
                          onClick={() => setCouponInput('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          aria-label="Clear input"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-primary hover:bg-[#163a2d] text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shrink-0 rounded-sm"
                    >
                      {isApplyingCoupon ? '...' : 'APPLY'}
                    </button>
                  </form>

                  {couponError && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0" /> {couponError}
                    </p>
                  )}

                  {/* Available quick offer suggestion pills */}
                  {availableCoupons.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">
                        ACTIVE OFFERS (TAP TO APPLY):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableCoupons.slice(0, 3).map((cp) => (
                          <button
                            key={cp.code}
                            type="button"
                            onClick={() => handleApplyOfferCode(cp.code)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 rounded-md text-[10px] font-bold tracking-wide transition cursor-pointer shadow-2xs hover:scale-102 active:scale-95"
                            title={`Click to apply ${cp.code}: ${cp.description || (cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`)}`}
                          >
                            <Sparkles size={11} className="text-amber-600 fill-amber-500" />
                            <span className="font-mono uppercase font-black">{cp.code}</span>
                            <span className="text-amber-700">
                              ({cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-beige pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{pricing.subtotal}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/60 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Promo Discount ({appliedCoupon?.code || 'Offer'}):
                  </span>
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
                <span className="text-base text-primary font-serif font-black">₹{pricing.total}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Checkout;
