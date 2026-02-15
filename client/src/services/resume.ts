import { API_ENDPOINTS } from '@/config/api'
import type { MatchResult } from '@/components/ResultsScreen'

export interface AnalyzeResumeParams {
  resume: File
  jobDescription: string
}

export class ResumeAnalysisError extends Error {
  statusCode?: number
  originalError?: unknown
  
  constructor(
    message: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message)
    this.name = 'ResumeAnalysisError'
    this.statusCode = statusCode
    this.originalError = originalError
  }
}

/**
 * Analyze a resume against a job description
 */
export async function analyzeResume(
  params: AnalyzeResumeParams
): Promise<MatchResult> {
  const { resume, jobDescription } = params

  // Validate inputs
  if (!resume || !jobDescription.trim()) {
    throw new ResumeAnalysisError(
      'Both resume and job description are required',
      400
    )
  }

  if (!resume.type.includes('pdf')) {
    throw new ResumeAnalysisError(
      'Only PDF files are supported',
      400
    )
  }

  // Create form data
  const formData = new FormData()
  formData.append('resume', resume)
  formData.append('job_description', jobDescription)

  try {
    const response = await fetch(API_ENDPOINTS.resume.analyze, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: 'Unknown error occurred',
      }))

      throw new ResumeAnalysisError(
        errorData.detail || `Server error: ${response.status}`,
        response.status
      )
    }

    const result = await response.json()
    return result as MatchResult
  } catch (error) {
    if (error instanceof ResumeAnalysisError) {
      throw error
    }

    // Network or other errors
    throw new ResumeAnalysisError(
      'Failed to connect to the server. Please check your connection and try again.',
      0,
      error
    )
  }
}
