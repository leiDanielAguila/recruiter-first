/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API base URL from environment or use default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// API endpoints
export const API_ENDPOINTS = {
  resume: {
    analyze: `${API_BASE_URL}/api/v1/resume/analyze`,
  },
  analytics: {
    visit: `${API_BASE_URL}/api/analytics/visit`,
    visits: `${API_BASE_URL}/api/analytics/visits`,
  },
} as const
