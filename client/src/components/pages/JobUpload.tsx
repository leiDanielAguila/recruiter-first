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

type ViewState = "upload" | "loading" | "results";

export function JobUpload() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    setJobDescription(e.target.value);
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

      // Set user-friendly error message
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

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Two-column inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Description */}
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

          {/* PDF Upload */}
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
    </div>
  );
}
