/**
 * Resume Parse API
 * ================
 * POST /api/resume-parse - Parse a PDF resume and extract skills
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

// Common skills to detect in resume text
const SKILL_PATTERNS = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin",
  "React", "Next.js", "Vue", "Angular", "Svelte", "Node.js", "Express", "Django", "Flask", "Spring",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD",
  "GraphQL", "REST API", "gRPC", "WebSocket",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP",
  "Git", "Linux", "Agile", "Scrum",
  "HTML", "CSS", "Tailwind", "SASS",
  "Kafka", "RabbitMQ", "Microservices", "Distributed Systems",
  "Firebase", "Supabase", "Prisma", "Drizzle",
];

function extractSkills(text: string): { name: string; level: string }[] {
  const lowerText = text.toLowerCase();
  const found: { name: string; level: string }[] = [];

  for (const skill of SKILL_PATTERNS) {
    if (lowerText.includes(skill.toLowerCase())) {
      // Estimate level by frequency and context
      const mentions = (lowerText.match(new RegExp(skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
      const level = mentions >= 3 ? "expert" : mentions >= 2 ? "advanced" : "intermediate";
      found.push({ name: skill, level });
    }
  }

  return found;
}

function extractName(text: string): string {
  // First non-empty line is usually the name
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    // If it's short enough and doesn't look like a header
    if (firstLine.length < 50 && !firstLine.toLowerCase().includes("resume") && !firstLine.toLowerCase().includes("cv")) {
      return firstLine;
    }
  }
  return "";
}

function extractExperience(text: string): { company: string; title: string }[] {
  const experiences: { company: string; title: string }[] = [];
  const lines = text.split("\n").map((l) => l.trim());

  // Look for patterns like "Title at Company" or "Company - Title"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const atMatch = line.match(/(.+?)\s+at\s+(.+)/i);
    if (atMatch && atMatch[1].length < 60 && atMatch[2].length < 60) {
      experiences.push({ title: atMatch[1].trim(), company: atMatch[2].trim() });
    }
    const dashMatch = line.match(/(.+?)\s*[-–—]\s*(.+)/);
    if (dashMatch && !atMatch) {
      const [, left, right] = dashMatch;
      if (left.length < 50 && right.length < 50 && /engineer|developer|manager|designer|lead|intern|analyst/i.test(left + right)) {
        experiences.push({ company: left.trim(), title: right.trim() });
      }
    }
  }

  return experiences.slice(0, 5);
}

function extractTitle(text: string, skills: { name: string }[]): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("full-stack") || lowerText.includes("fullstack") || lowerText.includes("full stack")) {
    return "Full-Stack Developer";
  }
  if (lowerText.includes("frontend") || lowerText.includes("front-end") || lowerText.includes("front end")) {
    return "Frontend Developer";
  }
  if (lowerText.includes("backend") || lowerText.includes("back-end") || lowerText.includes("back end")) {
    return "Backend Developer";
  }
  if (lowerText.includes("data scientist") || lowerText.includes("machine learning")) {
    return "Data Scientist";
  }
  if (lowerText.includes("devops") || lowerText.includes("sre")) {
    return "DevOps Engineer";
  }
  // Infer from skills
  const hasBackend = skills.some((s) => ["Python", "Java", "Go", "Node.js", "Django", "Spring"].includes(s.name));
  const hasFrontend = skills.some((s) => ["React", "Vue", "Angular", "Next.js", "CSS"].includes(s.name));
  if (hasFrontend && hasBackend) return "Full-Stack Developer";
  if (hasFrontend) return "Frontend Developer";
  if (hasBackend) return "Backend Developer";
  return "Software Engineer";
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let text = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("resume") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file uploaded" },
          { status: 400 }
        );
      }

      // Handle PDF files
      if (file.type === "application/pdf") {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Dynamic import to avoid issues with pdf-parse in edge
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } else {
        // Plain text file
        text = await file.text();
      }
    } else {
      // JSON body with text content
      const body = await request.json();
      text = body.text || "";
    }

    if (!text.trim()) {
      return NextResponse.json(
        { success: false, error: "No resume text extracted" },
        { status: 400 }
      );
    }

    // Extract structured data
    const skills = extractSkills(text);
    const name = extractName(text);
    const experience = extractExperience(text);
    const currentTitle = extractTitle(text, skills);

    return NextResponse.json({
      success: true,
      data: {
        name,
        skills,
        experience,
        currentTitle,
        rawTextLength: text.length,
        rawTextPreview: text.slice(0, 500),
      },
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to parse resume" },
      { status: 500 }
    );
  }
}
