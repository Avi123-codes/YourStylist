
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
      if (!currentUser) {
        setProfileState(initialProfile);
        setLoading(false); // If no user, we are not loading a profile
      }
      // If there is a user, loading will be set to false by the firestore listener
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const docRef = doc(db, 'users', user.uid);
      const firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfileState(docSnap.data() as UserProfile);
        } else {
            setProfileState(initialProfile);
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setProfileState(initialProfile);
        setLoading(false);
      });
      return () => firestoreUnsubscribe();
    } else {
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/auth/signin', '/auth/signup'];
    const isPublicPath = publicPaths.includes(pathname);
    const authPaths = ['/auth/signin', '/auth/signup'];
    const isAuthPath = authPaths.includes(pathname);

    if (!user && !isPublicPath) {
        // User is not authenticated and is trying to access a protected page
        router.push('/auth/signin');
    } else if (user && isAuthPath) {
        // User is authenticated and is on an auth page
        router.push('/dashboard');
    }
    
  }, [user, pathname, router, loading]);

  const handleSetProfile = async (newProfile: UserProfile) => {
      setProfileState(newProfile); // Optimistic update
      if (user) {
          try {
              const userDocRef = doc(db, 'users', user.uid);
              // Use setDoc with merge:true which is equivalent to update but creates if it doesn't exist
              await setDoc(userDocRef, newProfile, { merge: true });
          } catch (error) {
              console.error("Failed to update profile in Firestore:", error);
              // Optionally revert optimistic update or show toast
          }
      }
  }

  return (
    <UserProfileContext.Provider value={{ profile, setProfile: handleSetProfile, user, loading }}>
        {loading ? (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        ) : (
            children
        )}
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
