// Database feature — Firestore collection types

/** Firestore document types matching CareerPilot collections */
export interface DbSchema {
  profiles: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    title: string;
    skills: { name: string; level: string }[];
    career_goal: string;
    preferences: Record<string, unknown>;
    education: Record<string, unknown>[];
    experience: Record<string, unknown>[];
    onboarding_complete: boolean;
    created_at: string;
    updated_at: string;
  };
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    url: string;
    source: string;
    posted_at: string;
    is_fresh: boolean;
    is_remote: boolean;
    extracted_skills: string[];
    scores: Record<string, number>;
    hidden_requirements: Record<string, unknown>[];
    ai_reasoning: string;
    discovered_at: string;
    user_id: string;
  };
  applications: {
    id: string;
    job_id: string;
    user_id: string;
    status: string;
    resume_variant_id: string;
    rejection_reason: string;
    notes: string;
    applied_at: string;
    last_updated: string;
  };
  resume_variants: {
    id: string;
    user_id: string;
    job_id: string;
    framing_strategy: string;
    content: string;
    cover_letter: string;
    status: string;
    callback_count: number;
    total_sent: number;
    created_at: string;
  };
  interview_sessions: {
    id: string;
    user_id: string;
    company: string;
    role: string;
    session_type: string;
    questions: Record<string, unknown>[];
    answers: Record<string, unknown>[];
    scores: Record<string, number>;
    improvement_notes: string;
    completed_at: string;
  };
}
