"use client";

import { motion } from "framer-motion";
import { Flame, MapPin, DollarSign, ArrowUpDown, Filter, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStore, useStoreActions } from "@/lib/store";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function JobsPage() {
  const { state } = useStore();
  const { setJobs } = useStoreActions();
  const [sortBy, setSortBy] = useState<"match" | "date">("match");
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterFresh, setFilterFresh] = useState(false);

  // Fetch jobs if not loaded yet
  useEffect(() => {
    if (state.jobs.length === 0) {
      fetch("/api/jobs").then((r) => r.json()).then(({ data }) => {
        if (data?.length) setJobs(data);
      }).catch(() => {});
    }
  }, []);

  let jobs = [...state.jobs];
  if (filterRemote) jobs = jobs.filter((j) => j.isRemote);
  if (filterFresh) jobs = jobs.filter((j) => j.isFresh);
  if (sortBy === "match") jobs.sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0));
  else jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header + Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">🔍 Jobs</h1>
        <div className="flex items-center gap-2">
          <FilterButton active={filterRemote} onClick={() => setFilterRemote(!filterRemote)}>
            <MapPin className="h-3.5 w-3.5" /> Remote
          </FilterButton>
          <FilterButton active={filterFresh} onClick={() => setFilterFresh(!filterFresh)}>
            <Flame className="h-3.5 w-3.5" /> Fresh (&lt;24h)
          </FilterButton>
          <button
            onClick={() => setSortBy(sortBy === "match" ? "date" : "match")}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)]"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort: {sortBy === "match" ? "Match %" : "Date"}
          </button>
        </div>
      </div>

      {/* Job Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {jobs.map((job) => (
          <motion.div key={job.id} variants={item}>
            <Link href={`/jobs/${job.id}`}>
              <div className="glass-card group cursor-pointer p-5 transition-all hover:border-[var(--color-indigo-border)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/5">
                <div className="flex items-start gap-5">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {job.isFresh && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--color-rose-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-rose)]">
                          <Flame className="h-3 w-3" /> NEW
                        </span>
                      )}
                      <span className="text-xs text-[var(--color-text-muted)]">{job.source}</span>
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-indigo)]">
                      {job.title} — {job.company}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> {job.salary}
                        </span>
                      )}
                      <span>Posted {getTimeAgo(job.postedAt)}</span>
                    </div>

                    {/* Score Chips */}
                    <div className="mt-3 flex items-center gap-2">
                      <ScoreChip label="Skills" score={job.scores?.skills || 0} />
                      <ScoreChip label="Culture" score={job.scores?.culture || 0} />
                      <ScoreChip label="Career" score={job.scores?.trajectory || 0} />
                      <span className="ml-1 text-sm font-bold text-[var(--color-text-primary)]">
                        Overall: {job.scores?.composite || 0}%
                      </span>
                    </div>

                    {/* Hidden Req */}
                    {(job.hiddenRequirements?.length || 0) > 0 && (
                      <p className="mt-3 text-xs text-[var(--color-amber)]">
                        ⚠️ {job.hiddenRequirements?.[0]?.signal} → {job.hiddenRequirements?.[0]?.interpretation}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      💡 {(job.aiReasoning || "No AI reasoning available.").slice(0, 120)}...
                    </p>
                  </div>

                  {/* Right: Score ring */}
                  <div className="shrink-0 text-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full border-3 ${
                        (job.scores?.composite || 0) >= 85
                          ? "border-[var(--color-emerald)] bg-[var(--color-emerald-bg)]"
                          : (job.scores?.composite || 0) >= 70
                            ? "border-[var(--color-amber)] bg-[var(--color-amber-bg)]"
                            : "border-[var(--color-text-muted)] bg-[var(--color-bg-card)]"
                      }`}
                    >
                      <span
                        className={`text-lg font-bold ${
                          (job.scores?.composite || 0) >= 85
                            ? "text-[var(--color-emerald)]"
                            : (job.scores?.composite || 0) >= 70
                              ? "text-[var(--color-amber)]"
                              : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {job.scores?.composite || 0}%
                      </span>
                    </div>
                    <span className="mt-1 text-[10px] text-[var(--color-text-muted)]">match</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border-subtle)] pt-3">
                  <span className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-indigo)]">
                    <ExternalLink className="h-3 w-3" /> View Details
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-[var(--color-indigo-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-indigo)]">
                    ⚡ Quick Apply
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-[var(--color-emerald-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-emerald)]">
                    🎯 Prep Interview
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function ScoreChip({ label, score }: { label: string; score: number }) {
  const color =
    score >= 85 ? "var(--color-emerald)" : score >= 70 ? "var(--color-amber)" : "var(--color-text-muted)";
  return (
    <span
      className="rounded-md px-2 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
    >
      {label}: {score}
    </span>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
        active
          ? "border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)] text-[var(--color-indigo)]"
          : "border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
      }`}
    >
      {children}
    </button>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
