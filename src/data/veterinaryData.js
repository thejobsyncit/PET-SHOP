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

export const saveVetAppointment = (appointment) => {
  try {
    const current = JSON.parse(localStorage.getItem('pawora_vet_appointments') || '[]');
    const updated = [appointment, ...current];
    localStorage.setItem('pawora_vet_appointments', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save vet appointment to localStorage', e);
    return [];
  }
};

export const getVetAppointments = () => {
  try {
    const current = JSON.parse(localStorage.getItem('pawora_vet_appointments') || '[]');
    return current;
  } catch (e) {
    console.warn('Failed to get vet appointments from localStorage', e);
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
    return updatedDoctors;
  } catch (e) {
    console.warn('Failed to update vet profile in localStorage', e);
    return [];
  }
};
