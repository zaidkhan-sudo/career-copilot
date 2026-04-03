/**
 * Analyzer Agent
 * ==============
 * Scores jobs using 3-dimension analysis with Gemini AI.
 */

import type { AgentState, JobListing, JobScores, HiddenRequirement, UserProfile } from "./types";
import { AgentType, EventStatus, addEvent } from "./types";
import { generateJSON } from "./gemini";

// ============================================
// Scoring Prompts
// ============================================

const SKILLS_SCORING_PROMPT = `You are a technical recruiter analyzing job-candidate fit.

CANDIDATE SKILLS:
{skills}

JOB REQUIREMENTS:
Title: {title}
Company: {company}
Description: {description}

Score the skills match from 0-100 based on:
- Required skills overlap (weight: 60%)
- Nice-to-have skills (weight: 25%)
- Experience level match (weight: 15%)

Respond with JSON only:
{
  "score": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1"],
  "reasoning": "Brief explanation"
}`;

const CULTURE_SCORING_PROMPT = `Analyze culture fit between candidate and company.

CANDIDATE PREFERENCES:
- Work Mode: {workMode}
- Company Size Preference: {companySize}
- Industries: {industries}

JOB/COMPANY INFO:
Company: {company}
Location: {location}
Description: {description}

Score culture fit from 0-100 based on:
- Work style alignment
- Company values (inferred from description)
- Growth stage fit

Respond with JSON only:
{
  "score": <number 0-100>,
  "positives": ["factor1", "factor2"],
  "concerns": ["concern1"],
  "reasoning": "Brief explanation"
}`;

const TRAJECTORY_SCORING_PROMPT = `Analyze career trajectory alignment.

CANDIDATE'S 3-YEAR GOAL:
{careerGoal}

CANDIDATE'S CURRENT EXPERIENCE:
{experience}

JOB OPPORTUNITY:
Title: {title}
Company: {company}
Description: {description}

Score career trajectory fit from 0-100:
- Does this role advance toward the goal?
- Does it build relevant skills?
- Is it the right level (stretch but achievable)?

Respond with JSON only:
{
  "score": <number 0-100>,
  "alignmentFactors": ["factor1", "factor2"],
  "concerns": ["concern1"],
  "reasoning": "Brief explanation"
}`;

const HIDDEN_REQUIREMENTS_PROMPT = `Analyze this job posting for hidden requirements.

JOB POSTING:
Title: {title}
Company: {company}
Description: {description}

Look for signals like:
- "Fast-paced environment" = Long hours expected
- "Wear many hats" = Limited resources/support
- "Self-starter" = Minimal training/mentorship
- Vague requirements = Role uncertainty
- "Competitive salary" = Below market pay

Respond with JSON array only:
[
  {
    "signal": "The exact phrase from posting",
    "interpretation": "What it likely means",
    "severity": "info|warning|critical"
  }
]

Return empty array [] if no hidden requirements found.`;

// ============================================
// Scoring Functions
// ============================================

interface SkillsResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

interface CultureResult {
  score: number;
  positives: string[];
  concerns: string[];
  reasoning: string;
}

interface TrajectoryResult {
  score: number;
  alignmentFactors: string[];
  concerns: string[];
  reasoning: string;
}

async function scoreSkills(job: JobListing, profile: UserProfile): Promise<SkillsResult> {
  const skillsStr = profile.skills.map((s) => `${s.name} (${s.level})`).join(", ");
  
  const prompt = SKILLS_SCORING_PROMPT
    .replace("{skills}", skillsStr)
    .replace("{title}", job.title)
    .replace("{company}", job.company)
    .replace("{description}", job.description.slice(0, 1500));
  
  try {
    return await generateJSON<SkillsResult>(prompt);
  } catch {
    return { score: 50, matchedSkills: [], missingSkills: [], reasoning: "Unable to analyze" };
  }
}

async function scoreCulture(job: JobListing, profile: UserProfile): Promise<CultureResult> {
  const prompt = CULTURE_SCORING_PROMPT
    .replace("{workMode}", profile.preferences.workMode)
    .replace("{companySize}", profile.preferences.companySize || "any")
    .replace("{industries}", profile.preferences.industries?.join(", ") || "any")
    .replace("{company}", job.company)
    .replace("{location}", job.location)
    .replace("{description}", job.description.slice(0, 1500));
  
  try {
    return await generateJSON<CultureResult>(prompt);
  } catch {
    return { score: 50, positives: [], concerns: [], reasoning: "Unable to analyze" };
  }
}

