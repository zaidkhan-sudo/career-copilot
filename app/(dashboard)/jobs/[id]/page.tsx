"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useAuthContext } from "@/lib/firebase/auth-context";
import {
  ArrowLeft,
  Flame,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Zap,
  PenTool,
  FileText,
  Target,
  Loader2,
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
} from "lucide-react";

type ApplyPhase = "idle" | "generating" | "review" | "ready";

export default function JobDetailPage() {
  const params = useParams();
  const { state } = useStore();
  const { getIdToken } = useAuthContext();
  const job = state.jobs.find((j) => j.id === params.id);
  const isInitialized = state.initialized;
  const [applyPhase, setApplyPhase] = useState<ApplyPhase>("idle");
  const [generatedResume, setGeneratedResume] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  if (!job && !isInitialized) {
    return (
      <div className="flex h-96 items-center justify-center text-[var(--color-text-muted)]">
        Loading job...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-96 items-center justify-center text-[var(--color-text-muted)]">
        Job not found
      </div>
    );
  }

  const handleApply = async () => {
    setApplyPhase("generating");
    setApplyError(null);
    
    try {
      const token = await getIdToken();
      if (!token) {
        setApplyPhase("idle");
        setApplyError("Please sign in to generate a resume.");
        return;
      }

      const response = await fetch("/api/agents/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          jobDescription: job.description,
          jobCompany: job.company,
          jobSkills: requiredSkills,
        }),
      });

      if (!response.ok) {
        throw new Error("Resume generation failed");
      }

      const data = await response.json();
      const content = data?.data?.content || "";
      const coverLetter = data?.data?.cover_letter || "";

      if (!content) {
        throw new Error("Resume content missing");
      }

      setGeneratedResume(content);
      setGeneratedCoverLetter(coverLetter);
      setApplyPhase("review");
    } catch (error) {
      console.error("Resume generation error:", error);
      setApplyPhase("idle");
      setApplyError("Failed to generate resume. Please try again.");
    }
  };

  const handleFinalize = () => {
    setApplyPhase("ready");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requiredSkills = job.extractedSkills || [];
  const niceToHaveSkills: string[] = [];
  const hiddenRequirements = job.hiddenRequirements || [];
  const scores = job.scores || {
    skills: 0,
    culture: 0,
    trajectory: 0,
    composite: 0,
  };

  // Apply Modal/Panel
  const renderApplyFlow = () => {
    if (applyPhase === "idle") return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setApplyPhase("idle")}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6"
          >
            {/* Close button */}
            <button
              onClick={() => setApplyPhase("idle")}
              className="absolute right-4 top-4 rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Generating Phase */}
            {applyPhase === "generating" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[var(--color-indigo)]" />
                <h2 className="mt-4 text-xl font-bold">Writer Agent Working...</h2>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Generating tailored resume and cover letter for {job.company}
                </p>
                <div className="mt-6 space-y-2 text-left">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    ✅ Analyzing job requirements...
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    ✅ Matching your skills to requirements...
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] animate-pulse">
                    📝 Crafting optimized resume...
                  </p>
                </div>
              </div>
            )}

            {/* Review Phase - HITL Split View */}
            {applyPhase === "review" && (
              <div>
                <h2 className="mb-4 text-xl font-bold">
                  Review Materials for {job.title} @ {job.company}
                </h2>
                <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                  <span className="rounded bg-[var(--color-indigo-bg)] px-2 py-0.5 text-[var(--color-indigo)]">
                    Human-in-the-loop
                  </span>{" "}
                  Review and edit before finalizing
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Job Description */}
                  <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-4">
                    <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">
                      📋 Job Description
                    </h3>
                    <div className="max-h-64 overflow-y-auto text-sm text-[var(--color-text-secondary)]">
                      {job.description}
                    </div>
                  </div>

                  {/* Generated Resume */}
                  <div className="rounded-lg border border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)]/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--color-indigo)]">
                        📄 AI-Generated Resume
                      </h3>
                      <button
                        onClick={() => handleCopy(generatedResume)}
                        className="flex items-center gap-1 text-xs text-[var(--color-indigo)] hover:underline"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <textarea
                      value={generatedResume}
                      onChange={(e) => setGeneratedResume(e.target.value)}
                      className="h-64 w-full resize-none rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] p-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-indigo)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="mt-4 rounded-lg border border-[var(--color-emerald-border)] bg-[var(--color-emerald-bg)]/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--color-emerald)]">
                      ✉️ Cover Letter
                    </h3>
                    <button
                      onClick={() => handleCopy(generatedCoverLetter)}
                      className="flex items-center gap-1 text-xs text-[var(--color-emerald)] hover:underline"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <textarea
                    value={generatedCoverLetter}
                    onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                    className="h-40 w-full resize-none rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] p-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-emerald)] focus:outline-none"
                  />
                </div>

                {/* Optimization Highlights */}
                <div className="mt-4 rounded-lg bg-[var(--color-bg-card)] p-4">
                  <h4 className="mb-2 text-xs font-semibold text-[var(--color-text-muted)]">
                    🎯 AI Optimizations Made
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[var(--color-indigo-bg)] px-2 py-1 text-[10px] text-[var(--color-indigo)]">
                      Emphasized: {requiredSkills[0] || "Key skills"}
                    </span>
                    <span className="rounded-full bg-[var(--color-indigo-bg)] px-2 py-1 text-[10px] text-[var(--color-indigo)]">
                      Added metrics to experience
                    </span>
                    <span className="rounded-full bg-[var(--color-indigo-bg)] px-2 py-1 text-[10px] text-[var(--color-indigo)]">
                      Matched job keywords
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setApplyPhase("idle")}
                    className="rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalize}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-emerald)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--color-emerald-hover)]"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Finalize
                  </button>
                </div>
              </div>
            )}

            {/* Ready Phase */}
            {applyPhase === "ready" && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-emerald-bg)]">
                  <CheckCircle2 className="h-8 w-8 text-[var(--color-emerald)]" />
                </div>
                <h2 className="text-xl font-bold">Materials Ready!</h2>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Your tailored resume and cover letter are ready for {job.company}
                </p>

                <div className="mt-6 flex justify-center gap-3">
                  <button className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)]">
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-indigo)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <ExternalLink className="h-4 w-4" /> Apply on Site
                  </a>
                </div>

                <div className="mt-6 rounded-lg bg-[var(--color-bg-card)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    🔗 Tracking Link:{" "}
                    <code className="rounded bg-[var(--color-indigo-bg)] px-2 py-0.5 text-[var(--color-indigo)]">
                      cp.io/track/{job.id.slice(0, 8)}
                    </code>
                  </p>
                </div>

                <button
                  onClick={() => {
                    setApplyPhase("idle");
                    // In real app, would mark as "Applied" in state/DB
                  }}
                  className="mt-6 text-sm text-[var(--color-indigo)] hover:underline"
                >
                  Mark as Applied & Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      {renderApplyFlow()}
      
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl space-y-6"
      >
        {applyError && (
          <div className="rounded-lg border border-[var(--color-rose)]/30 bg-[var(--color-rose-bg)] px-4 py-3 text-sm text-[var(--color-rose)]">
            {applyError}
          </div>
        )}
        {/* Back + Title */}
        <div>
          <Link
            href="/jobs"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {job.isFresh && (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--color-rose-bg)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-rose)]">
                    <Flame className="h-3 w-3" /> NEW
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {job.title} — {job.company}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> {job.salary}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Posted {getTimeAgo(job.postedAt)}
                </span>
              </div>
            </div>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20"
            >
              <Zap className="h-4 w-4" /> Apply
            </button>
          </div>
        </div>

        {/* Match Breakdown */}
        <div className="glass-card p-6">
          <h2 className="mb-5 text-base font-semibold">Match Breakdown</h2>
          <div className="space-y-5">
            <ScoreBar label="Skills Match" score={scores.skills}>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {requiredSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-emerald)]"
                  >
                    <CheckCircle2 className="mr-0.5 inline h-3 w-3" /> {s}
                  </span>
                ))}
                {niceToHaveSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-[var(--color-amber-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-amber)]"
                  >
                    <XCircle className="mr-0.5 inline h-3 w-3" /> {s}
                  </span>
                ))}
              </div>
            </ScoreBar>

            <ScoreBar label="Culture Fit" score={scores.culture}>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Glassdoor: 4.2★ • Work-Life Balance: 3.8 • Engineering
                Culture: A+
              </p>
            </ScoreBar>

            <ScoreBar label="Career Trajectory" score={scores.trajectory}>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                &ldquo;This role builds directly toward your goal of technical
                leadership in distributed systems.&rdquo;
              </p>
            </ScoreBar>
          </div>
        </div>

        {/* Hidden Requirements */}
        {hiddenRequirements.length > 0 && (
          <div className="glass-card border-[var(--color-amber)]/20 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <AlertTriangle className="h-5 w-5 text-[var(--color-amber)]" />
              Hidden Requirements
            </h2>
            <div className="space-y-3">
              {hiddenRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg bg-[var(--color-bg-card)] p-3"
                >
                  <span
                    className={`mt-0.5 text-xs ${
                      req.severity === "critical"
                        ? "text-[var(--color-rose)]"
                        : req.severity === "warning"
                          ? "text-[var(--color-amber)]"
                          : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {req.severity === "critical"
                      ? "🔴"
                      : req.severity === "warning"
                        ? "🟡"
                        : "🔵"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {req.signal}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      → {req.interpretation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        <div className="glass-card border-[var(--color-indigo-border)] p-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-5 w-5 text-[var(--color-indigo)]" />
            AI Reasoning
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            &ldquo;{job.aiReasoning || ""}&rdquo;
          </p>
        </div>

        {/* Description */}
        <div className="glass-card p-6">
          <h2 className="mb-3 text-base font-semibold">Job Description</h2>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {job.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleApply}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-indigo-hover)]"
          >
            <PenTool className="h-4 w-4" /> Generate Resume
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-border-hover)]">
            <FileText className="h-4 w-4" /> Draft Cover Letter
          </button>
          <Link href="/interview/session">
            <button className="flex items-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-border-hover)]">
              <Target className="h-4 w-4" /> Mock Interview
            </button>
          </Link>
        </div>
      </motion.div>
    </>
  );
}

function ScoreBar({
  label,
  score,
  children,
}: {
  label: string;
  score: number;
  children?: React.ReactNode;
}) {
  const color =
    score >= 85
      ? "var(--color-emerald)"
      : score >= 70
        ? "var(--color-amber)"
        : "var(--color-text-muted)";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-input)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {children}
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
