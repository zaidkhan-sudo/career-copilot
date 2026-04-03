// Database queries — delegated to lib/firebase/firestore.ts
// This file is kept for backwards compatibility but all real queries
// are in lib/firebase/firestore.ts

export {
  getJobs,
  getApplications,
  getResumes,
  getInterviewSessions,
} from "@/lib/firebase/firestore";
