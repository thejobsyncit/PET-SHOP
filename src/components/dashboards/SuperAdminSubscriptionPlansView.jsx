import React, { useState, useEffect } from 'react';
import {
  CreditCard, Sparkles, Check, Edit2, Plus, Trash2, RefreshCw,
  Users, Building, Tag, ShieldCheck, AlertCircle, ArrowUpRight,
  CheckCircle2, XCircle, Search, DollarSign, Percent, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchSubscriptionPlans,
  saveSubscriptionPlans,
  resetSubscriptionPlans,
  getStoredProviderPlans,
  getStoredUserPlans
} from '../../services/subscriptionPlanService.js';

const GST_RATE = 0.18;

const SuperAdminSubscriptionPlansView = () => {
  const [providerPlans, setProviderPlans] = useState(() => getStoredProviderPlans());
  const [userPlans, setUserPlans] = useState(() => getStoredUserPlans());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'user' | 'provider'
  const [searchQuery, setSearchQuery] = useState('');

  // Full Edit / Create Plan Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [targetAudience, setTargetAudience] = useState('SERVICE_PROVIDER'); // 'SERVICE_PROVIDER' | 'USER'
  const [planForm, setPlanForm] = useState({
    id: '',
    name: '',
    target: 'SERVICE_PROVIDER',
    tier: '',
    basePrice: 199,
    validityMonths: 1,
    validityLabel: '1 month',
    badge: '',
    popular: false,
    active: true,
    description: '',
    features: ['']
  });

  // Quick Price Edit Modal
  const [quickPricePlan, setQuickPricePlan] = useState(null);
  const [quickBasePrice, setQuickBasePrice] = useState(199);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await fetchSubscriptionPlans();
      if (data) {
        setProviderPlans(data.serviceProviders || []);
        setUserPlans(data.users || []);
      }
    } catch (err) {
      toast.error('Failed to load subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Open Full Modal for Creating a New Plan
  const handleOpenCreateModal = (audience = 'SERVICE_PROVIDER') => {
    setIsCreatingNew(true);
    setTargetAudience(audience);
    const newId = audience === 'SERVICE_PROVIDER'
      ? `plan-provider-${Date.now()}`
      : `pass-user-${Date.now()}`;
    setPlanForm({
      id: newId,
      name: audience === 'SERVICE_PROVIDER' ? 'New Provider Partner Plan' : 'New User Care Pass',
      target: audience,
      tier: audience === 'USER' ? 'Standard Tier' : '',
      basePrice: audience === 'SERVICE_PROVIDER' ? 299 : 249,
      validityMonths: 1,
      validityLabel: audience === 'SERVICE_PROVIDER' ? '1 month' : '1 Year Unlimited Pass',
      badge: 'New Plan',
      popular: false,
      active: true,
      description: 'Comprehensive pet care access package with full platform benefits.',
      features: ['Direct verified communication', 'Priority scheduling and bookings']
    });
    setShowEditModal(true);
  };

  // Open Full Modal for Editing an Existing Plan
  const handleOpenEditModal = (plan, audience) => {
    setIsCreatingNew(false);
    setTargetAudience(audience);
    setPlanForm({
      id: plan.id,
      name: plan.name || '',
      target: audience,
      tier: plan.tier || '',
      basePrice: Number(plan.basePrice) || 0,
      validityMonths: Number(plan.validityMonths) || 1,
      validityLabel: plan.validityLabel || `${plan.validityMonths || 1} months`,
      badge: plan.badge || '',
      popular: Boolean(plan.popular),
      active: plan.active !== false,
      description: plan.description || '',
      features: Array.isArray(plan.features) && plan.features.length > 0 ? [...plan.features] : ['']
    });
    setShowEditModal(true);
  };

  // Open Quick Price Modal
  const handleOpenQuickPrice = (plan, audience) => {
    setQuickPricePlan({ ...plan, audience });
    setQuickBasePrice(Number(plan.basePrice) || 0);
  };

  // Save Quick Price Update
  const handleSaveQuickPrice = async (e) => {
    e.preventDefault();
    if (!quickPricePlan) return;
    const priceNum = Math.max(0, Number(quickBasePrice));

    let updatedProviders = [...providerPlans];
    let updatedUsers = [...userPlans];

    if (quickPricePlan.audience === 'SERVICE_PROVIDER') {
      updatedProviders = updatedProviders.map(p =>
        p.id === quickPricePlan.id ? { ...p, basePrice: priceNum } : p
      );
      setProviderPlans(updatedProviders);
    } else {
      updatedUsers = updatedUsers.map(u =>
        u.id === quickPricePlan.id ? { ...u, basePrice: priceNum } : u
      );
      setUserPlans(updatedUsers);
    }

    setQuickPricePlan(null);
    toast.success(`Price updated to ₹${priceNum} for ${quickPricePlan.name}!`);

    await saveSubscriptionPlans({
      serviceProviders: updatedProviders,
      users: updatedUsers
    });
  };

  // Toggle Active/Inactive Status
  const handleToggleActive = async (plan, audience) => {
    let updatedProviders = [...providerPlans];
    let updatedUsers = [...userPlans];

    if (audience === 'SERVICE_PROVIDER') {
      updatedProviders = updatedProviders.map(p =>
        p.id === plan.id ? { ...p, active: !p.active } : p
      );
      setProviderPlans(updatedProviders);
    } else {
      updatedUsers = updatedUsers.map(u =>
        u.id === plan.id ? { ...u, active: !u.active } : u
      );
      setUserPlans(updatedUsers);
    }

    toast.success(`${plan.name} status updated!`);
    await saveSubscriptionPlans({
      serviceProviders: updatedProviders,
      users: updatedUsers
    });
  };

  // Delete Plan
  const handleDeletePlan = async (plan, audience) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) return;

    let updatedProviders = [...providerPlans];
    let updatedUsers = [...userPlans];

    if (audience === 'SERVICE_PROVIDER') {
      updatedProviders = updatedProviders.filter(p => p.id !== plan.id);
      setProviderPlans(updatedProviders);
    } else {
      updatedUsers = updatedUsers.filter(u => u.id !== plan.id);
      setUserPlans(updatedUsers);
    }

    toast.success(`Plan "${plan.name}" deleted.`);
    await saveSubscriptionPlans({
      serviceProviders: updatedProviders,
      users: updatedUsers
    });
  };

  // Save Full Plan (Create or Update)
  const handleSaveFullPlan = async (e) => {
    e.preventDefault();
    if (!planForm.name.trim()) {
      return toast.error('Plan name is required.');
    }
    if (planForm.basePrice < 0) {
      return toast.error('Base price cannot be negative.');
    }

    const cleanedFeatures = (planForm.features || [])
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const planPayload = {
      ...planForm,
      id: planForm.id.trim(),
      name: planForm.name.trim(),
      target: targetAudience,
      basePrice: Number(planForm.basePrice),
      validityMonths: Number(planForm.validityMonths) || 1,
      validityLabel: planForm.validityLabel.trim() || `${planForm.validityMonths || 1} months`,
      badge: planForm.badge.trim(),
      popular: Boolean(planForm.popular),
      active: Boolean(planForm.active),
      description: planForm.description.trim(),
      features: cleanedFeatures.length > 0 ? cleanedFeatures : ['Full service access privileges']
    };

    let updatedProviders = [...providerPlans];
    let updatedUsers = [...userPlans];

    if (targetAudience === 'SERVICE_PROVIDER') {
      const idx = updatedProviders.findIndex(p => p.id === planPayload.id);
      if (idx >= 0) {
        updatedProviders[idx] = planPayload;
      } else {
        updatedProviders.push(planPayload);
      }
      setProviderPlans(updatedProviders);
    } else {
      const idx = updatedUsers.findIndex(u => u.id === planPayload.id);
      if (idx >= 0) {
        updatedUsers[idx] = planPayload;
      } else {
        updatedUsers.push(planPayload);
      }
      setUserPlans(updatedUsers);
    }

    setShowEditModal(false);
    toast.success(`Plan "${planPayload.name}" saved successfully!`);

    await saveSubscriptionPlans({
      serviceProviders: updatedProviders,
      users: updatedUsers
    });
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all subscription plans and pricing back to factory system defaults? Any custom price or plan edits will be replaced.')) {
      return;
    }
    setLoading(true);
    try {
      await resetSubscriptionPlans();
      setProviderPlans(getStoredProviderPlans());
      setUserPlans(getStoredUserPlans());
      toast.success('All subscription plans reset to factory defaults.');
    } catch (_) {
      toast.error('Failed to reset plans.');
    } finally {
      setLoading(false);
    }
  };

  // Filter combined lists based on active tab & search query
  const allCards = [
    ...providerPlans.map(p => ({ ...p, audience: 'SERVICE_PROVIDER' })),
    ...userPlans.map(u => ({ ...u, audience: 'USER' }))
  ];

  const filteredCards = allCards.filter(card => {
    if (activeTab === 'provider' && card.audience !== 'SERVICE_PROVIDER') return false;
    if (activeTab === 'user' && card.audience !== 'USER') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (card.name || '').toLowerCase().includes(q);
      const matchDesc = (card.description || '').toLowerCase().includes(q);
      const matchBadge = (card.badge || '').toLowerCase().includes(q);
      return matchName || matchDesc || matchBadge;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E3EBE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#0F2E23] text-white rounded-lg shadow-xs">
              <CreditCard size={18} />
            </span>
            <h2 className="font-serif text-xl font-bold text-primary">
              Subscription Plans & Pricing Management
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure subscription tiers, base pricing, tax calculation, validity periods, and membership benefits for both Pet Parents (Users) and Service Provider Partners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadPlans}
            disabled={loading}
            className="px-3 py-2 text-xs font-bold text-primary bg-white border border-[#E3EBE5] rounded-md hover:bg-[#FAFBF9] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Refresh Plans"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-[#E3EBE5] rounded-md hover:text-red-600 hover:border-red-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Reset to Defaults"
          >
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E3EBE5] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Active Plans</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black font-sans text-primary tracking-tight lining-nums tabular-nums mt-0.5 flex items-baseline">
              <span className="font-sans font-extrabold lining-nums tabular-nums">{allCards.filter(c => c.active !== false).length}</span>
              <span className="text-xs font-sans text-gray-400 font-normal ml-1.5">/ {allCards.length}</span>
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-1">Live in checkout & catalog</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3EBE5] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Pet Parent / User Passes</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black font-sans text-primary tracking-tight lining-nums tabular-nums mt-0.5 flex items-baseline">
              <span className="font-sans font-extrabold lining-nums tabular-nums">{userPlans.length}</span>
              <span className="text-xs font-sans text-gray-400 font-normal ml-1.5">tiers</span>
            </p>
            <p className="text-[10px] text-purple-700 font-medium mt-1 font-sans lining-nums">
              Pricing: ₹ {Math.min(...userPlans.map(u => u.basePrice || 0)).toLocaleString('en-IN')} - ₹ {Math.max(...userPlans.map(u => u.basePrice || 0)).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3EBE5] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Provider Partner Plans</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black font-sans text-primary tracking-tight lining-nums tabular-nums mt-0.5 flex items-baseline">
              <span className="font-sans font-extrabold lining-nums tabular-nums">{providerPlans.length}</span>
              <span className="text-xs font-sans text-gray-400 font-normal ml-1.5">tiers</span>
            </p>
            <p className="text-[10px] text-indigo-700 font-medium mt-1 font-sans lining-nums">
              Pricing: ₹ {Math.min(...providerPlans.map(p => p.basePrice || 0)).toLocaleString('en-IN')} - ₹ {Math.max(...providerPlans.map(p => p.basePrice || 0)).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Building size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3EBE5] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tax Calculation</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black font-sans text-primary tracking-tight lining-nums tabular-nums mt-0.5 flex items-baseline">
              <span className="font-sans font-extrabold lining-nums tabular-nums">18%</span>
              <span className="text-xs font-sans text-gray-400 font-normal ml-1.5">GST</span>
            </p>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Automated GST invoice billing</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
            <Percent size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Audience Switcher */}
      <div className="bg-white p-4 rounded-xl border border-[#E3EBE5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAFBF9] border border-[#E3EBE5] rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#0F2E23] text-white shadow-xs'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              All Plans ({allCards.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('user')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'user'
                  ? 'bg-[#0F2E23] text-white shadow-xs'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Users size={13} />
              <span>User & Customer Passes ({userPlans.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('provider')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'provider'
                  ? 'bg-[#0F2E23] text-white shadow-xs'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Building size={13} />
              <span>Service Provider Plans ({providerPlans.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateModal(activeTab === 'user' ? 'USER' : 'SERVICE_PROVIDER')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#0F2E23] hover:bg-[#1D3B2E] rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Add New Plan</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plan name, badge, description..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAFBF9] border border-[#E3EBE5] rounded-md focus:outline-none focus:border-[#0F2E23]"
          />
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCards.map((plan) => {
          const isProvider = plan.audience === 'SERVICE_PROVIDER';
          const basePrice = Number(plan.basePrice) || 0;
          const gstAmount = Math.round(basePrice * GST_RATE * 100) / 100;
          const totalAmount = Math.round((basePrice + gstAmount) * 100) / 100;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs relative ${
                plan.active === false
                  ? 'border-gray-200 opacity-60 bg-gray-50/50'
                  : plan.popular
                  ? 'border-[#0F2E23] ring-1 ring-[#0F2E23]/20'
                  : 'border-[#E3EBE5] hover:border-[#7CA085]'
              }`}
            >
              {/* Top Banner & Badges */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isProvider
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {isProvider ? <Building size={10} /> : <Users size={10} />}
                    <span>{isProvider ? 'Service Provider' : 'Pet Parent / User'}</span>
                  </span>

                  {/* Top-Right Corner: Badges & ON/OFF Toggle Switch */}
                  <div className="flex items-center gap-2">
                    {plan.popular && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Popular
                      </span>
                    )}

                    {/* ON / OFF Toggle Switch Button */}
                    <div className="flex items-center gap-1.5 bg-[#FAFBF9] border border-[#E3EBE5] px-2 py-0.5 rounded-full shadow-2xs">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        plan.active !== false ? 'text-emerald-700' : 'text-gray-400'
                      }`}>
                        {plan.active !== false ? 'ON' : 'OFF'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(plan, plan.audience)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          plan.active !== false ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={plan.active !== false ? 'Plan is ON (Active): Click to turn OFF' : 'Plan is OFF (Inactive): Click to turn ON'}
                        role="switch"
                        aria-checked={plan.active !== false}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            plan.active !== false ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Title & Badge */}
                <h3 className="font-serif text-lg font-bold text-primary flex items-center justify-between">
                  <span>{plan.name}</span>
                </h3>

                {plan.badge && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-[#7CA085] bg-[#F1F6F2] px-2 py-0.5 rounded">
                    {plan.badge}
                  </span>
                )}

                <p className="text-xs text-gray-500 mt-2 line-clamp-2 min-h-[32px]">
                  {plan.description || 'No description provided.'}
                </p>

                {/* Pricing Box */}
                <div className="mt-4 p-3.5 bg-[#FAFBF9] rounded-xl border border-[#E3EBE5]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Base Price</span>
                    <div className="flex items-baseline">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-black font-sans text-primary flex items-baseline tracking-tight lining-nums tabular-nums">
                        <span className="font-sans font-bold text-base sm:text-lg mr-1 text-primary inline-block">₹</span>
                        <span className="font-sans font-extrabold lining-nums tabular-nums">{basePrice.toLocaleString('en-IN')}</span>
                      </span>
                      <span className="text-xs font-sans text-gray-500 font-medium ml-1.5">/ {plan.validityLabel || `${plan.validityMonths || 1} mo`}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#E3EBE5]/60 flex items-center justify-between text-[11px] text-gray-600 font-sans">
                    <span>GST (18%): ₹ {gstAmount.toFixed(2)}</span>
                    <span className="font-bold text-primary lining-nums">Total: ₹ {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Included Perks & Privileges:</p>
                  {(plan.features || []).slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{f}</span>
                    </div>
                  ))}
                  {(plan.features || []).length > 4 && (
                    <p className="text-[10px] text-gray-400 italic pl-5">
                      +{(plan.features || []).length - 4} more benefits
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-4 bg-[#FAFBF9] border-t border-[#E3EBE5] flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${plan.active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-[11px] font-semibold text-gray-600">
                    {plan.active !== false ? 'Active in catalog' : 'Deactivated'}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan, plan.audience)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-[#E3EBE5] transition cursor-pointer"
                    title="Delete Plan"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(plan, plan.audience)}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0F2E23] hover:bg-[#1D3B2E] rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit2 size={12} />
                    <span>Edit Details</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E3EBE5]">
          <AlertCircle size={28} className="mx-auto text-gray-400 mb-2" />
          <h4 className="font-serif font-bold text-primary">No Subscription Plans Found</h4>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or create a new plan.</p>
        </div>
      )}

      {/* QUICK PRICE EDIT MODAL */}
      {quickPricePlan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E3EBE5] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#0F2E23] text-white flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm">Quick Price Update</h4>
                <p className="text-[11px] text-[#A1C0AA]">{quickPricePlan.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickPricePlan(null)}
                className="p-1 hover:bg-white/10 rounded transition cursor-pointer text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrice} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Base Price (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={quickBasePrice}
                    onChange={(e) => setQuickBasePrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold text-primary bg-[#FAFBF9] border border-[#E3EBE5] rounded-lg focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              {/* Live Tax Summary */}
              <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E3EBE5] text-xs space-y-1.5 font-sans">
                <div className="flex justify-between text-gray-600">
                  <span>Base Price:</span>
                  <span className="font-bold text-primary lining-nums">₹ {Number(quickBasePrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>18% GST:</span>
                  <span className="font-bold text-primary lining-nums">₹ {(Number(quickBasePrice || 0) * GST_RATE).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-baseline font-bold text-primary pt-1.5 border-t border-[#E3EBE5]">
                  <span>Total Payable:</span>
                  <span className="text-base font-black font-sans text-primary tracking-tight lining-nums tabular-nums flex items-baseline">
                    <span className="font-bold text-xs mr-0.5">₹</span>
                    <span className="font-extrabold">{(Number(quickBasePrice || 0) * (1 + GST_RATE)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPricePlan(null)}
                  className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0F2E23] hover:bg-[#1D3B2E] rounded-lg transition cursor-pointer shadow-xs"
                >
                  Save New Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL CREATE / EDIT SUBSCRIPTION PLAN MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E3EBE5] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-[#0F2E23] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                  {targetAudience === 'SERVICE_PROVIDER' ? <Building size={16} /> : <Users size={16} />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    {isCreatingNew
                      ? (targetAudience === 'SERVICE_PROVIDER' ? 'Create Service Provider Partner Plan' : 'Create Pet Parent / User Customer Pass')
                      : `Edit ${planForm.name}`}
                  </h3>
                  <p className="text-[11px] text-[#A1C0AA]">
                    {targetAudience === 'SERVICE_PROVIDER' ? 'Service Provider Partner Tiers & Directory Perks' : 'Pet Parent & Customer Access Passes'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveFullPlan} className="p-6 overflow-y-auto space-y-4 text-xs flex-grow">
              {/* Audience Scope Display (Dedicated to the specific plan type) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Audience Scope</label>
                {targetAudience === 'SERVICE_PROVIDER' ? (
                  <div className="p-3.5 rounded-xl border bg-indigo-50/80 border-indigo-200 text-indigo-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
                      <Building size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        <span>Service Provider Partner Plan</span>
                        <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded font-bold uppercase">Provider Only</span>
                      </p>
                      <p className="text-[11px] text-indigo-700/80 mt-0.5">
                        Controls partner directory listing status, verified badge, direct chat inquiries, and payout commission rates.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border bg-purple-50/80 border-purple-200 text-purple-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        <span>Pet Parent / Customer Service Pass</span>
                        <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-bold uppercase">Customer Only</span>
                      </p>
                      <p className="text-[11px] text-purple-700/80 mt-0.5">
                        Controls customer privileges: 24/7 VIP concierge assistance, priority bookings, zero cancellation fees, and store discounts.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Plan ID & Plan Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Plan Identifier (Key / ID)</label>
                  <input
                    type="text"
                    required
                    disabled={!isCreatingNew}
                    value={planForm.id}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full px-3 py-2 text-xs bg-[#FAFBF9] border border-[#E3EBE5] rounded-lg focus:outline-none focus:border-[#0F2E23] font-mono disabled:opacity-60"
                    placeholder="e.g. monthly, quarterly, pass-vip"
                  />
                  <span className="text-[10px] text-gray-400">Unique internal identifier</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Plan Title / Name</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#FAFBF9] border border-[#E3EBE5] rounded-lg focus:outline-none focus:border-[#0F2E23] font-bold"
                    placeholder="e.g. Yearly Plan, VIP Priority Pass"
                  />
                </div>
              </div>

              {/* Pricing & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAFBF9] rounded-xl border border-[#E3EBE5]">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Base Price (₹ INR)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={planForm.basePrice}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, basePrice: e.target.value }))}
                      className="w-full pl-7 pr-2 py-1.5 text-xs font-bold text-primary bg-white border border-[#E3EBE5] rounded-md focus:outline-none focus:border-[#0F2E23]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Validity Label</label>
                  <input
                    type="text"
                    required
                    value={planForm.validityLabel}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, validityLabel: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E3EBE5] rounded-md focus:outline-none focus:border-[#0F2E23]"
                    placeholder="e.g. 1 month, 1 Year Pass"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Validity (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={planForm.validityMonths}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, validityMonths: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E3EBE5] rounded-md focus:outline-none focus:border-[#0F2E23]"
                    placeholder="e.g. 1, 3, 12"
                  />
                </div>

                {/* Tax live preview banner */}
                <div className="sm:col-span-3 pt-2.5 border-t border-[#E3EBE5] flex items-center justify-between text-xs text-gray-600 font-sans">
                  <span>Base: <strong className="text-primary font-bold lining-nums">₹ {Number(planForm.basePrice || 0).toLocaleString('en-IN')}</strong></span>
                  <span>+ 18% GST: <strong className="text-primary font-bold lining-nums">₹ {(Number(planForm.basePrice || 0) * GST_RATE).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                  <span className="text-primary flex items-baseline gap-1">
                    <span className="font-medium">Total Invoiced:</span>
                    <span className="font-black font-sans tracking-tight lining-nums text-sm">₹ {(Number(planForm.basePrice || 0) * (1 + GST_RATE)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </span>
                </div>
              </div>

              {/* Badge & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Highlight Badge Text</label>
                  <input
                    type="text"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#FAFBF9] border border-[#E3EBE5] rounded-lg focus:outline-none focus:border-[#0F2E23]"
                    placeholder="e.g. POPULAR VALUE, ★ VIP MOST RECOMMENDED"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={planForm.popular}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, popular: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0F2E23] focus:ring-0 cursor-pointer"
                    />
                    <span>Popular / Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={planForm.active}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0F2E23] focus:ring-0 cursor-pointer"
                    />
                    <span>Active in Catalog</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Summary</label>
                <textarea
                  rows="2"
                  value={planForm.description}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 text-xs bg-[#FAFBF9] border border-[#E3EBE5] rounded-lg focus:outline-none focus:border-[#0F2E23]"
                  placeholder={
                    targetAudience === 'SERVICE_PROVIDER'
                      ? 'Summarize the partnership perks for veterinarians, clinics, hostels, and grooming spas...'
                      : 'Summarize the membership pass perks for pet parents and retail customers...'
                  }
                />
              </div>

              {/* Features List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-gray-700">Features & Privileges List</label>
                  <button
                    type="button"
                    onClick={() => setPlanForm(prev => ({ ...prev, features: [...prev.features, ''] }))}
                    className="text-[11px] font-bold text-[#0F2E23] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Bullet Point</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {planForm.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center text-gray-400 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const updated = [...planForm.features];
                          updated[idx] = e.target.value;
                          setPlanForm(prev => ({ ...prev, features: updated }));
                        }}
                        placeholder={
                          targetAudience === 'SERVICE_PROVIDER'
                            ? `e.g. Priority ranking in local search results & verified partner badge (Perk ${idx + 1})`
                            : `e.g. 24/7 Priority VIP Concierge & zero cancellation fees (Perk ${idx + 1})`
                        }
                        className="flex-grow px-3 py-1.5 text-xs bg-[#FAFBF9] border border-[#E3EBE5] rounded-md focus:outline-none focus:border-[#0F2E23]"
                      />
                      {planForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = planForm.features.filter((_, i) => i !== idx);
                            setPlanForm(prev => ({ ...prev, features: updated }));
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E3EBE5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F2E23] hover:bg-[#1D3B2E] rounded-lg transition cursor-pointer shadow-xs"
                >
                  {isCreatingNew ? 'Create Subscription Plan' : 'Save Plan Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSubscriptionPlansView;

