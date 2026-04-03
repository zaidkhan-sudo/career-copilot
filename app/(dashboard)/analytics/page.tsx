"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Briefcase,
  Send,
  Phone,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ghost,
  Loader2,
  Brain,
  Target,
  Lightbulb,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useStore, useStoreActions } from "@/lib/store";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// ============================================
// Outcome Entry Modal
// ============================================

function OutcomeEntryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state } = useStore();
  const { addOutcome } = useStoreActions();
  const [form, setForm] = useState({
    jobTitle: "",
    jobCompany: "",
    outcome: "rejected" as "offer" | "rejected" | "ghosted" | "withdrawn",
    rejectionReason: "",
    reachedStage: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const handleSubmit = async () => {
    if (!form.jobTitle || !form.outcome) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/agents/evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: form.jobTitle,
          jobCompany: form.jobCompany,
          outcome: form.outcome,
          rejectionReason: form.rejectionReason,
          reachedStage: form.reachedStage,
          notes: form.notes,
        }),
      });

      const { data, insights: recalInsights } = await res.json();

      addOutcome({
        id: data?.id || `out-${Date.now()}`,
        jobTitle: form.jobTitle,
        jobCompany: form.jobCompany,
        outcome: form.outcome,
        rejectionReason: form.rejectionReason,
        reachedStage: form.reachedStage,
        daysInPipeline: 0,
        notes: form.notes,
        recordedAt: new Date().toISOString(),
      });

      setInsights(recalInsights);
    } catch (e) {
      console.error("Outcome submission error:", e);
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg p-6 mx-4"
      >
        {!insights ? (
          <>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Record Outcome</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Job Title *</label>
                  <input
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-indigo)]"
                    placeholder="e.g. Senior SWE"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Company</label>
                  <input
                    value={form.jobCompany}
                    onChange={(e) => setForm({ ...form, jobCompany: e.target.value })}
                    className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-indigo)]"
                    placeholder="e.g. Stripe"
                  />
                </div>
              </div>

              {/* Outcome Type */}
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-2 block">Outcome *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "offer", label: "Offered", icon: CheckCircle2, color: "emerald" },
                    { value: "rejected", label: "Rejected", icon: XCircle, color: "rose" },
                    { value: "ghosted", label: "Ghosted", icon: Ghost, color: "amber" },
                    { value: "withdrawn", label: "Withdrawn", icon: ArrowRight, color: "indigo" },
                  ].map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setForm({ ...form, outcome: o.value as any })}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-all ${
                        form.outcome === o.value
                          ? `border-[var(--color-${o.color}-border)] bg-[var(--color-${o.color}-bg)] text-[var(--color-${o.color})]`
                          : "border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)]"
                      }`}
                    >
                      <o.icon className="h-4 w-4" />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rejection Reason */}
              {form.outcome === "rejected" && (
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Rejection Reason</label>
                  <select
                    value={form.rejectionReason}
                    onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })}
                    className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                  >
                    <option value="">Select reason</option>
                    <option value="skills_gap">Skills gap</option>
                    <option value="experience">Experience level mismatch</option>
                    <option value="culture_fit">Culture fit</option>
                    <option value="compensation">Compensation mismatch</option>
                    <option value="other_candidate">Chose another candidate</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              )}

              {/* Stage Reached */}
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Furthest Stage Reached</label>
                <select
                  value={form.reachedStage}
                  onChange={(e) => setForm({ ...form, reachedStage: e.target.value })}
                  className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                >
                  <option value="">Select stage</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="final_round">Final Round</option>
                  <option value="offer">Offer</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none resize-none"
                  placeholder="Any additional context..."
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.jobTitle}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-indigo)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                Analyze & Record
              </button>
            </div>
          </>
        ) : (
          /* Recalibration Results */
          <>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">🧠 Recalibration Insights</h2>

            {/* Patterns */}
            {insights.patterns?.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Detected Patterns</h3>
                {insights.patterns.map((p: any, i: number) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 ${
                      p.severity === "high" ? "bg-[var(--color-rose-bg)]" :
                      p.severity === "medium" ? "bg-[var(--color-amber-bg)]" :
                      "bg-[var(--color-bg-card)]"
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      p.severity === "high" ? "text-[var(--color-rose)]" :
                      p.severity === "medium" ? "text-[var(--color-amber)]" :
                      "text-[var(--color-text-primary)]"
                    }`}>{p.pattern}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{p.recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Strategy Updates */}
            {Object.keys(insights.strategyUpdates || {}).length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Agent Strategy Updates</h3>
                {Object.entries(insights.strategyUpdates).map(([agent, update]: [string, any]) => (
                  <div key={agent} className="flex items-start gap-2 rounded-lg bg-[var(--color-indigo-bg)] p-3">
                    <Target className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-indigo)]" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-indigo)] uppercase">{agent} Agent</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{update}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skill Gaps */}
            {insights.skillGaps?.length > 0 && (
              <div className="space-y-1 mb-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Recommended Actions</h3>
                {insights.skillGaps.map((gap: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-amber)]">
                    <Lightbulb className="h-3 w-3" /> {gap}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => { setInsights(null); onClose(); }}
              className="mt-4 w-full rounded-lg bg-[var(--color-indigo)] py-2 text-sm font-semibold text-white"
            >
              Done
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ============================================
// Main Analytics Page
// ============================================

export default function AnalyticsPage() {
  const { state } = useStore();
  const { setOutcomes } = useStoreActions();
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);

  useEffect(() => {
    async function loadOutcomes() {
      try {
        const res = await fetch("/api/agents/evolution");
        const { data } = await res.json();
        if (data?.length) setOutcomes(data.map((o: any) => ({
          id: o.id,
          applicationId: o.application_id,
          jobTitle: o.job_title,
          jobCompany: o.job_company,
          jobScores: o.job_scores,
          outcome: o.outcome,
          rejectionReason: o.rejection_reason,
          reachedStage: o.reached_stage,
          daysInPipeline: o.days_in_pipeline,
          notes: o.notes,
          recordedAt: o.recorded_at,
        })));
      } catch (e) {}
    }
    loadOutcomes();
  }, []);

  const stats = {
    totalJobs: state.jobs.length,
    applied: state.applications.filter((a) => a.status !== "discovered").length,
    interviewing: state.applications.filter((a) => a.status === "interviewing").length,
    offers: state.outcomes.filter((o) => o.outcome === "offer").length,
    rejections: state.outcomes.filter((o) => o.outcome === "rejected").length,
    ghosted: state.outcomes.filter((o) => o.outcome === "ghosted").length,
  };

  const conversionRate = stats.applied > 0
    ? Math.round((stats.interviewing / stats.applied) * 100)
    : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl space-y-6"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Analytics & Evolution</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Track performance and let AI recalibrate your strategy
          </p>
        </div>
        <button
          onClick={() => setShowOutcomeModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-indigo-hover)]"
        >
          <Brain className="h-4 w-4" /> Record Outcome
        </button>
      </motion.div>

      {/* Pipeline Funnel */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">📊 Pipeline Funnel</h2>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Discovered", value: stats.totalJobs, color: "indigo", icon: Briefcase },
            { label: "Applied", value: stats.applied, color: "cyan", icon: Send },
            { label: "Interviewing", value: stats.interviewing, color: "amber", icon: Phone },
            { label: "Offers", value: stats.offers, color: "emerald", icon: CheckCircle2 },
            { label: "Rejected", value: stats.rejections, color: "rose", icon: XCircle },
          ].map((stage, i) => (
            <div key={stage.label} className="text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-${stage.color}-bg)] mb-2`}>
                <stage.icon className={`h-6 w-6 text-[var(--color-${stage.color})]`} />
              </div>
              <p className={`text-2xl font-bold text-[var(--color-${stage.color})]`}>{stage.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stage.label}</p>
              {i < 4 && (
                <div className="mt-2 flex justify-center">
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {conversionRate > 0 && (
          <div className="mt-4 rounded-lg bg-[var(--color-bg-card)] p-3 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Application → Interview conversion: <span className="font-bold text-[var(--color-emerald)]">{conversionRate}%</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Outcomes History */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">🔄 Outcome History</h2>
        {state.outcomes.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="mx-auto h-10 w-10 text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">
              No outcomes recorded yet. Click &ldquo;Record Outcome&rdquo; to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.outcomes.map((o) => {
              const outcomeInfo = {
                offer: { color: "emerald", icon: CheckCircle2, label: "Offered" },
                rejected: { color: "rose", icon: XCircle, label: "Rejected" },
                ghosted: { color: "amber", icon: Ghost, label: "Ghosted" },
                withdrawn: { color: "indigo", icon: ArrowRight, label: "Withdrawn" },
              }[o.outcome] || { color: "indigo", icon: Briefcase, label: "Unknown" };

              return (
                <div key={o.id} className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-card)] p-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-${outcomeInfo.color}-bg)]`}>
                    <outcomeInfo.icon className={`h-4 w-4 text-[var(--color-${outcomeInfo.color})]`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {o.jobTitle} — {o.jobCompany}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {o.reachedStage && `Stage: ${o.reachedStage} · `}
                      {new Date(o.recordedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-full bg-[var(--color-${outcomeInfo.color}-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-${outcomeInfo.color})]`}>
                    {outcomeInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Outcome Modal */}
      <OutcomeEntryModal
        open={showOutcomeModal}
        onClose={() => setShowOutcomeModal(false)}
      />
    </motion.div>
  );
}
