import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  X, Check, AlertCircle, ShieldCheck, Star, CreditCard,
  Lock, ArrowRight, ArrowLeft, CircleCheck, Sparkles,
  MapPin, ShoppingCart, QrCode, Smartphone, Building,
  Wallet, ChevronRight, Award, Clock, HeartHandshake
} from 'lucide-react';
import toast from 'react-hot-toast';
import { safeSetItem, safeGetItem } from '../../utils/safeStorage.js';
import { apiRequest } from '../../services/api.js';

/**
 * DEFAULT PACKAGES WITH RICH PROS & CONS FOR EVERY SERVICE CATEGORY
 * Each category includes exactly 2 distinct packages (Standard vs VIP/Premium)
 */
export const SERVICE_PACKAGES_DATA = {
  'Grooming': [
    {
      id: 'groom-standard',
      title: 'Standard Hygiene & Bath Spa',
      tier: 'Standard Care',
      badge: 'Popular Choice',
      price: 799,
      priceSuffix: '/ session',
      desc: 'Essential hygiene grooming designed for routine maintenance and cleanliness.',
      features: [
        'Antibacterial herbal shampoo bath',
        'Blow drying & coat detangling',
        'Nail clipping & edge smoothing',
        'Ear cleaning & paw pad hygiene trimming',
        'Post-groom natural aroma splash'
      ],
      pros: [
        'Economical & quick 45-minute session',
        'Certified gentle groomer with sterilized tools',
        'Suitable for all dog & cat breeds'
      ],
      cons: [
        'Breed-specific styling haircut not included',
        'No medicated anti-tick & flea treatment',
        'Standard queue slot (non-priority)'
      ]
    },
    {
      id: 'groom-vip',
      title: 'VIP Royal Styling & Therapeutic Spa',
      tier: 'VIP All-Inclusive',
      badge: '⭐ Most Recommended',
      isVip: true,
      price: 1799,
      priceSuffix: '/ session',
      desc: 'Luxury complete head-to-paw makeover with styling, de-shedding, and spa therapy.',
      features: [
        'Full breed scissor styling haircut',
        'Aromatherapy oatmeal deep-nourishing bath',
        'Deep de-shedding fur treatment & anti-tick defense',
        'Organic paw balm & snout hydration massage',
        'Oral hygiene mint spray & teeth cleaning',
        'Complimentary pet bandanna & cologne splash'
      ],
      pros: [
        'Complete top-to-bottom cosmetic & hygiene transformation',
        'Priority express booking slot with senior master stylist',
        'Organic hypoallergenic products only',
        'Free 5-point physical health & coat inspection report'
      ],
      cons: [
        'Requires 90 minutes dedicated slot',
        'Advance booking recommended for weekend slots'
      ]
    }
  ],
  'Hostel': [
    {
      id: 'hostel-standard',
      title: 'Standard Cozy Boarding Pass',
      tier: 'Standard Stay',
      badge: 'Great Value',
      price: 899,
      priceSuffix: '/ night',
      desc: 'Comfortable, safe, and hygienic private boarding with routine daily care.',
      features: [
        'Individual climate-controlled private suite',
        '2 freshly cooked veterinarian-approved meals/day',
        '2 scheduled outdoor exercise & potty breaks',
        'Daily routine sanitation and fresh filtered water',
        'Evening relaxation playtime'
      ],
      pros: [
        'Budget-friendly per-night pricing',
        '24/7 on-site caretaker supervision',
        'Safe and sanitized facility with enclosed yards'
      ],
      cons: [
        'Scheduled photo updates only (no 24/7 live video stream)',
        'Shared group turf during outdoor exercise',
        'Standard check-in and check-out windows apply'
      ]
    },
    {
      id: 'hostel-vip',
      title: 'VIP Presidential Resort Suite',
      tier: 'VIP All-Inclusive',
      badge: '⭐ 5-Star Luxury',
      isVip: true,
      price: 1799,
      priceSuffix: '/ night',
      desc: 'Ultra-luxurious private suite with 24/7 live webcam streaming and 1-on-1 pampering.',
      features: [
        'Spacious private AC suite with orthopedic bedding',
        '24/7 Dedicated mobile app HD webcam access',
        'Gourmet customized diet menu (chicken/paneer/royal canin)',
        '4 Private 1-on-1 agility and play sessions per day',
        'Bedtime belly rubs, brush-out & treats',
        'Complimentary exit bath for stays of 3+ nights'
      ],
      pros: [
        'Continuous 24/7 live video feed on your phone',
        'Exclusive private lawn access (no unfamiliar dogs)',
        'On-call emergency vet on standby 24/7',
        'Flexible check-in / check-out anytime'
      ],
      cons: [
        'Limited suite availability (requires early reservation)'
      ]
    }
  ],
  'Walking': [
    {
      id: 'walk-standard',
      title: 'Essential Daily Stroll Pass',
      tier: 'Standard Routine',
      badge: 'Daily Fitness',
      price: 499,
      priceSuffix: '/ session',
      desc: 'Consistent daily physical exercise and sniffing adventures for active dogs.',
      features: [
        '30-minute brisk neighborhood walk',
        'Hydration break with fresh water provided',
        'Basic post-walk paw wipe and check',
        'Digital summary report (time, poop/pee log)'
      ],
      pros: [
        'Affordable regular exercise for high-energy dogs',
        'Verified background-checked dog walker',
        'Helps reduce indoor destructive boredom'
      ],
      cons: [
        'Fixed standard neighborhood walking route',
        'May be paired with 1 other friendly neighborhood dog',
        'Fixed morning or evening time slot'
      ]
    },
    {
      id: 'walk-vip',
      title: 'VIP Elite Agility & GPS Adventure Pass',
      tier: 'VIP Solo Dedicated',
      badge: '⭐ Top Rated',
      isVip: true,
      price: 899,
      priceSuffix: '/ session',
      desc: 'Exclusive 1-on-1 power walk with live GPS route tracking and behavioral training.',
      features: [
        '60-minute energetic adventure or nature trail walk',
        'Live real-time GPS tracking link shared on WhatsApp',
        'Exclusive 1-on-1 attention (strictly solo walk)',
        'Basic leash manner & positive recall reinforcement',
        'Full paw sanitization and soothing balm massage'
      ],
      pros: [
        '100% solo dedicated handler attention',
        'Live real-time map tracking on your smartphone',
        'Flexible custom timings & easy rescheduling',
        'Free replacement walker guarantee if assigned walker is unavailable'
      ],
      cons: [
        'Premium rate per session compared to shared walking'
      ]
    }
  ],
  'Veterinary': [
    {
      id: 'vet-standard',
      title: 'Standard OPD Consultation Pass',
      tier: 'Clinical General OPD',
      badge: 'Essential Care',
      price: 500,
      priceSuffix: '/ consult',
      desc: 'Comprehensive clinical checkup and physical evaluation with a licensed veterinarian.',
      features: [
        'Complete physical examination & vitals check',
        'Evaluation of symptoms, eyes, ears, coat, and joints',
        'Official digital prescription slip',
        'General dietary and wellness advice'
      ],
      pros: [
        'Affordable direct face-to-face physician consultation',
        'Instant clinical diagnosis for common ailments',
        'Zero platform surcharge at clinic'
      ],
      cons: [
        'Diagnostic laboratory tests and imaging billed separately',
        'Follow-up visits require standard re-booking',
        'Standard queue slot in physical waiting area'
      ]
    },
    {
      id: 'vet-vip',
      title: 'VIP Comprehensive Healthcare & Tele-Followup Pass',
      tier: 'VIP Priority Healthcare',
      badge: '⭐ Most Popular',
      isVip: true,
      price: 1299,
      priceSuffix: '/ consult',
      desc: 'Priority OPD consultation plus 14 days of direct WhatsApp chat follow-ups with the doctor.',
      features: [
        'Comprehensive systemic organ & physical evaluation',
        'Priority zero-wait appointment queue',
        '14 Days unlimited direct WhatsApp doctor follow-up',
        'Digital Pet Health Passport & vaccination schedule planner',
        'Preventative health & customized nutritional diet plan',
        'Priority emergency triage access'
      ],
      pros: [
        'Free 14-day direct chat with the consulting vet',
        'No waiting in crowded clinic lobbies',
        'Digital prescription and test review from home',
        'Direct emergency escalation helpline'
      ],
      cons: [
        'Advanced surgery / specialized ultrasound billed at standard hospital rates'
      ]
    }
  ],
  'Training': [
    {
      id: 'train-standard',
      title: 'Foundation Obedience Starter Pass',
      tier: 'Foundational Pack',
      badge: 'Core Commands',
      price: 4999,
      priceSuffix: '/ 5 sessions',
      desc: 'Crucial basic obedience and good behavior manners for puppies and young dogs.',
      features: [
        '5 One-on-one structured training sessions',
        'Master core cues: Sit, Stay, Come, Heel, Leave It',
        'Leash walking manners & doorway discipline',
        'Gentle positive reinforcement techniques only',
        'Pet parent home-practice guidance sheet'
      ],
      pros: [
        'Budget-friendly foundation for puppy discipline',
        '100% force-free reward-based methodology',
        'Certified canine behavioral trainer'
      ],
      cons: [
        'Does not address severe aggression or deep trauma',
        'Pet parents must consistently practice homework daily'
      ]
    },
    {
      id: 'train-vip',
      title: 'VIP Master Canine Behavior & Agility Pass',
      tier: 'VIP Behavioral Mastery',
      badge: '⭐ Complete Transformation',
      isVip: true,
      price: 11999,
      priceSuffix: '/ 12 sessions',
      desc: 'Complete behavioral rehabilitation, off-leash obedience, and lifelong trainer support.',
      features: [
        '12 Intensive sessions with senior master trainer',
        'Off-leash reliable recall & high-distraction training',
        'Separation anxiety & excessive barking rehabilitation',
        'Socialization mastery with other dogs and strangers',
        'Lifetime trainer phone & WhatsApp support hotline',
        'Official graduation certificate & agility medal'
      ],
      pros: [
        'Permanent behavioral transformation and confidence',
        'Off-leash freedom and rock-solid safety recall',
        'Lifelong trainer consultation hotline included',
        'Complimentary at-home behavior assessment session'
      ],
      cons: [
        'Requires dedicated 4 to 6 weeks training timeframe'
      ]
    }
  ],
  'Transport': [
    {
      id: 'trans-standard',
      title: 'Economy City Pet Taxi Pass',
      tier: 'Standard Transit',
      badge: 'Local Rides',
      price: 699,
      priceSuffix: '/ base fare',
      desc: 'Clean, sanitized air-conditioned pet transport for local vet and grooming trips.',
      features: [
        'Sanitized AC hatchback or compact vehicle',
        'Pet safety seatbelt harness and waterproof seat cover',
        'Pet-friendly trained courteous driver',
        'Direct doorstep pickup and drop'
      ],
      pros: [
        'Cost-effective ride for local city errands',
        'No taxi driver refusal or stress with pets',
        'Climate-controlled comfortable ride'
      ],
      cons: [
        'Driver-only without dedicated pet attendant in the rear',
        'Interstate or airport cargo handling excluded',
        'Standard booking lead time required'
      ]
    },
    {
      id: 'trans-vip',
      title: 'VIP Executive Pet Ambulance & Relocation',
      tier: 'VIP First-Class Relocation',
      badge: '⭐ Veterinary Assisted',
      isVip: true,
      price: 1499,
      priceSuffix: '/ base fare',
      desc: 'Spacious luxury SUV transport with a certified veterinary handler and live GPS tracking.',
      features: [
        'Spacious luxury AC SUV / Van with custom crates',
        'Dedicated trained veterinary handler onboard in rear',
        'Live real-time GPS tracking link for owners',
        'Stress-relief pheromone diffuser & calming music',
        'Fresh mineral water, treats & pet first-aid kit onboard',
        'Assistance with airport / inter-state transit paperwork'
      ],
      pros: [
        'Handler monitors your pet continuously throughout the journey',
        'Live real-time location sharing on WhatsApp',
        'Stress-free travel for anxious or elder pets',
        'Fully equipped for interstate travel and clinic emergencies'
      ],
      cons: [
        'High demand; booking 2 hours in advance recommended'
      ]
    }
  ],
  'Insurance': [
    {
      id: 'ins-standard',
      title: 'Silver Safety Shield Pass',
      tier: 'Essential Coverage',
      badge: 'Accident Cover',
      price: 599,
      priceSuffix: '/ month',
      desc: 'Basic emergency safety net covering accidental injury and emergency hospitalizations.',
      features: [
        'Accidental injury hospitalization up to ₹50,000',
        'Emergency surgery and fracture repair',
        'Emergency diagnostic X-rays & trauma bloodwork',
        'Cashless settlement across 200+ network pet clinics'
      ],
      pros: [
        'Very low affordable monthly premium',
        'Instant cashless network claim processing',
        'Peace of mind for unexpected emergencies'
      ],
      cons: [
        'Routine illnesses and OPD visits excluded',
        '₹1,500 deductible applicable per claim',
        'Pre-existing hereditary conditions excluded'
      ]
    },
    {
      id: 'ins-vip',
      title: 'Platinum Comprehensive Life Shield',
      tier: 'VIP Maximum Coverage',
      badge: '⭐ 360° Full Protection',
      isVip: true,
      price: 1499,
      priceSuffix: '/ month',
      desc: 'Complete all-inclusive coverage for surgeries, critical illnesses, dental, and liability.',
      features: [
        'Comprehensive medical cover up to ₹2,50,000 / year',
        'Covers critical illness, cancer therapy & surgeries',
        'Outpatient OPD consults, diagnostics & prescription meds',
        'Third-party pet liability cover up to ₹1,00,000',
        'Lost pet advertising & recovery reward coverage',
        'Zero deductible on major surgeries'
      ],
      pros: [
        'Covers both illnesses and accidental injuries',
        'Zero deductible on surgical and inpatient procedures',
        'Third-party property & bite liability protection included',
        'Free annual preventive checkup coupon'
      ],
      cons: [
        'Standard 30-day waiting period on illness claims'
      ]
    }
  ],
  'Breeding': [
    {
      id: 'breed-standard',
      title: 'Verified Pedigree Mate Pass',
      tier: 'Standard Match',
      badge: 'Direct Connect',
      price: 999,
      priceSuffix: '/ connection',
      desc: 'Access verified KCI pedigree parent contact and authenticated health screening.',
      features: [
        'Direct verified phone and WhatsApp contact with pet parent',
        'KCI registration and microchip lineage verification check',
        'Digital review of past litter pictures and awards',
        'Standard mating agreement template provided'
      ],
      pros: [
        'Authenticated purebred lineage without broker scams',
        'Direct pet parent communication',
        'Affordable connection fee'
      ],
      cons: [
        'Mating venue must be arranged independently',
        'Veterinary ovulation & semen motility check excluded'
      ]
    },
    {
      id: 'breed-vip',
      title: 'VIP Assisted Mating & Vet Supervision Pass',
      tier: 'VIP Safe Breeding',
      badge: '⭐ Vet Supervised',
      isVip: true,
      price: 2999,
      priceSuffix: '/ package',
      desc: 'Safe, stress-free mating supervised by a certified reproductive veterinarian at clinic.',
      features: [
        'Full lineage audit and genetic compatibility review',
        'Pre-mating reproductive health & ovulation ultrasound check',
        'Safe mating suite access at partner veterinary hospital',
        'Professional veterinary handler assistance during mating',
        'Post-mating 30-day pregnancy ultrasound confirmation'
      ],
      pros: [
        'Eliminates aggression, stress, and injury risks',
        'Significantly higher conception success rate',
        'Complete medical documentation and ultrasound tracking',
        'Reproductive specialist supervision throughout'
      ],
      cons: [
        'Requires scheduling in accordance with the female cycle'
      ]
    }
  ],
  'Adoption': [
    {
      id: 'adopt-standard',
      title: 'Standard Adoption & Shelter Support Pass',
      tier: 'Standard Adoption',
      badge: 'Rescue Companion',
      price: 499,
      priceSuffix: '/ one-time adoption pass',
      desc: 'Ethical rescue adoption covering verified transfer documentation, medical records, and shelter support.',
      features: [
        'Official pet adoption deed & certified ownership transfer',
        'Verified medical passport (vaccination & deworming history)',
        'Shelter rescue rehabilitation fee contribution',
        '10-Day post-adoption nutrition & transition starter guide',
        'Direct contact & handover coordination with rescue guardian'
      ],
      pros: [
        'Ethical NGO rescue shelter adoption supporting rescue efforts',
        'Verified health clearance & temperament certification',
        'Direct connection to current pet guardian or shelter',
        'Helps shelter rescue, treat, and feed future abandoned animals'
      ],
      cons: [
        'Starter supplies kit & travel carrier not included',
        'Parent pickup or independent transportation required'
      ]
    },
    {
      id: 'adopt-vip',
      title: 'VIP Forever Home Complete Welcome Bundle',
      tier: 'VIP All-Inclusive Adoption',
      badge: '⭐ Most Recommended',
      isVip: true,
      price: 1499,
      priceSuffix: '/ complete welcome package',
      desc: 'Complete premium adoption bundle with starter essentials kit, free first vet checkup coupon, and settling assistance.',
      features: [
        'Official pet adoption deed & microchip registration assistance',
        'Premium Starter Welcome Kit (food sample, collar, leash & comfort toy)',
        '1 Free in-clinic comprehensive veterinary health checkup coupon',
        '30-Day behavioral transition & settling helpline on WhatsApp',
        'Starter supply of preventative anti-tick & flea treatment',
        '24/7 Pet emergency advisory support hotline access'
      ],
      pros: [
        '100% stress-free transition for your new family companion',
        'Starter essentials kit ready at pet handover',
        'Guaranteed veterinary health inspection coupon included',
        'Dedicated animal behaviorist guidance for 30 settling days'
      ],
      cons: [
        'Requires 24-48 hours advance coordination for welcome kit preparation'
      ]
    }
  ]
};

