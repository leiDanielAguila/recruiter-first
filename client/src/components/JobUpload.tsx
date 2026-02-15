import { useState } from 'react'
import { Upload, FileText, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ResultsScreen, type MatchResult } from '@/components/ResultsScreen'
import { analyzeResume, ResumeAnalysisError } from '@/services/resume'

type ViewState = 'upload' | 'loading' | 'results'

export function JobUpload() {
  const [jobDescription, setJobDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewState, setViewState] = useState<ViewState>('upload')
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Please upload a PDF file')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Please upload a resume file')
      return
    }
    
    setError(null)
    setViewState('loading')
    
    try {
      const result = await analyzeResume({
        resume: selectedFile,
        jobDescription,
      })
      
      setMatchResult(result)
      setViewState('results')
    } catch (err) {
      console.error('Resume analysis failed:', err)
      
      // Set user-friendly error message
      let errorMessage = 'Failed to analyze resume. Please try again.'
      
      if (err instanceof ResumeAnalysisError) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setViewState('upload')
    }
  }

  const handleBack = () => {
    setViewState('upload')
    setMatchResult(null)
    setError(null)
  }

  if (viewState === 'loading') {
    return <LoadingScreen />
  }

  if (viewState === 'results' && matchResult) {
    return <ResultsScreen result={matchResult} onBack={handleBack} />
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Side - Job Upload Form */}
          <div className="lg:col-span-2">
            <Card className="border-[#262626]">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Post a New Job</CardTitle>
                <CardDescription>
                  Upload a job description and resume to find the best candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}
                  
                  {/* Job Description Input */}
                  <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                      id="job-description"
                      placeholder="Enter the job description, requirements, and responsibilities..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[200px] resize-y"
                      required
                    />
                  </div>

                  {/* PDF File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload">Upload Resume/CV (PDF)</Label>
                    <div className="relative">
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        {selectedFile ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-foreground">
                              <FileText className="w-6 h-6" />
                              <span className="text-sm font-medium truncate max-w-[200px] md:max-w-[400px]">
                                {selectedFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemoveFile()
                              }}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF files only
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" size="lg">
                    Compare Candidate
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Navigation Area */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Companies Section */}
            <Card className="border-[#262626]">
              <CardHeader>
                <CardTitle className="text-lg">Top Companies</CardTitle>
                <CardDescription>Leading employers in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'TechCorp Inc.', location: 'San Francisco, CA', openings: 12, logo: 'TC' },
                    { name: 'Innovation Labs', location: 'Austin, TX', openings: 8, logo: 'IL' },
                    { name: 'Global Systems', location: 'New York, NY', openings: 15, logo: 'GS' },
                  ].map((company, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-[#262626]/20 hover:bg-[#F3F4F4] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#262626] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#F3F4F4] text-xs font-bold">{company.logo}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{company.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {company.location}
                          </p>
                        </div>
                        <span className="text-xs font-medium bg-[#262626] text-[#F3F4F4] px-2 py-1 rounded flex-shrink-0">
                          {company.openings}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Listings Section */}
            <Card className="border-[#262626]">
              <CardHeader>
                <CardTitle className="text-lg">Recent Job Listings</CardTitle>
                <CardDescription>Latest opportunities near you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      title: 'Senior Software Engineer', 
                      company: 'TechCorp Inc.', 
                      type: 'Full-time',
                      description: 'We are seeking an experienced Senior Software Engineer to lead our development team in building scalable web applications using React and Node.js.'
                    },
                    { 
                      title: 'Product Designer', 
                      company: 'Innovation Labs', 
                      type: 'Contract',
                      description: 'Join our creative team to design user-centered products that solve real problems. Experience with Figma and user research required.'
                    },
                    { 
                      title: 'Data Scientist', 
                      company: 'Global Systems', 
                      type: 'Full-time',
                      description: 'Looking for a Data Scientist with strong Python skills and machine learning expertise to derive insights from large datasets.'
                    },
                  ].map((job, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-[#262626]/20 hover:bg-[#F3F4F4] transition-colors"
                    >
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-sm">{job.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{job.company}</p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{job.type}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs h-7"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
