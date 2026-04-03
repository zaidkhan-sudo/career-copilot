import type { Job } from "./job";

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  resumeVariantId: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  coverLetter?: string;
  appliedAt: string;
  lastUpdated: string;
}

export type ApplicationStatus =
  | "discovered"
  | "applied"
  | "screening"
  | "interviewing"
  | "offered"
  | "rejected";
