/**
 * Job Scraping Tools
 * ==================
 * Functions to fetch jobs from multiple job APIs:
 * - Adzuna, JSearch (RapidAPI), The Muse, Freelancer (RapidAPI)
 * - Remotive, Arbeitnow, HN Who's Hiring
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { JobListing } from "./types";

// ============================================
// Adzuna API
// ============================================

export async function scrapeAdzuna(query = "software developer", limit = 20): Promise<JobListing[]> {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) {
      console.warn("Adzuna API keys not configured");
      return [];
    }

    const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=${limit}&what=${encodeURIComponent(query)}&content-type=application/json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      console.error("Adzuna API error:", response.status);
      return [];
    }

    const data = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return (data.results || []).slice(0, limit).map((job: any): JobListing => {
      const postedTime = new Date(job.created).getTime();
      return {
        id: `adzuna-${job.id}`,
        title: job.title || "Untitled",
        company: job.company?.display_name || "Unknown",
        location: job.location?.display_name || "Unknown",
        salary: job.salary_min && job.salary_max
          ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
          : undefined,
        description: (job.description || "").slice(0, 2000),
        url: job.redirect_url || "",
        source: "Adzuna",
        postedAt: job.created || new Date().toISOString(),
        isFresh: postedTime > oneDayAgo,
        isRemote: /remote|work from home|wfh/i.test(
          `${job.title} ${job.description} ${job.location?.display_name}`
        ),
        extractedSkills: extractSkillsFromText(job.description || ""),
      };
    });
  } catch (error) {
    console.error("Adzuna scrape error:", error);
    return [];
  }
}

// ============================================
// JSearch API (RapidAPI)
// ============================================

export async function scrapeJSearch(query = "developer jobs", limit = 20): Promise<JobListing[]> {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      console.warn("RapidAPI key not configured");
      return [];
    }

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=us&date_posted=all`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error("JSearch API error:", response.status);
      return [];
    }

    const data = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return (data.data || []).slice(0, limit).map((job: any): JobListing => {
      const postedTime = job.job_posted_at_timestamp
        ? job.job_posted_at_timestamp * 1000
        : Date.now();
      return {
        id: `jsearch-${job.job_id || Math.random().toString(36).slice(2)}`,
        title: job.job_title || "Untitled",
        company: job.employer_name || "Unknown",
        location: job.job_city
          ? `${job.job_city}, ${job.job_state || ""}`
          : job.job_country || "Unknown",
        salary:
          job.job_min_salary && job.job_max_salary
            ? `$${Math.round(job.job_min_salary / 1000)}k - $${Math.round(job.job_max_salary / 1000)}k`
            : undefined,
        description: (job.job_description || "").slice(0, 2000),
        url: job.job_apply_link || job.job_google_link || "",
        source: "JSearch",
        postedAt: job.job_posted_at_datetime_utc || new Date(postedTime).toISOString(),
        isFresh: postedTime > oneDayAgo,
        isRemote: job.job_is_remote || false,
        extractedSkills: extractSkillsFromText(job.job_description || ""),
      };
    });
  } catch (error) {
    console.error("JSearch scrape error:", error);
    return [];
  }
}

// ============================================
// The Muse API
// ============================================

export async function scrapeMuse(limit = 20): Promise<JobListing[]> {
  try {
    const apiKey = process.env.MUSE_API_KEY;
    const url = apiKey
      ? `https://www.themuse.com/api/public/jobs?page=0&api_key=${apiKey}`
      : `https://www.themuse.com/api/public/jobs?page=0`;

    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      console.error("Muse API error:", response.status);
      return [];
    }

    const data = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return (data.results || []).slice(0, limit).map((job: any): JobListing => {
      const postedTime = new Date(job.publication_date).getTime();
      const locations = (job.locations || [])
        .map((l: any) => l.name)
        .join(", ");

      return {
        id: `muse-${job.id}`,
        title: job.name || "Untitled",
        company: job.company?.name || "Unknown",
        location: locations || "Various",
        description: (job.contents || "").replace(/<[^>]*>/g, "").slice(0, 2000),
        url: job.refs?.landing_page || "",
        source: "The Muse",
        postedAt: job.publication_date || new Date().toISOString(),
        isFresh: postedTime > oneDayAgo,
        isRemote: /remote|flexible/i.test(locations),
        extractedSkills: extractSkillsFromText(
          (job.contents || "").replace(/<[^>]*>/g, "")
        ),
      };
    });
  } catch (error) {
    console.error("Muse scrape error:", error);
    return [];
  }
}

// ============================================
// Freelancer API (RapidAPI)
// ============================================

export async function scrapeFreelancer(limit = 15): Promise<JobListing[]> {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      console.warn("RapidAPI key not configured for Freelancer");
      return [];
    }

    const url = `https://freelancer-api.p.rapidapi.com/find-freelancers/1`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "freelancer-api.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error("Freelancer API error:", response.status);
      return [];
    }

    const data = await response.json();
    const results = data.results || data.data || data.freelancers || [];
    if (!Array.isArray(results)) return [];

    return results.slice(0, limit).map((item: any, i: number): JobListing => ({
      id: `freelancer-${item.id || i}-${Date.now()}`,
      title: item.title || item.username || "Freelance Project",
      company: "Freelancer.com",
      location: item.location || item.country || "Remote",
      salary: item.hourly_rate
        ? `$${item.hourly_rate}/hr`
        : item.budget
          ? `$${item.budget}`
          : undefined,
      description: (item.description || item.tagline || "").slice(0, 2000),
      url: item.profile_url || item.url || "https://www.freelancer.com",
      source: "Freelancer",
      postedAt: item.created_at || new Date().toISOString(),
      isFresh: true,
      isRemote: true,
      extractedSkills: item.skills || extractSkillsFromText(item.description || ""),
    }));
  } catch (error) {
    console.error("Freelancer scrape error:", error);
    return [];
  }
}

// ============================================
// Remotive API (Remote Jobs)
// ============================================

export async function scrapeRemotive(category = "software-dev", limit = 20): Promise<JobListing[]> {
  try {
    const url = `https://remotive.com/api/remote-jobs?category=${category}&limit=${limit}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      console.error("Remotive API error:", response.status);
      return [];
    }

    const data = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return (data.jobs || []).map((job: any): JobListing => {
      const postedTime = new Date(job.publication_date).getTime();
      return {
        id: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        salary: job.salary || undefined,
        description: (job.description || "").slice(0, 2000),
        url: job.url,
        source: "Remotive",
        postedAt: job.publication_date,
        isFresh: postedTime > oneDayAgo,
        isRemote: true,
        extractedSkills: job.tags || [],
      };
    });
  } catch (error) {
    console.error("Remotive scrape error:", error);
    return [];
  }
}

// ============================================
// Arbeitnow API
// ============================================

export async function scrapeArbeitnow(limit = 20): Promise<JobListing[]> {
  try {
    const url = "https://arbeitnow.com/api/job-board-api";
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      console.error("Arbeitnow API error:", response.status);
      return [];
    }

    const data = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return (data.data || []).slice(0, limit).map((job: any): JobListing => {
      const postedTime = job.created_at * 1000;
      return {
        id: `arbeitnow-${job.slug}`,
        title: job.title,
        company: job.company_name,
        location: job.location || "Europe",
        description: (job.description || "").slice(0, 2000),
        url: job.url,
        source: "Arbeitnow",
        postedAt: new Date(postedTime).toISOString(),
        isFresh: postedTime > oneDayAgo,
        isRemote: job.remote,
        extractedSkills: job.tags || [],
      };
    });
  } catch (error) {
    console.error("Arbeitnow scrape error:", error);
    return [];
  }
}

// ============================================
// HN Who's Hiring
// ============================================

export async function scrapeHNWhoIsHiring(limit = 20): Promise<JobListing[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=hiring&tags=comment,ask_hn&hitsPerPage=${limit}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) return [];

    const data = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return (data.hits || [])
      .filter((hit: any) => hit.comment_text && hit.comment_text.length > 100)
      .slice(0, limit)
      .map((hit: any): JobListing => {
        const text = hit.comment_text || "";
        const firstLine = text.split("\n")[0] || "Job Posting";
        const companyMatch = firstLine.match(/^([^|]+)/);
        const company = companyMatch ? companyMatch[1].trim().slice(0, 50) : "Unknown";
        const locationMatch = text.match(/(?:Location|Based in|Office):\s*([^\n|]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : "Various";
        const isRemote = /remote|anywhere|distributed/i.test(text);
        const postedTime = new Date(hit.created_at).getTime();

        return {
          id: `hn-${hit.objectID}`,
          title: firstLine.slice(0, 100),
          company,
          location,
          description: text.slice(0, 2000),
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          source: "HN Who's Hiring",
          postedAt: hit.created_at,
          isFresh: postedTime > oneDayAgo,
          isRemote,
          extractedSkills: extractSkillsFromText(text),
        };
      });
  } catch (error) {
    console.error("HN scrape error:", error);
    return [];
  }
}

// ============================================
// Helper Functions
// ============================================

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "C#",
  "React", "Vue", "Angular", "Node.js", "Next.js", "Express", "Django", "Flask",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
  "Machine Learning", "AI", "Data Science", "DevOps", "SRE",
  "Swift", "Kotlin", "Ruby", "PHP", "Scala", "Figma",
];

function extractSkillsFromText(text: string): string[] {
  const skills: string[] = [];
  const lowerText = text.toLowerCase();
  for (const skill of COMMON_SKILLS) {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  }
  return skills.slice(0, 10);
}

// ============================================
// Combined Scraper
// ============================================

export async function scrapeAllSources(limit = 15): Promise<JobListing[]> {
  // Run all scrapers in parallel with individual error handling
  const [adzuna, jsearch, muse, freelancer, remotive, arbeitnow, hn] =
    await Promise.allSettled([
      scrapeAdzuna("software developer", limit),
      scrapeJSearch("developer jobs in US", limit),
      scrapeMuse(limit),
      scrapeFreelancer(limit),
      scrapeRemotive("software-dev", limit),
      scrapeArbeitnow(limit),
      scrapeHNWhoIsHiring(limit),
    ]);

  const extract = (r: PromiseSettledResult<JobListing[]>) =>
    r.status === "fulfilled" ? r.value : [];

  const allJobs = [
    ...extract(adzuna),
    ...extract(jsearch),
    ...extract(muse),
    ...extract(freelancer),
    ...extract(remotive),
    ...extract(arbeitnow),
    ...extract(hn),
  ];

  // Deduplicate by title+company
  const seen = new Set<string>();
  const unique: JobListing[] = [];
  for (const job of allJobs) {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  // Sort: fresh first, then by date
  return unique.sort((a, b) => {
    if (a.isFresh && !b.isFresh) return -1;
    if (!a.isFresh && b.isFresh) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}
