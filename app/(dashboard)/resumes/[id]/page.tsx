"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Download,
  FileText,
  PenTool,
  Loader2,
  Maximize2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, useStoreActions } from "@/lib/store";

export default function ResumeEditorPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const { state } = useStore();
  const { updateResume } = useStoreActions();

  const resume = state.resumes.find((r) => r.id === resumeId);
  const job = resume?.jobId ? state.jobs.find((j) => j.id === resume.jobId) : null;

  const [content, setContent] = useState(resume?.content || "");
  const [coverLetter, setCoverLetter] = useState(resume?.coverLetter || "");
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (resume) {
      setContent(resume.content || "");
      setCoverLetter(resume.coverLetter || "");
    }
  }, [resume]);

  const handleSave = async (status?: string) => {
    setSaving(true);
    try {
      await fetch("/api/resumes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resumeId,
          content,
          coverLetter,
          status: status || resume?.status || "draft",
        }),
      });
      updateResume(resumeId, {
        content,
        coverLetter,
        status: (status || resume?.status || "draft") as any,
      });
    } catch (e) {
      console.error("Save error:", e);
    }
    setSaving(false);
  };

  if (!resume) {
    return (
      <div className="glass-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Resume not found</h3>
        <Link href="/resumes" className="mt-2 text-sm text-[var(--color-indigo)] hover:underline">
          Back to Resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/resumes">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
              {resume.jobTitle || "Resume"} — {resume.jobCompany || "Editor"}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Strategy: {resume.framingStrategy} · {resume.status === "ready" ? "✅ Ready" : "📝 Draft"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)]"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave("ready")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-emerald)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-emerald-hover)]"
          >
            <CheckCircle2 className="h-3 w-3" /> Mark Ready
          </button>
        </div>
      </div>

      {/* Split Screen */}
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-220px)]">
        {/* Left: Job Description */}
        <div className="glass-card p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--color-border-default)]">
            <FileText className="h-4 w-4 text-[var(--color-amber)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Job Description</h3>
          </div>
          {job ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-base font-bold text-[var(--color-text-primary)]">{job.title}</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">{job.company} · {job.location}</p>
              </div>
              {job.salary && (
                <p className="text-sm text-[var(--color-emerald)]">{job.salary}</p>
              )}
              <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
              {job.extractedSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.extractedSkills.map((skill: string) => (
                    <span key={skill} className="rounded-full bg-[var(--color-bg-card)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              Job details not available. The AI generated this resume based on the description provided during generation.
            </p>
          )}
        </div>

        {/* Right: Editor */}
        <div className="glass-card overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border-default)]">
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                activeTab === "resume"
                  ? "text-[var(--color-indigo)] border-b-2 border-[var(--color-indigo)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <PenTool className="h-3 w-3" /> Resume
            </button>
            <button
              onClick={() => setActiveTab("cover")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                activeTab === "cover"
                  ? "text-[var(--color-indigo)] border-b-2 border-[var(--color-indigo)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <FileText className="h-3 w-3" /> Cover Letter
            </button>
          </div>

          {/* Editor Area */}
          <textarea
            value={activeTab === "resume" ? content : coverLetter}
            onChange={(e) => {
              if (activeTab === "resume") setContent(e.target.value);
              else setCoverLetter(e.target.value);
            }}
            className="flex-1 w-full bg-transparent p-5 text-sm text-[var(--color-text-primary)] outline-none resize-none leading-relaxed font-mono"
            placeholder={activeTab === "resume" ? "AI-generated resume content..." : "AI-generated cover letter..."}
          />
        </div>
      </div>
    </div>
  );
}
