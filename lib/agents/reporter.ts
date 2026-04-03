/**
 * Reporter Agent - Phase 2: Passive Hunting Loop
 * Generates morning intelligence briefings and notifications
 */

import { geminiModel } from "./gemini";
import type { AgentEvent, JobListing, UserProfile } from "./types";

export interface MorningBriefing {
  id: string;
  date: string;
  summary: string;
  newJobsCount: number;
  topMatches: Array<{
    jobId: string;
    title: string;
    company: string;
    score: number;
    highlight: string;
  }>;
  marketInsights: string[];
  actionItems: Array<{
    type: "apply" | "follow_up" | "interview_prep" | "skill_gap";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  encouragement: string;
  generatedAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  briefingTime: string; // e.g., "08:00"
  frequency: "daily" | "weekly" | "realtime";
  minMatchScore: number; // Only notify for jobs above this score
}

export async function generateMorningBriefing(
  profile: UserProfile,
  recentJobs: JobListing[],
  applicationStats: {
    applied: number;
    interviews: number;
    offers: number;
    rejections: number;
  },
  onEvent?: (event: AgentEvent) => void
): Promise<MorningBriefing> {
  const emit = (message: string, status: AgentEvent["status"] = "running", metadata?: Record<string, unknown>) => {
    onEvent?.({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agent: "reporter",
      message,
      status,
      timestamp: new Date().toISOString(),
      metadata,
    });
  };

  emit("Preparing your morning briefing...");

  // Get top matches (score >= 70)
  const topMatches = recentJobs
    .filter((job) => job.scores && job.scores.composite >= 70)
    .sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0))
    .slice(0, 3);

  emit(`Found ${topMatches.length} high-quality matches to highlight`);

  // Generate AI-powered briefing
  let summary = "";
  let marketInsights: string[] = [];
  let actionItems: MorningBriefing["actionItems"] = [];
  let encouragement = "";

  try {
    const prompt = `You are a career coach AI generating a morning briefing for a job seeker.

User Profile:
- Name: ${profile.name || "Job Seeker"}
- Target Roles: ${profile.preferences?.targetRoles?.join(", ") || "Software Developer"}
- Skills: ${profile.skills?.slice(0, 10).join(", ") || "Various technical skills"}
- Career Goal: ${profile.careerGoal3yr || "Career growth"}

Today's Stats:
- New jobs found: ${recentJobs.length}
- High matches (70%+): ${topMatches.length}
- Applications in pipeline: ${applicationStats.applied}
- Interviews scheduled: ${applicationStats.interviews}
- Offers: ${applicationStats.offers}
- Rejections: ${applicationStats.rejections}

Top Job Matches:
${topMatches.map((j, i) => `${i + 1}. ${j.title} at ${j.company} (${j.scores?.composite || 0}% match)`).join("\n")}

Generate a JSON response with:
{
  "summary": "A 2-sentence personalized morning summary",
  "marketInsights": ["3 brief insights about the job market based on the jobs found"],
  "actionItems": [
    {"type": "apply|follow_up|interview_prep|skill_gap", "title": "short action", "description": "brief description", "priority": "high|medium|low"}
  ],
  "encouragement": "A brief motivational message tailored to their situation"
}

Keep it concise and actionable. Focus on what matters today.`;

    const response = await geminiModel.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      summary = parsed.summary || "Good morning! You have new opportunities waiting.";
      marketInsights = parsed.marketInsights || [];
      actionItems = parsed.actionItems || [];
      encouragement = parsed.encouragement || "Keep pushing forward!";
    }
  } catch (error) {
    console.error("Reporter AI error:", error);
    // Fallback content
    summary = `Good morning! I found ${recentJobs.length} new jobs, with ${topMatches.length} excellent matches for you.`;
    marketInsights = [
      "Remote opportunities continue to grow",
      "Companies are actively hiring for your skill set",
    ];
    actionItems = topMatches.length > 0
      ? [{ type: "apply" as const, title: "Review top matches", description: "Check out today's best opportunities", priority: "high" as const }]
      : [];
    encouragement = "Every application is a step closer to your dream role!";
  }

  emit("Morning briefing ready!", "completed");

  return {
    id: `briefing-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    summary,
    newJobsCount: recentJobs.length,
    topMatches: topMatches.map((job) => ({
      jobId: job.id,
      title: job.title,
      company: job.company,
      score: job.scores?.composite || 0,
      highlight: job.aiReasoning?.slice(0, 100) || "Great match for your profile",
    })),
    marketInsights,
    actionItems,
    encouragement,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateNotificationContent(
  job: JobListing,
  profile: UserProfile
): Promise<{ title: string; body: string; priority: "high" | "normal" }> {
  const score = job.scores?.composite || 0;
  const priority = score >= 85 ? "high" : "normal";

  if (score >= 90) {
    return {
      title: `🔥 ${score}% Match Found!`,
      body: `${job.title} at ${job.company} is an exceptional fit for you.`,
      priority,
    };
  } else if (score >= 80) {
    return {
      title: `⭐ Great opportunity: ${job.title}`,
      body: `${job.company} is hiring - ${score}% match with your profile.`,
      priority,
    };
  } else {
    return {
      title: `New match: ${job.title}`,
      body: `${job.company} • ${score}% match`,
      priority,
    };
  }
}

// Scheduled briefing function (for cron/QStash integration)
export async function scheduledBriefing(
  userId: string,
  profile: UserProfile,
  jobs: JobListing[],
  stats: { applied: number; interviews: number; offers: number; rejections: number }
): Promise<{ briefing: MorningBriefing; shouldNotify: boolean }> {
  const briefing = await generateMorningBriefing(profile, jobs, stats);
  
  // Determine if we should send notification
  const shouldNotify = briefing.topMatches.length > 0 || briefing.actionItems.some(a => a.priority === "high");
  
  return { briefing, shouldNotify };
}
