/**
 * Pawora Veterinary & Healthcare Dataset & Storage Helpers
 * Complete clinical records, doctor profiles, diagnostic packages, and booking state.
 */

export const VET_SERVICE_MODES = [
  { id: 'all', label: 'All Modes', icon: '🏥' },
  { id: 'clinic', label: 'In-Clinic Visit', icon: '🏨' },
  { id: 'teleconsult', label: '24/7 Video Tele-Consult', icon: '📱' },
  { id: 'home_visit', label: 'Home Visit Vet', icon: '🏠' },
  { id: 'emergency', label: '24/7 Emergency & ICU', icon: '🚨' }
];

export const VET_PET_CATEGORIES = [
  { id: 'Dogs', label: '🐶 Dogs' },
  { id: 'Cats', label: '🐱 Cats' },
  { id: 'Birds', label: '🦜 Birds' },
  { id: 'Fish', label: '🐠 Fish' },
  { id: 'Reptiles', label: '🦎 Reptiles' },
  { id: 'All', label: '🐾 All Pets' }
];

export const VET_SPECIALIZATIONS = [
  'All Specializations',
  'General Physician & Vaccines',
  'Orthopedics & Soft Tissue Surgery',
  'Dermatology & Skin Allergy',
  'Dentistry & Oral Surgery',
  'Cardiology & Internal Medicine',
  'Avian & Exotic Pet Medicine',
  'Ophthalmology & Eye Care',
  'Neurology & Critical Care'
];

export const VET_CLINICAL_TABS = [
  {
    id: 'wellness',
    icon: 'Wellness Care',
    title: 'Comprehensive Wellness & Preventative Care',
    description:
      'Proactive clinical oversight to keep your pet energetic and disease-free. From scheduled immunizations to lifestyle tracking, our veterinarians customize protocols for every breed and life stage.',
    capabilities: [
      'Annual Routine Wellness Physicals',
      'Complete Core & Non-Core Vaccinations',
      'Parasite Prevention (Fleas, Ticks, Heartworms)',
      'Microchipping & International Travel Health Certificates'
    ],
    highlights: ['Regular Health Updates', 'Live Status on Pawora App', 'Continued Doctor Follow-up']
  },
  {
    id: 'anesthesia',
    icon: 'Anesthetic Monitoring',
    title: 'Advanced Surgical & Anesthetic Monitoring',
    description:
      'Human-grade multi-parameter monitoring for soft tissue and orthopedic surgeries. Pre-anesthetic blood work and dedicated veterinary technicians ensure zero-compromise safety.',
    capabilities: [
      'Isoflurane Inhalation Anesthesia Systems',
      'Continuous Pulse Oximetry, Capnography & ECG',
      'Orthopedic Bone Plating & Cruciate Repair',
      'Elective Laparoscopic Spay & Neuter'
    ],
    highlights: ['Multi-Parametric Vital Tracking', 'Zero-Hypothermia Warmers', 'Post-Op Recovery ICU']
  },
  {
    id: 'nutrition',
    icon: 'Nutritional Counselling',
    title: 'Clinical Nutrition & Medical Diet Management',
    description:
      'Formulated medical diets for chronic conditions including renal insufficiency, food allergies, gastrointestinal sensitivity, diabetes, and obesity weight control.',
    capabilities: [
      'Customized Raw / Cooked / Kibble Diet Formulation',
      'Weight Loss & Body Condition Score (BCS) Plans',
      'Prescription Diet Transitioning Support',
      'Targeted Joint, Skin & Digestive Supplementation'
    ],
    highlights: ['Certified Veterinary Nutritionists', 'Breed Metabolic Guidance', 'Bi-Weekly Progress Weigh-Ins']
  },
  {
    id: 'pain',
    icon: 'Pain Management',
    title: 'Multimodal Pain Management & Rehabilitation',
    description:
      'Compassionate pain relief strategies combining pharmacotherapy, laser therapy, and physical rehabilitation for post-operative recovery, arthritis, and nerve trauma.',
    capabilities: [
      'Class IV Therapeutic Deep Tissue Laser',
      'Targeted Joint Injections & NSAID Monitoring',
      'Hydrotherapy & Physical Mobility Protocols',
      'Acupuncture & Holistic Integrative Therapy'
    ],
    highlights: ['Pain-Free Comfort Promise', 'Non-Sedative Laser Therapy', 'Enhanced Mobility Restored']
  },
  {
    id: 'dental',
    icon: 'Dental & Oral Care',
    title: 'Ultrasonic Dental Scaling & Oral Surgery',
    description:
      'Complete periodontal therapy preventing systemic bacteria spread to kidneys and heart. Ultrasonic scaling, subgingival curettage, polishing, and restorative extractions.',
    capabilities: [
      'Ultrasonic Piezo Scaling & Micro-Polishing',
      'Subgingival Periodontal Pocket Debridement',
      'Surgical Deciduous & Diseased Tooth Extractions',
      'Oral Tumor Biopsy & Gingival Flap Surgery'
    ],
    highlights: ['Fresh Breath Guarantee', 'Digital Dental Radiography', 'Painless Modern Sedation']
  },
  {
    id: 'emergency',
    icon: 'Emergency / ICU Care',
    title: '24/7 Critical Care & Emergency Trauma Resuscitation',
    description:
      'Round-the-clock emergency triage for vehicular trauma, acute poisoning, bloat (GDV), snake bites, heat stroke, and respiratory distress with dedicated oxygen chambers.',
    capabilities: [
      '24/7 Intensive Care Unit (ICU) Admission',
      'Emergency Blood Transfusion & Plasma Therapy',
      'Continuous Oxygen Concentrators & Nebulizers',
      'Emergency Point-of-Care Ultrasound (POCUS)'
    ],
    highlights: ['Zero Waiting Triage', 'Direct Ambulance Coordination', 'On-Call Surgeon Team']
  }
];

