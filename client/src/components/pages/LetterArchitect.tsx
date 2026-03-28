import { useState } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useJobApplications, type ApplicationStatus } from "@/services/jobPool";
import {
  CoverLetterError,
  exportCoverLetterPdf,
  generateCoverLetter,
} from "@/services/coverLetter";

type LetterForm = {
  hiringManagerName: string;
  jobTitle: string;
  email: string;
  phone: string;
  requirements: string[];
};

const EMPTY_FORM: LetterForm = {
  hiringManagerName: "",
  jobTitle: "",
  email: "",
  phone: "",
  requirements: [""],
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-100 text-blue-800 border-blue-200",
  Interviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Offer: "bg-green-100 text-green-800 border-green-200",
  Replied: "bg-orange-100 text-orange-800 border-orange-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Withdrawn: "bg-gray-100 text-gray-600 border-gray-200",
};

export function LetterArchitect() {
  const { data: jobs = [] } = useJobApplications();
  const appliedJobs = jobs.filter((job) => job.status === "Applied");
  const [form, setForm] = useState<LetterForm>(EMPTY_FORM);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [generatedDocumentId, setGeneratedDocumentId] = useState<string>("");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleJobSelect = (id: string) => {
    const newId = id === selectedJobId ? "" : id;
    setSelectedJobId(newId);
    setGeneratedLetter("");
    setGeneratedDocumentId("");

    if (!newId) {
      setForm(EMPTY_FORM);
      return;
    }
    const job = appliedJobs.find((j) => j.id === newId);
    if (!job) return;
    setForm((prev) => ({
      ...prev,
      jobTitle: job.job,
      hiringManagerName: job.hiringManagerName,
      requirements: job.requirements.length > 0 ? [...job.requirements] : [""],
    }));
  };

  const setField = (
    field: keyof Omit<LetterForm, "requirements">,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setRequirement = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.requirements];
      updated[index] = value;
      return { ...prev, requirements: updated };
    });
  };

  const addRequirement = () => {
    if (form.requirements.length >= 5) return;
    setForm((prev) => ({ ...prev, requirements: [...prev.requirements, ""] }));
  };

  const removeRequirement = (index: number) => {
    if (form.requirements.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.jobTitle.trim()) {
      setFormError("Job title is required.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      setFormError("Please include '@' in the email address.");
      return;
    }

    if (!form.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    if (filledRequirements < 3) {
      setFormError("Please add at least 3 core job requirements.");
      return;
    }

    const selectedJob = appliedJobs.find((job) => job.id === selectedJobId);
    const company = selectedJob?.company ?? "";
    const resolvedHiringManagerName = form.hiringManagerName.trim()
      ? form.hiringManagerName.trim()
      : company
        ? `${company} Hiring Team`
        : "Hiring Team";

    setIsGenerating(true);

    try {
      const result = await generateCoverLetter({
        jobTitle: form.jobTitle,
        hiringManagerName: resolvedHiringManagerName,
        email: form.email,
        phone: form.phone,
        requirements: form.requirements,
        company,
      });

      setForm((prev) => ({
        ...prev,
        hiringManagerName: resolvedHiringManagerName,
      }));
      setGeneratedLetter(result.coverLetter);
      setGeneratedDocumentId(result.documentId);
    } catch (error) {
      if (error instanceof CoverLetterError) {
        setFormError(error.message);
      } else {
        setFormError("Failed to generate cover letter. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setSelectedJobId("");
    setFormError(null);
    setGeneratedLetter("");
    setGeneratedDocumentId("");
  };

  const handleDownloadPdf = async () => {
    if (!generatedDocumentId) {
      setFormError("Generate a cover letter before exporting to PDF.");
      return;
    }

    setFormError(null);
    setIsDownloading(true);

    try {
      const pdfBlob = await exportCoverLetterPdf(generatedDocumentId);
      const url = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${form.jobTitle.trim() || "cover-letter"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof CoverLetterError) {
        setFormError(error.message);
      } else {
        setFormError("Failed to export PDF. Please try again.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const filledRequirements = form.requirements.filter(
    (r) => r.trim() !== "",
  ).length;
  const canAddRequirement = form.requirements.length < 5;

  return (
    <div className="p-8 h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Letter Architect
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate a tailored cover letter in seconds
        </p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Form — left side */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 space-y-8 min-w-0"
        >
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Job Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  placeholder="e.g. Senior Engineer"
                  value={form.jobTitle}
                  onChange={(e) => setField("jobTitle", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hiring-manager">Hiring Manager's Name</Label>
                <Input
                  id="hiring-manager"
                  placeholder="e.g. Jane Smith"
                  value={form.hiringManagerName}
                  onChange={(e) =>
                    setField("hiringManagerName", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">
              Your Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Core Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  Core Job Requirements
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add 3–5 key requirements from the job posting
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {filledRequirements} / 5
              </span>
            </div>

            <div className="space-y-2">
              {form.requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">
                    {i + 1}.
                  </span>
                  <Input
                    placeholder={`Requirement ${i + 1}, e.g. "5+ years of React experience"`}
                    value={req}
                    onChange={(e) => setRequirement(i, e.target.value)}
                    className="flex-1"
                  />
                  {form.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(i)}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canAddRequirement && (
              <button
                type="button"
                onClick={addRequirement}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add requirement
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={!generatedDocumentId || isDownloading}
            >
              {isDownloading ? "Exporting..." : "Export PDF"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {generatedLetter && (
            <div className="space-y-2">
              <Label htmlFor="generated-cover-letter">
                Generated Cover Letter
              </Label>
              <Textarea
                id="generated-cover-letter"
                value={generatedLetter}
                readOnly
                className="min-h-[220px] resize-y"
              />
            </div>
          )}
        </form>

        {/* Job Pool cards — right side */}
        {appliedJobs.length > 0 && (
          <div className="w-64 shrink-0 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                From Job Pool
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click a card to auto-fill
              </p>
            </div>
            {appliedJobs.map((job) => {
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
