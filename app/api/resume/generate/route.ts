/**
 * Resume Generate API
 * ====================
 * Generates a tailored resume using Gemini 2.5 Flash.
 * Saves to Firestore.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { generateText } from "@/lib/agents/gemini";
import { upsertResume } from "@/lib/firebase/firestore";

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
    const {
      jobId,
      jobTitle,
      jobCompany,
      jobDescription,
      jobSkills,
      userName,
      userEmail,
      userSkills,
      userExperience,
      userEducation,
      careerGoal,
    } = body;

    if (!jobTitle || !jobCompany) {
      return NextResponse.json(
        { success: false, error: "Job title and company are required" },
        { status: 400 }
      );
    }

    const prompt = `Generate a professional, ATS-optimized resume tailored for the following job.

CANDIDATE:
Name: ${userName || "Professional Candidate"}
Email: ${userEmail || "email@example.com"}
Skills: ${(userSkills || []).join(", ") || "Various technical skills"}
Experience: ${userExperience || "Experienced professional"}
Education: ${userEducation || "Bachelor's degree"}
Career Goal: ${careerGoal || "Growth in tech industry"}

TARGET JOB:
Title: ${jobTitle}
Company: ${jobCompany}
Description: ${(jobDescription || "").slice(0, 2000)}
Required Skills: ${(jobSkills || []).join(", ") || "See description"}

Generate a resume in clean markdown format that:
1. Has a compelling professional summary tailored to this specific role at ${jobCompany}
2. Lists relevant technical skills prominently, matching job requirements
3. Highlights quantified achievements (use realistic metrics)
4. Uses action verbs and industry keywords from the job description
5. Is ATS-friendly with standard section headers
6. Includes a tailored cover letter section at the end

Format:
# [Name]
**[Title/Role]** | [Email] | [Location]

## Professional Summary
[2-3 sentences tailored to this role]

## Technical Skills
[Organized by category, emphasizing job-relevant skills]

## Professional Experience
### [Job Title] — [Company]
*[Date Range]*
- [Achievement with metrics]
- [Achievement with metrics]

## Education
### [Degree] — [Institution]
*[Year]*

## Projects
### [Project Name]
- [Description with tech stack]

---

## Cover Letter

Dear Hiring Team at ${jobCompany},

[3-paragraph cover letter]

Sincerely,
[Name]`;

    const content = await generateText(prompt);

    // Determine framing strategy from content
    let strategy = "Impact-First";
    if (/leadership|led|managed|team/i.test(content.slice(0, 500))) strategy = "Leadership";
    else if (/deep|expert|specialized/i.test(content.slice(0, 500))) strategy = "Technical Depth";
    else if (/rapid|growth|learning/i.test(content.slice(0, 500))) strategy = "Growth-Story";

    // Save to Firestore
    const saved = await upsertResume(user.uid, {
      job_id: jobId,
      job_title: jobTitle,
      job_company: jobCompany,
      framing_strategy: strategy,
      content,
      status: "draft",
    });

    const savedId = (saved as Record<string, unknown>)?.id as string | undefined;
    if (!savedId) {
      console.error("Resume generation save failed:", saved);
      return NextResponse.json(
        { success: false, error: "Failed to save resume" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedId,
        content,
        strategy,
        jobTitle,
        jobCompany,
      },
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
