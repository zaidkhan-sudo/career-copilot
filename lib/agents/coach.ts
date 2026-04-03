/**
 * Coach Agent
 * ===========
 * Interview preparation with OA, coding, and behavioral modes.
 */

import type { AgentState } from "./types";
import { AgentType, EventStatus, addEvent } from "./types";
import { generateJSON } from "./gemini";

// ============================================
// Types
// ============================================

export type InterviewMode = "oa" | "code" | "behavioral";

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  hints?: string[];
  expectedApproach?: string;
}

export interface InterviewSession {
  id: string;
  mode: InterviewMode;
  company: string;
  questions: InterviewQuestion[];
  prepFocus: string[];
  createdAt: string;
}

export interface BehavioralEvaluation {
  starAnalysis: {
    situation: { present: boolean; feedback: string };
    task: { present: boolean; feedback: string };
    action: { present: boolean; feedback: string };
    result: { present: boolean; feedback: string };
  };
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestedRewrite: string;
}

// ============================================
// Prompts
// ============================================

const OA_QUESTIONS_PROMPT = `Generate 3 Online Assessment coding questions for a {company} interview.

Focus areas based on company: {focus}

Generate questions that test:
1. Data structures and algorithms
2. Problem-solving approach
3. Code efficiency

Respond with JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Problem description with examples",
      "difficulty": "easy|medium|hard",
      "topic": "arrays|strings|dp|graphs|etc",
      "hints": ["hint1", "hint2"],
      "expectedApproach": "Brief optimal approach"
    }
  ],
  "prepFocus": ["topic1", "topic2"]
}`;

const CODE_QUESTIONS_PROMPT = `Generate 2 live coding interview questions for a {company} interview.

These should be system design or implementation focused:
1. One focused on clean code and design patterns
2. One focused on working with APIs/data

Respond with JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Implementation task with requirements",
      "difficulty": "medium|hard",
      "topic": "system-design|api|architecture",
      "hints": ["hint1"],
      "expectedApproach": "How to approach this"
    }
  ],
  "prepFocus": ["topic1", "topic2"]
}`;

const BEHAVIORAL_QUESTIONS_PROMPT = `Generate 4 behavioral interview questions for a {company} interview.

Include questions about:
1. Leadership/teamwork
2. Conflict resolution
3. Failure/learning
4. Impact/achievement

Respond with JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time when...",
      "difficulty": "medium",
      "topic": "leadership|conflict|failure|impact",
      "hints": ["What to emphasize"],
      "expectedApproach": "STAR method guidance"
    }
  ],
  "prepFocus": ["topic1", "topic2"]
}`;

const BEHAVIORAL_EVALUATION_PROMPT = `Evaluate this behavioral interview answer using the STAR method.

QUESTION: {question}

ANSWER: {answer}

Analyze the response and provide:
1. STAR component analysis (Situation, Task, Action, Result)
2. Overall score (0-100)
3. Strengths
4. Areas for improvement
5. A suggested rewrite

Respond with JSON:
{
  "starAnalysis": {
    "situation": { "present": true/false, "feedback": "..." },
    "task": { "present": true/false, "feedback": "..." },
    "action": { "present": true/false, "feedback": "..." },
    "result": { "present": true/false, "feedback": "..." }
  },
  "overallScore": 75,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "suggestedRewrite": "An improved version of the answer..."
}`;

// ============================================
// Generation Functions
// ============================================

interface QuestionsResponse {
  questions: InterviewQuestion[];
  prepFocus: string[];
}

async function generateOAQuestions(company: string): Promise<QuestionsResponse> {
  const focusMap: Record<string, string> = {
    google: "algorithms, system design, optimization",
    meta: "graphs, dynamic programming, scale",
    amazon: "trees, OOP, leadership principles",
    apple: "memory management, performance, UX",
    microsoft: "data structures, problem decomposition",
    default: "general algorithms and problem solving",
  };
  
  const focus = focusMap[company.toLowerCase()] || focusMap.default;
  
  const prompt = OA_QUESTIONS_PROMPT
    .replace("{company}", company)
    .replace("{focus}", focus);
  
  try {
    return await generateJSON<QuestionsResponse>(prompt);
  } catch {
    return {
      questions: [{
        id: "q1",
        question: "Implement a function to find the longest substring without repeating characters.",
        difficulty: "medium",
        topic: "strings",
        hints: ["Use sliding window", "Track character positions"],
        expectedApproach: "Sliding window with hash map for O(n) solution",
      }],
      prepFocus: ["sliding window", "hash maps"],
    };
  }
}

