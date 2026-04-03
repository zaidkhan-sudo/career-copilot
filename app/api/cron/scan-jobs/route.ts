/**
 * Cron Job: Scan Jobs
 * ====================
 * Runs every 6 hours via Vercel Cron.
 * Scans all job sources, finds new jobs, emails users.
 */

import { NextRequest, NextResponse } from "next/server";
import { scrapeAllSources } from "@/lib/agents/scrapers";
import {
  getAllUserProfiles,
  getJobExternalIds,
  upsertJobs,
  createCronRun,
  completeCronRun,
} from "@/lib/firebase/firestore";
import { sendNewJobsEmail } from "@/lib/email/postmark";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const manualSecret = process.env.MANUAL_CRON_SECRET;
  const isManualTrigger = request.nextUrl.searchParams.get("manual") === "true";
  const manualHeader = request.headers.get("x-manual-cron-secret") || authHeader;

  if (isManualTrigger) {
    if (!manualSecret || manualHeader !== `Bearer ${manualSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const run = await createCronRun({ status: "running", type: "scan-jobs" });

  try {
    // 1. Scrape all sources
    const allJobs = await scrapeAllSources(20);
    console.log(`[CRON] Scraped ${allJobs.length} total jobs`);

    // 2. Get all user profiles
    const users = await getAllUserProfiles();
    let totalNewJobs = 0;
    let emailsSent = 0;

    // 3. For each user, find new jobs and notify
    for (const user of users) {
      const userId = user.id;
      const userEmail = (user as any).email;
      if (!userEmail) continue;

      try {
        // Get existing job IDs for this user
        const existingIds = await getJobExternalIds(userId);

        // Find truly new jobs
        const newJobs = allJobs.filter((j) => !existingIds.has(j.id));

        if (newJobs.length === 0) continue;

        // Save new jobs to Firestore
        const jobsToSave = newJobs.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          salary: j.salary,
          description: j.description,
          url: j.url,
          source: j.source,
          posted_at: j.postedAt,
          is_fresh: j.isFresh,
          is_remote: j.isRemote,
          extracted_skills: j.extractedSkills,
        }));

        await upsertJobs(userId, jobsToSave);
        totalNewJobs += newJobs.length;

        // Send email notification
        const emailJobs = newJobs.slice(0, 10).map((j) => ({
          title: j.title,
          company: j.company,
          location: j.location,
          salary: j.salary,
          source: j.source,
          score: j.scores?.composite,
          url: j.url,
        }));

        const sent = await sendNewJobsEmail(userEmail, emailJobs);
        if (sent) emailsSent++;
      } catch (error) {
        console.error("[CRON] User processing failed", {
          userId,
          userEmail,
          error,
        });
      }
    }

    await completeCronRun(run.id, {
      jobs_found: allJobs.length,
      new_jobs: totalNewJobs,
      emails_sent: emailsSent,
      users_processed: users.length,
    });

    return NextResponse.json({
      success: true,
      jobsScraped: allJobs.length,
      newJobsSaved: totalNewJobs,
      emailsSent,
      usersProcessed: users.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[CRON] Error:", msg);

    await completeCronRun(run.id, { status: "failed", error: msg });

    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
