"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  User,
  MapPin,
  Briefcase,
  Github,
  Linkedin,
  Bell,
  Mail,
  Trash2,
  Save,
  Globe,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const { state } = useStore();
  const user = state.user;
  const preferences = {
    workMode: "remote",
    salaryMin: "",
    salaryMax: "",
    visaSponsorship: false,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">⚙️ Settings</h1>
      </motion.div>

      {/* Profile */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <User className="h-5 w-5 text-[var(--color-indigo)]" /> Profile
        </h2>
        <div className="space-y-4">
          <FormField label="Full Name" defaultValue={user?.name || ""} />
          <FormField label="Email" defaultValue={user?.email || ""} type="email" />
          <FormField label="Title" defaultValue={user?.title || ""} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              Skills
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(user?.skills || []).map((skill) => (
                <span
                  key={skill.name}
                  className="rounded-md bg-[var(--color-indigo-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-indigo)]"
                >
                  {skill.name}{" "}
                  <span className="opacity-50">({skill.level})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Job Preferences */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <Briefcase className="h-5 w-5 text-[var(--color-emerald)]" /> Job
          Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              Work Mode
            </label>
            <div className="flex gap-2">
              {["Remote", "Hybrid", "On-site", "Any"].map((mode) => (
                <button
                  key={mode}
                  className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                    preferences.workMode === mode.toLowerCase()
                      ? "border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)] text-[var(--color-indigo)]"
                      : "border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Min Salary"
              defaultValue={preferences.salaryMin}
              icon={<span className="text-xs text-[var(--color-text-muted)]">$</span>}
            />
            <FormField
              label="Max Salary"
              defaultValue={preferences.salaryMax}
              icon={<span className="text-xs text-[var(--color-text-muted)]">$</span>}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Visa Sponsorship Required
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Only show jobs offering visa sponsorship
              </p>
            </div>
            <div
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                preferences.visaSponsorship
                  ? "bg-[var(--color-indigo)]"
                  : "bg-[var(--color-border-default)]"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  preferences.visaSponsorship
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connected Accounts */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <Globe className="h-5 w-5 text-[var(--color-cyan)]" /> Connected
          Accounts
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-3">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-[var(--color-text-primary)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  GitHub
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Connected
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--color-emerald-bg)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-emerald)]">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-3">
            <div className="flex items-center gap-3">
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  LinkedIn
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Not connected
                </p>
              </div>
            </div>
            <button className="rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]">
              Connect
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <Bell className="h-5 w-5 text-[var(--color-amber)]" /> Notifications
        </h2>
        <div className="space-y-3">
          {[
            {
              label: "Daily Digest Email",
              desc: "Receive top matches every morning",
              enabled: true,
            },
            {
              label: "New Match Alerts",
              desc: "Get notified when high-match jobs appear",
              enabled: true,
            },
            {
              label: "Interview Reminders",
              desc: "Reminders for scheduled mock interviews",
              enabled: true,
            },
            {
              label: "Weekly Report",
              desc: "Weekly summary of your job search progress",
              enabled: false,
            },
          ].map((notif) => (
            <div
              key={notif.label}
              className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {notif.label}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {notif.desc}
                </p>
              </div>
              <div
                className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                  notif.enabled
                    ? "bg-[var(--color-indigo)]"
                    : "bg-[var(--color-border-default)]"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white transition-transform ${
                    notif.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save + Danger Zone */}
      <motion.div
        variants={item}
        className="flex items-center justify-between"
      >
        <button className="flex items-center gap-2 rounded-xl border border-[var(--color-rose)] bg-[var(--color-rose-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-rose)] transition hover:bg-[var(--color-rose)]/20">
          <Trash2 className="h-4 w-4" /> Delete All Data
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-indigo-hover)]">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </motion.div>
    </motion.div>
  );
}

function FormField({
  label,
  defaultValue,
  type = "text",
  icon,
}: {
  label: string;
  defaultValue: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        )}
        <input
          type={type}
          defaultValue={defaultValue}
          className={`h-10 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] pr-4 text-sm text-[var(--color-text-primary)] transition-colors focus:border-[var(--color-indigo)] focus:outline-none ${
            icon ? "pl-8" : "pl-4"
          }`}
        />
      </div>
    </div>
  );
}
