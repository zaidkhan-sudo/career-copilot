/**
 * Agent Orchestrator
 * ==================
 * Sequential workflow orchestration for CareerPilot agents.
 * Simplified implementation without complex LangGraph types.
 */

import type { AgentState, UserProfile, AgentEvent } from "./types";
import { createInitialState, AgentType, EventStatus } from "./types";
import { scoutAgent } from "./scout";
import { analyzerAgent } from "./analyzer";
import { writerAgent } from "./writer";
import { coachAgent } from "./coach";

// ============================================
// Workflow Result Types
// ============================================

export interface WorkflowResult {
  success: boolean;
  state: AgentState;
  jobsFound: number;
  highMatches: number;
  resumesGenerated: number;
  events: AgentEvent[];
  error?: string;
}

export type WorkflowEventCallback = (event: AgentEvent) => void;

// ============================================
// Sequential Workflow Runner
// ============================================

/**
 * Run the full agent workflow sequentially.
 * Flow: Scout → Analyzer → Writer → Coach (optional)
 */
export async function runAgentWorkflow(
  userId: string,
  userProfile?: UserProfile
): Promise<WorkflowResult> {
  let state = createInitialState(userId, userProfile);
  
  try {
    // Step 1: Scout - Discover jobs
    state = await scoutAgent(state);
    
    if (state.error || state.discoveredJobs.length === 0) {
      return buildResult(state);
    }
    
    // Step 2: Analyzer - Score jobs
    state = await analyzerAgent(state);
    
    if (state.error || state.scoredJobs.length === 0) {
      return buildResult(state);
    }
    
    // Step 3: Writer - Generate resumes for high-match jobs
    const highMatches = state.scoredJobs.filter((j) => (j.scores?.composite || 0) >= 75);
    
    if (highMatches.length > 0) {
      state = await writerAgent(state);
    }
    
    // Step 4: Coach (optional) - Prepare interview materials
    if (state.generatedResumes.length > 0 && !state.error) {
      state = await coachAgent(state);
    }
    
    return buildResult(state);
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      state: {
        ...state,
        error: errorMsg,
        events: [
          ...state.events,
          {
            id: `error-${Date.now()}`,
            agent: AgentType.SCOUT,
            message: `Workflow failed: ${errorMsg}`,
            status: EventStatus.FAILED,
            timestamp: new Date().toISOString(),
          },
        ],
      },
      jobsFound: state.discoveredJobs.length,
      highMatches: 0,
      resumesGenerated: 0,
      events: state.events,
      error: errorMsg,
    };
  }
}

/**
 * Build result object from final state
 */
function buildResult(state: AgentState): WorkflowResult {
  const highMatches = state.scoredJobs.filter(
    (j) => (j.scores?.composite || 0) >= 80
  ).length;
  
  return {
    success: !state.error,
    state,
    jobsFound: state.discoveredJobs.length,
    highMatches,
    resumesGenerated: state.generatedResumes.length,
    events: state.events,
    error: state.error || undefined,
  };
}

// ============================================
// Streaming Workflow (for real-time updates)
// ============================================

/**
 * Run workflow with streaming events callback.
 * Useful for real-time UI updates.
 */
export async function runAgentWorkflowWithStreaming(
  userId: string,
  userProfile: UserProfile | undefined,
  onEvent: WorkflowEventCallback
): Promise<WorkflowResult> {
  let state = createInitialState(userId, userProfile);
  let lastEventCount = 0;
  
  // Helper to emit new events
  const emitNewEvents = (newState: AgentState) => {
    const newEvents = newState.events.slice(lastEventCount);
    for (const event of newEvents) {
      onEvent(event);
    }
    lastEventCount = newState.events.length;
  };
  
  try {
    // Step 1: Scout
    state = await scoutAgent(state);
    emitNewEvents(state);
    
    if (state.error || state.discoveredJobs.length === 0) {
      return buildResult(state);
    }
    
    // Step 2: Analyzer
    state = await analyzerAgent(state);
    emitNewEvents(state);
    
    if (state.error || state.scoredJobs.length === 0) {
      return buildResult(state);
    }
    
    // Step 3: Writer
    const highMatches = state.scoredJobs.filter((j) => (j.scores?.composite || 0) >= 75);
    
    if (highMatches.length > 0) {
      state = await writerAgent(state);
      emitNewEvents(state);
    }
    
    // Step 4: Coach
    if (state.generatedResumes.length > 0 && !state.error) {
      state = await coachAgent(state);
      emitNewEvents(state);
    }
    
    return buildResult(state);
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    const errorEvent: AgentEvent = {
      id: `error-${Date.now()}`,
      agent: AgentType.SCOUT,
      message: `Workflow failed: ${errorMsg}`,
      status: EventStatus.FAILED,
      timestamp: new Date().toISOString(),
    };
    
    onEvent(errorEvent);
    
    return {
      success: false,
      state: { ...state, error: errorMsg, events: [...state.events, errorEvent] },
      jobsFound: state.discoveredJobs.length,
      highMatches: 0,
      resumesGenerated: 0,
      events: [...state.events, errorEvent],
      error: errorMsg,
    };
  }
}

// Note: LangGraph-based implementation commented out due to complex type requirements.
// The sequential implementation above provides the same functionality with simpler code.
// LangGraph can be re-added when the JS API stabilizes or with proper type definitions.
export function createAgentGraph() {
  // Placeholder - using sequential execution instead
  return null;
}
