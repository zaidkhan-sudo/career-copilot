"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Smartphone, Globe, RotateCcw } from "lucide-react";
import MagnifiedBento from "@/components/ui/magnified-bento";

function TypeTester() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.5 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <motion.span
        className="font-sans text-6xl md:text-8xl text-amber-300 font-semibold"
        animate={{ scale }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        ATS
      </motion.span>
    </div>
  );
}

function LayoutAnimation() {
  const [layout, setLayout] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLayout((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const layouts = ["grid-cols-2", "grid-cols-3", "grid-cols-1"];

  return (
    <div className="h-full flex items-center justify-center">
      <motion.div
        className={`grid ${layouts[layout]} gap-1.5 w-full max-w-35 h-full`}
        layout
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="bg-violet-300/25 rounded-md h-5 w-full"
            layout
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function SpeedIndicator() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="h-10 flex items-center justify-center overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              className="h-8 w-24 bg-white/10 rounded"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              exit={{ opacity: 0, y: -20, position: "absolute" }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <motion.span
              key="text"
              initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              className="text-3xl md:text-4xl font-sans font-medium text-emerald-300"
            >
              Daily
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="text-sm text-emerald-300/90">Digest</span>
      <div className="w-full max-w-30 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-300 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1 }}
        />
      </div>
    </div>
  );
}

function SecurityBadge() {
  const [shields, setShields] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShields((prev) => {
        const nextIndex = prev.findIndex((s) => !s.active);
        if (nextIndex === -1) {
          return prev.map(() => ({ id: Math.random(), active: false }));
        }
        return prev.map((s, i) => (i === nextIndex ? { ...s, active: true } : s));
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full gap-2">
      {shields.map((shield) => (
        <motion.div
          key={shield.id}
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            shield.active ? "bg-rose-300/20" : "bg-white/5"
          }`}
          animate={{ scale: shield.active ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Lock className={`w-5 h-5 ${shield.active ? "text-rose-300" : "text-gray-600"}`} />
        </motion.div>
      ))}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto">
        <motion.p
          className="text-amber-300 text-sm uppercase tracking-widest mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          CareerPilot System
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-zinc-800/30 border border-zinc-600/80 rounded-xl p-8 flex flex-col hover:border-zinc-500 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(39, 39, 42, 1)" }}
          >
            <div className="flex-1">
              <TypeTester />
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl text-amber-300 font-medium">Writer Agent</h3>
              <p className="text-gray-400 text-sm mt-1">Builds ATS-optimized resumes tailored to each role and company context.</p>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-2 bg-zinc-950/90 border border-zinc-600/80 rounded-xl p-8 flex flex-col hover:border-zinc-500 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1">
              <LayoutAnimation />
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl text-violet-300 font-medium">Analyzer Agent</h3>
              <p className="text-gray-400 text-sm mt-1">Scores Skills Fit, Culture Fit, and Career Trajectory for every job.</p>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-2 md:row-span-2 bg-zinc-950/90 border border-zinc-600/80 rounded-xl p-6 flex flex-col hover:border-zinc-500 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-sm scale-90 origin-center">
                <MagnifiedBento />
              </div>
            </div>
            <div className="mt-auto relative z-20 bg-zinc-950/70 backdrop-blur-sm rounded-lg p-2">
              <h3 className="font-serif text-xl text-cyan-300 flex items-center gap-2 font-medium">
                <Globe className="w-5 h-5 text-cyan-300" />
                Scout Agent
              </h3>
              <p className="text-gray-400 text-sm mt-1">Monitors 10+ job sources and flags fresh opportunities posted in under 24 hours.</p>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-2 bg-zinc-950/90 border border-zinc-600/80 rounded-xl p-8 flex flex-col hover:border-zinc-500 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1">
              <SpeedIndicator />
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl text-emerald-300 font-medium">Reporter Agent</h3>
              <p className="text-gray-400 text-sm mt-1">Delivers daily briefings with top matches, pipeline updates, and actionable next steps.</p>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-3 bg-zinc-950/90 border border-zinc-600/80 rounded-xl p-8 flex flex-col hover:border-zinc-500 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1">
              <SecurityBadge />
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl text-rose-300 flex items-center gap-2 font-medium">
                <RotateCcw className="w-5 h-5 text-rose-300" />
                Feedback Loop
              </h3>
              <p className="text-gray-400 text-sm mt-1">Every rejection and callback updates strategy, improving future applications continuously.</p>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-3 bg-zinc-950/90 border border-zinc-600/80 rounded-xl p-8 flex flex-col hover:border-zinc-500 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1 flex items-center justify-center">
              <Smartphone className="w-16 h-16 text-sky-300" />
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl text-sky-300 font-medium">Coach Agent</h3>
              <p className="text-gray-400 text-sm mt-1">Runs OA, coding, and behavioral interview simulations with personalized feedback.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return <FeaturesSection />;
}