export const INITIAL_VET_DOCTORS = [
  {
    id: 'vet-1',
    name: 'Dr. Rajesh Iyer',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Surgery & Radiology)',
    title: 'Chief Veterinary Surgeon & Medical Director',
    clinicName: 'Pawora Luxury Multi-Specialty Pet Hospital',
    experienceYears: 14,
    experienceDisplay: '14+ Years Exp.',
    vciRegistration: 'VCI/2010/KA-08492',
    rating: 4.9,
    reviewsCount: 284,
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Indiranagar & Koramangala',
    address: 'Plot 42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore - 560038',
    phone: '+91 98450 88219',
    whatsapp: '919845088219',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 800,
    videoConsultFee: 499,
    homeVisitFee: 1500,
    petCategories: ['Dogs', 'Cats', 'Birds', 'All'],
    specializations: [
      'Orthopedics & Soft Tissue Surgery',
      'General Physician & Vaccines',
      'Dermatology & Skin Allergy'
    ],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:00 AM - 09:00 PM',
    bio: 'Renowned small animal surgeon specializing in complex fracture repairs, cruciate ligament surgeries, and advanced diagnostic ultrasound. Former consultant at Bangalore Veterinary College.',
    facilities: [
      'Digital X-Ray & Color Doppler Ultrasound',
      'Modular Surgical Suite with Isoflurane',
      '24/7 In-Patient Oxygenated ICU',
      'In-House Complete Hematology & Biochemistry Lab'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet', '24/7 Emergency & ICU']
  },
  {
    id: 'vet-2',
    name: 'Dr. Ananya Sengupta',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Medicine & Dermatology)',
    title: 'Senior Veterinary Physician & Feline Specialist',
    clinicName: 'The Purrfect Paws Feline & Canine Clinic',
    experienceYears: 11,
    experienceDisplay: '11+ Years Exp.',
    vciRegistration: 'VCI/2013/MH-06129',
    rating: 4.95,
    reviewsCount: 310,
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Bandra West & Khar',
    address: 'Shop 4, Silver Beach Enclave, Carter Road, Bandra West, Mumbai - 400050',
    phone: '+91 98200 77114',
    whatsapp: '919820077114',
    avatar: 'https://images.unsplash.com/photo-1594824813596-a19f2a969ef3?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 750,
    videoConsultFee: 449,
    homeVisitFee: 1400,
    petCategories: ['Cats', 'Dogs', 'All'],
    specializations: [
      'Dermatology & Skin Allergy',
      'General Physician & Vaccines',
      'Cardiology & Internal Medicine'
    ],
    isVerified: true,
    isEmergencyAvailable: false,
    isHomeVisitAvailable: true,
    openTodayTiming: '10:00 AM - 08:00 PM',
    bio: 'Dedicated small animal physician recognized across Mumbai for diagnosing stubborn chronic allergies, atopic dermatitis, and complex feline renal and endocrine disorders.',
    facilities: [
      'Fear-Free Feline Only Waiting Room',
      'Skin Scrape & Cytology Testing Station',
      'Allergy Immunotherapy Protocol Labs',
      'Dedicated Cat Boarding & Medical Suite'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet']
  },
  {
    id: 'vet-3',
    name: 'Dr. Vikramaditya Sharma',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Exotic & Avian Medicine)',
    title: 'Exotic Pets, Avian & Reptile Specialist',
    clinicName: 'Wild & Wings Exotic Fauna Clinic',
    experienceYears: 16,
    experienceDisplay: '16+ Years Exp.',
    vciRegistration: 'VCI/2008/DL-03912',
    rating: 4.88,
    reviewsCount: 195,
    state: 'Delhi',
    city: 'Delhi',
    area: 'South Extension & Hauz Khas',
    address: 'B-12, Ring Road, South Extension Part 1, New Delhi - 110049',
    phone: '+91 98110 55432',
    whatsapp: '919811055432',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 900,
    videoConsultFee: 599,
    homeVisitFee: 1800,
    petCategories: ['Birds', 'Reptiles', 'Fish', 'Dogs', 'Cats', 'All'],
    specializations: [
      'Avian & Exotic Pet Medicine',
      'General Physician & Vaccines',
      'Dentistry & Oral Surgery'
    ],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:30 AM - 08:30 PM',
    bio: 'India’s leading exotic fauna veterinarian. Treats Parrots, Macaws, Iguanas, Bearded Dragons, Tortoises, and Ornamental Fish with high-precision micro-surgical tools.',
    facilities: [
      'Micro-Surgical Magnification Units',
      'Avian Temperature & Humidity Incubators',
      'Specialized Reptile UVB Intensive Recovery Pods',
      'Aquatic Fish Pathology & Skin Biopsy Station'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet', '24/7 Emergency & ICU']
  },
  {
    id: 'vet-4',
    name: 'Dr. Priya Murugan',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Dentistry & Oral Surgery)',
    title: 'Senior Veterinary Dental Surgeon',
    clinicName: 'Chennai Veterinary Dental & Wellness Hospital',
    experienceYears: 9,
    experienceDisplay: '9+ Years Exp.',
    vciRegistration: 'VCI/2015/TN-09941',
    rating: 4.92,
    reviewsCount: 220,
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Adyar & Besant Nagar',
    address: '24, 2nd Avenue, Shastri Nagar, Adyar, Chennai - 600020',
    phone: '+91 98401 66554',
    whatsapp: '919840166554',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 700,
    videoConsultFee: 399,
    homeVisitFee: 1200,
    petCategories: ['Dogs', 'Cats', 'All'],
    specializations: [
      'Dentistry & Oral Surgery',
      'General Physician & Vaccines',
      'Orthopedics & Soft Tissue Surgery'
    ],
    isVerified: true,
    isEmergencyAvailable: false,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:00 AM - 07:30 PM',
    bio: 'Passionate veterinary dental surgeon focused on eradicating periodontitis and halitosis in pets. Expert in ultrasonic root planing, composite restoration, and jaw fracture plating.',
    facilities: [
      'Digital Dental Radiography (DR Sensor)',
      'Piezoelectric Ultrasonic Scaling Systems',
      'Advanced Anesthesia Endotracheal Suite',
      'Post-Op Laser Gum Healing Therapy'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet']
  },
  {
    id: 'vet-5',
    name: 'Dr. Harish Varma',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Cardiology & Internal Medicine)',
    title: 'Director of Cardiology & Critical Diagnostics',
    clinicName: 'CardioPet Advanced Heart & Multi-Organ Center',
    experienceYears: 18,
    experienceDisplay: '18+ Years Exp.',
    vciRegistration: 'VCI/2006/TS-01289',
    rating: 4.96,
    reviewsCount: 380,
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Jubilee Hills & Banjara Hills',
    address: 'Road No. 36, Opp. Metro Pillar 1402, Jubilee Hills, Hyderabad - 500033',
    phone: '+91 98490 22331',
    whatsapp: '919849022331',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 1000,
    videoConsultFee: 650,
    homeVisitFee: 2000,
    petCategories: ['Dogs', 'Cats', 'All'],
    specializations: [
      'Cardiology & Internal Medicine',
      'General Physician & Vaccines',
      'Neurology & Critical Care'
    ],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: false,
    openTodayTiming: '24 Hours Emergency Open',
    bio: 'Fellow in Veterinary Cardiology with over 18 years dedicated to treating congestive heart failure (CHF), mitral valve disease (MVD), and cardiomyopathy in dogs and cats.',
    facilities: [
      'Color Flow Echocardiography (ECHO)',
      '12-Lead Digital Pet ECG & Holter Monitoring',
      '24/7 Telemetry Cardiac ICU',
      'Non-Invasive High-Definition Blood Pressure (HDO)'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', '24/7 Emergency & ICU']
  },
  {
    id: 'vet-6',
    name: 'Dr. Meenakshi Joshi',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Ophthalmology & Microsurgery)',
    title: 'Veterinary Eye Specialist & Surgeon',
    clinicName: 'VisionPet Canine & Feline Eye Institute',
    experienceYears: 13,
    experienceDisplay: '13+ Years Exp.',
    vciRegistration: 'VCI/2011/MH-07741',
    rating: 4.89,
    reviewsCount: 245,
    state: 'Maharashtra',
    city: 'Pune',
    area: 'Koregaon Park & Kalyani Nagar',
    address: 'Lane 7, Near South Main Road, Koregaon Park, Pune - 411001',
    phone: '+91 98220 88992',
    whatsapp: '919822088992',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 850,
    videoConsultFee: 499,
    homeVisitFee: 1600,
    petCategories: ['Dogs', 'Cats', 'Birds', 'All'],
    specializations: [
      'Ophthalmology & Eye Care',
      'General Physician & Vaccines',
      'Orthopedics & Soft Tissue Surgery'
    ],
    isVerified: true,
    isEmergencyAvailable: false,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:00 AM - 07:00 PM',
    bio: 'Dedicated veterinary ophthalmologist specialized in cataract phacoemulsification, glaucoma management, cherry eye correction, and corneal ulcer micro-grafting.',
    facilities: [
      'Slit-Lamp Biomicroscopy & Tono-Pen Tonometry',
      'Operating Microscope for Corneal Micro-Surgery',
      'Direct & Indirect Ophthalmoscopy',
      'Fluorescein Tear Duct & Cornea Staining'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet']
  },
  {
    id: 'vet-7',
    name: 'Dr. Amitav Mukherjee',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Preventative Health & Immunization)',
    title: 'Chief Physician & Home Health Coordinator',
    clinicName: 'Kolkata Doorstep Veterinary Care',
    experienceYears: 10,
    experienceDisplay: '10+ Years Exp.',
    vciRegistration: 'VCI/2014/WB-04421',
    rating: 4.87,
    reviewsCount: 175,
    state: 'West Bengal',
    city: 'Kolkata',
    area: 'Salt Lake & New Town',
    address: 'Sector 3, Salt Lake City, Near City Centre 1, Kolkata - 700091',
    phone: '+91 98300 44321',
    whatsapp: '919830044321',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 650,
    videoConsultFee: 399,
    homeVisitFee: 1100,
    petCategories: ['Dogs', 'Cats', 'Birds', 'All'],
    specializations: [
      'General Physician & Vaccines',
      'Dermatology & Skin Allergy',
      'Dentistry & Oral Surgery'
    ],
    isVerified: true,
    isEmergencyAvailable: false,
    isHomeVisitAvailable: true,
    openTodayTiming: '08:30 AM - 08:30 PM',
    bio: 'Pioneer of stress-free doorstep pet healthcare in Kolkata. Delivers comprehensive vaccinations, senior pet mobility checks, and minor wound dressings in the comfort of your home.',
    facilities: [
      'Mobile Cold-Chain Vaccine Transport Pods',
      'Portable Diagnostic Glucometer & Urinalysis',
      'Doorstep Microchipping & Deworming Kit',
      'Direct Delivery of Prescribed Medications'
    ],
    consultationModes: ['Home Visit Vet', '24/7 Video Tele-Consult', 'In-Clinic Visit']
  },
  {
    id: 'vet-8',
    name: 'Dr. Shalini Aggarwal',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Orthopedics & Sports Medicine)',
    title: 'Senior Canine Orthopedic Surgeon',
    clinicName: 'Capital Vet Specialty Surgical & Trauma Center',
    experienceYears: 15,
    experienceDisplay: '15+ Years Exp.',
    vciRegistration: 'VCI/2009/DL-08819',
    rating: 4.94,
    reviewsCount: 340,
    state: 'Delhi',
    city: 'Delhi',
    area: 'Rohini & Pitampura',
    address: 'Sec-9, DC Chowk Complex, Rohini, New Delhi - 110085',
    phone: '+91 98101 22998',
    whatsapp: '919810122998',
    avatar: 'https://images.unsplash.com/photo-1594824813596-a19f2a969ef3?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 850,
    videoConsultFee: 499,
    homeVisitFee: 1600,
    petCategories: ['Dogs', 'Cats', 'All'],
    specializations: [
      'Orthopedics & Soft Tissue Surgery',
      'General Physician & Vaccines',
      'Neurology & Critical Care'
    ],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: false,
    openTodayTiming: '24 Hours Emergency Open',
    bio: 'Specialist in TPLO (Tibial Plateau Leveling Osteotomy), patellar luxation correction, and hip dysplasia management. Dedicated to restoring active joy to athletic dogs.',
    facilities: [
      'Advanced Orthopedic Power Drill & Saw Systems',
      'High-Resolution Direct Digital Radiography',
      'Under-Water Treadmill Hydrotherapy Unit',
      '24/7 Surgical Trauma Recovery Ward'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', '24/7 Emergency & ICU']
  },
  {
    id: 'vet-9',
    name: 'Dr. Siddharth Nair',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Neurology & Soft Tissue Surgery)',
    title: 'Senior Veterinary Neurosurgeon',
    clinicName: 'Apex Pet Neurological & Spine Clinic',
    experienceYears: 12,
    experienceDisplay: '12+ Years Exp.',
    vciRegistration: 'VCI/2012/KL-05192',
    rating: 4.91,
    reviewsCount: 215,
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Whitefield & Marathahalli',
    address: 'ITPL Main Road, Prestige Oasis Complex, Whitefield, Bangalore - 560066',
    phone: '+91 98451 99220',
    whatsapp: '919845199220',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 850,
    videoConsultFee: 499,
    homeVisitFee: 1500,
    petCategories: ['Dogs', 'Cats', 'All'],
    specializations: [
      'Neurology & Critical Care',
      'Orthopedics & Soft Tissue Surgery',
      'General Physician & Vaccines'
    ],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:00 AM - 08:30 PM',
    bio: 'Pioneer in non-invasive spine diagnostics, disc hernia decompression (hemilaminectomy), and seizure disorder management for canines and felines.',
    facilities: [
      'Neuro-Diagnostic Reflex & EMG Station',
      'Dedicated Post-Spine Rehabilitation Pods',
      'Continuous Pulse-Ox ICU Monitoring',
      'Acupuncture Electro-Stimulation Unit'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet', '24/7 Emergency & ICU']
  },
  {
    id: 'vet-10',
    name: 'Dr. Fatima Khan',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Pharmacology & Critical Care)',
    title: 'Senior Emergency Physician & ICU Lead',
    clinicName: '24/7 Lifeline Emergency Pet Hospital',
    experienceYears: 10,
    experienceDisplay: '10+ Years Exp.',
    vciRegistration: 'VCI/2014/MH-08912',
    rating: 4.93,
    reviewsCount: 290,
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Andheri West & Lokhandwala',
    address: 'Plot 18, Link Road, Near Infinity Mall, Andheri West, Mumbai - 400053',
    phone: '+91 98202 11993',
    whatsapp: '919820211993',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 800,
    videoConsultFee: 450,
    homeVisitFee: 1400,
    petCategories: ['Dogs', 'Cats', 'Birds', 'All'],
    specializations: [
      'Neurology & Critical Care',
      'General Physician & Vaccines',
      'Cardiology & Internal Medicine'
    ],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: false,
    openTodayTiming: '24 Hours Open (Emergency & ICU)',
    bio: 'Expert critical care veterinarian providing immediate trauma resuscitation, blood gas analysis, poison neutralization, and emergency surgical stabilization.',
    facilities: [
      '24/7 Emergency Blood Bank & Plasma Pods',
      'Point-of-Care Blood Gas & Lactate Analyzer',
      'Pressurized Oxygen Concentrator Wards',
      'Emergency Ambulatory Transfer Network'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', '24/7 Emergency & ICU']
  },
  {
    id: 'vet-11',
    name: 'Dr. Rohan Batra',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Canine Dermatology & Allergy Immunotherapy)',
    title: 'Chief Dermatologist & Allergy Consultant',
    clinicName: 'SkinVet Advanced Canine Dermatology Clinic',
    experienceYears: 14,
    experienceDisplay: '14+ Years Exp.',
    vciRegistration: 'VCI/2010/DL-06612',
    rating: 4.88,
    reviewsCount: 260,
    state: 'Delhi',
    city: 'Delhi',
    area: 'Vasant Kunj & Saket',
    address: 'Pocket 3, Sector B, Vasant Kunj, New Delhi - 110070',
    phone: '+91 98111 88334',
    whatsapp: '919811188334',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 750,
    videoConsultFee: 449,
    homeVisitFee: 1350,
    petCategories: ['Dogs', 'Cats', 'All'],
    specializations: [
      'Dermatology & Skin Allergy',
      'General Physician & Vaccines',
      'Dentistry & Oral Surgery'
    ],
    isVerified: true,
    isEmergencyAvailable: false,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:30 AM - 08:00 PM',
    bio: 'Dedicated to curing recurrent fungal infections, flea allergy dermatitis, demodectic mange, and environmental allergens through scientific intradermal testing.',
    facilities: [
      'Intradermal Allergen Testing Kits',
      'Wood’s Lamp & Video Otoscopy Diagnostics',
      'Medicated Med-Bath Hydro-Cleanse Station',
      'Prescription Allergy Vaccine Formulator'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet']
  },
  {
    id: 'vet-12',
    name: 'Dr. Tanya Sen',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Avian Medicine & Aquatic Species)',
    title: 'Senior Avian & Aquarium Fish Specialist',
    clinicName: 'Aqua & Aviary Exotic Pet Hospital',
    experienceYears: 11,
    experienceDisplay: '11+ Years Exp.',
    vciRegistration: 'VCI/2013/WB-03318',
    rating: 4.91,
    reviewsCount: 168,
    state: 'West Bengal',
    city: 'Kolkata',
    area: 'Alipore & Ballygunge',
    address: '14B, Rowland Road, Ballygunge, Kolkata - 700019',
    phone: '+91 98301 77665',
    whatsapp: '919830177665',
    avatar: 'https://images.unsplash.com/photo-1594824813596-a19f2a969ef3?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1200&q=80',
    inClinicFee: 800,
    videoConsultFee: 499,
    homeVisitFee: 1500,
    petCategories: ['Birds', 'Fish', 'Reptiles', 'All'],
    specializations: [
      'Avian & Exotic Pet Medicine',
      'General Physician & Vaccines',
      'Dermatology & Skin Allergy'
    ],
    isVerified: true,
    isEmergencyAvailable: false,
    isHomeVisitAvailable: true,
    openTodayTiming: '10:00 AM - 07:30 PM',
    bio: 'Specialist veterinary clinician for ornamental fish (Koi, Arowana, Flowerhorn, Discus) and talking birds (African Greys, Conures, Cockatoos). Water chemistry and avian cytology expert.',
    facilities: [
      'Fish Anesthesia & Fin Surgery Tanks',
      'Avian Endoscopy & DNA Sexing Station',
      'Multi-Parameter Aquarium Water Analyzers',
      'Microscope Gram-Stain Diagnostic Pod'
    ],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet']
  }
];

