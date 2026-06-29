// Single source of truth for app loading state based on sessionStorage flag

let _hasLoaded = false;

export const AppLoadState = {
  get hasLoaded() {
    if (typeof window === 'undefined') return false;
    try {
      return (
        _hasLoaded || 
        sessionStorage.getItem('vitalAgro_loaded') === 'true' ||
        sessionStorage.getItem('vital_agro_loaded') === 'true' ||
        sessionStorage.getItem('vital_platform_loaded') === 'true' ||
        sessionStorage.getItem('vital_global_hydrated') === 'true'
      );
    } catch (e) {
      console.warn("Storage read failed in AppLoadState:", e);
      return _hasLoaded;
    }
  },
  setLoaded() {
    _hasLoaded = true;
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('vitalAgro_loaded', 'true');
      sessionStorage.setItem('vital_agro_loaded', 'true');
      sessionStorage.setItem('vital_platform_loaded', 'true');
      sessionStorage.setItem('vital_global_hydrated', 'true');
    } catch (e) {
      console.warn("Storage write failed in AppLoadState:", e);
    }
  },
  reset() {   // for dev/testing only
    _hasLoaded = false;
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('vitalAgro_loaded');
      sessionStorage.removeItem('vital_agro_loaded');
      sessionStorage.removeItem('vital_platform_loaded');
      sessionStorage.removeItem('vital_global_hydrated');
    } catch (e) {
      console.warn("Storage reset failed in AppLoadState:", e);
    }
  }
};

