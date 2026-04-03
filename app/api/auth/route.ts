/**
 * Auth API Route
 * ==============
 * POST /api/auth — Verify Firebase token and return user info.
 * Used for validating sessions from the client.
 */

import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getProfile, upsertProfile } from "@/lib/firebase/firestore";

export async function POST(request: Request) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing token" },
        { status: 401 }
      );
    }

    // Ensure profile exists in Firestore
    let profile = await getProfile(user.uid);
    if (!profile) {
      profile = await upsertProfile(user.uid, {
        email: user.email || "",
        name: user.name || user.email?.split("@")[0] || "",
        avatar_url: user.picture || "",
        onboarding_complete: false,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      profile,
    });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