// LocalStorage helpers with safe Quota handling
export const getStoredVetDoctors = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_doctors_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read vet doctors from localStorage', e);
  }

  try {
    // Clean old keys if needed
    localStorage.removeItem('pawora_vet_doctors_v1');
    localStorage.setItem('pawora_vet_doctors_v2', JSON.stringify(INITIAL_VET_DOCTORS));
  } catch (e) {
    console.warn('LocalStorage quota exceeded, using in-memory INITIAL_VET_DOCTORS', e);
  }

  return INITIAL_VET_DOCTORS;
};

export const INITIAL_VET_APPOINTMENTS = [
  {
    id: 'app-001',
    doctorId: 'my-vet-profile',
    doctorName: 'Dr. Ramesh Kumar',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    ownerName: 'Aarav Sharma',
    ownerPhone: '+91 98234 56789',
    bookingDate: 'Today',
    bookingTimeSlot: '11:00 AM',
    bookingMode: 'In-Clinic Visit',
    petSymptoms: 'Persistent ear scratching and head shaking since yesterday morning.',
    status: 'In Queue',
    fee: 800,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-002',
    doctorId: 'my-vet-profile',
    doctorName: 'Dr. Ramesh Kumar',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    petName: 'Coco',
    petSpecies: 'Dog',
    petBreed: 'Shih Tzu',
    ownerName: 'Priya Sundaram',
    ownerPhone: '+91 98765 43210',
    bookingDate: 'Today',
    bookingTimeSlot: '02:30 PM',
    bookingMode: '24/7 Video Tele-Consult',
    petSymptoms: 'Routine 7-in-1 DHPPi Annual Booster & Rabies vaccination advisory.',
    status: 'In Queue',
    fee: 500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-003',
    doctorId: 'my-vet-profile',
    doctorName: 'Dr. Ramesh Kumar',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    petName: 'Milo',
    petSpecies: 'Cat',
    petBreed: 'Persian Cat',
    ownerName: 'Vikram Joshi',
    ownerPhone: '+91 98111 22334',
    bookingDate: 'Tomorrow',
    bookingTimeSlot: '04:00 PM',
    bookingMode: 'Home Visit Vet',
    petSymptoms: 'Urinary discomfort follow-up and dietary assessment at home.',
    status: 'Confirmed',
    fee: 1500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-004',
    doctorId: 'my-vet-profile',
    doctorName: 'Dr. Ramesh Kumar',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    petName: 'Bella',
    petSpecies: 'Dog',
    petBreed: 'Labrador Retriever',
    ownerName: 'Neha Gupta',
    ownerPhone: '+91 97654 32109',
    bookingDate: 'Yesterday',
    bookingTimeSlot: '10:00 AM',
    bookingMode: 'In-Clinic Visit',
    petSymptoms: 'Post-op orthopedic knee suture inspection and dressing change.',
    status: 'Completed',
    fee: 800,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'app-005',
    doctorId: 'my-vet-profile',
    doctorName: 'Dr. Ramesh Kumar',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    petName: 'Leo',
    petSpecies: 'Dog',
    petBreed: 'Beagle',
    ownerName: 'Rohan Verma',
    ownerPhone: '+91 98450 12345',
    bookingDate: 'Aug 29, 2026',
    bookingTimeSlot: '06:00 PM',
    bookingMode: '24/7 Video Tele-Consult',
    petSymptoms: 'Paw licking and allergy redness check.',
    status: 'Completed',
    fee: 500,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const saveVetAppointment = (appointment) => {
  try {
    const current = getVetAppointments();
    const updated = [appointment, ...current];
    localStorage.setItem('pawora_vet_appointments', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'appointment', action: 'create', appointment } }));
    return updated;
  } catch (e) {
    console.warn('Failed to save vet appointment to localStorage', e);
    return [];
  }
};

