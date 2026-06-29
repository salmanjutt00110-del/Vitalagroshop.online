import {
  collection, addDoc, doc, updateDoc,
  serverTimestamp, query, orderBy,
  onSnapshot, getCountFromServer,
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from '../firebase';
import apiClient from '../apiClient';

const COL = 'orders';

// Local storage helpers matching api.js tables
const getLocalOrders = () => {
  const key = 'vital_sb_orders';
  return JSON.parse(localStorage.getItem(key) || '[]');
};

const setLocalOrders = (list) => {
  const key = 'vital_sb_orders';
  localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('local_db_change_orders', { detail: list }));
};

// Auto order number: VA-[Year]-[Count]
const genOrderNum = async () => {
  if (!isFirebaseEnabled) {
    const list = getLocalOrders();
    const year = new Date().getFullYear();
    return `VA-${year}-${String(list.length + 1).padStart(4, '0')}`;
  }
  const year = new Date().getFullYear();
  const snap = await getCountFromServer(collection(db, COL));
  return `VA-${year}-${String(snap.data().count + 1).padStart(4, '0')}`;
};

export const createOrder = async (data) => {
  if (!isFirebaseEnabled) {
    try {
      let res;
      if (data instanceof FormData) {
        res = await apiClient.post('/orders', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Legacy JSON POST mapping
        res = await apiClient.post('/orders', {
          customer: {
            name: data.customerName,
            phone: data.customerPhone,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            address: data.address,
            specialInstructions: data.instructions || ""
          },
          item: {
            productId: data.productId || "",
            productName: data.productName,
            packSize: data.packSize,
            quantity: data.quantity,
            price: data.pricePerUnit
          },
          totalAmount: data.grandTotal,
          paymentMethod: data.paymentMethod,
          paymentDetails: data.paymentTID ? {
            refId: data.paymentTID,
            amountPaid: data.grandTotal,
            status: 'pending',
            receiverWallet: data.paymentScreenshotPointer
          } : null
        });
      }
      const result = res.data;
      return result.order_id;
    } catch (e) {
      console.warn("Flask server is offline or failed, falling back to LocalStorage:", e);
      const list = getLocalOrders();
      const year = new Date().getFullYear();
      const orderNumber = `VA-${year}-${String(list.length + 1).padStart(4, '0')}`;
      
      let plainData = {};
      if (data instanceof FormData) {
        // Unpack form data keys into local storage
        for (const [key, val] of data.entries()) {
          if (val instanceof File) {
            plainData[key + 'Name'] = val.name;
          } else {
            plainData[key] = val;
          }
        }
      } else {
        plainData = { ...data };
      }

      const id = plainData.id || 'va-order-' + Math.random().toString(36).substring(2, 11);
      const newOrder = {
        ...plainData,
        id,
        orderNumber,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(newOrder);
      setLocalOrders(list);
      return id;
    }
  }

  const orderNumber = await genOrderNum();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    orderNumber,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateOrder = async (id, status, notes) => {
  if (!isFirebaseEnabled) {
    try {
      // First try Flask Backend API
      await apiClient.put(`/orders/${id}/status`, { status, notes });
      return;
    } catch (e) {
      console.warn("Flask server is offline or failed, falling back to LocalStorage:", e);
      let list = getLocalOrders();
      list = list.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status,
            notes: notes || '',
            updatedAt: new Date().toISOString(),
            ...(status === 'confirmed'  && { confirmedAt: new Date().toISOString() }),
            ...(status === 'delivered'  && { deliveredAt: new Date().toISOString() }),
          };
        }
        return item;
      });
      setLocalOrders(list);
      return;
    }
  }

  await updateDoc(doc(db, COL, id), {
    status,
    notes: notes || '',
    updatedAt: serverTimestamp(),
    ...(status === 'confirmed'  && { confirmedAt: serverTimestamp() }),
    ...(status === 'delivered'  && { deliveredAt: serverTimestamp() }),
  });
};

