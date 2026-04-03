/**
 * Writer Agent
 * ============
 * Generates tailored resumes and cover letters using Gemini AI.
 */

import type { AgentState, JobListing, ResumeVariant, UserProfile } from "./types";
import { AgentType, EventStatus, addEvent } from "./types";
import { generateText } from "./gemini";

// ============================================
// Writing Prompts
// ============================================

const FRAMING_STRATEGY_PROMPT = `Determine the optimal resume framing strategy.

CANDIDATE PROFILE:
Skills: {skills}
Experience: {experience}
Career Goal: {careerGoal}

TARGET JOB:
Title: {title}
Company: {company}
Description: {description}

Choose ONE framing strategy:
1. "Technical Depth" - Emphasize deep technical skills
2. "Leadership" - Highlight team/project leadership
3. "Impact-First" - Lead with business outcomes
4. "Growth-Story" - Emphasize rapid learning and progression
5. "Specialist" - Focus on niche expertise

Respond with ONLY the strategy name, nothing else.`;

const RESUME_GENERATION_PROMPT = `Generate a tailored resume for this job application.

CANDIDATE:
Name: {name}
Skills: {skills}
Experience:
{experience}

TARGET JOB:
Title: {title}
Company: {company}
Key Requirements: {requirements}

FRAMING STRATEGY: {strategy}

Generate a professional resume in markdown format that:
1. Tailors the professional summary to the target role
2. Highlights relevant skills prominently
3. Quantifies achievements where possible
4. Uses keywords from the job description naturally
5. Follows the {strategy} framing approach

Format:
# {name}
[Contact Info Placeholder]

## Professional Summary
[2-3 sentences tailored to this role]

## Skills
[Relevant skills organized by category]

## Experience
[Most relevant experiences with quantified achievements]

## Education
[Education details]`;

const COVER_LETTER_PROMPT = `Write a compelling cover letter.

CANDIDATE:
Name: {name}
Background: {background}

TARGET JOB:
Title: {title}
Company: {company}
Description: {description}

Write a 3-paragraph cover letter that:
1. Opens with a hook showing genuine interest in {company}
2. Connects candidate's experience to job requirements
3. Closes with enthusiasm and call to action

Keep it under 300 words. Be authentic, not generic.`;

// ============================================
// Generation Functions
// ============================================

async function determineFramingStrategy(
  job: JobListing,
  profile: UserProfile
): Promise<string> {
  const skillsStr = profile.skills.map((s) => s.name).join(", ");
  const experienceStr = profile.experience
    .slice(0, 2)
    .map((e) => `${e.title} at ${e.company}: ${e.description.slice(0, 100)}`)
    .join("\n");
  
  const prompt = FRAMING_STRATEGY_PROMPT
    .replace("{skills}", skillsStr)
    .replace("{experience}", experienceStr)
    .replace("{careerGoal}", profile.careerGoal3yr || "Career growth")
    .replace("{title}", job.title)
    .replace("{company}", job.company)
    .replace("{description}", job.description.slice(0, 1000));
  
  try {
    const strategy = await generateText(prompt);
    return strategy.trim().replace(/['"]/g, "");
  } catch {
    return "Impact-First";
  }
}

async function generateResume(
  job: JobListing,
  profile: UserProfile,
  strategy: string
): Promise<string> {
  const skillsStr = profile.skills.map((s) => `${s.name} (${s.level})`).join(", ");
  const experienceStr = profile.experience
    .map((e) => `**${e.title}** at ${e.company} (${e.startDate} - ${e.endDate || "Present"})\n${e.description}`)
    .join("\n\n");
  
  const prompt = RESUME_GENERATION_PROMPT
    .replace("{name}", profile.name)
    .replace("{skills}", skillsStr)
    .replace("{experience}", experienceStr)
    .replace("{title}", job.title)
    .replace("{company}", job.company)
    .replace("{requirements}", job.extractedSkills.join(", ") || "See job description")
    .replace("{strategy}", strategy)
    .replace("{strategy}", strategy); // Replace second occurrence
  
  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("Resume generation error:", error);
    return `# ${profile.name}\n\nResume generation failed. Please try again.`;
  }
}

async function generateCoverLetter(
  job: JobListing,
  profile: UserProfile
): Promise<string> {
  const backgroundStr = profile.experience
    .slice(0, 2)
    .map((e) => `${e.title} at ${e.company}`)
    .join(", ");
  
  const prompt = COVER_LETTER_PROMPT
    .replace("{name}", profile.name)
    .replace("{background}", backgroundStr || "Experienced professional")
    .replace("{title}", job.title)
    .replace("{company}", job.company)
    .replace("{company}", job.company) // Second occurrence
    .replace("{description}", job.description.slice(0, 1500));
  
  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return "Cover letter generation failed. Please try again.";
  }
}

// ============================================
// Writer Agent
// ============================================

/**
 * Writer Agent Node
 * Generates resumes and cover letters for high-match jobs.
 */
export async function writerAgent(state: AgentState): Promise<AgentState> {
  let newState = addEvent(
    state,
    AgentType.WRITER,
    "Preparing application materials...",
    EventStatus.RUNNING
  );
  newState.currentAgent = AgentType.WRITER;
  
  const { scoredJobs, userProfile } = state;
  
  if (!userProfile) {
    return {
      ...addEvent(
        newState,
        AgentType.WRITER,
        "No user profile available",
        EventStatus.FAILED
      ),
      error: "User profile required",
    };
  }
  
  // Only generate for jobs with score >= 75
  const highMatchJobs = scoredJobs.filter((j) => (j.scores?.composite || 0) >= 75);
  
  if (highMatchJobs.length === 0) {
    return addEvent(
      newState,
      AgentType.WRITER,
      "No high-match jobs to prepare materials for",
      EventStatus.COMPLETED
    );
  }
  
  try {
    const generatedResumes: ResumeVariant[] = [];
    
    // Generate for top 3 high-match jobs
    const jobsToProcess = highMatchJobs.slice(0, 3);
    
    for (let i = 0; i < jobsToProcess.length; i++) {
      const job = jobsToProcess[i];
      
      newState = addEvent(
        newState,
        AgentType.WRITER,
        `Creating materials for ${job.company} (${i + 1}/${jobsToProcess.length})`,
        EventStatus.RUNNING
      );
      
      // Determine framing strategy
      const strategy = await determineFramingStrategy(job, userProfile);
      
      newState = addEvent(
        newState,
        AgentType.WRITER,
        `Using "${strategy}" framing for ${job.company}`,
        EventStatus.RUNNING
      );
      
      // Generate resume and cover letter
      const [resume, coverLetter] = await Promise.all([
        generateResume(job, userProfile, strategy),
        generateCoverLetter(job, userProfile),
      ]);
      
      generatedResumes.push({
        id: `resume-${Date.now()}-${i}`,
        jobId: job.id,
        framingStrategy: strategy,
        content: resume,
        coverLetter,
        createdAt: new Date().toISOString(),
      });
    }
    
    newState = addEvent(
      newState,
      AgentType.WRITER,
      `Created ${generatedResumes.length} tailored resume packages`,
      EventStatus.COMPLETED,
      { resumesGenerated: generatedResumes.length }
    );
    
    return {
      ...newState,
      generatedResumes,
    };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return {
      ...addEvent(
        newState,
        AgentType.WRITER,
        `Writing failed: ${errorMsg}`,
        EventStatus.FAILED
      ),
      error: errorMsg,
    };
  }
}
