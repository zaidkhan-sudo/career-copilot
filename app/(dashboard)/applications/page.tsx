"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search,
  Briefcase,
  ChevronRight,
  Clock,
  MapPin,
  ExternalLink,
  FileText,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { useStore, useStoreActions } from "@/lib/store";

const STATUSES = [
  { value: "discovered", label: "Discovered", color: "indigo", icon: Search },
  { value: "applied", label: "Applied", color: "cyan", icon: ArrowRightCircle },
  { value: "screening", label: "Screening", color: "amber", icon: Clock },
  { value: "interviewing", label: "Interviewing", color: "orange", icon: Target },
  { value: "offered", label: "Offered", color: "emerald", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", color: "rose", icon: XCircle },
] as const;

export default function ApplicationsPage() {
  const { state } = useStore();
  const { setApplications, updateApplication, addApplication } = useStoreActions();
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch applications on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/applications");
        const { data } = await res.json();
        if (data?.length) setApplications(data);
      } catch (e) {}
    }
    if (state.applications.length === 0) load();
  }, []);

  const filteredApps = filter === "all"
    ? state.applications
    : state.applications.filter((a) => a.status === filter);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      updateApplication(appId, { status: newStatus as any });
    } catch (e) {
      console.error("Failed to update status:", e);
    }
    setUpdatingId(null);
  };

  // Pipeline summary counts
  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: state.applications.filter((a) => a.status === s.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Applications</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Track your job application pipeline</p>
      </div>

      {/* Pipeline Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-1">
          {statusCounts.map((s, i) => (
            <button
              key={s.value}
              onClick={() => setFilter(filter === s.value ? "all" : s.value)}
              className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-3 transition-all ${
                filter === s.value
                  ? `bg-[var(--color-${s.color}-bg)] shadow-sm`
                  : "hover:bg-[var(--color-bg-card)]"
              }`}
            >
              <s.icon className={`h-4 w-4 text-[var(--color-${s.color})]`} />
              <span className={`text-lg font-bold text-[var(--color-${s.color})]`}>{s.count}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">No applications yet</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Start by discovering jobs on the Dashboard and clicking &ldquo;Prepare Materials&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app, i) => {
            const statusInfo = STATUSES.find((s) => s.value === app.status) || STATUSES[0];
            const score = app.job?.scores?.composite || 0;
            
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 group"
              >
                <div className="flex items-center gap-4">
                  {/* Score */}
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-${statusInfo.color}-bg)] border border-[var(--color-${statusInfo.color}-border)]`}>
                    <span className={`text-sm font-bold text-[var(--color-${statusInfo.color})]`}>
                      {score || "—"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {app.job?.title || "Unknown Role"}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {app.job?.company || "Unknown Company"}
                    </p>
                    {app.appliedAt && (
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-2">
                    {updatingId === app.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
                    ) : (
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`rounded-lg border border-[var(--color-${statusInfo.color}-border)] bg-[var(--color-${statusInfo.color}-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-${statusInfo.color})] cursor-pointer outline-none`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {app.notes && (
                  <p className="mt-2 text-xs text-[var(--color-text-muted)] border-l-2 border-[var(--color-border-default)] pl-3">
                    {app.notes}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