// Legacy compatibility wrapper
export const updateOrderStatus = async (id, status, notes = '', paymentDetails = null) => {
  if (!isFirebaseEnabled) {
    try {
      // First try Flask Backend API
      await apiClient.put(`/orders/${id}/status`, { status, notes, paymentDetails });
      return;
    } catch (e) {
      console.warn("Flask server is offline or failed, falling back to LocalStorage:", e);
      let list = getLocalOrders();
      list = list.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status,
            notes: notes || '',
            updatedAt: new Date().toISOString(),
            ...(paymentDetails && { paymentDetails }),
            ...(status === 'confirmed'  && { confirmedAt: new Date().toISOString() }),
            ...(status === 'delivered'  && { deliveredAt: new Date().toISOString() }),
          };
        }
        return item;
      });
      setLocalOrders(list);
      return;
    }
  }

  await updateDoc(doc(db, COL, id), {
    status,
    notes: notes || '',
    updatedAt: serverTimestamp(),
    ...(paymentDetails && { paymentDetails }),
    ...(status === 'confirmed'  && { confirmedAt: serverTimestamp() }),
    ...(status === 'delivered'  && { deliveredAt: serverTimestamp() }),
  });
};

export const subscribeOrders = (cb) => {
  if (!isFirebaseEnabled) {
    let active = true;
    const trigger = async () => {
      try {
        const res = await apiClient.get('/orders');
        const list = res.data;
        if (active) {
          const convertDates = (obj) => {
            if (!obj) return obj;
            const newObj = { ...obj };
            const dateFields = ['createdAt', 'updatedAt', 'confirmedAt', 'deliveredAt'];
            dateFields.forEach(f => {
              if (newObj[f]) {
                const dVal = new Date(newObj[f]);
                newObj[f] = { toDate: () => dVal };
              }
            });
            return newObj;
          };
          cb(list.map(item => ({ id: item.id, ...convertDates(item) })));
        }
      } catch (e) {
        const list = getLocalOrders();
        const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const convertDates = (obj) => {
          if (!obj) return obj;
          const newObj = { ...obj };
          const dateFields = ['createdAt', 'updatedAt', 'confirmedAt', 'deliveredAt'];
          dateFields.forEach(f => {
            if (newObj[f]) {
              const dVal = new Date(newObj[f]);
              newObj[f] = { toDate: () => dVal };
            }
          });
          return newObj;
        };
        if (active) {
          cb(sorted.map(item => ({ id: item.id, ...convertDates(item) })));
        }
      }
    };
    
    trigger();
    const handler = () => trigger();
    window.addEventListener('local_db_change_orders', handler);
    const poll = setInterval(trigger, 4000);
    
    return () => {
      active = false;
      window.removeEventListener('local_db_change_orders', handler);
      clearInterval(poll);
    };
  }

  return onSnapshot(
    query(collection(db, COL), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => {
      const data = d.data();
      const convertDates = (obj) => {
        if (!obj) return obj;
        const newObj = { ...obj };
        const dateFields = ['createdAt', 'updatedAt', 'confirmedAt', 'deliveredAt'];
        dateFields.forEach(f => {
          if (newObj[f] && typeof newObj[f].toDate !== 'function') {
            const dVal = newObj[f].seconds 
              ? new Date(newObj[f].seconds * 1000) 
              : new Date(newObj[f]);
            newObj[f] = { toDate: () => dVal };
          }
        });
        return newObj;
      };
      return { id: d.id, ...convertDates(data) };
    }))
  );
};

// Legacy compatibility wrapper
export const subscribeToOrders = (cb) => subscribeOrders(cb);

export const subscribeToPendingCount = (cb) => {
  if (!isFirebaseEnabled) {
    let active = true;
    const trigger = async () => {
      try {
        const res = await apiClient.get('/orders');
        const list = res.data;
        const pendings = list.filter(item => item.status === 'pending');
        if (active) cb(pendings.length);
      } catch (e) {
        const list = getLocalOrders();
        const pendings = list.filter(item => item.status === 'pending');
        if (active) cb(pendings.length);
      }
    };
    
    trigger();
    const handler = () => trigger();
    window.addEventListener('local_db_change_orders', handler);
    const poll = setInterval(trigger, 4000);
    
    return () => {
      active = false;
      window.removeEventListener('local_db_change_orders', handler);
      clearInterval(poll);
    };
  }

  return onSnapshot(
    query(collection(db, COL)),
    snap => {
      const pendings = snap.docs.filter(d => d.data().status === 'pending');
      cb(pendings.length);
    }
  );
};
