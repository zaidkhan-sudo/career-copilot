"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Clock,
  Lightbulb,
  Play,
  RotateCcw,
  Mic,
  MicOff,
  Send,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Brain,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

type SessionMode = "oa" | "code" | "behavioral";
type SessionPhase = "setup" | "active" | "feedback";

interface FeedbackItem {
  type: "strength" | "weakness" | "suggestion";
  message: string;
}

interface StudyPlanItem {
  title: string;
  type: "article" | "video" | "practice";
  url?: string;
  duration?: string;
}

export default function InterviewSessionPage() {
  const searchParams = useSearchParams();
  const urlMode = (searchParams.get("mode") || "oa") as SessionMode;
  const urlCompany = searchParams.get("company") || "Stripe";
  
  const [mode, setMode] = useState<SessionMode>(urlMode);
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [behavioralQuestion, setBehavioralQuestion] = useState("");

  // Timer effect
  useEffect(() => {
    if (phase !== "active") return;
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          setPhase("feedback");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const problem = {
    title: "Design a Rate Limiter",
    company: "Stripe",
    difficulty: "Medium",
    timeLimit: "45 min",
    description: `Design and implement a rate limiter that can be used to throttle API requests. The rate limiter should support a sliding window approach and handle distributed scenarios.

Requirements:
- Support configurable rate limits (e.g., 100 requests per minute)
- Use a sliding window algorithm
- Handle concurrent requests safely
- Provide clear error messages when rate limit is exceeded`,
    hints: [
      "Think about what data structure would efficiently track timestamps of requests",
      "Consider using a sorted set or deque to maintain the sliding window",
      "For the distributed case, think about how Redis MULTI/EXEC can help",
    ],
  };

  const behavioralQuestions = [
    "Tell me about a time when you had to handle a merge conflict in a high-stakes environment.",
    "Describe a situation where you disagreed with your manager. How did you handle it?",
    "Tell me about a project that failed. What did you learn?",
    "How do you prioritize tasks when you have multiple deadlines?",
  ];

  // Start session
  const startSession = () => {
    setPhase("active");
    if (mode === "behavioral") {
      setBehavioralQuestion(
        behavioralQuestions[Math.floor(Math.random() * behavioralQuestions.length)]
      );
    }
  };

  // Submit for evaluation
  const submitForEvaluation = async () => {
    setIsEvaluating(true);
    
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          mode,
          question: mode === "behavioral" ? behavioralQuestion : problem.title,
          response: userResponse,
        }),
      });

      const data = await response.json();
      
      // Generate feedback
      const feedbackItems: FeedbackItem[] = [
        { type: "strength", message: "Clear structure and organization" },
        { type: "strength", message: "Good use of the STAR method" },
        { type: "weakness", message: "Could provide more specific metrics" },
        { type: "suggestion", message: "Consider adding a follow-up about lessons learned" },
      ];
      
      // Generate study plan
      const plan: StudyPlanItem[] = [
        { title: "System Design Fundamentals", type: "article", duration: "15 min" },
        { title: "Rate Limiting Deep Dive", type: "video", duration: "20 min" },
        { title: "Practice: Design a URL Shortener", type: "practice", duration: "45 min" },
      ];

      setFeedback(data.feedback || feedbackItems);
      setStudyPlan(data.studyPlan || plan);
      setPhase("feedback");
    } catch (error) {
      // Fallback feedback
      setFeedback([
        { type: "strength", message: "Good problem-solving approach" },
        { type: "weakness", message: "Consider edge cases more thoroughly" },
        { type: "suggestion", message: "Practice explaining your thought process aloud" },
      ]);
      setStudyPlan([
        { title: "Interview Best Practices", type: "article", duration: "10 min" },
        { title: "Mock Interview Tips", type: "video", duration: "15 min" },
      ]);
      setPhase("feedback");
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const nextHint = () => {
    setHintIndex((prev) => Math.min(prev + 1, problem.hints.length - 1));
    setShowHint(true);
  };

  // Setup Phase
  if (phase === "setup") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-indigo-bg)]">
          {mode === "oa" && <Code2 className="h-10 w-10 text-[var(--color-indigo)]" />}
          {mode === "code" && <Brain className="h-10 w-10 text-[var(--color-indigo)]" />}
          {mode === "behavioral" && <Mic className="h-10 w-10 text-[var(--color-indigo)]" />}
        </div>
        
        <h1 className="text-2xl font-bold">Interview Simulator</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Choose your preparation mode
        </p>

        {/* Mode Selector */}
        <div className="mt-6 flex gap-2">
          {(["oa", "code", "behavioral"] as SessionMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                mode === m
                  ? "bg-[var(--color-indigo)] text-white"
                  : "border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-indigo)]"
              }`}
            >
              {m === "oa" && "🎯 OA Sprint"}
              {m === "code" && "💻 Live Coding"}
              {m === "behavioral" && "🎤 Behavioral"}
            </button>
          ))}
        </div>

        <div className="mt-6 text-sm text-[var(--color-text-muted)]">
          {mode === "oa" && (
            <p>30-minute timed coding challenge with company-specific problems</p>
          )}
          {mode === "code" && (
            <p>Live coding with AI interviewer asking follow-up questions</p>
          )}
          {mode === "behavioral" && (
            <p>Voice-enabled STAR method practice with speech analysis</p>
          )}
        </div>

        <div className="mt-6 rounded-lg bg-[var(--color-bg-card)] p-4 text-left">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            Preparing for: Senior Backend Engineer @ {problem.company}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Difficulty: {problem.difficulty} • Time: {problem.timeLimit}
          </p>
        </div>

        <button
          onClick={startSession}
          className="mt-8 flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20"
        >
          <Play className="h-4 w-4" /> Start Session
        </button>
      </motion.div>
    );
  }

  // Feedback Phase
  if (phase === "feedback") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-3xl py-10"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-emerald-bg)]">
            <CheckCircle className="h-8 w-8 text-[var(--color-emerald)]" />
          </div>
          <h1 className="text-2xl font-bold">Session Complete!</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Here&apos;s your personalized feedback from Coach Agent
          </p>
        </div>

        {/* Feedback */}
        <div className="mt-8 glass-card p-6">
          <h2 className="mb-4 text-base font-semibold">📊 Performance Analysis</h2>
          <div className="space-y-3">
            {feedback.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-3 rounded-lg p-3 ${
                  item.type === "strength"
                    ? "bg-[var(--color-emerald-bg)]"
                    : item.type === "weakness"
                      ? "bg-[var(--color-amber-bg)]"
                      : "bg-[var(--color-indigo-bg)]"
                }`}
              >
                {item.type === "strength" && (
                  <CheckCircle className="h-5 w-5 shrink-0 text-[var(--color-emerald)]" />
                )}
                {item.type === "weakness" && (
                  <AlertCircle className="h-5 w-5 shrink-0 text-[var(--color-amber)]" />
                )}
                {item.type === "suggestion" && (
                  <Lightbulb className="h-5 w-5 shrink-0 text-[var(--color-indigo)]" />
                )}
                <span
                  className={`text-sm ${
                    item.type === "strength"
                      ? "text-[var(--color-emerald)]"
                      : item.type === "weakness"
                        ? "text-[var(--color-amber)]"
                        : "text-[var(--color-indigo)]"
                  }`}
                >
                  {item.message}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3-Day Study Plan */}
        <div className="mt-6 glass-card p-6">
          <h2 className="mb-4 text-base font-semibold">📚 3-Day Study Plan</h2>
          <div className="space-y-3">
            {studyPlan.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-card)] p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-indigo-bg)]">
                  <BookOpen className="h-4 w-4 text-[var(--color-indigo)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.type} • {item.duration}
                  </p>
                </div>
                <span className="text-xs font-medium text-[var(--color-indigo)]">
                  Day {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => {
              setPhase("setup");
              setFeedback([]);
              setStudyPlan([]);
              setUserResponse("");
              setTimeRemaining(45 * 60);
            }}
            className="flex items-center gap-2 rounded-xl border border-[var(--color-border-default)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-indigo)]"
          >
            <RotateCcw className="h-4 w-4" /> Practice Again
          </button>
          <button
            onClick={() => window.location.href = "/interview"}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-indigo-hover)]"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  // Active Phase - OA Mode
  if (mode === "oa" || mode === "code") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-6xl"
      >
        {/* Timer bar */}
        <div className="mb-4 flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {problem.company} — {problem.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`flex items-center gap-1.5 text-sm font-mono font-semibold ${
                timeRemaining < 300 ? "text-[var(--color-rose)]" : "text-[var(--color-amber)]"
              }`}
            >
              <Clock className="h-4 w-4" /> {formatTime(timeRemaining)}
            </span>
            <button
              onClick={nextHint}
              className="flex items-center gap-1 rounded-lg bg-[var(--color-amber-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-amber)]"
            >
              <Lightbulb className="h-3.5 w-3.5" /> Hint ({hintIndex + 1}/{problem.hints.length})
            </button>
            <button
              onClick={() => setPhase("setup")}
              className="flex items-center gap-1 rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Hint panel */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-lg border border-[var(--color-amber)]/20 bg-[var(--color-amber-bg)] p-4"
            >
              <p className="text-xs font-medium text-[var(--color-amber)]">
                💡 Hint {hintIndex + 1}: {problem.hints[hintIndex]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid h-[calc(100vh-220px)] grid-cols-2 gap-4">
          {/* Problem description */}
          <div className="glass-card overflow-y-auto p-5">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              {problem.title}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-[var(--color-amber-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-amber)]">
                {problem.difficulty}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {problem.company}
              </span>
            </div>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {problem.description}
            </div>
          </div>

          {/* Code editor area */}
          <div className="glass-card flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-4 py-2">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                Python
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button className="rounded bg-[var(--color-emerald)] px-4 py-1.5 text-xs font-semibold text-white">
                  Run
                </button>
                <button
                  onClick={submitForEvaluation}
                  disabled={isEvaluating}
                  className="flex items-center gap-1 rounded bg-[var(--color-indigo)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  Submit
                </button>
              </div>
            </div>
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Write your solution here..."
              className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Active Phase - Behavioral Mode
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl py-10"
    >
      {/* Timer */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">
          Behavioral Interview Practice
        </span>
        <span className="flex items-center gap-1.5 text-sm font-mono font-semibold text-[var(--color-amber)]">
          <Clock className="h-4 w-4" /> {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Question */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-indigo-bg)]">
            <MessageSquare className="h-5 w-5 text-[var(--color-indigo)]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              AI Interviewer
            </p>
            <p className="mt-1 text-base text-[var(--color-text-primary)]">
              {behavioralQuestion}
            </p>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition-all ${
            isRecording
              ? "bg-[var(--color-rose)] animate-pulse"
              : "bg-[var(--color-indigo)]"
          }`}
        >
          {isRecording ? (
            <MicOff className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
        {isRecording ? "Recording... Click to stop" : "Click to start recording your response"}
      </p>

      {/* Text Response Alternative */}
      <div className="mt-6">
        <p className="mb-2 text-xs text-[var(--color-text-muted)]">
          Or type your response:
        </p>
        <textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          placeholder="Use the STAR method: Situation, Task, Action, Result..."
          rows={6}
          className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] p-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none"
        />
      </div>

      {/* Submit */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setPhase("setup")}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-border-default)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)]"
        >
          <RotateCcw className="h-4 w-4" /> Start Over
        </button>
        <button
          onClick={submitForEvaluation}
          disabled={isEvaluating || !userResponse.trim()}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isEvaluating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Get Feedback
        </button>
      </div>
    </motion.div>
  );
}
