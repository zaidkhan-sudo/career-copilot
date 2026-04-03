/**
 * Interview Chat API
 * ===================
 * Mock interview chat using Gemini 2.5 Flash.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { generateText } from "@/lib/agents/gemini";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobTitle, jobCompany } = body;
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = rawMessages.filter(
      (m) => m && typeof m.role === "string" && typeof m.content === "string"
    );
    const allowedQuestionTypes = new Set(["technical", "behavioral"]);
    const questionType = allowedQuestionTypes.has(body.questionType)
      ? body.questionType
      : "behavioral";

    const conversationHistory = safeMessages
      .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
      .join("\n");

    const prompt = `You are an experienced ${questionType === "technical" ? "technical" : "behavioral"} interviewer at ${jobCompany || "a tech company"} conducting an interview for the ${jobTitle || "Software Engineer"} position.

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : "Start the interview with a greeting and your first question."}

${conversationHistory ? "Based on the candidate's last response, provide feedback and ask the next question." : ""}

Respond as the interviewer. Be professional, encouraging, and realistic. After the candidate answers:
1. Briefly evaluate their response (what was good, what could improve)
2. Ask the next relevant question

Keep responses concise (under 200 words). If this is a technical interview, ask coding/system design questions. If behavioral, use STAR-method focused questions.`;

    const response = await generateText(prompt);

    return NextResponse.json({
      success: true,
      data: {
        reply: response,
        role: "interviewer",
      },
    });
  } catch (error) {
    console.error("Interview chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
