import {
  LayoutDashboard,
  Search,
  FileText,
  Target,
  PenTool,
  BarChart3,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Search },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "Interview", href: "/interview", icon: Target },
  { label: "Resumes", href: "/resumes", icon: PenTool },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];
