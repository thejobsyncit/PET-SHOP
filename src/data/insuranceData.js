/**
 * Pet Insurance Dataset & Local Storage Helpers
 * Complete dataset for IRDAI compliant pet insurance plans, underwriters, filters, and local applications.
 */

export const INSURANCE_PLAN_TYPES = [
  'All Plans',
  'Comprehensive Health & Surgery',
  'Accident & Emergency Care',
  'OPD & Wellness Shield',
  'Mortality & Life Cover',
  'Third-Party Liability Cover',
  'Gold Multi-Pet Family Shield'
];

export const INSURANCE_FEATURES = [
  { id: 'cashless', label: 'Cashless Vet Network', description: 'Direct claim settlement at 1,500+ clinics without paying out-of-pocket' },
  { id: 'surgery', label: '100% Surgery & Hospitalization', description: 'Covers pre/post-op care, anesthesia, surgeon fees, and ICU' },
  { id: 'opd', label: 'OPD & Prescription Medicines', description: 'Reimbursement for vet consultation fees, medicines, and routine visits' },
  { id: 'pre_existing', label: 'Pre-existing Illness Cover', description: 'Protection for pre-existing conditions after specified waiting period' },
  { id: 'hereditary', label: 'Hereditary / Breed-Specific Conditions', description: 'Covers hip dysplasia, respiratory distress, cherry eye, etc.' },
  { id: 'diagnostics', label: 'Diagnostic Tests & Scans', description: 'Blood work, digital X-Rays, Ultrasound, MRI, and CT Scans' },
  { id: 'accident_zero', label: 'Zero Accident Waiting Period', description: 'Emergency accident coverage starts immediately from Day 1' },
  { id: 'third_party', label: 'Third-Party Liability up to ₹5L', description: 'Legal protection against pet bites or accidental property damage' },
  { id: 'theft_lost', label: 'Theft & Lost Pet Reward', description: 'Advertising expenses and finder reward reimbursement for lost pets' },
  { id: 'fast_claims', label: 'Direct Fast-Track Claims (<4 hrs)', description: 'Express claim approvals with minimum paperwork' },
  { id: 'annual_checkup', label: 'Free Annual Health Checkup', description: 'Complimentary annual comprehensive checkup and vaccination reminder' },
  { id: 'ncb', label: 'No-Claim Bonus (NCB) Discount', description: 'Up to 20% discount on annual policy renewal for claim-free years' }
];

export const PET_SPECIES_OPTIONS = ['All Pets', 'Dogs', 'Cats', 'Birds', 'Exotic Pets'];

export const PET_INSURANCE_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Aditya & Priya Sharma',
    dog: 'Rocky (Golden Retriever)',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    quote: 'Our team ensures that your pet is in safe and secure hands. Rocky used to pull intensely on the leash; after 6 sessions he walks right by our side!',
    rating: 5
  },
  {
    id: 't-2',
    name: 'Kabir & Sneha Sen',
    dog: 'Milo (Beagle)',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
    quote: 'Our team comprises professional trainers with hands-on positive reinforcement skills. Milo stopped his separation barking within 2 weeks.',
    rating: 5
  },
  {
    id: 't-3',
    name: 'Rohit & Natasha Verma',
    dog: 'Bella (German Shepherd)',
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400',
    quote: 'We believe in humane, force-free science. Bella learned perfect recall, agility jumps, and stays calm around strangers. Highly recommend Pawora trainers!',
    rating: 5
  }
];

