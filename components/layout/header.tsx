"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/hooks/use-auth";

export default function Header() {
  const { state } = useStore();
  const { signOut } = useAuth();
  const userName = state.user?.name || "User";
  const notificationCount = state.applications.filter((a) => a.status === "offered").length
    + (state.briefing ? 1 : 0);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="sticky top-4 z-30 px-6 backdrop-blur-md">
      <header className="glass-card flex h-16 items-center justify-between rounded-2xl px-6 shadow-lg">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search jobs, companies, or skills..."
            className="h-11 w-full rounded-xl border border-transparent bg-transparent bg-gradient-to-r from-transparent to-[var(--color-bg-card)] pl-[2.75rem] pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-bg-card)] focus:border-[var(--color-border-accent)] focus:bg-[var(--color-bg-card)] focus:outline-none focus:ring-4 focus:ring-[var(--color-indigo)]/10"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)]/50 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-accent)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] shadow-sm">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-rose)] text-[10px] font-bold text-white shadow-md">
                {notificationCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button className="flex h-11 items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)]/50 pl-2 pr-4 transition-colors hover:border-[var(--color-border-accent)] hover:bg-[var(--color-bg-card)] shadow-sm">
            {state.user?.avatarUrl ? (
              <img
                src={state.user.avatarUrl}
                alt={userName}
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--color-indigo)] to-[var(--color-cyan)] shadow-inner">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {userName}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
    </div>
  );
}
