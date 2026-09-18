/**
 * cookieUtils.js
 * Universal, robust browser cookie utility library for Josh Pets Hub.
 * Handles GDPR/ePrivacy consent, session tokens, functional cookies, and user preferences.
 */

// Cookie consent storage key
export const COOKIE_CONSENT_KEY = 'josh_cookie_consent';
export const COOKIE_SESSION_KEY = 'josh_session_id';
export const COOKIE_LOCATION_KEY = 'josh_user_location';
export const COOKIE_RECENT_KEY = 'josh_recently_viewed';
export const COOKIE_AUTH_KEY = 'josh_auth_session';

/**
 * Sets a cookie in the browser with security best practices.
 * @param {string} name - Cookie name
 * @param {string} value - Cookie string value
 * @param {number} [days=30] - Lifetime in days
 * @param {object} [options={}] - Custom options (path, domain, secure, sameSite)
 */
export const setCookie = (name, value, days = 30, options = {}) => {
  if (typeof document === 'undefined') return;

  const encodedKey = encodeURIComponent(name.trim());
  const encodedVal = encodeURIComponent(typeof value === 'object' ? JSON.stringify(value) : String(value));

  let cookieStr = `${encodedKey}=${encodedVal}`;

  // Expiration
  if (typeof days === 'number') {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookieStr += `; expires=${date.toUTCString()}; max-age=${days * 24 * 60 * 60}`;
  }

  // Path
  const path = options.path || '/';
  cookieStr += `; path=${path}`;

  // Domain (if provided)
  if (options.domain) {
    cookieStr += `; domain=${options.domain}`;
  }

  // SameSite
  const sameSite = options.sameSite || 'Lax';
  cookieStr += `; SameSite=${sameSite}`;

  // Secure: Auto-enable on HTTPS or if explicitly requested
  const isSecure = options.secure !== undefined 
    ? options.secure 
    : (typeof window !== 'undefined' && window.location.protocol === 'https:');
  
  if (isSecure) {
    cookieStr += '; Secure';
  }

  document.cookie = cookieStr;
};

/**
 * Retrieves a cookie value by name.
 * @param {string} name - Cookie name
 * @returns {string|null} - Decoded cookie value or null if not found
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;

  const encodedKey = encodeURIComponent(name.trim()) + '=';
  const cookieArr = document.cookie.split(';');

  for (let i = 0; i < cookieArr.length; i++) {
    let c = cookieArr[i].trim();
    if (c.indexOf(encodedKey) === 0) {
      const rawValue = c.substring(encodedKey.length, c.length);
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    }
  }

  return null;
};

/**
 * Deletes a cookie by setting its expiration to the past.
 * @param {string} name - Cookie name
 * @param {object} [options={}] - Custom options (path, domain)
 */
