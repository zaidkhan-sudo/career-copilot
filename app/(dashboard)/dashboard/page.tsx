"use client";

/**
 * Dashboard Page — Enhanced
 * ==========================
 * Main command center with source distribution, activity,
 * top matches, quick actions, and cron status.
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  FileText,
  Target,
  ChevronRight,
  Zap,
  RefreshCw,
  Loader2,
  MapPin,
  ArrowRight,
  Brain,
  AlertTriangle,
  Rocket,
  BarChart3,
  Star,
  Mail,
  Clock,
  Play,
  CheckCircle2,
  Timer,
  Globe,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useStore, useStoreActions } from "@/lib/store";
import ComposeMailModal from "@/components/ui/compose-mail-modal";
import ResumeBuilderModal from "@/components/ui/resume-builder-modal";

// ============================================
// Source Distribution Mini Chart
// ============================================

const SOURCE_COLORS: Record<string, string> = {
  Adzuna: "#22d3ee",
  JSearch: "#818cf8",
  "The Muse": "#f472b6",
  Freelancer: "#fb923c",
  Remotive: "#a78bfa",
  Arbeitnow: "#34d399",
  "HN Who's Hiring": "#fbbf24",
  Agent: "#6ee7b7",
};

function SourceDistribution() {
  const { state } = useStore();

  const distribution = state.jobs.reduce((acc, job) => {
    const src = job.source || "Other";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = state.jobs.length;

  if (total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-4 w-4 text-[var(--color-cyan)]" />
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Job Sources</h3>
        <span className="ml-auto text-xs text-[var(--color-text-muted)]">{total} total</span>
      </div>

      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        {entries.map(([source, count]) => (
          <div
            key={source}
            className="transition-all"
            style={{
              width: `${(count / total) * 100}%`,
              background: SOURCE_COLORS[source] || "#6b7280",
              minWidth: "4px",
            }}
            title={`${source}: ${count}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5">
        {entries.map(([source, count]) => (
          <div key={source} className="flex items-center gap-2 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ background: SOURCE_COLORS[source] || "#6b7280" }}
            />
            <span className="text-[var(--color-text-muted)] truncate">{source}</span>
            <span className="ml-auto font-semibold text-[var(--color-text-secondary)]">{count}</span>
          </div>
        ))}
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
    { label: "Jobs Found", value: state.jobs.length, icon: Briefcase, color: "indigo", href: "/jobs" },
    {
      label: "Applications",
      value: state.applications.filter((a) => a.status !== "discovered").length,
      icon: FileText,
      color: "amber",
      href: "/applications",
    },
    {
      label: "Interviews",
      value: state.applications.filter((a) => a.status === "interviewing").length,
      icon: Target,
      color: "cyan",
      href: "/interview",
    },
    {
      label: "Resumes",
      value: state.resumes.length,
      icon: FileText,
      color: "emerald",
      href: "/resumes",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Link key={stat.label} href={stat.href}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="glass-card p-4 cursor-pointer transition-all hover:border-[var(--color-border-hover)] group"
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
        </Link>
      ))}
    </div>
  );
}

// ============================================
// Quick Actions
// ============================================

function QuickActions({
  onScanNow,
  scanning,
}: {
  onScanNow: () => void;
  scanning: boolean;
}) {
  const [lastCron, setLastCron] = useState<any>(null);

  useEffect(() => {
    fetch("/api/cron/scan-jobs?manual=true&check=true")
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-[var(--color-amber)]" />
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Quick Actions</h3>
      </div>

      <div className="space-y-2">
        <button
          onClick={onScanNow}
          disabled={scanning}
          className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border-default)] p-3 transition-all hover:bg-[var(--color-bg-card)] hover:border-[var(--color-border-hover)]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-indigo)] to-[var(--color-cyan)]">
            {scanning ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {scanning ? "Scanning..." : "Scan Now"}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Search all 7 job sources
            </p>
          </div>
        </button>

        <Link href="/jobs">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] p-3 transition-all hover:bg-[var(--color-bg-card)] hover:border-[var(--color-border-hover)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-emerald-bg)]">
              <Briefcase className="h-4 w-4 text-[var(--color-emerald)]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">View Jobs</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Browse all discoveries</p>
            </div>
          </div>
        </Link>

        <Link href="/resumes">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] p-3 transition-all hover:bg-[var(--color-bg-card)] hover:border-[var(--color-border-hover)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-amber-bg)]">
              <FileText className="h-4 w-4 text-[var(--color-amber)]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">My Resumes</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">View saved resumes</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Cron Status */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--color-bg-card)] px-3 py-2">
        <Timer className="h-3 w-3 text-[var(--color-text-muted)]" />
        <span className="text-[10px] text-[var(--color-text-muted)]">
          Auto-scan every 6 hours
        </span>
        <div className="ml-auto h-2 w-2 rounded-full bg-[var(--color-emerald)] animate-pulse" />
      </div>
    </motion.div>
  );
}

