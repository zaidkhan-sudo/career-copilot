import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getJobs, upsertJobs } from "@/lib/firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobs = await getJobs(user.uid);
    // Transform DB format to frontend format
    const transformed = jobs.map((j: Record<string, unknown>) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      description: j.description,
      source: j.source,
      sourceUrl: j.url,
      postedAt: j.posted_at,
      discoveredAt: j.discovered_at,
      isFresh: j.is_fresh,
      isRemote: j.is_remote,
      requiredSkills: (j.extracted_skills as string[]) || [],
      scores: j.scores,
      hiddenRequirements: j.hidden_requirements || [],
      aiReasoning: j.ai_reasoning,
    }));
    return NextResponse.json({
      success: true,
      count: transformed.length,
      data: transformed,
    });
  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    const body = await request.json();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (body.jobs?.length) {
      const dbJobs = body.jobs.map((j: Record<string, unknown>) => ({
        id:
          j.id ||
          `j-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary,
        description: j.description,
        url: j.sourceUrl || j.url,
        source: j.source,
        posted_at: j.postedAt,
        is_fresh: j.isFresh,
        is_remote: j.isRemote,
        extracted_skills: j.requiredSkills || j.extractedSkills || [],
        scores: j.scores,
        hidden_requirements: j.hiddenRequirements || [],
        ai_reasoning: j.aiReasoning,
      }));
      const saved = await upsertJobs(user.uid, dbJobs);
      return NextResponse.json({ success: true, data: saved });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Jobs POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save jobs" },
      { status: 500 }
    );
  }
}
