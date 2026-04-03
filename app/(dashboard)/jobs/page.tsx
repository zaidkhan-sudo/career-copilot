"use client";

/**
 * Jobs Page — Enhanced
 * =====================
 * Displays jobs from all sources with action buttons:
 * Write Mail, Create Resume, Interview Prep
 */

import { motion } from "framer-motion";
import {
  MapPin,
  DollarSign,
  ArrowUpDown,
  ExternalLink,
  Flame,
  Mail,
  FileText,
  Target,
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Briefcase,
  Globe,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useStore, useStoreActions } from "@/lib/store";
import ComposeMailModal from "@/components/ui/compose-mail-modal";
import ResumeBuilderModal from "@/components/ui/resume-builder-modal";

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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function JobsPage() {
  const { state } = useStore();
  const { setJobs } = useStoreActions();
  const [sortBy, setSortBy] = useState<"match" | "date">("match");
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterFresh, setFilterFresh] = useState(false);
  const [filterSource, setFilterSource] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal state
  const [mailJob, setMailJob] = useState<any>(null);
  const [resumeJob, setResumeJob] = useState<any>(null);

  useEffect(() => {
    if (state.jobs.length === 0) {
      fetch("/api/jobs")
        .then((r) => r.json())
        .then(({ data }) => {
          if (data?.length) setJobs(data);
        })
        .catch(() => {});
    }
  }, []);

  // Get unique sources
  const sources = useMemo(
    () => [...new Set(state.jobs.map((j) => j.source))],
    [state.jobs]
  );

  // Filter and sort
  const jobs = useMemo(() => {
    let filtered = [...state.jobs];
    if (filterRemote) filtered = filtered.filter((j) => j.isRemote);
    if (filterFresh) filtered = filtered.filter((j) => j.isFresh);
    if (filterSource) filtered = filtered.filter((j) => j.source === filterSource);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }
    if (sortBy === "match")
      filtered.sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0));
    else
      filtered.sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    return filtered;
  }, [state.jobs, filterRemote, filterFresh, filterSource, searchQuery, sortBy]);

  const scoreColorMap = {
    emerald: "bg-[var(--color-emerald)]",
    amber: "bg-[var(--color-amber)]",
    rose: "bg-[var(--color-rose)]",
  } as const;

  const getScoreColorKey = (value: number) =>
    value >= 85 ? "emerald" : value >= 70 ? "amber" : "rose";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          <Briefcase className="inline h-6 w-6 mr-2" />
          Job Opportunities
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {state.jobs.length} jobs from {sources.length} sources
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, company, or location..."
            className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] pl-11 pr-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton active={filterRemote} onClick={() => setFilterRemote(!filterRemote)}>
            <Globe className="h-3.5 w-3.5" /> Remote
          </FilterButton>
          <FilterButton active={filterFresh} onClick={() => setFilterFresh(!filterFresh)}>
            <Flame className="h-3.5 w-3.5" /> Fresh (&lt;24h)
          </FilterButton>

          {/* Source filters */}
          {sources.map((src) => (
            <FilterButton
              key={src}
              active={filterSource === src}
              onClick={() => setFilterSource(filterSource === src ? "" : src)}
              color={SOURCE_COLORS[src]}
            >
              {src}
            </FilterButton>
          ))}

          <div className="ml-auto">
            <button
              onClick={() => setSortBy(sortBy === "match" ? "date" : "match")}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)]"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort: {sortBy === "match" ? "Match %" : "Date"}
            </button>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            No jobs found
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {searchQuery || filterRemote || filterFresh || filterSource
              ? "Try adjusting your filters"
              : 'Click "Run AI Agents" on the dashboard to discover jobs'}
          </p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {jobs.map((job) => {
            const expanded = expandedId === job.id;
            const score = job.scores?.composite || 0;
            const scoreColor = score >= 85 ? "emerald" : score >= 70 ? "amber" : "rose";

            return (
              <motion.div key={job.id} variants={item}>
                <div
                  className={`glass-card group overflow-hidden transition-all hover:border-[var(--color-border-hover)] ${
                    expanded ? "ring-1 ring-[var(--color-indigo)]/30" : ""
                  }`}
                >
                  {/* Source indicator */}
                  <div
                    className="h-0.5"
                    style={{ background: SOURCE_COLORS[job.source] || "#6366f1" }}
                  />

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {job.isFresh && (
                            <span className="flex items-center gap-1 rounded-full bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-emerald)]">
                              <Zap className="h-2.5 w-2.5" /> NEW
                            </span>
                          )}
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              background: `${SOURCE_COLORS[job.source] || "#6366f1"}20`,
                              color: SOURCE_COLORS[job.source] || "#6366f1",
                            }}
                          >
                            {job.source}
                          </span>
                          {job.isRemote && (
                            <span className="rounded-full bg-[var(--color-cyan-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-cyan)]">
                              🌐 Remote
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[var(--color-text-primary)] line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">{job.company}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1 text-[var(--color-emerald)]">
                              <DollarSign className="h-3 w-3" /> {job.salary}
                            </span>
                          )}
                          <span>{getTimeAgo(job.postedAt)}</span>
                        </div>

                        {/* Skills chips */}
                        {job.extractedSkills && job.extractedSkills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.extractedSkills.slice(0, 6).map((s) => (
                              <span
                                key={s}
                                className="rounded-md bg-[var(--color-bg-card)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]"
                              >
                                {s}
                              </span>
                            ))}
                            {job.extractedSkills.length > 6 && (
                              <span className="text-[10px] text-[var(--color-text-muted)]">
                                +{job.extractedSkills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Score bars */}
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
                                <div className="h-1 rounded-full bg-[var(--color-bg-elevated)]">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      scoreColorMap[getScoreColorKey(dim.value)]
                                    }`}
                                    style={{ width: `${dim.value}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Score Ring */}
                      <div className="shrink-0 text-center">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[var(--color-${scoreColor})] bg-[var(--color-${scoreColor}-bg)]`}
                        >
                          <span className={`text-lg font-bold text-[var(--color-${scoreColor})]`}>
                            {score}
                          </span>
                        </div>
                        <span className="mt-1 text-[10px] text-[var(--color-text-muted)]">match</span>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 space-y-3"
                      >
                        {/* AI Reasoning */}
                        {(job.aiReasoning || (job as any).ai_reasoning) && (
                          <div className="rounded-xl bg-[var(--color-indigo-bg)] border border-[var(--color-indigo-border)] p-4">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Brain className="h-3.5 w-3.5 text-[var(--color-indigo)]" />
                              <span className="text-xs font-semibold text-[var(--color-indigo)]">
                                AI Analysis
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                              {job.aiReasoning || (job as any).ai_reasoning}
                            </p>
                          </div>
                        )}

                        {/* Hidden Requirements */}
                        {job.hiddenRequirements && job.hiddenRequirements.length > 0 && (
                          <div className="space-y-1">
                            {job.hiddenRequirements.map((req: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 rounded-lg bg-[var(--color-bg-card)] px-3 py-2 text-xs"
                              >
                                <span className="text-[var(--color-amber)]">⚠</span>
                                <span className="text-[var(--color-text-secondary)]">
                                  <strong>{req.signal}</strong> — {req.interpretation}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Description preview */}
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                          {(job.description || "").slice(0, 400)}
                          {(job.description || "").length > 400 ? "..." : ""}
                        </p>
                      </motion.div>
                    )}

                    {/* Actions Bar */}
                    <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border-subtle)] pt-3">
                      <button
                        onClick={() => setExpandedId(expanded ? null : job.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]"
                      >
                        {expanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        {expanded ? "Less" : "More"}
                      </button>

                      <div className="flex-1" />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMailJob(job);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-[var(--color-cyan-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/20"
                      >
                        <Mail className="h-3 w-3" /> Write Mail
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeJob(job);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-[var(--color-emerald-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-emerald)] transition-all hover:bg-[var(--color-emerald)]/20"
                      >
                        <FileText className="h-3 w-3" /> Create Resume
                      </button>

                      <Link href={`/interview?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}&jobCompany=${encodeURIComponent(job.company)}`}>
                        <button className="flex items-center gap-1.5 rounded-lg bg-[var(--color-indigo-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-indigo)] transition-all hover:bg-[var(--color-indigo)]/20">
                          <Target className="h-3 w-3" /> Interview Prep
                        </button>
                      </Link>

                      {(job.url || (job as any).sourceUrl) && (
                        <a
                          href={job.url || (job as any).sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                        >
                          <ExternalLink className="h-3 w-3" /> Apply
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

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

// ============================================
// Helper Components
// ============================================

function FilterButton({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
        active
          ? "border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)] text-[var(--color-indigo)]"
          : "border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
      }`}
      style={
        active && color
          ? { borderColor: `${color}50`, background: `${color}15`, color }
          : undefined
      }
    >
      {children}
    </button>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
