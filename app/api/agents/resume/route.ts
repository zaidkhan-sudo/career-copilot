/**
 * Resume Generation API
 * =====================
 * POST /api/agents/resume - Generate resume + cover letter for a job
 * PUT  /api/agents/resume - Update a resume variant (HITL edit)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getProfile, upsertResume } from "@/lib/firebase/firestore";
import { writerAgent } from "@/lib/agents/writer";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, jobTitle, jobCompany, jobDescription, jobSkills } = body;

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "jobTitle and jobDescription are required" },
        { status: 400 }
      );
    }

    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await getProfile(user.uid);
    const p = profile as Record<string, unknown> | null;
    const rawSkills = Array.isArray(p?.skills) ? (p?.skills as unknown[]) : [];
    const validLevels = ["beginner", "intermediate", "advanced", "expert"] as const;
    type SkillLevel = typeof validLevels[number];
    const skills = rawSkills
      .map((s) => {
        if (typeof s === "string") {
          return { name: s, level: "intermediate" as SkillLevel };
        }
        const skill = s as { name?: string; level?: string };
        if (!skill.name) return null;
        const level = validLevels.includes(skill.level as SkillLevel)
          ? (skill.level as SkillLevel)
          : ("intermediate" as SkillLevel);
        return { name: skill.name, level };
      })
      .filter(
        (s): s is { name: string; level: SkillLevel } => s !== null
      );
    const experience = (Array.isArray(p?.experience)
      ? (p?.experience as Record<string, unknown>[])
      : []
    ).map((e) => ({
      company: (e.company as string) || "",
      title: (e.title as string) || "",
      startDate: (e.startDate as string) || "",
      endDate: (e.endDate as string) || "",
      description: (e.description as string) || "",
      skillsUsed: Array.isArray(e.skillsUsed) ? (e.skillsUsed as string[]) : [],
    }));
    const preferences = (p?.preferences || {}) as Record<string, unknown>;

    // Build agent state for the writer
    const userProfile = {
      id: user.uid,
      email: user.email || "",
      name: (p?.name as string) || user.name || user.email?.split("@")[0] || "",
      skills,
      experience,
      preferences: {
        targetRoles: Array.isArray(preferences.targetRoles)
          ? preferences.targetRoles
          : (p?.title ? [p.title as string] : []),
        workMode: (["remote", "hybrid", "onsite", "any"].includes(preferences.workMode as string)
          ? preferences.workMode as "remote" | "hybrid" | "onsite" | "any"
          : "any"),
        locations: Array.isArray(preferences.locations)
          ? preferences.locations
          : [],
      },
      careerGoal3yr: (p?.career_goal as string) || "",
    };

    const targetJob = {
      id: jobId || `gen-${Date.now()}`,
      title: jobTitle,
      company: jobCompany || "Company",
      location: "",
      description: jobDescription,
      url: "",
      source: "manual",
      postedAt: new Date().toISOString(),
      isFresh: true,
      isRemote: false,
      extractedSkills: jobSkills || [],
      scores: {
        skills: 85,
        culture: 80,
        trajectory: 82,
        composite: 83,
      },
    };

    // Run writer agent
    const agentState = {
      userId: user.uid,
      userProfile,
      discoveredJobs: [],
      scoredJobs: [targetJob],
      generatedResumes: [],
      events: [],
      currentAgent: "writer" as const,
      dailyDigest: null,
      error: null,
    };

    const result = await writerAgent(agentState);
    const generated = result.generatedResumes?.[0];

    if (!generated) {
      return NextResponse.json(
        { success: false, error: "Writer agent failed to generate resume" },
        { status: 500 }
      );
    }

    // Save to Firestore if authenticated
    const resumeRecord = {
      job_id: jobId || null,
      framing_strategy: generated.framingStrategy || "general",
      content: generated.content || "",
      cover_letter: generated.coverLetter || "",
      status: "draft",
    };

    const saved = await upsertResume(user.uid, resumeRecord);
    return NextResponse.json({
      success: true,
      data: {
        id: (saved as Record<string, unknown>)?.id || `r-${Date.now()}`,
        ...resumeRecord,
        jobTitle,
        jobCompany,
      },
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, coverLetter, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Resume id is required" },
        { status: 400 }
      );
    }

    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const updates: Record<string, unknown> = { id };
    if (content !== undefined) updates.content = content;
    if (coverLetter !== undefined) updates.cover_letter = coverLetter;
    if (status !== undefined) updates.status = status;

    const saved = await upsertResume(user.uid, updates);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Resume update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
