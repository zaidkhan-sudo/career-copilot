import type { AnalyticsData } from "@/types/analytics";

export const mockAnalytics: AnalyticsData = {
  jobsFound: 147,
  jobsFoundDelta: 12,
  applied: 23,
  appliedDelta: 8,
  callbackRate: 26,
  callbackRateDelta: 5,
  interviews: 4,
  interviewsDelta: 2,
  funnel: [
    { label: "Discovered", count: 147, color: "var(--color-indigo)" },
    { label: "Applied", count: 23, color: "var(--color-cyan)" },
    { label: "Callback", count: 6, color: "var(--color-emerald)" },
    { label: "Interview", count: 4, color: "var(--color-amber)" },
    { label: "Offer", count: 1, color: "var(--color-rose)" },
  ],
  topSources: [
    { name: "LinkedIn", count: 42 },
    { name: "Wellfound", count: 31 },
    { name: "Otta", count: 28 },
    { name: "Hacker News", count: 19 },
    { name: "Direct", count: 16 },
    { name: "Glassdoor", count: 11 },
  ],
  interviewProgress: [
    { category: "Coding", before: 72, after: 88, delta: 22 },
    { category: "System Design", before: 45, after: 62, delta: 38 },
    { category: "Behavioral", before: 68, after: 81, delta: 19 },
  ],
};
