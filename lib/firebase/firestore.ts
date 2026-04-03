/**
 * Firestore Queries
 * ==================
 * All CRUD operations for CareerPilot collections.
 * Uses Firebase Admin Firestore (server-side).
 *
 * Collections:
 * - profiles
 * - jobs
 * - applications
 * - resume_variants
 * - interview_sessions
 * - outcomes
 * - briefings
 * - agent_runs
 */

import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

// ============================================
// Profiles
// ============================================

export async function getProfile(userId: string) {
  const doc = await adminDb.collection("profiles").doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function upsertProfile(
  userId: string,
  profile: Record<string, unknown>
) {
  const ref = adminDb.collection("profiles").doc(userId);
  await ref.set(
    { ...profile, updated_at: FieldValue.serverTimestamp() },
    { merge: true }
  );
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

// ============================================
// Jobs
// ============================================

export async function getJobs(userId: string) {
  const snapshot = await adminDb
    .collection("jobs")
    .where("user_id", "==", userId)
    .orderBy("discovered_at", "desc")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function upsertJobs(
  userId: string,
  jobs: Record<string, unknown>[]
) {
  const batch = adminDb.batch();
  const results: Record<string, unknown>[] = [];

  for (const job of jobs) {
    const id = (job.id as string) || adminDb.collection("jobs").doc().id;
    const ref = adminDb.collection("jobs").doc(id);
    const data = {
      ...job,
      id,
      user_id: userId,
      discovered_at: job.discovered_at || FieldValue.serverTimestamp(),
    };
    batch.set(ref, data, { merge: true });
    results.push({ id, ...data });
  }

  await batch.commit();
  return results;
}

// ============================================
// Applications
// ============================================

export async function getApplications(userId: string) {
  const snapshot = await adminDb
    .collection("applications")
    .where("user_id", "==", userId)
    .orderBy("last_updated", "desc")
    .get();

  const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Attach job data
  for (const app of apps) {
    const jobId = (app as Record<string, unknown>).job_id as string;
    if (jobId) {
      const jobDoc = await adminDb.collection("jobs").doc(jobId).get();
      if (jobDoc.exists) {
        (app as Record<string, unknown>).jobs = {
          id: jobDoc.id,
          ...jobDoc.data(),
        };
      }
    }
  }

  return apps;
}

export async function createApplication(
  userId: string,
  app: Record<string, unknown>
) {
  const ref = adminDb.collection("applications").doc();
  const data = {
    ...app,
    user_id: userId,
    created_at: FieldValue.serverTimestamp(),
    last_updated: FieldValue.serverTimestamp(),
  };
  await ref.set(data);
  return { id: ref.id, ...data };
}

export async function updateApplicationStatus(
  appId: string,
  status: string,
  extra?: Record<string, unknown>
) {
  const ref = adminDb.collection("applications").doc(appId);
  const updates = {
    status,
    last_updated: FieldValue.serverTimestamp(),
    ...extra,
  };
  await ref.update(updates);
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

// ============================================
// Resume Variants
// ============================================

export async function getResumes(userId: string) {
  const snapshot = await adminDb
    .collection("resume_variants")
    .where("user_id", "==", userId)
    .orderBy("created_at", "desc")
    .get();

  const resumes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Attach job info
  for (const resume of resumes) {
    const jobId = (resume as Record<string, unknown>).job_id as string;
    if (jobId) {
      const jobDoc = await adminDb.collection("jobs").doc(jobId).get();
      if (jobDoc.exists) {
        const jobData = jobDoc.data();
        (resume as Record<string, unknown>).jobs = {
          title: jobData?.title,
          company: jobData?.company,
        };
      }
    }
  }

  return resumes;
}

export async function upsertResume(
  userId: string,
  resume: Record<string, unknown>
) {
  const id =
    (resume.id as string) || adminDb.collection("resume_variants").doc().id;
  const ref = adminDb.collection("resume_variants").doc(id);
  const data = {
    ...resume,
    id,
    user_id: userId,
    created_at: resume.created_at || FieldValue.serverTimestamp(),
  };
  await ref.set(data, { merge: true });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

// ============================================
// Interview Sessions
// ============================================

export async function getInterviewSessions(userId: string) {
  const snapshot = await adminDb
    .collection("interview_sessions")
    .where("user_id", "==", userId)
    .orderBy("completed_at", "desc")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function upsertInterviewSession(
  userId: string,
  session: Record<string, unknown>
) {
  const id =
    (session.id as string) ||
    adminDb.collection("interview_sessions").doc().id;
  const ref = adminDb.collection("interview_sessions").doc(id);
  const data = {
    ...session,
    id,
    user_id: userId,
    completed_at: session.completed_at || FieldValue.serverTimestamp(),
  };
  await ref.set(data, { merge: true });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

// ============================================
// Outcomes (Evolution)
// ============================================

export async function getOutcomes(userId: string) {
  const snapshot = await adminDb
    .collection("outcomes")
    .where("user_id", "==", userId)
    .orderBy("recorded_at", "desc")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function upsertOutcome(
  userId: string,
  outcome: Record<string, unknown>
) {
  const ref = adminDb.collection("outcomes").doc();
  const data = {
    ...outcome,
    user_id: userId,
    recorded_at: FieldValue.serverTimestamp(),
  };
  await ref.set(data);
  return { id: ref.id, ...data };
}

// ============================================
// Briefings
// ============================================

export async function getLatestBriefing(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const snapshot = await adminDb
    .collection("briefings")
    .where("user_id", "==", userId)
    .where("date", "==", today)
    .orderBy("generated_at", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function upsertBriefing(
  userId: string,
  briefing: Record<string, unknown>
) {
  const ref = adminDb.collection("briefings").doc();
  const data = {
    ...briefing,
    user_id: userId,
    date: new Date().toISOString().split("T")[0],
    generated_at: FieldValue.serverTimestamp(),
  };
  await ref.set(data);
  return { id: ref.id, ...data };
}

// ============================================
// Agent Runs
// ============================================

export async function createAgentRun(userId: string) {
  const ref = adminDb.collection("agent_runs").doc();
  const data = {
    user_id: userId,
    status: "running",
    started_at: FieldValue.serverTimestamp(),
  };
  await ref.set(data);
  return { id: ref.id, ...data };
}

export async function completeAgentRun(
  runId: string,
  result: Record<string, unknown>
) {
  const ref = adminDb.collection("agent_runs").doc(runId);
  const updates = {
    ...result,
    status: "completed",
    completed_at: FieldValue.serverTimestamp(),
  };
  await ref.update(updates);
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}
