import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, FileText, AlertCircle, CheckCircle, DollarSign, Clock, 
  Plus, Search, X, ChevronRight, Download, Printer, Eye, Phone, Mail, 
  MessageSquare, Send, Check, Trash2, Edit3, ExternalLink, Building,
  Stethoscope, Filter, ArrowUpRight, Lock, Award, Heart, RefreshCw,
  Sparkles, CheckCircle2, User, HelpCircle, FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProviderWalletPayoutView from '../../../../components/dashboards/ProviderWalletPayoutView.jsx';
import ProviderReviewsView from '../../../../components/dashboards/ProviderReviewsView.jsx';
import { safeSetItem, safeGetItem } from '../../../../utils/safeStorage.js';
import { getStoredInsuranceApplications } from '../../../../data/insuranceData.js';

// Default initial policies
const INITIAL_POLICIES = [
  {
    id: 'POL-2026-9041',
    petName: 'Rocky',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '3 Years',
    ownerName: 'Aditya Sharma',
    phone: '+91 98451 12345',
    email: 'aditya.sharma@gmail.com',
    planType: 'Comprehensive Health & Surgery',
    planTier: 'Platinum Comprehensive',
    sumInsured: 250000,
    annualPremium: 4499,
    cashless: true,
    status: 'Active', // 'Active' | 'Under Review' | 'Expiring Soon' | 'Lapsed'
    startDate: '2025-10-15',
    expiryDate: '2027-10-15',
    microchip: 'CHIP-9820-KA-112',
    deductible: '₹500 / claim',
    coPay: '10%'
  },
  {
    id: 'POL-2026-8812',
    petName: 'Milo',
    species: 'Dog',
    breed: 'Beagle',
    age: '2 Years',
    ownerName: 'Sneha Sen',
    phone: '+91 98840 56789',
    email: 'sneha.sen@outlook.com',
    planType: 'OPD & Wellness Shield',
    planTier: 'Gold Wellness Care',
    sumInsured: 120000,
    annualPremium: 2999,
    cashless: true,
    status: 'Active',
    startDate: '2026-02-20',
    expiryDate: '2027-02-20',
    microchip: 'CHIP-4519-MH-084',
    deductible: '₹0 (Zero Deductible)',
    coPay: '0%'
  },
  {
    id: 'POL-2026-7734',
    petName: 'Bella',
    species: 'Dog',
    breed: 'German Shepherd',
    age: '4 Years',
    ownerName: 'Rohit Verma',
    phone: '+91 98112 34567',
    email: 'rohit.verma@yahoo.com',
    planType: 'Accident & Emergency Care',
    planTier: 'Silver Emergency',
    sumInsured: 150000,
    annualPremium: 3199,
    cashless: true,
    status: 'Active',
    startDate: '2025-11-01',
    expiryDate: '2027-11-01',
    microchip: 'CHIP-7721-DL-302',
    deductible: '₹1,000 / claim',
    coPay: '10%'
  },
  {
    id: 'POL-2026-6621',
    petName: 'Luna',
    species: 'Cat',
    breed: 'Persian Longhair',
    age: '1.5 Years',
    ownerName: 'Ananya Roy',
    phone: '+91 99223 88123',
    email: 'ananya.roy@gmail.com',
    planType: 'Comprehensive Health & Surgery',
    planTier: 'Feline Shield Deluxe',
    sumInsured: 100000,
    annualPremium: 2499,
    cashless: true,
    status: 'Under Review',
    startDate: '2026-11-01',
    expiryDate: '2027-11-01',
    microchip: 'Pending Verification',
    deductible: '₹500 / claim',
    coPay: '10%'
  },
  {
    id: 'POL-2026-5540',
    petName: 'Simba',
    species: 'Dog',
    breed: 'Shih Tzu',
    age: '5 Years',
    ownerName: 'Vikram Malhotra',
    phone: '+91 98765 99887',
    email: 'vikram.malhotra@gmail.com',
    planType: 'Gold Multi-Pet Family Shield',
    planTier: 'Pack Supreme',
    sumInsured: 500000,
    annualPremium: 6899,
    cashless: true,
    status: 'Expiring Soon',
    startDate: '2025-11-20',
    expiryDate: '2026-11-20',
    microchip: 'CHIP-9901-KA-554',
    deductible: '₹0 (Zero Deductible)',
    coPay: '0%'
  },
  {
    id: 'POL-2026-4439',
    petName: 'Bruno',
    species: 'Dog',
    breed: 'Rottweiler',
    age: '2.5 Years',
    ownerName: 'Deepak Nair',
    phone: '+91 97711 22334',
    email: 'deepak.nair@gmail.com',
    planType: 'Third-Party Liability Cover',
    planTier: 'Legal Defense Guard',
    sumInsured: 500000,
    annualPremium: 2199,
    cashless: false,
    status: 'Active',
    startDate: '2026-03-10',
    expiryDate: '2027-03-10',
    microchip: 'CHIP-1102-TN-776',
    deductible: '₹2,000 / claim',
    coPay: '15%'
  },
  {
    id: 'POL-2026-3321',
    petName: 'Kiwi',
    species: 'Bird',
    breed: 'Sun Conure Parrot',
    age: '1 Year',
    ownerName: 'Pooja Hegde',
    phone: '+91 98200 11998',
    email: 'pooja.h@gmail.com',
    planType: 'Comprehensive Health & Surgery',
    planTier: 'Avian & Exotic Lite',
    sumInsured: 60000,
    annualPremium: 2799,
    cashless: false,
    status: 'Active',
    startDate: '2026-05-12',
    expiryDate: '2027-05-12',
    microchip: 'LEG-BAND-552',
    deductible: '₹500 / claim',
    coPay: '10%'
  },
  {
    id: 'POL-2026-2210',
    petName: 'Coco',
    species: 'Cat',
    breed: 'Indie Domestic Shorthair',
    age: '2 Years',
    ownerName: 'Manish Pandey',
    phone: '+91 98333 44556',
    email: 'manish.p@gmail.com',
    planType: 'OPD & Wellness Shield',
    planTier: 'Wellness Essential',
    sumInsured: 50000,
    annualPremium: 1999,
    cashless: true,
    status: 'Active',
    startDate: '2026-01-05',
    expiryDate: '2027-01-05',
    microchip: 'CHIP-8812-MH-331',
    deductible: '₹0 / claim',
    coPay: '0%'
  }
];

