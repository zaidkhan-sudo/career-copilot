/**
 * Interview Prep API
 * ===================
 * Generates job-specific interview preparation materials using Gemini.
 * Saves to Firestore.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { generateText } from "@/lib/agents/gemini";
import { upsertInterviewPrep, getInterviewPrepByJobId } from "@/lib/firebase/firestore";

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
    const { jobId, jobTitle, jobCompany, jobDescription, jobSkills } = body;

    if (!jobTitle || !jobCompany) {
      return NextResponse.json(
        { success: false, error: "Job title and company are required" },
        { status: 400 }
      );
    }

    // Check for existing prep
    if (jobId) {
      const existing = await getInterviewPrepByJobId(user.uid, jobId);
      if (existing) {
        return NextResponse.json({ success: true, data: existing });
      }
    }

    const prompt = `You are an expert career coach. Generate comprehensive interview preparation materials for the following role.

JOB DETAILS:
Title: ${jobTitle}
Company: ${jobCompany}
Description: ${(jobDescription || "").slice(0, 2000)}
Required Skills: ${(jobSkills || []).join(", ") || "See description"}

Generate the following in JSON format:
{
  "companyResearch": {
    "overview": "Brief company overview and what they're known for",
    "culture": "Company culture and values insights",
    "recentNews": "Recent achievements or news to mention in interview",
    "tips": ["3-5 tips for interviewing at this company"]
  },
  "technicalQuestions": [
    {
      "question": "Technical interview question",
      "topic": "Topic area (e.g., React, System Design)",
      "difficulty": "easy|medium|hard",
      "sampleAnswer": "Brief sample answer or approach",
      "keyPoints": ["Point 1", "Point 2"]
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Behavioral interview question",
      "category": "Category (e.g., Leadership, Conflict Resolution)",
      "starTip": "Tip for structuring STAR response",
      "sampleSituation": "Example situation to draw from"
    }
  ],
  "conceptsToReview": [
    {
      "concept": "Technical concept name",
      "importance": "high|medium|low",
      "studyTip": "Brief study recommendation"
    }
  ],
  "questionsToAsk": [
    {
      "question": "Smart question to ask the interviewer",
      "why": "Why this question impresses interviewers"
    }
  ],
  "studyPlan": {
    "day1": "Day 1 focus areas and activities",
    "day2": "Day 2 focus areas and activities",
    "day3": "Day 3 focus areas and activities"
  }
}

Generate 6-8 technical questions, 5-6 behavioral questions, 6-8 concepts, and 4-5 questions to ask. Make them SPECIFIC to ${jobTitle} at ${jobCompany}.`;

    const response = await generateText(prompt);

    let prepData;
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      }
      prepData = JSON.parse(cleaned);
    } catch {
      // Fallback structure
      prepData = {
        companyResearch: {
          overview: `${jobCompany} is a notable company hiring for ${jobTitle}.`,
          culture: "Research the company's Glassdoor reviews and About page.",
          recentNews: "Check the company's blog and press releases.",
          tips: ["Research the company thoroughly", "Prepare STAR stories", "Practice coding problems"],
        },
        technicalQuestions: [],
        behavioralQuestions: [],
        conceptsToReview: [],
        questionsToAsk: [],
        studyPlan: { day1: "Review fundamentals", day2: "Practice problems", day3: "Mock interviews" },
        rawContent: response,
      };
    }

    // Save to Firestore
    const saved = await upsertInterviewPrep(user.uid, {
      job_id: jobId,
      job_title: jobTitle,
      job_company: jobCompany,
      prep_data: prepData,
    });

    return NextResponse.json({
      success: true,
      data: { id: saved.id, ...prepData, jobTitle, jobCompany },
    });
  } catch (error) {
    console.error("Interview prep error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate interview prep" },
      { status: 500 }
    );
  }
}
