// firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBunPb5WaaA7uMdKMKN0tvLQlIGgk_12LM",
  authDomain: "my-app-19692.firebaseapp.com",
  projectId: "my-app-19692",
  storageBucket: "my-app-19692.appspot.com",
  messagingSenderId: "226555179524",
  appId: "1:226555179524:web:5ca64cb5b6ed1731b5bb51",
};

// ✅ Prevent double initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
