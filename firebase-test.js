// Test Firebase connection
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import 'dotenv/config';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test connection
async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Successfully connected to Firestore!');
    console.log(`Found ${querySnapshot.size} documents in 'test' collection`);
  } catch (error) {
    console.error('❌ Error connecting to Firestore:');
    console.error(error);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure Firestore is enabled in your Firebase Console');
    console.log('2. Check your internet connection');
    console.log('3. Verify your Firebase configuration in .env file');
    console.log('4. Make sure your security rules allow read/write operations');
  }
}

testFirestore();
