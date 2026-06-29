import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseEnabled = !!(
  config.apiKey && 
  config.apiKey !== "YOUR_API_KEY" && 
  !config.apiKey.includes("placeholder")
);

let app = null;
let db = null;
let auth = null;

if (firebaseEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);

    // Offline support
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch(() => {});
    }
  } catch (error) {
    console.error("Firebase SDK initialization failed, falling back to disabled mode:", error);
    firebaseEnabled = false;
    app = null;
    db = null;
    auth = null;
  }
}

export const isFirebaseEnabled = firebaseEnabled;
export { app, db, auth };
export default app;
