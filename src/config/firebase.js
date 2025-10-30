// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  initializeFirestore, 
  getFirestore, 
  CACHE_SIZE_UNLIMITED, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

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

// Initialize Firebase services with error handling
const initFirebase = () => {
  let app;
  let analytics;
  let db;
  
  if (!getApps().length) {
    try {
      // Validate Firebase config
      const requiredConfig = [
        'apiKey', 'authDomain', 'projectId', 
        'storageBucket', 'messagingSenderId', 'appId'
      ];
      
      const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);
      if (missingConfig.length > 0) {
        throw new Error(`Missing required Firebase config: ${missingConfig.join(', ')}`);
      }
      
      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
      
      // Initialize Firestore with persistence
      try {
        db = initializeFirestore(app, {
          cache: {
            kind: 'memory',
            size: 10 * 1024 * 1024, // 10MB
            persistence: true,
            keyPrefix: 'scantyx-cache-'
          },
          cacheSizeBytes: CACHE_SIZE_UNLIMITED,
          experimentalForceLongPolling: false,
          experimentalAutoDetectLongPolling: true
        });
        
        console.log('Firestore initialized with cache settings');
        
        // Enable offline persistence for browsers that support it
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
          enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
              console.warn('The current browser does not support all of the features required to enable persistence');
            }
          });
        }
      } catch (firestoreError) {
        console.error('Error initializing Firestore with cache settings:', firestoreError);
        // Fallback to simple initialization
        db = initializeFirestore(app, { cacheSizeBytes: CACHE_SIZE_UNLIMITED });
      }

      // Initialize Analytics only in production and if window is defined
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        isSupported()
          .then((supported) => {
            if (supported) {
              analytics = getAnalytics(app);
              console.log('Firebase Analytics initialized');
            } else {
              console.warn('Firebase Analytics is not supported in this browser');
            }
          })
          .catch((error) => {
            console.error('Error initializing Firebase Analytics:', error);
          });
      }

      return { app, db, analytics };
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  } else {
    app = getApp();
    db = getFirestore(app);
    console.log('Using existing Firebase app instance');
    return { app, db, analytics };
  }
};

// Initialize Firebase
let app, db, analytics;
try {
  const initResult = initFirebase();
  app = initResult.app;
  db = initResult.db;
  analytics = initResult.analytics;
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Re-throw to prevent the app from starting in a broken state
  throw new Error(`Failed to initialize Firebase: ${error.message}`);
}

// Initialize Auth
const auth = getAuth(app);

// Configure auth providers with additional scopes and custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always prompt to select account
  login_hint: '' // Can be set based on user input
});

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Configure auth persistence with better error handling
const configureAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence set to LOCAL');
    
    // Monitor auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User signed in:', user.uid);
      } else {
        console.log('User signed out');
      }
    });
    
  } catch (error) {
    console.error('Error setting auth persistence:', error);
    // Fallback to session persistence if local fails
    if (error.code === 'auth/unsupported-persistence-type') {
      console.warn('Local persistence not supported, falling back to session');
      await setPersistence(auth, 'SESSION');
    }
  }
};

configureAuthPersistence();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: '',
  client_id: import.meta.env.VITE_FIREBASE_WEB_CLIENT_ID || ''
});

// Configure Facebook provider
facebookProvider.setCustomParameters({
  display: 'popup'
});

// Configure Apple provider
appleProvider.addScope('email');
appleProvider.addScope('name');

console.log('Firebase services initialized successfully');

// Export the Firebase services
// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Initializing Google sign-in with redirect...');
    
    // First, ensure auth is properly initialized
    if (!auth) {
      console.error('Auth not initialized');
      return { user: null, error: 'Authentication service not available' };
    }
    
    try {
      // Set persistence to LOCAL to maintain auth state across page refreshes
      await setPersistence(auth, browserLocalPersistence);
      console.log('Persistence set to LOCAL');
      
      // Create Google provider
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters for better user experience
      provider.setCustomParameters({
        prompt: 'select_account', // Forces account selection even when only one account is available
        access_type: 'offline',   // Enables refresh tokens
      });
      
      console.log('Starting Google sign-in redirect...');
      
      // Clear any existing auth state to prevent issues
      await auth.signOut();
      
      // Store the current URL to redirect back after sign-in
      const redirectUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('redirectAfterSignIn', redirectUrl);
      
      // Initiate the sign-in process with redirect
      await signInWithRedirect(auth, provider);
      
      // This point may not be reached due to the redirect
      return { user: null, error: null };
      
    } catch (error) {
      console.error('Error during Google sign-in:', {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential,
        fullError: error
      });
      
      let errorMessage = 'Failed to sign in with Google';
      
      // Handle specific error cases
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different sign-in credentials.';
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code) {
        errorMessage = `Authentication error (${error.code}): ${error.message}`;
      }
      
      // Clean up any partial auth state
      try {
        await auth.signOut();
      } catch (signOutError) {
        console.error('Error during sign-out after failed login:', signOutError);
      }
      
      return { user: null, error: errorMessage };
    }
  } catch (unexpectedError) {
    console.error('Unexpected error in signInWithGoogle:', unexpectedError);
    return { 
      user: null, 
      error: 'An unexpected error occurred. Please try again later.' 
    };
  }
};

