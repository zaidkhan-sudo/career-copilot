/**
 * Firebase Token Verification
 * ============================
 * Server-side helper for API routes.
 * Extracts the Bearer token from the Authorization header,
 * verifies it with Firebase Admin, and returns the decoded user.
 */

import { adminAuth } from "./admin";

export interface VerifiedUser {
  uid: string;
  email: string | undefined;
  name: string | undefined;
  picture: string | undefined;
}

/**
 * Verify the Firebase ID token from a request.
 * Returns the verified user or null if invalid/missing.
 */
export async function verifyFirebaseToken(
  request: Request
): Promise<VerifiedUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
      if (match?.[1]) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);

    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return null;
  }
}
