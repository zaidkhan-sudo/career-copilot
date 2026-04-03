/**
 * Interview API Route
 * ===================
 * GET /api/interview - Get interview sessions
 * POST /api/interview - Generate prep or evaluate answer
 */

import { NextRequest, NextResponse } from "next/server";
import { generateInterviewPrep, evaluateBehavioralAnswer } from "@/lib/agents";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getInterviewSessions } from "@/lib/firebase/firestore";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessions = await getInterviewSessions(user.uid);
    return NextResponse.json({ success: true, data: sessions });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load interview sessions" },
      { status: 500 }
    );
  }
}

interface PrepRequest {
  company: string;
  mode: "oa" | "code" | "behavioral";
}

interface EvaluateRequest {
  question: string;
  answer: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's an evaluation request
    if (body.question && body.answer) {
      const evalBody = body as EvaluateRequest;
      const evaluation = await evaluateBehavioralAnswer(
        evalBody.question,
        evalBody.answer
      );
      return NextResponse.json({ success: true, evaluation });
    }

    // Check if it's a prep generation request
    if (body.company && body.mode) {
      const prepBody = body as PrepRequest;
      const session = await generateInterviewPrep(
        prepBody.company,
        prepBody.mode
      );
      return NextResponse.json({ success: true, session });
    }

    // Legacy: simple session creation
    return NextResponse.json({ success: true, sessionId: `s${Date.now()}` });
  } catch (error) {
    console.error("Interview API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
