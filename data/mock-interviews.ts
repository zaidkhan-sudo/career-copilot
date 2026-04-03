import type { InterviewSession, WeaknessItem } from "@/types/interview";

export const mockSessions: InterviewSession[] = [
  {
    id: "s1",
    company: "Google",
    role: "SDE-2",
    sessionType: "oa",
    scores: { overall: 78, problemSolving: 82, codeQuality: 75, timeManagement: 72 },
    weaknessTags: ["Dynamic Programming", "Time Management"],
    completedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    improvementNotes: "Good approach to BFS but missed DP optimization.",
  },
  {
    id: "s2",
    company: "Stripe",
    role: "Backend Engineer",
    sessionType: "code",
    scores: { overall: 85, communication: 88, problemSolving: 90, codeQuality: 82, timeManagement: 78 },
    weaknessTags: ["System Design"],
    completedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    improvementNotes: "Excellent communication. Need to practice DB scaling.",
  },
  {
    id: "s3",
    company: "Meta",
    role: "Software Engineer",
    sessionType: "behavioral",
    scores: { overall: 72, pace: 68, fillerWords: 55, confidence: 78, starAdherence: 82 },
    weaknessTags: ["Filler Words", "Quantifying Impact"],
    completedAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    improvementNotes: "Reduce filler words (18 count). Quantify impact with numbers.",
  },
];

export const mockWeaknesses: WeaknessItem[] = [
  {
    category: "System Design",
    topic: "Database Scaling",
    occurrenceCount: 3,
    studyPlan: [
      { title: '"Designing Data-Intensive Applications" Ch. 5-6', type: "book" },
      { title: "System Design — Database Sharding", type: "video", url: "https://youtube.com" },
      { title: "Design a distributed cache (re-test Fri)", type: "practice" },
    ],
    lastTested: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    improvementDelta: 12,
  },
  {
    category: "Behavioral",
    topic: "Quantifying Impact",
    occurrenceCount: 2,
    studyPlan: [
      { title: "STAR Framework deep-dive", type: "video", url: "https://youtube.com" },
      { title: "Rewrite 3 past answers with metrics", type: "practice" },
    ],
    lastTested: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    improvementDelta: 8,
  },
  {
    category: "DSA",
    topic: "Concurrency Patterns",
    occurrenceCount: 2,
    studyPlan: [
      { title: "Go Concurrency Patterns", type: "video" },
      { title: "Implement thread-safe queue", type: "practice" },
    ],
    lastTested: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    improvementDelta: 5,
  },
];
