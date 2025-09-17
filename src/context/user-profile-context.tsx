"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserProfile = {
  name: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
  faceScan: string | null;
  bodyScan: string | null;
};

type UserProfileContextType = {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Doe',
    age: '30',
    height: '180',
    weight: '75',
    gender: 'male',
    faceScan: null,
    bodyScan: null,
  });

  return (
    <UserProfileContext.Provider value={{ profile, setProfile }}>
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