export const getVetAppointments = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_appointments');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to get vet appointments from localStorage', e);
  }

  try {
    localStorage.setItem('pawora_vet_appointments', JSON.stringify(INITIAL_VET_APPOINTMENTS));
  } catch (e) {}

  return INITIAL_VET_APPOINTMENTS;
};

export const updateVetAppointmentStatus = (id, newStatus, additionalData = {}) => {
  try {
    const current = getVetAppointments();
    const updated = current.map(app => {
      if (app.id === id) {
        return { ...app, status: newStatus, ...additionalData, updatedAt: new Date().toISOString() };
      }
      return app;
    });
    localStorage.setItem('pawora_vet_appointments', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'appointment', action: 'update', id, newStatus } }));
    return updated;
  } catch (e) {
    console.warn('Failed to update vet appointment status', e);
    return [];
  }
};

export const updateVetProfile = (profileData) => {
  try {
    const currentDoctors = getStoredVetDoctors();
    
    // Check if vet exists
    const existingIndex = currentDoctors.findIndex(doc => doc.id === profileData.id);
    
    let updatedDoctors;
    if (existingIndex >= 0) {
      // Update existing
      updatedDoctors = [...currentDoctors];
      updatedDoctors[existingIndex] = { ...updatedDoctors[existingIndex], ...profileData };
    } else {
      // Add new
      updatedDoctors = [profileData, ...currentDoctors];
    }
    
    localStorage.setItem('pawora_vet_doctors_v2', JSON.stringify(updatedDoctors));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'profile', profile: profileData } }));
    return updatedDoctors;
  } catch (e) {
    console.warn('Failed to update vet profile in localStorage', e);
    return [];
  }
};

