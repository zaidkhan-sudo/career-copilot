"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Rocket,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Component as HeroSection } from "@/components/ui/horizon-hero-section";
import { BentoGridDemo } from "@/components/ui/demo";
import DemoOne from "@/components/ui/bento-grid-01-demo";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { Testimonials } from "@/components/ui/testimonials-columns-1-demo";
import { FeaturesDemo } from "@/components/ui/features-10-demo";
import { LiquidMetalButton, LiquidMetalIconBadge } from "@/components/ui/liquid-metal-button";

const stats = [
  { value: "10+", label: "Job Sources" },
  { value: "24/7", label: "Autonomous Hunting" },
  { value: "73%", label: "Applications Lost" },
  { value: "5", label: "AI Agents" },
];

const problemItems: BentoItem[] = [
  {
    title: "11+ Hours/Week",
    description: "Wasted on repetitive searching, applying, and tracking",
    icon: <Clock className="w-4 h-4 text-amber-300" />,
  },
  {
    title: "250+ Applicants",
    description: "Average competition per job posting online",
    icon: <Users className="w-4 h-4 text-sky-300" />,
    hasPersistentHover: true,
  },
  {
    title: "3% Response Rate",
    description: "Most applications never get a human review",
    icon: <TrendingUp className="w-4 h-4 text-rose-300" />,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="relative bg-[var(--color-bg-primary)]">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <LiquidMetalIconBadge icon={<Rocket className="h-5 w-5 transform -rotate-45" />} />
            <span className="text-xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
              CareerPilot
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              How it Works
            </a>
            <a href="#agents" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              The Agents
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LiquidMetalButton label="Sign In" onClick={() => router.push("/login")} />
            <LiquidMetalButton label="Get Started" onClick={() => router.push("/login")} />
          </div>
        </div>
      </motion.nav>

      {/* Three.js Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)] heading-glow">
              Job Hunting is <span className="text-amber-300">Broken</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              The average job seeker spends 11+ hours per week on repetitive tasks.
              73% of applications vanish into a black hole.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.4 }}
          >
            <BentoGrid items={problemItems} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)] heading-glow">
              <span className="text-[var(--color-text-primary)]">Meet Your </span>
              <span className="text-amber-300">AI Team</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Five specialized agents that never sleep, learn from every outcome,
              and continuously improve your job search strategy.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.4 }}
          >
            <BentoGridDemo />
          </motion.div>
        </div>
      </section>

      <FeaturesDemo />

      <DemoOne />

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-orange-bg)] to-transparent" />

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)] heading-glow">
              <span className="text-[var(--color-text-primary)]">How </span>
              <span className="text-amber-300">It Works</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-orange)]/30 to-transparent" />

            <div className="grid lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Set Up Profile", desc: "Upload resume, add skills, define your dream role and preferences." },
                { step: "02", title: "Agents Activate", desc: "Your AI team starts scanning, analyzing, and preparing materials 24/7." },
                { step: "03", title: "Review Matches", desc: "Get daily briefings with top opportunities scored and explained." },
                { step: "04", title: "Land Interviews", desc: "Apply with tailored materials and prep with AI coaching simulations." },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative text-center lg:text-left"
                >
                  <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-black border border-[var(--color-orange)]/30 mb-6">
                    <span className="text-2xl font-bold gradient-text-fire font-[family-name:var(--font-display)]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[var(--radius-lg)] border border-zinc-500/55 bg-zinc-950/92 backdrop-blur-2xl p-12 sm:p-16 text-center overflow-hidden shadow-[0_0_48px_rgba(255,255,255,0.12)]"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/12 via-transparent to-zinc-300/8" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-900 to-black mb-8 shadow-2xl shadow-white/20">
                <Zap className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-6 font-[family-name:var(--font-display)] heading-glow">
                Ready to Let <span className="text-amber-300">AI Hunt</span>
                <br />
                While You Sleep?
              </h2>

              <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto">
                Join thousands of job seekers who&apos;ve automated their search
                and landed roles at top companies.
              </p>

              <div className="flex items-center justify-center gap-4">
                <LiquidMetalButton label="Get Started" onClick={() => router.push("/login")} />
                <LiquidMetalButton viewMode="icon" onClick={() => router.push("/login")} />
              </div>

              <p className="mt-6 text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                No credit card required • Free tier available
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-[var(--color-border-default)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <LiquidMetalIconBadge icon={<Rocket className="h-4 w-4 transform -rotate-45" />} size={40} />
            <span className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
              CareerPilot
            </span>
          </div>

          <p className="text-sm text-[var(--color-text-muted)]">
            © 2026 CareerPilot. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