// Default initial claims
const INITIAL_CLAIMS = [
  {
    id: 'CLM-2026-101',
    policyId: 'POL-2026-9041',
    petName: 'Rocky',
    petBreed: 'Golden Retriever',
    ownerName: 'Aditya Sharma',
    phone: '+91 98451 12345',
    hospitalName: 'Cessna Lifeline Veterinary Hospital, Bangalore',
    diagnosis: 'Torn Cranial Cruciate Ligament (CCL) Surgery & 3 Days ICU Hospitalization',
    claimAmount: 38500,
    approvedAmount: 36500,
    deductible: 2000,
    claimType: 'Cashless',
    status: 'Pending Review', // 'Pending Review' | 'Settled' | 'Rejected'
    filedAt: 'Today at 09:30 AM',
    incidentDate: '2026-11-08',
    doctorName: 'Dr. Vivek Menon (M.V.Sc Ortho)',
    billNumber: 'INV-CESSNA-9941',
    utr: null,
    notes: 'Pre-authorization requested by hospital desk under Cashless Network.'
  },
  {
    id: 'CLM-2026-102',
    policyId: 'POL-2026-7734',
    petName: 'Bella',
    petBreed: 'German Shepherd',
    ownerName: 'Rohit Verma',
    phone: '+91 98112 34567',
    hospitalName: 'Crown Vet Emergency Center, Mumbai',
    diagnosis: 'Acute Hemorrhagic Gastroenteritis & IV Electrolyte Infusion Therapy',
    claimAmount: 24200,
    approvedAmount: 22700,
    deductible: 1500,
    claimType: 'Reimbursement',
    status: 'Pending Review',
    filedAt: 'Yesterday at 04:15 PM',
    incidentDate: '2026-11-07',
    doctorName: 'Dr. Tanya Parekh (B.V.Sc)',
    billNumber: 'CV-MUM-44120',
    utr: null,
    notes: 'Prescriptions, discharge summary, and digital tax invoice attached.'
  },
  {
    id: 'CLM-2026-103',
    policyId: 'POL-2026-8812',
    petName: 'Milo',
    petBreed: 'Beagle',
    ownerName: 'Sneha Sen',
    phone: '+91 98840 56789',
    hospitalName: 'MaxiPet Advanced Care Hospital, Bangalore',
    diagnosis: 'Severe Foreign Body Endoscopy Ingestion Recovery',
    claimAmount: 14800,
    approvedAmount: 14800,
    deductible: 0,
    claimType: 'Cashless',
    status: 'Settled',
    filedAt: '3 days ago',
    incidentDate: '2026-11-04',
    doctorName: 'Dr. Ramesh Rao (Senior Surgeon)',
    billNumber: 'MAX-BLR-1204',
    utr: 'UTR8839210419',
    settledAt: '2026-11-05',
    notes: '100% cashless approval processed directly with hospital desk.'
  },
  {
    id: 'CLM-2026-104',
    policyId: 'POL-2026-4439',
    petName: 'Bruno',
    petBreed: 'Rottweiler',
    ownerName: 'Deepak Nair',
    phone: '+91 97711 22334',
    hospitalName: 'Apex Animal Hospital, Chennai',
    diagnosis: 'Third-Party Compound Wall Damage Investigation',
    claimAmount: 18500,
    approvedAmount: 16000,
    deductible: 2500,
    claimType: 'Reimbursement',
    status: 'Settled',
    filedAt: '1 week ago',
    incidentDate: '2026-10-28',
    doctorName: 'N/A (Third-Party Surveyor Report)',
    billNumber: 'REP-SURVEY-990',
    utr: 'UTR7719203481',
    settledAt: '2026-10-30',
    notes: 'Third-party liability settlement paid to affected homeowner.'
  },
  {
    id: 'CLM-2026-105',
    policyId: 'POL-2026-6621',
    petName: 'Luna',
    petBreed: 'Persian Longhair',
    ownerName: 'Ananya Roy',
    phone: '+91 99223 88123',
    hospitalName: 'Pet Holistic Care, Pune',
    diagnosis: 'Cosmetic Ear Cleaning & Breed Grooming Shampoo',
    claimAmount: 4800,
    approvedAmount: 0,
    deductible: 0,
    claimType: 'Reimbursement',
    status: 'Rejected',
    filedAt: '2 weeks ago',
    incidentDate: '2026-10-22',
    doctorName: 'Dr. Kulkarni',
    billNumber: 'PUNE-VET-004',
    utr: null,
    rejectionReason: 'Routine aesthetic grooming and cosmetic treatments are strictly excluded under Policy Clause 4.2.'
  }
];

