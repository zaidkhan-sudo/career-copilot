"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LiquidMetalIconBadge } from "@/components/ui/liquid-metal-button";
import {
  LayoutDashboard,
  Search,
  FileText,
  Target,
  PenTool,
  BarChart3,
  Settings,
  Rocket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Search },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "Interview", href: "/interview", icon: Target },
  { label: "Resumes", href: "/resumes", icon: PenTool },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex flex-col rounded-2xl border transition-all duration-300 backdrop-blur-2xl glass-card",
        "border-[var(--color-border-default)] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-center gap-3 border-b border-[var(--color-border-default)] px-4">
        <div className="shrink-0 flex items-center justify-center">
          <LiquidMetalIconBadge icon={<Rocket className="h-4 w-4" />} size={36} />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight gradient-text">
            CareerPilot
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-[var(--color-indigo-bg)] text-[var(--color-indigo)] shadow-[inset_0_0_0_1px_var(--color-indigo-border)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-[var(--color-indigo)]"
                    : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-[var(--color-border-default)] p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-3 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-secondary)]"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
