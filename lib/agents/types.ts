/**
 * CareerPilot Agent Types
 * =======================
 * Shared types for the agent orchestration system.
 */

import { z } from "zod";

// ============================================
// Enums and Constants
// ============================================

export const AgentType = {
  SCOUT: "scout",
  ANALYZER: "analyzer",
  WRITER: "writer",
  COACH: "coach",
  REPORTER: "reporter",
} as const;

export type AgentType = (typeof AgentType)[keyof typeof AgentType];

export const EventStatus = {
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

// ============================================
// Zod Schemas for Validation
// ============================================

export const SkillSchema = z.object({
  name: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  yearsExperience: z.number().optional(),
});

export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string(),
  skillsUsed: z.array(z.string()),
});

export const JobPreferencesSchema = z.object({
  targetRoles: z.array(z.string()),
  workMode: z.enum(["remote", "hybrid", "onsite", "any"]),
  locations: z.array(z.string()),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  companySize: z.enum(["startup", "mid", "large", "any"]).optional(),
  industries: z.array(z.string()).optional(),
  excludeCompanies: z.array(z.string()).optional(),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  skills: z.array(SkillSchema),
  experience: z.array(ExperienceSchema),
  careerGoal3yr: z.string().optional(),
  preferences: JobPreferencesSchema,
});

export const JobScoresSchema = z.object({
  skills: z.number().min(0).max(100),
  culture: z.number().min(0).max(100),
  trajectory: z.number().min(0).max(100),
  composite: z.number().min(0).max(100),
});

export const HiddenRequirementSchema = z.object({
  signal: z.string(),
  interpretation: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
});

export const JobListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  salary: z.string().optional(),
  description: z.string(),
  url: z.string(),
  source: z.string(),
  postedAt: z.string(),
  isFresh: z.boolean(),
  isRemote: z.boolean(),
  extractedSkills: z.array(z.string()),
  scores: JobScoresSchema.optional(),
  hiddenRequirements: z.array(HiddenRequirementSchema).optional(),
  aiReasoning: z.string().optional(),
});

export const ResumeVariantSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  framingStrategy: z.string(),
  content: z.string(),
  coverLetter: z.string().optional(),
  createdAt: z.string(),
});

export const AgentEventSchema = z.object({
  id: z.string(),
  agent: z.enum(["scout", "analyzer", "writer", "coach", "reporter"]),
  message: z.string(),
  status: z.enum(["running", "completed", "failed"]),
  timestamp: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// TypeScript Types (inferred from Zod)
// ============================================

export type Skill = z.infer<typeof SkillSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type JobPreferences = z.infer<typeof JobPreferencesSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type JobScores = z.infer<typeof JobScoresSchema>;
export type HiddenRequirement = z.infer<typeof HiddenRequirementSchema>;
export type JobListing = z.infer<typeof JobListingSchema>;
export type ResumeVariant = z.infer<typeof ResumeVariantSchema>;
export type AgentEvent = z.infer<typeof AgentEventSchema>;

// ============================================
// Agent State
// ============================================

export interface AgentState {
  // User context
  userId: string;
  userProfile: UserProfile | null;
  
  // Job discovery
  discoveredJobs: JobListing[];
  scoredJobs: JobListing[];
  
  // Generated content
  generatedResumes: ResumeVariant[];
  
  // Tracking
  events: AgentEvent[];
  currentAgent: AgentType | null;
  
  // Results
  dailyDigest: Record<string, unknown> | null;
  error: string | null;
}

export const createInitialState = (userId: string, profile?: UserProfile): AgentState => ({
  userId,
  userProfile: profile || null,
  discoveredJobs: [],
  scoredJobs: [],
  generatedResumes: [],
  events: [],
  currentAgent: null,
  dailyDigest: null,
  error: null,
});

// Helper to add events
export const addEvent = (
  state: AgentState,
  agent: AgentType,
  message: string,
  status: EventStatus,
  metadata?: Record<string, unknown>
): AgentState => ({
  ...state,
  events: [
    ...state.events,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agent,
      message,
      status,
      timestamp: new Date().toISOString(),
      metadata,
    },
  ],
});
