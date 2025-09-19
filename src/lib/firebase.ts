import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-1651390566-f510f",
  appId: "1:913349593136:web:47ec0d8dfd651079afc5f5",
  apiKey: "AIzaSyAwo9-HAWFIz5ksu6hHWWXuqra151DVHVk",
  authDomain: "studio-1651390566-f510f.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "913349593136"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
