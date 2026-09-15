import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "dummy-auth-domain.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "dummy-project-id.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "0000000000",
  appId: process.env.FIREBASE_APP_ID || "1:0000000000:web:000000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };
