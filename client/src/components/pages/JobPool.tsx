import { useState } from "react";
import { Plus, Briefcase, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useJobPoolStore,
  type ApplicationStatus,
  type JobApplication,
} from "@/services/jobPool";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-100 text-blue-800 border-blue-200",
  Interviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Offer: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Withdrawn: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy job description"}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

const EMPTY_FORM = {
  job: "",
  company: "",
  date: "",
  status: "Applied" as ApplicationStatus,
  description: "",
  hiringManagerName: "",
  requirements: [],
};

export function JobPool() {
  const { jobs, addJob, removeJob, updateJobStatus } = useJobPoolStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [newJob, setNewJob] = useState(EMPTY_FORM);

  const handleAdd = () => {
    if (!newJob.job || !newJob.company || !newJob.date) return;
    addJob(newJob);
    setNewJob(EMPTY_FORM);
    setIsAddOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeJob(id);
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  const handleStatusChange = (status: string) => {
    if (!selectedJob) {
      return;
    }

    const nextStatus = status as ApplicationStatus;
    updateJobStatus(selectedJob.id, nextStatus);
    setSelectedJob((prev) => (prev ? { ...prev, status: nextStatus } : prev));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Job Pool</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your job applications
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Application
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No applications yet. Add your first one.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Job
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Company
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date Applied
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((app, i) => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedJob(app)}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {app.job}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {app.company}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(app.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handleDelete(app.id, e)}
                      title="Delete application"
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Job Detail Dialog */}
      <Dialog
        open={!!selectedJob}
        onOpenChange={(open) => {
          if (!open) setSelectedJob(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedJob?.job}</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="flex flex-col gap-5 overflow-y-auto pr-1">
              {/* Meta info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Company</p>
                  <p className="font-medium text-foreground">
                    {selectedJob.company}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Date Applied</p>
                  <p className="font-medium text-foreground">
                    {formatDate(selectedJob.date)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <Select
                    value={selectedJob.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_STYLES) as ApplicationStatus[]).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    Job Description
                  </p>
                  <CopyButton text={selectedJob.description} />
                </div>
                <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {selectedJob.description || (
                    <span className="text-muted-foreground italic">
                      No description provided.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setSelectedJob(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Application Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Job Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                placeholder="e.g. Senior Engineer"
                value={newJob.job}
                onChange={(e) =>
                  setNewJob((p) => ({ ...p, job: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g. Acme Corp"
                value={newJob.company}
                onChange={(e) =>
                  setNewJob((p) => ({ ...p, company: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date-applied">Date Applied</Label>
                <Input
                  id="date-applied"
                  type="date"
                  value={newJob.date}
                  onChange={(e) =>
                    setNewJob((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={newJob.status}
                  onValueChange={(v) =>
                    setNewJob((p) => ({ ...p, status: v as ApplicationStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_STYLES) as ApplicationStatus[]).map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Job Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder="Paste the job description here..."
                value={newJob.description}
                onChange={(e) =>
                  setNewJob((p) => ({ ...p, description: e.target.value }))
                }
                className="min-h-[120px] resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setNewJob(EMPTY_FORM);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newJob.job || !newJob.company || !newJob.date}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
