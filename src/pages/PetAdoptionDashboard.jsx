import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, 
  Heart, Settings, Tag, ShoppingBag, AlertCircle, LayoutDashboard, 
  LogOut, CheckCircle, X, Send, Sparkles, Home, FileText, CheckCircle2,
  Building2, Upload, ExternalLink, Filter, Eye, RefreshCw, Check,
  Award, Shield, FileCheck, Share2, Edit3, Trash2, Printer, Download,
  FileSpreadsheet, AlertTriangle, UserCheck, Stethoscope, Landmark
} from 'lucide-react';
import { logout } from '../store/slices/authSlice.js';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';
import {
  getStoredAdoptionPets,
  saveAdoptionPet,
  getStoredAdoptionApplications,
  saveAdoptionApplication,
  updateAdoptionApplicationStatus,
  compressImageFile,
  CATEGORY_BREEDS,
  INDIAN_STATES_CITIES,
  getStoredAdoptionInquiries,
  saveAdoptionInquiry,
  getGuardianAdoptionApplications
} from '../data/adoptionPetsData.js';

const PetAdoptionDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'inventory';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const { user } = useSelector(state => state.auth);

  // Adoption Pets & Applications state
  const [allPets, setAllPets] = useState(() => getStoredAdoptionPets() || []);
  const [applications, setApplications] = useState(() => getStoredAdoptionApplications() || []);
  const [appStatusFilter, setAppStatusFilter] = useState('All');
  const [petSearchQuery, setPetSearchQuery] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState('All');
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState('All');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState('All');

  // Interactive Chat & Inquiries state
  const [inquiries, setInquiries] = useState(() => getStoredAdoptionInquiries() || []);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Add / Edit Rescue Pet Modal State
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dogs');
  const [breed, setBreed] = useState('Labrador Retriever');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [ageGroup, setAgeGroup] = useState('Puppy / Kitten / Young');
  const [petSize, setPetSize] = useState('Medium (10 - 25 kg)');
  const [quality, setQuality] = useState('Rescue Hero');
  const [stateName, setStateName] = useState('Karnataka');
  const [cityName, setCityName] = useState('Bangalore');
  const [personality, setPersonality] = useState('Affectionate, gentle, playful, good with kids');
  const [goodWithKids, setGoodWithKids] = useState(true);
  const [goodWithDogs, setGoodWithDogs] = useState(true);
  const [goodWithCats, setGoodWithCats] = useState(false);
  const [houseTrained, setHouseTrained] = useState(true);
  const [bio, setBio] = useState('');
  const [isVaccinated, setIsVaccinated] = useState(true);
  const [vaccineDetails, setVaccineDetails] = useState('DHPP & Anti-Rabies Core Up-to-Date');
  const [isDewormed, setIsDewormed] = useState(true);
  const [isNeutered, setIsNeutered] = useState(false);
  const [isMicrochipped, setIsMicrochipped] = useState(true);
  const [microchipId, setMicrochipId] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  // View / Print Adoption Certificate Modal
  const [selectedAppForCert, setSelectedAppForCert] = useState(null);

  // View Document Modal
  const [viewingDocument, setViewingDocument] = useState(null);

  // =========================================================================
  // SANCTUARY PROFILE & COMPREHENSIVE LICENSES / DOCUMENTS STATE
  // =========================================================================
  const savedDocsData = useMemo(() => {
    try {
      const saved = localStorage.getItem('pawora_adoption_documents');
      if (saved) return JSON.parse(saved);
    } catch (_e) {}
    return null;
  }, []);

  const [shelterLegalName, setShelterLegalName] = useState(() => {
    return user?.businessName || currentProvider?.businessName || user?.name || currentProvider?.name || 'Hope Animal Welfare Foundation & Sanctuary';
  });
  const [shelterBio, setShelterBio] = useState(() => {
    return user?.bio || currentProvider?.bio || 'Dedicated AWBI-recognized non-profit sanctuary providing ethical rescue intake, compassionate foster care, full veterinary rehabilitation, and 100% free loving forever homes across India.';
  });
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98455 77661');
  const [visitingHours, setVisitingHours] = useState('10:00 AM - 06:00 PM (Tue - Sun)');
  const [shelterCapacity, setShelterCapacity] = useState(() => {
    return user?.shelterCapacity || currentProvider?.shelterCapacity || 85;
  });

  // Document 1: AWBI Certificate
  const [awbiNumber, setAwbiNumber] = useState(savedDocsData?.awbiNumber || 'AWBI/KAR/2023/NGO-88942');
  const [awbiExpiry, setAwbiExpiry] = useState(savedDocsData?.awbiExpiry || '2028-12-31');
  const [awbiDocUrl, setAwbiDocUrl] = useState(savedDocsData?.awbiDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800');
  const [awbiStatus, setAwbiStatus] = useState(savedDocsData?.awbiStatus || 'Verified');

  // Document 2: NGO / Society / Trust Registration
  const [ngoRegType, setNgoRegType] = useState(savedDocsData?.ngoRegType || 'Section 8 Non-Profit Company');
  const [ngoRegNumber, setNgoRegNumber] = useState(savedDocsData?.ngoRegNumber || 'U85300KA2021NPL144210');
  const [ngoDocUrl, setNgoDocUrl] = useState(savedDocsData?.ngoDocUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800');
  const [ngoStatus, setNgoStatus] = useState(savedDocsData?.ngoStatus || 'Verified');

  // Document 3: Municipal Corporation Shelter License / NOC
  const [municipalBody, setMunicipalBody] = useState(savedDocsData?.municipalBody || 'BBMP Animal Husbandry Dept');
  const [municipalLicenseNo, setMunicipalLicenseNo] = useState(savedDocsData?.municipalLicenseNo || 'BBMP/AH/SHELTER/2024/091');
  const [municipalDocUrl, setMunicipalDocUrl] = useState(savedDocsData?.municipalDocUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=800');
  const [municipalStatus, setMunicipalStatus] = useState(savedDocsData?.municipalStatus || 'Verified');

  // Document 4: Veterinary Medical Officer MOU / Tie-Up
  const [vetDoctorName, setVetDoctorName] = useState(savedDocsData?.vetDoctorName || 'Dr. Sneha Hegde (B.V.Sc, M.V.Sc)');
  const [vetRegNumber, setVetRegNumber] = useState(savedDocsData?.vetRegNumber || 'KVC-7841/2016');
  const [vetDocUrl, setVetDocUrl] = useState(savedDocsData?.vetDocUrl || 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=800');
  const [vetStatus, setVetStatus] = useState(savedDocsData?.vetStatus || 'Verified');

  // Document 5: Founder / Trustee Govt Identity Proof
  const [founderIdType, setFounderIdType] = useState(savedDocsData?.founderIdType || 'Aadhaar Card (UIDAI)');
  const [founderIdNumber, setFounderIdNumber] = useState(savedDocsData?.founderIdNumber || 'XXXX-XXXX-4819');
  const [founderDocUrl, setFounderDocUrl] = useState(savedDocsData?.founderDocUrl || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=800');
  const [founderStatus, setFounderStatus] = useState(savedDocsData?.founderStatus || 'Verified');

  // Document 6: Bank & 80G Tax Exemption Certificate
  const [bankAccountInfo, setBankAccountInfo] = useState(savedDocsData?.bankAccountInfo || 'HDFC Bank - A/C 50100449102844 • IFSC: HDFC0000240');
  const [taxExemption80G, setTaxExemption80G] = useState(savedDocsData?.taxExemption80G || 'CIT(E)/BLR/80G/2022-23/AABCH8821N');
  const [bankDocUrl, setBankDocUrl] = useState(savedDocsData?.bankDocUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800');
  const [bankStatus, setBankStatus] = useState(savedDocsData?.bankStatus || 'Verified');

  // Sync tab with URL
  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Refresh adoption data from localStorage
  const refreshAdoptionData = () => {
    const loadedPets = getStoredAdoptionPets() || [];
    setAllPets(loadedPets);
    const loadedApps = getStoredAdoptionApplications() || [];
    setApplications(loadedApps);
  };

  useEffect(() => {
    refreshAdoptionData();
  }, []);

  // Fetch inquiries and combine with guardian applications
  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      // 1. Stored Direct Inquiries
      const storedInq = getStoredAdoptionInquiries() || [];

      // 2. Applications received for this guardian's pets
      const guardianApps = getGuardianAdoptionApplications(user) || [];
      const appLeads = guardianApps.map(app => ({
        id: 'app_inq_' + app.id,
        applicationId: app.id,
        petId: app.petId,
        buyer: app.applicantName || 'Adoption Applicant',
        pet: `${app.petName} (${app.petBreed || 'Pet'})`,
        phone: app.applicantPhone || '',
        email: app.applicantEmail || '',
        date: new Date(app.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        message: app.adoptionReason || `Submitted adoption application for ${app.petName}. Home type: ${app.homeType}, Experience: ${app.hasPetExperience}.`,
        unread: app.status === 'Submitted',
        applicationStatus: app.status,
        appDetails: app,
        messages: [
          {
            id: 'm_app_1',
            sender: app.applicantName || 'Applicant',
            messageText: `Hello! I have submitted an adoption screening application for ${app.petName}. Living in ${app.homeType}, prior experience: ${app.hasPetExperience}. Reason: "${app.adoptionReason}"`,
            createdAt: app.createdAt || new Date().toISOString()
          }
        ]
      }));

      // Combine and deduplicate
      const combined = [...storedInq, ...appLeads];
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      const list = Array.from(uniqueMap.values());
      setInquiries(list);

      // Also try API rooms if connected
      try {
        const roomsRes = await apiRequest('/chats/rooms');
        if (roomsRes.success && roomsRes.rooms && roomsRes.rooms.length > 0) {
          for (const room of roomsRes.rooms) {
            try {
              const msgsRes = await apiRequest(`/chats/messages/${room._id}`);
              if (msgsRes.success && msgsRes.messages && msgsRes.messages.length > 0) {
                const lastMsg = msgsRes.messages[msgsRes.messages.length - 1];
                const apiLead = {
                  id: room._id,
                  buyer: room.name || 'Adoption Seeker',
                  pet: 'Adoption Inquiry',
                  phone: '+91 98765 00000',
                  email: room.email || 'adopter@example.com',
                  date: new Date(lastMsg.createdAt || Date.now()).toLocaleDateString(),
                  message: lastMsg.messageText,
                  unread: (lastMsg.recipient?._id || lastMsg.recipient) === user?._id && !lastMsg.read,
                  messages: msgsRes.messages
                };
                if (!uniqueMap.has(apiLead.id)) {
                  list.unshift(apiLead);
                }
              }
            } catch (_e) {}
          }
          setInquiries([...list]);
        }
      } catch (_apiErr) {}
    } catch (_err) {
      console.error(_err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab, applications.length]);

  const handleOpenChat = async (inquiry) => {
    setActiveChatContact(inquiry);
    setLoadingChat(true);

    // If lead already contains message history
    if (inquiry.messages && inquiry.messages.length > 0) {
      setChatMessages(inquiry.messages);
      setLoadingChat(false);
    } else {
      try {
        const res = await apiRequest(`/chats/messages/${inquiry.id}`);
        if (res.success && res.messages && res.messages.length > 0) {
          setChatMessages(res.messages);
        } else {
          setChatMessages([
            {
              _id: 'msg_1',
              sender: inquiry.buyer,
              messageText: inquiry.message,
              createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              _id: 'msg_2',
              sender: user?._id || 'provider',
              messageText: `Hello ${inquiry.buyer}! Thank you for your interest in adopting from ${shelterLegalName}. We are glad to assist you with ${inquiry.pet}!`,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } catch (_e) {
        setChatMessages([
          {
            _id: 'msg_1',
            sender: inquiry.buyer,
            messageText: inquiry.message,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: 'msg_2',
            sender: user?._id || 'provider',
            messageText: `Hello ${inquiry.buyer}! Thank you for your interest in adopting from ${shelterLegalName}. We are glad to assist you with ${inquiry.pet}!`,
            createdAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoadingChat(false);
      }
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newChatMessage.trim() || !activeChatContact) return;

    const msgText = newChatMessage.trim();
    const outgoing = {
      id: 'msg_' + Date.now(),
      _id: 'msg_' + Date.now(),
      sender: user?._id || 'provider',
      messageText: msgText,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...chatMessages, outgoing];
    setChatMessages(updatedMessages);
    setNewChatMessage('');

    // Update in-memory and stored inquiries
    const updatedInquiry = {
      ...activeChatContact,
      message: msgText,
      date: 'Just now',
      unread: false,
      messages: updatedMessages
    };
    saveAdoptionInquiry(updatedInquiry);
    setActiveChatContact(updatedInquiry);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      await apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: activeChatContact.id,
          messageText: msgText
        })
      });
    } catch (_err) {}
  };

  // Quick Chat Action: Send Sanctuary Visit Invite
  const handleSendVisitInvite = () => {
    if (!activeChatContact) return;
    const inviteText = `Hi ${activeChatContact.buyer}! We would love to arrange a sanctuary visit so you can meet ${activeChatContact.pet} in person. Visiting hours: ${visitingHours} at our facility (${cityName}). Please bring your Govt ID proof!`;
    setNewChatMessage(inviteText);
  };

  // Quick Chat Action: Approve Adoption from Chat
  const handleApproveLeadFromChat = () => {
    if (!activeChatContact) return;
    if (activeChatContact.applicationId) {
      updateAdoptionApplicationStatus(activeChatContact.applicationId, 'Approved', 'Approved via Direct Chat Consultation');
      refreshAdoptionData();
    }
    const approvalText = `🎉 Great news, ${activeChatContact.buyer}! Your adoption request for ${activeChatContact.pet} has been officially APPROVED by ${shelterLegalName}. You can download your Adoption Certificate or call us directly at ${emergencyPhone} to schedule pickup!`;
    setNewChatMessage(approvalText);
    toast.success(`🎉 Adoption approved for ${activeChatContact.buyer}!`);
  };

  // Filtered Pets for Inventory Table / Grid
  const availablePets = useMemo(() => {
    return allPets.filter(p => !p.adopted && p.status !== 'Adopted');
  }, [allPets]);

  const soldPets = useMemo(() => {
    return allPets.filter(p => p.adopted || p.status === 'Adopted');
  }, [allPets]);

  const filteredPets = useMemo(() => {
    return allPets.filter(p => {
      // Search match
      const matchSearch = !petSearchQuery.trim() || 
        p.name?.toLowerCase().includes(petSearchQuery.toLowerCase()) ||
        p.breed?.toLowerCase().includes(petSearchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(petSearchQuery.toLowerCase()) ||
        (p.microchipId && p.microchipId.toLowerCase().includes(petSearchQuery.toLowerCase()));
      
      // Species match
      const matchSpecies = selectedSpeciesFilter === 'All' || p.type?.toLowerCase() === selectedSpeciesFilter.toLowerCase();
      
      // Availability filter
      const isAdopted = p.adopted || p.status === 'Adopted';
      let matchAvail = true;
      if (selectedAvailabilityFilter === 'Available') matchAvail = !isAdopted;
      else if (selectedAvailabilityFilter === 'Adopted') matchAvail = isAdopted;
      else if (selectedAvailabilityFilter === 'Medical') matchAvail = p.status === 'Under Medical Care';
      else if (selectedAvailabilityFilter === 'Foster') matchAvail = p.status === 'In Foster Care';

      // Health Filter
      let matchHealth = true;
      if (selectedHealthFilter === 'Vaccinated') matchHealth = !!p.vaccinated;
      else if (selectedHealthFilter === 'Neutered') matchHealth = !!p.neutered;
      else if (selectedHealthFilter === 'Dewormed') matchHealth = !!p.dewormed;

      return matchSearch && matchSpecies && matchAvail && matchHealth;
    });
  }, [allPets, petSearchQuery, selectedSpeciesFilter, selectedAvailabilityFilter, selectedHealthFilter]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    if (appStatusFilter === 'All') return applications;
    return applications.filter(a => (a.status || 'Submitted').toLowerCase() === appStatusFilter.toLowerCase());
  }, [applications, appStatusFilter]);

  const pendingAppsCount = applications.filter(a => !['Approved', 'Adopted', 'Rejected'].includes(a.status)).length;

  // Exact KPI metrics matching layout
  const stats = {
    totalListings: allPets.length,
    availableStock: availablePets.length,
    soldOutCount: soldPets.length,
    totalOrders: applications.length,
    pendingApps: pendingAppsCount,
    discounts: 1500,
    shelterCapacity: Number(shelterCapacity) || 85
  };

  // Sidebar Menu Items matching exact layout
  const navItems = [
    { id: 'inventory', label: 'My Pet Inventory', icon: PawPrint, count: stats.availableStock },
    { id: 'applications', label: 'Sales & Orders', icon: DollarSign, count: stats.pendingApps },
    { id: 'inquiries', label: 'Buyer Leads', icon: MessageSquare, count: inquiries.length },
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'rehomed', label: 'Forever Homes', icon: Home, count: stats.soldOutCount }
  ];

  // Photo Upload Handler for Pet Listing
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, or WEBP)');
      return;
    }

    setPhotoUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 800, 0.75);
      setUploadedPhotoUrl(compressedDataUrl);
      toast.success('Pet photo uploaded and compressed for fast browsing!');
    } catch (err) {
      toast.error('Failed to process image. Please try another photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Generic Document Upload Handler
  const handleDocUpload = async (e, setterFn, statusSetterFn, docTitle) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImageFile(file, 1200, 0.85);
        setterFn(compressed);
      } else {
        // Read as data URL for PDF
        const reader = new FileReader();
        reader.onload = (event) => {
          setterFn(event.target.result);
        };
        reader.readAsDataURL(file);
      }
      if (statusSetterFn) statusSetterFn('Uploaded & Pending Review');
      toast.success(`📄 ${docTitle} uploaded successfully!`);
    } catch (err) {
      toast.error(`Failed to upload ${docTitle}. Please try again.`);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPetId(null);
    setPetName('');
    setPetType('dogs');
    setBreed('Labrador Retriever');
    setGender('Male');
    setAge('3 Months');
    setAgeGroup('Puppy / Kitten / Young');
    setPetSize('Medium (10 - 25 kg)');
    setQuality('Rescue Hero');
    setStateName('Karnataka');
    setCityName('Bangalore');
    setPersonality('Affectionate, gentle, playful, good with kids');
    setGoodWithKids(true);
    setGoodWithDogs(true);
    setGoodWithCats(false);
    setHouseTrained(true);
    setBio('Healthy, dewormed, socialized, and looking for a loving forever home with a caring family.');
    setIsVaccinated(true);
    setVaccineDetails('DHPP & Anti-Rabies Core Up-to-Date');
    setIsDewormed(true);
    setIsNeutered(false);
    setIsMicrochipped(true);
    setMicrochipId('9560000' + Math.floor(10000000 + Math.random() * 90000000));
    setSpecialNeeds('');
    setUploadedPhotoUrl('');
    setShowAddPetModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (pet) => {
    setEditingPetId(pet.id);
    setPetName(pet.name || '');
    setPetType(pet.type || 'dogs');
    setBreed(pet.breed || '');
    setGender(pet.gender || 'Male');
    setAge(pet.age || '');
    setAgeGroup(pet.ageGroup || 'Puppy / Kitten / Young');
    setPetSize(pet.size || 'Medium (10 - 25 kg)');
    setQuality(pet.quality || 'Rescue Hero');
    setStateName(pet.state || 'Karnataka');
    setCityName(pet.city || 'Bangalore');
    setPersonality(pet.personality || '');
    setGoodWithKids(pet.goodWithKids !== undefined ? pet.goodWithKids : true);
    setGoodWithDogs(pet.goodWithDogs !== undefined ? pet.goodWithDogs : true);
    setGoodWithCats(pet.goodWithCats !== undefined ? pet.goodWithCats : false);
    setHouseTrained(pet.houseTrained !== undefined ? pet.houseTrained : true);
    setBio(pet.description || '');
    setIsVaccinated(!!pet.vaccinated);
    setVaccineDetails(pet.vaccineDetails || 'DHPP & Anti-Rabies Core Up-to-Date');
    setIsDewormed(!!pet.dewormed);
    setIsNeutered(!!pet.neutered);
    setIsMicrochipped(!!pet.microchipped);
    setMicrochipId(pet.microchipId || '');
    setSpecialNeeds(pet.specialNeeds || '');
    setUploadedPhotoUrl(pet.image || '');
    setShowAddPetModal(true);
  };

  // Create or Update Pet Listing
  const handleSavePet = (e) => {
    e.preventDefault();

    if (!petName.trim() || !breed.trim() || !age.trim()) {
      toast.error('Please provide Pet Name, Breed, and Age.');
      return;
    }

    const fallbackPhotos = {
      dogs: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
      cats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800',
      birds: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=800'
    };

    if (editingPetId) {
      // Edit existing pet
      const current = getStoredAdoptionPets();
      const updated = current.map(p => {
        if (p.id === editingPetId) {
          return {
            ...p,
            name: petName.trim(),
            type: petType,
            breed: breed.trim(),
            gender: gender,
            age: age.trim(),
            ageGroup: ageGroup,
            size: petSize,
            quality: quality,
            state: stateName,
            city: cityName,
            personality: personality.trim(),
            goodWithKids,
            goodWithDogs,
            goodWithCats,
            houseTrained,
            description: bio.trim() || `${petName} is a loving ${breed} ready for adoption.`,
            vaccinated: isVaccinated,
            vaccineDetails: vaccineDetails.trim(),
            dewormed: isDewormed,
            neutered: isNeutered,
            microchipped: isMicrochipped,
            microchipId: microchipId.trim(),
            specialNeeds: specialNeeds.trim(),
            image: uploadedPhotoUrl || p.image || fallbackPhotos[petType] || fallbackPhotos.dogs
          };
        }
        return p;
      });
      try {
        localStorage.setItem('pawora_adoption_pets', JSON.stringify(updated));
      } catch (_e) {}
      refreshAdoptionData();
      toast.success(`✨ "${petName}" listing updated successfully!`);
    } else {
      // Create new pet listing
      const newPet = {
        id: 'adopt_' + Date.now(),
        name: petName.trim(),
        type: petType,
        breed: breed.trim(),
        gender: gender,
        age: age.trim(),
        ageGroup: ageGroup,
        size: petSize,
        quality: quality,
        state: stateName,
        city: cityName,
        personality: personality.trim() || 'Friendly, energetic, gentle',
        goodWithKids,
        goodWithDogs,
        goodWithCats,
        houseTrained,
        description: bio.trim() || `${petName} is a wonderful ${breed} waiting for a loving forever home.`,
        fee: 0,
        vaccinated: isVaccinated,
        vaccineDetails: vaccineDetails.trim(),
        dewormed: isDewormed,
        neutered: isNeutered,
        microchipped: isMicrochipped,
        microchipId: microchipId.trim() || ('9560000' + Math.floor(10000000 + Math.random() * 90000000)),
        specialNeeds: specialNeeds.trim(),
        image: uploadedPhotoUrl || fallbackPhotos[petType] || fallbackPhotos.dogs,
        parentContact: emergencyPhone || user?.mobile || '+91 98455 77661',
        parentName: shelterLegalName || user?.businessName || user?.name || 'Hope Sanctuary',
        ownerId: user?._id || user?.id || 'shelter_1',
        ownerEmail: user?.email || 'adopt@pawora.com',
        ownerPhone: user?.mobile || emergencyPhone,
        status: 'Available',
        adopted: false,
        createdAt: new Date().toISOString()
      };
      saveAdoptionPet(newPet);
      refreshAdoptionData();
      toast.success(`🎉 ${newPet.name} has been published for Free Pet Adoption!`);
    }

    setShowAddPetModal(false);
  };

  // Delete Pet Listing
  const handleDeletePet = (petId, petNameStr) => {
    if (window.confirm(`Are you sure you want to remove "${petNameStr}" from your listings?`)) {
      const current = getStoredAdoptionPets();
      const updated = current.filter(p => p.id !== petId);
      try {
        localStorage.setItem('pawora_adoption_pets', JSON.stringify(updated));
      } catch (_e) {}
      refreshAdoptionData();
      toast.success(`Listing for "${petNameStr}" removed.`);
    }
  };

  // Mark Pet as Adopted & Rehomed
  const handleMarkAdopted = (petId) => {
    const current = getStoredAdoptionPets();
    const updated = current.map(p => {
      if (p.id === petId) {
        return {
          ...p,
          adopted: true,
          status: 'Adopted',
          rehomedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      }
      return p;
    });

    try {
      localStorage.setItem('pawora_adoption_pets', JSON.stringify(updated));
    } catch (_e) {}

    refreshAdoptionData();
    toast.success('🎊 Congratulations! Pet successfully marked as Adopted & Rehomed to a Forever Home!', {
      duration: 5000,
      icon: '🏡'
    });
  };

  // Handle Application Status Workflow
  const handleUpdateAppStatus = (appId, newStatus, note = '') => {
    updateAdoptionApplicationStatus(appId, newStatus, note);
    refreshAdoptionData();
    toast.success(`Application status updated to: ${newStatus}`);
  };

  // Save All Documents and Profile
  const handleSaveAllDocuments = (e) => {
    e.preventDefault();
    if (!shelterLegalName.trim() || !awbiNumber.trim()) {
      toast.error('Please fill in Legal Name and AWBI Registration Number.');
      return;
    }

    const payload = {
      shelterLegalName,
      shelterBio,
      emergencyPhone,
      visitingHours,
      shelterCapacity: Number(shelterCapacity),
      awbiNumber,
      awbiExpiry,
      awbiDocUrl,
      awbiStatus,
      ngoRegType,
      ngoRegNumber,
      ngoDocUrl,
      ngoStatus,
      municipalBody,
      municipalLicenseNo,
      municipalDocUrl,
      municipalStatus,
      vetDoctorName,
      vetRegNumber,
      vetDocUrl,
      vetStatus,
      founderIdType,
      founderIdNumber,
      founderDocUrl,
      founderStatus,
      bankAccountInfo,
      taxExemption80G,
      bankDocUrl,
      bankStatus,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('pawora_adoption_documents', JSON.stringify(payload));
      
      const updatedUser = {
        ...(user || {}),
        businessName: shelterLegalName,
        govtProofType: 'AWBI & NGO Certified Sanctuary',
        govtProofNumber: awbiNumber,
        govtProofDoc: awbiDocUrl,
        verificationStatus: 'Verified',
        shelterCapacity: Number(shelterCapacity),
        bio: shelterBio
      };
      localStorage.setItem('pawora_user', JSON.stringify(updatedUser));
    } catch (_e) {}

    toast.success('🛡️ Sanctuary Profile, Licenses & Verification Documents saved successfully!', {
      duration: 4000,
      icon: '✅'
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400';
  const displayName = shelterLegalName || user?.name || currentProvider?.name || 'Hope Animal Welfare Foundation & Sanctuary';

  // Count uploaded documents
  const uploadedDocsCount = [awbiDocUrl, ngoDocUrl, municipalDocUrl, vetDocUrl, founderDocUrl, bankDocUrl].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex flex-col md:flex-row">
      
      {/* 
        ========================================================
        LEFT SIDEBAR: EXACT MATCH OF THE DESIRED CLEAN LAYOUT
        ========================================================
      */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-white border-r border-slate-200 sticky top-0 md:top-[104px] md:h-[calc(100vh-104px)] flex flex-col justify-between overflow-y-auto z-20 shadow-sm">
        
        <div className="p-6 pt-8 space-y-6">
          
          {/* User / Shelter Avatar & Badges */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <img 
                src={displayAvatar} 
                alt={displayName} 
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Online & Accepting Adoptions"></span>
            </div>

            <div>
              <h2 className="text-base font-black text-[#0F2E23] tracking-tight leading-tight line-clamp-2 px-2">
                {displayName}
              </h2>
              
              <div className="mt-2 flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-full shadow-2xs">
                  <ShieldCheck size={13} className="text-amber-600" /> VERIFIED ADOPTION PARTNER
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Main Menu) */}
          <nav className="space-y-1.5 pt-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">
              MAIN MENU
            </div>

            {navItems.map(item => {
              const isActive = activeTab === item.id || 
                (item.id === 'inventory' && activeTab === 'rescues') ||
                (item.id === 'applications' && activeTab === 'leads');

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black transition duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-[#0F2E23] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2E23]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-[#ffd000]' : 'text-slate-400'} /> 
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout Button */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <LogOut size={16} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* 
        ========================================================
        RIGHT MAIN CONTENT
        ========================================================
      */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-16 overflow-x-hidden">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
              Seller Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Track your pet inventory, sales, and buyer leads in real-time.
            </p>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-[#ffd000] hover:bg-[#ffdf4d] text-[#0F2E23] text-xs font-black uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} /> POST NEW PET LISTING
          </button>
        </div>

        {/* 
          ========================================================
          5 KPI METRIC CARDS: EXACT MATCHING DESIGN
          ========================================================
        */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          
          {/* Tile 1: Total Pets Listed */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TOTAL PETS LISTED</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                <PawPrint size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.totalListings}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">ALL TIME</div>
          </div>

          {/* Tile 2: Available Stock */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AVAILABLE STOCK</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.availableStock}</div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">PETS REMAINING</div>
          </div>

          {/* Tile 3: Sold Out / Completed Listings */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">SOLD OUT</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.soldOutCount}</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">COMPLETED LISTINGS</div>
          </div>

          {/* Tile 4: Orders & Revenue / Applications */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#ffd000]/80 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd000]/10 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">ORDERS & REVENUE</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-amber-100">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">₹0</div>
            </div>
            <div className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-2 relative z-10">
              {stats.totalOrders} TOTAL SALES
            </div>
          </div>

          {/* Tile 5: Discounts Given / Free Adoption Savings */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-sky-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">DISCOUNTS GIVEN</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-sky-100">
                <Tag size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">₹1,500</div>
            </div>
            <div className="text-[10px] text-sky-600 font-black uppercase tracking-wider mt-2 relative z-10">
              TOTAL SAVINGS OFFERED
            </div>
          </div>

        </div>

        {/* 
          ========================================================
          TAB 1: MANAGE PET LISTINGS (MY PET INVENTORY)
          ========================================================
        */}
        {(activeTab === 'inventory' || activeTab === 'rescues') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Manage Pet Listings Header Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#ffd000] flex items-center justify-center font-black">
                  <PawPrint size={18} className="text-amber-500" />
                </div>
                <h2 className="text-xl font-black text-[#0F2E23] tracking-tight">
                  Manage Pet Listings
                </h2>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <input
                    type="text"
                    placeholder="Search your pets..."
                    value={petSearchQuery}
                    onChange={(e) => setPetSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F2E23] focus:bg-white transition"
                  />
                  <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Filter Dropdowns */}
                <select
                  value={selectedSpeciesFilter}
                  onChange={(e) => setSelectedSpeciesFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0F2E23]"
                >
                  <option value="All">All Types</option>
                  <option value="dogs">Dogs</option>
                  <option value="cats">Cats</option>
                  <option value="birds">Birds</option>
                </select>

                <select
                  value={selectedAvailabilityFilter}
                  onChange={(e) => setSelectedAvailabilityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0F2E23]"
                >
                  <option value="All">All Status</option>
                  <option value="Available">Available Only</option>
                  <option value="Medical">Medical Care</option>
                  <option value="Foster">In Foster Care</option>
                  <option value="Adopted">Adopted Only</option>
                </select>

                <select
                  value={selectedHealthFilter}
                  onChange={(e) => setSelectedHealthFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0F2E23]"
                >
                  <option value="All">All Health Checks</option>
                  <option value="Vaccinated">Vaccinated</option>
                  <option value="Neutered">Neutered / Spayed</option>
                  <option value="Dewormed">Dewormed</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            {filteredPets.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-xs border border-slate-100">
                  <PawPrint size={24} className="text-slate-400" />
                </div>
                <h3 className="text-base font-black text-[#0F2E23]">No Pet Listings Found</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Publish your available rescue puppies, cats, and pets to connect with verified loving families.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 bg-[#ffd000] hover:bg-[#ffdf4d] text-[#0F2E23] text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} /> Post First Pet Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPets.map(pet => {
                  const isAdopted = pet.adopted || pet.status === 'Adopted';

                  return (
                    <div 
                      key={pet.id} 
                      className={`group bg-white border ${isAdopted ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'} rounded-2xl overflow-hidden hover:border-[#0F2E23]/40 transition duration-300 flex flex-col shadow-xs hover:shadow-md`}
                    >
                      {/* Pet Image with Badges */}
                      <div className="relative h-52 overflow-hidden bg-slate-100">
                        <img 
                          src={pet.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'} 
                          alt={pet.name}
                          className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${isAdopted ? 'grayscale opacity-75' : ''}`}
                        />
                        
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-[#0F2E23] uppercase tracking-wider shadow-xs">
                          {pet.type || 'Pet'}
                        </div>
                        
                        {isAdopted ? (
                          <div className="absolute inset-0 bg-[#0F2E23]/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-[#ffd000] text-[#0F2E23] px-4 py-1.5 text-xs font-black tracking-widest uppercase rotate-[-6deg] shadow-lg border border-white">
                              🏡 SOLD / ADOPTED
                            </span>
                          </div>
                        ) : (
                          <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs">
                            Free Adoption
                          </div>
                        )}
                      </div>
                      
                      {/* Pet Information */}
                      <div className="p-5 flex flex-col flex-1 space-y-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-black text-[#0F2E23] text-lg leading-tight">{pet.name}</h3>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{pet.gender}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">{pet.breed} • {pet.age}</p>
                          {pet.microchipId && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Chip: {pet.microchipId}</p>
                          )}
                        </div>

                        {/* Health Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {pet.vaccinated && (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                              ✓ Vaccinated
                            </span>
                          )}
                          {pet.dewormed && (
                            <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                              ✓ Dewormed
                            </span>
                          )}
                          {pet.neutered && (
                            <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                              ✓ Neutered
                            </span>
                          )}
                          {pet.microchipped && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                              ✓ Microchipped
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 font-medium line-clamp-2 italic leading-relaxed">
                          "{pet.description}"
                        </p>
                        
                        {/* Footer Location & Action Buttons */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-auto">
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <MapPin size={13} className="text-emerald-600" /> {pet.city}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => handleOpenEditModal(pet)}
                              className="p-2 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-600 transition cursor-pointer"
                              title="Edit Listing"
                            >
                              <Edit3 size={14} />
                            </button>

                            {!isAdopted && (
                              <button 
                                onClick={() => handleMarkAdopted(pet.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                title="Mark as Sold / Rehomed"
                              >
                                <Home size={12} /> Mark Sold
                              </button>
                            )}

                            <button 
                              onClick={() => handleDeletePet(pet.id, pet.name)}
                              className="p-2 rounded-lg border border-slate-200 hover:border-rose-400 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 
          ========================================================
          TAB 2: SALES & ORDERS (ADOPTION APPLICATIONS)
          ========================================================
        */}
        {(activeTab === 'applications' || activeTab === 'sales') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-[#0F2E23] flex items-center gap-2">
                  <FileText size={22} className="text-amber-500" /> Adoption Orders & Screening Applications
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Screen applicants based on their living situation, pet experience, and background before approving adoptions.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                {['All', 'Submitted', 'Under Review', 'Approved', 'Adopted', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setAppStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      appStatusFilter === status 
                        ? 'bg-[#0F2E23] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-[#0F2E23]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 mx-auto border border-slate-100">
                  <FileText size={22} />
                </div>
                <h3 className="text-base font-black text-[#0F2E23]">No Applications in this Category</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When animal lovers submit adoption requests for your listings, their screening dossiers will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map(app => {
                  const isApproved = app.status === 'Approved';
                  const isAdopted = app.status === 'Adopted';
                  const isRejected = app.status === 'Rejected';

                  return (
                    <div 
                      key={app.id} 
                      className={`p-6 rounded-2xl border transition duration-200 flex flex-col lg:flex-row gap-6 ${
                        isAdopted 
                          ? 'bg-pink-50/20 border-pink-200' 
                          : isApproved 
                          ? 'bg-emerald-50/20 border-emerald-200' 
                          : 'bg-white border-slate-200 hover:border-[#0F2E23]/30'
                      }`}
                    >
                      {/* Pet Thumbnail & Tag */}
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:w-44 shrink-0">
                        <img 
                          src={app.petImage || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300'} 
                          alt={app.petName} 
                          className="w-20 h-20 sm:w-full sm:h-28 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Applying For</span>
                          <span className="text-sm font-black text-[#0F2E23]">{app.petName || 'Rescue Pet'}</span>
                          <span className="text-[11px] font-bold text-slate-500 block">{app.petBreed}</span>
                        </div>
                      </div>

                      {/* Dossier Information */}
                      <div className="flex-1 space-y-3.5">
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="font-black text-[#0F2E23] text-lg">{app.applicantName || 'Adoption Seeker'}</h4>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                isAdopted ? 'bg-pink-100 text-pink-800' :
                                isApproved ? 'bg-emerald-100 text-emerald-800' :
                                isRejected ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {app.status || 'Submitted'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                              <span className="flex items-center gap-1.5"><Phone size={13} /> {app.applicantPhone || '+91 98765 43210'}</span>
                              <span className="flex items-center gap-1.5"><Mail size={13} /> {app.applicantEmail || 'adopter@example.com'}</span>
                              <span className="text-[11px] text-slate-400">Date: {new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {app.applicantPhone && (
                              <a
                                href={`https://wa.me/${app.applicantPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${app.applicantName}! Regarding your adoption application for "${app.petName}" on JOSH PETS HUB from ${shelterLegalName}, we would love to connect with you.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-xs"
                              >
                                <Phone size={13} /> WhatsApp
                              </a>
                            )}
                            {isApproved && (
                              <button
                                onClick={() => setSelectedAppForCert(app)}
                                className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <Award size={13} className="text-[#ffd000]" /> Certificate
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Living Space & Experience Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Housing & Living Space</span>
                            <span className="font-black text-slate-800">{app.homeType || 'Apartment / Own House'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pet Experience</span>
                            <span className="font-black text-slate-800">{app.hasPetExperience ? '✓ Experienced Pet Parent' : 'First-Time Pet Parent'}</span>
                          </div>
                        </div>

                        {/* Motivation Note */}
                        {app.adoptionReason && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Adopter Motivation & Daily Routine</span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100 italic">
                              "{app.adoptionReason}"
                            </p>
                          </div>
                        )}

                        {/* Action Workflow Bar */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Update Status:</span>
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'Under Review')}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase transition cursor-pointer"
                          >
                            Under Review
                          </button>
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'Approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[10px] font-black uppercase transition cursor-pointer"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => {
                              handleUpdateAppStatus(app.id, 'Adopted');
                              if (app.petId) handleMarkAdopted(app.petId);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 text-[10px] font-black uppercase transition cursor-pointer flex items-center gap-1"
                          >
                            <Home size={12} /> Finalize Adoption
                          </button>
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'Rejected')}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase transition cursor-pointer ml-auto"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 
          ========================================================
          TAB 3: BUYER LEADS (ADOPTER INQUIRIES & LIVE CHAT)
          ========================================================
        */}
        {(activeTab === 'inquiries' || activeTab === 'leads') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex justify-between items-center pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-[#0F2E23] flex items-center gap-2">
                  <MessageSquare size={22} className="text-[#ffd000]" /> Buyer Leads & Adopter Inquiries
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Connect directly with prospective pet parents, answer inquiries, and coordinate 100% free pet adoptions.
                </p>
              </div>
              <span className="text-xs font-black text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full">
                {inquiries.length} Active Leads
              </span>
            </div>

            {/* Inquiries Table / Chat Window */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Leads List (Left Column) */}
              <div className="lg:col-span-5 space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {inquiries.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <MessageSquare size={24} className="text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No active inquiries yet</p>
                    <p className="text-[11px] text-slate-400">When adopters ask questions or apply, they will show up here.</p>
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      onClick={() => handleOpenChat(inq)}
                      className={`p-4 rounded-xl border transition duration-200 cursor-pointer ${
                        activeChatContact?.id === inq.id
                          ? 'bg-emerald-50/50 border-[#0F2E23] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-[#0F2E23]">{inq.buyer}</h4>
                          {inq.applicationId && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-[#7c56dc] px-1.5 py-0.5 rounded">
                              Application
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{inq.date}</span>
                      </div>
                      <span className="inline-block text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-2">
                        {inq.pet}
                      </span>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                        "{inq.message}"
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Chat View (Right Column) */}
              <div className="lg:col-span-7 border border-slate-200 rounded-2xl flex flex-col h-[580px] shadow-xs overflow-hidden bg-white">
                {activeChatContact ? (
                  <>
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0F2E23] text-[#ffd000] flex items-center justify-center font-black text-sm shadow-xs">
                          {activeChatContact.buyer?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-[#0F2E23] text-sm">{activeChatContact.buyer}</h3>
                            {activeChatContact.applicationStatus && (
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                activeChatContact.applicationStatus === 'Approved' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {activeChatContact.applicationStatus}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{activeChatContact.pet}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {activeChatContact.phone && (
                          <>
                            <a
                              href={`https://wa.me/${activeChatContact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${activeChatContact.buyer}, this is ${shelterLegalName} regarding your adoption inquiry for ${activeChatContact.pet}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="WhatsApp Adopter"
                            >
                              <MessageSquare size={16} />
                            </a>
                            <a
                              href={`tel:${activeChatContact.phone}`}
                              className="p-2 text-[#0F2E23] hover:bg-slate-100 rounded-lg transition"
                              title="Call Adopter"
                            >
                              <Phone size={16} />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-5 bg-[#FAF9F5] space-y-3.5">
                      {loadingChat ? (
                        <p className="text-center text-slate-400 text-xs font-bold animate-pulse py-10">Loading conversation...</p>
                      ) : (
                        chatMessages.map((m, index) => {
                          const isMe = (m.sender?._id || m.sender)?.toString() === user?._id?.toString() || m.sender === 'provider' || m.sender === (user?.name || 'Shelter');
                          return (
                            <div key={m._id || m.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-md p-3.5 text-xs rounded-2xl ${
                                isMe 
                                  ? 'bg-[#0F2E23] text-white rounded-br-none shadow-xs' 
                                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-xs'
                              }`}>
                                <p className="leading-relaxed font-medium whitespace-pre-line">{m.messageText}</p>
                                <span className={`block text-[9px] text-right mt-1 font-bold ${isMe ? 'text-[#ffd000]' : 'text-slate-400'}`}>
                                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Response Action Chips */}
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Actions:</span>
                      <button
                        type="button"
                        onClick={handleSendVisitInvite}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 font-bold rounded-lg transition whitespace-nowrap cursor-pointer"
                      >
                        📅 Schedule Sanctuary Visit
                      </button>
                      <button
                        type="button"
                        onClick={handleApproveLeadFromChat}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg transition whitespace-nowrap cursor-pointer"
                      >
                        ✅ Approve Adoption
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewChatMessage(`Hi ${activeChatContact.buyer}! All medical and vaccination records for ${activeChatContact.pet} are up to date. We also provide a free adoption starter guide upon pickup.`)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg transition whitespace-nowrap cursor-pointer"
                      >
                        💉 Send Health Info
                      </button>
                    </div>
                    
                    <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
                      <input 
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder="Type reply to buyer lead / adopter..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23]"
                      />
                      <button 
                        type="submit" 
                        disabled={!newChatMessage.trim()}
                        className="px-5 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] disabled:opacity-50 text-white rounded-xl transition cursor-pointer flex items-center justify-center font-bold"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                      <MessageSquare size={22} />
                    </div>
                    <h4 className="text-sm font-black text-[#0F2E23]">Select a Lead to View Conversation</h4>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Click any adopter inquiry from the left to start live messaging and coordinate pet adoption.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 
          ========================================================
          TAB 4: SELLER PROFILE, SANCTUARY & DOCUMENT/LICENSES UPLOAD SECTION
          ========================================================
        */}
        {(activeTab === 'profile' || activeTab === 'compliance' || activeTab === 'documents') && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Header with Verification Score */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-[#0F2E23] flex items-center gap-2">
                    <ShieldCheck size={26} className="text-emerald-600" />
                    Sanctuary Verification & License Documentation Hub
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Upload official government licenses, AWBI recognition proof, NGO registration certificates, and veterinary MOUs for verified partner status.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                    {Math.round((uploadedDocsCount / 6) * 100)}%
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-900 block">Trust & Verification Score</span>
                    <span className="text-[10px] text-emerald-700 font-bold">{uploadedDocsCount} of 6 Mandatory Documents Verified</span>
                  </div>
                </div>
              </div>

              {/* Form for Profile Details & License Uploads */}
              <form onSubmit={handleSaveAllDocuments} className="space-y-8">
                
                {/* 1. Basic Shelter Entity Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} className="text-[#ffd000]" /> 1. Legal Entity & Sanctuary Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Legal Business / Shelter Name *</label>
                      <input
                        type="text"
                        value={shelterLegalName}
                        onChange={(e) => setShelterLegalName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Shelter Rescue Capacity (Animals)</label>
                      <input
                        type="number"
                        value={shelterCapacity}
                        onChange={(e) => setShelterCapacity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">24/7 Rescue Emergency Helpline</label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-black text-slate-700">Visiting & Adoption Center Hours</label>
                      <input
                        type="text"
                        value={visitingHours}
                        onChange={(e) => setVisitingHours(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-xs font-black text-slate-700">About the Shelter & Adoption Mission</label>
                      <textarea
                        rows={2}
                        value={shelterBio}
                        onChange={(e) => setShelterBio(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                      />
                    </div>
                  </div>
                </div>

                {/* 
                  ========================================================
                  2. DEDICATED DOCUMENT & LICENSE UPLOAD SECTION (6 CARDS)
                  ========================================================
                */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-wider flex items-center gap-2">
                      <FileCheck size={18} className="text-emerald-600" /> 2. Government Licenses & Official Document Uploads
                    </h3>
                    <span className="text-[11px] text-slate-400 font-bold">PDF, JPG, PNG up to 10MB</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* DOC CARD 1: AWBI Certificate */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-emerald-500/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                            <Award size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#0F2E23]">AWBI Recognition Certificate *</h4>
                            <span className="text-[10px] text-slate-500 font-bold">Animal Welfare Board of India</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          awbiDocUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {awbiDocUrl ? '✓ Verified' : 'Missing'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Reg / License No.</label>
                          <input 
                            type="text" 
                            value={awbiNumber} 
                            onChange={(e) => setAwbiNumber(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Valid Until</label>
                          <input 
                            type="date" 
                            value={awbiExpiry} 
                            onChange={(e) => setAwbiExpiry(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>

                      {/* File Uploader Bar */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate font-bold text-slate-700">
                            {awbiDocUrl ? 'AWBI_Registration_Certificate.pdf' : 'No document uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {awbiDocUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocument({ title: 'AWBI Recognition Certificate', url: awbiDocUrl, number: awbiNumber })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                            >
                              View
                            </button>
                          )}
                          <label className="px-2.5 py-1 bg-[#0F2E23] hover:bg-[#163e30] text-[#ffd000] rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1">
                            <Upload size={11} /> {awbiDocUrl ? 'Replace' : 'Upload'}
                            <input 
                              type="file" 
                              onChange={(e) => handleDocUpload(e, setAwbiDocUrl, setAwbiStatus, 'AWBI Recognition Certificate')} 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* DOC CARD 2: NGO / Society Registration Certificate */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-emerald-500/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#0F2E23]">NGO / Trust / Society Reg. *</h4>
                            <span className="text-[10px] text-slate-500 font-bold">Section 8 / Trust Deed / Societies Act</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          ngoDocUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ngoDocUrl ? '✓ Verified' : 'Missing'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Entity Structure</label>
                          <select 
                            value={ngoRegType} 
                            onChange={(e) => setNgoRegType(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          >
                            <option value="Section 8 Non-Profit Company">Section 8 NGO</option>
                            <option value="Registered Charitable Trust">Charitable Trust</option>
                            <option value="Registered Society">Registered Society</option>
                            <option value="Private Shelter Partnership">Private Shelter</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">CIN / Reg No.</label>
                          <input 
                            type="text" 
                            value={ngoRegNumber} 
                            onChange={(e) => setNgoRegNumber(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>

                      {/* File Uploader Bar */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate font-bold text-slate-700">
                            {ngoDocUrl ? 'NGO_Incorporation_TrustDeed.pdf' : 'No document uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ngoDocUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocument({ title: 'NGO / Trust Incorporation Deed', url: ngoDocUrl, number: ngoRegNumber })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                            >
                              View
                            </button>
                          )}
                          <label className="px-2.5 py-1 bg-[#0F2E23] hover:bg-[#163e30] text-[#ffd000] rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1">
                            <Upload size={11} /> {ngoDocUrl ? 'Replace' : 'Upload'}
                            <input 
                              type="file" 
                              onChange={(e) => handleDocUpload(e, setNgoDocUrl, setNgoStatus, 'NGO Registration Deed')} 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* DOC CARD 3: Municipal Corporation Shelter License / NOC */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-emerald-500/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black">
                            <Landmark size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#0F2E23]">Municipal Shelter License / NOC *</h4>
                            <span className="text-[10px] text-slate-500 font-bold">Local Urban Body / Animal Husbandry NOC</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          municipalDocUrl ? '✓ Verified' : 'Missing'
                        }`}>
                          {municipalDocUrl ? '✓ Verified' : 'Missing'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Issuing Body</label>
                          <input 
                            type="text" 
                            value={municipalBody} 
                            onChange={(e) => setMunicipalBody(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">License / NOC No.</label>
                          <input 
                            type="text" 
                            value={municipalLicenseNo} 
                            onChange={(e) => setMunicipalLicenseNo(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>

                      {/* File Uploader Bar */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate font-bold text-slate-700">
                            {municipalDocUrl ? 'Municipal_Shelter_NOC.pdf' : 'No document uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {municipalDocUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocument({ title: 'Municipal Corporation Shelter License / NOC', url: municipalDocUrl, number: municipalLicenseNo })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                            >
                              View
                            </button>
                          )}
                          <label className="px-2.5 py-1 bg-[#0F2E23] hover:bg-[#163e30] text-[#ffd000] rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1">
                            <Upload size={11} /> {municipalDocUrl ? 'Replace' : 'Upload'}
                            <input 
                              type="file" 
                              onChange={(e) => handleDocUpload(e, setMunicipalDocUrl, setMunicipalStatus, 'Municipal Shelter License')} 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* DOC CARD 4: Veterinary Doctor Tie-Up MOU */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-emerald-500/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                            <Stethoscope size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#0F2E23]">Supervising Vet Medical Care MOU *</h4>
                            <span className="text-[10px] text-slate-500 font-bold">Registered Veterinary Surgeon Tie-Up</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          vetDocUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {vetDocUrl ? '✓ Verified' : 'Missing'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Vet Doctor Name</label>
                          <input 
                            type="text" 
                            value={vetDoctorName} 
                            onChange={(e) => setVetDoctorName(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">State Vet Council Reg No.</label>
                          <input 
                            type="text" 
                            value={vetRegNumber} 
                            onChange={(e) => setVetRegNumber(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>

                      {/* File Uploader Bar */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate font-bold text-slate-700">
                            {vetDocUrl ? 'Veterinary_MOU_Affiliation.pdf' : 'No document uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {vetDocUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocument({ title: 'Veterinary Doctor Affiliation MOU', url: vetDocUrl, number: vetRegNumber })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                            >
                              View
                            </button>
                          )}
                          <label className="px-2.5 py-1 bg-[#0F2E23] hover:bg-[#163e30] text-[#ffd000] rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1">
                            <Upload size={11} /> {vetDocUrl ? 'Replace' : 'Upload'}
                            <input 
                              type="file" 
                              onChange={(e) => handleDocUpload(e, setVetDocUrl, setVetStatus, 'Veterinary MOU')} 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* DOC CARD 5: Founder / Trustee Govt Identity Proof */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-emerald-500/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                            <UserCheck size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#0F2E23]">Founder / Trustee Govt Identity *</h4>
                            <span className="text-[10px] text-slate-500 font-bold">Authorized Representative Proof</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          founderDocUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {founderDocUrl ? '✓ Verified' : 'Missing'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">ID Type</label>
                          <input 
                            type="text" 
                            value={founderIdType} 
                            onChange={(e) => setFounderIdType(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Masked ID Number</label>
                          <input 
                            type="text" 
                            value={founderIdNumber} 
                            onChange={(e) => setFounderIdNumber(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>

                      {/* File Uploader Bar */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate font-bold text-slate-700">
                            {founderDocUrl ? 'Trustee_Government_ID.pdf' : 'No document uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {founderDocUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocument({ title: 'Founder Government ID Proof', url: founderDocUrl, number: founderIdNumber })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                            >
                              View
                            </button>
                          )}
                          <label className="px-2.5 py-1 bg-[#0F2E23] hover:bg-[#163e30] text-[#ffd000] rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1">
                            <Upload size={11} /> {founderDocUrl ? 'Replace' : 'Upload'}
                            <input 
                              type="file" 
                              onChange={(e) => handleDocUpload(e, setFounderDocUrl, setFounderStatus, 'Founder Government ID')} 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* DOC CARD 6: Bank & 80G Tax Exemption Certificate */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-emerald-500/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
                            <Landmark size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#0F2E23]">Bank Verification & 80G Proof *</h4>
                            <span className="text-[10px] text-slate-500 font-bold">Cancelled Cheque & 12A / 80G Tax Exemption</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          bankDocUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {bankDocUrl ? '✓ Verified' : 'Missing'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Bank Details</label>
                          <input 
                            type="text" 
                            value={bankAccountInfo} 
                            onChange={(e) => setBankAccountInfo(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">80G Approval No.</label>
                          <input 
                            type="text" 
                            value={taxExemption80G} 
                            onChange={(e) => setTaxExemption80G(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>

                      {/* File Uploader Bar */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate font-bold text-slate-700">
                            {bankDocUrl ? 'Cancelled_Cheque_80G_Certificate.pdf' : 'No document uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {bankDocUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocument({ title: 'Bank Cancelled Cheque & 80G Certificate', url: bankDocUrl, number: taxExemption80G })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                            >
                              View
                            </button>
                          )}
                          <label className="px-2.5 py-1 bg-[#0F2E23] hover:bg-[#163e30] text-[#ffd000] rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1">
                            <Upload size={11} /> {bankDocUrl ? 'Replace' : 'Upload'}
                            <input 
                              type="file" 
                              onChange={(e) => handleDocUpload(e, setBankDocUrl, setBankStatus, 'Bank Cheque & 80G Certificate')} 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Submit Save Button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-widest rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Check size={16} className="text-[#ffd000]" /> SAVE PROFILE & LICENSE DOCUMENTS
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

        {/* 
          ========================================================
          TAB 5: FOREVER HOMES (REHOMED CELEBRATION GALLERY)
          ========================================================
        */}
        {activeTab === 'rehomed' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex justify-between items-center pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-[#0F2E23] flex items-center gap-2">
                  <Home size={22} className="text-pink-600" /> Forever Homes & Successful Rehomings ({soldPets.length})
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Celebrating rescue pets who have found loving forever families through your shelter.
                </p>
              </div>
            </div>

            {soldPets.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 mx-auto border border-slate-100">
                  <Home size={22} className="text-pink-400" />
                </div>
                <h3 className="text-base font-black text-[#0F2E23]">No Pets Rehomed Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you finalize an adoption and mark a listing as sold/adopted, its success story will be celebrated here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {soldPets.map(pet => (
                  <div key={pet.id} className="bg-pink-50/20 border border-pink-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
                      <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 right-2.5 bg-[#ffd000] text-[#0F2E23] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                        🏡 HAPPY FOREVER HOME
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-base text-[#0F2E23]">{pet.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{pet.breed} • {pet.gender}</p>
                      <span className="text-[10px] text-pink-700 font-bold block mt-1">Rehomed in {pet.city}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* 
        ========================================================
        MODAL: + POST NEW PET LISTING / EDIT LISTING
        ========================================================
      */}
      {showAddPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F2E23] text-[#ffd000] flex items-center justify-center font-black">
                  <PawPrint size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0F2E23]">
                    {editingPetId ? 'Edit Pet Listing' : 'Post New Pet Listing'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    100% Free Adoption Listing • Verified Shelter Care
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowAddPetModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePet} className="space-y-4">
              
              {/* Pet Photo Upload with Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#0F2E23] uppercase tracking-wider block">
                  Pet Photo *
                </label>
                
                <div className="flex items-center gap-4">
                  {uploadedPhotoUrl ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#0F2E23] shrink-0 shadow-sm">
                      <img src={uploadedPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedPhotoUrl('')}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0F2E23] bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-[#0F2E23] shrink-0"
                    >
                      <Upload size={20} />
                      <span className="text-[10px] font-bold mt-1">Upload</span>
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="font-bold text-slate-700">Clear, bright photo of the pet</p>
                    <p className="text-[11px]">Supports JPG, PNG, WEBP. Auto-compressed for fast loading.</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoUploading}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black rounded-lg transition cursor-pointer"
                    >
                      {photoUploading ? 'Processing Photo...' : 'Choose File'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid 1: Name, Species, Breed */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Pet Name *</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g. Bella"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Species / Category *</label>
                  <select
                    value={petType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setPetType(newType);
                      if (CATEGORY_BREEDS[newType] && CATEGORY_BREEDS[newType].length > 0) {
                        setBreed(CATEGORY_BREEDS[newType][0]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="dogs">Dogs & Puppies</option>
                    <option value="cats">Cats & Kittens</option>
                    <option value="birds">Birds & Parrots</option>
                    <option value="small-pets">Small Pets & Rabbits</option>
                    <option value="reptiles">Reptiles & Turtles</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Breed *</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Golden Retriever / Indie"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                    required
                  />
                </div>
              </div>

              {/* Grid 2: Gender, Age, Age Group, Pet Size */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Pair (M+F)">Pair (M+F)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Age *</label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 3 Months / 2 Years"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Life Stage *</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Puppy / Kitten / Young">Puppy / Kitten / Young</option>
                    <option value="Adult (1 - 6 Years)">Adult (1 - 6 Years)</option>
                    <option value="Senior (7+ Years)">Senior (7+ Years)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Pet Size *</label>
                  <select
                    value={petSize}
                    onChange={(e) => setPetSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Small (0 - 10 kg)">Small (0 - 10 kg)</option>
                    <option value="Medium (10 - 25 kg)">Medium (10 - 25 kg)</option>
                    <option value="Large (25+ kg)">Large (25+ kg)</option>
                  </select>
                </div>
              </div>

              {/* Grid 3: State, City, Rescue Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">State *</label>
                  <select
                    value={stateName}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setStateName(newState);
                      if (INDIAN_STATES_CITIES[newState] && INDIAN_STATES_CITIES[newState].length > 0) {
                        setCityName(INDIAN_STATES_CITIES[newState][0]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    {Object.keys(INDIAN_STATES_CITIES).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">City *</label>
                  <select
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    {(INDIAN_STATES_CITIES[stateName] || ['Bangalore', 'Mumbai', 'Delhi']).map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Rescue Classification *</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Rescue Hero">Rescue Hero</option>
                    <option value="Shelter Born">Shelter Born</option>
                    <option value="Abandoned / Rescued">Abandoned / Rescued</option>
                    <option value="Foster Care">Foster Care</option>
                    <option value="Pet Quality">Pet Quality</option>
                  </select>
                </div>
              </div>

              {/* Behavior & Compatibility Checklist */}
              <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 space-y-2">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                  Temperament & Social Compatibility
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={goodWithKids} 
                      onChange={(e) => setGoodWithKids(e.target.checked)} 
                      className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                    />
                    <span>Good with Kids</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={goodWithDogs} 
                      onChange={(e) => setGoodWithDogs(e.target.checked)} 
                      className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                    />
                    <span>Good with Dogs</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={goodWithCats} 
                      onChange={(e) => setGoodWithCats(e.target.checked)} 
                      className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                    />
                    <span>Good with Cats</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={houseTrained} 
                      onChange={(e) => setHouseTrained(e.target.checked)} 
                      className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                    />
                    <span>House-Trained</span>
                  </label>
                </div>
              </div>

              {/* Health & Medical Checks */}
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60 space-y-3">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block">
                  Medical & Healthcare History
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isVaccinated} 
                      onChange={(e) => setIsVaccinated(e.target.checked)} 
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                    />
                    <span>Vaccinated</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isDewormed} 
                      onChange={(e) => setIsDewormed(e.target.checked)} 
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                    />
                    <span>Dewormed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isNeutered} 
                      onChange={(e) => setIsNeutered(e.target.checked)} 
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                    />
                    <span>Neutered / Spayed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isMicrochipped} 
                      onChange={(e) => setIsMicrochipped(e.target.checked)} 
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                    />
                    <span>Microchipped</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Vaccine Details / Passport Info</label>
                    <input
                      type="text"
                      value={vaccineDetails}
                      onChange={(e) => setVaccineDetails(e.target.value)}
                      placeholder="e.g. DHPP 7-in-1 + Anti-Rabies Core Up to Date"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                    />
                  </div>

                  {isMicrochipped && (
                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">Microchip Number (15-digits)</label>
                      <input
                        type="text"
                        value={microchipId}
                        onChange={(e) => setMicrochipId(e.target.value)}
                        placeholder="Enter 15-digit Microchip Number (e.g. 956000018249120)"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Special Medical / Dietary Notes (Optional)</label>
                  <input
                    type="text"
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    placeholder="e.g. Requires hypoallergenic diet, fully recovered from past paw injury"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Personality & Bio */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 block mb-1">Personality Traits</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="e.g. Playful, friendly, gentle, loyal, eager to please"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 block mb-1">Pet Story / Rescue Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell adopters about this pet's temperament, rescue journey, favorite games, and ideal home environment..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Free Adoption Guarantee Note */}
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-semibold flex items-center gap-2">
                <Award size={16} className="text-amber-500 shrink-0" />
                <span>All listings on the Adoption Hub are 100% Free Adoption (₹0 fee) for loving families.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#ffd000] hover:bg-[#ffdf4d] text-[#0F2E23] text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={16} /> {editingPetId ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 
        ========================================================
        MODAL: VIEW / PRINT ADOPTION CERTIFICATE
        ========================================================
      */}
      {selectedAppForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-4 border-[#0F2E23] rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Certificate Header Banner */}
            <div className="text-center space-y-2 border-b-2 border-dashed border-slate-200 pb-5">
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#0F2E23] text-[#ffd000] flex items-center justify-center font-black shadow-md">
                  <Award size={20} />
                </div>
                <span className="text-xl font-black text-[#0F2E23] tracking-tight">
                  OFFICIAL PET ADOPTION CERTIFICATE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                Issued by {shelterLegalName} • Reg: {awbiNumber}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 py-2">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                This certifies that the beloved pet named below has been officially approved for adoption and welcomed into their forever home with full health clearance and rescue guardian consent:
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pet Name & Breed</span>
                  <span className="text-sm font-black text-[#0F2E23]">{selectedAppForCert.petName || 'Rescue Pet'}</span>
                  <span className="text-xs text-slate-500 block font-bold">{selectedAppForCert.petBreed}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Adoptive Parent</span>
                  <span className="text-sm font-black text-[#0F2E23]">{selectedAppForCert.applicantName}</span>
                  <span className="text-xs text-slate-500 block font-bold">{selectedAppForCert.applicantPhone}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-slate-100 text-xs font-bold text-slate-500">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Date of Adoption</span>
                  <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 block font-black">AWBI Certified Seal ✓</span>
                  <span className="text-slate-800 font-black">{shelterLegalName}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedAppForCert(null)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer size={15} /> Print Certificate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 
        ========================================================
        MODAL: VIEW UPLOADED DOCUMENT
        ========================================================
      */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0F2E23]">{viewingDocument.title}</h3>
                <p className="text-xs text-slate-500 font-mono font-bold">Reference: {viewingDocument.number}</p>
              </div>
              <button
                onClick={() => setViewingDocument(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[300px]">
              {viewingDocument.url?.startsWith('data:application/pdf') ? (
                <iframe src={viewingDocument.url} title={viewingDocument.title} className="w-full h-96 border-none" />
              ) : (
                <img src={viewingDocument.url} alt={viewingDocument.title} className="max-h-[450px] w-auto object-contain rounded-xl" />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Official Government Document Attached
              </span>
              <button
                onClick={() => setViewingDocument(null)}
                className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PetAdoptionDashboard;
