/**
 * Job Scraping Tools
 * ==================
 * Functions to fetch jobs from various free job APIs.
 */

import type { JobListing } from "./types";

// ============================================
// Remotive API (Remote Jobs)
// ============================================

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  url: string;
  publication_date: string;
  tags: string[];
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

export async function scrapeRemotive(category = "software-dev", limit = 20): Promise<JobListing[]> {
  try {
    const url = `https://remotive.com/api/remote-jobs?category=${category}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Remotive API error:", response.status);
      return [];
    }
    
    const data: RemotiveResponse = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    return data.jobs.map((job): JobListing => {
      const postedTime = new Date(job.publication_date).getTime();
      
      return {
        id: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        salary: job.salary || undefined,
        description: job.description.slice(0, 2000),
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
// Arbeitnow API (European Jobs)
// ============================================

interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  url: string;
  created_at: number;
  tags: string[];
  remote: boolean;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

export async function scrapeArbeitnow(limit = 20): Promise<JobListing[]> {
  try {
    const url = "https://arbeitnow.com/api/job-board-api";
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Arbeitnow API error:", response.status);
      return [];
    }
    
    const data: ArbeitnowResponse = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    return data.data.slice(0, limit).map((job): JobListing => {
      const postedTime = job.created_at * 1000;
      
      return {
        id: `arbeitnow-${job.slug}`,
        title: job.title,
        company: job.company_name,
        location: job.location || "Europe",
        description: job.description.slice(0, 2000),
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
// HN Who's Hiring (via Algolia)
// ============================================

interface HNHit {
  objectID: string;
  comment_text: string;
  created_at: string;
}

interface HNResponse {
  hits: HNHit[];
}

export async function scrapeHNWhoIsHiring(limit = 20): Promise<JobListing[]> {
  try {
    // Search for recent "Who's Hiring" posts
    const url = `https://hn.algolia.com/api/v1/search?query=hiring&tags=comment,ask_hn&hitsPerPage=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("HN Algolia API error:", response.status);
      return [];
    }
    
    const data: HNResponse = await response.json();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    return data.hits
      .filter((hit) => hit.comment_text && hit.comment_text.length > 100)
      .slice(0, limit)
      .map((hit): JobListing => {
        const text = hit.comment_text || "";
        const firstLine = text.split("\n")[0] || "Job Posting";
        
        // Extract company name (usually at start)
        const companyMatch = firstLine.match(/^([^|]+)/);
        const company = companyMatch ? companyMatch[1].trim().slice(0, 50) : "Unknown";
        
        // Extract location if present
        const locationMatch = text.match(/(?:Location|Based in|Office):\s*([^\n|]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : "Various";
        
        // Check for remote
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
  "React", "Vue", "Angular", "Node.js", "Next.js", "Express",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
  "Machine Learning", "AI", "Data Science", "DevOps", "SRE",
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
  const [remotive, arbeitnow, hn] = await Promise.all([
    scrapeRemotive("software-dev", limit),
    scrapeArbeitnow(limit),
    scrapeHNWhoIsHiring(limit),
  ]);
  
  // Combine and deduplicate by title+company
  const seen = new Set<string>();
  const allJobs: JobListing[] = [];
  
  for (const job of [...remotive, ...arbeitnow, ...hn]) {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      allJobs.push(job);
    }
  }
  
  // Sort by freshness
  return allJobs.sort((a, b) => {
    if (a.isFresh && !b.isFresh) return -1;
    if (!a.isFresh && b.isFresh) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}
