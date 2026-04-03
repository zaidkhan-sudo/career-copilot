"use client";

/**
 * Firebase Auth Context
 * =====================
 * Provides authentication state to the entire app.
 * Wraps children with an auth context that tracks:
 * - Current user (Firebase User object)
 * - Loading state
 * - Auth token (for API calls)
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getIdToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Set a session cookie so middleware can check auth status
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        try {
          await fetch("/api/auth", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Failed to initialize profile:", error);
        }
      } else {
        document.cookie = "__session=; path=/; max-age=0";
      }
    });

    return () => unsubscribe();
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
