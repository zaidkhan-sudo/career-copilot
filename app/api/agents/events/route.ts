/**
 * Agent Events SSE Route
 * ======================
 * GET /api/agents/events
 * Server-Sent Events for streaming agent workflow progress.
 */

import { NextRequest } from "next/server";
import { runAgentWorkflowWithStreaming, type UserProfile } from "@/lib/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const profileStr = searchParams.get("profile");
  
  if (!userId) {
    return new Response("userId is required", { status: 400 });
  }
  
  let userProfile: UserProfile | undefined;
  if (profileStr) {
    try {
      userProfile = JSON.parse(profileStr);
    } catch {
      // Ignore parse errors
    }
  }
  
  // Create SSE stream
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };
      
      try {
        // Run workflow with streaming
        const result = await runAgentWorkflowWithStreaming(
          userId,
          userProfile,
          (event) => {
            sendEvent({ type: "event", event });
          }
        );
        
        // Send completion
        sendEvent({
          type: "completed",
          result: {
            success: result.success,
            jobsFound: result.jobsFound,
            highMatches: result.highMatches,
            resumesGenerated: result.resumesGenerated,
            scoredJobs: result.state.scoredJobs,
            generatedResumes: result.state.generatedResumes,
            error: result.error,
          },
        });
        
      } catch (error) {
        sendEvent({
          type: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