export const INITIAL_VET_PRESCRIPTIONS = [
  {
    id: 'RX-2026-0841',
    date: 'Today, 10:45 AM',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    petAge: '3.5 Years',
    petWeight: '28.5 kg',
    ownerName: 'Aarav Sharma',
    ownerPhone: '+91 98234 56789',
    diagnosis: 'Otitis Externa (Bilateral Ear Canal Infection)',
    vitals: { temp: '101.4 °F', weight: '28.5 kg', pulse: '88 bpm' },
    symptoms: 'Head shaking, brown ceruminous discharge in ear canal, erythema and mild itching.',
    medicines: [
      { name: 'Otolin Antibacterial Ear Drops', dosage: '4 drops into each ear canal', frequency: 'Twice daily', duration: '7 days', instructions: 'Clean outer ear with saline before instilling drops.' },
      { name: 'Amoxiclav 625mg Tablets', dosage: '1 tablet after food', frequency: 'Twice daily', duration: '5 days', instructions: 'Ensure full course is completed.' }
    ],
    advice: 'Strictly avoid water entering ear canals while bathing. Re-evaluate with otoscopy if head shaking persists.',
    followUpDate: 'In 7 days (Sept 12, 2026)',
    doctorName: 'Dr. Ramesh Kumar',
    doctorDegrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Surgery)',
    vciRegistration: 'VCI/2010/KA-08492',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    clinicAddress: 'MG Road, Bangalore, Karnataka • Phone: +91 98450 88219',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RX-2026-0839',
    date: 'Yesterday, 03:15 PM',
    petName: 'Coco',
    petSpecies: 'Dog',
    petBreed: 'Shih Tzu',
    petAge: '1.5 Years',
    petWeight: '6.2 kg',
    ownerName: 'Priya Sundaram',
    ownerPhone: '+91 98765 43210',
    diagnosis: 'Annual Core Vaccination & Broad-Spectrum Deworming',
    vitals: { temp: '101.1 °F', weight: '6.2 kg', pulse: '102 bpm' },
    symptoms: 'Routine preventive wellness assessment. Healthy vitals and mucous membranes.',
    medicines: [
      { name: 'Nobivac DHPPi + L4 Vaccine', dosage: '1 mL Subcutaneous (Clinic Administered)', frequency: 'Single Dose', duration: 'Completed', instructions: 'Batch #NVB-9081. Recorded in pet health passport.' },
      { name: 'Drontal Plus Flavor Deworming Tablet', dosage: '1 tablet with morning meal', frequency: 'Single Dose', duration: '1 day', instructions: 'Repeat deworming every 3 months.' }
    ],
    advice: 'Mild lethargy for 24-48 hours post vaccination is normal. Avoid strenuous play today.',
    followUpDate: 'Annual booster in Sept 2027',
    doctorName: 'Dr. Ramesh Kumar',
    doctorDegrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Surgery)',
    vciRegistration: 'VCI/2010/KA-08492',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    clinicAddress: 'MG Road, Bangalore, Karnataka • Phone: +91 98450 88219',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'RX-2026-0822',
    date: 'Aug 30, 2026',
    petName: 'Milo',
    petSpecies: 'Cat',
    petBreed: 'Persian Cat',
    petAge: '4 Years',
    petWeight: '4.1 kg',
    ownerName: 'Vikram Joshi',
    ownerPhone: '+91 98111 22334',
    diagnosis: 'Feline Lower Urinary Tract Disease (FLUTD / Idiopathic Cystitis)',
    vitals: { temp: '100.8 °F', weight: '4.1 kg', pulse: '130 bpm' },
    symptoms: 'Dysuria, frequent litter box visits, straining, mild hematuria.',
    medicines: [
      { name: 'Royal Canin Urinary S/O Wet Pouches', dosage: '1 pouch morning, 1 pouch evening', frequency: 'Twice daily', duration: '30 days', instructions: 'Strict dietary control. Do not feed dry kibble.' },
      { name: 'Cystease Advanced GAG Bladder Support', dosage: '1 capsule opened & mixed in wet food', frequency: 'Once daily', duration: '14 days', instructions: 'Promotes mucosal glycosaminoglycan layer.' }
    ],
    advice: 'Encourage hydration using a cat water fountain. Keep litter box exceptionally clean in quiet area.',
    followUpDate: 'In 14 days for repeat urine analysis',
    doctorName: 'Dr. Ramesh Kumar',
    doctorDegrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Surgery)',
    vciRegistration: 'VCI/2010/KA-08492',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    clinicAddress: 'MG Road, Bangalore, Karnataka • Phone: +91 98450 88219',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

