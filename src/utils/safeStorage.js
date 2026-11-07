/**
 * safeStorage.js
 * Resilient LocalStorage utilities that gracefully handle QuotaExceededError and quota limits.
 * Uses an in-memory Map fallback when disk quota is reached, guaranteeing the UI never crashes.
 */

const memoryStorage = new Map();

const CRITICAL_KEYS = new Set([
  'joshpetshub_token',
  'joshpetshub_user',
  'pawora_user_membership'
]);

export const safeSetItem = (key, value) => {
  // Always keep in-memory fallback in sync
  try {
    memoryStorage.set(key, value);
  } catch (_) {}

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    const isQuota =
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014 ||
      e?.message?.toLowerCase().includes('quota');

    if (isQuota) {
      console.warn(`[SafeStorage] LocalStorage quota exceeded while setting "${key}". Pruning non-critical cache...`);
      try {
        // Priority 1: High-weight disposable caches
        const heavyCaches = [
          'joshpetshub_cached_products',
          'joshpetshub_last_active_chat',
          'joshpetshub_adoption_documents',
          'joshpetshub_vet_doctors_v1',
          'sellerDashboardTab',
          'transportDashboardTab',
          'walkingDashboardTab',
          'trainingDashboardTab',
          'insuranceDashboardTab',
          'breedingDashboardTab',
          'hostelDashboardTab',
          'groomingDashboardTab',
          'vetDashboardTab'
        ];

        for (const k of heavyCaches) {
          if (k !== key && !CRITICAL_KEYS.has(k)) {
            try { localStorage.removeItem(k); } catch (_) {}
          }
        }

        // Try setting again after clearing heavy caches
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (_) {}

        // Priority 2: Scan remaining keys and remove non-critical entries
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k !== key && !CRITICAL_KEYS.has(k)) {
            keysToRemove.push(k);
          }
        }

        for (const k of keysToRemove) {
          try { localStorage.removeItem(k); } catch (_) {}
          try {
            localStorage.setItem(key, value);
            return true;
          } catch (_) {}
        }
      } catch (pruneErr) {
        console.warn(`[SafeStorage] Cleanup error:`, pruneErr);
      }
    }

    // Gracefully use memory storage without throwing an exception
    console.warn(`[SafeStorage] Could not persist "${key}" to disk quota. Using in-memory fallback.`);
    return false;
  }
};

export const safeGetItem = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;
  } catch (e) {
    console.warn(`[SafeStorage] Error reading "${key}":`, e);
  }

  // Fallback to in-memory store if disk read missed or failed
  if (memoryStorage.has(key)) {
    return memoryStorage.get(key);
  }

  return fallback;
};

export const safeRemoveItem = (key) => {
  try {
    memoryStorage.delete(key);
  } catch (_) {}

  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[SafeStorage] Error removing "${key}":`, e);
  }
};
