
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { app } from '@/lib/firebase'; // Ensure you have this file with Firebase initialization

// Define the administrator's email address as a constant
const ADMIN_EMAIL = 'haxiswoins@qq.com';

// Define our custom user type, which can include an isAdmin flag
interface CustomUser {
    uid: string;
    email: string | null;
    isAdmin?: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  register: (email: string, pass: string) => Promise<FirebaseUser>;
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Create our custom user object
        const customUser: CustomUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          // Check if the logged-in user is the admin
          isAdmin: firebaseUser.email === ADMIN_EMAIL,
        };
        setUser(customUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const register = async (email: string, pass: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  };

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
