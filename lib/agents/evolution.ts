/**
 * Evolution Agent - Phase 5: The "Evolution" Loop
 * Tracks outcomes, analyzes patterns, and recalibrates agent strategies
 */

import { geminiModel } from "./gemini";
import type { AgentEvent, JobListing, UserProfile } from "./types";

export type OutcomeType = "offer" | "rejected" | "ghosted" | "withdrawn";
export type RejectionReason = 
  | "technical_fail"
  | "cultural_fit"
  | "experience_mismatch"
  | "salary_mismatch"
  | "ghosted"
  | "position_filled"
  | "overqualified"
  | "underqualified"
  | "other";

export interface ApplicationOutcome {
  id: string;
  jobId: string;
  job: {
    title: string;
    company: string;
    scores: { skills: number; culture: number; trajectory: number; composite: number };
  };
  outcome: OutcomeType;
  rejectionReason?: RejectionReason;
  rejectionDetails?: string;
  reachedStage: "applied" | "screening" | "phone" | "technical" | "onsite" | "offer";
  daysInPipeline: number;
  userNotes?: string;
  recordedAt: string;
}

export interface RecalibrationResult {
  id: string;
  analyzedOutcomes: number;
  insights: RecalibrationInsight[];
  strategyUpdates: StrategyUpdate[];
  skillGaps: SkillGap[];
  recommendedActions: string[];
  confidenceScore: number;
  generatedAt: string;
}

export interface RecalibrationInsight {
  type: "pattern" | "warning" | "opportunity" | "strength";
  title: string;
  description: string;
  evidence: string;
}

export interface StrategyUpdate {
  agent: "scout" | "analyzer" | "writer" | "coach";
  parameter: string;
  previousValue: string;
  newValue: string;
  reason: string;
}

export interface SkillGap {
  skill: string;
  frequency: number; // How often this appeared in rejections
  suggestedResources: string[];
  priority: "critical" | "important" | "nice_to_have";
}

