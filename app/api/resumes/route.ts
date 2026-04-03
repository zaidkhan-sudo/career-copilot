import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getResumes, upsertResume } from "@/lib/firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resumes = await getResumes(user.uid);
    const transformed = resumes.map((r: Record<string, unknown>) => {
      const jobs = r.jobs as | { title?: string; company?: string } | undefined;
      return {
        id: r.id,
        jobId: r.job_id,
        jobTitle: r.job_title || jobs?.title || "",
        jobCompany: r.job_company || jobs?.company || "",
        framingStrategy: r.framing_strategy,
        content: r.content,
        coverLetter: r.cover_letter,
        status: r.status,
        createdAt: r.created_at,
      };
    });
    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error("Resumes GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load resumes" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Resume id required" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const updates: Record<string, unknown> = { id: body.id };
    if (body.content !== undefined) updates.content = body.content;
    if (body.coverLetter !== undefined) updates.cover_letter = body.coverLetter;
    if (body.status !== undefined) updates.status = body.status;

    const saved = await upsertResume(user.uid, updates);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Resumes PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update resume" },
      { status: 500 }
    );
  }
}