// ============================================
// Morning Briefing
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
      console.error("Briefing error:", e);
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
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-indigo)] to-[var(--color-amber)]" />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-amber)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Morning Briefing</h3>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </button>
      </div>

      {loading && !briefing ? (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Loader2 className="h-3 w-3 animate-spin" /> Generating...
        </div>
      ) : briefing ? (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {briefing.summary || "No briefing available."}
          </p>
          {(briefing as any).market_insights?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(briefing as any).market_insights.slice(0, 3).map((insight: string, i: number) => (
                <span key={i} className="rounded-full bg-[var(--color-indigo-bg)] px-2.5 py-1 text-[10px] text-[var(--color-indigo)]">
                  <TrendingUp className="inline h-2.5 w-2.5 mr-1" />{insight}
                </span>
              ))}
            </div>
          )}
          {briefing.encouragement && (
            <p className="text-[10px] text-[var(--color-text-muted)] italic border-l-2 border-[var(--color-indigo)] pl-3">
              {briefing.encouragement}
            </p>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}

// ============================================
// Activity Feed
// ============================================

function ActivityFeed() {
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
        <Activity className="h-4 w-4 text-[var(--color-amber)]" />
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Agent Activity</h3>
        {state.agentRunning && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-emerald)]">
            <Loader2 className="h-2.5 w-2.5 animate-spin" /> Live
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
// Top Matches Card
// ============================================

function TopMatchCard({
  job,
  index,
  onMail,
  onResume,
}: {
  job: any;
  index: number;
  onMail: (j: any) => void;
  onResume: (j: any) => void;
}) {
  const score = job.scores?.composite || 0;
  const scoreColor = score >= 85 ? "emerald" : score >= 70 ? "amber" : "rose";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="glass-card group p-4 transition-all hover:border-[var(--color-border-hover)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {job.isFresh && (
              <span className="rounded-full bg-[var(--color-emerald-bg)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-emerald)]">
                NEW
              </span>
            )}
            <span className="text-[10px] text-[var(--color-text-muted)]">{job.source}</span>
          </div>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">{job.title}</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">{job.company}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
            <span><MapPin className="inline h-2.5 w-2.5" /> {job.location || "Remote"}</span>
            {job.salary && <span className="text-[var(--color-emerald)]">{job.salary}</span>}
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--color-${scoreColor})] bg-[var(--color-${scoreColor}-bg)] shrink-0`}>
          <span className={`text-sm font-bold text-[var(--color-${scoreColor})]`}>{score}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-3 flex items-center gap-1.5">
        <button
          onClick={() => onMail(job)}
          className="flex items-center gap-1 rounded-lg bg-[var(--color-cyan-bg)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-cyan)]"
        >
          <Mail className="h-2.5 w-2.5" /> Mail
        </button>
        <button
          onClick={() => onResume(job)}
          className="flex items-center gap-1 rounded-lg bg-[var(--color-emerald-bg)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-emerald)]"
        >
          <FileText className="h-2.5 w-2.5" /> Resume
        </button>
        <Link href={`/interview?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}&jobCompany=${encodeURIComponent(job.company)}`}>
          <span className="flex items-center gap-1 rounded-lg bg-[var(--color-indigo-bg)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-indigo)]">
            <Target className="h-2.5 w-2.5" /> Prep
          </span>
        </Link>
        <Link href={`/jobs/${job.id}`} className="ml-auto">
          <span className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            Details →
          </span>
        </Link>
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

  // Modal state
  const [mailJob, setMailJob] = useState<any>(null);
  const [resumeJob, setResumeJob] = useState<any>(null);

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
      addAgentEvent({
        id: `evt-${Date.now()}-1`,
        agent: "scout",
        status: "running",
        message: "Scanning 7 job sources...",
        timestamp: new Date().toISOString(),
      });

      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.user?.id || "demo",
          userProfile: {
            id: state.user?.id || "demo",
            email: state.user?.email || "demo@example.com",
            name: state.user?.name || "User",
            skills: (state.user?.skills || []).map((s: any) => ({
              name: s.name,
              level: s.level || "intermediate",
            })),
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
        setAgentError(data?.error || "Failed to run agents.");
        return;
      }

      addAgentEvent({
        id: `evt-${Date.now()}-2`,
        agent: "scout",
        status: "completed",
        message: `Found ${data.jobsFound || 0} jobs from all sources`,
        timestamp: new Date().toISOString(),
      });
      addAgentEvent({
        id: `evt-${Date.now()}-3`,
        agent: "analyzer",
        status: "completed",
        message: `Scored ${data.scoredJobs?.length || 0} matches`,
        timestamp: new Date().toISOString(),
      });

      if (data.scoredJobs?.length) {
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

        try {
          await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobs: transformed }),
          });
        } catch {}
      }
    } catch {
      setAgentError("Agent run failed. Please try again.");
    } finally {
      setIsRunning(false);
      setAgentRunning(false);
    }
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
              <Loader2 className="h-4 w-4 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" /> Run AI Agents
            </>
          )}
        </button>
      </div>

      {agentError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {agentError}
        </div>
      )}

      {/* Stats */}
      <PipelineStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <QuickActions onScanNow={handleRunAgents} scanning={isRunning} />
          <SourceDistribution />
          <ActivityFeed />
        </div>

        {/* Right Column — Top Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Top Matches</h2>
              <span className="rounded-full bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-emerald)]">
                {topJobs.filter((j) => (j.scores?.composite || 0) >= 80).length} high
              </span>
            </div>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-sm text-[var(--color-indigo)] hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <MorningBriefing />

          {topJobs.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-[var(--color-text-muted)] mb-3" />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                No jobs discovered yet
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Click &ldquo;Run AI Agents&rdquo; to scan all job sources
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {topJobs.map((job, i) => (
                <TopMatchCard
                  key={job.id}
                  job={job}
                  index={i}
                  onMail={setMailJob}
                  onResume={setResumeJob}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {mailJob && (
        <ComposeMailModal
          isOpen={!!mailJob}
          onClose={() => setMailJob(null)}
          job={mailJob}
          userName={state.user?.name}
          userSkills={state.user?.skills?.map((s: any) => s.name)}
        />
      )}
      {resumeJob && (
        <ResumeBuilderModal
          isOpen={!!resumeJob}
          onClose={() => setResumeJob(null)}
          job={resumeJob}
          userName={state.user?.name}
          userEmail={state.user?.email}
          userSkills={state.user?.skills?.map((s: any) => s.name)}
        />
      )}
    </div>
  );
}
