import { Search, BarChart3, PenTool, Target, Mail, LucideIcon } from "lucide-react";

// Re-export types from the main agent types
export type { AgentEvent } from "@/lib/agents/types";

export type AgentName = "scout" | "analyzer" | "writer" | "coach" | "reporter";

export const agentMeta: Record<
  AgentName,
  { icon: LucideIcon; color: string; label: string }
> = {
  scout: { icon: Search, color: "var(--color-cyan)", label: "Scout Agent" },
  analyzer: { icon: BarChart3, color: "var(--color-amber)", label: "Analyzer Agent" },
  writer: { icon: PenTool, color: "var(--color-indigo)", label: "Writer Agent" },
  coach: { icon: Target, color: "var(--color-emerald)", label: "Coach Agent" },
  reporter: { icon: Mail, color: "var(--color-rose)", label: "Reporter Agent" },
};