/**
 * Global helper to trigger service access modal or prompt registration
 */
export const handleServiceAction = ({
  isAuthenticated,
  serviceType = 'Grooming',
  provider = null,
  action = 'book',
  customPackages = null
}) => {
  if (!isAuthenticated) {
    toast.error('Please register or log in first to access verified service providers.', {
      icon: '🔒',
      duration: 4000
    });
    window.dispatchEvent(
      new CustomEvent('open-register-modal', {
        detail: {
          tab: 'user',
          hideProviderTab: true,
          source: serviceType.toLowerCase()
        }
      })
    );
    return false;
  }

  window.dispatchEvent(
    new CustomEvent('open-service-access-modal', {
      detail: {
        serviceType,
        provider,
        packages: customPackages,
        action
      }
    })
  );
  return true;
};

/**
 * ServicePackageAccessModal Component
 * Renders the Div Cart, Service Details, Pros & Cons, Two Packages, and Payment Gateway
 */
const ServicePackageAccessModal = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [serviceType, setServiceType] = useState('Grooming');
  const [provider, setProvider] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Stepper flow: 1 = 'packages' (Cart view), 2 = 'payment' (Payment Gateway), 3 = 'success'
  const [step, setStep] = useState(1);

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking' | 'Cash'
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('834');
  const [cardName, setCardName] = useState(user?.name || 'Authorized Pet Parent');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Listen to global open event
  useEffect(() => {
    const handleOpen = (e) => {
      const type = e?.detail?.serviceType || 'Grooming';
      const prov = e?.detail?.provider || {
        name: 'Josh Pets Hub Verified Service',
        rating: 4.9,
        reviews: 120,
        city: 'Bangalore',
        area: 'Indiranagar',
        phone: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1544568100-eba616a6ce76?q=80&w=800&auto=format&fit=crop'
      };

      setServiceType(type);
      setProvider(prov);

      // Resolve packages
      let pkgs = e?.detail?.packages;
      if (!pkgs || pkgs.length < 2) {
        pkgs = SERVICE_PACKAGES_DATA[type] || SERVICE_PACKAGES_DATA['Grooming'];
      }
      setPackages(pkgs);
      setSelectedPackage(pkgs[1] || pkgs[0]); // default to VIP / recommended
      setStep(1);
      setConfirmedBooking(null);
      setIsOpen(true);
    };

    window.addEventListener('open-service-access-modal', handleOpen);
    return () => {
      window.removeEventListener('open-service-access-modal', handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  // Handle clicking "Select Package" -> transitions to Payment Gateway
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setStep(2); // Go to Payment Gateway
    toast.success(`Selected ${pkg.title}. Proceeding to Payment Gateway.`, {
      icon: '💳'
    });
  };

  // Handle confirming payment in Payment Gateway
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Simulate banking gateway latency
      await new Promise((res) => setTimeout(res, 1400));

      const txnId = `TXN_PET_${Date.now().toString().slice(-8)}`;
      const bookingId = `BK-${Date.now().toString().slice(-6)}`;

      const bookingRecord = {
        id: bookingId,
        _id: bookingId,
        serviceType,
        providerName: provider?.name || 'Verified Provider',
        providerPhone: provider?.phone || '+91 98765 43210',
        providerLocation: `${provider?.area || 'Central'}, ${provider?.city || 'Bangalore'}`,
        packageName: selectedPackage?.title,
        packageTier: selectedPackage?.tier,
        amount: selectedPackage?.price,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash' ? 'Pending on Delivery' : 'Paid',
        transactionId: txnId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        user: {
          name: user?.name || 'Pet Parent',
          email: user?.email || '',
          phone: user?.mobile || ''
        }
      };

      // Persist in local storage for AccountDashboard bookings
      try {
        const stored = JSON.parse(safeGetItem('pawora_user_bookings', '[]') || '[]');
        stored.unshift(bookingRecord);
        safeSetItem('pawora_user_bookings', JSON.stringify(stored));
      } catch (err) {
        console.warn('Could not save booking to safeStorage:', err);
      }

      // Also fire backend API attempt
      try {
        await apiRequest('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            providerName: bookingRecord.providerName,
            serviceType,
            location: bookingRecord.providerLocation,
            date: bookingRecord.date,
            timeSlot: 'Morning Slot (10:00 AM - 12:00 PM)',
            fee: bookingRecord.amount,
            transactionId: txnId,
            paymentStatus: bookingRecord.paymentStatus
          })
        });
      } catch (_) {
        // Fallback handled safely by local state
      }

      setConfirmedBooking(bookingRecord);
      setStep(3); // Payment Confirmed view
      toast.success('🎉 Payment Successful! Your service booking is confirmed.', {
        duration: 5000,
        icon: '✅'
      });
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please retry.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setStep(1);
    setConfirmedBooking(null);
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/75 backdrop-blur-md p-3 sm:p-5 flex items-center justify-center animate-in fade-in duration-200">
      
      {/* Container card */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-[#0F2E23] via-[#164E3D] to-[#0F2E23] text-white p-5 sm:p-6 shrink-0 border-b border-amber-400/30">
          <div className="flex items-start justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-3.5">
              {provider?.image && (
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-400/60 shrink-0 shadow-md bg-white/10"
                />
              )}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={11} /> {serviceType} Access Pass
                  </span>
                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                    <ShieldCheck size={12} /> {serviceType === 'Adoption' ? 'Verified Shelter Rescue' : 'Verified Service Provider'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white flex items-center gap-2">
                  <span>{provider?.name || `${serviceType} Professional`}</span>
                </h2>

                <p className="text-xs text-white/80 font-medium flex items-center gap-1.5 flex-wrap">
                  <MapPin size={12} className="text-amber-400 shrink-0" />
                  <span>{provider?.area ? `${provider.area}, ` : ''}{provider?.city || 'India'}</span>
                  {provider?.breed && (
                    <span className="text-amber-300 font-semibold">• {provider.breed}</span>
                  )}
                  {provider?.gender && (
                    <span className="text-white/70">• {provider.gender}</span>
                  )}
                  {provider?.rating && (
                    <span className="inline-flex items-center gap-1 text-amber-300 font-bold ml-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{provider.rating}</span>
                      <span className="text-white/60 font-normal">({provider.reviews || 95}+ reviews)</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Progress Tabs */}
          <div className="flex items-center gap-2 pt-4 text-xs font-bold text-white/70">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-amber-300 font-black' : step > 1 ? 'text-emerald-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === 1 ? 'bg-amber-400 text-slate-950' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-white/20'}`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span>1. Compare Packages & Pros/Cons</span>
            </div>
            <ChevronRight size={14} className="text-white/40" />
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-amber-300 font-black' : step > 2 ? 'text-emerald-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === 2 ? 'bg-amber-400 text-slate-950' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-white/20'}`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span>2. Payment Gateway</span>
            </div>
            <ChevronRight size={14} className="text-white/40" />
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-300 font-black' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === 3 ? 'bg-emerald-400 text-slate-950' : 'bg-white/20'}`}>
                3
              </span>
              <span>3. Confirmation</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-6">
          
          {/* =========================================================================
              STEP 1: DIV CART WITH DETAILS, PROS & CONS, AND TWO PACKAGES
             ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Div Cart Overview Card */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0F2E23] text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {serviceType === 'Adoption' ? 'Adoption Care & Welcome Packages Cart' : 'Service Access & Packages Comparison Cart'}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {serviceType === 'Adoption'
                        ? 'Review both adoption tiers below with comprehensive inclusions, perks (Pros), and limitations (Cons). Select your preferred tier to checkout.'
                        : 'Review both packages below with comprehensive benefits, advantages (Pros), and limitations (Cons). Select your preferred tier to checkout.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Tiers</span>
                  <span className="text-xs font-black text-[#0F2E23]">2 Curated Plans</span>
                </div>
              </div>

              {/* Two Distinct Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {packages.slice(0, 2).map((pkg, idx) => {
                  const isVip = pkg.isVip || idx === 1;

                  return (
                    <div
                      key={pkg.id || idx}
                      className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 border ${
                        isVip
                          ? 'bg-white border-amber-400/80 shadow-xl ring-2 ring-amber-400/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'
                      }`}
                    >
                      {/* Top Ribbon Badge */}
                      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${
                            isVip
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pkg.badge || (isVip ? '⭐ VIP Tier' : 'Standard Tier')}
                        </span>

                        <span className="text-[11px] font-bold text-slate-500">
                          {pkg.tier}
                        </span>
                      </div>

                      {/* Package Header */}
                      <div className="pt-4 space-y-2">
                        <h4 className="text-lg font-black text-slate-900 font-sans">
                          {pkg.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {pkg.desc}
                        </p>

                        {/* Price Tag */}
                        <div className="pt-2 pb-1 flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-[#0F2E23]">
                            ₹{pkg.price}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {pkg.priceSuffix}
                          </span>
                        </div>
                      </div>

                      {/* Inclusions List */}
                      <div className="pt-3 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Included In This Tier:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                          {(pkg.features || []).map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-black mt-0.5">✓</span>
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* PROS Section */}
                      <div className="mt-4 pt-4 border-t border-slate-100 bg-emerald-50/60 rounded-2xl p-3.5 space-y-2 border border-emerald-100">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black uppercase tracking-wider">
                          <Check size={14} className="text-emerald-600" />
                          <span>Key Advantages (Pros)</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-emerald-950 font-medium">
                          {(pkg.pros || [
                            '100% verified service credentials',
                            'Direct communication with professional',
                            'Safe & transparent pricing guarantee'
                          ]).map((pro, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold shrink-0">•</span>
                              <span className="leading-snug">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CONS Section */}
                      <div className="mt-3 bg-amber-50/60 rounded-2xl p-3.5 space-y-2 border border-amber-200/70">
                        <div className="flex items-center gap-1.5 text-amber-900 text-xs font-black uppercase tracking-wider">
                          <AlertCircle size={14} className="text-amber-600" />
                          <span>Limitations (Cons)</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-amber-950 font-medium">
                          {(pkg.cons || [
                            'Standard turnaround scheduling',
                            'Single pet coverage per booking'
                          ]).map((con, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold shrink-0">•</span>
                              <span className="leading-snug">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bottom "Select Package" CTA Button */}
                      <div className="mt-5 pt-3">
                        <button
                          onClick={() => handleSelectPackage(pkg)}
                          className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 ${
                            isVip
                              ? 'bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-amber-500/20'
                              : 'bg-[#0F2E23] hover:bg-[#164E3D] text-white shadow-emerald-950/20'
                          }`}
                        >
                          <span>Select Package</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Service Access Trust Banner */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>{serviceType === 'Adoption' ? '100% Background-Verified Shelters & Rescues' : '100% Background-Verified Experts'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake size={18} className="text-pink-500" />
                  <span>Money-Back Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-amber-500" />
                  <span>Secure Escrow Payment Gateway</span>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 2: PAYMENT GATEWAY
             ========================================================================= */}
          {step === 2 && selectedPackage && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Back to Packages button */}
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-600 hover:text-[#0F2E23] flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Packages & Comparison
              </button>

              {/* Order Cart Summary */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Selected Cart Item
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {selectedPackage.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Provider: <strong className="text-slate-800">{provider?.name}</strong> • Location: <strong className="text-slate-800">{provider?.city || 'India'}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                    <span className="text-2xl font-black text-[#0F2E23]">₹{selectedPackage.price}</span>
                  </div>
                </div>

                {/* Secure Gateway Heading */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Lock size={13} className="text-emerald-600" />
                    <span>Select Payment Method</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck size={12} /> 256-Bit SSL Encrypted
                  </span>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: <QrCode size={16} /> },
                    { id: 'Card', label: 'Credit / Debit', icon: <CreditCard size={16} /> },
                    { id: 'NetBanking', label: 'Net Banking', icon: <Building size={16} /> },
                    { id: 'Cash', label: 'Pay on Handover', icon: <Wallet size={16} /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#0F2E23] text-white border-[#0F2E23] shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Payment Method Inputs Details */}
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
                  
                  {/* UPI MODE */}
                  {paymentMethod === 'UPI' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="flex flex-col sm:flex-row items-center gap-5 bg-white p-4 rounded-2xl border border-slate-200">
                        {/* Dynamic Mock QR Code */}
                        <div className="w-28 h-28 bg-white border-2 border-slate-800 p-2 rounded-xl flex flex-col items-center justify-center shadow-inner shrink-0 text-center">
                          <QrCode size={70} className="text-slate-900" />
                          <span className="text-[8px] font-black uppercase tracking-tight text-slate-600 mt-0.5">
                            SCAN & PAY ₹{selectedPackage.price}
                          </span>
                        </div>

                        <div className="space-y-2 text-center sm:text-left flex-1">
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">Google Pay</span>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md">PhonePe</span>
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-md">Paytm</span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">BHIM UPI</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            Scan the QR code with any verified UPI application or enter your UPI ID below.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Or Enter UPI ID / VPA</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okaxis"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                        />
                      </div>
                    </div>
                  )}

                  {/* CARD MODE */}
                  {paymentMethod === 'Card' && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 0000 0000 8821"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Cardholder Name"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                        />
                      </div>
                    </div>
                  )}

                  {/* NET BANKING MODE */}
                  {paymentMethod === 'NetBanking' && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <label className="text-xs font-bold text-slate-700 block">Select Your Bank</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                          <button
                            key={b}
                            onClick={() => setSelectedBank(b)}
                            className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                              selectedBank === b
                                ? 'bg-[#0F2E23] text-white border-[#0F2E23]'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CASH / ON HANDOVER MODE */}
                  {paymentMethod === 'Cash' && (
                    <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150">
                      <p className="font-extrabold text-amber-950 flex items-center gap-1.5">
                        <Wallet size={15} className="text-amber-700" />
                        <span>Pay on Service Fulfillment</span>
                      </p>
                      <p className="text-amber-800 font-medium">
                        You can pay <strong>₹{selectedPackage.price}</strong> via Cash or UPI directly to {provider?.name || 'the service specialist'} upon arrival or after session completion.
                      </p>
                    </div>
                  )}

                </div>

                {/* Final Pay Button */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 rounded-2xl bg-[#0F2E23] hover:bg-[#164E3D] text-white font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Payment with Banking Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="text-amber-400" />
                      <span>Pay ₹{selectedPackage.price} Securely</span>
                    </>
                  )}
                </button>

              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 3: PAYMENT & BOOKING CONFIRMED RECEIPT
             ========================================================================= */}
          {step === 3 && confirmedBooking && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-6 animate-in zoom-in-95 duration-200 shadow-xl">
              
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CircleCheck size={44} className="animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Successful & Booking Confirmed
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-sans">
                  Your {serviceType} Access Pass is Active!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We have registered your session with <strong>{confirmedBooking.providerName}</strong>. A confirmation copy has been saved to your account.
                </p>
              </div>

              {/* Receipt card summary */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Transaction Reference</span>
                  <span className="font-mono font-bold text-slate-900">{confirmedBooking.transactionId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Booking ID</span>
                  <span className="font-mono font-bold text-[#0F2E23]">{confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Selected Package</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.packageName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Amount Paid</span>
                  <span className="font-black text-emerald-700 text-sm">₹{confirmedBooking.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Payment Method</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.paymentMethod}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    closeModal();
                    navigate('/account?tab=bookings');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0F2E23] hover:bg-[#164E3D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow cursor-pointer"
                >
                  View in My Account
                </button>
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ServicePackageAccessModal;
