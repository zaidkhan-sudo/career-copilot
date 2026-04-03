"use client";

/**
 * Quick Apply Component
 * ====================
 * URL input to quickly analyze any job posting.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react";

interface QuickApplyProps {
  onAnalyze?: (url: string) => Promise<void>;
}

export function QuickApply({ onAnalyze }: QuickApplyProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    setStatus("loading");
    setMessage("Analyzing job posting...");
    
    try {
      if (onAnalyze) {
        await onAnalyze(url);
      } else {
        // Simulate analysis
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      
      setStatus("success");
      setMessage("Job analyzed! Check your matches.");
      setUrl("");
      
      // Reset after delay
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
      
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Analysis failed");
      
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
        <Zap className="h-4 w-4 text-[var(--color-amber)]" />
        Quick Apply
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste job URL to analyze..."
            disabled={status === "loading"}
            className="h-10 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] pl-10 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <button
          type="submit"
          disabled={status === "loading" || !url.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-indigo)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] disabled:opacity-50"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Analyze & Match
            </>
          )}
        </button>
      </form>
      
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
              status === "success"
                ? "bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]"
                : status === "error"
                  ? "bg-[var(--color-rose-bg)] text-[var(--color-rose)]"
                  : "bg-[var(--color-cyan-bg)] text-[var(--color-cyan)]"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : status === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