// Handle the OAuth redirect result after user returns from OAuth providers
export const handleRedirectResult = async () => {
  try {
    console.log('Attempting to get redirect result...');
    
    // First, ensure auth is properly initialized
    if (!auth) {
      console.error('Auth not initialized');
      return { user: null, error: 'Authentication service not available' };
    }
    
    
    if (!isAppleRedirect) {
      console.log('No OAuth redirect detected');
      return { user: null, error: null };
    }
    
    try {
      // Add a small delay to ensure all redirect state is properly processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if we have a redirect result
      console.log('Calling getRedirectResult...');
      const result = await getRedirectResult(auth);
      console.log('Redirect result:', result);
      
      // Check if we have a user in the result
      if (result?.user) {
        console.log('Google sign-in successful after redirect:', result.user);
        return { user: result.user, error: null };
      }
      
      // If no result, check if there's a current user
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('Using current user from auth:', currentUser);
        return { user: currentUser, error: null };
      }
      
      // Check if we have Google OAuth parameters in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('state') || urlParams.has('code') || urlParams.has('authuser');
      
      if (hasOAuthParams) {
        console.log('OAuth parameters detected but no user found. This might be a race condition.');
        // Wait a bit longer and try to get the current user again
        await new Promise(resolve => setTimeout(resolve, 1000));
        const userAfterWait = auth.currentUser;
        if (userAfterWait) {
          console.log('Found user after additional wait:', userAfterWait);
          return { user: userAfterWait, error: null };
        }
      }
      
      // No redirect result found and no current user
      console.log('No redirect result and no current user found');
      return { user: null, error: 'No authentication result found. Please try signing in again.' };
      
    } catch (error) {
      console.error('Error in handleRedirectResult:', {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential
      });
      
      // Handle specific error cases
      if (error.code === 'auth/account-exists-with-different-credential') {
        const errorMessage = 'An account already exists with the same email but different sign-in credentials.';
        return { user: null, error: errorMessage };
      } 
      if (error.code === 'auth/popup-closed-by-user') {
        const errorMessage = 'Sign in was cancelled. Please try again.';
        return { user: null, error: errorMessage };
      } 
      if (error.code === 'auth/network-request-failed') {
        const errorMessage = 'Network error. Please check your internet connection and try again.';
        return { user: null, error: errorMessage };
      }
      
      // For other errors, include the error code in the message
      const errorMessage = error.code 
        ? `Authentication error (${error.code}): ${error.message}`
        : `Authentication error: ${error.message}`;
        
      return { user: null, error: errorMessage };
    }
  } catch (error) {
    console.error('Unexpected error in handleRedirectResult:', {
      code: error.code,
      message: error.message,
      email: error.email,
      credential: error.credential,
      fullError: error
    });
    
    const errorMessage = error.code 
      ? `Unexpected error (${error.code}): ${error.message}`
      : 'An unexpected error occurred during authentication';
    
    return { user: null, error: errorMessage };
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signInWithApple = async () => {
  try {
    // Configure the Apple provider with required scopes
    const appleProvider = new OAuthProvider('apple.com');
    appleProvider.addScope('email');
    appleProvider.addScope('name');
    
    // Set custom parameters for Apple Sign In
    appleProvider.setCustomParameters({
      // Always request email and name from Apple
      locale: 'en',
      prompt: 'login',
      response_mode: 'form_post',
    });

    // Use redirect instead of popup for better compatibility with Apple
    await signInWithRedirect(auth, appleProvider);
    return { user: null, error: null }; // Will be handled by redirect
  } catch (error) {
    console.error('Apple Sign In Error:', error);
    return { 
      user: null, 
      error: error.message || 'Failed to start Apple Sign In. Please try again.' 
    };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export { 
  app, 
  analytics, 
  db, 
  auth, 
  googleProvider, 
  facebookProvider, 
  appleProvider,
  onAuthStateChanged
};
