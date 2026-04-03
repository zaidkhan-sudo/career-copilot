/**
 * Run Agents API Route
 * ====================
 * POST /api/agents/run
 * Triggers the agent workflow.
 */

import { NextRequest, NextResponse } from "next/server";
import { runAgentWorkflow, type UserProfile } from "@/lib/agents";

export const maxDuration = 60; // Allow up to 60 seconds for workflow

interface RunAgentsRequest {
  userId: string;
  userProfile?: UserProfile;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GOOGLE_API_KEY is not set. Configure it to run AI agents.",
        },
        { status: 400 }
      );
    }

    const body: RunAgentsRequest = await request.json();
    
    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    
    // Run the workflow
    const result = await runAgentWorkflow(body.userId, body.userProfile);
    
    return NextResponse.json({
      success: result.success,
      runId: `run-${Date.now()}`,
      jobsFound: result.jobsFound,
      highMatches: result.highMatches,
      resumesGenerated: result.resumesGenerated,
      events: result.events,
      scoredJobs: result.state.scoredJobs,
      generatedResumes: result.state.generatedResumes,
      error: result.error,
    });
    
  } catch (error) {
    console.error("Agent workflow error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
