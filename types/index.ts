// Barrel re-export — import from "@/types" for convenience

export type { UserProfile, Skill, Education, Experience, JobPreferences } from "./user";
export type { Job, JobScores, HiddenRequirement } from "./job";
export type { Application, ApplicationStatus } from "./application";
export type { ResumeVariant } from "./resume";
export type { InterviewSession, InterviewScores, WeaknessItem, StudyResource } from "./interview";
export type { AnalyticsData, FunnelStage, SourceStat, ProgressPoint } from "./analytics";
export type { AgentEvent } from "@/features/agents/types";
export type { NavItem } from "@/config/navigation";
