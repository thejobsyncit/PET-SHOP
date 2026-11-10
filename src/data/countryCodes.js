// Standard Country Dial Codes with flags, ISO codes, and national phone digit lengths
export const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN', digits: 10 },
  { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US', digits: 10 },
  { code: '+1', country: 'Canada', flag: '🇨🇦', iso: 'CA', digits: 10 },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB', digits: 10 },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE', digits: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA', digits: 9 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG', digits: 8 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU', digits: 9 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE', digits: 10 },
  { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR', digits: 9 },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ', digits: 9 },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY', digits: 10 },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA', digits: 8 },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW', digits: 8 },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM', digits: 8 },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH', digits: 8 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP', digits: 10 },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD', digits: 10 },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK', digits: 9 },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP', digits: 10 },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA', digits: 9 },
  { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT', digits: 10 },
  { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES', digits: 9 },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL', digits: 9 },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH', digits: 9 },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE', digits: 9 },
  { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO', digits: 8 },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', iso: 'DK', digits: 8 },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE', digits: 9 },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', iso: 'BR', digits: 11 },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', iso: 'MX', digits: 10 },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID', digits: 10 },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH', digits: 10 },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH', digits: 9 },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', iso: 'VN', digits: 9 },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK', digits: 10 },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG', digits: 10 },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG', digits: 10 },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE', digits: 9 },
  { code: '+7', country: 'Russia / Kazakhstan', flag: '🇷🇺', iso: 'RU', digits: 10 },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', iso: 'KR', digits: 10 },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', iso: 'TR', digits: 10 }
];

/**
 * Get required phone digits based on dial code
 * @param {string} countryCode E.g. '+91', '+1', '+971'
 * @returns {number} Required character/digit limit (e.g. 10 for India, 9 for UAE, 8 for Singapore)
 */
export const getRequiredPhoneLength = (countryCode) => {
  if (!countryCode) return 10;
  const match = COUNTRY_DIAL_CODES.find((c) => c.code === countryCode);
  return match ? match.digits : 10;
};

/**
 * Retrieve country object by dial code or iso
 * @param {string} query Dial code (e.g. '+91') or ISO code (e.g. 'IN')
 */
export const getCountryByDialCode = (query) => {
  if (!query) return COUNTRY_DIAL_CODES[0];
  const q = String(query).trim().toLowerCase();
  return (
    COUNTRY_DIAL_CODES.find(
      (c) => c.code.toLowerCase() === q || c.iso.toLowerCase() === q
    ) || COUNTRY_DIAL_CODES[0]
  );
};

/**
 * Clean phone input to numerical values only with optional max length enforcement
 * @param {string} raw Raw input string
 * @param {number} maxLength Optional limit on digits
 * @returns {string} Digits only
 */
export const cleanNumericPhone = (raw, maxLength) => {
  if (!raw) return '';
  const cleaned = String(raw).replace(/\D/g, '');
  return typeof maxLength === 'number' && maxLength > 0 ? cleaned.slice(0, maxLength) : cleaned;
};

/**
 * Validates if the phone number meets the exact length required for the given country
 * @param {string} phone Digits-only phone string
 * @param {string} countryCode Dial code (e.g. '+91')
 * @returns {boolean}
 */
export const isValidPhoneForCountry = (phone, countryCode) => {
  const digits = cleanNumericPhone(phone);
  const requiredLength = getRequiredPhoneLength(countryCode);
  return digits.length === requiredLength;
};
