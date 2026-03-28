import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingScreen } from "@/components/pages/LoadingScreen";
import {
  ResultsScreen,
  type MatchResult,
} from "@/components/pages/ResultsScreen";
import { analyzeResume, ResumeAnalysisError } from "@/services/resume";
import { useJobApplications, type ApplicationStatus } from "@/services/jobPool";

type ViewState = "upload" | "loading" | "results";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-100 text-blue-800 border-blue-200",
  Interviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Offer: "bg-green-100 text-green-800 border-green-200",
  Replied: "bg-orange-100 text-orange-800 border-orange-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Withdrawn: "bg-gray-100 text-gray-600 border-gray-200",
};

export function JobUpload() {
  const { data: jobs = [] } = useJobApplications();
  const jobPoolJobs = jobs;
  const [jobDescription, setJobDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // WARNING
  // do not update MAX_WORDS, token limiter
  const MAX_WORDS = 1000;

  const wordCount =
    jobDescription.trim() === ""
      ? 0
      : jobDescription.trim().split(/\s+/).length;
  const isOverLimit = wordCount > MAX_WORDS;

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setSelectedJobId("");
    setJobDescription(e.target.value);
  };

  const handleJobSelect = (id: string) => {
    const newId = id === selectedJobId ? "" : id;
    setSelectedJobId(newId);

    if (!newId) {
      setJobDescription("");
      return;
    }

    const selectedJob = jobPoolJobs.find((job) => job.id === newId);
    if (!selectedJob) return;

    setJobDescription(selectedJob.description);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      setError("Please upload a valid PDF file.");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      setError("Job description is required.");
      return;
    }

    if (!selectedFile) {
      setError("Please upload a resume file");
      return;
    }

    if (isOverLimit) {
      setError(
        `Your job description exceeds the ${MAX_WORDS.toLocaleString()} word limit (${wordCount.toLocaleString()} words). Please shorten it and try again.`,
      );
      return;
    }

    setError(null);
    setViewState("loading");

    try {
      const result = await analyzeResume({
        resume: selectedFile,
        jobDescription,
      });

      setMatchResult(result);
      setViewState("results");
    } catch (err) {
      console.error("Resume analysis failed:", err);

      let errorMessage = "Failed to analyze resume. Please try again.";

      if (err instanceof ResumeAnalysisError) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setViewState("upload");
    }
  };

  const handleBack = () => {
    setViewState("upload");
    setMatchResult(null);
    setError(null);
  };

  if (viewState === "loading") {
    return <LoadingScreen />;
  }

  if (viewState === "results" && matchResult) {
    return <ResultsScreen result={matchResult} onBack={handleBack} />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Job Matcher</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a job description and resume to find the best match
        </p>
      </div>

      <div className="flex gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 space-y-6 min-w-0"
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="job-description">Job Description</Label>
                <span
                  className={`text-xs ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
                >
                  {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()}{" "}
                  words
                </span>
              </div>
              <Textarea
                id="job-description"
                placeholder="Enter the job description, requirements, and responsibilities..."
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                className={`min-h-[280px] resize-y ${isOverLimit ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-upload">Upload Resume/CV (PDF)</Label>
              <div className="relative h-[280px]">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-foreground">
                        <FileText className="w-6 h-6" />
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveFile();
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
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isOverLimit}
          >
            Compare Candidate
          </Button>
        </form>

        {jobPoolJobs.length > 0 && (
          <div className="w-64 shrink-0 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                From Job Pool
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click a card to auto-fill
              </p>
            </div>
            {jobPoolJobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => handleJobSelect(job.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-all ${
                    isSelected
                      ? "border-foreground bg-muted/60"
                      : "border-border bg-transparent hover:bg-muted/30 hover:border-muted-foreground/40"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {job.job}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.company}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
