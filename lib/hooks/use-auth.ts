"use client";

import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthContext } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export function useAuth() {
  const router = useRouter();
  const { user, loading, getIdToken } = useAuthContext();

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const signInWithGithub = async () => {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    document.cookie = "__session=; path=/; max-age=0";
    router.push("/");
    router.refresh();
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    getIdToken,
  };
}
