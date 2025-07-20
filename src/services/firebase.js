// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
};

// Lazy initialization
let firebaseApp = null;
let analytics = null;
let db = null;
let auth = null;
let storage = null;

// Initialize Firebase app (lightweight)
const initFirebaseApp = async () => {
  if (!firebaseApp) {
    const { initializeApp } = await import("firebase/app");
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
};

// Lazy load analytics
const getAnalyticsInstance = async () => {
  if (!analytics) {
    const firebaseApp = await initFirebaseApp();
    const { getAnalytics } = await import("firebase/analytics");
    analytics = getAnalytics(firebaseApp);
  }
  return analytics;
};

// Lazy load firestore
const getFirestoreInstance = async () => {
  if (!db) {
    const firebaseApp = await initFirebaseApp();
    const { getFirestore } = await import("firebase/firestore");
    db = getFirestore(firebaseApp);
  }
  return db;
};

// Lazy load auth
const getAuthInstance = async () => {
  if (!auth) {
    const firebaseApp = await initFirebaseApp();
    const { getAuth } = await import("firebase/auth");
    auth = getAuth(firebaseApp);
  }
  return auth;
};

// Lazy load storage
const getStorageInstance = async () => {
  if (!storage) {
    const firebaseApp = await initFirebaseApp();
    const { getStorage } = await import("firebase/storage");
    storage = getStorage(firebaseApp);
  }
  return storage;
};

// Export both direct access for backwards compatibility and lazy loaders
export {
  initFirebaseApp,
  getAnalyticsInstance,
  getFirestoreInstance,
  getAuthInstance,
  getStorageInstance,
};

// For backwards compatibility, export the app promise
export const app = initFirebaseApp();
