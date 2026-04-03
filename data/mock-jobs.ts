import type { Job } from "@/types/job";

export const mockJobs: Job[] = [
  {
    id: "j1",
    title: "Senior Backend Engineer",
    company: "Stripe",
    location: "San Francisco (Remote OK)",
    salary: "$180-220K",
    source: "LinkedIn",
    sourceUrl: "https://linkedin.com/jobs/stripe-sbe",
    postedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    discoveredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isFresh: true,
    isRemote: true,
    description:
      "Join Stripe's payments infrastructure team to build highly scalable distributed systems that process billions of dollars. You'll work on real-time payment orchestration, fraud detection pipelines, and merchant-facing APIs.",
    requiredSkills: [
      "Python", "Go", "PostgreSQL", "Redis", "Kafka", "AWS", "Docker",
      "Distributed Systems", "API Design",
    ],
    niceToHaveSkills: ["Terraform", "gRPC", "Service Mesh"],
    scores: { skills: 92, culture: 87, trajectory: 94, composite: 92 },
    hiddenRequirements: [
      { signal: '"Fast-paced environment"', interpretation: "Likely expects high autonomy and quick shipping cycles", severity: "info" },
      { signal: '"Distributed systems"', interpretation: "Implies Kafka, gRPC, service mesh experience beyond what is listed", severity: "warning" },
      { signal: "No salary listed", interpretation: "Levels.fyi suggests $180-220K for this role", severity: "info" },
    ],
    aiReasoning:
      'Ranked #1 because: matches 9 of your 11 listed skills, the company engineering blog suggests they value distributed systems work, Glassdoor reviews mention strong mentorship culture (4.2★), and it was posted 4 hours ago (3× higher response rate in first 24 hours).',
  },
  {
    id: "j2",
    title: "Full-Stack Developer",
    company: "Vercel",
    location: "Remote",
    salary: "$150-190K",
    source: "Wellfound",
    sourceUrl: "https://wellfound.com/jobs/vercel-fsd",
    postedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    discoveredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isFresh: true,
    isRemote: true,
    description:
      "Build the future of web development at Vercel. Work on Next.js, Turborepo, and the Vercel platform to empower millions of developers worldwide.",
    requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Vercel"],
    niceToHaveSkills: ["Rust", "Go", "Edge Computing"],
    scores: { skills: 88, culture: 91, trajectory: 84, composite: 88 },
    hiddenRequirements: [
      { signal: '"Developer experience focus"', interpretation: "Strong emphasis on DX — you will need OSS contribution experience", severity: "info" },
    ],
    aiReasoning:
      "Aligns perfectly with your Next.js expertise and full-stack background. Vercel's culture scores high on innovation and work-life balance. The role builds skills directly aligned with your career trajectory.",
  },
  {
    id: "j3",
    title: "Software Engineer",
    company: "Notion",
    location: "San Francisco",
    salary: "$160-200K",
    source: "Otta",
    sourceUrl: "https://otta.com/jobs/notion-se",
    postedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    discoveredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isFresh: false,
    isRemote: false,
    description:
      "Help build Notion's collaborative workspace used by millions. Work on real-time collaboration, data modeling, and performance optimization.",
    requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "WebSockets"],
    niceToHaveSkills: ["CRDT", "Rust", "Performance Optimization"],
    scores: { skills: 85, culture: 82, trajectory: 88, composite: 85 },
    hiddenRequirements: [
      { signal: '"Collaborative editing"', interpretation: "Implies deep knowledge of CRDTs and real-time sync patterns", severity: "warning" },
    ],
    aiReasoning:
      "Career trajectory match: technical leadership path. Notion is known for strong engineering culture. The role offers exposure to complex distributed systems and collaboration tech.",
  },
  {
    id: "j4",
    title: "Platform Engineer",
    company: "Datadog",
    location: "New York (Hybrid)",
    salary: "$170-210K",
    source: "LinkedIn",
    sourceUrl: "https://linkedin.com/jobs/datadog-pe",
    postedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    discoveredAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isFresh: true,
    isRemote: false,
    description:
      "Build and scale Datadog's platform infrastructure that handles trillions of data points per day.",
    requiredSkills: ["Go", "Kafka", "Docker", "Kubernetes", "AWS", "Terraform"],
    niceToHaveSkills: ["Rust", "eBPF", "OpenTelemetry"],
    scores: { skills: 72, culture: 78, trajectory: 81, composite: 76 },
    hiddenRequirements: [
      { signal: '"Trillions of data points"', interpretation: "Extreme scale — expects deep systems programming knowledge", severity: "critical" },
    ],
    aiReasoning:
      "Good trajectory fit for systems engineering growth. Skills gap in Go and Kubernetes, but the role offers excellent learning opportunities. Culture scores well on technical depth.",
  },
  {
    id: "j5",
    title: "Frontend Engineer",
    company: "Linear",
    location: "Remote",
    salary: "$140-180K",
    source: "Himalayas",
    sourceUrl: "https://himalayas.app/jobs/linear-fe",
    postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    discoveredAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    isFresh: true,
    isRemote: true,
    description:
      "Build the fastest project management tool in the world. Focus on buttery-smooth animations, keyboard-first UX, and offline-first architecture.",
    requiredSkills: ["React", "TypeScript", "CSS", "Performance Optimization"],
    niceToHaveSkills: ["WebGL", "WASM", "Service Workers"],
    scores: { skills: 90, culture: 93, trajectory: 79, composite: 87 },
    hiddenRequirements: [
      { signal: '"Buttery-smooth animations"', interpretation: "Expects deep CSS/animation performance knowledge, not just basic UI", severity: "info" },
    ],
    aiReasoning:
      "Excellent culture fit — Linear is known for craft and engineering excellence. Strong skills overlap on frontend. Lower trajectory score as the role is frontend-focused vs your full-stack goals.",
  },
  {
    id: "j6",
    title: "SDE-2",
    company: "Razorpay",
    location: "Bangalore (Hybrid)",
    salary: "₹25-40L",
    source: "Wellfound",
    sourceUrl: "https://wellfound.com/jobs/razorpay-sde2",
    postedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    discoveredAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    isFresh: true,
    isRemote: false,
    description:
      "Build payment infrastructure for India's leading fintech. Work on high-throughput transaction processing and merchant APIs.",
    requiredSkills: ["Node.js", "React", "PostgreSQL", "Redis", "Docker"],
    niceToHaveSkills: ["Go", "Kafka", "Kubernetes"],
    scores: { skills: 82, culture: 75, trajectory: 79, composite: 79 },
    hiddenRequirements: [
      { signal: '"High-throughput transactions"', interpretation: "Expects experience with concurrent systems and payment domain knowledge", severity: "warning" },
    ],
    aiReasoning:
      "Strong skills match with your Node.js and React experience. Fintech domain aligns with your industry preferences. Good stepping stone for distributed systems expertise.",
  },
];