// Default Inquiries / Messages
const INITIAL_INQUIRIES = [
  {
    id: 'inq-ins-01',
    senderName: 'Aditya Sharma',
    petName: 'Rocky (Golden Retriever)',
    policyId: 'POL-2026-9041',
    avatar: 'A',
    avatarColor: 'bg-emerald-100 text-emerald-800',
    date: '10:15 AM Today',
    unread: true,
    messages: [
      {
        id: 1,
        sender: 'parent',
        text: 'Hi team, Rocky has a scheduled post-op checkup tomorrow at Cessna Lifeline. Do I need to carry physical documents or will the hospital find the cashless policy online?',
        time: '10:15 AM'
      }
    ]
  },
  {
    id: 'inq-ins-02',
    senderName: 'Priya Nambiar',
    petName: 'Coco (Indie Puppy, 3 mos)',
    policyId: 'Prospective Lead',
    avatar: 'P',
    avatarColor: 'bg-amber-100 text-amber-800',
    date: 'Yesterday',
    unread: false,
    messages: [
      {
        id: 1,
        sender: 'parent',
        text: 'Hello! I adopted a 3-month-old indie puppy last week. Does your Comprehensive Health cover puppy vaccinations and microchipping?',
        time: 'Yesterday 3:45 PM'
      },
      {
        id: 2,
        sender: 'provider',
        text: 'Hello Priya! Yes, our OPD & Wellness Shield plan covers annual puppy vaccinations, deworming, and microchip registration reimbursement up to ₹1,500.',
        time: 'Yesterday 4:05 PM'
      }
    ]
  },
  {
    id: 'inq-ins-03',
    senderName: 'Karthik Raman',
    petName: 'Simba & Shadow (2 Cats)',
    policyId: 'POL-2026-5540',
    avatar: 'K',
    avatarColor: 'bg-sky-100 text-sky-800',
    date: '2 days ago',
    unread: false,
    messages: [
      {
        id: 1,
        sender: 'parent',
        text: 'Hi PawProtect, my Multi-Pet policy is up for renewal on Nov 20. Will my 15% multi-pet family discount and No-Claim Bonus (NCB) be applied automatically on checkout?',
        time: '2 days ago'
      },
      {
        id: 2,
        sender: 'provider',
        text: 'Absolutely Karthik! We have locked in your 15% family discount plus an additional 10% No-Claim Bonus for keeping Simba & Shadow claim-free this year!',
        time: '2 days ago'
      }
    ]
  }
];

