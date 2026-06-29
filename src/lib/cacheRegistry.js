/**
 * A client-side memory cache registry backed by localStorage.
 * Avoids redundant JSON parsing or database requests for static configurations.
 */
class ConfigCacheRegistry {
  constructor() {
    this.memoryStore = new Map();
  }

  /**
   * Retrieves a cached configuration object.
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null if not found
   */
  get(key) {
    // Level 1: Sub-millisecond local Map check
    if (this.memoryStore.has(key)) {
      return this.memoryStore.get(key);
    }
    
    // Level 2: LocalStorage lookup
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`va_registry_${key}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.memoryStore.set(key, parsed);
          return parsed;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Sets a configuration object in both memory and localStorage.
   * @param {string} key - Cache key
   * @param {Object} data - Value to store
   */
  set(key, data) {
    this.memoryStore.set(key, data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`va_registry_${key}`, JSON.stringify(data));
    }
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.memoryStore.clear();
    if (typeof window !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('va_registry_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  }
}

export const cacheRegistry = new ConfigCacheRegistry();
