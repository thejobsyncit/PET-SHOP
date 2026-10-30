import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Package, ShoppingBag, Plus, Search, Edit3, Trash2,
  TrendingUp, DollarSign, CheckCircle2, AlertTriangle, AlertCircle,
  Truck, ArrowUpRight, Sparkles, Star, X, Check,
  Store, ExternalLink, ShieldCheck, MapPin, CheckCircle, LogOut, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProviderProfileSection from '../../../components/dashboards/ProviderProfileSection.jsx';
import { createProductAsync, removeProductLocally } from '../../../store/slices/productSlice.js';
import { logout } from '../../../store/slices/authSlice.js';

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

  const activeTabParam = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
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
  const [formDescription, setFormDescription] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formRequiresPrescription, setFormRequiresPrescription] = useState(false);

  // Save changes to localStorage on productsList change
  useEffect(() => {
    try {
      localStorage.setItem('joshpetshub_seller_products', JSON.stringify(productsList));
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
    setFormImages(PRESET_PRODUCT_IMAGES[0].url);
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
          localStorage.setItem('joshpetshub_cached_products', JSON.stringify([created, ...cached.slice(0, 30)]));
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
      localStorage.setItem('joshpetshub_seller_orders', JSON.stringify(updated));
    } catch {
      // storage write error
    }
    toast.success(`Order ${orderId} marked as ${newStatus}!`);
  };

  const storeName = user?.businessName || user?.name || currentProvider?.name || 'Josh Pet Store & Supplies';

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Banner & Seller Header */}
      <div className="bg-gradient-to-r from-[#0F2E23] via-[#163e30] to-[#0A2018] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-950/40 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Store Information */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner overflow-hidden">
                  {user?.avatar || user?.profilePicture ? (
                    <img src={user.avatar || user.profilePicture} alt={storeName} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={36} className="text-emerald-400" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-[#0F2E23]" title="Verified Merchant">
                  <ShieldCheck size={14} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{storeName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Sparkles size={11} /> Verified Product Seller
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 flex items-center gap-3 flex-wrap font-medium">
                  <span className="flex items-center gap-1"><MapPin size={13} className="text-emerald-400" /> {user?.location || 'Pan-India Merchant'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Star size={13} className="text-amber-400 fill-amber-400" /> 4.9 Seller Rating</span>
                  <span>•</span>
                  <span>{productsList.length} Live Items in Shop</span>
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/shop"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-xs text-white"
                title="View customer shop catalog"
              >
                <ShoppingBag size={15} className="text-emerald-400" />
                <span>View Live Shop</span>
                <ArrowUpRight size={14} />
              </Link>

              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0F2E23] font-black text-xs md:text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Post New Product</span>
              </button>
              <button
                onClick={() => {
                  dispatch(logout());
                  toast.success('Logged out successfully');
                  navigate('/');
                }}
                className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Logout from seller dashboard"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 scrollbar-none border-b border-white/10 text-xs sm:text-sm font-bold">
            <button
              onClick={() => handleTabChange('profile')}
              className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'profile'
                  ? 'border-emerald-400 text-emerald-300 bg-white/10'
                  : 'border-transparent text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings size={16} />
              <span>Profile & Plan</span>
            </button>
            <button
              onClick={() => handleTabChange('products')}
              className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'products'
                  ? 'border-emerald-400 text-emerald-300 bg-white/10'
                  : 'border-transparent text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package size={16} />
              <span>Products & Inventory ({productsList.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('orders')}
              className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'orders'
                  ? 'border-emerald-400 text-emerald-300 bg-white/10'
                  : 'border-transparent text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Truck size={16} />
              <span>Orders & Shipping ({orders.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('analytics')}
              className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-emerald-400 text-emerald-300 bg-white/10'
                  : 'border-transparent text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp size={16} />
              <span>Revenue & Sales</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {activeTab !== 'profile' ? (
          <>
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Package size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Stock</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.inStock}</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.lowStock}</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <DollarSign size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">₹{stats.totalRevenue.toLocaleString()}</h3>
                </div>
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

                {selectedPetDept !== 'all' && (
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-600 animate-fadeIn"
                  >
                    <option value="all">All Categories</option>
                    {(DEPARTMENT_CATEGORIES_MAP[selectedPetDept] || []).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-600"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in_stock">In Stock (&gt;5)</option>
                  <option value="low_stock">Low Stock (1-5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ml-auto"
                >
                  <Plus size={14} strokeWidth={3} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table / Cards */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Package size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search terms or filters, or post a new product to list it in the shop catalog.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Product Now
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Product Details</th>
                        <th className="py-3 px-4">Department & Category</th>
                        <th className="py-3 px-4">Price & MRP</th>
                        <th className="py-3 px-4">Inventory Units</th>
                        <th className="py-3 px-4">Badges</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredProducts.map((prod) => {
                        const stockCount = Number(prod.stock) || 0;
                        const hasDiscount = prod.discountPrice && Number(prod.price) > Number(prod.discountPrice);
                        const displayPrice = hasDiscount ? prod.discountPrice : prod.price;

                        return (
                          <tr key={prod._id || prod.id} className="hover:bg-slate-50/70 transition">
                            {/* Product Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : (prod.image || PRESET_PRODUCT_IMAGES[0].url)}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                                />
                                <div className="min-w-0 max-w-xs">
                                  <h4 className="font-bold text-slate-900 truncate hover:text-emerald-700 transition" title={prod.name}>
                                    {prod.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                                    <span className="text-emerald-700 font-bold">{prod.brand}</span>
                                    <span>•</span>
                                    <span className="font-mono text-slate-400 text-[10px]">{prod.sku}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Department & Category */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md font-bold text-slate-700 text-[10.5px]">
                                  {prod.category}
                                </span>
                                <p className="text-[10px] text-slate-400 capitalize font-medium">
                                  Dept: {prod.petType || prod.pet_type || 'General'}
                                </p>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4">
                              <div>
                                <span className="text-sm font-black text-slate-900">
                                  ₹{displayPrice?.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                  <div className="flex items-center gap-1.5 text-[10.5px]">
                                    <span className="text-slate-400 line-through">₹{prod.price?.toLocaleString()}</span>
                                    <span className="text-emerald-600 font-bold">({prod.discountPercentage}% OFF)</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Stock Stepper */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 p-0.5 rounded-lg w-fit">
                                  <button
                                    onClick={() => handleAdjustStock(prod._id || prod.id, -1)}
                                    disabled={stockCount <= 0}
                                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent font-bold cursor-pointer"
                                    title="Decrease stock"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-black text-xs min-w-[24px] text-center text-slate-800">
                                    {stockCount}
                                  </span>
                                  <button
                                    onClick={() => handleAdjustStock(prod._id || prod.id, 1)}
                                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 font-bold cursor-pointer"
                                    title="Increase stock"
                                  >
                                    +
                                  </button>
                                </div>

                                {stockCount === 0 ? (
                                  <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                    <AlertCircle size={10} /> Out of Stock
                                  </span>
                                ) : stockCount <= 5 ? (
                                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                    <AlertTriangle size={10} /> Low Stock alert
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                                    <Check size={10} /> In Stock
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Badges */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[120px]">
                                {prod.isBestSeller && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9.5px] font-black">
                                    Best Seller
                                  </span>
                                )}
                                {prod.isFeatured && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[9.5px] font-bold">
                                    Featured
                                  </span>
                                )}
                                {prod.requiresPrescription && (
                                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[9.5px] font-bold">
                                    Rx Required
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/product/${prod.slug || prod._id || prod.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
                                  title="View Live on Shop"
                                >
                                  <ExternalLink size={15} />
                                </Link>

                                <button
                                  onClick={() => handleOpenEditModal(prod)}
                                  className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  onClick={() => handleDeleteProduct(prod._id || prod.id, prod.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition cursor-pointer"
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
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Customer Shipments & Orders</h3>
                  <p className="text-xs text-slate-500">Track and fulfill product orders placed by buyers across India.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  {orders.length} Active Orders
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-sm text-[#0F2E23]">{ord.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                        <span className="text-xs text-slate-400">• {ord.date}</span>
                      </div>

                      <p className="text-xs text-slate-700 font-bold">
                        {ord.customerName} <span className="font-normal text-slate-500">({ord.phone}) — {ord.city}</span>
                      </p>

                      <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">
                        {ord.items.map((it, idx) => (
                          <span key={idx} className="font-medium">
                            {it.name} &times; {it.qty} (₹{it.price})
                            {idx < ord.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Value</p>
                        <p className="text-base font-black text-slate-900">₹{ord.total?.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.status === 'Processing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Shipped')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {ord.status === 'Shipped' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {ord.status === 'Delivered' && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle size={14} /> Fulfilled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: REVENUE & SALES ANALYTICS
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">Sales Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Total Orders Received</span>
                    <span className="font-bold text-slate-900">{orders.length} orders</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Total Gross Revenue</span>
                    <span className="font-black text-emerald-700">₹{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Average Order Value</span>
                    <span className="font-bold text-slate-900">
                      ₹{orders.length > 0 ? Math.round(stats.totalRevenue / orders.length).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Seller Payout Status</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10.5px] font-extrabold rounded-md">
                      Weekly Auto-Disbursement
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">Inventory Health</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Stock Availability Ratio</span>
                      <span className="text-emerald-700">
                        {stats.total > 0 ? Math.round((stats.inStock / stats.total) * 100) : 100}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.inStock / stats.total) * 100 : 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600" /> Merchant Direct Boost
                    </p>
                    <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                      Your products are automatically surfaced to millions of pet parents searching by species and category on the official Josh Pets Hub store!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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

              {/* Product Image URL with Preset Pickers */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Product Image URL *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click any preset below to auto-fill</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                  {formImages && (
                    <img
                      src={formImages}
                      alt="Preview"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      onError={(e) => { e.target.src = PRESET_PRODUCT_IMAGES[0].url; }}
                    />
                  )}
                </div>

                {/* Preset image buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImages(preset.url)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] shrink-0 font-medium transition cursor-pointer ${
                        formImages === preset.url
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-4 h-4 rounded object-cover" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
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
