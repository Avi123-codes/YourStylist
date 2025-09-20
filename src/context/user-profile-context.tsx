
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { onSnapshot, doc } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // User is logged out
        setProfileState(initialProfile);
        setLoading(false);
      }
      // if user is logged in, we wait for the firestore listener to set loading to false
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return; // Don't run routing logic while initial loading is in progress

    const protectedPaths = ['/dashboard', '/onboarding'];
    const authPaths = ['/auth/signin', '/auth/signup'];
    
    const isProtectedRoute = protectedPaths.some(p => pathname.startsWith(p));
    const isAuthPath = authPaths.some(p => pathname.startsWith(p));

    if (!user && isProtectedRoute) {
        router.push('/auth/signin');
    } else if (user && isAuthPath) {
        router.push('/dashboard');
    }

  }, [user, pathname, router, loading]);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfileState(profileData);
        } else {
          // If no profile exists, direct to onboarding unless on an auth page
          if (!pathname.startsWith('/auth')) {
             router.push('/onboarding');
          }
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, router, pathname]);

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
