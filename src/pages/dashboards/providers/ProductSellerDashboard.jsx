import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Package, ShoppingBag, Plus, Search, Edit3, Trash2,
  TrendingUp, DollarSign, CheckCircle2, AlertTriangle, AlertCircle,
  Truck, ArrowUpRight, Sparkles, Star, X, Check,
  Store, ExternalLink, ShieldCheck, MapPin, CheckCircle, Settings, Wallet,
  UploadCloud, Upload, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProviderProfileSection from '../../../components/dashboards/ProviderProfileSection.jsx';
import ProviderWalletPayoutView from '../../../components/dashboards/ProviderWalletPayoutView.jsx';
import ProviderReviewsView from '../../../components/dashboards/ProviderReviewsView.jsx';
import { safeSetItem, safeGetItem } from '../../../utils/safeStorage.js';
import { createProductAsync, removeProductLocally } from '../../../store/slices/productSlice.js';
import { updateProfile } from '../../../store/slices/authSlice.js';

// Department categories mapping
const PET_DEPARTMENTS = [
  { id: 'dogs', label: 'Dogs' },
  { id: 'cats', label: 'Cats' },
  { id: 'birds', label: 'Birds' },
  { id: 'reptiles', label: 'Reptiles' },
  { id: 'fish', label: 'Fish & Aquatics' },
  { id: 'pharmacy', label: 'Pharmacy & Wellness' }
];

const DEPARTMENT_CATEGORIES_MAP = {
  dogs: ['Dog Food', 'Treats', 'Dog Beds & Cotes', 'Collars & Leashes', 'Supplements', 'Grooming & Shampoos', 'Toys & Chews', 'Other Accessories'],
  cats: ['Cat Food', 'Treats', 'Supplements', 'Beds & Scratchers', 'Litter & Hygiene', 'Cat Toys', 'Grooming', 'Other Accessories'],
  birds: ['Bird Food', 'Cages & Habitat', 'Perches', 'Toys', 'Supplements', 'Feeding Bowls', 'Other Accessories'],
  reptiles: ['Reptile Food', 'Terrariums', 'Heating & Lighting', 'Supplements', 'Substrates & Moss', 'Decor & Hides', 'Other Accessories'],
  fish: ['Fish Food', 'Aquariums', 'Filters & Pumps', 'Water Care', 'Air Pumps & Stones', 'Aquatic Plants', 'Accessories'],
  pharmacy: ['Antibiotics & Antimicrobial', 'Joint Care & Mobility', 'Skin & Coat Care', 'Digestive Health', 'Dental Care', 'Vitamins & Tonics']
};

const COMMON_BRANDS = [
  'Royal Canin', 'Pedigree', 'Drools', 'Himalaya', 'Beaphar',
  'Zoo Med', 'Exo Terra', 'API', 'Hikari', 'Farmina N&D',
  'Acana', 'Orijen', 'Purepet', 'Whiskas', 'Sheba', 'Josh Pets Hub'
];

