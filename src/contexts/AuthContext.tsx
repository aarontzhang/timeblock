import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../types';
import type { User } from 'firebase/auth';
import { DEFAULT_CATEGORIES } from '../lib/constants';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        let profile = await fetchUserProfile(user.uid);
        // If no profile exists, create one with default categories
        if (!profile) {
          profile = await createUserProfile(user);
        }
        setUserProfile(profile);

      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;

      // Ensure categories exist
      const existingCategories = data.categories || [];
      const existingIds = new Set(existingCategories.map((c) => c.id));

      // Add any missing default categories (for new defaults added after user signed up)
      const missingDefaults = DEFAULT_CATEGORIES.filter((dc) => !existingIds.has(dc.id));

      if (missingDefaults.length > 0) {
        // Add missing defaults, keeping "Other" at the end
        const otherCategory = existingCategories.find((c) => c.id === 'default-other');
        const withoutOther = existingCategories.filter((c) => c.id !== 'default-other');
        const newWithoutOther = missingDefaults.filter((c) => c.id !== 'default-other');

        data.categories = [
          ...withoutOther,
          ...newWithoutOther,
          ...(otherCategory ? [otherCategory] : missingDefaults.filter((c) => c.id === 'default-other')),
        ];
        // Save in background
        setDoc(docRef, { categories: data.categories }, { merge: true }).catch(console.error);
      }

      return data;
    }
    return null;
  }

  async function createUserProfile(user: User, displayName?: string): Promise<UserProfile> {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || 'User',
      timeBlockDuration: 30,
      categories: DEFAULT_CATEGORIES,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', user.uid), profile);
    return profile;
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    const profile = await createUserProfile(user, displayName);
    setUserProfile(profile);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    const existingProfile = await fetchUserProfile(user.uid);
    if (!existingProfile) {
      const profile = await createUserProfile(user);
      setUserProfile(profile);
    } else {
      setUserProfile(existingProfile);
    }
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  async function updateUserProfile(updates: Partial<UserProfile>) {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, updates, { merge: true });

    setUserProfile((prev) => prev ? { ...prev, ...updates } : null);
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