export const getStoredVetPrescriptions = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_prescriptions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to get vet prescriptions from localStorage', e);
  }

  try {
    localStorage.setItem('pawora_vet_prescriptions', JSON.stringify(INITIAL_VET_PRESCRIPTIONS));
  } catch (e) {}

  return INITIAL_VET_PRESCRIPTIONS;
};

export const saveVetPrescription = (rx) => {
  try {
    const current = getStoredVetPrescriptions();
    const updated = [rx, ...current];
    localStorage.setItem('pawora_vet_prescriptions', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'prescription', rx } }));
    return updated;
  } catch (e) {
    console.warn('Failed to save vet prescription', e);
    return [];
  }
};

export const INITIAL_VET_SCHEDULE = {
  emergency: true,
  days: {
    Monday: { isOpen: true, start: '09:00', end: '21:00', slots: ['09:00 - 13:00', '17:00 - 21:00'] },
    Tuesday: { isOpen: true, start: '09:00', end: '21:00', slots: ['09:00 - 13:00', '17:00 - 21:00'] },
    Wednesday: { isOpen: true, start: '09:00', end: '21:00', slots: ['09:00 - 13:00', '17:00 - 21:00'] },
    Thursday: { isOpen: true, start: '09:00', end: '21:00', slots: ['09:00 - 13:00', '17:00 - 21:00'] },
    Friday: { isOpen: true, start: '09:00', end: '21:00', slots: ['09:00 - 13:00', '17:00 - 21:00'] },
    Saturday: { isOpen: true, start: '09:00', end: '21:00', slots: ['09:00 - 14:00', '16:00 - 20:00'] },
    Sunday: { isOpen: false, start: '10:00', end: '16:00', slots: ['10:00 - 14:00'] },
  }
};

