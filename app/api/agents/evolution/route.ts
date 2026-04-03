/**
 * Evolution API
 * =============
 * POST /api/agents/evolution - Record outcome + trigger recalibration
 * GET  /api/agents/evolution - Get outcome history
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getOutcomes, upsertOutcome } from "@/lib/firebase/firestore";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (user) {
      const outcomes = await getOutcomes(user.uid);
      return NextResponse.json({ success: true, data: outcomes });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Evolution GET error:", error);
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
    const body = await request.json();
    const {
      applicationId,
      jobTitle,
      jobCompany,
      jobScores,
      outcome,
      rejectionReason,
      reachedStage,
      daysInPipeline,
      notes,
    } = body;

    if (!outcome || !jobTitle) {
      return NextResponse.json(
        { success: false, error: "outcome and jobTitle are required" },
        { status: 400 }
      );
    }

    const user = await verifyFirebaseToken(request);

    const outcomeRecord = {
      application_id: applicationId || null,
      job_title: jobTitle,
      job_company: jobCompany || "",
      job_scores: jobScores || null,
      outcome,
      rejection_reason: rejectionReason || null,
      reached_stage: reachedStage || null,
      days_in_pipeline: daysInPipeline || 0,
      notes: notes || null,
    };

    // Generate recalibration insights
    const insights = generateRecalibrationInsights(
      outcome,
      rejectionReason,
      reachedStage
    );

    if (user) {
      const saved = await upsertOutcome(user.uid, outcomeRecord);
      return NextResponse.json({ success: true, data: saved, insights });
    }

    return NextResponse.json({
      success: true,
      data: { id: `out-${Date.now()}`, ...outcomeRecord },
      insights,
    });
  } catch (error) {
    console.error("Evolution POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateRecalibrationInsights(
  outcome: string,
  rejectionReason?: string,
  reachedStage?: string
) {
  const patterns: {
    pattern: string;
    severity: string;
    recommendation: string;
  }[] = [];

  if (outcome === "rejected") {
    if (rejectionReason === "skills_gap") {
      patterns.push({
        pattern: "Skills gap identified",
        severity: "high",
        recommendation:
          "Focus on upskilling in the areas mentioned. Consider adding relevant projects to your portfolio.",
      });
    } else if (rejectionReason === "experience") {
      patterns.push({
        pattern: "Experience level mismatch",
        severity: "medium",
        recommendation:
          "Adjust target roles to match your experience level. Consider positions that are one step up from your current role.",
      });
    } else if (rejectionReason === "culture_fit") {
      patterns.push({
        pattern: "Culture fit concerns",
        severity: "low",
        recommendation:
          "Research company culture more deeply before applying. Tailor your application to reflect shared values.",
      });
    }

    if (reachedStage === "screening") {
      patterns.push({
        pattern: "Filtered at screening stage",
        severity: "high",
        recommendation:
          "Your resume may need optimization. Ensure keywords match the job description closely.",
      });
    } else if (reachedStage === "interviewing") {
      patterns.push({
        pattern: "Didn't pass interview round",
        severity: "medium",
        recommendation:
          "Practice more behavioral and technical interview questions. Use the Coach Agent for simulation.",
      });
    }
  } else if (outcome === "ghosted") {
    patterns.push({
      pattern: "No response received",
      severity: "low",
      recommendation:
        "Follow up after 1 week. Consider applying through different channels (referrals, direct email).",
    });
  }

  const strategyUpdates: Record<string, string> = {};
  if (outcome === "rejected" && reachedStage === "screening") {
    strategyUpdates.writer =
      "Increase keyword density and tailor more aggressively to job description";
    strategyUpdates.scout =
      "Prioritize jobs at companies where you have connections";
  }
  if (outcome === "rejected" && reachedStage === "interviewing") {
    strategyUpdates.coach =
      "Focus practice sessions on the specific interview format that tripped you up";
    strategyUpdates.analyzer =
      "Weight culture fit signals more heavily in scoring";
  }
  if (outcome === "ghosted") {
    strategyUpdates.scout =
      "Deprioritize companies known for poor candidate communication";
  }

  return {
    patterns,
    strategyUpdates,
    skillGaps:
      outcome === "rejected" && rejectionReason === "skills_gap"
        ? [
            "Consider building projects that demonstrate the missing skills",
            "Look into relevant certifications",
          ]
        : [],
  };
}
