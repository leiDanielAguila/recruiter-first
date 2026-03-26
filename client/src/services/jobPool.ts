import { create } from "zustand";

export type ApplicationStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type JobApplication = {
  id: string;
  job: string;
  company: string;
  date: string;
  status: ApplicationStatus;
  description: string;
  // placeholder auto-fill data for Letter Architect
  hiringManagerName: string;
  requirements: string[];
};

type JobPoolStore = {
  jobs: JobApplication[];
  addJob: (job: Omit<JobApplication, "id">) => void;
  removeJob: (id: string) => void;
  updateJobStatus: (id: string, status: ApplicationStatus) => void;
};

const INITIAL_JOBS: JobApplication[] = [
  {
    id: "1",
    job: "Senior Frontend Engineer",
    company: "Stripe",
    date: "2026-03-01",
    status: "Interviewing",
    hiringManagerName: "Emily Chen",
    requirements: [
      "5+ years of professional experience with React and TypeScript",
      "Strong understanding of browser performance, accessibility, and web standards",
      "Experience with testing frameworks (Jest, Playwright, or similar)",
      "Excellent communication and cross-functional collaboration skills",
    ],
    description: `We are looking for a Senior Frontend Engineer to join our payments infrastructure team at Stripe.

Responsibilities:
- Build and maintain high-quality, scalable frontend systems used by millions of businesses worldwide
- Collaborate closely with product, design, and backend engineers to ship impactful features
- Lead frontend architecture decisions and mentor junior engineers
- Contribute to Stripe's internal design system and shared component libraries

Requirements:
- 5+ years of professional experience with React and TypeScript
- Strong understanding of browser performance, accessibility, and web standards
- Experience with testing frameworks (Jest, Playwright, or similar)
- Excellent communication and cross-functional collaboration skills

Nice to have:
- Experience with large-scale monorepos
- Contributions to open-source projects`,
  },
  {
    id: "2",
    job: "Product Designer",
    company: "Linear",
    date: "2026-03-03",
    status: "Applied",
    hiringManagerName: "Alex Rivera",
    requirements: [
      "3+ years of product design experience at a SaaS company",
      "Strong portfolio demonstrating systems thinking and attention to detail",
      "Proficiency in Figma and familiarity with design tokens/systems",
      "Ability to work autonomously and move quickly without sacrificing quality",
    ],
    description: `Linear is looking for a Product Designer to help shape the future of project management tools.

About the role:
- Own the design of core product features end-to-end, from discovery to shipping
- Work directly with founders and engineers in a fast-moving, small team environment
- Establish and evolve design patterns across the product
- Conduct user research and usability testing to validate decisions

Requirements:
- 3+ years of product design experience at a SaaS company
- Strong portfolio demonstrating systems thinking and attention to detail
- Proficiency in Figma and familiarity with design tokens/systems
- Ability to work autonomously and move quickly without sacrificing quality`,
  },
  {
    id: "3",
    job: "Full Stack Developer",
    company: "Vercel",
    date: "2026-02-28",
    status: "Offer",
    hiringManagerName: "Jordan Kim",
    requirements: [
      "Solid experience with Next.js, Node.js, and TypeScript",
      "Understanding of edge computing, serverless architecture, and CDN concepts",
      "Comfort working with PostgreSQL and key-value stores",
      "A passion for developer experience and open-source software",
    ],
    description: `Join Vercel as a Full Stack Developer and help build the infrastructure that powers modern web development.

What you'll do:
- Develop and maintain features across the Vercel dashboard and CLI tooling
- Work on performance-critical Node.js services and Next.js applications
- Collaborate with the DX team to improve developer tooling and documentation
- Participate in on-call rotations and contribute to incident postmortems

Qualifications:
- Solid experience with Next.js, Node.js, and TypeScript
- Understanding of edge computing, serverless architecture, and CDN concepts
- Comfort working with PostgreSQL and key-value stores
- A passion for developer experience and open-source software`,
  },
  {
    id: "4",
    job: "Backend Engineer",
    company: "PlanetScale",
    date: "2026-02-22",
    status: "Rejected",
    hiringManagerName: "Morgan Lee",
    requirements: [
      "4+ years of backend engineering experience with Go or similar compiled languages",
      "Deep understanding of relational databases, SQL, and distributed systems",
      "Experience operating services at scale in cloud environments (AWS, GCP, or similar)",
      "Strong debugging skills and a data-driven approach to problem solving",
    ],
    description: `PlanetScale is hiring a Backend Engineer to work on our globally distributed MySQL-compatible database platform.

Role overview:
- Design and implement APIs and backend services for PlanetScale's control plane
- Work with Go, Kubernetes, and Vitess to build highly available infrastructure
- Optimize query performance and improve database observability tooling
- Contribute to sharding logic and multi-region replication features

What we're looking for:
- 4+ years of backend engineering experience with Go or similar compiled languages
- Deep understanding of relational databases, SQL, and distributed systems
- Experience operating services at scale in cloud environments (AWS, GCP, or similar)
- Strong debugging skills and a data-driven approach to problem solving`,
  },
];

export const useJobPoolStore = create<JobPoolStore>((set) => ({
  jobs: INITIAL_JOBS,
  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, { id: Date.now().toString(), ...job }],
    })),
  removeJob: (id) =>
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),
  updateJobStatus: (id, status) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              status,
            }
          : job,
      ),
    })),
}));
