/**
 * safeStorage.js
 * Resilient LocalStorage utilities that gracefully handle QuotaExceededError and quota limits.
 */

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014
    ) {
      console.warn(`[SafeStorage] LocalStorage quota exceeded while setting "${key}". Cleaning non-critical cache...`);
      try {
        // Purge non-critical or legacy cache keys to free up quota
        const keysToPurge = [
          'pawora_vet_doctors_v1',
          'pawora_adoption_documents',
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

        keysToPurge.forEach(k => {
          if (k !== key) {
            try { localStorage.removeItem(k); } catch (_) {}
          }
        });

        // Try setting again
        localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.warn(`[SafeStorage] Could not set "${key}" even after cleanup. Memory fallback will be used.`, retryError);
        return false;
      }
    } else {
      console.warn(`[SafeStorage] Error setting "${key}":`, e);
      return false;
    }
  }
};

export const safeGetItem = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    console.warn(`[SafeStorage] Error reading "${key}":`, e);
    return fallback;
  }
};

export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[SafeStorage] Error removing "${key}":`, e);
  }
};
