export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  skills: Skill[];
  careerGoal: string;
  preferences: JobPreferences;
  education: Education[];
  experience: Experience[];
  githubConnected: boolean;
  linkedinUrl?: string;
}

export interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface Experience {
  company: string;
  title: string;
  duration: string;
  description: string;
  skills: string[];
}

export interface JobPreferences {
  workMode: "remote" | "hybrid" | "onsite" | "any";
  locations: string[];
  companySize: "startup" | "mid" | "large" | "any";
  salaryMin?: number;
  salaryMax?: number;
  visaSponsorship: boolean;
  industries: string[];
}
