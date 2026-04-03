/**
 * Morning Briefing API
 * ====================
 * GET  /api/agents/briefing - Get today's briefing (or generate one)
 * POST /api/agents/briefing - Force regenerate today's briefing
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import {
  getLatestBriefing,
  upsertBriefing,
  getJobs,
  getProfile,
} from "@/lib/firebase/firestore";

export const maxDuration = 60;

async function generateBriefingContent(
  jobs: Record<string, unknown>[],
  userSkills: string[]
) {
  const topJobs = jobs
    .filter(
      (j) =>
        (j.scores as Record<string, number> | undefined)?.composite !==
        undefined
    )
    .sort(
      (a, b) =>
        ((b.scores as Record<string, number>)?.composite || 0) -
        ((a.scores as Record<string, number>)?.composite || 0)
    )
    .slice(0, 5);

  const highMatches = topJobs.filter(
    (j) =>
      ((j.scores as Record<string, number>)?.composite || 0) >= 85
  );
  const newToday = jobs.filter((j) => j.isFresh || j.is_fresh);

  const marketInsights: string[] = [];
  const remoteCount = jobs.filter((j) => j.isRemote || j.is_remote).length;
  if (remoteCount > jobs.length * 0.5) {
    marketInsights.push(
      `${Math.round(
        (remoteCount / Math.max(jobs.length, 1)) * 100
      )}% of positions are remote-friendly`
    );
  }
  const sources = [
    ...new Set(jobs.map((j) => j.source as string).filter(Boolean)),
  ];
  if (sources.length > 0) {
    marketInsights.push(`Jobs sourced from ${sources.join(", ")}`);
  }
  marketInsights.push(
    `${highMatches.length} roles are 85%+ matches for your profile`
  );

  const actionItems: Record<string, unknown>[] = [];
  if (highMatches.length > 0) {
    actionItems.push({
      type: "apply",
      title: `Apply to ${highMatches[0]?.company || "top match"}`,
      description: `${highMatches[0]?.title || "High-match role"} scored ${
        (highMatches[0]?.scores as Record<string, number>)?.composite || 90
      }% match`,
      priority: "high",
    });
  }
  if (topJobs.length >= 2) {
    actionItems.push({
      type: "prepare",
      title: `Prepare materials for ${
        topJobs[1]?.company || "second match"
      }`,
      description: "Generate a tailored resume and cover letter",
      priority: "medium",
    });
  }
  actionItems.push({
    type: "review",
    title: "Review your pipeline",
    description: `You have ${jobs.length} total opportunities tracked`,
    priority: "low",
  });

  const encouragements = [
    "Every application you send is a step closer to your dream role. Keep pushing! 🔥",
    "Your skills are in demand — the right team is looking for someone exactly like you. 🚀",
    "Consistency wins. Keep refining, keep applying, keep growing. 💪",
    "The job market rewards preparation. You're already ahead by using AI to optimize. 🧠",
  ];

  const skillLabel =
    userSkills.length > 0
      ? `${userSkills.slice(0, 3).join(", ")} skills`
      : "profile";

  return {
    summary: `Good morning! ${
      newToday.length > 0
        ? `${newToday.length} fresh opportunities`
        : "No new jobs"
    } found today. ${
      highMatches.length > 0
        ? `${highMatches.length} are excellent matches for your ${skillLabel}.`
        : "Keep your profile updated for better matches."
    }`,
    top_matches: topJobs.slice(0, 3).map((j) => ({
      jobId: j.id,
      title: j.title,
      company: j.company,
      score: (j.scores as Record<string, number>)?.composite || 0,
      highlight:
        (j.ai_reasoning as string) ||
        (j.aiReasoning as string) ||
        "Great fit for your background",
    })),
    market_insights: marketInsights,
    action_items: actionItems,
    encouragement:
      encouragements[Math.floor(Math.random() * encouragements.length)],
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Try to get today's cached briefing
    const existing = await getLatestBriefing(user.uid);
    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        cached: true,
      });
    }

    // Generate fresh briefing
    const jobs = await getJobs(user.uid);
    const profile = await getProfile(user.uid);
    const p = profile as Record<string, unknown> | null;
    const skills = Array.isArray(p?.skills) ? (p?.skills as unknown[]) : [];
    const userSkills = skills
      .map((s) => (typeof s === "string" ? s : (s as { name?: string }).name))
      .filter((s): s is string => Boolean(s));

    const briefingContent = await generateBriefingContent(
      jobs as Record<string, unknown>[],
      userSkills
    );

    const saved = await upsertBriefing(user.uid, briefingContent);
    return NextResponse.json({
      success: true,
      data: saved || briefingContent,
    });
  } catch (error) {
    console.error("Briefing API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobs = await getJobs(user.uid);
    const profile = await getProfile(user.uid);
    const p = profile as Record<string, unknown> | null;
    const skills = Array.isArray(p?.skills) ? (p?.skills as unknown[]) : [];
    const userSkills = skills
      .map((s) => (typeof s === "string" ? s : (s as { name?: string }).name))
      .filter((s): s is string => Boolean(s));

    const briefingContent = await generateBriefingContent(
      jobs as Record<string, unknown>[],
      userSkills
    );

    const saved = await upsertBriefing(user.uid, briefingContent);
    return NextResponse.json({
      success: true,
      data: saved || briefingContent,
    });
  } catch (error) {
    console.error("Briefing POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
