import { useState, useEffect } from 'react';
import apiClient from './apiClient';

// Simple active health checking flag
let serverOnline = false;
let isCheckingHealth = false;
export const isServerOnline = () => serverOnline;

// Check server status in background without blocking CRUD execution
async function checkServerHealth() {
  if (isCheckingHealth) return;
  isCheckingHealth = true;
  
  apiClient.get('/health', { timeout: 2000 })
    .then(res => {
      serverOnline = (res.status === 200);
      isCheckingHealth = false;
    })
    .catch(e => {
      serverOnline = false;
      isCheckingHealth = false;
    });
}

// Perform initial check
checkServerHealth();
// Check health periodically
if (typeof window !== 'undefined') {
  setInterval(checkServerHealth, 10000);
}

// Local storage list helper
const getLocalList = (table) => {
  if (typeof window === 'undefined') return [];
  try {
    const key = 'vital_sb_' + table;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
};

const setLocalList = (table, list) => {
  if (typeof window === 'undefined') return;
  try {
    const key = 'vital_sb_' + table;
    localStorage.setItem(key, JSON.stringify(list));
    // Emit custom event for realtime listeners
    window.dispatchEvent(new CustomEvent(`local_db_change_${table}`, { detail: list }));
  } catch (e) {
    console.warn("localStorage setLocalList failed:", e);
  }
};

// Emulated Session management
const getLocalSession = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('vital_sb_session');
  return saved ? JSON.parse(saved) : null;
};

// Auth listener callbacks registry
const authListeners = [];
const triggerAuthChange = (event, session) => {
  authListeners.forEach(lis => lis(event, session));
};

export const auth = {
  async signInWithPassword({ email, password }) {
    await checkServerHealth();
    if (serverOnline) {
      try {
        const res = await apiClient.post('/auth/login', { email, password });
        const data = res.data;
        const session = { access_token: data.token, user: data.user };
        localStorage.setItem('vital_sb_session', JSON.stringify(session));
        triggerAuthChange('SIGNED_IN', session);
        return { data: { user: data.user, session }, error: null };
      } catch (e) {
        const errMsg = e.response?.data?.error || 'Invalid credentials';
        return { data: { user: null, session: null }, error: { message: errMsg } };
      }
    }

    // Local Auth Fallback
    const adminEmail = import.meta.env.ADMIN_EMAIL || 'admin@vitalagro.com';
    const adminPassword = import.meta.env.ADMIN_PASSWORD || 'your_secure_password_here';

    if (email === adminEmail && password === adminPassword) {
      const user = { email, id: 'sb-admin-uid', role: 'admin' };
      const session = { access_token: 'mock-sb-token', user };
      localStorage.setItem('vital_sb_session', JSON.stringify(session));
      triggerAuthChange('SIGNED_IN', session);
      return { data: { user, session }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: 'Invalid admin credentials', code: 'invalid_credentials' } };
  },

  async signUp({ email, password }) {
    await checkServerHealth();
    if (serverOnline) {
      try {
        const res = await apiClient.post('/auth/register', { email, password });
        const data = res.data;
        return { data, error: null };
      } catch (e) {
        const errMsg = e.response?.data?.error || 'Registration failed';
        return { data: null, error: { message: errMsg } };
      }
    }
    // Offline local register mock
    return { data: { message: 'Registered locally' }, error: null };
  },

  async signOut() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vital_sb_session');
      }
    } catch (e) {
      console.warn("localStorage removeItem failed in signOut:", e);
    }
    triggerAuthChange('SIGNED_OUT', null);
    return { error: null };
  },

  async getSession() {
    const session = getLocalSession();
    return { data: { session }, error: null };
  },

  async getUser() {
    const session = getLocalSession();
    return { data: { user: session ? session.user : null }, error: null };
  },

  onAuthStateChange(callback) {
    const session = getLocalSession();
    const listener = (event, currentSession) => {
      callback(event, currentSession);
    };
    authListeners.push(listener);
    setTimeout(() => callback('INITIAL_SESSION', session), 10);

    return {
      data: {
        subscription: {
          unsubscribe() {
            const idx = authListeners.indexOf(listener);
            if (idx !== -1) authListeners.splice(idx, 1);
          }
        }
      }
    };
  }
};

export const db = { type: 'db' };

