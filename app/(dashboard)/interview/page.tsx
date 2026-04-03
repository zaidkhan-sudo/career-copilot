"use client";

/**
 * Interview Prep Page — Enhanced
 * =================================
 * Job-specific interview preparation with saved sessions,
 * mock interview chat, and study plans.
 */

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Target,
  Brain,
  MessageSquare,
  BookOpen,
  Building2,
  ChevronRight,
  Loader2,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  Lightbulb,
  User,
  Bot,
  HelpCircle,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

type Tab = "overview" | "technical" | "behavioral" | "chat" | "study";

interface ChatMessage {
  role: "user" | "interviewer";
  content: string;
}

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const { state } = useStore();

  const jobId = searchParams.get("jobId") || "";
  const jobTitle = searchParams.get("jobTitle") || "";
  const jobCompany = searchParams.get("jobCompany") || "";

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [prepData, setPrepData] = useState<any>(null);
  const [savedPreps, setSavedPreps] = useState<any[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatType, setChatType] = useState<"technical" | "behavioral">("technical");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load saved preps
  useEffect(() => {
    fetch("/api/interview")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.length) setSavedPreps(data);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = useCallback(async (jId?: string, jTitle?: string, jCompany?: string) => {
    const tId = jId || jobId;
    const tTitle = jTitle || jobTitle;
    const tCompany = jCompany || jobCompany;
    if (!tTitle || !tCompany) return;

    setLoading(true);
    try {
      // Find the job for description
      const job = state.jobs.find((j) => j.id === tId);

      const res = await fetch("/api/interview/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: tId,
          jobTitle: tTitle,
          jobCompany: tCompany,
          jobDescription: job?.description || "",
          jobSkills: job?.extractedSkills || [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPrepData(data.data);
      }
    } catch (e) {
      console.error("Prep generation error:", e);
    }
    setLoading(false);
  }, [jobId, jobTitle, jobCompany, state.jobs]);

  // Auto-generate if job params present
  useEffect(() => {
    if (jobTitle && jobCompany && !prepData) {
      handleGenerate();
    }
  }, [jobId, jobTitle, jobCompany, prepData, handleGenerate]);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: prepData?.jobTitle || jobTitle,
          jobCompany: prepData?.jobCompany || jobCompany,
          messages: newMessages,
          questionType: chatType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages([...newMessages, { role: "interviewer", content: data.data.reply }]);
      }
    } catch {}
    setChatLoading(false);
  };

  const startChat = async () => {
    setChatMessages([]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: prepData?.jobTitle || jobTitle,
          jobCompany: prepData?.jobCompany || jobCompany,
          messages: [],
          questionType: chatType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages([{ role: "interviewer", content: data.data.reply }]);
      }
    } catch {}
    setChatLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: Building2 },
    { id: "technical" as Tab, label: "Technical", icon: Brain },
    { id: "behavioral" as Tab, label: "Behavioral", icon: MessageSquare },
    { id: "chat" as Tab, label: "Mock Interview", icon: Target },
    { id: "study" as Tab, label: "Study Plan", icon: BookOpen },
  ];

  // If no job specified, show saved preps
  if (!jobTitle && !prepData) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          <Target className="inline h-6 w-6 mr-2" />
          Interview Preparation
        </h1>

        {savedPreps.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              No interview prep sessions yet
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Go to the Jobs page and click &quot;Interview Prep&quot; on a job card
            </p>
            <Link href="/jobs">
              <button className="mt-4 rounded-xl bg-[var(--color-indigo)] px-5 py-2.5 text-sm font-semibold text-white">
                Browse Jobs
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedPreps.map((prep: any, i: number) => (
              <motion.div
                key={prep.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 cursor-pointer transition-all hover:border-[var(--color-border-hover)]"
                onClick={() => {
                  setPrepData(prep.prep_data || prep);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                      {prep.job_title || "Interview Prep"}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {prep.job_company || "Company"}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/interview">
          <button className="rounded-lg p-2 transition-colors hover:bg-[var(--color-bg-card)]">
            <ArrowLeft className="h-5 w-5 text-[var(--color-text-muted)]" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Interview Prep: {prepData?.jobTitle || jobTitle}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {prepData?.jobCompany || jobCompany}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-16 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--color-indigo)] mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">
            Generating interview materials with AI...
          </p>
        </div>
      ) : prepData ? (
        <>
          {/* Tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-[var(--color-bg-card)] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[var(--color-indigo)] text-white shadow-lg"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && prepData.companyResearch && (
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[var(--color-cyan)]" /> Company Research
                </h3>
                <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <p><strong>Overview:</strong> {prepData.companyResearch.overview}</p>
                  <p><strong>Culture:</strong> {prepData.companyResearch.culture}</p>
                  <p><strong>Recent News:</strong> {prepData.companyResearch.recentNews}</p>
                </div>
                {prepData.companyResearch.tips?.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {prepData.companyResearch.tips.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                        <Lightbulb className="h-3 w-3 mt-0.5 text-[var(--color-amber)] shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Questions to Ask */}
              {prepData.questionsToAsk?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-[var(--color-emerald)]" /> Questions to Ask
                  </h3>
                  <div className="space-y-3">
                    {prepData.questionsToAsk.map((q: any, i: number) => (
                      <div key={i} className="rounded-lg bg-[var(--color-bg-card)] p-3">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{q.question}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">💡 {q.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "technical" && prepData.technicalQuestions?.length > 0 && (
            <div className="space-y-3">
              {prepData.technicalQuestions.map((q: any, i: number) => (
                <TechQuestionCard key={i} question={q} index={i} />
              ))}
              {prepData.conceptsToReview?.length > 0 && (
                <div className="glass-card p-5 mt-4">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
                    📚 Concepts to Review
                  </h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {prepData.conceptsToReview.map((c: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-[var(--color-bg-card)] p-3">
                        <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                          c.importance === "high" ? "bg-[var(--color-emerald)]" :
                          c.importance === "medium" ? "bg-[var(--color-amber)]" : "bg-[var(--color-text-muted)]"
                        }`} />
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-text-primary)]">{c.concept}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">{c.studyTip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "behavioral" && prepData.behavioralQuestions?.length > 0 && (
            <div className="space-y-3">
              {prepData.behavioralQuestions.map((q: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-full bg-[var(--color-amber-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-amber)]">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-2">{q.question}</p>
                  <div className="mt-3 rounded-lg bg-[var(--color-bg-card)] p-3">
                    <p className="text-xs font-medium text-[var(--color-indigo)] mb-1">STAR Tip:</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{q.starTip}</p>
                  </div>
                  {q.sampleSituation && (
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      💡 Draw from: {q.sampleSituation}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "chat" && (
            <div className="glass-card overflow-hidden">
              {/* Chat Type Selector */}
              <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] p-4">
                <button
                  onClick={() => setChatType("technical")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    chatType === "technical"
                      ? "bg-[var(--color-indigo)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Technical
                </button>
                <button
                  onClick={() => setChatType("behavioral")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    chatType === "behavioral"
                      ? "bg-[var(--color-indigo)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Behavioral
                </button>
                <button
                  onClick={startChat}
                  className="ml-auto flex items-center gap-1 rounded-lg bg-[var(--color-emerald-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-emerald)]"
                >
                  <Sparkles className="h-3 w-3" /> Start Interview
                </button>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Target className="h-10 w-10 text-[var(--color-text-muted)] mb-3" />
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Click &quot;Start Interview&quot; to begin a mock interview
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                      {msg.role === "interviewer" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-indigo-bg)] shrink-0">
                          <Bot className="h-4 w-4 text-[var(--color-indigo)]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "bg-[var(--color-indigo)] text-white"
                            : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-emerald-bg)] shrink-0">
                          <User className="h-4 w-4 text-[var(--color-emerald)]" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-indigo-bg)]">
                      <Bot className="h-4 w-4 text-[var(--color-indigo)]" />
                    </div>
                    <div className="bg-[var(--color-bg-card)] rounded-2xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-indigo)]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[var(--color-border-default)] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                    placeholder="Type your response..."
                    className="flex-1 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none"
                    disabled={chatMessages.length === 0}
                  />
                  <button
                    onClick={handleChat}
                    disabled={chatLoading || !chatInput.trim() || chatMessages.length === 0}
                    className="rounded-xl bg-[var(--color-indigo)] px-4 py-2.5 text-white transition-all hover:shadow-lg disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "study" && prepData.studyPlan && (
            <div className="space-y-4">
              {Object.entries(prepData.studyPlan).map(([day, plan]: [string, any], i) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-indigo-bg)]">
                      <Calendar className="h-5 w-5 text-[var(--color-indigo)]" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] capitalize">
                      {day.replace(/(\d)/, " $1")}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{plan}</p>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Select a job to prepare
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Go to the Jobs page and click &quot;Interview Prep&quot;
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Technical Question Card
// ============================================

function TechQuestionCard({ question: q, index }: { question: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-5"
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          q.difficulty === "hard"
            ? "bg-red-500/10 text-red-400"
            : q.difficulty === "medium"
              ? "bg-[var(--color-amber-bg)] text-[var(--color-amber)]"
              : "bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]"
        }`}>
          {q.difficulty}
        </div>
        <span className="rounded-full bg-[var(--color-bg-card)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]">
          {q.topic}
        </span>
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-2">{q.question}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs text-[var(--color-indigo)] hover:underline"
      >
        {expanded ? "Hide answer" : "Show sample answer"}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 rounded-lg bg-[var(--color-bg-card)] p-3 space-y-2"
        >
          <p className="text-xs text-[var(--color-text-secondary)]">{q.sampleAnswer}</p>
          {q.keyPoints?.length > 0 && (
            <div className="space-y-1">
              {q.keyPoints.map((point: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-[var(--color-emerald)] shrink-0" />
                  {point}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
