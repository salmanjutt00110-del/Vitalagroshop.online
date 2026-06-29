const isNode = typeof window === 'undefined';

const getLocalStorage = () => {
  if (isNode) return null;
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
};

const storage = getLocalStorage();

const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  const storageKey = `base44_${toSnakeCase(paramName)}`;
  let searchParam = null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    searchParam = urlParams.get(paramName);
    if (removeFromUrl && searchParam) {
      urlParams.delete(paramName);
      const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
        }${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  } catch (e) {
    console.warn("Failed to extract or modify URLSearchParams safely:", e);
  }

  if (searchParam) {
    if (storage) {
      try {
        storage.setItem(storageKey, searchParam);
      } catch (e) {
        console.warn("localStorage setItem failed:", e);
      }
    }
    return searchParam;
  }
  if (defaultValue) {
    if (storage) {
      try {
        storage.setItem(storageKey, defaultValue);
      } catch (e) {
        console.warn("localStorage setItem failed for default:", e);
      }
    }
    return defaultValue;
  }
  if (storage) {
    try {
      const storedValue = storage.getItem(storageKey);
      if (storedValue) {
        return storedValue;
      }
    } catch (e) {
      console.warn("localStorage getItem failed:", e);
    }
  }
  return null;
}

const getAppParams = () => {
  if (storage) {
    try {
      if (getAppParamValue("clear_access_token") === 'true') {
        storage.removeItem('base44_access_token');
        storage.removeItem('token');
      }
    } catch (e) {}
  }

  const appId = getAppParamValue("app_id", { 
    defaultValue: import.meta.env.VITE_BASE44_APP_ID,
    removeFromUrl: true 
  });
  const token = getAppParamValue("access_token", { 
    removeFromUrl: true 
  });

  return {
    appId,
    token
  };
};

export const appParams = getAppParams();