// High-quality quick presets for seller convenience
const PRESET_PRODUCT_IMAGES = [
  { label: 'Maxi Dog Food', url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800' },
  { label: 'Puppy Kibble', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800' },
  { label: 'Cat Gourmet Food', url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=800' },
  { label: 'Plush Pet Bed', url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800' },
  { label: 'Chew Toy & Ball', url: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?q=80&w=800' },
  { label: 'Bird Seeds Blend', url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800' },
  { label: 'Reptile Terrarium Food', url: 'https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=800' },
  { label: 'Herbal Pet Supplement', url: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?q=80&w=800' }
];

// Default sample products for new product sellers
const DEFAULT_SELLER_ITEMS = [
  {
    _id: 'seller-prod-01',
    id: 'seller-prod-01',
    name: 'Royal Canin Maxi Adult Large Breed Dry Food 15kg',
    slug: 'royal-canin-maxi-adult-large-breed-dry-food-15kg',
    brand: 'Royal Canin',
    sku: 'DOG-RC-MAXI-15KG',
    category: 'Dog Food',
    subcategory: 'Dry Food',
    petType: 'dogs',
    price: 6400,
    discountPrice: 5760,
    discountPercentage: 10,
    stock: 24,
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800'],
    description: 'Complete nutritional dry food tailored for large breed adult dogs with joint support.',
    isFeatured: true,
    isBestSeller: true,
    requiresPrescription: false,
    ratings: 4.9,
    reviewCount: 38
  },
  {
    _id: 'seller-prod-02',
    id: 'seller-prod-02',
    name: 'Orthopedic Calming Memory Foam Dog Bed (Washable Cover)',
    slug: 'orthopedic-calming-memory-foam-dog-bed',
    brand: 'Josh Pets Hub',
    sku: 'BED-ORTHO-XL',
    category: 'Dog Beds & Cotes',
    subcategory: 'Beds',
    petType: 'dogs',
    price: 3499,
    discountPrice: 2899,
    discountPercentage: 17,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800'],
    description: 'Ultra-soft therapeutic memory foam bed relieves canine joint pressure and anxiety.',
    isFeatured: true,
    isBestSeller: false,
    requiresPrescription: false,
    ratings: 4.8,
    reviewCount: 22
  },
  {
    _id: 'seller-prod-03',
    id: 'seller-prod-03',
    name: 'Whiskas Ocean Fish Gourmet Wet Cat Food Pouches (Pack of 12)',
    slug: 'whiskas-ocean-fish-gourmet-wet-cat-food-pack-12',
    brand: 'Whiskas',
    sku: 'CAT-WHIS-WET-12',
    category: 'Cat Food',
    subcategory: 'Wet Food',
    petType: 'cats',
    price: 540,
    discountPrice: 480,
    discountPercentage: 11,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=800'],
    description: 'Delicious real ocean fish chunks in gravy packed with Omega 3 & essential taurine for felines.',
    isFeatured: false,
    isBestSeller: true,
    requiresPrescription: false,
    ratings: 4.7,
    reviewCount: 56
  },
  {
    _id: 'seller-prod-04',
    id: 'seller-prod-04',
    name: 'Himalaya Healthy Pet Senior Vitality Syrup 200ml',
    slug: 'himalaya-healthy-pet-senior-vitality-syrup',
    brand: 'Himalaya',
    sku: 'PHARM-HIM-VIT-200',
    category: 'Vitamins & Tonics',
    subcategory: 'Supplements',
    petType: 'pharmacy',
    price: 320,
    discountPrice: 280,
    discountPercentage: 12,
    stock: 3,
    images: ['https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?q=80&w=800'],
    description: 'Ayurvedic herbal vitality formula supporting immune function and stamina in senior pets.',
    isFeatured: false,
    isBestSeller: false,
    requiresPrescription: false,
    ratings: 4.9,
    reviewCount: 19
  }
];

// Sample simulated customer orders for product sellers
const SAMPLE_CUSTOMER_ORDERS = [
  {
    id: 'ORD-9841',
    customerName: 'Priya Sharma',
    phone: '+91 98450 12849',
    city: 'Bangalore, Karnataka',
    items: [
      { name: 'Royal Canin Maxi Adult 15kg', qty: 1, price: 5760 }
    ],
    total: 5760,
    status: 'Delivered',
    date: '2026-10-24',
    trackingNumber: 'TRK-BLR-8921'
  },
  {
    id: 'ORD-9842',
    customerName: 'Arjun Verma',
    phone: '+91 99012 44921',
    city: 'Mysore, Karnataka',
    items: [
      { name: 'Orthopedic Calming Memory Foam Dog Bed', qty: 1, price: 2899 },
      { name: 'Himalaya Healthy Pet Senior Vitality', qty: 1, price: 280 }
    ],
    total: 3179,
    status: 'Shipped',
    date: '2026-10-25',
    trackingNumber: 'TRK-EXP-4402'
  },
  {
    id: 'ORD-9843',
    customerName: 'Neha Nair',
    phone: '+91 97412 88390',
    city: 'Hyderabad, Telangana',
    items: [
      { name: 'Whiskas Ocean Fish Pouches (Pack of 12)', qty: 2, price: 960 }
    ],
    total: 960,
    status: 'Processing',
    date: '2026-10-26',
    trackingNumber: 'Pending'
  }
];

const ProductSellerDashboard = ({ 
  currentProvider, 
  onOpenSubscriptionModal,
  onOpenPlanDetails,
  subscription
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const activeTabParam = searchParams.get('tab') || safeGetItem('productSellerDashboardTab') || 'profile';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const [profileName, setProfileName] = useState(user?.businessName || user?.name || currentProvider?.name || 'Josh Pet Store & Supplies');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.businessName || user.name) {
        setProfileName(user.businessName || user.name);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileName?.trim()) {
      toast.error('Store name cannot be empty');
      return;
    }
    const phoneToKeep = (user?.mobile || user?.phone || '').trim();
    const result = await dispatch(updateProfile({ 
      name: profileName.trim(), 
      businessName: profileName.trim(),
      mobile: phoneToKeep,
      phone: phoneToKeep
    }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Store profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    safeSetItem('productSellerDashboardTab', tab);
  };

  // Products state (stored locally and synced with Redux)
  const [productsList, setProductsList] = useState(() => {
    try {
      const stored = localStorage.getItem('joshpetshub_seller_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // storage unavailable
    }
    return DEFAULT_SELLER_ITEMS;
  });

  // Orders state
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('joshpetshub_seller_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // storage unavailable
    }
    return SAMPLE_CUSTOMER_ORDERS;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPetDept, setSelectedPetDept] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock

  // Add / Edit Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Product Form fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Royal Canin');
  const [formCustomBrand, setFormCustomBrand] = useState('');
  const [formPetType, setFormPetType] = useState('dogs');
  const [formCategory, setFormCategory] = useState('Dog Food');
  const [formSubcategory, setFormSubcategory] = useState('Dry Food');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formSku, setFormSku] = useState('');
  const [formImages, setFormImages] = useState('');
  const [productImageError, setProductImageError] = useState('');
  const productImageInputRef = useRef(null);

  const handleProductImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file format
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isValidType = file.type.startsWith('image/') || validExtensions.includes(extension);

    if (!isValidType) {
      const errorMsg = 'Invalid file format! Only JPG, PNG, and WEBP images are allowed.';
      setProductImageError(errorMsg);
      toast.error(errorMsg);
      if (e.target) e.target.value = '';
      return;
    }

    // Validate size (< 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size >= MAX_FILE_SIZE) {
      const errorMsg = `Image size must be less than 5MB! Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`;
      setProductImageError(errorMsg);
      toast.error(errorMsg);
      if (e.target) e.target.value = '';
      return;
    }

    // Clear error
    setProductImageError('');

    // Read file via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setFormImages(dataUrl);
        toast.success(`Product image "${file.name}" uploaded successfully!`);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };
  const [formDescription, setFormDescription] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formRequiresPrescription, setFormRequiresPrescription] = useState(false);

  // Save changes to localStorage on productsList change
  useEffect(() => {
    try {
      safeSetItem('joshpetshub_seller_products', JSON.stringify(productsList));
    } catch {
      // storage write error
    }
  }, [productsList]);

  // Calculate KPIs
  const stats = useMemo(() => {
    const total = productsList.length;
    const inStock = productsList.filter(p => Number(p.stock) > 5).length;
    const lowStock = productsList.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
    const outOfStock = productsList.filter(p => Number(p.stock) === 0).length;
    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    return { total, inStock, lowStock, outOfStock, totalRevenue };
  }, [productsList, orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesBrand = (p.brand || '').toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku) return false;
      }
      // Pet Department filter
      if (selectedPetDept !== 'all') {
        const pDept = (p.petType || p.pet_type || '').toLowerCase();
        if (pDept !== selectedPetDept.toLowerCase()) return false;
      }
      // Category filter
      if (selectedCategoryFilter !== 'all') {
        const pCat = (p.category || '').toLowerCase();
        if (!pCat.includes(selectedCategoryFilter.toLowerCase())) return false;
      }
      // Stock Status filter
      if (stockStatusFilter === 'in_stock' && Number(p.stock) <= 5) return false;
      if (stockStatusFilter === 'low_stock' && (Number(p.stock) === 0 || Number(p.stock) > 5)) return false;
      if (stockStatusFilter === 'out_of_stock' && Number(p.stock) > 0) return false;

      return true;
    });
  }, [productsList, searchQuery, selectedPetDept, selectedCategoryFilter, stockStatusFilter]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormName('');
    setFormBrand('Royal Canin');
    setFormCustomBrand('');
    setFormPetType('dogs');
    setFormCategory('Dog Food');
    setFormSubcategory('Dry Food');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormStock('25');
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormImages('');
    setProductImageError('');
    setFormDescription('Nutritious and balanced formula designed for companion vitality, strong digestion, and coat health.');
    setFormIngredients('Real protein, essential vitamins, Omega 3 & 6, prebiotic fiber, natural minerals.');
    setFormIsFeatured(true);
    setFormIsBestSeller(false);
    setFormRequiresPrescription(false);
    setIsProductModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (prod) => {
    setIsEditing(true);
    setEditingId(prod._id || prod.id);
    setFormName(prod.name || '');
    setFormBrand(COMMON_BRANDS.includes(prod.brand) ? prod.brand : 'Other');
    setFormCustomBrand(COMMON_BRANDS.includes(prod.brand) ? '' : (prod.brand || ''));
    setFormPetType(prod.petType || prod.pet_type || 'dogs');
    setFormCategory(prod.category || 'Dog Food');
    setFormSubcategory(prod.subcategory || '');
    setFormPrice(String(prod.price || ''));
    setFormDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setFormStock(String(prod.stock ?? '10'));
    setFormSku(prod.sku || '');
    setFormImages(Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : (prod.image || ''));
    setFormDescription(prod.description || '');
    setFormIngredients(Array.isArray(prod.ingredients) ? prod.ingredients.join(', ') : (prod.ingredients || ''));
    setFormIsFeatured(Boolean(prod.isFeatured));
    setFormIsBestSeller(Boolean(prod.isBestSeller));
    setFormRequiresPrescription(Boolean(prod.requiresPrescription));
    setProductImageError('');
    setIsProductModalOpen(true);
  };

  // Submit Handler: Post or Update Product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error('Please enter product name');
      return;
    }
    if (!formPrice || Number(formPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!formImages || !formImages.trim()) {
      toast.error('Please upload a product image');
      setProductImageError('Please upload a product image before publishing.');
      return;
    }

    setSubmitting(true);

    const finalBrand = formBrand === 'Other' && formCustomBrand.trim() ? formCustomBrand.trim() : formBrand;
    const finalImage = formImages.trim() || PRESET_PRODUCT_IMAGES[0].url;
    const regularPrice = Number(formPrice);
    const salePrice = formDiscountPrice ? Number(formDiscountPrice) : null;
    const discountPct = (salePrice && regularPrice > salePrice) 
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) 
      : 0;

    const baseSlug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const productPayload = {
      name: formName.trim(),
      slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
      brand: finalBrand,
      sku: formSku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      petType: formPetType,
      pet_type: formPetType,
      category: formCategory,
      subcategory: formSubcategory.trim() || formCategory,
      price: regularPrice,
      discountPrice: salePrice,
      discount_price: salePrice,
      discountPercentage: discountPct,
      stock: Number(formStock) || 0,
      images: [finalImage],
      description: formDescription.trim(),
      ingredients: formIngredients.split(',').map(s => s.trim()).filter(Boolean),
      isFeatured: formIsFeatured,
      isBestSeller: formIsBestSeller,
      requiresPrescription: formRequiresPrescription,
      sellerId: user?.id || user?._id || 'seller_prod',
      sellerName: user?.businessName || user?.name || 'Verified Product Seller',
      ratings: 5.0,
      reviewCount: 0
    };

    try {
      if (isEditing && editingId) {
        // Update local list
        const updated = productsList.map(p => {
          if ((p._id || p.id) === editingId) {
            return { ...p, ...productPayload, _id: editingId, id: editingId };
          }
          return p;
        });
        setProductsList(updated);
        toast.success('Product updated successfully!');
      } else {
        // Create new Product via Redux and API
        const result = await dispatch(createProductAsync(productPayload));
        const created = result.payload?.product || {
          ...productPayload,
          _id: 'prod_' + Date.now(),
          id: 'prod_' + Date.now(),
          created_at: new Date().toISOString()
        };

        const updated = [created, ...productsList.filter(p => (p.slug !== created.slug && (p.id || p._id) !== (created.id || created._id)))];
        setProductsList(updated);

        // Also update cached store products so Shop page renders it without full reload
        try {
          const cached = JSON.parse(localStorage.getItem('joshpetshub_cached_products') || '[]');
          safeSetItem('joshpetshub_cached_products', JSON.stringify([created, ...cached.slice(0, 30)]));
        } catch {
          // ignore cache error
        }

        toast.success(
          (t) => (
            <div className="flex items-center gap-2">
              <span>🎉 Product published! Now visible in Shop.</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/shop');
                }}
                className="ml-2 text-xs font-bold underline text-amber-300 hover:text-white"
              >
                View in Shop →
              </button>
            </div>
          ),
          { duration: 5000 }
        );
      }

      setIsProductModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product handler
  const handleDeleteProduct = (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the store catalog?`)) {
      return;
    }

    const updated = productsList.filter(p => (p._id || p.id) !== productId);
    setProductsList(updated);
    dispatch(removeProductLocally(productId));
    toast.success(`Removed "${productName}" from store.`);
  };

  // Quick Inline Stock Adjuster (+ or - stock count directly from inventory)
  const handleAdjustStock = (productId, delta) => {
    const updated = productsList.map(p => {
      if ((p._id || p.id) === productId) {
        const newStock = Math.max(0, (Number(p.stock) || 0) + delta);
        return { ...p, stock: newStock };
      }
      return p;
    });
    setProductsList(updated);
  };

  // Order status update handler
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    setOrders(updated);
    try {
      safeSetItem('joshpetshub_seller_orders', JSON.stringify(updated));
    } catch {
      // storage write error
    }
    toast.success(`Order ${orderId} marked as ${newStatus}!`);
  };

  const storeName = user?.businessName || user?.name || currentProvider?.name || 'Josh Pet Store & Supplies';
  const displayName = user?.name || profileName || currentProvider?.name || 'Pet Store & Supplies';

  const navItems = [
    { id: 'profile', label: 'Store Profile & Plan', icon: Store },
    { id: 'products', label: 'Products & Inventory', icon: Package, count: productsList.length },
    { id: 'orders', label: 'Orders & Shipping', icon: Truck, count: orders.length },
    { id: 'analytics', label: 'Revenue & Sales', icon: TrendingUp },
    { id: 'reviews', label: 'Customer Reviews', icon: Star },
    { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign }
  ];

  return (
    <div className="min-h-[calc(100vh-104px)] bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex flex-col lg:flex-row">
      
      {/* 
        ========================================================
        LEFT SIDEBAR: NAVIGATION & PROFILE
        ========================================================
      */}
      <aside className="w-full lg:w-72 shrink-0 bg-white border-r border-slate-200 relative lg:sticky top-0 lg:top-[104px] h-auto lg:h-[calc(100vh-104px)] flex flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pt-6 lg:pt-12 space-y-8">
          
          {/* Profile Widget */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-full px-4">
              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="flex items-center gap-2 justify-center mt-2">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-center text-sm font-black text-[#0F2E23] border-b-2 border-[#ffd000] focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <button type="submit" className="text-emerald-600 hover:text-emerald-700 p-1">
                    <Check size={16} />
                  </button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="text-rose-600 hover:text-rose-700 p-1">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-2 group/edit cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                  <h2 className="text-xl font-sans font-black text-[#0F2E23] tracking-tight leading-tight">
                    {profileName || displayName}
                  </h2>
                  <Edit3 size={14} className="text-slate-300 group-hover/edit:text-[#ffd000] transition" />
                </div>
              )}
              <span className="inline-flex mt-2 bg-[#ffd000]/10 text-[#0F2E23] border border-[#ffd000]/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest items-center justify-center gap-1 shadow-sm mx-auto">
                <ShieldCheck size={12} className="text-amber-500" /> Verified Seller
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {navItems.map(item => (
                <li key={item.id}>
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                      activeTab === item.id 
                        ? 'bg-[#0F2E23] text-white shadow-md' 
                        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={activeTab === item.id ? 'text-amber-400' : 'text-slate-400 group-hover:text-emerald-600'} /> 
                      <span className="font-bold text-sm tracking-wide">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* 
        ========================================================
        RIGHT MAIN CONTENT
        ========================================================
      */}
      <main className="flex-1 min-w-0 px-6 lg:px-8 pt-12 pb-10 overflow-x-hidden">
        {activeTab !== 'profile' ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
                  Pet Products & Supplies
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Manage your store inventory, customer orders, shipments, and live shop listings.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                <Link
                  to="/shop"
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="View customer shop catalog"
                >
                  <ShoppingBag size={15} className="text-emerald-600" />
                  <span>View Live Shop</span>
                  <ArrowUpRight size={14} />
                </Link>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-6 py-3 bg-[#ffd000] hover:bg-[#ffdf4d] text-[#0F2E23] text-xs font-black uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Post New Product</span>
                </button>
              </div>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Products</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                    <Package size={16} />
                  </div>
                </div>
                <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.total}</div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">Active in shop</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">In Stock</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.inStock}</div>
                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">Ready to ship</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-amber-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Low Stock</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-amber-100">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.lowStock}</div>
                <div className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-2 relative z-10">Reorder needed</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#ffd000]/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] font-black text-[#0F2E23] uppercase tracking-widest">Total Sales</span>
                  <div className="w-8 h-8 rounded-lg bg-[#ffd000]/20 text-[#0F2E23] flex items-center justify-center group-hover:scale-110 transition duration-300 border border-[#ffd000]/30">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2 relative z-10">From {orders.length} orders</div>
              </div>
            </div>
          </>
        ) : null}

        {/* =========================================================================
            TAB 0: PROFILE & PLAN
           ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <ProviderProfileSection
              serviceCategory="Pet Products & Supplies"
              onOpenSubscriptionModal={onOpenSubscriptionModal}
              onOpenPlanDetails={onOpenPlanDetails}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 1: PRODUCTS & INVENTORY
           ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Filters & Actions Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, brand, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs md:text-sm border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition bg-slate-50/50 hover:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Department and Stock Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedPetDept}
                  onChange={(e) => {
                    setSelectedPetDept(e.target.value);
                    setSelectedCategoryFilter('all');
                  }}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-600"
                >
                  <option value="all">All Pet Departments</option>
                  {PET_DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-600"
                >
                  <option value="all">All Categories</option>
                  {(selectedPetDept !== 'all' ? (DEPARTMENT_CATEGORIES_MAP[selectedPetDept] || []) : Object.values(DEPARTMENT_CATEGORIES_MAP).flat()).map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-600"
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock ({'>'}5)</option>
                  <option value="low_stock">Low Stock (1-5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>
            </div>

            {/* Product Table / Cards */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <Package size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No products match your filter</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing the search query or changing department/stock status filters.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  + Add New Product
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Product Details</th>
                        <th className="py-3 px-4">Department / Cat</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock Status</th>
                        <th className="py-3 px-4">Quick Adjust</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredProducts.map((p) => {
                        const pid = p._id || p.id;
                        const stockNum = Number(p.stock) || 0;
                        const isLow = stockNum > 0 && stockNum <= 5;
                        const isOut = stockNum === 0;

                        return (
                          <tr key={pid} className="hover:bg-slate-50/70 transition">
                            {/* Product Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || PRESET_PRODUCT_IMAGES[0].url)}
                                  alt={p.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                                  onError={(e) => { e.target.src = PRESET_PRODUCT_IMAGES[0].url; }}
                                />
                                <div className="min-w-0 max-w-xs">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 truncate hover:text-emerald-700">
                                      {p.name}
                                    </span>
                                    {p.isFeatured && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                        Featured
                                      </span>
                                    )}
                                    {p.isBestSeller && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                                        Best Seller
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5 font-normal">
                                    <span>Brand: <strong className="text-slate-600">{p.brand || 'Generic'}</strong></span>
                                    {p.sku && (
                                      <>
                                        <span>•</span>
                                        <span>SKU: <strong className="text-slate-600">{p.sku}</strong></span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Department / Category */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                {p.petType || p.pet_type || 'General'}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                                {p.category || 'Supplies'}
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900 text-sm">
                                ₹{(p.discountPrice || p.price || 0).toLocaleString()}
                              </div>
                              {p.discountPrice && p.price && p.price > p.discountPrice && (
                                <div className="text-[10.5px] text-slate-400 line-through">
                                  ₹{p.price.toLocaleString()}
                                </div>
                              )}
                            </td>

                            {/* Stock Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertCircle size={11} /> Out of Stock (0)
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertTriangle size={11} /> Low Stock ({stockNum})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 size={11} /> In Stock ({stockNum})
                                </span>
                              )}
                            </td>

                            {/* Quick Adjust Buttons */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(pid, -1)}
                                  disabled={stockNum <= 0}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer font-bold"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>
                                <span className="px-2 py-1 text-slate-800 font-bold min-w-[28px] text-center">
                                  {stockNum}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(pid, 1)}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-200 cursor-pointer font-bold"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(pid, p.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: ORDERS & SHIPPING
           ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-800">
                  Customer Orders & Fulfillment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fulfill customer shipments and update order tracking details
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Total Orders:</span>
                <span className="px-2.5 py-0.5 rounded-full font-black bg-emerald-100 text-emerald-800">
                  {orders.length}
                </span>
              </div>
            </div>

            {/* Order cards */}
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                        {ord.id.slice(-4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{ord.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : ord.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : ord.status === 'Processing'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Order Date: <span className="text-slate-600 font-medium">{ord.date}</span>
                        </p>
                      </div>
                    </div>

                    {/* Order Status Action Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold hidden sm:inline">Update Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer details & items */}
                  <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Customer</span>
                      <p className="font-bold text-slate-800 mt-0.5">{ord.customerName}</p>
                      <p className="text-slate-500 text-[11px]">{ord.phone}</p>
                      <p className="text-slate-500 text-[11px]">{ord.city}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Items Purchased</span>
                      <ul className="mt-1 space-y-1">
                        {ord.items.map((it, idx) => (
                          <li key={idx} className="flex justify-between text-slate-700">
                            <span className="truncate pr-2 font-medium">{it.name} (x{it.qty})</span>
                            <span className="font-bold text-slate-900 shrink-0">₹{it.price.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Shipping Tracking</span>
                        <p className="font-mono text-slate-700 text-[11px] mt-0.5 font-bold">
                          {ord.trackingNumber || 'Awaiting Dispatch'}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="font-bold text-slate-600">Total Invoiced:</span>
                        <span className="font-black text-emerald-800 text-sm">₹{ord.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: REVENUE & SALES ANALYTICS
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Gross Store Revenue</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹{stats.totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <TrendingUp size={13} /> +18.4% compared to last month
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Average Order Value</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  ₹{orders.length > 0 ? Math.round(stats.totalRevenue / orders.length).toLocaleString() : 0}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-2">
                  Across {orders.length} total customer orders
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Inventory Health</span>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">
                  {stats.total > 0 ? Math.round((stats.inStock / stats.total) * 100) : 100}%
                </h3>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.inStock / stats.total) * 100 : 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Revenue Highlights Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Department Performance Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {PET_DEPARTMENTS.map(dept => {
                  const count = productsList.filter(p => (p.petType || p.pet_type || '').toLowerCase() === dept.id).length;
                  return (
                    <div key={dept.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-xs font-bold text-slate-700 block">{dept.label}</span>
                      <strong className="text-lg font-black text-[#0F2E23] mt-1 block">{count}</strong>
                      <span className="text-[10px] text-slate-400 font-medium">products listed</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: WALLET & PAYOUTS
           ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
            <ProviderReviewsView
              serviceCategory="Pet Products & Supplies"
              title="Customer Reviews"
              subtitle="Verified buyer product ratings, store experience, and merchant replies."
              roleTitle="Store Manager"
              storageKeyPrefix="products"
            />
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-4">
            <ProviderWalletPayoutView
              serviceCategory="Pet Products & Supplies"
              currentProvider={currentProvider}
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: ADD OR EDIT PRODUCT
         ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0F2E23] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Package size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {isEditing ? 'Edit Product Details' : 'Post New Product to Shop'}
                  </h3>
                  <p className="text-[11px] text-emerald-200/80">
                    Item will be immediately displayed on the public Shop page
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSubmitProduct} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Product Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Canin Maxi Adult Dry Dog Food 15kg"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pet Department *</label>
                  <select
                    value={formPetType}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setFormPetType(newDept);
                      const cats = DEPARTMENT_CATEGORIES_MAP[newDept] || DEPARTMENT_CATEGORIES_MAP.dogs;
                      if (!cats.includes(formCategory)) {
                        setFormCategory(cats[0] || 'Accessories');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:outline-none focus:border-emerald-600"
                  >
                    {PET_DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Product Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:outline-none focus:border-emerald-600"
                  >
                    {(DEPARTMENT_CATEGORIES_MAP[formPetType] || DEPARTMENT_CATEGORIES_MAP.dogs).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Brand *</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:outline-none focus:border-emerald-600"
                  >
                    {COMMON_BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Other">Custom / Other Brand</option>
                  </select>
                </div>

                {formBrand === 'Other' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Enter Brand Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. My Brand"
                      value={formCustomBrand}
                      onChange={(e) => setFormCustomBrand(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">SKU / Item Code</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. DOG-RC-MAXI-15"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Price, Sale Price, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Regular Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1499"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Offer Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Optional discount"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Product Image Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 text-xs">
                    Product Image *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    JPG, PNG, WEBP • Less than 5MB
                  </span>
                </div>

                <input
                  type="file"
                  ref={productImageInputRef}
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleProductImageUpload}
                  className="hidden"
                />

                {/* Upload Box */}
                <div
                  onClick={() => productImageInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 group ${
                    productImageError 
                      ? 'border-rose-400 bg-rose-50/40 hover:bg-rose-50/70' 
                      : 'border-slate-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition duration-200 shadow-xs">
                      <UploadCloud size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition">
                        Click or drag to upload product photo
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Only <strong className="text-slate-600">JPG, PNG, WEBP</strong> format • Max size <strong className="text-slate-600">&lt; 5MB</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {productImageError && (
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-bold mt-1.5 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{productImageError}</span>
                  </div>
                )}

                {/* Active Selected Product Image Preview */}
                {formImages && (
                  <div className="mt-2.5 flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={formImages}
                        alt="Product Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800'; }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            Selected Product Image
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {formImages.startsWith('data:') 
                            ? 'Custom uploaded image (Ready to save)' 
                            : 'Product image set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => productImageInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-600 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload size={13} />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Key features, serving advice, health benefits..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Badges Toggles */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-700 text-[11px]">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsBestSeller}
                    onChange={(e) => setFormIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-700 text-[11px]">Best Seller Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formRequiresPrescription}
                    onChange={(e) => setFormRequiresPrescription(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-700 text-[11px]">Requires Prescription</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-[#0F2E23]/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Shop...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{isEditing ? 'Save Changes' : 'Publish Product to Shop'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSellerDashboard;
