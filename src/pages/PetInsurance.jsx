import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Phone,
  MessageSquare,
  X,
  Send,
  HelpCircle,
  Heart,
  Award,
  Check,
  ArrowRight,
  UserCheck,
  RotateCcw,
  Zap,
  FileText,
  DollarSign,
  Layers,
  AlertCircle,
  Hospital,
  Activity,
  HeartPulse,
  Scale,
  CheckSquare,
  Square,
  Download,
  Info,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  INSURANCE_PLAN_TYPES,
  INSURANCE_FEATURES,
  PET_SPECIES_OPTIONS,
  INITIAL_INSURANCE_PROVIDERS,
  PET_INSURANCE_TESTIMONIALS,
  INSURANCE_FAQS,
  HOW_CLAIM_WORKS_STEPS,
  getStoredInsuranceProviders,
  saveInsuranceApplication,
  saveInsuranceEnquiry
} from '../data/insuranceData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';

// Species-Specific Insurance Coverage Options & Medical Protection Tiers
export const SPECIES_COVERAGE_OPTIONS = {
  Dog: [
    {
      id: 'dog-comprehensive',
      label: 'Comprehensive Canine Health (Surgeries + Illness + Trauma)',
      baseCost: 3500,
      riderCost: 1200,
      sumInsured: '₹5,00,000',
      desc: '360° canine protection covering emergency trauma, tumor surgeries, parvovirus/tick fever, and ICU hospitalization.'
    },
    {
      id: 'dog-surgery',
      label: 'Critical Care & Hip Dysplasia Surgery Cover',
      baseCost: 3200,
      riderCost: 800,
      sumInsured: '₹3,50,000',
      desc: 'Dedicated canine cover for orthopedic surgeries, joint disorders, GDV (bloat), and specialized ICU monitoring.'
    },
    {
      id: 'dog-opd',
      label: 'Canine Routine OPD, Deworming & Wellness',
      baseCost: 2800,
      riderCost: 600,
      sumInsured: '₹2,00,000',
      desc: 'Coverage for outpatient consultations, skin allergy therapies, ear hematoma, and preventive health checkups.'
    },
    {
      id: 'dog-liability',
      label: 'Third-Party Liability & Guard Dog Bite Protection',
      baseCost: 2400,
      riderCost: 500,
      sumInsured: '₹10,00,000 Legal',
      desc: 'Legal indemnification protecting pet parents against accidental bite lawsuits, legal defense, and property damages.'
    }
  ],
  Cat: [
    {
      id: 'cat-comprehensive',
      label: 'Comprehensive Feline Care (Kidney/UTI + Surgery + Accidents)',
      baseCost: 2800,
      riderCost: 900,
      sumInsured: '₹4,00,000',
      desc: 'Full feline cover for FLUTD (urinary blockages), chronic renal failure, trauma surgeries, and cancer therapy.'
    },
    {
      id: 'cat-foreign-body',
      label: 'Feline Indoor Accident & Foreign Body Ingestion Cover',
      baseCost: 2400,
      riderCost: 700,
      sumInsured: '₹3,00,000',
      desc: 'Emergency endoscopy and abdominal surgery for swallowed strings/toys, high-rise syndrome, and fracture repairs.'
    },
    {
      id: 'cat-senior-renal',
      label: 'Senior Cat Renal & Dental Stomatitis Safeguard',
      baseCost: 3100,
      riderCost: 850,
      sumInsured: '₹3,50,000',
      desc: 'Tailored for cats 5+ years covering dialysis monitoring, recurring bloodwork, and dental extractions.'
    },
    {
      id: 'cat-wellness',
      label: 'Feline Wellness, Vaccines & Parasite Defense',
      baseCost: 2100,
      riderCost: 450,
      sumInsured: '₹1,50,000',
      desc: 'Routine vet visits, annual FVRCP/Rabies vaccinations, deworming, and tick/flea treatments.'
    }
  ],
  Bird: [
    {
      id: 'bird-critical',
      label: 'Avian Critical Care & Feather/Beak Surgery',
      baseCost: 2200,
      riderCost: 600,
      sumInsured: '₹2,00,000',
      desc: 'Specialized avian microsurgery, egg-binding emergencies, crop impaction, and beak fracture repairs.'
    },
    {
      id: 'bird-respiratory',
      label: 'Avian Respiratory & Psittacosis Hospitalization',
      baseCost: 1900,
      riderCost: 500,
      sumInsured: '₹1,50,000',
      desc: 'Inpatient nebulization chambers, fungal aspergillosis therapy, and emergency avian oxygenation.'
    },
    {
      id: 'bird-escape',
      label: 'Accidental Escape & Recovery Search Assistance',
      baseCost: 1600,
      riderCost: 350,
      sumInsured: '₹75,000',
      desc: 'Emergency lost bird search broadcasting, reward reimbursement, and recapture assistance allowance.'
    }
  ],
  'Exotic Pets': [
    {
      id: 'exotic-comprehensive',
      label: 'Exotic Pet Specialized Surgical & Trauma Care',
      baseCost: 3800,
      riderCost: 1100,
      sumInsured: '₹3,50,000',
      desc: 'Specialized exotic surgeon fees for rabbits, guinea pigs, hamsters, and reptiles with full anesthesia cover.'
    },
    {
      id: 'exotic-gi-stasis',
      label: 'GI Stasis & Dental Malocclusion Emergency Cover',
      baseCost: 3200,
      riderCost: 800,
      sumInsured: '₹2,50,000',
      desc: 'Emergency 24/7 hospitalization for life-threatening gut stasis, syringe feeding ICU, and molar burring.'
    },
    {
      id: 'exotic-habitat-mbd',
      label: 'Metabolic Bone Disease & Habitat Health Safeguard',
      baseCost: 2700,
      riderCost: 650,
      sumInsured: '₹1,75,000',
      desc: 'Diagnostics, UV deficiency rehabilitation, nutritional deficiency treatments, and habitat health audits.'
    }
  ]
};

import ServiceAccessLock, { isServicePathLockedForUser } from '../components/ServiceAccessLock.jsx';

