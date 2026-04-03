export interface InterviewSession {
  id: string;
  jobId?: string;
  company: string;
  role: string;
  sessionType: "oa" | "code" | "behavioral";
  scores: InterviewScores;
  weaknessTags: string[];
  completedAt: string;
  improvementNotes: string;
}

export interface InterviewScores {
  overall: number;
  communication?: number;
  problemSolving?: number;
  codeQuality?: number;
  timeManagement?: number;
  pace?: number;
  fillerWords?: number;
  confidence?: number;
  starAdherence?: number;
}

export interface WeaknessItem {
  category: string;
  topic: string;
  occurrenceCount: number;
  studyPlan: StudyResource[];
  lastTested: string;
  improvementDelta: number;
}

export interface StudyResource {
  title: string;
  type: "book" | "video" | "practice";
  url?: string;
}
