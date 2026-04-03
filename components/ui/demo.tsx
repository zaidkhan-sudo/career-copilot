import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import {
  Search,
  Target,
  FileText,
  Mic,
  BarChart3,
  Brain,
} from "lucide-react";

const itemsSample: BentoItem[] = [
  {
    title: "Scout Agent",
    description: "Monitors 10+ job boards 24/7, flagging fresh opportunities before the competition.",
    icon: <Search className="w-4 h-4 text-blue-300" />,
  },
  {
    title: "Analyzer Agent",
    description: "Scores every job on skills fit, culture match, and career trajectory alignment.",
    icon: <Target className="w-4 h-4 text-amber-300" />,
  },
  {
    title: "Writer Agent",
    description: "Generates unique, ATS-optimized resumes tailored to each specific role.",
    icon: <FileText className="w-4 h-4 text-emerald-300" />,
  },
  {
    title: "Coach Agent",
    description: "Simulates real interviews with voice analysis and personalized feedback.",
    icon: <Mic className="w-4 h-4 text-cyan-300" />,
  },
  {
    title: "Reporter Agent",
    description: "Delivers daily intelligence briefings with actionable insights.",
    icon: <BarChart3 className="w-4 h-4 text-violet-300" />,
  },
  {
    title: "The Feedback Loop",
    description: "Every rejection teaches. Every callback reinforces. Your agents evolve with real data from your journey.",
    icon: <Brain className="w-4 h-4 text-fuchsia-300" />,
    hasPersistentHover: true,
  },
];

function BentoGridDemo() {
  return <BentoGrid items={itemsSample} />;
}

export { BentoGridDemo };