const PetInsurance = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isServicePathLockedForUser(user, '/insurance')) {
    return <ServiceAccessLock serviceName="Pet Insurance" attemptedPath="/insurance" />;
  }

  // Filter States
  const [providers, setProviders] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState('All Plans');
  const [selectedSpecies, setSelectedSpecies] = useState('All Pets');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [sumInsuredFilter, setSumInsuredFilter] = useState('all'); // 'all' | 'under-100k' | '100k-250k' | '250k-plus'
  const [priceFilter, setPriceFilter] = useState('all'); // 'all' | 'under-3k' | '3k-6k' | '6k-plus'
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [availableCities, setAvailableCities] = useState(['All Cities']);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'rating' | 'price-asc' | 'sum-desc' | 'claim-speed'

  // Multi-Plan Comparison State
  const [comparedProviders, setComparedProviders] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Policy Application Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProviderForApply, setSelectedProviderForApply] = useState(null);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Dog');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('1 - 3 Years');
  const [petGender, setPetGender] = useState('Male');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [hasPreExisting, setHasPreExisting] = useState('No');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.mobile || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [ownerCity, setOwnerCity] = useState(user?.city || 'Bangalore');
  const [ownerState, setOwnerState] = useState(user?.state || 'Karnataka');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  // Policy Details Modal State
  const [selectedProviderForDetails, setSelectedProviderForDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Detailed Quote Modal State
  const [detailedQuote, setDetailedQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Quick Premium Calculator State (Hero Widget)
  const [calcPetType, setCalcPetType] = useState('Dog');
  const [calcAge, setCalcAge] = useState('Puppy (2 - 12 months)');
  const [calcCoverNeed, setCalcCoverNeed] = useState(SPECIES_COVERAGE_OPTIONS['Dog'][0].label);
  const [calcEstimatedCost, setCalcEstimatedCost] = useState(null);

  // Load Providers on Mount
  useEffect(() => {
    window.scrollTo(0, 0);
    setProviders(getStoredInsuranceProviders());
  }, []);

  // Sync owner info when user logs in/registers
  useEffect(() => {
    if (user) {
      if (user.name) setOwnerName(user.name);
      if (user.mobile || user.phone) setOwnerPhone(user.mobile || user.phone);
      if (user.email) setOwnerEmail(user.email);
      if (user.city) setOwnerCity(user.city);
      if (user.state) setOwnerState(user.state);
    }
  }, [user]);

  // Update available cities when state changes
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    if (newState === 'All States' || !INDIAN_STATES_CITIES[newState]) {
      setAvailableCities(['All Cities']);
      setSelectedCity('All Cities');
    } else {
      setAvailableCities(['All Cities', ...INDIAN_STATES_CITIES[newState]]);
      setSelectedCity('All Cities');
    }
  };

  // Toggle Feature Filter Checklist
  const handleToggleFeature = (featureLabel) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureLabel)
        ? prev.filter((f) => f !== featureLabel)
        : [...prev, featureLabel]
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedPlanType('All Plans');
    setSelectedSpecies('All Pets');
    setSelectedFeatures([]);
    setSumInsuredFilter('all');
    setPriceFilter('all');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setAvailableCities(['All Cities']);
    setVerifiedOnly(false);
    setSortBy('recommended');
  };

  // Compare toggles (Enforce Exactly Max 3 Providers simultaneously)
  const handleToggleCompare = (provider) => {
    if (comparedProviders.some((p) => p.id === provider.id)) {
      const remaining = comparedProviders.filter((p) => p.id !== provider.id);
      setComparedProviders(remaining);
      toast.success(`Removed ${provider.name} from comparison.`);
    } else {
      if (comparedProviders.length >= 3) {
        toast.error('You can compare a maximum of 3 insurance providers simultaneously. Please remove one provider to add another.', {
          duration: 4000,
          icon: '⚖️'
        });
        return;
      }
      const updated = [...comparedProviders, provider];
      setComparedProviders(updated);
      toast.success(`Added ${provider.name} to comparison (${updated.length}/3 selected).`, {
        icon: '📊'
      });
    }
  };

  // Filtered & Sorted Providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // 1. Keyword search (name, company, tagline, features)
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchesQuery =
          p.name.toLowerCase().includes(query) ||
          p.company.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.features.some((f) => f.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // 2. Plan Type
      if (selectedPlanType !== 'All Plans') {
        if (p.planType !== selectedPlanType && p.category !== selectedPlanType) {
          return false;
        }
      }

      // 3. Species Filter
      if (selectedSpecies !== 'All Pets') {
        if (!p.speciesCovered.includes(selectedSpecies)) {
          return false;
        }
      }

      // 4. Feature Checklist Filter (Every selected feature must be supported)
      if (selectedFeatures.length > 0) {
        const hasAllFeatures = selectedFeatures.every((feat) =>
          p.features.some((pf) => pf.toLowerCase().includes(feat.toLowerCase()))
        );
        if (!hasAllFeatures) return false;
      }

      // 5. Sum Insured Filter
      if (sumInsuredFilter === 'under-100k' && p.sumInsuredValue > 100000) return false;
      if (sumInsuredFilter === '100k-250k' && (p.sumInsuredValue < 100000 || p.sumInsuredValue > 250000)) return false;
      if (sumInsuredFilter === '250k-plus' && p.sumInsuredValue < 250000) return false;

      // 6. Price Filter
      if (priceFilter === 'under-3k' && p.annualPremium >= 3000) return false;
      if (priceFilter === '3k-6k' && (p.annualPremium < 3000 || p.annualPremium > 6000)) return false;
      if (priceFilter === '6k-plus' && p.annualPremium < 6000) return false;

      // 7. Verified Only
      if (verifiedOnly && !p.verifiedIrdai) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.annualPremium - b.annualPremium;
      if (sortBy === 'sum-desc') return b.sumInsuredValue - a.sumInsuredValue;
      if (sortBy === 'claim-speed') return parseFloat(b.claimSettlementRatio) - parseFloat(a.claimSettlementRatio);
      return b.rating - a.rating; // default recommended
    });
  }, [
    providers,
    searchKeyword,
    selectedPlanType,
    selectedSpecies,
    selectedFeatures,
    sumInsuredFilter,
    priceFilter,
    verifiedOnly,
    sortBy
  ]);

  // Species Selection Handler (Dynamically updates coverage options for that species)
  const handleSelectPetSpecies = (species) => {
    setCalcPetType(species);
    const availableOpts = SPECIES_COVERAGE_OPTIONS[species] || SPECIES_COVERAGE_OPTIONS['Dog'];
    if (availableOpts && availableOpts.length > 0) {
      setCalcCoverNeed(availableOpts[0].label);
    }
    if (species === 'Dog') setCalcAge('Puppy (2 - 12 months)');
    else if (species === 'Cat') setCalcAge('Kitten (2 - 12 months)');
    else setCalcAge('Young / Juvenile');
  };

  // Quick Calculator action with Species-Specific Detailed Breakdown & Modal Trigger
  const handleCalculateQuote = (e) => {
    if (e) e.preventDefault();
    const availableOpts = SPECIES_COVERAGE_OPTIONS[calcPetType] || SPECIES_COVERAGE_OPTIONS['Dog'];
    const currentOpt = availableOpts.find((o) => o.label === calcCoverNeed) || availableOpts[0];

    let base = currentOpt ? currentOpt.baseCost : 3500;
    const riderCost = currentOpt ? currentOpt.riderCost : 1000;
    const sumInsured = currentOpt ? currentOpt.sumInsured : '₹5,00,000';

    if (calcAge.includes('Senior')) {
      base *= 1.35;
    } else if (calcAge.includes('Puppy') || calcAge.includes('Kitten') || calcAge.includes('Young')) {
      base *= 0.9;
    }

    const netBase = Math.round(base + riderCost);
    const gst = Math.round(netBase * 0.18);
    const totalAnnual = netBase + gst;
    const monthlyEmi = Math.round(totalAnnual / 12);

    const quoteData = {
      quoteId: `PAW-QUOTE-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      validUntil: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      petSpecies: calcPetType,
      ageGroup: calcAge,
      coverageType: currentOpt.label,
      coverageDesc: currentOpt.desc,
      basePremium: Math.round(base),
      riderCost: riderCost,
      netBase: netBase,
      gst: gst,
      totalAnnual: totalAnnual,
      monthlyEmi: monthlyEmi,
      sumInsured: sumInsured,
      cashlessClinics: '1,500+ Across India',
      claimRatio: '98.8% Approved Claims',
      inclusions: [
        `${calcPetType} Specialized Surgical & Inpatient Care`,
        `Emergency Accidental Trauma & Intensive Care Safeguard`,
        `Direct Cashless Settlement at 1,500+ Partner Clinics`,
        `24/7 Virtual Veterinary Tele-Consultation Hotline`,
        `Pre & Post Hospitalization Diagnostics (30 Days)`,
        `Lost / Stolen Pet Advertising & Search Assistance`
      ],
      matchingProviders: providers.filter((p) =>
        p.speciesCovered.includes(calcPetType === 'Dog' ? 'Dogs' : calcPetType === 'Cat' ? 'Cats' : 'Birds')
      ).slice(0, 3)
    };

    setCalcEstimatedCost(totalAnnual);
    setDetailedQuote(quoteData);
    setShowQuoteModal(true);
    toast.success(`Generated tailored quote for ${calcPetType}!`);

    // Auto adjust species filter
    if (calcPetType !== 'All Pets') {
      setSelectedSpecies(calcPetType === 'Dog' ? 'Dogs' : calcPetType === 'Cat' ? 'Cats' : 'Birds');
    }
  };

  // Download / Print Official Quote Slip
  const handleDownloadQuotePDF = (quote) => {
    if (!quote) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download/print your official insurance quote.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pet Insurance Official Quotation - ${quote.quoteId}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0F2E23; padding-bottom: 20px; margin-bottom: 25px; }
          .brand { font-size: 24px; font-weight: 900; color: #0F2E23; letter-spacing: -0.5px; }
          .badge { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .title { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 5px; }
          .value { font-size: 15px; font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #0F2E23; color: white; padding: 10px; font-size: 12px; text-align: left; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; font-size: 12px; }
          .total-row { background: #f1f5f9; font-weight: bold; font-size: 14px; }
          .total-price { font-size: 22px; color: #0F2E23; }
          .features-list { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 25px; }
          .features-list li { font-size: 12px; color: #334155; }
          .features-list li:before { content: '✓ '; color: #10b981; font-weight: bold; }
          .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🐾 JOSH PETS HUB</div>
            <div style="font-size: 12px; color: #64748b;">India Pet Health Insurance Bureau</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">IRDAI APPROVED QUOTE</div>
            <div style="font-size: 11px; margin-top: 5px; color: #64748b;">Quote ID: <strong>${quote.quoteId}</strong></div>
            <div style="font-size: 11px; color: #64748b;">Issued: ${quote.date} | Valid for 30 Days</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="title">Pet Information</div>
            <div class="value">${quote.petSpecies} (${quote.ageGroup})</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Risk Status: Standard Health Evaluation</div>
          </div>
          <div class="card">
            <div class="title">Coverage Plan Selected</div>
            <div class="value">${quote.coverageType}</div>
            <div style="font-size: 12px; color: #059669; font-weight: bold; margin-top: 4px;">Max Sum Insured: ${quote.sumInsured}</div>
          </div>
        </div>

        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Coverage Item & Rider Description</th>
              <th style="text-align: right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base Inpatient Surgery & Trauma Safeguard</td>
              <td style="text-align: right;">₹${quote.basePremium.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>${quote.coverageType} Critical Illness & Diagnostic Rider</td>
              <td style="text-align: right;">₹${quote.riderCost.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Goods & Services Tax (GST 18%)</td>
              <td style="text-align: right;">₹${quote.gst.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="total-row">
              <td>Total Guaranteed Annual Premium</td>
              <td style="text-align: right;" class="total-price">₹${quote.totalAnnual.toLocaleString('en-IN')} / year</td>
            </tr>
            <tr>
              <td colspan="2" style="font-size: 11px; color: #059669; text-align: right; background: #ecfdf5;">
                Monthly Zero-Cost EMI Option: <strong>₹${quote.monthlyEmi.toLocaleString('en-IN')} / month</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-bottom: 10px; font-weight: bold; font-size: 13px;">Guaranteed Inclusions in this Quote:</div>
        <ul class="features-list">
          ${quote.inclusions.map((inc) => `<li>${inc}</li>`).join('')}
        </ul>

        <div class="footer">
          This quotation is digitally generated by Josh Pets Hub in partnership with licensed IRDAI Insurance Underwriters in India.<br />
          For claim approvals or instant policy binding, present this Quote ID #${quote.quoteId} or call our 24/7 toll-free helpline.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Open Application Modal (Requires User to be Registered / Logged In)
  const handleOpenApplyModal = (provider) => {
    if (!isAuthenticated) {
      setShowDetailsModal(false);
      setShowCompareModal(false);
      setShowQuoteModal(false);
      toast('Please sign up or log in to complete your pet insurance application.', {
        icon: '🔐',
        duration: 4000
      });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: {
            tab: 'user',
            hideProviderTab: true,
            source: 'insurance-apply',
            providerName: provider?.name
          }
        })
      );
      return;
    }

    setSelectedProviderForApply(provider);
    setSelectedTierIndex(1); // Default to Gold / middle tier if available
    setSelectedAddons([]);
    setSubmittedApplication(null);
    setShowApplyModal(true);
  };

  // Open Details Modal
  const handleOpenDetailsModal = (provider) => {
    setSelectedProviderForDetails(provider);
    setShowDetailsModal(true);
  };

  // Submit Policy Application
  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!petName || !ownerName || !ownerPhone) {
      toast.error('Please fill in Pet Name, Guardian Name, and Mobile Number.');
      return;
    }

    const currentTier = selectedProviderForApply?.tiers?.[selectedTierIndex] || {
      name: 'Standard Coverage',
      annualPrice: selectedProviderForApply?.annualPremium,
      sumInsured: selectedProviderForApply?.sumInsured
    };

    let totalAnnualPremium = currentTier.annualPrice || selectedProviderForApply.annualPremium;
    if (selectedAddons.includes('tick_cover')) totalAnnualPremium += 499;
    if (selectedAddons.includes('dental_opd')) totalAnnualPremium += 799;
    if (selectedAddons.includes('lost_pet_gps')) totalAnnualPremium += 299;

    const applicationPayload = {
      providerId: selectedProviderForApply.id,
      providerName: selectedProviderForApply.name,
      company: selectedProviderForApply.company,
      tierName: currentTier.name,
      sumInsured: currentTier.sumInsured,
      annualPremium: totalAnnualPremium,
      petDetails: {
        name: petName,
        species: petSpecies,
        breed: petBreed || 'Indie / Standard',
        age: petAge,
        gender: petGender,
        microchipNumber: microchipNumber || 'Pending / None',
        hasPreExisting
      },
      guardianDetails: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
        city: ownerCity,
        state: ownerState
      },
      addons: selectedAddons,
      cashlessEligible: selectedProviderForApply.features.includes('Cashless Vet Network')
    };

    const savedApp = saveInsuranceApplication(applicationPayload);
    setSubmittedApplication(savedApp);
    toast.success('Insurance application submitted successfully! Reference generated.');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 antialiased font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0B251C] via-[#0F2E23] to-[#164233] text-white pt-10 pb-16 px-4 md:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-300/80 mb-6">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-white transition">Pet Services</Link>
            <ChevronRight size={12} />
            <span className="text-white font-bold">Pet Insurance & Health Cover</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 tracking-wider">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>IRDAI Compliant Pet Health & Surgery Plans in India</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                Protect Your Pet’s Life & Health with <span className="text-accent-light italic">360° Cashless</span> Cover
              </h1>

              <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-2xl font-light">
                Don’t let unexpected veterinary surgeries, illness hospitalizations, cancer care, or accidental trauma drain your savings. Compare India's top pet health insurance underwriters with direct cashless settlement across 1,500+ clinics.
              </p>

              {/* Key Trust Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-none">
                  <div className="text-xl font-bold text-accent-light font-serif">98.8%</div>
                  <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Claim Ratio</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-none">
                  <div className="text-xl font-bold text-accent-light font-serif">1,500+</div>
                  <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Cashless Vets</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-none">
                  <div className="text-xl font-bold text-accent-light font-serif">₹5 Lakhs</div>
                  <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Max Cover</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-none">
                  <div className="text-xl font-bold text-accent-light font-serif">&lt; 4 Hours</div>
                  <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Fast Claims</div>
                </div>
              </div>
            </div>

            {/* Hero Right Quick Quote Calculator */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 p-6 shadow-2xl border border-emerald-100 rounded-none relative">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="text-primary" size={18} />
                    <h3 className="font-serif font-bold text-lg text-primary">Instant Premium Estimator</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 font-bold uppercase tracking-wider">
                    Free Quote
                  </span>
                </div>

                <form onSubmit={handleCalculateQuote} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      1. Select Pet Species
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Dog', 'Cat', 'Bird', 'Exotic Pets'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleSelectPetSpecies(type)}
                          className={`py-2 px-1 text-center font-bold tracking-wider text-[11px] border transition cursor-pointer ${
                            calcPetType === type
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      2. Pet Age Bracket
                    </label>
                    <select
                      value={calcAge}
                      onChange={(e) => setCalcAge(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary"
                    >
                      {calcPetType === 'Dog' && (
                        <>
                          <option>Puppy (2 - 12 months)</option>
                          <option>Adult Dog (1 - 7 years)</option>
                          <option>Senior Dog (8+ years)</option>
                        </>
                      )}
                      {calcPetType === 'Cat' && (
                        <>
                          <option>Kitten (2 - 12 months)</option>
                          <option>Adult Cat (1 - 7 years)</option>
                          <option>Senior Cat (8+ years)</option>
                        </>
                      )}
                      {calcPetType === 'Bird' && (
                        <>
                          <option>Young Bird (Fledgling / Juvenile)</option>
                          <option>Adult Bird (1 - 5 years)</option>
                          <option>Mature / Senior Bird (6+ years)</option>
                        </>
                      )}
                      {calcPetType === 'Exotic Pets' && (
                        <>
                          <option>Juvenile Exotic (Under 1 year)</option>
                          <option>Adult Exotic (1 - 4 years)</option>
                          <option>Senior Exotic (5+ years)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        3. Coverage Type Needed
                      </label>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                        {calcPetType} Specialized
                      </span>
                    </div>
                    <select
                      value={calcCoverNeed}
                      onChange={(e) => setCalcCoverNeed(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary"
                    >
                      {(SPECIES_COVERAGE_OPTIONS[calcPetType] || SPECIES_COVERAGE_OPTIONS['Dog']).map((opt) => (
                        <option key={opt.id} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {/* Helpful dynamic description badge */}
                    {(() => {
                      const currentOpt = (SPECIES_COVERAGE_OPTIONS[calcPetType] || []).find((o) => o.label === calcCoverNeed);
                      return currentOpt ? (
                        <div className="text-[10.5px] text-slate-600 bg-slate-50 p-2 border border-slate-200 mt-1.5 rounded-none leading-relaxed">
                          <span className="font-bold text-emerald-900">Inclusions:</span> {currentOpt.desc}
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold tracking-widest uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2 text-xs"
                  >
                    <Sparkles size={14} className="text-accent-light" /> Calculate Instant Quote
                  </button>

                  {calcEstimatedCost && detailedQuote && (
                    <div className="space-y-2 mt-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-none flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Estimated Premium</div>
                          <div className="text-lg font-bold font-serif text-emerald-950">₹{calcEstimatedCost.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-600">/ year</span></div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-800">~₹{Math.round(calcEstimatedCost / 12).toLocaleString('en-IN')}/mo</span>
                          <div className="text-[10px] text-slate-500">Zero Cost EMI</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowQuoteModal(true)}
                        className="w-full py-2.5 bg-[#0F2E23] hover:bg-[#184534] text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-emerald-900"
                      >
                        <FileText size={14} className="text-[#ffc83b]" /> View Detailed Breakdown & Download PDF
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN SECTION: FILTERS & FEATURES ON LEFT, PROVIDERS ON RIGHT */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR: FILTERS & FEATURES ================= */}
          <aside className="lg:col-span-4 bg-white border border-gray-200 p-4 sm:p-5 lg:sticky lg:top-24 shadow-sm space-y-6 max-h-[calc(100vh-6.5rem)] overflow-y-auto custom-scrollbar">
            {/* Header & Reset Button */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <h3 className="font-serif font-bold text-base text-primary uppercase tracking-wider">
                  Filter Plans
                </h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Search Plan / Insurer
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Bajaj, Digit, Surgery..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary"
                />
                <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Sort By Filter (Inside Filter Sidebar) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs font-semibold text-slate-800 rounded-none focus:outline-none focus:border-primary cursor-pointer appearance-none"
                >
                  <option value="recommended">Recommended / Best Value</option>
                  <option value="rating">Highest User Rating</option>
                  <option value="price-asc">Lowest Premium First</option>
                  <option value="sum-desc">Highest Sum Insured</option>
                  <option value="claim-speed">Claim Settlement Speed</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Insurance Plan Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Plan Type
              </label>
              <div className="space-y-1.5">
                {INSURANCE_PLAN_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedPlanType(type)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-none border transition flex items-center justify-between cursor-pointer ${
                      selectedPlanType === type
                        ? 'bg-primary text-white border-primary'
                        : 'bg-gray-50/70 text-slate-700 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <span>{type}</span>
                    {selectedPlanType === type && <Check size={12} className="text-accent-light" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pet Species Covered */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pet Species
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PET_SPECIES_OPTIONS.map((species) => (
                  <button
                    key={species}
                    type="button"
                    onClick={() => setSelectedSpecies(species)}
                    className={`py-1.5 px-2 text-center text-xs font-semibold rounded-none border transition cursor-pointer ${
                      selectedSpecies === species
                        ? 'bg-primary text-white border-primary font-bold'
                        : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {species}
                  </button>
                ))}
              </div>
            </div>

            {/* FEATURE FILTER CHECKLIST (The Requested Left-Side Feature Filters) */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Coverage Features
                </label>
                {selectedFeatures.length > 0 && (
                  <button
                    onClick={() => setSelectedFeatures([])}
                    className="text-[10px] text-accent font-bold hover:underline"
                  >
                    Clear ({selectedFeatures.length})
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Select required policy features to filter matching underwriters:
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {INSURANCE_FEATURES.map((feature) => {
                  const isChecked = selectedFeatures.includes(feature.label);
                  return (
                    <label
                      key={feature.id}
                      onClick={() => handleToggleFeature(feature.label)}
                      className={`flex items-start gap-2.5 p-2 rounded-none border text-xs cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-gray-50/50 border-gray-100 text-slate-700 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 text-primary rounded-none focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-semibold">{feature.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {feature.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sum Insured Filter */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sum Insured (Annual Coverage)
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Limits' },
                  { id: 'under-100k', label: 'Up to ₹1 Lakh' },
                  { id: '100k-250k', label: '₹1L - ₹2.5 Lakhs' },
                  { id: '250k-plus', label: '₹2.5L+ (High Cover)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSumInsuredFilter(item.id)}
                    className={`py-1.5 px-2 text-center font-semibold rounded-none border transition cursor-pointer ${
                      sumInsuredFilter === item.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget / Annual Premium */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Annual Premium Budget
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Budgets' },
                  { id: 'under-3k', label: 'Under ₹3,000 / yr (~₹250/mo)' },
                  { id: '3k-6k', label: '₹3,000 - ₹6,000 / yr' },
                  { id: '6k-plus', label: '₹6,000+ / yr (Comprehensive)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPriceFilter(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-none border transition flex items-center justify-between cursor-pointer ${
                      priceFilter === item.id
                        ? 'bg-primary text-white border-primary font-bold'
                        : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {priceFilter === item.id && <Check size={12} className="text-accent-light" />}
                  </button>
                ))}
              </div>
            </div>

            {/* IRDAI Verified Toggle */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded-none text-primary focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  IRDAI Verified Underwriters Only
                </span>
              </label>
            </div>
          </aside>

          {/* ================= RIGHT MAIN: LIST OF PET INSURANCE PROVIDERS ================= */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Results Header */}
            <div className="bg-white border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-lg text-primary">
                  Available Pet Insurance Plans ({filteredProviders.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing verified insurers with cashless hospitalization across India
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                  🛡️ 100% IRDAI Compliant
                </span>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedFeatures.length > 0 || selectedPlanType !== 'All Plans' || selectedSpecies !== 'All Pets' || sumInsuredFilter !== 'all' || priceFilter !== 'all' || searchKeyword) && (
              <div className="flex flex-wrap items-center gap-1.5 p-3 bg-emerald-50/60 border border-emerald-200/80">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mr-1">
                  Active Filters:
                </span>
                {selectedPlanType !== 'All Plans' && (
                  <span className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5">
                    Plan: {selectedPlanType}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedPlanType('All Plans')} />
                  </span>
                )}
                {selectedSpecies !== 'All Pets' && (
                  <span className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5">
                    Pet: {selectedSpecies}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedSpecies('All Pets')} />
                  </span>
                )}
                {selectedFeatures.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5 font-medium">
                    {f}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => handleToggleFeature(f)} />
                  </span>
                ))}
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-red-600 font-bold hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Provider Cards List */}
            {filteredProviders.length === 0 ? (
              <div className="bg-white border border-gray-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  <ShieldAlert size={28} />
                </div>
                <h3 className="font-serif font-bold text-xl text-primary">No Matching Insurance Plans Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try unchecking some feature filters, changing the sum insured bracket, or resetting filters to view all available underwriters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProviders.map((provider) => {
                  const isCompared = comparedProviders.some((p) => p.id === provider.id);

                  return (
                    <div
                      key={provider.id}
                      className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-none overflow-hidden"
                    >
                      {/* Top Insurer Banner */}
                      <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={provider.logo}
                            alt={provider.name}
                            className="w-14 h-14 object-cover border border-gray-200 rounded-none shrink-0"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-serif font-bold text-lg text-primary hover:text-accent transition">
                                {provider.name}
                              </h3>
                              {provider.verifiedIrdai && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                                  <ShieldCheck size={11} className="text-emerald-600" /> IRDAI Approved
                                </span>
                              )}
                              <span className="text-[10px] bg-gray-100 text-slate-600 px-2 py-0.5 font-bold uppercase tracking-wider">
                                {provider.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              Underwritten by <span className="font-bold text-slate-700">{provider.company}</span>
                            </div>
                            <div className="text-xs text-emerald-900 font-medium mt-1 italic">
                              "{provider.tagline}"
                            </div>
                          </div>
                        </div>

                        {/* Rating & Fast Stats */}
                        <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-gray-100">
                          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 border border-amber-200">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-900">{provider.rating}</span>
                            <span className="text-[10px] text-amber-700">({provider.reviewsCount} reviews)</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Claim Speed: <span className="font-bold text-emerald-800">{provider.avgClaimSpeed}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Matrix: Sum Insured, Claim Ratio, Network Clinics & Pricing */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 bg-gray-50/70 border-b border-gray-100 divide-x divide-gray-100 text-center p-3">
                        <div className="p-2">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sum Insured</div>
                          <div className="font-serif font-bold text-base text-primary mt-0.5">{provider.sumInsured}</div>
                        </div>
                        <div className="p-2">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Settlement Ratio</div>
                          <div className="font-serif font-bold text-base text-emerald-700 mt-0.5">{provider.claimSettlementRatio}</div>
                        </div>
                        <div className="p-2">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cashless Clinics</div>
                          <div className="font-serif font-bold text-base text-slate-800 mt-0.5">{provider.cashlessClinicsCount}</div>
                        </div>
                        <div className="p-2">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Deductible / Co-pay</div>
                          <div className="text-xs font-bold text-slate-700 mt-1">{provider.deductible} ({provider.coPay})</div>
                        </div>
                      </div>

                      {/* Features Badges & Species */}
                      <div className="p-5 space-y-4">
                        <div>
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Key Covered Features & Benefits:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {provider.features.map((feat) => (
                              <span
                                key={feat}
                                className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-1 font-medium"
                              >
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-slate-700">Eligible Pets: </span>
                            {provider.speciesCovered.join(', ')} ({provider.eligibleAge})
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Waiting Period: </span>
                            Accidents: {provider.waitingPeriods.accidents} | Illness: {provider.waitingPeriods.illnesses}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions & Price */}
                      <div className="bg-[#FAF9F5] p-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            Starting Annual Premium
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif font-bold text-2xl text-primary">
                              ₹{provider.annualPremium.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-slate-500">/ year</span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5">
                              (₹{provider.monthlyPremium}/mo)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Includes all GST & cashless processing</span>
                        </div>

                        {/* Button Group */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                          {/* Compare Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleCompare(provider)}
                            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border transition cursor-pointer flex items-center gap-1.5 ${
                              isCompared
                                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                                : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-100 hover:border-emerald-700'
                            }`}
                            title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                          >
                            {isCompared ? <CheckSquare size={14} className="text-[#ffc83b]" /> : <Square size={14} />}
                            {isCompared ? 'Comparing' : 'Compare'}
                          </button>

                          {/* Details Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailsModal(provider)}
                            className="px-3.5 py-2 bg-white hover:bg-gray-100 text-slate-800 border border-gray-300 text-xs font-bold tracking-wider uppercase transition cursor-pointer"
                          >
                            Policy Details
                          </button>

                          {/* Instant Apply Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenApplyModal(provider)}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold tracking-widest uppercase transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <ShieldCheck size={14} className="text-accent-light" />
                            Get Covered Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* 3. REFINED 3-SLOT FLOATING COMPARISON DOCK */}
      {comparedProviders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[90] bg-[#0F2E23] text-white p-3 sm:p-4 border-t-2 border-[#ffc83b] shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Left info & slot indicator */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#ffc83b] text-[#0F2E23] flex items-center justify-center font-extrabold text-xs shadow-md">
                  {comparedProviders.length}/3
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-white tracking-wide">
                    Compare Insurance Underwriters ({comparedProviders.length}/3)
                  </h4>
                  <p className="text-[10px] text-slate-300">
                    {comparedProviders.length === 3 
                      ? 'Maximum 3 providers selected for comparison' 
                      : `Select up to ${3 - comparedProviders.length} more provider${3 - comparedProviders.length > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle: 3 Visual Slots Preview */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
              {[0, 1, 2].map((slotIdx) => {
                const prov = comparedProviders[slotIdx];
                return prov ? (
                  <div
                    key={prov.id}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 px-2.5 py-1 rounded text-xs transition shrink-0"
                  >
                    <img src={prov.logo} alt={prov.name} className="w-5 h-5 object-cover rounded-full" />
                    <span className="font-bold text-white text-[11px] truncate max-w-[110px]">
                      {prov.name.split(' ')[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCompare(prov)}
                      className="text-white/60 hover:text-red-400 p-0.5 cursor-pointer"
                      title="Remove provider"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    key={slotIdx}
                    className="flex items-center gap-1.5 border border-dashed border-white/30 text-white/50 px-2.5 py-1 rounded text-[11px] select-none shrink-0"
                  >
                    <span className="text-[10px] font-bold">Slot {slotIdx + 1}</span>
                    <span className="text-[9px] text-white/40">(Empty)</span>
                  </div>
                );
              })}
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setComparedProviders([])}
                className="text-xs text-slate-300 hover:text-white underline cursor-pointer px-2"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="px-4 sm:px-5 py-2 bg-[#ffc83b] hover:bg-[#ffe082] text-[#0F2E23] font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Scale size={14} /> Compare Side-by-Side ({comparedProviders.length}/3)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. DETAILED INSURANCE QUOTE MODAL (With Downloadable PDF Slip & Cost Breakdown) */}
      {showQuoteModal && detailedQuote && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-2xl sm:max-w-3xl my-auto shadow-2xl border border-gray-200 rounded-2xl overflow-hidden flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh]">
            
            {/* Modal Header with Branding */}
            <div className="bg-[#0F2E23] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ffc83b] text-[#0F2E23] flex items-center justify-center font-bold text-base shadow">
                  🛡️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      Official Pet Insurance Quotation
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 font-bold uppercase tracking-wider rounded">
                      IRDAI Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Quote ID: <strong className="text-[#ffc83b]">{detailedQuote.quoteId}</strong> • Valid for 30 Days ({detailedQuote.validUntil})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 text-xs custom-scrollbar">
              
              {/* Pet & Plan Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Pet Profile</span>
                  <strong className="text-sm text-slate-900 font-serif">{detailedQuote.petSpecies}</strong>
                  <span className="text-[11px] text-slate-600 block">{detailedQuote.ageGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Coverage Scope</span>
                  <strong className="text-xs text-primary font-bold block">{detailedQuote.coverageType}</strong>
                  <span className="text-[11px] text-emerald-700 font-semibold">Max Cover: {detailedQuote.sumInsured}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Network Benefits</span>
                  <span className="text-xs text-slate-800 font-bold block">{detailedQuote.cashlessClinics}</span>
                  <span className="text-[11px] text-slate-600">{detailedQuote.claimRatio}</span>
                </div>
              </div>

              {/* Comprehensive Premium Financial Breakdown Table */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" /> Itemized Premium Breakdown (INR)
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-2.5">Coverage Line Item & Medical Rider</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-2.5 font-medium text-slate-800">
                          Base Inpatient Surgery, ICU & Accidental Hospitalization
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          ₹{detailedQuote.basePremium.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-800">
                          {detailedQuote.coverageType} Critical Illness & Diagnostic Rider
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          ₹{detailedQuote.riderCost.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-800">
                          Cashless Processing Across 1,500+ Clinics & 24/7 Tele-Vet Access
                        </td>
                        <td className="p-2.5 text-right font-bold text-emerald-600 uppercase">
                          FREE
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-500">
                          Mandatory Goods & Services Tax (GST 18%)
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          ₹{detailedQuote.gst.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50/80 font-bold text-emerald-950 border-t-2 border-emerald-200">
                        <td className="p-3 text-sm">
                          Total Guaranteed Annual Premium
                        </td>
                        <td className="p-3 text-right text-base sm:text-lg text-emerald-950 font-serif">
                          ₹{detailedQuote.totalAnnual.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-600">/ yr</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-200 text-blue-900 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-medium">Flexible Monthly Zero-Cost EMI Option:</span>
                  <strong className="text-sm font-serif">~₹{detailedQuote.monthlyEmi.toLocaleString('en-IN')} / month</strong>
                </div>
              </div>

              {/* Policy Inclusions List */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Key Features Covered Under This Quotation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailedQuote.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="text-slate-700 text-xs font-medium">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Matching Underwriters */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-600" /> Recommended Matching Underwriters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {detailedQuote.matchingProviders.map((prov) => (
                    <div key={prov.id} className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs space-y-2 flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <img src={prov.logo} alt={prov.name} className="w-8 h-8 object-cover rounded-lg border border-gray-200" />
                        <div>
                          <strong className="text-xs text-slate-900 font-bold block leading-tight">{prov.name}</strong>
                          <span className="text-[10px] text-slate-500">{prov.company}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-gray-100">
                        <span className="text-slate-500">Claim Ratio:</span>
                        <strong className="text-emerald-700">{prov.claimSettlementRatio}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuoteModal(false);
                          handleOpenApplyModal(prov);
                        }}
                        className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-[11px] uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        Apply with {prov.name.split(' ')[0]}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-500">
                Rate guaranteed for 30 calendar days. No obligation required.
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleDownloadQuotePDF(detailedQuote)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#0F2E23] hover:bg-[#184534] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Download size={14} className="text-[#ffc83b]" /> Download / Print PDF Quote
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. COMPARISON MATRIX MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="bg-white text-slate-800 w-full max-w-5xl my-auto p-4 sm:p-6 shadow-2xl rounded-none relative flex flex-col min-h-0 max-h-[88vh] overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="text-primary" size={22} />
                <h3 className="font-serif font-bold text-lg sm:text-xl text-primary">
                  Side-by-Side Insurance Comparison
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 hover:text-red-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-3 border border-gray-300 w-1/4 font-bold uppercase tracking-wider">Features</th>
                    {comparedProviders.map((p) => (
                      <th key={p.id} className="p-3 border border-gray-300 text-center font-bold">
                        <div className="font-serif text-sm">{p.name}</div>
                        <div className="text-[10px] text-emerald-200 font-normal">{p.company}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Sum Insured</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-bold text-primary border border-gray-200">
                        {p.sumInsured}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Annual Premium</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-bold text-emerald-800 border border-gray-200">
                        ₹{p.annualPremium.toLocaleString('en-IN')} (₹{p.monthlyPremium}/mo)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Claim Settlement Ratio</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-bold text-emerald-700 border border-gray-200">
                        {p.claimSettlementRatio}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Cashless Clinics Network</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center border border-gray-200">
                        {p.cashlessClinicsCount}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Deductible & Co-Pay</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center border border-gray-200">
                        {p.deductible} / {p.coPay} co-pay
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Accident Waiting Period</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-semibold text-emerald-800 border border-gray-200">
                        {p.waitingPeriods.accidents}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Illness Waiting Period</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center border border-gray-200">
                        {p.waitingPeriods.illnesses}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Pre-existing Disease Cover</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center border border-gray-200">
                        {p.features.includes('Pre-existing Illness Cover') ? (
                          <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                            <Check size={14} /> Yes (After {p.waitingPeriods.preExisting})
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Standard Exclusions Apply</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-gray-50 border border-gray-200">Action</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center border border-gray-200">
                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            handleOpenApplyModal(p);
                          }}
                          className="px-3 py-1.5 bg-primary text-white font-bold text-[11px] uppercase tracking-wider hover:bg-primary-dark transition cursor-pointer"
                        >
                          Apply Now
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. POLICY APPLICATION MODAL */}
      {showApplyModal && selectedProviderForApply && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="bg-white text-slate-800 w-full max-w-2xl my-auto p-4 sm:p-6 shadow-2xl border border-gray-200 rounded-none relative flex flex-col min-h-0 max-h-[88vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-red-500 transition cursor-pointer z-20"
            >
              <X size={20} />
            </button>

            {submittedApplication ? (
              /* Success Confirmation Card */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <h3 className="font-serif font-bold text-2xl text-primary">
                  Policy Application Submitted!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your pet insurance quote and application has been successfully logged with{' '}
                  <span className="font-bold text-slate-800">{submittedApplication.company}</span>.
                </p>

                <div className="bg-gray-50 border border-gray-200 p-4 text-left space-y-2 max-w-md mx-auto text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Application ID:</span>
                    <span className="font-mono font-bold text-primary">{submittedApplication.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Pet Name:</span>
                    <span className="font-bold text-slate-800">{submittedApplication.petDetails.name} ({submittedApplication.petDetails.species})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Selected Tier:</span>
                    <span className="font-bold text-emerald-800">{submittedApplication.tierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Total Annual Premium:</span>
                    <span className="font-bold text-primary font-serif text-sm">₹{submittedApplication.annualPremium.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  An IRDAI certified pet insurance advisor will call you within 30 minutes at{' '}
                  <span className="font-bold text-slate-700">{submittedApplication.guardianDetails.phone}</span> to complete paperless KYC and issue your Cashless Digital Health Card.
                </p>

                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-8 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition cursor-pointer"
                >
                  Done & Back to Directory
                </button>
              </div>
            ) : (
              /* Application Form */
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 mb-5">
                  <img
                    src={selectedProviderForApply.logo}
                    alt={selectedProviderForApply.name}
                    className="w-10 h-10 object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-primary">
                      Apply for {selectedProviderForApply.name}
                    </h3>
                    <div className="text-xs text-slate-500">
                      Underwritten by {selectedProviderForApply.company}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                  {/* Tier Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1. Select Policy Tier & Coverage Limit
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {selectedProviderForApply.tiers.map((tier, idx) => (
                        <div
                          key={tier.name}
                          onClick={() => setSelectedTierIndex(idx)}
                          className={`p-3 border rounded-none cursor-pointer transition ${
                            selectedTierIndex === idx
                              ? 'bg-emerald-50/80 border-primary text-primary ring-1 ring-primary'
                              : 'bg-gray-50 border-gray-200 text-slate-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-bold text-xs">{tier.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Sum Insured: <span className="font-bold text-slate-800">{tier.sumInsured}</span></div>
                          <div className="font-serif font-bold text-sm text-primary mt-1">₹{tier.annualPrice.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/yr</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pet Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      2. Pet Details
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Pet Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bruno"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Species</label>
                        <select
                          value={petSpecies}
                          onChange={(e) => setPetSpecies(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        >
                          <option>Dog</option>
                          <option>Cat</option>
                          <option>Bird</option>
                          <option>Exotic Pet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Breed</label>
                        <input
                          type="text"
                          placeholder="e.g. Golden Retriever / Indie"
                          value={petBreed}
                          onChange={(e) => setPetBreed(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Age Bracket</label>
                        <select
                          value={petAge}
                          onChange={(e) => setPetAge(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        >
                          <option>2 - 12 Months (Puppy/Kitten)</option>
                          <option>1 - 3 Years</option>
                          <option>4 - 7 Years</option>
                          <option>8+ Years (Senior)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Gender</label>
                        <select
                          value={petGender}
                          onChange={(e) => setPetGender(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        >
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Microchip No. (Optional)</label>
                        <input
                          type="text"
                          placeholder="15-digit RFID tag"
                          value={microchipNumber}
                          onChange={(e) => setMicrochipNumber(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guardian Contact */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      3. Guardian Contact & Location
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-1">City</label>
                        <input
                          type="text"
                          value={ownerCity}
                          onChange={(e) => setOwnerCity(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Add-ons */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      4. Optional Value Add-ons
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'tick_cover', name: 'Tick Fever & Blood Parasite Emergency Lifeline', price: 499 },
                        { id: 'dental_opd', name: 'Annual Dental Cleaning & Routine OPD Allowance', price: 799 },
                        { id: 'lost_pet_gps', name: 'Lost Pet Search Campaign & Reward Reimbursement', price: 299 }
                      ].map((addon) => {
                        const isAdded = selectedAddons.includes(addon.id);
                        return (
                          <label
                            key={addon.id}
                            className={`flex items-center justify-between p-2 border rounded-none cursor-pointer transition text-xs ${
                              isAdded ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isAdded}
                                onChange={() => {
                                  setSelectedAddons((prev) =>
                                    prev.includes(addon.id) ? prev.filter((a) => a !== addon.id) : [...prev, addon.id]
                                  );
                                }}
                                className="rounded-none text-primary"
                              />
                              <span className="font-medium text-slate-700">{addon.name}</span>
                            </div>
                            <span className="font-bold text-primary">+₹{addon.price}/yr</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
                  >
                    <ShieldCheck size={16} className="text-accent-light" /> Submit Application & Get Policy Card
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. POLICY DETAILS & BROCHURE MODAL */}
      {showDetailsModal && selectedProviderForDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="bg-white text-slate-800 w-full max-w-3xl my-auto p-4 sm:p-6 shadow-2xl border border-gray-200 rounded-none relative flex flex-col min-h-0 max-h-[88vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-red-500 transition cursor-pointer z-20"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4 pb-4 border-b border-gray-200 mb-6">
              <img
                src={selectedProviderForDetails.logo}
                alt={selectedProviderForDetails.name}
                className="w-14 h-14 object-cover border border-gray-200"
              />
              <div>
                <h3 className="font-serif font-bold text-xl text-primary">
                  {selectedProviderForDetails.name}
                </h3>
                <div className="text-xs text-slate-500 font-medium">
                  Underwritten by {selectedProviderForDetails.company} • IRDAI Registered
                </div>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* Tiers Breakdown */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Available Policy Tiers & Inclusions:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedProviderForDetails.tiers.map((tier) => (
                    <div key={tier.name} className="p-3 bg-gray-50 border border-gray-200 space-y-2">
                      <div className="font-bold text-primary text-xs">{tier.name}</div>
                      <div className="font-serif font-bold text-base text-emerald-800">
                        ₹{tier.annualPrice.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500">/ yr</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Sum Insured: {tier.sumInsured}
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-gray-200">
                        {tier.covers.map((c) => (
                          <li key={c} className="flex items-start gap-1">
                            <Check size={11} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waiting Periods */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Waiting Periods Table:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold">Accidents</div>
                    <div className="font-bold text-emerald-950 mt-0.5">{selectedProviderForDetails.waitingPeriods.accidents}</div>
                  </div>
                  <div className="p-2 bg-gray-50 border border-gray-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">General Illnesses</div>
                    <div className="font-bold text-slate-800 mt-0.5">{selectedProviderForDetails.waitingPeriods.illnesses}</div>
                  </div>
                  <div className="p-2 bg-gray-50 border border-gray-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Hereditary Conditions</div>
                    <div className="font-bold text-slate-800 mt-0.5">{selectedProviderForDetails.waitingPeriods.hereditary}</div>
                  </div>
                  <div className="p-2 bg-gray-50 border border-gray-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Pre-existing Disease</div>
                    <div className="font-bold text-slate-800 mt-0.5">{selectedProviderForDetails.waitingPeriods.preExisting}</div>
                  </div>
                </div>
              </div>

              {/* Exclusions */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Standard Policy Exclusions:
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  {selectedProviderForDetails.exclusions.map((exc) => (
                    <li key={exc}>{exc}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-slate-600">
                  Customer Care: <span className="font-bold text-slate-800">{selectedProviderForDetails.phone}</span>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenApplyModal(selectedProviderForDetails);
                  }}
                  className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck size={14} className="text-accent-light" />
                  Get Covered Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. HOW IT WORKS & CLAIMS PROCESS */}
      <section className="bg-white border-t border-gray-200 py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">
              Simple & Paperless
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
              How Cashless Pet Insurance Claims Work in India
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-light">
              We eliminate tedious paperwork so you can focus 100% on your pet's recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_CLAIM_WORKS_STEPS.map((step) => (
              <div key={step.step} className="p-6 bg-[#FAF9F5] border border-gray-200 relative space-y-3">
                <div className="text-3xl font-serif font-bold text-accent-light">
                  {step.step}
                </div>
                <h3 className="font-serif font-bold text-lg text-primary">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PET INSURANCE FAQS */}
      <section className="bg-[#FAF9F5] border-t border-gray-200 py-14 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">
              Got Questions?
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
              Frequently Asked Questions About Pet Insurance
            </h2>
          </div>

          <div className="space-y-3">
            {INSURANCE_FAQS.map((faq, i) => (
              <div key={i} className="bg-white p-5 border border-gray-200 shadow-sm space-y-2">
                <h4 className="font-serif font-bold text-sm text-primary flex items-start gap-2">
                  <HelpCircle size={15} className="text-accent shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6 font-light">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. WHY DO PET PARENTS CHOOSE PAWORA? (TESTIMONIALS) */}
      <section className="bg-white border-t border-gray-200 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">
              Why Do Pet Parents Choose Pawora?
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              No. 1 Pet Care Provider with 100+ verified positive reinforcement trainers, behaviorists, and academies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PET_INSURANCE_TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-300 shadow-md">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 right-0 bg-purple-600 text-white rounded-full p-1 shadow">
                    <CheckCircle2 size={14} />
                  </div>
                </div>

                <div className="flex text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-gray-600 italic leading-relaxed">
                  "{t.quote}"
                </p>

                <div className="pt-2 border-t border-stone-100 w-full">
                  <h4 className="text-sm font-serif font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{t.dog} • {t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetInsurance;
