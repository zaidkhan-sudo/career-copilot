import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
} from "@/lib/firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apps = await getApplications(user.uid);
    const transformed = apps.map((a: Record<string, unknown>) => {
      const jobs = a.jobs as Record<string, unknown> | undefined;
      return {
        id: a.id,
        jobId: a.job_id,
        job: jobs
          ? {
              title: jobs.title,
              company: jobs.company,
              scores: jobs.scores,
            }
          : { title: "Unknown", company: "Unknown", scores: {} },
        status: a.status,
        resumeVariantId: a.resume_variant_id,
        rejectionReason: a.rejection_reason,
        notes: a.notes,
        appliedAt: a.applied_at,
        lastUpdated: a.last_updated,
      };
    });
    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error("Applications GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load applications" },
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

    const app = await createApplication(user.uid, {
      job_id: body.jobId,
      status: body.status || "discovered",
      notes: body.notes || null,
      applied_at: body.status === "applied" ? new Date().toISOString() : null,
    });
    return NextResponse.json({ success: true, data: app });
  } catch (error) {
    console.error("Applications POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create application" },
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
        { success: false, error: "Application id is required" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const extra: Record<string, unknown> = {};
    if (body.notes !== undefined) extra.notes = body.notes;
    if (body.rejectionReason !== undefined)
      extra.rejection_reason = body.rejectionReason;
    if (body.resumeVariantId !== undefined)
      extra.resume_variant_id = body.resumeVariantId;
    if (body.status === "applied")
      extra.applied_at = new Date().toISOString();

    const updated = await updateApplicationStatus(body.id, body.status, extra);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Applications PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}
