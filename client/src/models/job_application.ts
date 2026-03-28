/**
 * Job application data models and types.
 * 
 * Defines the structure for job applications matching the backend schema.
 */

export type ApplicationStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Replied"
  | "Withdrawn";

export type JobApplication = {
  id: string;
  userId: string;
  job: string;
  company: string;
  date: string;
  status: ApplicationStatus;
  description: string;
  hiringManagerName: string;
  requirements: string[];
  createdAt: string;
  updatedAt: string;
};

export type JobApplicationCreate = Omit<
  JobApplication,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type JobApplicationUpdate = Partial<JobApplicationCreate>;

export type JobApplicationListResponse = {
  applications: JobApplication[];
  total: number;
};
