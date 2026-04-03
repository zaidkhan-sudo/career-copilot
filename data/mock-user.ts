import type { UserProfile } from "@/types/user";

export const mockUser: UserProfile = {
  id: "u1",
  name: "Anurag",
  email: "anurag@careerpilot.dev",
  avatar: "",
  title: "Full-Stack Developer",
  skills: [
    { name: "React", level: "expert" },
    { name: "Next.js", level: "advanced" },
    { name: "TypeScript", level: "advanced" },
    { name: "Node.js", level: "advanced" },
    { name: "Python", level: "intermediate" },
    { name: "PostgreSQL", level: "advanced" },
    { name: "Redis", level: "intermediate" },
    { name: "Docker", level: "intermediate" },
    { name: "AWS", level: "intermediate" },
    { name: "Go", level: "beginner" },
    { name: "Kafka", level: "beginner" },
  ],
  careerGoal: "Senior Engineer at a top tech company within 3 years",
  preferences: {
    workMode: "remote",
    locations: ["San Francisco", "New York", "Remote"],
    companySize: "any",
    salaryMin: 120000,
    salaryMax: 220000,
    visaSponsorship: false,
    industries: ["Tech", "Fintech", "SaaS"],
  },
  education: [
    {
      institution: "University of Mumbai",
      degree: "B.Tech",
      field: "Computer Science",
      year: 2024,
    },
  ],
  experience: [
    {
      company: "TechStartup Inc.",
      title: "Software Engineer",
      duration: "Jan 2024 – Present",
      description:
        "Built full-stack applications with Next.js and Node.js, serving 50K+ users.",
      skills: ["React", "Next.js", "Node.js", "PostgreSQL"],
    },
  ],
  githubConnected: true,
};