export const INITIAL_INSURANCE_PROVIDERS = [
  {
    id: 'ins-prov-01',
    name: 'Bajaj Allianz Pet Health Shield',
    company: 'Bajaj Allianz General Insurance Co. Ltd.',
    category: 'Comprehensive Health & Surgery',
    planType: 'Comprehensive Health & Surgery',
    tagline: "India's Most Trusted 360° Pet Healthcare Cover with Pan-India Cashless Hospitals",
    logo: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200',
    rating: 4.95,
    reviewsCount: 480,
    claimSettlementRatio: '98.8%',
    avgClaimSpeed: '4 Hours',
    cashlessClinicsCount: '1,450+',
    verifiedIrdai: true,
    annualPremium: 4499,
    monthlyPremium: 399,
    sumInsured: '₹2,50,000',
    sumInsuredValue: 250000,
    deductible: '₹500 / claim',
    coPay: '10%',
    eligibleAge: '8 Weeks - 10 Years',
    speciesCovered: ['Dogs', 'Cats'],
    statesSupported: ['All States'],
    phone: '1800-209-5858',
    whatsapp: '+91 98765 43210',
    email: 'petcare@bajajallianz.co.in',
    features: [
      'Cashless Vet Network',
      '100% Surgery & Hospitalization',
      'Diagnostic Tests & Scans',
      'Hereditary / Breed-Specific Conditions',
      'Third-Party Liability up to ₹5L',
      'Direct Fast-Track Claims (<4 hrs)',
      'No-Claim Bonus (NCB) Discount'
    ],
    tiers: [
      {
        name: 'Silver Essential',
        sumInsured: '₹75,000',
        annualPrice: 2999,
        monthlyPrice: 269,
        covers: ['Accidental Injury', 'Emergency Surgery', 'Standard Hospitalization (up to ₹20,000)']
      },
      {
        name: 'Gold Comprehensive (Popular)',
        sumInsured: '₹1,50,000',
        annualPrice: 4499,
        monthlyPrice: 399,
        covers: ['Accidents & Illnesses', 'Major Surgeries (100%)', 'Diagnostic Scans & Blood Tests', 'Third-Party Liability (₹2L)']
      },
      {
        name: 'Platinum Elite Shield',
        sumInsured: '₹2,50,000',
        annualPrice: 6999,
        monthlyPrice: 620,
        covers: ['Zero Deductible', 'Hereditary Conditions', 'Cancer & Terminal Illness', 'OPD Allowance (₹15,000)', 'Third-Party Liability (₹5L)']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days (Instant Cover)',
      illnesses: '15 Days',
      hereditary: '90 Days',
      preExisting: '12 Months'
    },
    exclusions: [
      'Cosmetic or aesthetic ear cropping / tail docking',
      'Breeding or pregnancy related routine complications',
      'Conditions diagnosed during initial waiting period'
    ]
  },
  {
    id: 'ins-prov-02',
    name: 'Digit Pet Care Super Shield',
    company: 'Go Digit General Insurance Ltd.',
    category: 'Comprehensive Health & Surgery',
    planType: 'Comprehensive Health & Surgery',
    tagline: '100% Paperless Smartphone Claims with Zero Waiting Period on Accidents',
    logo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200',
    rating: 4.92,
    reviewsCount: 520,
    claimSettlementRatio: '99.1%',
    avgClaimSpeed: '2 Hours (App)',
    cashlessClinicsCount: '1,200+',
    verifiedIrdai: true,
    annualPremium: 5299,
    monthlyPremium: 469,
    sumInsured: '₹3,00,000',
    sumInsuredValue: 300000,
    deductible: 'Zero on Accidents',
    coPay: '5%',
    eligibleAge: '2 Months - 12 Years',
    speciesCovered: ['Dogs', 'Cats'],
    statesSupported: ['All States'],
    phone: '1800-258-4242',
    whatsapp: '+91 99887 76655',
    email: 'hello@godigit.com',
    features: [
      'Cashless Vet Network',
      'Zero Accident Waiting Period',
      'OPD & Prescription Medicines',
      '100% Surgery & Hospitalization',
      'Pre-existing Illness Cover',
      'Theft & Lost Pet Reward',
      'Direct Fast-Track Claims (<4 hrs)'
    ],
    tiers: [
      {
        name: 'Digit Basic',
        sumInsured: '₹1,00,000',
        annualPrice: 3499,
        monthlyPrice: 310,
        covers: ['Accident Hospitalization', 'Fractures & Wounds', 'ICU Stay (up to 7 days)']
      },
      {
        name: 'Digit Super (Recommended)',
        sumInsured: '₹2,00,000',
        annualPrice: 5299,
        monthlyPrice: 469,
        covers: ['Accidents & All Major Illnesses', 'Emergency Surgery', 'OPD & Pharmacy Reimbursement', 'Lost Pet Reward (₹10,000)']
      },
      {
        name: 'Digit Supreme 360',
        sumInsured: '₹3,00,000',
        annualPrice: 7899,
        monthlyPrice: 699,
        covers: ['Pre-existing Conditions Cover', 'Specialist Consultations', 'MRI / CT Scans', 'Worldwide Travel Transit Cover']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days',
      illnesses: '10 Days',
      hereditary: '60 Days',
      preExisting: '12 Months'
    },
    exclusions: ['Intentional neglect', 'Unapproved experimental treatments', 'Dietary supplements unless prescribed']
  },
  {
    id: 'ins-prov-03',
    name: 'New India Assurance PawShield Elite',
    company: 'The New India Assurance Co. Ltd. (Govt. of India)',
    category: 'Comprehensive Health & Surgery',
    planType: 'Comprehensive Health & Surgery',
    tagline: 'PSU Trust & Stability for High-Value Surgical, Critical Care & Mortality Cover',
    logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200',
    rating: 4.85,
    reviewsCount: 310,
    claimSettlementRatio: '97.6%',
    avgClaimSpeed: '24 Hours',
    cashlessClinicsCount: '950+',
    verifiedIrdai: true,
    annualPremium: 3899,
    monthlyPremium: 349,
    sumInsured: '₹2,00,000',
    sumInsuredValue: 200000,
    deductible: '₹1,000 / claim',
    coPay: '10%',
    eligibleAge: '3 Months - 9 Years',
    speciesCovered: ['Dogs', 'Cats', 'Birds'],
    statesSupported: ['All States'],
    phone: '1800-209-1415',
    whatsapp: '+91 97766 55443',
    email: 'support@newindia.co.in',
    features: [
      '100% Surgery & Hospitalization',
      'Diagnostic Tests & Scans',
      'Pre-existing Illness Cover',
      'Third-Party Liability up to ₹5L',
      'No-Claim Bonus (NCB) Discount'
    ],
    tiers: [
      {
        name: 'Standard PSU Cover',
        sumInsured: '₹1,00,000',
        annualPrice: 2899,
        monthlyPrice: 259,
        covers: ['Surgery & Operating Theater', 'Hospital Room Rent', 'Anesthesia & Sutures']
      },
      {
        name: 'Elite Health & Life',
        sumInsured: '₹2,00,000',
        annualPrice: 3899,
        monthlyPrice: 349,
        covers: ['Complete Surgical Cover', 'Death / Mortality Compensation', 'Third-Party Liability (₹3L)', 'Diagnostic Lab Tests']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days',
      illnesses: '30 Days',
      hereditary: '180 Days',
      preExisting: '24 Months'
    },
    exclusions: ['Non-veterinary uncertified clinics', 'Grooming procedures']
  },
  {
    id: 'ins-prov-04',
    name: 'Pawora Guardian Plus (Everyday Wellness)',
    company: 'Pawora Certified Health Network & Underwriters',
    category: 'OPD & Wellness Shield',
    planType: 'OPD & Wellness Shield',
    tagline: 'Complete Routine Vet Visits, Vaccinations, Deworming & Unlimited 24/7 Tele-Vets',
    logo: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=1200',
    rating: 4.98,
    reviewsCount: 640,
    claimSettlementRatio: '99.6%',
    avgClaimSpeed: 'Instant (Pawora Wallet)',
    cashlessClinicsCount: '1,650+',
    verifiedIrdai: true,
    annualPremium: 2999,
    monthlyPremium: 269,
    sumInsured: '₹1,20,000',
    sumInsuredValue: 120000,
    deductible: '₹0 (Zero Deductible)',
    coPay: '0%',
    eligibleAge: '6 Weeks - 14 Years',
    speciesCovered: ['Dogs', 'Cats', 'Birds', 'Exotic Pets'],
    statesSupported: ['All States'],
    phone: '1800-PAWORA-PET',
    whatsapp: '+91 98450 11223',
    email: 'insurance@pawora.com',
    features: [
      'Cashless Vet Network',
      'OPD & Prescription Medicines',
      'Free Annual Health Checkup',
      'Diagnostic Tests & Scans',
      'Direct Fast-Track Claims (<4 hrs)',
      'Zero Accident Waiting Period'
    ],
    tiers: [
      {
        name: 'Wellness Essential',
        sumInsured: '₹50,000',
        annualPrice: 1999,
        monthlyPrice: 179,
        covers: ['5 Vet OPD Consultations / yr', 'Annual DHPPiL / Rabies Vaccine', 'Deworming & Tick Treatment', 'Unlimited 24/7 Tele-Vet']
      },
      {
        name: 'Guardian Prime (Most Popular)',
        sumInsured: '₹1,20,000',
        annualPrice: 2999,
        monthlyPrice: 269,
        covers: ['Unlimited Vet OPD Visits (100% reimbursed)', 'Prescription Medicines Cover', 'Blood Test & Microscopic Exams', 'Annual Dental Scaling Allowance']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days',
      illnesses: '0 Days for OPD / 7 Days',
      hereditary: '30 Days',
      preExisting: '6 Months'
    },
    exclusions: ['Cosmetic ear croppings', 'Breeding fees']
  },
  {
    id: 'ins-prov-05',
    name: 'Care Health Pet Armor 360',
    company: 'Care Health Insurance Ltd.',
    category: 'Accident & Emergency Care',
    planType: 'Accident & Emergency Care',
    tagline: 'Instant Emergency ICU, Fracture, Foreign Body Ingestion & Poisoning Lifeline',
    logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=1200',
    rating: 4.88,
    reviewsCount: 390,
    claimSettlementRatio: '98.5%',
    avgClaimSpeed: '6 Hours',
    cashlessClinicsCount: '1,100+',
    verifiedIrdai: true,
    annualPremium: 2499,
    monthlyPremium: 220,
    sumInsured: '₹1,50,000',
    sumInsuredValue: 150000,
    deductible: '₹500 / claim',
    coPay: '5%',
    eligibleAge: '8 Weeks - 11 Years',
    speciesCovered: ['Dogs', 'Cats'],
    statesSupported: ['All States'],
    phone: '1800-102-4477',
    whatsapp: '+91 98112 33445',
    email: 'customerfirst@careinsurance.com',
    features: [
      'Cashless Vet Network',
      'Zero Accident Waiting Period',
      '100% Surgery & Hospitalization',
      'Diagnostic Tests & Scans',
      'Third-Party Liability up to ₹5L'
    ],
    tiers: [
      {
        name: 'Emergency Shield',
        sumInsured: '₹80,000',
        annualPrice: 1799,
        monthlyPrice: 159,
        covers: ['Accident Traumas', 'Dog Bite Wound Repairs', 'Anti-venom & Poisoning Emergency']
      },
      {
        name: 'Emergency Armor Plus',
        sumInsured: '₹1,50,000',
        annualPrice: 2499,
        monthlyPrice: 220,
        covers: ['Foreign Object Endoscopy / Laparotomy', 'Bone Fracture Fixation & Plating', 'Third-Party Damage Cover (₹2L)']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days',
      illnesses: '15 Days',
      hereditary: '90 Days',
      preExisting: '12 Months'
    },
    exclusions: ['Routine vaccination', 'Tick baths']
  },
  {
    id: 'ins-prov-06',
    name: 'Future Generali Dog & Cat Shield',
    company: 'Future Generali India Insurance Co. Ltd.',
    category: 'Third-Party Liability Cover',
    planType: 'Third-Party Liability Cover',
    tagline: 'Defend Against Pet Bite Lawsuits, Property Disputes & Sudden Emergency Medicals',
    logo: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200',
    rating: 4.82,
    reviewsCount: 220,
    claimSettlementRatio: '97.9%',
    avgClaimSpeed: '12 Hours',
    cashlessClinicsCount: '800+',
    verifiedIrdai: true,
    annualPremium: 3199,
    monthlyPremium: 285,
    sumInsured: '₹5,00,000 (Liability + Med)',
    sumInsuredValue: 500000,
    deductible: '₹1,000 / event',
    coPay: '10%',
    eligibleAge: '6 Months - 8 Years',
    speciesCovered: ['Dogs', 'Cats'],
    statesSupported: ['All States'],
    phone: '1800-220-233',
    whatsapp: '+91 93214 55667',
    email: 'care@futuregenerali.in',
    features: [
      'Third-Party Liability up to ₹5L',
      'Theft & Lost Pet Reward',
      '100% Surgery & Hospitalization',
      'Zero Accident Waiting Period',
      'No-Claim Bonus (NCB) Discount'
    ],
    tiers: [
      {
        name: 'Legal Defense Guard',
        sumInsured: '₹2,50,000',
        annualPrice: 2199,
        monthlyPrice: 195,
        covers: ['Third-Party Bodily Injury / Bite Claims', 'Property Damage Reimbursement', 'Legal Representation Costs']
      },
      {
        name: 'Total Protection Supreme',
        sumInsured: '₹5,00,000',
        annualPrice: 3199,
        monthlyPrice: 285,
        covers: ['Third-Party Liability (₹5L)', 'Accidental Medical Care (₹1L)', 'Lost Pet Search Campaign (₹20,000)']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days',
      illnesses: '30 Days',
      hereditary: '120 Days',
      preExisting: '24 Months'
    },
    exclusions: ['Illegal prohibited breeds without municipal license', 'Intentional incitement to attack']
  },
  {
    id: 'ins-prov-07',
    name: 'IFFCO-Tokio Exotic & Avian Pet Care',
    company: 'IFFCO-Tokio General Insurance Co. Ltd.',
    category: 'Comprehensive Health & Surgery',
    planType: 'Comprehensive Health & Surgery',
    tagline: 'Dedicated Healthcare & Surgical Cover for Parrots, Macaws, Reptiles, Rabbits & Indie Pets',
    logo: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1200',
    rating: 4.91,
    reviewsCount: 185,
    claimSettlementRatio: '98.3%',
    avgClaimSpeed: '8 Hours',
    cashlessClinicsCount: '650+',
    verifiedIrdai: true,
    annualPremium: 4199,
    monthlyPremium: 375,
    sumInsured: '₹1,50,000',
    sumInsuredValue: 150000,
    deductible: '₹500 / claim',
    coPay: '10%',
    eligibleAge: '1 Month - 15 Years',
    speciesCovered: ['Birds', 'Exotic Pets', 'Dogs', 'Cats'],
    statesSupported: ['All States'],
    phone: '1800-103-5499',
    whatsapp: '+91 98111 88990',
    email: 'websupport@iffcotokio.co.in',
    features: [
      'Diagnostic Tests & Scans',
      '100% Surgery & Hospitalization',
      'Hereditary / Breed-Specific Conditions',
      'Free Annual Health Checkup',
      'Pre-existing Illness Cover'
    ],
    tiers: [
      {
        name: 'Avian & Exotic Lite',
        sumInsured: '₹60,000',
        annualPrice: 2799,
        monthlyPrice: 249,
        covers: ['Avian Surgery & Beak Repair', 'Exotic Pet Diagnostic Blood Profile', 'Nebulization & Oxygen Therapy']
      },
      {
        name: 'Exotic Comprehensive',
        sumInsured: '₹1,50,000',
        annualPrice: 4199,
        monthlyPrice: 375,
        covers: ['Major Inpatient Surgeries', 'Specialist Exotic Vet Fees', 'Diagnostic Endoscopy', 'Emergency Incubator Stays']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days',
      illnesses: '15 Days',
      hereditary: '60 Days',
      preExisting: '12 Months'
    },
    exclusions: ['Unregistered exotic wildlife requiring Wildlife Protection Act clearance']
  },
  {
    id: 'ins-prov-08',
    name: 'HDFC ERGO PawProtect Multi-Pet Shield',
    company: 'HDFC ERGO General Insurance Co. Ltd.',
    category: 'Gold Multi-Pet Family Shield',
    planType: 'Gold Multi-Pet Family Shield',
    tagline: 'Multi-Pet 15% Family Discount with Zero Co-Pay & Unlimited Free Video Vet Consults',
    logo: 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=1200',
    rating: 4.97,
    reviewsCount: 590,
    claimSettlementRatio: '99.3%',
    avgClaimSpeed: '3 Hours',
    cashlessClinicsCount: '1,800+',
    verifiedIrdai: true,
    annualPremium: 6899,
    monthlyPremium: 599,
    sumInsured: '₹5,00,000 (Multi-Pet Pool)',
    sumInsuredValue: 500000,
    deductible: '₹0 (Zero Deductible)',
    coPay: '0%',
    eligibleAge: '8 Weeks - 13 Years',
    speciesCovered: ['Dogs', 'Cats'],
    statesSupported: ['All States'],
    phone: '1800-2666-400',
    whatsapp: '+91 98200 44556',
    email: 'care@hdfcergo.com',
    features: [
      'Cashless Vet Network',
      'Pre-existing Illness Cover',
      'Hereditary / Breed-Specific Conditions',
      'OPD & Prescription Medicines',
      '100% Surgery & Hospitalization',
      'Third-Party Liability up to ₹5L',
      'Free Annual Health Checkup',
      'No-Claim Bonus (NCB) Discount'
    ],
    tiers: [
      {
        name: 'Family Duo (2 Pets)',
        sumInsured: '₹3,00,000 Floater',
        annualPrice: 6899,
        monthlyPrice: 599,
        covers: ['Shared Floater Sum Insured', 'Accidents & Full Illnesses', 'Zero Deductible & Zero Co-Pay', '15% Multi-Pet Discount applied']
      },
      {
        name: 'Pack Supreme (3+ Pets)',
        sumInsured: '₹6,00,000 Floater',
        annualPrice: 10499,
        monthlyPrice: 899,
        covers: ['Unlimited Tele-Vet Consults', 'Full Hereditary Cover', 'OPD Reimbursement for all pets', 'Loss & Theft Recovery']
      }
    ],
    waitingPeriods: {
      accidents: '0 Days',
      illnesses: '10 Days',
      hereditary: '45 Days',
      preExisting: '12 Months'
    },
    exclusions: ['Non-prescribed herbal supplements', 'Cosmetic declawing/ear styling']
  }
];

export const INSURANCE_FAQS = [
  {
    q: 'How does Cashless Pet Hospitalization work in India?',
    a: 'Just like human health insurance, you walk into any of the 1,500+ partner veterinary clinics or animal hospitals with your Pawora Digital Policy Card. The hospital coordinates directly with the insurer desk and clears medical bills instantly upon discharge, without you needing to pay upfront.'
  },
  {
    q: 'Are Indie / Indian mixed-breed dogs and cats eligible for insurance?',
    a: 'Yes, absolutely! Indie pets are 100% covered by all partner insurers (Bajaj Allianz, Digit, Pawora Guardian, etc.). In fact, Indies often receive lower premium rates due to higher natural immunity and lower genetic risk factors.'
  },
  {
    q: 'What is Third-Party Liability cover in pet insurance?',
    a: 'Third-party liability protects you financially and legally if your dog or cat accidentally bites someone, causes bodily injury to third persons, or damages neighbor property. The insurer compensates up to ₹5,00,000 for legal defense and settlements.'
  },
  {
    q: 'What are the typical waiting periods for illnesses?',
    a: 'Accidents are covered from Day 1 with 0 days waiting period. General illnesses typically have a 10 to 15 day waiting period. Genetic or hereditary conditions (like hip dysplasia in Labradors/German Shepherds) have a 45 to 90 day waiting period.'
  },
  {
    q: 'Can I claim reimbursement if my local vet is not on the cashless network?',
    a: 'Yes! You can visit any certified registered veterinarian (B.V.Sc degree holder). Pay the bill, click a photo of the prescription and tax invoice via the Pawora App, and the reimbursement is credited to your bank account within 24 to 48 hours.'
  }
];

export const HOW_CLAIM_WORKS_STEPS = [
  {
    step: '01',
    title: 'Consult Any Registered Vet',
    description: 'Visit our 1,500+ Cashless network clinics or your preferred local veterinary doctor.'
  },
  {
    step: '02',
    title: 'Show Policy Card / Upload Bills',
    description: 'Provide your Policy ID for cashless approval or snap a photo of the medical bills & prescription.'
  },
  {
    step: '03',
    title: 'Instant Settlement',
    description: 'Claims are approved in under 4 hours via cashless desk or direct bank transfer.'
  }
];

// LocalStorage helpers
const STORAGE_KEY_PROVIDERS = 'pawora_pet_insurance_providers';
const STORAGE_KEY_APPLICATIONS = 'pawora_pet_insurance_applications';
const STORAGE_KEY_ENQUIRIES = 'pawora_pet_insurance_enquiries';

export const getStoredInsuranceProviders = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load insurance providers from storage:', e);
  }
  return INITIAL_INSURANCE_PROVIDERS;
};

export const saveInsuranceApplication = (application) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_APPLICATIONS) || '[]');
    const newApp = {
      id: 'INS-APP-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'UNDER_REVIEW',
      ...application
    };
    existing.unshift(newApp);
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(existing));
    return newApp;
  } catch (e) {
    console.error('Failed to save insurance application:', e);
    return null;
  }
};

export const getStoredInsuranceApplications = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_APPLICATIONS) || '[]');
  } catch (e) {
    return [];
  }
};

export const saveInsuranceEnquiry = (enquiry) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_ENQUIRIES) || '[]');
    const newEnq = {
      id: 'INS-ENQ-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      ...enquiry
    };
    existing.unshift(newEnq);
    localStorage.setItem(STORAGE_KEY_ENQUIRIES, JSON.stringify(existing));
    return newEnq;
  } catch (e) {
    console.error('Failed to save insurance enquiry:', e);
    return null;
  }
};
