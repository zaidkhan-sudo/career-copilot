export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  source: string;
  sourceUrl: string;
  applyUrl?: string;
  postedAt: string;
  discoveredAt: string;
  isFresh: boolean;
  isRemote: boolean;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  scores: JobScores;
  hiddenRequirements: HiddenRequirement[];
  aiReasoning: string;
}

export interface JobScores {
  skills: number;
  culture: number;
  trajectory: number;
  composite: number;
}

export interface HiddenRequirement {
  signal: string;
  interpretation: string;
  severity: "info" | "warning" | "critical";
}
