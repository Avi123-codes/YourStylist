"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, getUserProfile, updateUserProfile } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfileState(userProfile);
          // Redirect from auth pages if logged in
          if(pathname.startsWith('/auth')) {
            router.push('/dashboard');
          }
        } else {
           // New user, profile will be created on signup/onboarding
           if(pathname !== '/onboarding' && !pathname.startsWith('/auth')) {
             router.push('/onboarding');
           }
        }
      } else {
        setUser(null);
        setProfileState(initialProfile);
         // If not logged in, redirect to signin unless they are on public pages
        if (pathname.startsWith('/dashboard') || pathname === '/onboarding') {
            router.push('/auth/signin');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);
  
  const handleSetProfile = async (newProfile: UserProfile) => {
      setProfileState(newProfile);
      if (user) {
          try {
              await updateUserProfile(user.uid, newProfile);
          } catch (error) {
              console.error("Failed to update profile in Firestore:", error);
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
