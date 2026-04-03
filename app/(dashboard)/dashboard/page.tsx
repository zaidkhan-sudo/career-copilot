"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  FileText,
  Target,
  Clock,
  ChevronRight,
  Zap,
  RefreshCw,
  Loader2,
  ExternalLink,
  MapPin,
  ArrowRight,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Rocket,
  BarChart3,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useStore, useStoreActions } from "@/lib/store";

// ============================================
// Morning Briefing Component
// ============================================

function MorningBriefing() {
  const { state } = useStore();
  const { setBriefing } = useStoreActions();
  const briefing = state.briefing;
  const [loading, setLoading] = useState(!briefing);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/briefing", { method: "POST" });
      const { data } = await res.json();
      if (data) setBriefing(data);
    } catch (e) {
      console.error("Briefing refresh error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!briefing && !hasLoaded) {
      setHasLoaded(true);
      fetch("/api/agents/briefing", { method: "POST" })
        .then((res) => res.json())
        .then(({ data }) => { if (data) setBriefing(data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [briefing, hasLoaded, setBriefing]);

  if (!briefing && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-amber)] via-[var(--color-orange)] to-[var(--color-rose)]" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-amber-bg)]">
            <Sparkles className="h-5 w-5 text-[var(--color-amber)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Morning Briefing</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </button>
      </div>

      {loading && !briefing ? (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating your briefing...
        </div>
      ) : briefing ? (
        <div className="space-y-4">
          {/* Summary */}
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {briefing.summary || "No briefing available yet."}
          </p>

          {/* Market Insights */}
          {(briefing as any).market_insights?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(briefing as any).market_insights.map((insight: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-indigo-bg)] px-3 py-1 text-xs text-[var(--color-indigo)]"
                >
                  <TrendingUp className="h-3 w-3" /> {insight}
                </span>
              ))}
            </div>
          )}

          {/* Action Items */}
          {(briefing as any).action_items?.length > 0 && (
            <div className="space-y-2">
              {(briefing as any).action_items.map((item: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-[var(--color-bg-card)] ${
                    item.priority === "high"
                      ? "border-[var(--color-amber-border)] bg-[var(--color-amber-bg)]/50"
                      : "border-[var(--color-border-default)]"
                  }`}
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    item.type === "apply" ? "bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]" :
                    item.type === "prepare" ? "bg-[var(--color-indigo-bg)] text-[var(--color-indigo)]" :
                    "bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                  }`}>
                    {item.type === "apply" ? <Rocket className="h-3.5 w-3.5" /> :
                     item.type === "prepare" ? <FileText className="h-3.5 w-3.5" /> :
                     <BarChart3 className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Encouragement */}
          {briefing.encouragement && (
            <p className="text-xs text-[var(--color-text-muted)] italic border-l-2 border-[var(--color-indigo)] pl-3">
              {briefing.encouragement}
            </p>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}

// ============================================
// Job Match Card
// ============================================

function JobMatchCard({
  job,
  index,
  onPrepare,
}: {
  job: any;
  index: number;
  onPrepare: (job: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const score = job.scores?.composite || 0;
  const scoreColor = score >= 90 ? "emerald" : score >= 80 ? "amber" : "rose";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="glass-card group relative overflow-hidden transition-all hover:shadow-lg"
    >
      {/* Score indicator line */}
      <div
        className={`absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-[var(--color-${scoreColor})]`}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate">
                {job.title}
              </h3>
              {job.isFresh && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-emerald)]">
                  <Zap className="h-2.5 w-2.5" /> NEW
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{job.company}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {job.location || "Remote"}
              </span>
              {job.salary && (
                <span className="text-[var(--color-emerald)]">{job.salary}</span>
              )}
              <span>{job.source}</span>
            </div>
          </div>

          {/* Score Ring */}
          <div className="flex flex-col items-center gap-1 ml-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[var(--color-${scoreColor})] bg-[var(--color-${scoreColor}-bg)]`}
            >
              <span className={`text-lg font-bold text-[var(--color-${scoreColor})]`}>
                {score}
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">Match</span>
          </div>
        </div>

        {/* Score Breakdown */}
        {job.scores && (
          <div className="mt-3 flex gap-3">
            {[
              { label: "Skills", value: job.scores.skills },
              { label: "Culture", value: job.scores.culture },
              { label: "Growth", value: job.scores.trajectory },
            ].map((dim) => (
              <div key={dim.label} className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mb-0.5">
                  <span>{dim.label}</span>
                  <span>{dim.value}%</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--color-bg-card)]">
                  <div
                    className={`h-full rounded-full bg-[var(--color-${dim.value >= 85 ? "emerald" : dim.value >= 70 ? "amber" : "rose"})]`}
                    style={{ width: `${dim.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Reasoning (expandable) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-indigo)] hover:underline"
        >
          <Brain className="h-3 w-3" />
          {expanded ? "Hide" : "Show"} AI Reasoning
        </button>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 rounded-lg bg-[var(--color-indigo-bg)] border border-[var(--color-indigo-border)] p-3"
          >
            <p className="text-xs text-[var(--color-indigo)] leading-relaxed">
              {job.aiReasoning || job.ai_reasoning || "AI reasoning not available."}
            </p>

            {/* Hidden Requirements */}
            {job.hiddenRequirements?.length > 0 && (
              <div className="mt-2 space-y-1">
                {job.hiddenRequirements.map((req: any, i: number) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px]">
                    <AlertTriangle className={`h-3 w-3 shrink-0 mt-0.5 ${
                      req.severity === "critical" ? "text-[var(--color-rose)]" :
                      req.severity === "warning" ? "text-[var(--color-amber)]" :
                      "text-[var(--color-text-muted)]"
                    }`} />
                    <span className="text-[var(--color-text-secondary)]">
                      <strong>{req.signal}</strong> — {req.interpretation}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onPrepare(job)}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-indigo)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)]"
          >
            <FileText className="h-3 w-3" /> Prepare Materials
          </button>
          <Link href="/interview">
            <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-card)]">
              <Target className="h-3 w-3" /> Interview Prep
            </button>
          </Link>
          {job.sourceUrl && (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <ExternalLink className="h-3 w-3" /> View
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Pipeline Stats
// ============================================

function PipelineStats() {
  const { state } = useStore();

  const stats = [
    {
      label: "Jobs Found",
      value: state.jobs.length,
      icon: Briefcase,
      color: "indigo",
    },
    {
      label: "Applications",
      value: state.applications.filter((a) => a.status !== "discovered").length,
      icon: FileText,
      color: "amber",
    },
    {
      label: "Interviews",
      value: state.applications.filter((a) => a.status === "interviewing").length,
      icon: Target,
      color: "cyan",
    },
    {
      label: "Offers",
      value: state.applications.filter((a) => a.status === "offered").length,
      icon: Star,
      color: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-${stat.color}-bg)]`}>
              <stat.icon className={`h-5 w-5 text-[var(--color-${stat.color})]`} />
            </div>
            <div>
              <p className={`text-2xl font-bold text-[var(--color-${stat.color})]`}>{stat.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// Agent Activity Feed
// ============================================

function AgentActivityFeed() {
  const { state } = useStore();
  const events = state.agentEvents.slice(-5);

  if (events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-[var(--color-amber)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Agent Activity</h3>
        {state.agentRunning && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-emerald)]">
            <Loader2 className="h-2.5 w-2.5 animate-spin" /> Running
          </span>
        )}
      </div>
      <div className="space-y-2">
        {events.map((event, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-[var(--color-emerald)] shrink-0" />
            <div>
              <span className="font-medium text-[var(--color-text-primary)]">{event.agent}</span>
              <span className="text-[var(--color-text-muted)]"> — {event.message}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// Main Dashboard Page
// ============================================

export default function DashboardPage() {
  const { state } = useStore();
  const { setJobs, addAgentEvent, setAgentRunning, setAgentEvents } = useStoreActions();
  const [isRunning, setIsRunning] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Sort jobs by composite score (descending)
  const topJobs = [...state.jobs]
    .filter((j) => j.scores?.composite)
    .sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0))
    .slice(0, 6);

  const handleRunAgents = async () => {
    setIsRunning(true);
    setAgentRunning(true);
    setAgentEvents([]);
    setAgentError(null);

    try {
      addAgentEvent({ id: `evt-${Date.now()}-1`, agent: "scout", status: "running", message: "Scanning job boards...", timestamp: new Date().toISOString() });

      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.user?.id || "demo",
          userProfile: {
            id: state.user?.id || "demo",
            email: state.user?.email || "demo@example.com",
            name: state.user?.name || "User",
            skills: (state.user?.skills || []).map((s: any) => ({ name: s.name, level: s.level || "intermediate" })),
            experience: [],
            preferences: {
              targetRoles: ["Software Engineer", "Full Stack Developer"],
              workMode: "remote",
              locations: [],
            },
            careerGoal3yr: state.user?.careerGoal || "Senior Engineer at a top tech company",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.error || "Failed to run agents.";
        setAgentError(message);
        addAgentEvent({
          id: `evt-${Date.now()}-err`,
          agent: "scout",
          status: "failed",
          message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      addAgentEvent({ id: `evt-${Date.now()}-2`, agent: "scout", status: "completed", message: `Found ${data.jobsFound || 0} opportunities`, timestamp: new Date().toISOString() });
      addAgentEvent({ id: `evt-${Date.now()}-3`, agent: "analyzer", status: "completed", message: `Scored ${data.scoredJobs?.length || 0} matches`, timestamp: new Date().toISOString() });

      if (data.scoredJobs?.length) {
        // Transform and save to store
        const transformed = data.scoredJobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location || "Remote",
          salary: j.salary,
          description: j.description || "",
          url: j.url || "",
          source: j.source || "Agent",
          postedAt: j.postedAt || new Date().toISOString(),
          isFresh: j.isFresh ?? true,
          isRemote: j.isRemote ?? true,
          extractedSkills: j.extractedSkills || j.requiredSkills || [],
          scores: j.scores,
          hiddenRequirements: j.hiddenRequirements || [],
          aiReasoning: j.aiReasoning,
        }));
        setJobs(transformed);

        // Save to backend
        try {
          await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobs: transformed }),
          });
        } catch (e) {
          console.error("Failed to persist jobs:", e);
        }
      }
    } catch (error) {
      setAgentError("Agent run failed. Please try again.");
      addAgentEvent({ id: `evt-${Date.now()}-err`, agent: "scout", status: "failed", message: "Agent run failed.", timestamp: new Date().toISOString() });
    } finally {
      setIsRunning(false);
      setAgentRunning(false);
    }
  };

  const handlePrepare = async (job: any) => {
    // Create application entry
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, status: "discovered" }),
      });
    } catch (e) {}

    // Navigate to resumes page (or trigger inline)
    window.location.href = `/resumes?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}&jobCompany=${encodeURIComponent(job.company)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {state.user?.name ? `Welcome back, ${state.user.name}` : "Dashboard"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your AI-powered job hunting command center
          </p>
        </div>
        <button
          onClick={handleRunAgents}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-indigo)] to-[var(--color-cyan)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Agents Running...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" /> Run AI Agents
            </>
          )}
        </button>
      </div>

      {agentError && (
        <div className="rounded-lg border border-[var(--color-rose)]/30 bg-[var(--color-rose-bg)] px-4 py-3 text-sm text-[var(--color-rose)]">
          {agentError}
        </div>
      )}

      {/* Pipeline Stats */}
      <PipelineStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Briefing + Activity */}
        <div className="col-span-1 space-y-6">
          <MorningBriefing />
          <AgentActivityFeed />
        </div>

        {/* Right - Top Matches */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Top Matches
            </h2>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-sm text-[var(--color-indigo)] hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {topJobs.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-[var(--color-text-muted)] mb-3" />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                No jobs discovered yet
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Click &ldquo;Run AI Agents&rdquo; to start discovering opportunities
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {topJobs.map((job, i) => (
                <JobMatchCard
                  key={job.id}
                  job={job}
                  index={i}
                  onPrepare={handlePrepare}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
