"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import type { AgentEvent } from "@/lib/agents/types";
import { useAuthContext } from "@/lib/firebase/auth-context";

// ============================================
// Types
// ============================================

export interface StoreJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  source: string;
  postedAt: string;
  isFresh: boolean;
  isRemote: boolean;
  extractedSkills: string[];
  scores?: { skills: number; culture: number; trajectory: number; composite: number };
  hiddenRequirements?: { signal: string; interpretation: string; severity: string }[];
  aiReasoning?: string;
}

export interface StoreApplication {
  id: string;
  jobId: string;
  job: { title: string; company: string; scores: { composite: number } };
  status: "discovered" | "applied" | "screening" | "interviewing" | "offered" | "rejected" | "withdrawn";
  rejectionReason?: string;
  notes?: string;
  resumeVariantId?: string;
  appliedAt?: string;
  lastUpdated: string;
}

export interface StoreResume {
  id: string;
  jobId?: string;
  jobTitle?: string;
  jobCompany?: string;
  framingStrategy: string;
  content: string;
  coverLetter?: string;
  status: "draft" | "ready" | "applied";
  callbackCount: number;
  totalSent: number;
  createdAt: string;
}

export interface StoreBriefing {
  id: string;
  date: string;
  summary: string;
  newJobsCount: number;
  topMatches: { jobId: string; title: string; company: string; score: number; highlight: string }[];
  marketInsights: string[];
  actionItems: { type: string; title: string; description: string; priority: string }[];
  encouragement: string;
}

export interface StoreUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  skills: { name: string; level: string }[];
  careerGoal?: string;
  onboardingComplete: boolean;
}

export interface StoreOutcome {
  id: string;
  applicationId?: string;
  jobTitle: string;
  jobCompany: string;
  jobScores?: { skills: number; culture: number; trajectory: number; composite: number };
  outcome: "offer" | "rejected" | "ghosted" | "withdrawn";
  rejectionReason?: string;
  reachedStage?: string;
  daysInPipeline: number;
  notes?: string;
  recordedAt: string;
}

export interface AppState {
  user: StoreUser | null;
  jobs: StoreJob[];
  applications: StoreApplication[];
  resumes: StoreResume[];
  briefing: StoreBriefing | null;
  outcomes: StoreOutcome[];
  agentRunning: boolean;
  agentEvents: AgentEvent[];
  initialized: boolean;
}

// ============================================
// Actions
// ============================================

type Action =
  | { type: "SET_USER"; payload: StoreUser | null }
  | { type: "SET_JOBS"; payload: StoreJob[] }
  | { type: "ADD_JOBS"; payload: StoreJob[] }
  | { type: "SET_APPLICATIONS"; payload: StoreApplication[] }
  | { type: "ADD_APPLICATION"; payload: StoreApplication }
  | { type: "UPDATE_APPLICATION"; payload: { id: string; updates: Partial<StoreApplication> } }
  | { type: "SET_RESUMES"; payload: StoreResume[] }
  | { type: "ADD_RESUME"; payload: StoreResume }
  | { type: "UPDATE_RESUME"; payload: { id: string; updates: Partial<StoreResume> } }
  | { type: "SET_BRIEFING"; payload: StoreBriefing | null }
  | { type: "SET_OUTCOMES"; payload: StoreOutcome[] }
  | { type: "ADD_OUTCOME"; payload: StoreOutcome }
  | { type: "SET_AGENT_RUNNING"; payload: boolean }
  | { type: "SET_AGENT_EVENTS"; payload: AgentEvent[] }
  | { type: "ADD_AGENT_EVENT"; payload: AgentEvent }
  | { type: "SET_INITIALIZED"; payload: boolean };

const initialState: AppState = {
  user: null,
  jobs: [],
  applications: [],
  resumes: [],
  briefing: null,
  outcomes: [],
  agentRunning: false,
  agentEvents: [],
  initialized: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_JOBS":
      return { ...state, jobs: action.payload };
    case "ADD_JOBS": {
      const existingIds = new Set(state.jobs.map((j) => j.id));
      const newJobs = action.payload.filter((j) => !existingIds.has(j.id));
      return { ...state, jobs: [...state.jobs, ...newJobs] };
    }
    case "SET_APPLICATIONS":
      return { ...state, applications: action.payload };
    case "ADD_APPLICATION":
      return { ...state, applications: [...state.applications, action.payload] };
    case "UPDATE_APPLICATION":
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.updates, lastUpdated: new Date().toISOString() } : a
        ),
      };
    case "SET_RESUMES":
      return { ...state, resumes: action.payload };
    case "ADD_RESUME":
      return { ...state, resumes: [...state.resumes, action.payload] };
    case "UPDATE_RESUME":
      return {
        ...state,
        resumes: state.resumes.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      };
    case "SET_BRIEFING":
      return { ...state, briefing: action.payload };
    case "SET_OUTCOMES":
      return { ...state, outcomes: action.payload };
    case "ADD_OUTCOME":
      return { ...state, outcomes: [...state.outcomes, action.payload] };
    case "SET_AGENT_RUNNING":
      return { ...state, agentRunning: action.payload };
    case "SET_AGENT_EVENTS":
      return { ...state, agentEvents: action.payload };
    case "ADD_AGENT_EVENT":
      return { ...state, agentEvents: [...state.agentEvents, action.payload] };
    case "SET_INITIALIZED":
      return { ...state, initialized: action.payload };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// ============================================
