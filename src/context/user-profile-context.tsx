
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';

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
  email?: string; // Add email to profile
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

function UserProfileHandler({ children }: { children: ReactNode }) {
  const { user, loading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until authentication check is complete

    const protectedPaths = ['/dashboard', '/onboarding'];
    const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p));

    if (!user && isProtectedPath) {
      router.push('/auth/signin');
    }
  }, [user, pathname, router, loading]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }


  return <>{children}</>;
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(initialProfile);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // If there's no user, we're done loading.
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    // If we have a user, subscribe to their profile document
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const firestoreUnsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          setProfileState(docSnap.data() as UserProfile);
        } else {
          // If doc doesn't exist, create it for the new user
          const newProfile: UserProfile = {
            ...initialProfile,
            email: user.email || '',
          };
          await setDoc(docRef, newProfile);
          setProfileState(newProfile);
        }
        setLoading(false); // We are done loading once we get the data (or create it)
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setProfileState(initialProfile);
        setLoading(false); // Also stop loading on error
      });
      return () => firestoreUnsubscribe();
    } else {
      // If there's no user, reset the profile state
      setProfileState(initialProfile);
    }
  }, [user]);

  const handleSetProfile = async (newProfile: UserProfile) => {
      setProfileState(newProfile);
      if (user) {
          try {
              const userDocRef = doc(db, 'users', user.uid);
              await setDoc(userDocRef, newProfile, { merge: true });
          } catch (error) {
              console.error("Failed to update profile in Firestore:", error);
          }
      }
  }

  return (
    <UserProfileContext.Provider value={{ profile, setProfile: handleSetProfile, user, loading }}>
        <UserProfileHandler>
          {children}
        </UserProfileHandler>
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

