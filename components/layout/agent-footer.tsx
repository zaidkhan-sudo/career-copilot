"use client";

import { Search, BarChart3, PenTool, Target, Mail } from "lucide-react";
import { useStore } from "@/lib/store";

const agentIcons = {
  scout: Search,
  analyzer: BarChart3,
  writer: PenTool,
  coach: Target,
  reporter: Mail,
};

const agentColors = {
  scout: "text-[var(--color-cyan)]",
  analyzer: "text-[var(--color-amber)]",
  writer: "text-[var(--color-indigo)]",
  coach: "text-[var(--color-emerald)]",
  reporter: "text-[var(--color-rose)]",
};

export default function AgentFooter() {
  const { state } = useStore();
  const latestEvent = state.agentEvents[0];

  if (!latestEvent) {
    return null;
  }

  const Icon = agentIcons[latestEvent.agent];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex h-10 items-center border-t border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]/90 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-emerald)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-emerald)]"></span>
          </span>
          <span className="font-medium text-[var(--color-text-muted)]">
            Agent Activity:
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${agentColors[latestEvent.agent]}`} />
          <span className="text-[var(--color-text-secondary)]">
            {latestEvent.message}
          </span>
          <span className="text-[var(--color-text-muted)]">
            • {getTimeAgo(latestEvent.timestamp)}
          </span>
        </span>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