// Action Helpers
// ============================================

export function useStoreActions() {
  const { dispatch } = useStore();

  return {
    setUser: useCallback((user: StoreUser | null) => dispatch({ type: "SET_USER", payload: user }), [dispatch]),
    setJobs: useCallback((jobs: StoreJob[]) => dispatch({ type: "SET_JOBS", payload: jobs }), [dispatch]),
    addJobs: useCallback((jobs: StoreJob[]) => dispatch({ type: "ADD_JOBS", payload: jobs }), [dispatch]),
    setApplications: useCallback((apps: StoreApplication[]) => dispatch({ type: "SET_APPLICATIONS", payload: apps }), [dispatch]),
    addApplication: useCallback((app: StoreApplication) => dispatch({ type: "ADD_APPLICATION", payload: app }), [dispatch]),
    updateApplication: useCallback((id: string, updates: Partial<StoreApplication>) => dispatch({ type: "UPDATE_APPLICATION", payload: { id, updates } }), [dispatch]),
    setResumes: useCallback((resumes: StoreResume[]) => dispatch({ type: "SET_RESUMES", payload: resumes }), [dispatch]),
    addResume: useCallback((resume: StoreResume) => dispatch({ type: "ADD_RESUME", payload: resume }), [dispatch]),
    updateResume: useCallback((id: string, updates: Partial<StoreResume>) => dispatch({ type: "UPDATE_RESUME", payload: { id, updates } }), [dispatch]),
    setBriefing: useCallback((briefing: StoreBriefing | null) => dispatch({ type: "SET_BRIEFING", payload: briefing }), [dispatch]),
    setOutcomes: useCallback((outcomes: StoreOutcome[]) => dispatch({ type: "SET_OUTCOMES", payload: outcomes }), [dispatch]),
    addOutcome: useCallback((outcome: StoreOutcome) => dispatch({ type: "ADD_OUTCOME", payload: outcome }), [dispatch]),
    setAgentRunning: useCallback((running: boolean) => dispatch({ type: "SET_AGENT_RUNNING", payload: running }), [dispatch]),
    setAgentEvents: useCallback((events: AgentEvent[]) => dispatch({ type: "SET_AGENT_EVENTS", payload: events }), [dispatch]),
    addAgentEvent: useCallback((event: AgentEvent) => dispatch({ type: "ADD_AGENT_EVENT", payload: event }), [dispatch]),
    setInitialized: useCallback((v: boolean) => dispatch({ type: "SET_INITIALIZED", payload: v }), [dispatch]),
  };
}

// ============================================
// Data Fetching Hook
// ============================================

export function useInitializeStore() {
  const { state } = useStore();
  const actions = useStoreActions();
  const { getIdToken, user } = useAuthContext();

  useEffect(() => {
    if (state.initialized) return;

    async function loadData() {
      try {
        const token = await getIdToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Load user profile
        const profileRes = await fetch("/api/profile", { headers });
        if (profileRes.ok) {
          const { data } = await profileRes.json();
          if (data) actions.setUser(data);
        }

        // Load jobs
        const jobsRes = await fetch("/api/jobs", { headers });
        if (jobsRes.ok) {
          const { data } = await jobsRes.json();
          if (data?.length) actions.setJobs(data);
        }

        // Load applications
        const appsRes = await fetch("/api/applications", { headers });
        if (appsRes.ok) {
          const { data } = await appsRes.json();
          if (data?.length) actions.setApplications(data);
        }

        // Load resumes
        const resumesRes = await fetch("/api/resumes", { headers });
        if (resumesRes.ok) {
          const { data } = await resumesRes.json();
          if (data?.length) actions.setResumes(data);
        }

        // Load today's briefing
        const briefRes = await fetch("/api/agents/briefing", { headers });
        if (briefRes.ok) {
          const { data } = await briefRes.json();
          if (data) actions.setBriefing(data);
        }
      } catch (error) {
        console.error("Store initialization error:", error);
      } finally {
        actions.setInitialized(true);
      }
    }

    loadData();
  }, [state.initialized, actions, getIdToken, user]);
}

