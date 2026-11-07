/**
 * WhatsApp Helper Utilities
 * Formats contact numbers cleanly for international WhatsApp messaging (wa.me)
 * and resolves provider WhatsApp numbers registered during onboarding.
 */

// Default verified WhatsApp numbers for registered platform partner personas
export const REGISTERED_PROVIDER_WHATSAPP_MAP = {
  'velvetfur@joshpetshub.com': '9845199882',
  'happypaws@joshpetshub.com': '9731299881',
  'swiftpaws@joshpetshub.com': '9845112233',
  'dr.ramesh@joshpetshub.com': '9845012345',
  'safepet@joshpetshub.com': '9845223344',
  'clevercanines@joshpetshub.com': '9845334455',
  'pawinsure@joshpetshub.com': '9845445566',
  'elitebreed@joshpetshub.com': '9845556677',
  'adopt@joshpetshub.com': '9845577661',
  'productseller@joshpetshub.com': '9845667788',
  'sooryas@gmail.com': '9789883629'
};

const PROVIDER_NAME_KEYWORD_MAP = [
  { keyword: 'velvet', whatsapp: '9845199882' },
  { keyword: 'happy paws', whatsapp: '9731299881' },
  { keyword: 'swift paws', whatsapp: '9845112233' },
  { keyword: 'pawsteps', whatsapp: '9845112233' },
  { keyword: 'ramesh', whatsapp: '9845012345' },
  { keyword: 'harish', whatsapp: '9845012345' },
  { keyword: 'rajesh', whatsapp: '9845012345' },
  { keyword: 'safepet', whatsapp: '9845223344' },
  { keyword: 'clever canines', whatsapp: '9845334455' },
  { keyword: 'pawprotect', whatsapp: '9845445566' },
  { keyword: 'pawinsure', whatsapp: '9845445566' },
  { keyword: 'elite breed', whatsapp: '9845556677' },
  { keyword: 'hope animal', whatsapp: '9845577661' },
  { keyword: 'royal paws', whatsapp: '9945122334' }
];

/**
 * Format a phone number into an international numeric string for wa.me links
 * @param {string|number} number - The phone/WhatsApp number
 * @param {string} countryCode - Country code prefix (defaults to '+91')
 * @returns {string} Clean international phone digits without '+' or spaces
 */
export const formatWhatsAppTargetPhone = (number, countryCode = '+91') => {
  if (!number) return '';
  const digits = number.toString().replace(/\D/g, '');
  if (!digits) return '';

  const cleanCode = (countryCode || '+91').toString().replace(/\D/g, '') || '91';

  // 10-digit Indian number: prepend country code
  if (digits.length === 10) {
    return `${cleanCode}${digits}`;
  }

  // Already starts with country code
  if (digits.length > 10 && digits.startsWith(cleanCode)) {
    return digits;
  }

  return digits;
};

/**
 * Generate a wa.me URL with prefilled encoded message text
 */
