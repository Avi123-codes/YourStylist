"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';

export type ClothingItem = {
  id: string;
  imageDataUri: string;
  description: string | null;
};

export type UserProfile = {
  name: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
  faceScan: string | null;
  bodyScan: string | null;
  closetItems: ClothingItem[];
  email?: string;
};

type UserProfileContextType = {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  user: User | null;
  loading: boolean;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const initialProfile: UserProfile = {
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    faceScan: null,
    bodyScan: null,
    closetItems: [],
    email: '',
};

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(initialProfile);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Auth state is resolved
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    let firestoreUnsubscribe: () => void;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      firestoreUnsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          setProfileState(docSnap.data() as UserProfile);
        } else {
          // This case handles a newly signed-up user whose profile doesn't exist yet.
          const newProfile: UserProfile = {
            ...initialProfile,
            email: user.email || '',
          };
          try {
             // Create the document in Firestore for the new user.
             await setDoc(docRef, newProfile);
             setProfileState(newProfile);
          } catch (error) {
              console.error("Error creating new user profile doc:", error);
          }
        }
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setProfileState(initialProfile); // Reset on error
      });
    } else {
      // If there is no user, reset the profile state.
      setProfileState(initialProfile);
    }
    // Cleanup function for the snapshot listener
    return () => {
        if (firestoreUnsubscribe) firestoreUnsubscribe();
    };
  }, [user]); // This effect depends only on the user object.

  const handleSetProfile = async (newProfile: UserProfile) => {
      // Optimistically update local state
      setProfileState(newProfile);
      if (user) {
          try {
              const userDocRef = doc(db, 'users', user.uid);
              // Save the entire profile object to Firestore
              await setDoc(userDocRef, newProfile, { merge: true });
          } catch (error) {
              console.error("Failed to update profile in Firestore:", error);
              // Optional: Handle error, e.g., show a toast
          }
      }
  }

  // Handle routing based on auth state
  useEffect(() => {
    if (loading) return; // Don't do anything until auth state is confirmed

    const isAuthPath = pathname.startsWith('/auth');
    const isPublicPath = pathname === '/';
    
    // If there's no user and the path is not public/auth, redirect to sign-in.
    if (!user && !isAuthPath && !isPublicPath) {
      router.push('/auth/signin');
    }
    
    // If there is a user and they are on an auth path, redirect to the dashboard.
    if (user && isAuthPath) {
      router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);

  // Render a loading screen for the entire app while checking auth
  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <UserProfileContext.Provider value={{ profile, setProfile: handleSetProfile, user, loading }}>
        {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

