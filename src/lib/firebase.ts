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
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log('Firestore persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.log('Firestore persistence failed: browser does not support it.');
    }
  });


// --- Firestore Service Functions ---

const initialProfileData = {
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    faceScan: null,
    bodyScan: null,
    closetItems: [],
};


// Create a new user profile document in Firestore
export const createUserProfile = async (userId: string, email: string) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            uid: userId,
            email,
            ...initialProfileData,
        });
    } catch (error) {
        console.error("Error creating user profile: ", error);
        throw error;
    }
};

// Get a user profile from Firestore
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile: ", error);
        throw error;
    }
};

// Update a user profile in Firestore
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating user profile: ", error);
        throw error;
    }
};


export { app, auth, db };
