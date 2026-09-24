import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Cookie, X, Settings2, Sparkles, Lock, BarChart3, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getCookieConsent, 
  setCookieConsent, 
  getOrCreateSessionId,
  clearAllCookiesData,
  DEFAULT_COOKIE_PREFERENCES
} from '../../utils/cookieUtils.js';
import { apiRequest } from '../../services/api.js';

const CookieConsent = () => {
  const [mounted] = useState(() => typeof document !== 'undefined');
  const [showBanner, setShowBanner] = useState(() => !getCookieConsent());
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState(() => getCookieConsent() || DEFAULT_COOKIE_PREFERENCES);

  // Initialize on mount
  useEffect(() => {
    // 1. Ensure anonymous session cookie exists
    const sessionId = getOrCreateSessionId();
    
    // Function to clear locally stored data
    const handleClearEvent = () => {
      clearAllCookiesData();
      setPreferences(DEFAULT_COOKIE_PREFERENCES);
      setShowModal(false);
      setShowBanner(true);
    };

    // Check backend to see if admin deleted the consent log
    if (getCookieConsent()) {
      apiRequest(`/cookie-consents/check/${sessionId}`)
        .then(data => {
          if (data && data.success && data.exists === false) {
            handleClearEvent();
          }
        })
        .catch(err => console.error('Failed to verify cookie consent', err));
    }

    // 2. Listen for external requests to open settings or banner
    const handleOpenSettings = () => {
      const current = getCookieConsent() || DEFAULT_COOKIE_PREFERENCES;
      setPreferences(current);
      setShowModal(true);
      setShowBanner(false);
    };

    const handleOpenBanner = () => {
      setShowBanner(true);
      setShowModal(false);
    };

    if (typeof window !== 'undefined') {
      window.runCookiesPopup = () => {
        setShowBanner(true);
        setShowModal(false);
      };
      window.openCookieSettings = () => {
        const current = getCookieConsent() || DEFAULT_COOKIE_PREFERENCES;
        setPreferences(current);
        setShowModal(true);
        setShowBanner(false);
      };
      window.clearCookiesData = handleClearEvent;
    }

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    window.addEventListener('open-cookie-banner', handleOpenBanner);
    window.addEventListener('clear-cookie-data', handleClearEvent);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
      window.removeEventListener('open-cookie-banner', handleOpenBanner);
      window.removeEventListener('clear-cookie-data', handleClearEvent);
    };
  }, []);

  // Clear All Cookies & Reset Consent
  const handleClearCookiesData = () => {
    clearAllCookiesData();
    setPreferences(DEFAULT_COOKIE_PREFERENCES);
    setShowModal(false);
    setShowBanner(true);
    toast.success('All cookie data and consent history cleared!', {
      icon: '🧹',
      duration: 3500
    });
  };

  const logConsentToBackend = async (prefs) => {
    try {
      const sessionId = getOrCreateSessionId();
      await apiRequest('/cookie-consents', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          preferences: prefs
        })
      });
    } catch (err) {
      console.error('Failed to log cookie consent', err);
    }
  };

  // Accept All Cookies
  const handleAcceptAll = () => {
    const allConsented = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setCookieConsent(allConsented);
    setPreferences(allConsented);
    logConsentToBackend(allConsented);
    setShowBanner(false);
    setShowModal(false);
    toast.success('All cookies accepted!', {
      icon: '🍪',
      duration: 3000
    });
  };

  // Accept Essential Only (Decline Optional)
  const handleEssentialOnly = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setCookieConsent(essentialOnly);
    setPreferences(essentialOnly);
    logConsentToBackend(essentialOnly);
    setShowBanner(false);
    setShowModal(false);
    toast.success('Essential cookies saved.', {
      icon: '🔒',
      duration: 3000
    });
  };

  // Save Customized Preferences
  const handleSavePreferences = () => {
    setCookieConsent(preferences);
    logConsentToBackend(preferences);
    setShowBanner(false);
    setShowModal(false);
    toast.success('Cookie preferences updated!', {
      icon: '✅',
      duration: 3000
    });
  };

  const toggleCategory = (key) => {
    if (key === 'essential') return;
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* 1. BOTTOM RIGHT COOKIE POPUP */}
      {showBanner && (
        <div 
          id="cookie-consent-banner"
          style={{ zIndex: 2147483647, position: 'fixed' }}
          className="bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-[400px] bg-[#0a231b]/95 backdrop-blur-xl text-white border border-white/20 shadow-2xl rounded-3xl p-5 md:p-6 animate-in fade-in slide-in-from-bottom-5 duration-500"
        >
          <div className="flex flex-col gap-5">
            {/* Top: Icon + Content */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fde047] to-[#f59e0b] text-[#0f2e23] flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <Cookie size={24} />
              </div>
              <div className="space-y-1.5 flex-1 pt-1">
                <h3 className="text-base font-black text-white flex items-center gap-1.5 tracking-tight">
                  We Value Your Privacy <Sparkles size={14} className="text-[#fde047]" />
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Josh Pets Hub uses cookies to secure your account, remember your location, and tailor recommendations.
                </p>
              </div>
            </div>

            {/* Bottom: Action Buttons */}
            <div className="flex flex-col gap-2.5 mt-1">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold py-2.5 px-3 rounded-xl text-xs transition-all active:scale-95 cursor-pointer text-center"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 bg-gradient-to-r from-[#fde047] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] text-[#0f2e23] font-black py-2.5 px-3 rounded-xl text-xs transition-all shadow-md shadow-amber-500/25 active:scale-95 cursor-pointer text-center"
                >
                  Accept All
                </button>
              </div>
              
              <button 
                type="button"
                onClick={() => {
                  setShowBanner(false);
                  setShowModal(true);
                }}
                className="w-full text-xs font-bold text-[#fde047] hover:text-white transition flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <Settings2 size={14} /> Customize Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLOATING MANAGE COOKIES BUTTON */}
      {!showBanner && !showModal && (
        <button
          type="button"
          onClick={() => {
            const current = getCookieConsent() || DEFAULT_COOKIE_PREFERENCES;
            setPreferences(current);
            setShowModal(true);
          }}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[2147483647] bg-[#0F2E23] hover:bg-[#153f31] text-white p-3 rounded-full shadow-2xl border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
          title="Manage Cookie Preferences"
          aria-label="Manage Cookie Preferences"
        >
          <Cookie size={20} className="text-white group-hover:text-[#fde047] transition-colors" />
        </button>
      )}

      {/* 3. PREFERENCES MODAL */}
      {showModal && (
        <div 
          style={{ zIndex: 2147483647, position: 'fixed' }}
          className="inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0f2e23] text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fde047] text-[#0f2e23] flex items-center justify-center font-bold shadow">
                  <Cookie size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">Cookie Preferences</h2>
                  <p className="text-xs text-white/70">Manage how cookies are used on Josh Pets Hub</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="relative z-10 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[55vh]">
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Customize your cookie choices below. Essential cookies are required to operate the shop, manage your cart, and secure your session.
              </p>

              {/* 1. Strictly Necessary */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className="text-emerald-600" />
                    <span className="text-sm font-black text-slate-900">Strictly Necessary Cookies</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Essential for logging in, shopping cart persistence, payment handling, and platform security. Cannot be disabled.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <div className="w-11 h-6 bg-emerald-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-80">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>

              {/* 2. Functional & Preference */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-white flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Settings2 size={15} className="text-blue-600" />
                    <span className="text-sm font-black text-slate-900">Functional & Preference Cookies</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Remembers your selected city, preferred pet types (e.g. Dogs, Birds), and customized viewing options.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory('functional')}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                      preferences.functional ? 'bg-[#0f2e23] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
              </div>

              {/* 3. Analytics & Performance */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-white flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={15} className="text-purple-600" />
                    <span className="text-sm font-black text-slate-900">Analytics & Performance Cookies</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Helps us measure site traffic, optimize loading speeds, and detect potential service issues.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory('analytics')}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                      preferences.analytics ? 'bg-[#0f2e23] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
              </div>

              {/* 4. Marketing & Personalization */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-white flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-amber-600" />
                    <span className="text-sm font-black text-slate-900">Marketing & Recommendation Cookies</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Delivers personalized pet recommendations, recently viewed adoption pets, and relevant discounts.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory('marketing')}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                      preferences.marketing ? 'bg-[#0f2e23] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="w-full sm:w-auto text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                >
                  Reject Optional
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                >
                  Save Choices
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto bg-[#0f2e23] hover:bg-[#153f31] text-[#fde047] font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-md"
                >
                  Accept All
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default CookieConsent;
