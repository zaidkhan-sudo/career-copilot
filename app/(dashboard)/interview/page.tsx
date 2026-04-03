"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Code2,
  Monitor,
  Mic,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Video,
  Dumbbell,
  Clock,
  Loader2,
  Target,
  Brain,
} from "lucide-react";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const modes = [
  {
    id: "oa",
    label: "OA Simulation",
    icon: Code2,
    desc: "Timed DSA problems at company-specific difficulty",
    color: "var(--color-cyan)",
    bg: "var(--color-cyan-bg)",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    icon: Mic,
    desc: "STAR-method practice with AI evaluation",
    color: "var(--color-emerald)",
    bg: "var(--color-emerald-bg)",
  },
];

export default function InterviewPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interview");
        const { data } = await res.json();
        if (data?.length) setSessions(data);
      } catch (e) {}
    }
    load();
  }, []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">🎯 Interview Simulator</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Practice with AI-powered company-specific simulations
        </p>
      </motion.div>

      {/* Company Input */}
      <motion.div variants={item} className="glass-card p-5">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          Which company are you preparing for?
        </label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full max-w-md rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-indigo)]"
          placeholder="e.g. Google, Stripe, Meta..."
        />
      </motion.div>

      {/* Mode Cards */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link
              href={`/interview/session?mode=${mode.id}&company=${encodeURIComponent(company || "General")}`}
              key={mode.id}
            >
              <div className="glass-card group cursor-pointer p-6 transition-all hover:border-[var(--color-indigo-border)] hover:shadow-lg h-full">
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ backgroundColor: mode.bg }}
                >
                  <Icon className="h-7 w-7" style={{ color: mode.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-indigo)]">
                  {mode.label}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {mode.desc}
                </p>
                <div className="mt-5">
                  <span
                    className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: mode.color }}
                  >
                    Start Session
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">📊 Your Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-[var(--color-bg-card)] p-4 text-center">
            <p className="text-3xl font-bold text-[var(--color-indigo)]">{sessions.length || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Sessions</p>
          </div>
          <div className="rounded-xl bg-[var(--color-bg-card)] p-4 text-center">
            <p className="text-3xl font-bold text-[var(--color-emerald)]">
              {sessions.length > 0
                ? Math.round(sessions.reduce((acc: number, s: any) => acc + (s.scores?.overall || 0), 0) / sessions.length)
                : 0}%
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Avg Score</p>
          </div>
          <div className="rounded-xl bg-[var(--color-bg-card)] p-4 text-center">
            <p className="text-3xl font-bold text-[var(--color-amber)]">
              {sessions.filter((s: any) => (s.scores?.overall || 0) >= 80).length}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Pass (80%+)</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">Recent Sessions</h2>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session: any) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--color-indigo-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-indigo)] uppercase">
                      {session.sessionType || session.session_type}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {session.company} — {session.role}
                    </span>
                  </div>
                  {(session.improvementNotes || session.improvement_notes) && (
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {session.improvementNotes || session.improvement_notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      (session.scores?.overall || 0) >= 80
                        ? "text-[var(--color-emerald)]"
                        : (session.scores?.overall || 0) >= 60
                          ? "text-[var(--color-amber)]"
                          : "text-[var(--color-rose)]"
                    }`}
                  >
                    {session.scores?.overall || "—"}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
