"use client";

/**
 * Compose Mail Modal
 * ===================
 * AI-powered email composer for job applications.
 */

import { useState } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Eye,
} from "lucide-react";

interface ComposeMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    description?: string;
    extractedSkills?: string[];
  };
  userName?: string;
  userSkills?: string[];
}

export default function ComposeMailModal({
  isOpen,
  onClose,
  job,
  userName,
  userSkills,
}: ComposeMailModalProps) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [plainText, setPlainText] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          jobCompany: job.company,
          jobDescription: job.description,
          userName: userName || "",
          userSkills: userSkills || job.extractedSkills || [],
          customMessage,
          mode: "generate",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubject(data.data.subject);
        setBody(data.data.body);
        setPlainText(data.data.plainText);
        setGenerated(true);
      } else {
        setError(data.error || "Failed to generate email");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      setError("Please enter a recipient email");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          jobCompany: job.company,
          jobDescription: job.description,
          recipientEmail,
          subject,
          body,
          plainText,
          userName: userName || "",
          userSkills: userSkills || [],
          mode: "send",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "Failed to send email");
      }
    } catch {
      setError("Network error");
    }
    setSending(false);
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-default)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-cyan-bg)]">
                <Mail className="h-5 w-5 text-[var(--color-cyan)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Compose Application
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {job.title} at {job.company}
                </p>
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
          <div className="overflow-y-auto p-5" style={{ maxHeight: "calc(90vh - 140px)" }}>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-emerald-bg)] mb-4">
                  <CheckCircle2 className="h-8 w-8 text-[var(--color-emerald)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Email Sent!</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Your application for {job.title} at {job.company} has been sent.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-[var(--color-emerald)] px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Close
                </button>
              </div>
            ) : !generated ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Additional context (optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add any specific points you want to highlight..."
                    className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)] focus:outline-none"
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-indigo)] px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Crafting email with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate AI Draft
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </div>

                {/* Toggle Edit/Preview */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreview(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      !preview
                        ? "bg-[var(--color-cyan-bg)] text-[var(--color-cyan)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => setPreview(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      preview
                        ? "bg-[var(--color-cyan-bg)] text-[var(--color-cyan)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>

                {/* Body */}
                {preview ? (
                  <div
                    className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] p-4 text-sm text-[var(--color-text-secondary)] prose prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
                  />
                ) : (
                  <textarea
                    value={plainText}
                    onChange={(e) => {
                      setPlainText(e.target.value);
                      const escaped = escapeHtml(e.target.value);
                      setBody(
                        `<p>${escaped
                          .replace(/\n\n/g, "</p><p>")
                          .replace(/\n/g, "<br>")}</p>`
                      );
                    }}
                    className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-cyan)] focus:outline-none font-mono"
                    rows={12}
                  />
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border-default)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-card)]"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Regenerate
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || !recipientEmail}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-indigo)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
