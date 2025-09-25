// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeFirestore, getFirestore, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log Firebase config (without sensitive data)
console.log('Firebase Config:', {
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? '***' : 'Not set',
  measurementId: firebaseConfig.measurementId ? '***' : 'Not set'
});

// Initialize Firebase with checks to prevent multiple initializations
let app;
let analytics;
let db;

// Initialize Firebase only if it hasn't been initialized yet
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
    
    // Initialize Firestore with new cache settings
    try {
      db = initializeFirestore(app, {
        cache: {
          // Use memory cache first, then fall back to IndexedDB
          kind: 'memory',
          // Optional: Set a size limit for the memory cache
          size: 10 * 1024 * 1024, // 10MB
          // Enable offline persistence
          persistence: true,
          // Optional: Set a custom cache key prefix
          keyPrefix: 'scantyx-cache-'
        },
        // Keep the old settings for compatibility
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        experimentalForceLongPolling: false,
        experimentalAutoDetectLongPolling: true
      });
      
      console.log('Firestore initialized with new cache settings');
      
      // Fallback for older browsers if needed
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        // Only enable persistence if not already enabled by the new cache settings
        if (!db._persistenceEnabled) {
          enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
              console.warn('The current browser does not support all of the features required to enable persistence');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error initializing Firestore:', error);
      // Fallback to default initialization if there's an error
      db = initializeFirestore(app, {});
    }
    
    // Initialize Analytics if supported (only in browser)
    if (typeof window !== 'undefined') {
      isSupported()
        .then(supported => {
          if (supported) {
            analytics = getAnalytics(app);
            console.log('Firebase Analytics initialized');
          } else {
            console.log('Firebase Analytics is not supported in this browser');
          }
        })
        .catch(err => console.error('Error initializing Analytics:', err));
    }
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error; // Re-throw to prevent silent failures
  }
} else {
  // Use existing app instance if already initialized
  app = getApp();
  db = getFirestore(app);
  console.log('Using existing Firebase app instance');
}

// Export the Firebase services
export { app, db, analytics };
