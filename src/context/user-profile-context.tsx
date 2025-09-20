
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
      const docRef = doc(db, 'users', user.uid);
      const firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfileState(docSnap.data() as UserProfile);
        }
        // If doc doesn't exist, profile remains initialProfile, will trigger onboarding redirect on protected routes
        setLoading(false);
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setLoading(false);
      });
      return () => firestoreUnsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/auth/signin', '/auth/signup'];
    const isPublicPath = publicPaths.includes(pathname);
    const authPaths = ['/auth/signin', '/auth/signup'];
    const isAuthPath = authPaths.includes(pathname);

    if (!user) {
      // User is not authenticated
      if (!isPublicPath) {
        router.push('/auth/signin');
      }
    } else {
      // User is authenticated
      const profileIsComplete = profile.name && profile.age && profile.height && profile.weight && profile.gender;

      if (isAuthPath) {
         // If on an auth page, redirect to dashboard
        router.push('/dashboard');
      } else if (!isPublicPath && !profileIsComplete && pathname !== '/onboarding') {
        // If on a protected page that IS NOT onboarding, but profile is incomplete, redirect to onboarding
        router.push('/onboarding');
      }
    }
  }, [user, profile, pathname, router, loading]);

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
