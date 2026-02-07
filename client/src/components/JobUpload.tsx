import { useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function JobUpload() {
  const [jobDescription, setJobDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle form submission
    console.log('Job Description:', jobDescription)
    console.log('Selected File:', selectedFile)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Post a New Job</CardTitle>
          <CardDescription>
            Upload a job description and resume to find the best candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
  )
}
