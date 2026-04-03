import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getProfile, upsertProfile } from "@/lib/firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let profile = await getProfile(user.uid);
    if (!profile) {
      profile = await upsertProfile(user.uid, {
        email: user.email || "",
        name: user.name || user.email?.split("@")[0] || "",
        avatar_url: user.picture || "",
        onboarding_complete: false,
      });
    }

    const p = profile as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      data: {
        id: user.uid,
        name: p.name || user.name || user.email?.split("@")[0],
        email: p.email || user.email,
        avatarUrl: p.avatar_url || user.picture,
        title: p.title || "",
        skills: p.skills || [],
        careerGoal: p.career_goal || "",
        onboardingComplete: p.onboarding_complete || false,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.title !== undefined) updates.title = body.title;
    if (body.skills !== undefined) updates.skills = body.skills;
    if (body.careerGoal !== undefined) updates.career_goal = body.careerGoal;
    if (body.preferences !== undefined) updates.preferences = body.preferences;
    if (body.education !== undefined) updates.education = body.education;
    if (body.experience !== undefined) updates.experience = body.experience;
    if (body.onboardingComplete !== undefined)
      updates.onboarding_complete = body.onboardingComplete;

    const saved = await upsertProfile(user.uid, updates);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
