/**
 * Scout Agent
 * ===========
 * Discovers jobs from multiple sources and filters by user preferences.
 */

import type { AgentState, JobListing, UserProfile } from "./types";
import { AgentType, EventStatus, addEvent } from "./types";
import { scrapeAllSources } from "./scrapers";

/**
 * Filter jobs based on user preferences
 */
function filterJobsByPreferences(jobs: JobListing[], profile: UserProfile | null): JobListing[] {
  if (!profile || !profile.preferences) return jobs;
  
  const prefs = profile.preferences;
  
  return jobs.filter((job) => {
    // Work mode filter
    if (prefs.workMode && prefs.workMode !== "any") {
      if (prefs.workMode === "remote" && !job.isRemote) return false;
      if (prefs.workMode === "onsite" && job.isRemote) return false;
    }
    
    // Location filter (if not remote)
    const locations = prefs.locations || [];
    if (!job.isRemote && locations.length > 0) {
      const jobLocation = job.location.toLowerCase();
      const matchesLocation = locations.some((loc) =>
        jobLocation.includes(loc.toLowerCase())
      );
      if (!matchesLocation) return false;
    }
    
    // Exclude companies
    const excludeCompanies = prefs.excludeCompanies || [];
    if (excludeCompanies.length > 0) {
      const companyLower = job.company.toLowerCase();
      if (excludeCompanies.some((c) => companyLower.includes(c.toLowerCase()))) {
        return false;
      }
    }
    
    // Role relevance (basic keyword matching)
    const targetRoles = prefs.targetRoles || [];
    if (targetRoles.length > 0) {
      const titleLower = job.title.toLowerCase();
      const descLower = job.description.toLowerCase();
      targetRoles.some((role) => {
        const roleLower = role.toLowerCase();
        return titleLower.includes(roleLower) || descLower.includes(roleLower);
      });
      // Be lenient - only filter out if very clearly not matching
      // if (!matchesRole) return false;
    }
    
    return true;
  });
}

/**
 * Scout Agent Node
 * Scrapes job boards and filters by user preferences.
 */
export async function scoutAgent(state: AgentState): Promise<AgentState> {
  let newState = addEvent(
    state,
    AgentType.SCOUT,
    "Starting job discovery...",
    EventStatus.RUNNING
  );
  newState.currentAgent = AgentType.SCOUT;
  
  try {
    // Scrape all sources
    newState = addEvent(
      newState,
      AgentType.SCOUT,
      "Scanning Remotive, Arbeitnow, HN Who's Hiring...",
      EventStatus.RUNNING
    );
    
    const allJobs = await scrapeAllSources(20);
    
    newState = addEvent(
      newState,
      AgentType.SCOUT,
      `Found ${allJobs.length} jobs from all sources`,
      EventStatus.RUNNING,
      { totalFound: allJobs.length }
    );
    
    // Filter by preferences
    const filteredJobs = filterJobsByPreferences(allJobs, newState.userProfile);
    
    const freshCount = filteredJobs.filter((j) => j.isFresh).length;
    const remoteCount = filteredJobs.filter((j) => j.isRemote).length;
    
    newState = addEvent(
      newState,
      AgentType.SCOUT,
      `Discovered ${filteredJobs.length} matching jobs (${freshCount} fresh, ${remoteCount} remote)`,
      EventStatus.COMPLETED,
      { matched: filteredJobs.length, fresh: freshCount, remote: remoteCount }
    );
    
    return {
      ...newState,
      discoveredJobs: filteredJobs,
    };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return {
      ...addEvent(
        newState,
        AgentType.SCOUT,
        `Scout failed: ${errorMsg}`,
        EventStatus.FAILED
      ),
      error: errorMsg,
    };
  }
}
