import { apiRequest } from './api.js';

export const PROVIDER_PLANS_STORAGE_KEY = 'joshpetshub_custom_provider_plans';
export const USER_PLANS_STORAGE_KEY = 'joshpetshub_custom_user_plans';

export const DEFAULT_PROVIDER_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    target: 'SERVICE_PROVIDER',
    basePrice: 199,
    gstRate: 0.18,
    validityMonths: 1,
    validityLabel: '1 month',
    badge: 'Monthly',
    popular: false,
    active: true,
    description: 'Perfect for getting started with flexible month-to-month access.',
    features: [
      'Full service directory listing & verified badge',
      'Unlimited client inquiries & chat bookings',
      'Direct payouts to bank via Central Platform Wallet',
      'Basic operational analytics & review management'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    target: 'SERVICE_PROVIDER',
    basePrice: 499,
    gstRate: 0.18,
    validityMonths: 3,
    validityLabel: '3 months',
    badge: 'Quarterly',
    popular: false,
    active: true,
    description: 'Great balance of commitment and value for active service providers.',
    features: [
      'Priority ranking in localized search results',
      'Direct verified phone & chat booking dispatch',
      'Central Platform Wallet fast-track payouts',
      'Verified partner badge across search and service categories',
      'Customer review alerts & responses'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    target: 'SERVICE_PROVIDER',
    basePrice: 999,
    gstRate: 0.18,
    validityMonths: 12,
    validityLabel: '12 months',
    badge: 'Yearly (Best Value)',
    popular: true,
    active: true,
    description: 'Maximum savings with 365 days of uninterrupted client inquiries & bookings.',
    features: [
      'Top search placement & featured partner spotlight',
      'Zero platform commission on direct client leads',
      'Instant settlement & priority payout processing',
      'Dedicated account manager & support helpline',
      'Unlimited client bookings & appointment calendar',
      'Free promotional announcements on regional hubs'
    ]
  }
];

export const DEFAULT_USER_PLANS = [
  {
    id: 'pass-standard-199',
    name: 'Standard Service Pass',
    target: 'USER',
    tier: 'Standard Access Tier',
    basePrice: 199,
    gstRate: 0.18,
    validityLabel: '1 Year Unlimited Pass',
    badge: 'POPULAR VALUE',
    popular: false,
    active: true,
    description: 'Essential direct access pass to verified service specialists across all pet care departments.',
    features: [
      'Direct verified provider phone & chat communication',
      'Standard booking queue scheduling with verified partners',
      'Access to full provider background clearance credentials',
      'Automated booking reminder SMS and notifications'
    ]
  },
  {
    id: 'pass-vip-499',
    name: 'VIP All-Access & Priority Pass',
    target: 'USER',
    tier: 'VIP Elite Priority',
    basePrice: 499,
    gstRate: 0.18,
    validityLabel: '1 Year Unlimited Pass',
    badge: '★ VIP MOST RECOMMENDED',
    popular: true,
    active: true,
    description: 'All-inclusive VIP pass with 24/7 priority concierge, zero cancellation fees, and instant express bookings across all services.',
    features: [
      '24/7 Priority VIP Concierge & Live Chat support',
      'Instant express fast-track scheduling with top-tier specialists',
      'Direct video & phone consultations with senior veterinarians/experts',
      'Zero cancellation fees & flexible reschedule guarantee',
      'Exclusive 15% discount on pet store orders & grooming add-ons'
    ]
  }
];

export const getStoredProviderPlans = () => {
  try {
    const raw = localStorage.getItem(PROVIDER_PLANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_PROVIDER_PLANS;
};

export const getStoredUserPlans = () => {
  try {
    const raw = localStorage.getItem(USER_PLANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_USER_PLANS;
};

export const fetchSubscriptionPlans = async () => {
  try {
    const res = await apiRequest('/subscriptions/plans');
    if (res && res.success) {
      if (Array.isArray(res.serviceProviders) && res.serviceProviders.length > 0) {
        localStorage.setItem(PROVIDER_PLANS_STORAGE_KEY, JSON.stringify(res.serviceProviders));
      }
      if (Array.isArray(res.users) && res.users.length > 0) {
        localStorage.setItem(USER_PLANS_STORAGE_KEY, JSON.stringify(res.users));
      }
      try {
        window.dispatchEvent(new CustomEvent('subscription-plans-updated', {
          detail: {
            serviceProviders: res.serviceProviders || getStoredProviderPlans(),
            users: res.users || getStoredUserPlans()
          }
        }));
      } catch (_) {}
      return {
        serviceProviders: res.serviceProviders || getStoredProviderPlans(),
        users: res.users || getStoredUserPlans()
      };
    }
  } catch (_) {}

  return {
    serviceProviders: getStoredProviderPlans(),
    users: getStoredUserPlans()
  };
};

export const saveSubscriptionPlans = async ({ serviceProviders, users }) => {
  if (Array.isArray(serviceProviders)) {
    try { localStorage.setItem(PROVIDER_PLANS_STORAGE_KEY, JSON.stringify(serviceProviders)); } catch (_) {}
  }
  if (Array.isArray(users)) {
    try { localStorage.setItem(USER_PLANS_STORAGE_KEY, JSON.stringify(users)); } catch (_) {}
  }

  // Dispatch global window event for live client updates
  try {
    window.dispatchEvent(new CustomEvent('subscription-plans-updated', {
      detail: { serviceProviders, users }
    }));
  } catch (_) {}

  try {
    const res = await apiRequest('/subscriptions/admin/plans', {
      method: 'PUT',
      body: JSON.stringify({ serviceProviders, users })
    });
    return res;
  } catch (err) {
    // Return success gracefully with local persistence even if offline
    return { success: true, localOnly: true, message: 'Plans updated in local storage' };
  }
};

export const resetSubscriptionPlans = async () => {
  try {
    localStorage.setItem(PROVIDER_PLANS_STORAGE_KEY, JSON.stringify(DEFAULT_PROVIDER_PLANS));
    localStorage.setItem(USER_PLANS_STORAGE_KEY, JSON.stringify(DEFAULT_USER_PLANS));
  } catch (_) {}

  try {
    window.dispatchEvent(new CustomEvent('subscription-plans-updated', {
      detail: { serviceProviders: DEFAULT_PROVIDER_PLANS, users: DEFAULT_USER_PLANS }
    }));
  } catch (_) {}

  try {
    const res = await apiRequest('/subscriptions/admin/plans/reset', { method: 'POST' });
    return res;
  } catch (_) {
    return { success: true, localOnly: true };
  }
};

