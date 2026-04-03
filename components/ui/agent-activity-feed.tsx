"use client";

/**
 * Agent Activity Feed
 * ==================
 * Real-time feed showing agent activities.
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BarChart3,
  PenTool,
  Target,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { AgentEvent } from "@/lib/agents/types";

type AgentType = "scout" | "analyzer" | "writer" | "coach" | "reporter";

const agentConfig: Record<
  AgentType,
  { icon: typeof Search; color: string; label: string }
> = {
  scout: {
    icon: Search,
    color: "var(--color-cyan)",
    label: "Scout",
  },
  analyzer: {
    icon: BarChart3,
    color: "var(--color-amber)",
    label: "Analyzer",
  },
  writer: {
    icon: PenTool,
    color: "var(--color-indigo)",
    label: "Writer",
  },
  coach: {
    icon: Target,
    color: "var(--color-emerald)",
    label: "Coach",
  },
  reporter: {
    icon: Mail,
    color: "var(--color-rose)",
    label: "Reporter",
  },
};

const statusConfig = {
  running: {
    icon: Loader2,
    color: "var(--color-cyan)",
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    color: "var(--color-emerald)",
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    color: "var(--color-rose)",
    animate: false,
  },
};

interface AgentActivityFeedProps {
  events: AgentEvent[];
  isLive?: boolean;
  maxItems?: number;
  showHeader?: boolean;
}

export function AgentActivityFeed({
  events,
  isLive = false,
  maxItems = 10,
  showHeader = true,
}: AgentActivityFeedProps) {
  const displayEvents = events.slice(-maxItems).reverse();

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Agent Activity
          </h3>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-emerald)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-emerald)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-emerald)]" />
              </span>
              Live
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayEvents.map((event) => {
            const agent = agentConfig[event.agent as AgentType] || agentConfig.scout;
            const status = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.completed;
            const AgentIcon = agent.icon;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 rounded-lg bg-[var(--color-bg-card)] p-3"
              >
                {/* Agent Icon */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in srgb, ${agent.color} 15%, transparent)` }}
                >
                  <AgentIcon
                    className="h-4 w-4"
                    style={{ color: agent.color }}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: agent.color }}
                    >
                      {agent.label}
                    </span>
                    <StatusIcon
                      className={`h-3.5 w-3.5 ${status.animate ? "animate-spin" : ""}`}
                      style={{ color: status.color }}
                    />
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                    {event.message}
                  </p>
                  <span className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displayEvents.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}
