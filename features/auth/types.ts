// Auth feature — types for Firebase Auth integration

export type AuthProvider = "google" | "github" | "email";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: AuthProvider;
}