async function generateCodeQuestions(company: string): Promise<QuestionsResponse> {
  const prompt = CODE_QUESTIONS_PROMPT.replace("{company}", company);
  
  try {
    return await generateJSON<QuestionsResponse>(prompt);
  } catch {
    return {
      questions: [{
        id: "q1",
        question: "Design and implement a rate limiter that can handle 1000 requests per second.",
        difficulty: "hard",
        topic: "system-design",
        hints: ["Consider token bucket or sliding window"],
        expectedApproach: "Discuss trade-offs between accuracy and memory",
      }],
      prepFocus: ["rate limiting", "distributed systems"],
    };
  }
}

async function generateBehavioralQuestions(company: string): Promise<QuestionsResponse> {
  const prompt = BEHAVIORAL_QUESTIONS_PROMPT.replace("{company}", company);
  
  try {
    return await generateJSON<QuestionsResponse>(prompt);
  } catch {
    return {
      questions: [{
        id: "q1",
        question: "Tell me about a time when you had to deal with a difficult team member.",
        difficulty: "medium",
        topic: "conflict",
        hints: ["Focus on resolution, not blame"],
        expectedApproach: "Use STAR method, emphasize positive outcome",
      }],
      prepFocus: ["STAR method", "conflict resolution"],
    };
  }
}

/**
 * Evaluate a behavioral answer
 */
export async function evaluateBehavioralAnswer(
  question: string,
  answer: string
): Promise<BehavioralEvaluation> {
  const prompt = BEHAVIORAL_EVALUATION_PROMPT
    .replace("{question}", question)
    .replace("{answer}", answer);
  
  try {
    return await generateJSON<BehavioralEvaluation>(prompt);
  } catch {
    return {
      starAnalysis: {
        situation: { present: false, feedback: "Unable to analyze" },
        task: { present: false, feedback: "Unable to analyze" },
        action: { present: false, feedback: "Unable to analyze" },
        result: { present: false, feedback: "Unable to analyze" },
      },
      overallScore: 50,
      strengths: [],
      improvements: ["Unable to fully analyze response"],
      suggestedRewrite: answer,
    };
  }
}

// ============================================
// Coach Agent
// ============================================

/**
 * Generate interview prep session
 */
export async function generateInterviewPrep(
  company: string,
  mode: InterviewMode
): Promise<InterviewSession> {
  let questionsData: QuestionsResponse;
  
  switch (mode) {
    case "oa":
      questionsData = await generateOAQuestions(company);
      break;
    case "code":
      questionsData = await generateCodeQuestions(company);
      break;
    case "behavioral":
      questionsData = await generateBehavioralQuestions(company);
      break;
  }
  
  return {
    id: `session-${Date.now()}`,
    mode,
    company,
    questions: questionsData.questions,
    prepFocus: questionsData.prepFocus,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Coach Agent Node
 * Prepares interview materials for upcoming interviews.
 */
export async function coachAgent(state: AgentState): Promise<AgentState> {
  let newState = addEvent(
    state,
    AgentType.COACH,
    "Preparing interview materials...",
    EventStatus.RUNNING
  );
  newState.currentAgent = AgentType.COACH;
  
  const { scoredJobs } = state;
  
  // Get top companies from scored jobs
  const topJobs = scoredJobs.slice(0, 3);
  
  if (topJobs.length === 0) {
    return addEvent(
      newState,
      AgentType.COACH,
      "No jobs to prepare interviews for",
      EventStatus.COMPLETED
    );
  }
  
  try {
    const company = topJobs[0].company;
    
    newState = addEvent(
      newState,
      AgentType.COACH,
      `Generating prep materials for ${company}`,
      EventStatus.RUNNING
    );
    
    // Generate all three modes
    const [oaSession, codeSession, behavioralSession] = await Promise.all([
      generateInterviewPrep(company, "oa"),
      generateInterviewPrep(company, "code"),
      generateInterviewPrep(company, "behavioral"),
    ]);
    
    const totalQuestions = 
      oaSession.questions.length + 
      codeSession.questions.length + 
      behavioralSession.questions.length;
    
    newState = addEvent(
      newState,
      AgentType.COACH,
      `Interview prep ready: ${totalQuestions} questions across OA, Code, and Behavioral`,
      EventStatus.COMPLETED,
      {
        company,
        oaQuestions: oaSession.questions.length,
        codeQuestions: codeSession.questions.length,
        behavioralQuestions: behavioralSession.questions.length,
      }
    );
    
    return newState;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return {
      ...addEvent(
        newState,
        AgentType.COACH,
        `Coaching prep failed: ${errorMsg}`,
        EventStatus.FAILED
      ),
      error: errorMsg,
    };
  }
}
