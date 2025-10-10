
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

function UserProfileHandler({ children }: { children: ReactNode }) {
  const { user, loading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Do nothing while loading
    }

    const isAuthPath = pathname.startsWith('/auth');
    const isProtectedPath = !isAuthPath && !pathname.endsWith('/'); // Anything not auth or landing

    // If there's no user and they're on a protected page, redirect to sign-in
    if (!user && isProtectedPath) {
      router.push('/auth/signin');
    }

    // If there is a user and they're on an auth page, redirect to the dashboard
    if (user && isAuthPath) {
      router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);
  
  // Show loading screen only on protected paths while loading
  const isProtectedPath = !pathname.startsWith('/auth') && !pathname.endsWith('/');
  if (loading && isProtectedPath) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(initialProfile);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false); // If no user, we are done loading.
      }
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
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
          try {
             await setDoc(docRef, newProfile);
             setProfileState(newProfile);
          } catch (error) {
              console.error("Error creating new user profile doc:", error);
          }
        }
        setLoading(false); // Data loaded or created, we are done loading.
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setProfileState(initialProfile);
        setLoading(false); // Error occurred, stop loading.
      });
      return () => firestoreUnsubscribe();
    } else {
      setProfileState(initialProfile);
    }
  }, [user]);

  const handleSetProfile = async (newProfile: UserProfile) => {
      // Optimistically update local state
      setProfileState(newProfile);
      if (user) {
          try {
              const userDocRef = doc(db, 'users', user.uid);
              // Use setDoc with merge to update or create
              await setDoc(userDocRef, newProfile, { merge: true });
          } catch (error) {
              console.error("Failed to update profile in Firestore:", error);
              // Optionally revert local state if firestore fails
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
