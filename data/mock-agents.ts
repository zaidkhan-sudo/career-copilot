import type { AgentEvent } from "@/lib/agents/types";

export const mockAgentEvents: AgentEvent[] = [
  {
    id: "e1",
    agent: "scout",
    message: "Scanning Wellfound... found 3 new listings",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "e2",
    agent: "analyzer",
    message: 'Scoring "SDE-2 at Razorpay" — 79% match',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "e3",
    agent: "writer",
    message: "Resume ready for Stripe application",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "e4",
    agent: "reporter",
    message: "Daily digest scheduled for 8:00 AM",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "e5",
    agent: "coach",
    message: "Weakness detected: DB scaling (3rd occurrence)",
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "e6",
    agent: "scout",
    message: "Monitoring LinkedIn for new postings...",
    timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
    status: "running",
  },
];
