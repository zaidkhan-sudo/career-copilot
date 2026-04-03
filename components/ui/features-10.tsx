import {
  Bell,
  BriefcaseBusiness,
  FileText,
  Gift,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";

export function Features() {
  return (
    <section className="relative py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-display">
            Powerful <span className="text-amber-300">Features</span>
          </h2>
          <p className="mt-4 text-zinc-300/85 max-w-2xl mx-auto text-lg">
            Five specialized agents work 24/7 to discover roles, score fit, tailor materials, and coach you to interviews.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="border border-zinc-600/70 bg-zinc-950/85 p-5 rounded-xs shadow-[inset_0_0_0_1px_rgba(161,161,170,0.08)]">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
              <Video className="h-4 w-4" />
              <span>Coach Agent - Interview Simulator</span>
            </div>

            <p className="mt-4 text-white text-3xl/9 max-w-md font-semibold">
              Practice OA, live coding, and behavioral rounds with adaptive AI.
            </p>

            <p className="mt-3 text-zinc-300 text-lg/7 max-w-md">
              Get real-time feedback, weakness tracking, and personalized improvement plans after every session.
            </p>

            <div className="mt-6 border-t border-dashed border-zinc-600/70 pt-5">
              <div className="border border-zinc-600/70 bg-zinc-900 rounded-md p-3">
                <div className="aspect-video rounded-sm border border-zinc-700/70 bg-linear-to-b from-zinc-800/70 to-zinc-900/80 relative flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-zinc-800/95 border border-zinc-600/60 flex items-center justify-center">
                    <Video className="h-5 w-5 text-amber-300" />
                  </div>
                  <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-300/30">
                    Simulation Live
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button className="h-7 w-7 rounded-full bg-rose-500/15 border border-rose-400/35 flex items-center justify-center">
                    <Mic className="h-3.5 w-3.5 text-rose-300" />
                  </button>
                  <button className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-600/70 flex items-center justify-center">
                    <Video className="h-3.5 w-3.5 text-zinc-300" />
                  </button>
                  <div className="ml-auto h-1.5 w-44 rounded-full bg-zinc-700/70 overflow-hidden">
                    <div className="h-full w-4/5 bg-linear-to-r from-amber-300 to-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="border border-zinc-600/70 bg-zinc-950/85 p-5 rounded-xs shadow-[inset_0_0_0_1px_rgba(161,161,170,0.08)]">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
              <Gift className="h-4 w-4" />
              <span>Scout + Analyzer Pipeline</span>
            </div>

            <p className="mt-4 text-white text-3xl/9 max-w-md font-semibold">
              Discover fresh jobs and rank them with fit intelligence.
            </p>

            <p className="mt-3 text-zinc-300 text-lg/7 max-w-md">
              Scout monitors 10+ sources and Analyzer scores skills, culture, and trajectory before you apply.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300">Posted &lt;24h</span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/18 border border-emerald-400/30 text-emerald-300">Top Match</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { name: "Backend Engineer", company: "TechCorp • Remote", amount: "92 Fit", icon: Sparkles },
                { name: "Full-Stack Developer", company: "StartupX • Hybrid", amount: "88 Fit", icon: TrendingUp },
                { name: "Frontend Engineer", company: "DesignCo • Remote", amount: "84 Fit", icon: Target },
              ].map((task) => (
                <div
                  key={task.name}
                  className="flex items-center gap-3 rounded-md border border-zinc-700/80 bg-linear-to-r from-zinc-800/70 to-zinc-900/70 p-3"
                >
                  <div className="h-10 w-10 rounded-md bg-zinc-700/70 border border-zinc-600/70 flex items-center justify-center shrink-0">
                    <task.icon className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{task.name}</p>
                    <p className="text-sm text-zinc-400 truncate">{task.company}</p>
                  </div>
                  <span className="text-emerald-300 font-semibold">{task.amount}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="lg:col-span-2 border border-zinc-600/70 bg-zinc-950/85 rounded-xs p-8 shadow-[inset_0_0_0_1px_rgba(161,161,170,0.08)]">
            <h3 className="text-center text-2xl sm:text-3xl font-semibold text-white">
              The Five-Agent System + Continuous Feedback Loop
            </h3>

            <div className="mt-7 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { label: "Scout Agent", icon: BriefcaseBusiness, color: "text-amber-300" },
                { label: "Analyzer Agent", icon: TrendingUp, color: "text-amber-300" },
                { label: "Writer Agent", icon: FileText, color: "text-amber-300" },
                { label: "Coach Agent", icon: Video, color: "text-amber-300" },
                { label: "Reporter Agent", icon: Bell, color: "text-amber-300" },
              ].map((tool) => (
                <div key={tool.label} className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-xl border border-zinc-700/80 bg-zinc-900/80 flex items-center justify-center shadow-lg">
                    <tool.icon className={`h-6 w-6 ${tool.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]`} />
                  </div>
                  <p className="mt-3 text-zinc-300 text-sm">{tool.label}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}