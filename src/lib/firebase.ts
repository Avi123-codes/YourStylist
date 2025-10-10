import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import type { UserProfile } from '@/context/user-profile-context';

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

// Enable offline persistence
try {
    enableIndexedDbPersistence(db);
} catch (err: any) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.log('Firestore persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Firestore persistence failed: browser does not support it.');
    }
}

export { app, auth, db };