const InsuranceProviderContent = ({ 
  activeTab, 
  user, 
  subscription, 
  onOpenSubscriptionModal, 
  onOpenPlanDetails 
}) => {
  // 1. POLICIES STATE
  const [policies, setPolicies] = useState(() => {
    let list = [];
    const saved = safeGetItem('joshpetshub_insurance_policies_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch (e) {}
    }

    // Merge customer-submitted applications from PetInsurance.jsx
    const submittedApps = getStoredInsuranceApplications();
    if (Array.isArray(submittedApps) && submittedApps.length > 0) {
      const existingIds = new Set(list.map(p => p.id));
      for (const app of submittedApps) {
        if (!existingIds.has(app.id)) {
          list.unshift({
            id: app.id,
            petName: app.petDetails?.name || 'Pet Patient',
            species: app.petDetails?.species || 'Dog',
            breed: app.petDetails?.breed || 'Standard Breed',
            age: app.petDetails?.age || '2 Years',
            ownerName: app.guardianDetails?.name || 'Pet Parent',
            phone: app.guardianDetails?.phone || '+91 98000 12345',
            email: app.guardianDetails?.email || 'parent@joshpetshub.com',
            planType: app.planType || 'Comprehensive Health & Surgery',
            planTier: app.tierName || 'Custom Direct Cover',
            sumInsured: Number(app.sumInsured?.toString().replace(/\D/g, '') || 200000),
            annualPremium: Number(app.annualPremium || 3499),
            cashless: app.cashlessEligible ?? true,
            status: app.status === 'UNDER_REVIEW' ? 'Under Review' : 'Active',
            startDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
            microchip: app.petDetails?.microchipNumber || 'Pending',
            deductible: '₹500 / claim',
            coPay: '10%'
          });
        }
      }
    }

    return list.length > 0 ? list : INITIAL_POLICIES;
  });

  const [policyFilter, setPolicyFilter] = useState('All');
  const [policySearch, setPolicySearch] = useState('');
  const [selectedPolicyForModal, setSelectedPolicyForModal] = useState(null);
  const [showIssuePolicyModal, setShowIssuePolicyModal] = useState(false);

  // New Policy Form State
  const [newPolicyForm, setNewPolicyForm] = useState({
    petName: '',
    species: 'Dog',
    breed: '',
    age: '',
    ownerName: '',
    phone: '',
    email: '',
    planType: 'Comprehensive Health & Surgery',
    planTier: 'Platinum Comprehensive',
    sumInsured: 250000,
    annualPremium: 4499,
    cashless: true,
    microchip: ''
  });

  // Save policies to storage and dispatch event
  const persistPolicies = (updated) => {
    setPolicies(updated);
    safeSetItem('joshpetshub_insurance_policies_v2', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('insurance_policies_updated', { detail: updated }));
  };

  // 2. CLAIMS STATE
  const [claims, setClaims] = useState(() => {
    const saved = safeGetItem('joshpetshub_insurance_claims_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_CLAIMS;
  });

  const [claimFilter, setClaimFilter] = useState('All');
  const [claimSearch, setClaimSearch] = useState('');
  const [selectedClaimForView, setSelectedClaimForView] = useState(null);
  const [settlementModalClaim, setSettlementModalClaim] = useState(null);
  const [settleAmountInput, setSettleAmountInput] = useState('');
  const [settleUtrInput, setSettleUtrInput] = useState('');
  const [showFileClaimModal, setShowFileClaimModal] = useState(false);

  // New Claim Form State
  const [newClaimForm, setNewClaimForm] = useState({
    policyId: '',
    petName: '',
    hospitalName: '',
    diagnosis: '',
    claimAmount: '',
    claimType: 'Cashless',
    doctorName: '',
    incidentDate: new Date().toISOString().split('T')[0]
  });

  const persistClaims = (updated) => {
    setClaims(updated);
    safeSetItem('joshpetshub_insurance_claims_v2', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('insurance_claims_updated', { detail: updated }));
  };

  // 3. INQUIRIES STATE
  const [inquiries, setInquiries] = useState(() => {
    const saved = safeGetItem('joshpetshub_insurance_inquiries_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_INQUIRIES;
  });

  const [activeInquiryId, setActiveInquiryId] = useState(INITIAL_INQUIRIES[0]?.id || null);
  const [chatInput, setChatInput] = useState('');
  const [inquirySearch, setInquirySearch] = useState('');

  const persistInquiries = (updated) => {
    setInquiries(updated);
    safeSetItem('joshpetshub_insurance_inquiries_v2', JSON.stringify(updated));
  };

  // Sync to parent dashboard KPI counts
  useEffect(() => {
    persistPolicies(policies);
    persistClaims(claims);
  }, []);

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchFilter = policyFilter === 'All' ? true : p.status === policyFilter;
      const q = policySearch.toLowerCase().trim();
      const matchSearch = !q || (
        p.petName.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.planType.toLowerCase().includes(q)
      );
      return matchFilter && matchSearch;
    });
  }, [policies, policyFilter, policySearch]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchFilter = claimFilter === 'All' ? true : c.status === claimFilter;
      const q = claimSearch.toLowerCase().trim();
      const matchSearch = !q || (
        c.id.toLowerCase().includes(q) ||
        c.policyId.toLowerCase().includes(q) ||
        c.petName.toLowerCase().includes(q) ||
        c.hospitalName.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q)
      );
      return matchFilter && matchSearch;
    });
  }, [claims, claimFilter, claimSearch]);

  // Handle Policy Actions
  const handleApprovePolicy = (policyId) => {
    const updated = policies.map(p => {
      if (p.id === policyId) {
        return { ...p, status: 'Active' };
      }
      return p;
    });
    persistPolicies(updated);
    toast.success(`Policy ${policyId} approved & activated!`);
  };

  const handleRenewPolicy = (policyId) => {
    const updated = policies.map(p => {
      if (p.id === policyId) {
        const currentExp = new Date(p.expiryDate);
        currentExp.setFullYear(currentExp.getFullYear() + 1);
        return { 
          ...p, 
          status: 'Active',
          expiryDate: currentExp.toISOString().split('T')[0]
        };
      }
      return p;
    });
    persistPolicies(updated);
    toast.success(`Policy ${policyId} renewed for 12 months!`);
  };

  const handleCancelPolicy = (policyId) => {
    if (window.confirm(`Are you sure you want to cancel policy ${policyId}?`)) {
      const updated = policies.map(p => {
        if (p.id === policyId) return { ...p, status: 'Lapsed' };
        return p;
      });
      persistPolicies(updated);
      toast.success(`Policy ${policyId} has been marked as Lapsed.`);
    }
  };

  const handleCreatePolicySubmit = (e) => {
    e.preventDefault();
    if (!newPolicyForm.petName || !newPolicyForm.ownerName || !newPolicyForm.phone) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    const newId = `POL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];

    const created = {
      id: newId,
      petName: newPolicyForm.petName.trim(),
      species: newPolicyForm.species,
      breed: newPolicyForm.breed.trim() || 'Standard / Mixed',
      age: newPolicyForm.age.trim() || '2 Years',
      ownerName: newPolicyForm.ownerName.trim(),
      phone: newPolicyForm.phone.trim(),
      email: newPolicyForm.email.trim() || 'parent@joshpetshub.com',
      planType: newPolicyForm.planType,
      planTier: newPolicyForm.planTier,
      sumInsured: Number(newPolicyForm.sumInsured) || 200000,
      annualPremium: Number(newPolicyForm.annualPremium) || 3999,
      cashless: newPolicyForm.cashless,
      status: 'Active',
      startDate: today,
      expiryDate: expiry,
      microchip: newPolicyForm.microchip.trim() || 'Pending',
      deductible: '₹500 / claim',
      coPay: '10%'
    };

    const updated = [created, ...policies];
    persistPolicies(updated);
    toast.success(`New Policy ${newId} issued successfully!`);
    setShowIssuePolicyModal(false);
    setNewPolicyForm({
      petName: '',
      species: 'Dog',
      breed: '',
      age: '',
      ownerName: '',
      phone: '',
      email: '',
      planType: 'Comprehensive Health & Surgery',
      planTier: 'Platinum Comprehensive',
      sumInsured: 250000,
      annualPremium: 4499,
      cashless: true,
      microchip: ''
    });
  };

  // Handle Claim Actions
  const handleOpenSettleModal = (claim) => {
    setSettlementModalClaim(claim);
    setSettleAmountInput(claim.approvedAmount || claim.claimAmount);
    setSettleUtrInput(`UTR${Date.now().toString().slice(-10)}`);
  };

  const handleConfirmSettlement = (e) => {
    e.preventDefault();
    if (!settleAmountInput || !settleUtrInput) {
      toast.error('Please enter settlement amount and transfer UTR');
      return;
    }

    const updated = claims.map(c => {
      if (c.id === settlementModalClaim.id) {
        return {
          ...c,
          status: 'Settled',
          approvedAmount: Number(settleAmountInput),
          utr: settleUtrInput.trim(),
          settledAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    persistClaims(updated);
    toast.success(`Claim ${settlementModalClaim.id} settled for ₹${Number(settleAmountInput).toLocaleString('en-IN')}! Ref: ${settleUtrInput}`);
    setSettlementModalClaim(null);
  };

  const handleRejectClaim = (claimId) => {
    const reason = window.prompt('Please enter the official claim rejection reason:', 'Documentation does not meet policy criteria.');
    if (reason) {
      const updated = claims.map(c => {
        if (c.id === claimId) {
          return { ...c, status: 'Rejected', rejectionReason: reason };
        }
        return c;
      });
      persistClaims(updated);
      toast.error(`Claim ${claimId} has been rejected.`);
    }
  };

  const handleCreateClaimSubmit = (e) => {
    e.preventDefault();
    if (!newClaimForm.policyId || !newClaimForm.hospitalName || !newClaimForm.claimAmount || !newClaimForm.diagnosis) {
      toast.error('Please enter all required claim fields');
      return;
    }

    const matchedPol = policies.find(p => p.id === newClaimForm.policyId);
    const newClaimId = `CLM-2026-${Math.floor(100 + Math.random() * 900)}`;

    const created = {
      id: newClaimId,
      policyId: newClaimForm.policyId,
      petName: matchedPol ? matchedPol.petName : (newClaimForm.petName || 'Pet Patient'),
      petBreed: matchedPol ? matchedPol.breed : 'Dog',
      ownerName: matchedPol ? matchedPol.ownerName : 'Pet Parent',
      phone: matchedPol ? matchedPol.phone : '+91 98000 00000',
      hospitalName: newClaimForm.hospitalName.trim(),
      diagnosis: newClaimForm.diagnosis.trim(),
      claimAmount: Number(newClaimForm.claimAmount),
      approvedAmount: Math.round(Number(newClaimForm.claimAmount) * 0.95),
      deductible: 1000,
      claimType: newClaimForm.claimType,
      status: 'Pending Review',
      filedAt: 'Just now',
      incidentDate: newClaimForm.incidentDate,
      doctorName: newClaimForm.doctorName.trim() || 'Attending Vet Specialist',
      billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      utr: null,
      notes: 'Direct claim filed via Agency Provider Desk.'
    };

    const updated = [created, ...claims];
    persistClaims(updated);
    toast.success(`Claim ${newClaimId} filed and added to review queue!`);
    setShowFileClaimModal(false);
    setNewClaimForm({
      policyId: '',
      petName: '',
      hospitalName: '',
      diagnosis: '',
      claimAmount: '',
      claimType: 'Cashless',
      doctorName: '',
      incidentDate: new Date().toISOString().split('T')[0]
    });
  };

  // Handle Messages / Live Chat
  const activeInquiry = useMemo(() => {
    return inquiries.find(inq => inq.id === activeInquiryId) || inquiries[0];
  }, [inquiries, activeInquiryId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeInquiry) return;

    const newMsg = {
      id: Date.now(),
      sender: 'provider',
      text: chatInput.trim(),
      time: 'Just now'
    };

    const updated = inquiries.map(inq => {
      if (inq.id === activeInquiry.id) {
        return {
          ...inq,
          unread: false,
          messages: [...inq.messages, newMsg]
        };
      }
      return inq;
    });

    persistInquiries(updated);
    setChatInput('');
  };

  // =========================================================================
  // ROUTING BY ACTIVE TAB
  // =========================================================================

  // 1. WALLET & PAYOUTS TAB
  if (activeTab === 'wallet') {
    return (
      <ProviderWalletPayoutView 
        serviceCategory="Pet Insurance" 
        storageKeyPrefix="insurance" 
        initialBalance={45000} 
        escrowAmount={15000} 
      />
    );
  }

  // 2. REVIEWS TAB
  if (activeTab === 'reviews') {
    return (
      <ProviderReviewsView
        serviceCategory="Pet Insurance"
        title="Customer Reviews"
        subtitle="Verified policyholder ratings, claim satisfaction feedback, and official agency replies."
        roleTitle="Insurance Partner"
        storageKeyPrefix="insurance"
      />
    );
  }

  // 3. ACTIVE POLICIES TAB
  if (activeTab === 'policies') {
    return (
      <div className="space-y-6">
        
        {/* Header & Action Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <ShieldCheck size={20} />
              </span>
              <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Policy Registry & Underwriting</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Issue, renew, and manage active IRDAI compliant pet healthcare and liability policies.
            </p>
          </div>

          <button
            onClick={() => setShowIssuePolicyModal(true)}
            className="bg-[#0F2E23] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} className="text-amber-400" /> Issue New Policy
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Active', 'Under Review', 'Expiring Soon', 'Lapsed'].map(filter => {
              const count = filter === 'All' 
                ? policies.length 
                : policies.filter(p => p.status === filter).length;
              return (
                <button
                  key={filter}
                  onClick={() => setPolicyFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    policyFilter === filter
                      ? 'bg-[#0F2E23] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={policySearch}
              onChange={(e) => setPolicySearch(e.target.value)}
              placeholder="Search by Pet, Parent, Policy #..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPolicies.map((pol) => {
            const isActive = pol.status === 'Active';
            const isExpiring = pol.status === 'Expiring Soon';
            const isUnderReview = pol.status === 'Under Review';
            const isLapsed = pol.status === 'Lapsed';

            return (
              <div 
                key={pol.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-600/30 transition shadow-xs hover:shadow-md space-y-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{pol.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isActive ? 'bg-emerald-100 text-emerald-800' :
                        isExpiring ? 'bg-amber-100 text-amber-800' :
                        isUnderReview ? 'bg-sky-100 text-sky-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>}
                        {pol.status}
                      </span>
                      {pol.cashless && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-md">
                          ⚡ Cashless
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-[#0F2E23] mt-1">
                      {pol.petName} <span className="text-sm font-semibold text-slate-400">({pol.breed})</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{pol.planType}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cover</span>
                    <span className="text-base font-black text-[#0F2E23]">
                      ₹{pol.sumInsured.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 block">
                      ₹{pol.annualPremium.toLocaleString('en-IN')}/yr
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 bg-slate-50/50 rounded-xl px-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Policyholder</span>
                    <span className="font-bold text-slate-700 truncate block">{pol.ownerName}</span>
                    <span className="text-[11px] text-slate-500">{pol.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Validity Expiry</span>
                    <span className="font-bold text-slate-700 block">{pol.expiryDate}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{pol.microchip}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => setSelectedPolicyForModal(pol)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F2E23] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={13} /> View Certificate
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isUnderReview && (
                      <button
                        onClick={() => handleApprovePolicy(pol.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={13} /> Activate
                      </button>
                    )}

                    {(isExpiring || isLapsed) && (
                      <button
                        onClick={() => handleRenewPolicy(pol.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={13} /> Renew 1 Yr
                      </button>
                    )}

                    {isActive && (
                      <button
                        onClick={() => handleCancelPolicy(pol.id)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-bold transition cursor-pointer"
                        title="Cancel Policy"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* POLICY CERTIFICATE MODAL */}
        {selectedPolicyForModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={24} className="text-emerald-700" />
                  <div>
                    <h3 className="text-lg font-black text-[#0F2E23]">Official Pet Insurance Certificate</h3>
                    <p className="text-xs text-slate-400 font-mono">IRDAI Registry Ref: {selectedPolicyForModal.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPolicyForModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Certificate Layout */}
              <div className="border-2 border-emerald-900/10 rounded-2xl p-6 bg-radial from-emerald-50/30 to-amber-50/20 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Verified Policyholder Cover
                    </span>
                    <h2 className="text-2xl font-black text-[#0F2E23] mt-2">{selectedPolicyForModal.petName}</h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      {selectedPolicyForModal.species} • {selectedPolicyForModal.breed} • {selectedPolicyForModal.age}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400">Sum Insured</span>
                    <p className="text-2xl font-black text-emerald-800">₹{selectedPolicyForModal.sumInsured.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Policyholder Name</span>
                    <p className="font-bold text-slate-800">{selectedPolicyForModal.ownerName}</p>
                    <p className="text-slate-500">{selectedPolicyForModal.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Annual Premium</span>
                    <p className="font-bold text-[#0F2E23]">₹{selectedPolicyForModal.annualPremium.toLocaleString('en-IN')}</p>
                    <p className="text-emerald-700 font-bold">100% Paid & Active</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Valid Term</span>
                    <p className="font-bold text-slate-800">{selectedPolicyForModal.startDate} to {selectedPolicyForModal.expiryDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Microchip Identification</span>
                    <p className="font-bold font-mono text-slate-800">{selectedPolicyForModal.microchip}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Cashless Hospital Direct Network Eligible</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Valid at 1,500+ network pet clinics across India. Deductible: {selectedPolicyForModal.deductible} | Co-Pay: {selectedPolicyForModal.coPay}.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> Print Certificate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Certificate downloaded successfully!');
                    setSelectedPolicyForModal(null);
                  }}
                  className="px-6 py-2.5 bg-[#0F2E23] text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} className="text-amber-400" /> Download PDF
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ISSUE NEW POLICY MODAL */}
        {showIssuePolicyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Plus size={22} className="text-emerald-700" />
                  <h3 className="text-xl font-black text-[#0F2E23]">Issue New Insurance Policy</h3>
                </div>
                <button
                  onClick={() => setShowIssuePolicyModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePolicySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pet Name *</label>
                    <input
                      type="text"
                      required
                      value={newPolicyForm.petName}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, petName: e.target.value })}
                      placeholder="e.g. Leo"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Species *</label>
                    <select
                      value={newPolicyForm.species}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, species: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium bg-white"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Exotic Pet">Exotic Pet</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Breed *</label>
                    <input
                      type="text"
                      required
                      value={newPolicyForm.breed}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, breed: e.target.value })}
                      placeholder="e.g. Beagle / Labrador"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Age *</label>
                    <input
                      type="text"
                      required
                      value={newPolicyForm.age}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, age: e.target.value })}
                      placeholder="e.g. 2 Years"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pet Parent Name *</label>
                    <input
                      type="text"
                      required
                      value={newPolicyForm.ownerName}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, ownerName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={newPolicyForm.phone}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, phone: e.target.value })}
                      placeholder="+91 98451 12345"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newPolicyForm.email}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, email: e.target.value })}
                      placeholder="parent@joshpetshub.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Plan Coverage Category</label>
                    <select
                      value={newPolicyForm.planType}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, planType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium bg-white"
                    >
                      <option value="Comprehensive Health & Surgery">Comprehensive Health & Surgery</option>
                      <option value="Accident & Emergency Care">Accident & Emergency Care</option>
                      <option value="OPD & Wellness Shield">OPD & Wellness Shield</option>
                      <option value="Third-Party Liability Cover">Third-Party Liability Cover</option>
                      <option value="Gold Multi-Pet Family Shield">Gold Multi-Pet Family Shield</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sum Insured Cover (₹)</label>
                    <select
                      value={newPolicyForm.sumInsured}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, sumInsured: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium bg-white"
                    >
                      <option value={100000}>₹1,00,000</option>
                      <option value={150000}>₹1,50,000</option>
                      <option value={200000}>₹2,00,000</option>
                      <option value={250000}>₹2,50,000</option>
                      <option value={500000}>₹5,00,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Annual Premium (₹)</label>
                    <input
                      type="number"
                      required
                      value={newPolicyForm.annualPremium}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, annualPremium: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Microchip Number</label>
                    <input
                      type="text"
                      value={newPolicyForm.microchip}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, microchip: e.target.value })}
                      placeholder="e.g. CHIP-9921-KA"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cashlessCheck"
                    checked={newPolicyForm.cashless}
                    onChange={(e) => setNewPolicyForm({ ...newPolicyForm, cashless: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="cashlessCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Enable Cashless Network Hospitalization Desk Access
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowIssuePolicyModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0F2E23] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={15} className="text-amber-400" /> Issue & Activate Policy
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    );
  }

  // 4. PENDING CLAIMS TAB
  if (activeTab === 'claims') {
    return (
      <div className="space-y-6">
        
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <AlertCircle size={20} />
              </span>
              <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Claims Adjudication Desk</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Review veterinary hospital claims, verify cashless authorizations, and process instant settlements.
            </p>
          </div>

          <button
            onClick={() => setShowFileClaimModal(true)}
            className="bg-[#0F2E23] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} className="text-amber-400" /> File New Claim
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Pending Review', 'Settled', 'Rejected'].map(filter => {
              const count = filter === 'All' 
                ? claims.length 
                : claims.filter(c => c.status === filter).length;
              return (
                <button
                  key={filter}
                  onClick={() => setClaimFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    claimFilter === filter
                      ? 'bg-[#0F2E23] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={claimSearch}
              onChange={(e) => setClaimSearch(e.target.value)}
              placeholder="Search Claim #, Policy #, Hospital..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const isPending = claim.status === 'Pending Review';
            const isSettled = claim.status === 'Settled';
            const isRejected = claim.status === 'Rejected';

            return (
              <div 
                key={claim.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-600/30 transition shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {claim.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">Policy: {claim.policyId}</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isPending ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        isSettled ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {isSettled && <CheckCircle size={10} />}
                        {claim.status}
                      </span>
                      <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {claim.claimType}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#0F2E23]">
                      {claim.petName} <span className="text-xs font-semibold text-slate-400">({claim.petBreed})</span> • {claim.diagnosis}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Building size={13} className="text-slate-400" />
                      <span>{claim.hospitalName}</span>
                      <span className="text-slate-300">•</span>
                      <span>Filed {claim.filedAt}</span>
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Claim Amount</span>
                    <span className="text-xl font-black text-[#0F2E23]">
                      ₹{claim.claimAmount.toLocaleString('en-IN')}
                    </span>
                    {isSettled && (
                      <span className="text-[11px] font-bold text-emerald-600 block">
                        Settled: ₹{claim.approvedAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {isRejected && claim.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <span className="font-bold">Rejection Note: </span> {claim.rejectionReason}
                  </div>
                )}

                {isSettled && claim.utr && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Settlement Reference (UTR): </span> 
                      <span className="font-mono">{claim.utr}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700">Cleared on {claim.settledAt}</span>
                  </div>
                )}

                {/* Claim Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedClaimForView(claim)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F2E23] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={13} /> View Audit Details
                  </button>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleRejectClaim(claim.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleOpenSettleModal(claim)}
                          className="px-4 py-1.5 bg-[#0F2E23] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <CheckCircle size={14} className="text-amber-400" /> Settle & Disburse
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* SETTLE CLAIM MODAL */}
        {settlementModalClaim && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={22} className="text-emerald-700" />
                  <h3 className="text-lg font-black text-[#0F2E23]">Authorize Claim Settlement</h3>
                </div>
                <button
                  onClick={() => setSettlementModalClaim(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Claim ID:</span>
                  <span className="font-mono font-bold text-slate-800">{settlementModalClaim.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pet & Policy:</span>
                  <span className="font-bold text-slate-800">{settlementModalClaim.petName} ({settlementModalClaim.policyId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hospital Claimed:</span>
                  <span className="font-bold text-slate-800">₹{settlementModalClaim.claimAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmSettlement} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Approved Settlement Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={settleAmountInput}
                    onChange={(e) => setSettleAmountInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:border-emerald-600 text-emerald-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Deductibles & co-pay automatically calculated.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank Reference / UTR Number *</label>
                  <input
                    type="text"
                    required
                    value={settleUtrInput}
                    onChange={(e) => setSettleUtrInput(e.target.value)}
                    placeholder="e.g. UTR4490123891"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSettlementModalClaim(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-emerald-800 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={15} /> Confirm & Mark Settled
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* FILE CLAIM MODAL */}
        {showFileClaimModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Plus size={22} className="text-emerald-700" />
                  <h3 className="text-xl font-black text-[#0F2E23]">File Hospital Claim</h3>
                </div>
                <button
                  onClick={() => setShowFileClaimModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateClaimSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Policy *</label>
                  <select
                    required
                    value={newClaimForm.policyId}
                    onChange={(e) => {
                      const p = policies.find(item => item.id === e.target.value);
                      setNewClaimForm({
                        ...newClaimForm,
                        policyId: e.target.value,
                        petName: p ? p.petName : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium bg-white"
                  >
                    <option value="">-- Choose Active Policy --</option>
                    {policies.filter(p => p.status === 'Active').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.petName} ({p.ownerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Veterinary Clinic / Hospital Name *</label>
                  <input
                    type="text"
                    required
                    value={newClaimForm.hospitalName}
                    onChange={(e) => setNewClaimForm({ ...newClaimForm, hospitalName: e.target.value })}
                    placeholder="e.g. Cessna Lifeline Hospital"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Treatment / Diagnosis Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={newClaimForm.diagnosis}
                    onChange={(e) => setNewClaimForm({ ...newClaimForm, diagnosis: e.target.value })}
                    placeholder="e.g. Inpatient Orthopedic Surgery & Radiology"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Claim Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newClaimForm.claimAmount}
                      onChange={(e) => setNewClaimForm({ ...newClaimForm, claimAmount: e.target.value })}
                      placeholder="e.g. 25000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Claim Type</label>
                    <select
                      value={newClaimForm.claimType}
                      onChange={(e) => setNewClaimForm({ ...newClaimForm, claimType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium bg-white"
                    >
                      <option value="Cashless">Cashless Network</option>
                      <option value="Reimbursement">Direct Reimbursement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Attending Vet Doctor Name</label>
                  <input
                    type="text"
                    value={newClaimForm.doctorName}
                    onChange={(e) => setNewClaimForm({ ...newClaimForm, doctorName: e.target.value })}
                    placeholder="Dr. Vivek Menon"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFileClaimModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0F2E23] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={15} className="text-amber-400" /> File Claim
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* CLAIM VIEW DETAILS MODAL */}
        {selectedClaimForView && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#0F2E23]">Claim Audit Record</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedClaimForView.id} • {selectedClaimForView.policyId}</p>
                </div>
                <button
                  onClick={() => setSelectedClaimForView(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Pet Name</span>
                    <span className="font-bold text-slate-800">{selectedClaimForView.petName} ({selectedClaimForView.petBreed})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Hospital</span>
                    <span className="font-bold text-slate-800">{selectedClaimForView.hospitalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Diagnosis</span>
                    <span className="font-bold text-slate-800 text-right max-w-xs">{selectedClaimForView.diagnosis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Doctor</span>
                    <span className="font-bold text-slate-800">{selectedClaimForView.doctorName || 'Senior Surgeon'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Hospital Tax Invoice #</span>
                    <span className="font-mono font-bold text-slate-800">{selectedClaimForView.billNumber}</span>
                  </div>
                </div>

                <div className="border border-emerald-100 bg-emerald-50/50 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">Claim Amount:</span>
                    <span className="font-bold text-slate-800">₹{selectedClaimForView.claimAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Applicable Deductible:</span>
                    <span>- ₹{selectedClaimForView.deductible || 0}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-200/60 font-black text-sm text-emerald-950">
                    <span>Approved Payout:</span>
                    <span>₹{(selectedClaimForView.approvedAmount || selectedClaimForView.claimAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {selectedClaimForView.notes && (
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Adjudication Notes</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedClaimForView.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForView(null)}
                  className="px-6 py-2.5 bg-[#0F2E23] text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition"
                >
                  Close Record
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // 5. CLIENT INQUIRIES / CHAT TAB
  if (activeTab === 'messages') {
    return (
      <div className="space-y-6">
        
        <div className="pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <MessageSquare size={20} />
            </span>
            <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Policyholder Inquiries & Support</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Answer questions regarding cashless clinic networks, pre-existing waiting periods, and policy endorsements.
          </p>
        </div>

        {/* Chat Console Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200 rounded-3xl overflow-hidden min-h-[550px] bg-white shadow-xs">
          
          {/* Left Inquiries List */}
          <div className="border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  placeholder="Filter inquiries..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {inquiries
                .filter(inq => !inquirySearch || inq.senderName.toLowerCase().includes(inquirySearch.toLowerCase()) || inq.petName.toLowerCase().includes(inquirySearch.toLowerCase()))
                .map(inq => {
                  const isSelected = activeInquiry?.id === inq.id;
                  const lastMsg = inq.messages[inq.messages.length - 1];

                  return (
                    <div
                      key={inq.id}
                      onClick={() => setActiveInquiryId(inq.id)}
                      className={`p-4 transition cursor-pointer flex items-start gap-3 ${
                        isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-700' : 'hover:bg-slate-100/70'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full ${inq.avatarColor} font-bold text-xs flex items-center justify-center shrink-0`}>
                        {inq.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="text-xs font-bold text-[#0F2E23] truncate">{inq.senderName}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0">{inq.date}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-800 truncate">{inq.petName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{lastMsg?.text || 'No messages'}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Chat Conversation View */}
          <div className="md:col-span-2 flex flex-col bg-white">
            {activeInquiry ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${activeInquiry.avatarColor} font-bold text-sm flex items-center justify-center shadow-xs`}>
                      {activeInquiry.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#0F2E23]">{activeInquiry.senderName}</h4>
                      <p className="text-xs text-emerald-800 font-medium">
                        {activeInquiry.petName} • <span className="font-mono text-slate-500">{activeInquiry.policyId}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Verified Lead
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
                  {activeInquiry.messages.map(msg => {
                    const isAgency = msg.sender === 'provider';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${isAgency ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                          isAgency 
                            ? 'bg-[#0F2E23] text-white rounded-br-xs' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Consultation Chips */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto text-[11px]">
                  <span className="text-slate-400 font-bold shrink-0">Quick reply:</span>
                  {[
                    'Yes, cashless pre-authorization is 100% active at Cessna Lifeline.',
                    'Our OPD wellness plan covers all routine booster vaccinations.',
                    'Your 15% multi-pet renewal discount is verified in system.'
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setChatInput(phrase)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-emerald-600 hover:text-emerald-800 transition whitespace-nowrap cursor-pointer"
                    >
                      {phrase.slice(0, 35)}...
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type official agency consultation reply..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-[#0F2E23] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send size={14} className="text-amber-400" /> Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select an inquiry to view conversation.
              </div>
            )}
          </div>

        </div>

      </div>
    );
  }

  return null;
};

export default InsuranceProviderContent;