export const getStoredVetSchedule = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_schedule');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.days) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read schedule from localStorage', e);
  }

  try {
    localStorage.setItem('pawora_vet_schedule', JSON.stringify(INITIAL_VET_SCHEDULE));
  } catch (e) {}

  return INITIAL_VET_SCHEDULE;
};

export const saveVetSchedule = (schedule) => {
  try {
    localStorage.setItem('pawora_vet_schedule', JSON.stringify(schedule));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'schedule', schedule } }));
    return schedule;
  } catch (e) {
    console.warn('Failed to save schedule to localStorage', e);
    return schedule;
  }
};

export const INITIAL_VET_WALLET = {
  availableBalance: 4100,
  lifetimeRevenue: 35897,
  bankAccount: {
    bankName: 'HDFC Bank Limited',
    accountNumber: '**** **** 4892',
    ifsc: 'HDFC0001248',
    holderName: 'Dr. Ramesh Kumar'
  },
  transactions: [
    { id: 'TXN-9842A1', date: 'Aug 28, 2026', amount: 4500, status: 'Settled', type: 'Bank Payout', notes: 'Weekly IMPS Settlement' },
    { id: 'TXN-8731B4', date: 'Aug 21, 2026', amount: 2800, status: 'Settled', type: 'Bank Payout', notes: 'Weekly IMPS Settlement' },
    { id: 'TXN-7620C9', date: 'Aug 14, 2026', amount: 3250, status: 'Settled', type: 'Bank Payout', notes: 'Weekly IMPS Settlement' }
  ]
};

export const getStoredVetWallet = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_wallet');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.availableBalance === 'number') return parsed;
    }
  } catch (e) {
    console.warn('Failed to read wallet from localStorage', e);
  }

  try {
    localStorage.setItem('pawora_vet_wallet', JSON.stringify(INITIAL_VET_WALLET));
  } catch (e) {}

  return INITIAL_VET_WALLET;
};