export const getWhatsAppUrl = (number, countryCode = '+91', text = '') => {
  const phone = formatWhatsAppTargetPhone(number, countryCode);
  if (!phone) return '#';
  const encoded = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${phone}${encoded ? `?text=${encoded}` : ''}`;
};

/**
 * Resolve the provider's registered WhatsApp number
 * Prioritizes:
 * 1. provider.whatsapp (if valid and not generic placeholder '9876543210')
 * 2. provider.whatsappNumber
 * 3. Registered provider lookup by email / phone / name from localStorage
 * 4. REGISTERED_PROVIDER_WHATSAPP_MAP by email
 * 5. PROVIDER_NAME_KEYWORD_MAP by business/person name
 * 6. provider.mobile / provider.phone
 */
export const resolveProviderWhatsApp = (provider) => {
  if (!provider) return '';

  const provEmail = (provider.email || provider.providerEmail || '').toLowerCase().trim();
  const provName = (provider.name || provider.businessName || provider.walkerName || provider.groomerName || provider.hostName || '').toLowerCase().trim();
  const provPhone = (provider.phone || provider.mobile || '').toString().replace(/\D/g, '');

  // 1. Check direct properties if present and not the dummy default '9876543210'
  let direct = provider.whatsapp || 
               provider.whatsappNumber || 
               provider.clientWhatsapp || 
               provider.clientWhatsApp;
  if (direct) {
    const dStr = direct.toString().replace(/\D/g, '');
    if (dStr && dStr !== '9876543210' && dStr !== '919876543210') {
      return dStr;
    }
  }

  // 2. Check registered users cache by email, phone, or id
  try {
    if (typeof localStorage !== 'undefined') {
      const regUsers = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      const matched = regUsers.find(u => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const uPhone = (u.mobile || u.phone || '').toString().replace(/\D/g, '');
        const uName = (u.businessName || u.name || '').toLowerCase().trim();
        return (provEmail && uEmail && provEmail === uEmail) ||
               (provPhone && uPhone && provPhone === uPhone && provPhone !== '9876543210') ||
               (provName && uName && (provName === uName || provName.includes(uName) || uName.includes(provName))) ||
               (provider.id && (u._id === provider.id || u.id === provider.id));
      });
      if (matched) {
        const found = matched.whatsapp || matched.whatsappNumber || matched.mobile || matched.phone;
        if (found) {
          const fStr = found.toString().replace(/\D/g, '');
          if (fStr && fStr !== '9876543210' && fStr !== '919876543210') {
            return fStr;
          }
        }
      }
    }
  } catch (_) {}

  // 3. Check registered provider email map
  if (provEmail && REGISTERED_PROVIDER_WHATSAPP_MAP[provEmail]) {
    return REGISTERED_PROVIDER_WHATSAPP_MAP[provEmail];
  }

  // 4. Check known provider name keyword map
  if (provName) {
    const matchedKeyword = PROVIDER_NAME_KEYWORD_MAP.find(entry => provName.includes(entry.keyword));
    if (matchedKeyword) {
      return matchedKeyword.whatsapp;
    }
  }

  // 5. Fallback to provider mobile or phone
  const fallback = (provider.mobile || provider.phone || direct || '').toString().trim();
  return fallback;
};

/**
 * Synchronize registered service providers into the service directory
 * Ensures that the WhatsApp number given at registration is present on the provider listing.
 */
export const syncRegisteredProvidersToService = (initialList = [], categoryKeyword = '') => {
  let list = Array.isArray(initialList) ? [...initialList] : [];

  // Update existing items in list with their registered numbers
  list = list.map(prov => {
    const resolvedWa = resolveProviderWhatsApp(prov);
    if (resolvedWa && resolvedWa !== '9876543210' && resolvedWa !== '919876543210') {
      return {
        ...prov,
        phone: prov.phone === '9876543210' || prov.phone === '+91 98765 43210' ? resolvedWa : (prov.phone || resolvedWa),
        whatsapp: resolvedWa,
        whatsappNumber: resolvedWa,
        whatsappCountryCode: prov.whatsappCountryCode || '+91'
      };
    }
    return prov;
  });

  if (typeof localStorage === 'undefined') return list;

  try {
    const regUsers = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
    if (!Array.isArray(regUsers) || regUsers.length === 0) return list;

    // Check for newly registered providers of this category
    if (categoryKeyword) {
      const kw = categoryKeyword.toLowerCase();
      const newProvUsers = regUsers.filter(u => {
        if (u.role !== 'SERVICE_PROVIDER') return false;
        const cat = (u.serviceCategory || u.service_category || '').toLowerCase();
        return cat.includes(kw);
      });

      newProvUsers.forEach(u => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const alreadyInList = list.some(p => (p.email || p.providerEmail || '').toLowerCase().trim() === uEmail);
        if (!alreadyInList) {
          const provWhatsapp = (u.whatsapp || u.whatsappNumber || u.mobile || u.phone || '').toString().trim();
          const provMobile = (u.mobile || u.phone || '').toString().trim();
          list.unshift({
            id: u._id || u.id || ('PROV-' + Date.now()),
            name: u.businessName || u.name,
            providerEmail: u.email,
            email: u.email,
            phone: provMobile || provWhatsapp,
            mobile: provMobile || provWhatsapp,
            whatsapp: provWhatsapp,
            whatsappNumber: provWhatsapp,
            whatsappCountryCode: u.whatsappCountryCode || '+91',
            verified: true,
            rating: 5.0,
            reviews: 1,
            reviewsCount: 1,
            state: u.state || 'Karnataka',
            city: u.city || 'Bangalore',
            area: u.location || u.city || 'Bangalore',
            address: u.address || u.location || '',
            image: u.avatar || u.profilePicture || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop',
            avatar: u.avatar || u.profilePicture || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop',
            degrees: u.degrees || 'B.V.Sc & A.H, M.V.Sc',
            experienceDisplay: u.experienceDisplay || '10+ Years Exp.',
            clinicName: u.businessName || `${u.name} Pet Care`,
            specializations: Array.isArray(u.specializations) ? u.specializations : ['General Physician & Vaccines'],
            videoConsultFee: u.videoConsultFee || 499,
            inClinicFee: u.inClinicFee || 750,
            openTodayTiming: u.openTodayTiming || '09:00 AM - 08:00 PM',
            isEmergencyAvailable: u.isEmergencyAvailable ?? true,
            petCategories: ['Dogs', 'Cats', 'All']
          });
        }
      });
    }

    return list;
  } catch (e) {
    console.warn('Error in syncRegisteredProvidersToService:', e);
    return list;
  }
};