async function scoreTrajectory(job: JobListing, profile: UserProfile): Promise<TrajectoryResult> {
  const experienceStr = profile.experience
    .slice(0, 3)
    .map((e) => `${e.title} at ${e.company}`)
    .join("; ");
  
  const prompt = TRAJECTORY_SCORING_PROMPT
    .replace("{careerGoal}", profile.careerGoal3yr || "Career growth in tech")
    .replace("{experience}", experienceStr || "Early career")
    .replace("{title}", job.title)
    .replace("{company}", job.company)
    .replace("{description}", job.description.slice(0, 1500));
  
  try {
    return await generateJSON<TrajectoryResult>(prompt);
  } catch {
    return { score: 50, alignmentFactors: [], concerns: [], reasoning: "Unable to analyze" };
  }
}

async function detectHiddenRequirements(job: JobListing): Promise<HiddenRequirement[]> {
  const prompt = HIDDEN_REQUIREMENTS_PROMPT
    .replace("{title}", job.title)
    .replace("{company}", job.company)
    .replace("{description}", job.description.slice(0, 2000));
  
  try {
    return await generateJSON<HiddenRequirement[]>(prompt);
  } catch {
    return [];
  }
}

// ============================================
// Analyzer Agent
// ============================================

/**
 * Score a single job
 */
async function scoreJob(job: JobListing, profile: UserProfile): Promise<JobListing> {
  // Run all scoring in parallel
  const [skillsResult, cultureResult, trajectoryResult, hiddenReqs] = await Promise.all([
    scoreSkills(job, profile),
    scoreCulture(job, profile),
    scoreTrajectory(job, profile),
    detectHiddenRequirements(job),
  ]);
  
  // Calculate composite score (weighted average)
  const scores: JobScores = {
    skills: skillsResult.score,
    culture: cultureResult.score,
    trajectory: trajectoryResult.score,
    composite: Math.round(
      skillsResult.score * 0.45 +
      cultureResult.score * 0.20 +
      trajectoryResult.score * 0.35
    ),
  };
  
  // Build AI reasoning
  const reasoning = [
    `Skills: ${skillsResult.reasoning}`,
    `Culture: ${cultureResult.reasoning}`,
    `Trajectory: ${trajectoryResult.reasoning}`,
  ].join(" | ");
  
  return {
    ...job,
    scores,
    hiddenRequirements: hiddenReqs,
    aiReasoning: reasoning,
  };
}

/**
 * Analyzer Agent Node
 * Scores all discovered jobs using 3D analysis.
 */
export async function analyzerAgent(state: AgentState): Promise<AgentState> {
  let newState = addEvent(
    state,
    AgentType.ANALYZER,
    "Starting job analysis...",
    EventStatus.RUNNING
  );
  newState.currentAgent = AgentType.ANALYZER;
  
  const { discoveredJobs, userProfile } = state;
  
  if (!userProfile) {
    return {
      ...addEvent(
        newState,
        AgentType.ANALYZER,
        "No user profile available for analysis",
        EventStatus.FAILED
      ),
      error: "User profile required for analysis",
    };
  }
  
  if (discoveredJobs.length === 0) {
    return addEvent(
      newState,
      AgentType.ANALYZER,
      "No jobs to analyze",
      EventStatus.COMPLETED
    );
  }
  
  try {
    const scoredJobs: JobListing[] = [];
    
    // Score jobs (limit to top 5 to save API calls and time)
    const jobsToScore = discoveredJobs.slice(0, 5);
    
    for (let i = 0; i < jobsToScore.length; i++) {
      const job = jobsToScore[i];
      
      newState = addEvent(
        newState,
        AgentType.ANALYZER,
        `Analyzing ${i + 1}/${jobsToScore.length}: ${job.title} at ${job.company}`,
        EventStatus.RUNNING
      );
      
      try {
        // Add timeout for each job scoring
        const scoredJob = await Promise.race([
          scoreJob(job, userProfile),
          new Promise<JobListing>((_, reject) => 
            setTimeout(() => reject(new Error("Scoring timeout")), 15000)
          )
        ]);
        scoredJobs.push(scoredJob);
      } catch {
        // Use default scores on timeout
        scoredJobs.push({
          ...job,
          scores: { skills: 50, culture: 50, trajectory: 50, composite: 50 },
          aiReasoning: "Scoring timed out - using default scores",
        });
      }
    }
    
    // Sort by composite score
    scoredJobs.sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0));
    
    const highMatches = scoredJobs.filter((j) => (j.scores?.composite || 0) >= 80).length;
    
    newState = addEvent(
      newState,
      AgentType.ANALYZER,
      `Analysis complete: ${scoredJobs.length} jobs scored, ${highMatches} high matches (80%+)`,
      EventStatus.COMPLETED,
      { analyzed: scoredJobs.length, highMatches }
    );
    
    return {
      ...newState,
      scoredJobs,
    };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return {
      ...addEvent(
        newState,
        AgentType.ANALYZER,
        `Analysis failed: ${errorMsg}`,
        EventStatus.FAILED
      ),
      error: errorMsg,
    };
  }
}
