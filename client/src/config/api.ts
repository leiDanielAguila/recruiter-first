/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API base URL from environment or use default
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || "local";

const DEFAULT_REDIRECT_URI =
  typeof window !== "undefined" ? window.location.origin : "";

export const AUTH0_CONFIG = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "",
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || "",
  redirectUri: import.meta.env.VITE_AUTH0_REDIRECT_URI || DEFAULT_REDIRECT_URI,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    signup: `${API_BASE_URL}/api/v1/auth/signup`,
    signin: `${API_BASE_URL}/api/v1/auth/signin`,
    me: `${API_BASE_URL}/api/v1/auth/me`,
  },
  resume: {
    analyze: `${API_BASE_URL}/api/v1/resume/analyze`,
  },
  coverLetter: {
    generate: `${API_BASE_URL}/api/v1/cover-letter/generate`,
    exportPdf: (documentId: string) =>
      `${API_BASE_URL}/api/v1/cover-letter/${documentId}/export-pdf`,
  },
  analytics: {
    visit: `${API_BASE_URL}/api/analytics/visit`,
    visits: `${API_BASE_URL}/api/analytics/visits`,
  },
  jobApplications: {
    list: `${API_BASE_URL}/api/v1/job-applications`,
    create: `${API_BASE_URL}/api/v1/job-applications`,
    byId: (id: string) => `${API_BASE_URL}/api/v1/job-applications/${id}`,
  },
  settings: {
    get: `${API_BASE_URL}/api/v1/settings`,
    update: `${API_BASE_URL}/api/v1/settings`,
    acknowledgeTerms: `${API_BASE_URL}/api/v1/settings/terms/acknowledge`,
  },
} as const;