export const deleteCookie = (name, options = {}) => {
  if (typeof document === 'undefined') return;

  const path = options.path || '/';
  let cookieStr = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=${path}`;

  if (options.domain) {
    cookieStr += `; domain=${options.domain}`;
  }

  document.cookie = cookieStr;
};

/**
 * Checks if a cookie exists.
 * @param {string} name - Cookie name
 * @returns {boolean}
 */
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

/**
 * Returns all accessible cookies as a key-value dictionary.
 * @returns {Record<string, string>}
 */
export const getAllCookies = () => {
  if (typeof document === 'undefined') return {};

  const cookies = {};
  const cookieArr = document.cookie.split(';');

  for (let i = 0; i < cookieArr.length; i++) {
    const item = cookieArr[i].trim();
    if (!item) continue;
    const eqIdx = item.indexOf('=');
    if (eqIdx !== -1) {
      const k = decodeURIComponent(item.substring(0, eqIdx).trim());
      const v = decodeURIComponent(item.substring(eqIdx + 1).trim());
      cookies[k] = v;
    }
  }

  return cookies;
};

/**
 * Completely purges all accessible browser cookies and consent records.
 */
export const clearAllCookiesData = () => {
  if (typeof document === 'undefined') return;

  // 1. Delete all currently accessible cookies
  const cookies = getAllCookies();
  Object.keys(cookies).forEach((cookieName) => {
    deleteCookie(cookieName, { path: '/' });
    deleteCookie(cookieName, { path: '' });
  });

  // Specifically purge all known platform cookie keys
  [
    COOKIE_CONSENT_KEY,
    COOKIE_SESSION_KEY,
    COOKIE_LOCATION_KEY,
    COOKIE_RECENT_KEY,
    COOKIE_AUTH_KEY,
    'pawora_token',
    'josh_promo_tracker'
  ].forEach((key) => {
    deleteCookie(key, { path: '/' });
    deleteCookie(key, { path: '' });
  });

  // 2. Clear localStorage cookie mirrors and cached preferences
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_SESSION_KEY);
      localStorage.removeItem(COOKIE_LOCATION_KEY);
      localStorage.removeItem(COOKIE_RECENT_KEY);
      localStorage.removeItem(COOKIE_AUTH_KEY);
    } catch {}
  }

  // 3. Dispatch global reset events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: null }));
    window.dispatchEvent(new CustomEvent('open-cookie-banner'));
  }
};

/* =========================================================================
 * COOKIE CONSENT (GDPR / ePrivacy / CCPA Compliance)
 * ========================================================================= */

export const DEFAULT_COOKIE_PREFERENCES = {
  essential: true,    // Always true (authentication, security, session, cart)
  functional: true,   // User preferences (city, filters, theme)
  analytics: true,    // Performance, page views, error tracking
  marketing: false,   // Personalized recommendations, promo discounts
  timestamp: null,
  version: '1.0'
};

/**
 * Gets the current user cookie consent settings.
 * Returns null if user hasn't made a choice yet.
 */
export const getCookieConsent = () => {
  const raw = getCookie(COOKIE_CONSENT_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }

  // LocalStorage backup check
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
  }

  return null;
};

/**
 * Saves user's cookie consent preferences and applies cleanup if required.
 * @param {object} preferences - { essential: true, functional: bool, analytics: bool, marketing: bool }
 */
export const setCookieConsent = (preferences) => {
  const consentData = {
    ...DEFAULT_COOKIE_PREFERENCES,
    ...preferences,
    essential: true, // Always enforced
    timestamp: new Date().toISOString()
  };

  // 1. Save in cookie (365 days)
  setCookie(COOKIE_CONSENT_KEY, JSON.stringify(consentData), 365);

  // 2. Save in localStorage as redundant fallback
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    } catch {}
  }

  // 3. Purge non-consented categories if user revoked
  if (!consentData.marketing) {
    deleteCookie(COOKIE_RECENT_KEY);
    deleteCookie('josh_promo_tracker');
  }
  if (!consentData.functional) {
    deleteCookie(COOKIE_LOCATION_KEY);
  }

  // 4. Dispatch global event for reactive UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: consentData }));
  }

  return consentData;
};

/**
 * Helper to check if a specific cookie category is accepted.
 * @param {'essential'|'functional'|'analytics'|'marketing'} category 
 * @returns {boolean}
 */
export const hasConsentedTo = (category) => {
  if (category === 'essential') return true;
  const consent = getCookieConsent();
  if (!consent) return false;
  return Boolean(consent[category]);
};

/* =========================================================================
 * APPLICATION COOKIE HELPERS (Session, Location, Cart, Search)
 * ========================================================================= */

/**
 * Retrieves or initializes an anonymous visitor session ID cookie.
 * @returns {string}
 */
export const getOrCreateSessionId = () => {
  let sessionId = getCookie(COOKIE_SESSION_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    setCookie(COOKIE_SESSION_KEY, sessionId, 30);
  }
  return sessionId;
};

/**
 * Stores user's selected city and state in functional cookie if consented.
 * @param {string} city 
 * @param {string} state 
 */
export const saveLocationCookie = (city, state) => {
  if (!hasConsentedTo('functional')) return;
  setCookie(COOKIE_LOCATION_KEY, JSON.stringify({ city, state }), 60);
};

/**
 * Reads user's selected location from cookie.
 * @returns {{ city: string, state: string } | null}
 */
export const getLocationCookie = () => {
  const raw = getCookie(COOKIE_LOCATION_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return null;
};

/**
 * Stores recently viewed pet / product ID into cookie for recommendations.
 * @param {string} id 
 */
export const saveRecentlyViewedCookie = (id) => {
  if (!hasConsentedTo('marketing')) return;
  try {
    let recent = [];
    const raw = getCookie(COOKIE_RECENT_KEY);
    if (raw) recent = JSON.parse(raw);
    if (!Array.isArray(recent)) recent = [];
    
    // Add to front, keep max 10
    recent = [id, ...recent.filter(item => item !== id)].slice(0, 10);
    setCookie(COOKIE_RECENT_KEY, JSON.stringify(recent), 14);
  } catch {}
};

/**
 * Gets array of recently viewed item IDs from cookie.
 * @returns {string[]}
 */
export const getRecentlyViewedCookie = () => {
  const raw = getCookie(COOKIE_RECENT_KEY);
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {}
  }
  return [];
};
