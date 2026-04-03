"use client";

/**
 * Resumes Page — Enhanced
 * ========================
 * Displays all saved resumes with preview, download, and copy.
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Briefcase,
  Loader2,
  Search,
  Target,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function ResumesPage() {
  const { state } = useStore();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load saved resumes
  useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        if (data.data?.length) {
          setResumes(
            data.data.map((r: any) => ({
              id: r.id,
              job_title: r.job_title || r.jobTitle || "",
              job_company: r.job_company || r.jobCompany || "",
              framing_strategy: r.framing_strategy || r.framingStrategy || "",
              content: r.content || "",
              created_at: r.created_at || r.createdAt || new Date().toISOString(),
            }))
          );
        } else {
          // Use store resumes as fallback
          setResumes(
            state.resumes.map((r: any) => ({
              id: r.id,
              job_title: r.targetRole || r.jobTitle || r.job_title,
              job_company: r.company || r.jobCompany || r.job_company,
              framing_strategy: r.framingStrategy || r.framing_strategy,
              content: r.content || "",
              created_at: r.createdAt || r.created_at || new Date().toISOString(),
            }))
          );
        }
      } catch {
        setResumes(
          state.resumes.map((r: any) => ({
            id: r.id,
            job_title: r.targetRole || r.jobTitle || r.job_title,
            job_company: r.company || r.jobCompany || r.job_company,
            framing_strategy: r.framingStrategy || r.framing_strategy,
            content: r.content || "",
            created_at: r.createdAt || r.created_at || new Date().toISOString(),
          }))
        );
      }
      setLoading(false);
    };
    loadResumes();
  }, [state.resumes]);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (resume: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const content = resume.content || "";
    win.document.write(`
      <html>
      <head>
        <title>Resume - ${resume.job_title} - ${resume.job_company}</title>
        <style>
          body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1a1a1a; }
          h1 { font-size: 28px; border-bottom: 2px solid #333; padding-bottom: 8px; }
          h2 { font-size: 20px; color: #333; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          h3 { font-size: 16px; margin-top: 16px; }
          ul { padding-left: 20px; } li { margin-bottom: 6px; }
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
        .replace(/^---$/gm, "<hr>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>")
      }</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const filtered = resumes.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.job_title || "").toLowerCase().includes(q) ||
      (r.job_company || "").toLowerCase().includes(q) ||
      (r.framing_strategy || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            <FileText className="inline h-6 w-6 mr-2" />
            My Resumes
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {resumes.length} tailored resume{resumes.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <Link href="/jobs">
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-cyan)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg">
            <Sparkles className="h-4 w-4" /> New Resume
          </button>
        </Link>
      </div>

      {/* Search */}
      {resumes.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes..."
            className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] pl-11 pr-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-emerald)] focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="glass-card p-16 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--color-emerald)] mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading resumes...</p>
        </div>
      ) : filtered.length === 0 && resumes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            No resumes yet
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Go to the Jobs page and click &quot;Create Resume&quot; on a job card to generate a tailored resume.
          </p>
          <Link href="/jobs">
            <button className="mt-4 rounded-xl bg-[var(--color-emerald)] px-5 py-2.5 text-sm font-semibold text-white">
              Browse Jobs
            </button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filtered.map((resume, i) => {
            const expanded = expandedId === resume.id;

            return (
              <motion.div
                key={resume.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden transition-all hover:border-[var(--color-border-hover)]"
              >
                {/* Gradient top */}
                <div className="h-0.5 bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-cyan)]" />

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-emerald)]">
                          {resume.framing_strategy || "Tailored"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                        <Briefcase className="inline h-3.5 w-3.5 mr-1.5" />
                        {resume.job_title || "Resume"}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {resume.job_company || "Company"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                        <Calendar className="h-2.5 w-2.5" />
                        {resume.created_at
                          ? new Date(
                              typeof resume.created_at === "object"
                                ? (resume.created_at as any)._seconds * 1000
                                : resume.created_at
                            ).toLocaleDateString()
                          : "Recently"}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(resume.id, resume.content || "")}
                        className="rounded-lg p-2 transition-colors hover:bg-[var(--color-bg-card)]"
                        title="Copy"
                      >
                        {copiedId === resume.id ? (
                          <Check className="h-4 w-4 text-[var(--color-emerald)]" />
                        ) : (
                          <Copy className="h-4 w-4 text-[var(--color-text-muted)]" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(resume)}
                        className="rounded-lg p-2 transition-colors hover:bg-[var(--color-bg-card)]"
                        title="Print/PDF"
                      >
                        <Download className="h-4 w-4 text-[var(--color-text-muted)]" />
                      </button>
                      <button
                        onClick={() => setExpandedId(expanded ? null : resume.id)}
                        className="rounded-lg p-2 transition-colors hover:bg-[var(--color-bg-card)]"
                        title={expanded ? "Collapse" : "Expand"}
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" />
                        ) : (
                          <Eye className="h-4 w-4 text-[var(--color-text-muted)]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  {!expanded && resume.content && (
                    <p className="mt-3 text-xs text-[var(--color-text-muted)] line-clamp-3 leading-relaxed">
                      {resume.content.slice(0, 300)}...
                    </p>
                  )}

                  {/* Full content */}
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] p-5 max-h-96 overflow-y-auto"
                    >
                      <pre className="whitespace-pre-wrap text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed">
                        {resume.content}
                      </pre>
                    </motion.div>
                  )}

                  {/* Interview prep link */}
                  {resume.job_title && resume.job_company && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2">
                      <Link
                        href={`/interview?jobTitle=${encodeURIComponent(resume.job_title)}&jobCompany=${encodeURIComponent(resume.job_company)}`}
                      >
                        <span className="flex items-center gap-1 rounded-lg bg-[var(--color-indigo-bg)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-indigo)] hover:bg-[var(--color-indigo)]/20 transition-colors">
                          <Target className="h-2.5 w-2.5" /> Interview Prep
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