export const useAuthState = (authClient) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const { data } = await authClient.getSession();
      if (isMounted) {
        setUser(data.session?.user || null);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = authClient.onAuthStateChange((event, session) => {
      if (isMounted) {
        setUser(session?.user || null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [authClient]);

  return [user, loading, null];
};

export const signInWithEmailAndPassword = async (authRef, email, password) => {
  const { data, error } = await authRef.signInWithPassword({ email, password });
  if (error) {
    const err = new Error(error.message);
    err.code = error.code || 'auth/invalid-credential';
    throw err;
  }
  return data;
};

export const signOut = async (authRef) => {
  const { error } = await authRef.signOut();
  if (error) throw new Error(error.message);
};

// Firestore Query Adapter Layer
export const collection = (dbRef, path) => {
  return { type: 'collection', path };
};

// document adapter helper
export const doc = (dbRef, path, id) => {
  return { type: 'doc', path, id };
};

export const addDoc = async (colRef, data) => {
  await checkServerHealth();
  if (serverOnline) {
    try {
      const res = await apiClient.post('/orders', data);
      const result = res.data;
      return { id: result.order_id, orderNumber: result.order_number };
    } catch (e) {
      console.error("Failed to post order to Flask:", e);
    }
  }

  // Fallback storage
  const list = getLocalList(colRef.path);
  const id = data.id || 'va-order-' + Math.random().toString(36).substring(2, 11);
  const orderNumber = data.orderNumber || `VA-${new Date().getFullYear()}-${String(list.length + 1).padStart(4, '0')}`;
  const inserted = { id, orderNumber, ...data, created_at: new Date().toISOString() };
  list.push(inserted);
  setLocalList(colRef.path, list);
  return { id, orderNumber };
};

export const updateDoc = async (docRef, data) => {
  await checkServerHealth();
  if (serverOnline) {
    try {
      await apiClient.put(`/orders/${docRef.id}/status`, data);
      return;
    } catch (e) {
      console.error("Failed to update status on Flask:", e);
    }
  }

  // Fallback update
  let list = getLocalList(docRef.path);
  list = list.map(item => {
    if (item.id === docRef.id) {
      return { ...item, ...data, updated_at: new Date().toISOString() };
    }
    return item;
  });
  setLocalList(docRef.path, list);
};

export const query = (colRef, ...constraints) => {
  return { type: 'query', path: colRef.path, constraints };
};

export const where = (field, op, val) => {
  return { type: 'where', field, op, val };
};

export const orderBy = (field, dir) => {
  return { type: 'orderBy', field, dir };
};

// Date converter helper matching Firestore API expected by pages
const convertDates = (obj) => {
  if (!obj) return obj;
  const newObj = { ...obj };
  const dateFields = ['created_at', 'updated_at', 'confirmedAt', 'deliveredAt', 'createdAt', 'updatedAt'];
  dateFields.forEach(f => {
    if (newObj[f] && typeof newObj[f] === 'string') {
      const d = new Date(newObj[f]);
      newObj[f] = { toDate: () => d };
      if (f === 'created_at') newObj.createdAt = { toDate: () => d };
      if (f === 'updated_at') newObj.updatedAt = { toDate: () => d };
    }
  });
  return newObj;
};

export const getDocs = async (queryRef) => {
  await checkServerHealth();
  if (serverOnline) {
    try {
      // Depending on collection path, trigger products or orders
      let url = `/${queryRef.path}`;
      if (queryRef.path === 'orders' && queryRef.type === 'query') {
        url = `/orders`;
      }
      const res = await apiClient.get(url);
      const rawList = res.data;
      const docs = rawList.map(item => ({
        id: item.id,
        data: () => convertDates(item)
      }));
      return { docs, empty: docs.length === 0, size: docs.length };
    } catch (e) {
      console.error("Failed to query Flask API:", e);
    }
  }

  // Local Fallback list query
  let list = getLocalList(queryRef.path);
  if (queryRef.type === 'query' && queryRef.constraints) {
    queryRef.constraints.forEach(c => {
      if (c.type === 'where' && c.op === '==') {
        list = list.filter(item => {
          if (c.field === 'status') return item.status === c.val;
          return item[c.field] === c.val;
        });
      }
    });
  }

  const docs = list.map(item => ({
    id: item.id,
    data: () => convertDates(item)
  }));
  return { docs, empty: docs.length === 0, size: docs.length };
};

export const onSnapshot = (ref, callback, errorCallback) => {
  let active = true;

  const trigger = async () => {
    try {
      if (ref.type === 'doc') {
        await checkServerHealth();
        if (serverOnline) {
          try {
            const res = await apiClient.get(`/orders/${ref.id}`);
            const data = res.data;
            if (active) {
              callback({
                exists: () => !!data,
                id: ref.id,
                data: () => data ? convertDates(data) : null
              });
            }
            return;
          } catch (e) {}
        }

        // Local doc fallback
        const list = getLocalList(ref.path);
        const data = list.find(item => item.id === ref.id);
        if (active) {
          callback({
            exists: () => !!data,
            id: ref.id,
            data: () => data ? convertDates(data) : null
          });
        }
      } else {
        // Query of collection snapshot
        await checkServerHealth();
        if (serverOnline) {
          try {
            const res = await apiClient.get(`/orders`);
            const list = res.data;
            if (active) {
              callback({
                docs: list.map(item => ({
                  id: item.id,
                  data: () => convertDates(item)
                })),
                size: list.length
              });
            }
            return;
          } catch (e) {}
        }

        // Local query list fallback
        let list = getLocalList(ref.path);
        if (ref.type === 'query' && ref.constraints) {
          ref.constraints.forEach(c => {
            if (c.type === 'where' && c.op === '==') {
              list = list.filter(item => {
                if (c.field === 'status') return item.status === c.val;
                return item[c.field] === c.val;
              });
            }
          });
        }
        if (active) {
          callback({
            docs: list.map(item => ({
              id: item.id,
              data: () => convertDates(item)
            })),
            size: list.length
          });
        }
      }
    } catch (e) {
      if (errorCallback) errorCallback(e);
      else console.error("Snapshot error:", e);
    }
  };

  trigger();

  // Poll for updates if online, or listen to local events
  let pollInterval = null;
  if (typeof window !== 'undefined') {
    pollInterval = setInterval(trigger, 4000);
    const localListener = () => {
      trigger();
    };
    window.addEventListener(`local_db_change_${ref.path}`, localListener);

    return () => {
      active = false;
      clearInterval(pollInterval);
      window.removeEventListener(`local_db_change_${ref.path}`, localListener);
    };
  }

  return () => {
    active = false;
  };
};

export const serverTimestamp = () => {
  return new Date().toISOString();
};

export const getCountFromServer = async (ref) => {
  const docsResult = await getDocs(ref);
  return {
    data: () => ({ count: docsResult.size })
  };
};

// Check for double spend screenshot receipt uniqueness
export const verifyReceiptUnique = async (refId) => {
  await checkServerHealth();
  if (!serverOnline) return { duplicate: false };
  try {
    const res = await apiClient.post('/payments/verify-receipt', { refId });
    return res.data;
  } catch (e) {
    return { duplicate: false };
  }
};
