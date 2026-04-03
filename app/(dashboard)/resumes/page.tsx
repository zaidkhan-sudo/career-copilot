"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  PenTool,
  Trash2,
  Download,
  Eye,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useStore, useStoreActions } from "@/lib/store";
import Link from "next/link";

export default function ResumesPage() {
  const searchParams = useSearchParams();
  const { state } = useStore();
  const { setResumes, addResume } = useStoreActions();
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genForm, setGenForm] = useState({
    jobTitle: searchParams.get("jobTitle") || "",
    jobCompany: searchParams.get("jobCompany") || "",
    jobId: searchParams.get("jobId") || "",
    jobDescription: "",
  });

  // Open generator if we came from dashboard with params
  useEffect(() => {
    if (searchParams.get("jobTitle")) {
      setShowGenerator(true);
      // Try to find job description from store
      const jobId = searchParams.get("jobId");
      if (jobId) {
        const job = state.jobs.find((j) => j.id === jobId);
        if (job) {
          setGenForm((f) => ({ ...f, jobDescription: job.description || "" }));
        }
      }
    }
  }, [searchParams]);

  // Fetch resumes
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/resumes");
      const { data } = await res.json();
      if (data?.length) setResumes(data);
    }
    if (state.resumes.length === 0) load();
  }, []);

  const handleGenerate = async () => {
    if (!genForm.jobTitle || !genForm.jobDescription) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/agents/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: genForm.jobId,
          jobTitle: genForm.jobTitle,
          jobCompany: genForm.jobCompany,
          jobDescription: genForm.jobDescription,
        }),
      });

      const { data } = await res.json();
      if (data) {
        addResume({
          id: data.id,
          jobId: data.job_id || genForm.jobId,
          jobTitle: genForm.jobTitle,
          jobCompany: genForm.jobCompany,
          framingStrategy: data.framing_strategy || "general",
          content: data.content || "",
          coverLetter: data.cover_letter || "",
          status: "draft",
          callbackCount: 0,
          totalSent: 0,
          createdAt: new Date().toISOString(),
        });
        setShowGenerator(false);
        setGenForm({ jobTitle: "", jobCompany: "", jobId: "", jobDescription: "" });
      }
    } catch (error) {
      console.error("Resume generation failed:", error);
    }
    setGenerating(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any; label: string }> = {
      draft: { color: "amber", icon: PenTool, label: "Draft" },
      ready: { color: "emerald", icon: CheckCircle2, label: "Ready" },
      applied: { color: "indigo", icon: CheckCircle2, label: "Applied" },
    };
    const info = map[status] || map.draft;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[var(--color-${info.color}-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-${info.color})]`}>
        <info.icon className="h-2.5 w-2.5" /> {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Resumes</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">AI-generated, tailored for each opportunity</p>
        </div>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)]"
        >
          <Plus className="h-4 w-4" /> Generate New
        </button>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-2 border-[var(--color-indigo-border)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[var(--color-indigo)]" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Generate Tailored Resume</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Job Title *</label>
              <input
                value={genForm.jobTitle}
                onChange={(e) => setGenForm({ ...genForm, jobTitle: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-indigo)]"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Company</label>
              <input
                value={genForm.jobCompany}
                onChange={(e) => setGenForm({ ...genForm, jobCompany: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-indigo)]"
                placeholder="e.g. Stripe"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Job Description *</label>
            <textarea
              value={genForm.jobDescription}
              onChange={(e) => setGenForm({ ...genForm, jobDescription: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-indigo)] resize-none"
              placeholder="Paste the job description here..."
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating || !genForm.jobTitle || !genForm.jobDescription}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-indigo)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Resume & Cover Letter
                </>
              )}
            </button>
            <button
              onClick={() => setShowGenerator(false)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Resume List */}
      {state.resumes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">No resumes yet</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Generate a tailored resume by clicking &ldquo;Generate New&rdquo; above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {state.resumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 group hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {resume.jobTitle || "General Resume"}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {resume.jobCompany || "Various companies"}
                  </p>
                </div>
                {statusBadge(resume.status)}
              </div>

              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Strategy: <span className="text-[var(--color-text-secondary)]">{resume.framingStrategy || "—"}</span>
              </p>

              {/* Content Preview */}
              <div className="rounded-lg bg-[var(--color-bg-card)] p-3 mb-3 max-h-24 overflow-hidden relative">
                <p className="text-[11px] text-[var(--color-text-muted)] whitespace-pre-line leading-relaxed">
                  {(resume.content || "No content generated yet.").slice(0, 300)}...
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                  <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                  {resume.totalSent > 0 && (
                    <span>Sent: {resume.totalSent}</span>
                  )}
                  {resume.callbackCount > 0 && (
                    <span className="text-[var(--color-emerald)]">
                      Callbacks: {resume.callbackCount}
                    </span>
                  )}
                </div>
                <Link href={`/resumes/${resume.id}`}>
                  <button className="flex items-center gap-1 text-xs text-[var(--color-indigo)] hover:underline">
                    <Eye className="h-3 w-3" /> Edit
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
