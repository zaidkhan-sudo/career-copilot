/**
 * Firebase Admin SDK
 * ==================
 * Server-side only. Used for:
 * - Verifying ID tokens in API routes
 * - Server-side Firestore access with admin privileges
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string).
 */

import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
      // Initialize without credentials (will fail on operations but won't crash on import)
      initializeApp();
    }
  } else {
    // Initialize with Application Default Credentials (works in GCP/Firebase hosting)
    initializeApp();
  }
}

initAdmin();

export const adminAuth = getAuth();
export const adminDb = getFirestore();
