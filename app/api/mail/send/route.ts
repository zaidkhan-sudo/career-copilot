/**
 * Mail Send API
 * ==============
 * Generates AI-crafted application email and sends via Postmark.
 * Saves a copy to Firestore.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { generateText } from "@/lib/agents/gemini";
import { sendApplicationEmail } from "@/lib/email/postmark";
import { createSentMail } from "@/lib/firebase/firestore";

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
      jobTitle,
      jobCompany,
      jobDescription,
      recipientEmail,
      subject,
      body,
      plainText,
      customMessage,
      userName,
      userSkills,
      mode = "generate", // "generate" | "send"
    } = body;

    if (!jobTitle || !jobCompany) {
      return NextResponse.json(
        { success: false, error: "Job title and company are required" },
        { status: 400 }
      );
    }

    const hasProvidedDraft =
      mode === "send" &&
      typeof subject === "string" &&
      subject.trim().length > 0 &&
      typeof body === "string" &&
      body.trim().length > 0 &&
      typeof plainText === "string" &&
      plainText.trim().length > 0;

    let emailData: { subject: string; body: string; plainText: string } | null = null;

    if (hasProvidedDraft) {
      emailData = {
        subject: subject.trim(),
        body,
        plainText,
      };
    }

    // Generate AI email draft
    const prompt = `Write a professional job application email.

CANDIDATE: ${userName || "Job Applicant"}
SKILLS: ${(userSkills || []).join(", ") || "Not specified"}
${customMessage ? `ADDITIONAL CONTEXT: ${customMessage}` : ""}

TARGET JOB:
Title: ${jobTitle}
Company: ${jobCompany}
Description: ${(jobDescription || "").slice(0, 1500)}

Write a compelling, concise application email that:
1. Has a professional subject line
2. Opens with genuine interest in the company
3. Highlights relevant skills and experience
4. Shows enthusiasm without being generic
5. Ends with a clear call to action

Format your response as JSON:
{
  "subject": "Subject line here",
  "body": "Full email body in HTML format with <p> tags",
  "plainText": "Plain text version of the email"
}`;

    if (!emailData) {
      const response = await generateText(prompt);
      try {
        let cleaned = response.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
        }
        emailData = JSON.parse(cleaned);
      } catch {
        emailData = {
          subject: `Application: ${jobTitle} at ${jobCompany}`,
          body: `<p>${response.replace(/\n/g, "</p><p>")}</p>`,
          plainText: response,
        };
      }
    }

    if (!emailData) {
      return NextResponse.json(
        { success: false, error: "Failed to build email draft" },
        { status: 500 }
      );
    }

    if (mode === "generate") {
      return NextResponse.json({
        success: true,
        data: emailData,
      });
    }

    // Mode: send
    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: "Recipient email is required to send" },
        { status: 400 }
      );
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient email format" },
        { status: 400 }
      );
    }

    const result = await sendApplicationEmail(
      recipientEmail,
      emailData.subject,
      emailData.body,
      emailData.plainText
    );

    let persistenceError: string | null = null;
    if (result.success) {
      // Save to Firestore
      try {
        await createSentMail(user.uid, {
          job_title: jobTitle,
          job_company: jobCompany,
          recipient_email: recipientEmail,
          subject: emailData.subject,
          body: emailData.body,
          message_id: result.messageId,
        });
      } catch (error) {
        console.error("Sent mail persistence failed:", error);
        persistenceError = "Email sent but failed to save record";
      }
    }

    if (persistenceError) {
      return NextResponse.json(
        {
          success: false,
          data: { ...emailData, messageId: result.messageId },
          error: persistenceError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: result.success,
      data: { ...emailData, messageId: result.messageId },
      error: result.error,
    });
  } catch (error) {
    console.error("Mail send error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process email" },
      { status: 500 }
    );
  }
}