export const withdrawVetFunds = (amount) => {
  try {
    const wallet = getStoredVetWallet();
    const withdrawAmt = Math.min(amount, wallet.availableBalance);
    if (withdrawAmt <= 0) return { success: false, message: 'Invalid or zero withdrawal amount' };

    const newTxn = {
      id: `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      date: 'Today',
      amount: withdrawAmt,
      status: 'Settled',
      type: 'Bank Payout',
      notes: 'Instant IMPS Payout to HDFC Bank **** 4892'
    };

    const updated = {
      ...wallet,
      availableBalance: wallet.availableBalance - withdrawAmt,
      transactions: [newTxn, ...wallet.transactions]
    };

    localStorage.setItem('pawora_vet_wallet', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'wallet', wallet: updated, newTxn } }));
    return { success: true, txn: newTxn, wallet: updated };
  } catch (e) {
    console.warn('Failed to process withdrawal', e);
    return { success: false, message: e.message };
  }
};

export const INITIAL_VET_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Aditi Kumar',
    avatarInitial: 'AK',
    time: '2 days ago',
    petType: 'Golden Retriever',
    rating: 5,
    comment: 'Dr. Ramesh is extremely patient and thorough. My Golden Retriever was very anxious but the doctor calmed him down effortlessly. The clinic is very clean and well-equipped.',
    reply: null
  },
  {
    id: 'rev-2',
    name: 'Siddharth Jain',
    avatarInitial: 'SJ',
    time: '1 week ago',
    petType: 'Persian Cat',
    rating: 4,
    comment: 'Good doctor, explained the diagnosis clearly via Video Consult. The digital prescription was generated immediately after the call.',
    reply: null
  },
  {
    id: 'rev-3',
    name: 'Meera Nambiar',
    avatarInitial: 'MN',
    time: '2 weeks ago',
    petType: 'Beagle',
    rating: 5,
    comment: 'Exceptional orthopedic diagnosis. Handled the surgical suture check with extreme tenderness. Bruno is running around happily again!',
    reply: {
      text: 'Thank you Meera! It was our pleasure caring for your energetic boy. Remember to continue his joint supplements as prescribed.',
      date: '10 days ago'
    }
  }
];

export const getStoredVetReviews = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_reviews');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to get vet reviews from localStorage', e);
  }

  try {
    localStorage.setItem('pawora_vet_reviews', JSON.stringify(INITIAL_VET_REVIEWS));
  } catch (e) {}

  return INITIAL_VET_REVIEWS;
};

export const addVetReviewReply = (reviewId, replyText) => {
  try {
    const current = getStoredVetReviews();
    const updated = current.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          reply: {
            text: replyText,
            date: 'Just now'
          }
        };
      }
      return rev;
    });

    localStorage.setItem('pawora_vet_reviews', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'review', reviewId } }));
    return updated;
  } catch (e) {
    console.warn('Failed to save review reply', e);
    return [];
  }
};

export const INITIAL_VET_CHATS = [
  {
    id: 'chat-aarav',
    patientName: 'Aarav Sharma',
    petName: 'Bruno',
    petBreed: 'Golden Retriever',
    phone: '+91 98234 56789',
    avatar: 'https://i.pravatar.cc/150?img=11',
    lastMessage: 'Got it Doctor, I booked the 11:00 AM slot. See you shortly at the clinic!',
    lastTime: '10:45 AM',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'patient', text: 'Hello Dr. Ramesh! Bruno has been scratching his left ear since yesterday morning. Should I bring him in today?', time: '10:30 AM' },
      { id: 'm2', sender: 'doctor', text: 'Hello Aarav! Yes, please bring Bruno in for an otoscopic check. In the meantime, please avoid putting water in his ear.', time: '10:35 AM' },
      { id: 'm3', sender: 'patient', text: 'Got it Doctor, I booked the 11:00 AM slot. See you shortly at the clinic!', time: '10:45 AM' }
    ]
  },
  {
    id: 'chat-priya',
    patientName: 'Priya Sundaram',
    petName: 'Coco',
    petBreed: 'Shih Tzu',
    phone: '+91 98765 43210',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Hi Priya, as long as she has no fever or lethargy, we can proceed with the vaccination today.',
    lastTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm10', sender: 'patient', text: 'Good morning Dr. Ramesh, Coco is due for her annual booster today. Is it fine to bring her if she had minor sneezing 2 days ago?', time: 'Yesterday 09:15 AM' },
      { id: 'm11', sender: 'doctor', text: 'Hi Priya, as long as she has no fever or lethargy, we can proceed with the vaccination today.', time: 'Yesterday 09:30 AM' }
    ]
  },
  {
    id: 'chat-vikram',
    patientName: 'Vikram Joshi',
    petName: 'Milo',
    petBreed: 'Persian Cat',
    phone: '+91 98111 22334',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Wonderful news Vikram! Continue the dietary fiber formula for another 2 weeks.',
    lastTime: 'Aug 30',
    unread: 0,
    messages: [
      { id: 'm20', sender: 'patient', text: 'Dr. Ramesh, Milo is drinking water much better now after the Royal Canin urinary diet.', time: 'Aug 30 11:00 AM' },
      { id: 'm21', sender: 'doctor', text: 'Wonderful news Vikram! Continue the dietary fiber formula for another 2 weeks.', time: 'Aug 30 11:15 AM' }
    ]
  }
];

export const getStoredVetChats = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_chats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to get vet chats from localStorage', e);
  }

  try {
    localStorage.setItem('pawora_vet_chats', JSON.stringify(INITIAL_VET_CHATS));
  } catch (e) {}

  return INITIAL_VET_CHATS;
};

export const sendVetChatMessage = (chatId, text, sender = 'doctor', attachment = null) => {
  try {
    const current = getStoredVetChats();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = current.map(chat => {
      if (chat.id === chatId) {
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender,
          text,
          attachment,
          time: timeStr
        };
        return {
          ...chat,
          lastMessage: text,
          lastTime: timeStr,
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    });

    localStorage.setItem('pawora_vet_chats', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'chat', chatId } }));
    return updated;
  } catch (e) {
    console.warn('Failed to send vet chat message', e);
    return [];
  }
};

export const INITIAL_VET_SERVICES_FEES = {
  inClinic: { active: true, fee: 800 },
  video: { active: true, fee: 500 },
  home: { active: true, fee: 1500 },
  specializations: [
    'General Physician & Vaccines',
    'Orthopedics & Soft Tissue Surgery',
    'Pet Nutrition',
    'Feline Medicine'
  ]
};

export const getStoredVetServicesFees = () => {
  try {
    const saved = localStorage.getItem('pawora_vet_services_fees');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.inClinic) return parsed;
    }
  } catch (e) {
    console.warn('Failed to get vet services fees from localStorage', e);
  }

  try {
    localStorage.setItem('pawora_vet_services_fees', JSON.stringify(INITIAL_VET_SERVICES_FEES));
  } catch (e) {}

  return INITIAL_VET_SERVICES_FEES;
};

export const saveVetServicesFees = (servicesState, specializations) => {
  try {
    const data = {
      ...servicesState,
      specializations: specializations || INITIAL_VET_SERVICES_FEES.specializations
    };
    localStorage.setItem('pawora_vet_services_fees', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'services_fees', data } }));
    return data;
  } catch (e) {
    console.warn('Failed to save vet services fees', e);
    return servicesState;
  }
};