export async function analyzeOutcomes(
  outcomes: ApplicationOutcome[],
  profile: UserProfile,
  onEvent?: (event: AgentEvent) => void
): Promise<RecalibrationResult> {
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

  emit("Analyzing your application outcomes...");

  // Calculate statistics
  const stats = {
    total: outcomes.length,
    offers: outcomes.filter((o) => o.outcome === "offer").length,
    rejections: outcomes.filter((o) => o.outcome === "rejected").length,
    ghosted: outcomes.filter((o) => o.outcome === "ghosted").length,
    withdrawn: outcomes.filter((o) => o.outcome === "withdrawn").length,
  };

  // Analyze rejection patterns
  const rejectionReasons = outcomes
    .filter((o) => o.rejectionReason)
    .reduce((acc, o) => {
      const reason = o.rejectionReason!;
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<RejectionReason, number>);

  // Analyze which stages people drop off
  const stageDropoffs = outcomes
    .filter((o) => o.outcome !== "offer")
    .reduce((acc, o) => {
      acc[o.reachedStage] = (acc[o.reachedStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Analyze score patterns
  const successfulScores = outcomes
    .filter((o) => o.outcome === "offer")
    .map((o) => o.job.scores.composite);
  const failedScores = outcomes
    .filter((o) => o.outcome === "rejected")
    .map((o) => o.job.scores.composite);

  emit(`Analyzed ${outcomes.length} outcomes: ${stats.offers} offers, ${stats.rejections} rejections`);

  let insights: RecalibrationInsight[] = [];
  let strategyUpdates: StrategyUpdate[] = [];
  let skillGaps: SkillGap[] = [];
  let recommendedActions: string[] = [];
  let confidenceScore = 50;

  try {
    const prompt = `You are a career analytics AI analyzing job application outcomes to improve success rates.

User Profile:
- Target Roles: ${profile.preferences?.targetRoles?.join(", ") || "Software Developer"}
- Skills: ${profile.skills?.slice(0, 10).join(", ") || "Various"}

Application Statistics:
- Total Applications: ${stats.total}
- Offers: ${stats.offers} (${((stats.offers / stats.total) * 100).toFixed(1)}%)
- Rejections: ${stats.rejections}
- Ghosted: ${stats.ghosted}
- Withdrawn: ${stats.withdrawn}

Rejection Reasons:
${Object.entries(rejectionReasons).map(([reason, count]) => `- ${reason}: ${count}`).join("\n") || "No rejection data"}

Stage Dropoffs:
${Object.entries(stageDropoffs).map(([stage, count]) => `- ${stage}: ${count}`).join("\n") || "No stage data"}

Score Analysis:
- Successful applications avg score: ${successfulScores.length > 0 ? (successfulScores.reduce((a, b) => a + b, 0) / successfulScores.length).toFixed(0) : "N/A"}
- Failed applications avg score: ${failedScores.length > 0 ? (failedScores.reduce((a, b) => a + b, 0) / failedScores.length).toFixed(0) : "N/A"}

Recent Outcomes:
${outcomes.slice(0, 5).map((o) => `- ${o.job.title} at ${o.job.company}: ${o.outcome}${o.rejectionReason ? ` (${o.rejectionReason})` : ""} - Score: ${o.job.scores.composite}%`).join("\n")}

Generate a JSON response with:
{
  "insights": [
    {"type": "pattern|warning|opportunity|strength", "title": "short title", "description": "explanation", "evidence": "data point"}
  ],
  "strategyUpdates": [
    {"agent": "scout|analyzer|writer|coach", "parameter": "what to change", "previousValue": "current approach", "newValue": "recommended approach", "reason": "why"}
  ],
  "skillGaps": [
    {"skill": "skill name", "frequency": 3, "suggestedResources": ["resource1", "resource2"], "priority": "critical|important|nice_to_have"}
  ],
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "confidenceScore": 75
}

Focus on actionable insights. If data is limited, acknowledge that and provide general recommendations.`;

    const response = await geminiModel.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      insights = parsed.insights || [];
      strategyUpdates = parsed.strategyUpdates || [];
      skillGaps = parsed.skillGaps || [];
      recommendedActions = parsed.recommendedActions || [];
      confidenceScore = parsed.confidenceScore || 50;
    }
  } catch (error) {
    console.error("Evolution AI error:", error);
    
    // Generate fallback insights based on data
    if (stats.ghosted > stats.rejections) {
      insights.push({
        type: "warning",
        title: "High ghosting rate",
        description: "Many applications aren't receiving responses. Consider following up more actively.",
        evidence: `${stats.ghosted} ghosted vs ${stats.rejections} explicit rejections`,
      });
    }

    if (rejectionReasons.technical_fail > 2) {
      insights.push({
        type: "pattern",
        title: "Technical interview challenges",
        description: "Multiple rejections at technical stage. Focus on interview prep.",
        evidence: `${rejectionReasons.technical_fail} technical fails`,
      });
      skillGaps.push({
        skill: "Technical Interview Skills",
        frequency: rejectionReasons.technical_fail,
        suggestedResources: ["LeetCode", "System Design Primer", "Mock interviews"],
        priority: "critical",
      });
    }

    recommendedActions = [
      "Review and update your resume based on feedback",
      "Practice technical interviews weekly",
      "Follow up on applications after 1 week",
    ];
  }

  emit("Recalibration complete!", "completed");

  return {
    id: `recal-${Date.now()}`,
    analyzedOutcomes: outcomes.length,
    insights,
    strategyUpdates,
    skillGaps,
    recommendedActions,
    confidenceScore,
    generatedAt: new Date().toISOString(),
  };
}

export function calculateSuccessMetrics(outcomes: ApplicationOutcome[]): {
  conversionRate: number;
  avgTimeToOffer: number;
  topPerformingCompanyTypes: string[];
  bestScoreRange: { min: number; max: number };
} {
  const offers = outcomes.filter((o) => o.outcome === "offer");
  const conversionRate = outcomes.length > 0 ? (offers.length / outcomes.length) * 100 : 0;
  
  const avgTimeToOffer = offers.length > 0
    ? offers.reduce((sum, o) => sum + o.daysInPipeline, 0) / offers.length
    : 0;

  // Find best performing score range
  const offerScores = offers.map((o) => o.job.scores.composite);
  const bestScoreRange = offerScores.length > 0
    ? { min: Math.min(...offerScores), max: Math.max(...offerScores) }
    : { min: 0, max: 100 };

  return {
    conversionRate,
    avgTimeToOffer,
    topPerformingCompanyTypes: [], // Would need company type data
    bestScoreRange,
  };
}

export const REJECTION_REASONS: { value: RejectionReason; label: string; icon: string }[] = [
  { value: "technical_fail", label: "Technical Assessment", icon: "💻" },
  { value: "cultural_fit", label: "Cultural Fit", icon: "🤝" },
  { value: "experience_mismatch", label: "Experience Level", icon: "📊" },
  { value: "salary_mismatch", label: "Salary Expectations", icon: "💰" },
  { value: "ghosted", label: "Ghosted / No Response", icon: "👻" },
  { value: "position_filled", label: "Position Filled", icon: "✅" },
  { value: "overqualified", label: "Overqualified", icon: "📈" },
  { value: "underqualified", label: "Underqualified", icon: "📉" },
  { value: "other", label: "Other", icon: "❓" },
];

export const PIPELINE_STAGES = [
  { value: "applied", label: "Applied", order: 1 },
  { value: "screening", label: "Screening", order: 2 },
  { value: "phone", label: "Phone Interview", order: 3 },
  { value: "technical", label: "Technical", order: 4 },
  { value: "onsite", label: "Onsite/Final", order: 5 },
  { value: "offer", label: "Offer", order: 6 },
] as const;
