"use client";

/**
 * Resume Builder Modal
 * =====================
 * AI-powered resume generation with split view.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Download,
  Copy,
  Check,
} from "lucide-react";

interface ResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    description?: string;
    extractedSkills?: string[];
    location?: string;
    salary?: string;
  };
  userName?: string;
  userEmail?: string;
  userSkills?: string[];
}

export default function ResumeBuilderModal({
  isOpen,
  onClose,
  job,
  userName,
  userEmail,
  userSkills,
}: ResumeBuilderModalProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [strategy, setStrategy] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          jobCompany: job.company,
          jobDescription: job.description,
          jobSkills: job.extractedSkills,
          userName: userName || "",
          userEmail: userEmail || "",
          userSkills: userSkills || [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContent(data.data.content);
        setStrategy(data.data.strategy);
        setSaved(true);
      } else {
        setError(data.error || "Failed to generate resume");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Resume - ${userName || "Resume"} - ${job.title}</title>
        <style>
          body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1a1a1a; }
          h1 { font-size: 28px; border-bottom: 2px solid #333; padding-bottom: 8px; }
          h2 { font-size: 20px; color: #333; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          h3 { font-size: 16px; margin-top: 16px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 6px; }
          hr { border: 1px solid #ddd; margin: 24px 0; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body>${content
        .replace(/^# (.+)/gm, "<h1>$1</h1>")
        .replace(/^## (.+)/gm, "<h2>$1</h2>")
        .replace(/^### (.+)/gm, "<h3>$1</h3>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^- (.+)/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
        .replace(/^---$/gm, "<hr>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>")
      }</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Job Description */}
          <div className="hidden md:flex w-[40%] flex-col border-r border-[var(--color-border-default)] bg-[var(--color-bg-primary)]">
            <div className="border-b border-[var(--color-border-default)] p-4">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Job Description</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{job.title} at {job.company}</p>
            </div>
            <div className="overflow-y-auto p-4 text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {job.location && (
                <div className="mb-2 text-[var(--color-text-muted)]">📍 {job.location}</div>
              )}
              {job.salary && (
                <div className="mb-2 text-[var(--color-emerald)]">💰 {job.salary}</div>
              )}
              {job.extractedSkills && job.extractedSkills.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {job.extractedSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[var(--color-indigo-bg)] px-2 py-0.5 text-[10px] text-[var(--color-indigo)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap">
                {(job.description || "No description available").slice(0, 3000)}
              </p>
            </div>
          </div>

          {/* Right: Resume */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-emerald-bg)]">
                  <FileText className="h-5 w-5 text-[var(--color-emerald)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Resume Builder</h2>
                  {strategy && (
                    <p className="text-xs text-[var(--color-text-muted)]">Strategy: {strategy}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-[var(--color-bg-card)]"
              >
                <X className="h-5 w-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {!content && !loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-emerald-bg)] mb-4">
                    <FileText className="h-8 w-8 text-[var(--color-emerald)]" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                    AI-Tailored Resume
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
                    Generate a resume specifically crafted for {job.title} at {job.company}
                  </p>
                  {error && (
                    <p className="mt-3 text-sm text-red-400">{error}</p>
                  )}
                  <button
                    onClick={handleGenerate}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-cyan)] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg"
                  >
                    <Sparkles className="h-4 w-4" /> Generate Resume
                  </button>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[var(--color-emerald)] mb-4" />
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Crafting your tailored resume...
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    This may take 15-30 seconds
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {saved && (
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--color-emerald-bg)] border border-[var(--color-emerald)]/20 px-4 py-2 text-sm text-[var(--color-emerald)]">
                      <CheckCircle2 className="h-4 w-4" />
                      Resume saved to your profile
                    </div>
                  )}

                  {/* Resume content */}
                  <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] p-6">
                    <pre className="whitespace-pre-wrap text-sm text-[var(--color-text-secondary)] font-mono leading-relaxed">
                      {content}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border-default)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-card)]"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[var(--color-emerald)]" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border-default)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-card)]"
                    >
                      <Download className="h-3.5 w-3.5" /> Print/PDF
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-cyan)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                    >
                      <Sparkles className="h-4 w-4" /> Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
