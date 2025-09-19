
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, getUserProfile, updateUserProfile, db } from '@/lib/firebase';
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user); // Set user immediately
      if (!user) {
        // If no user, reset state and handle redirects
        setProfileState(initialProfile);
        setLoading(false);
        if (pathname.startsWith('/dashboard') || pathname === '/onboarding') {
          router.push('/auth/signin');
        }
      }
      // Data fetching for logged-in user is handled in the next useEffect
    });

    return () => unsubscribeAuth();
  }, [router, pathname]);

  useEffect(() => {
    if (user) {
      // User is logged in, now listen for their profile changes
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfileState(docSnap.data() as UserProfile);
          if (pathname.startsWith('/auth')) {
            router.push('/dashboard');
          }
        } else {
          // Profile doesn't exist, likely a new user
          if (pathname !== '/onboarding' && !pathname.startsWith('/auth')) {
            router.push('/onboarding');
          }
        }
        setLoading(false);
      }, (error) => {
          console.error("Firestore snapshot error:", error);
          setLoading(false); // Stop loading even if there's an error
      });

      return () => unsubscribeFirestore();
    }
  }, [user, router, pathname]);
  
  const handleSetProfile = async (newProfile: UserProfile) => {
      setProfileState(newProfile); // Optimistic update
      if (user) {
          try {
              await updateUserProfile(user.uid, newProfile);
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
