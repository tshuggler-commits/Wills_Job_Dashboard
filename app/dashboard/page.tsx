"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { Job, DismissReason } from "@/lib/types";
import { daysUntil, todayFormatted, fmtDate } from "@/lib/dates";
import Tabs from "./components/Tabs";
import JobCard from "./components/JobCard";
import PipelineView from "./components/PipelineView";
import MondayBanner from "./components/MondayBanner";
import AddJobOverlay from "./components/AddJobOverlay";
import Toast from "./components/Toast";

// ── API helpers ──

async function fetchJobs(): Promise<Job[]> {
  const res = await fetch("/api/jobs");
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

async function apiPatch(path: string, body?: any) {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

async function apiPost(path: string, body: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// ── Toast state type ──

interface ToastState {
  message: string;
  onUndo?: () => void;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"review" | "pipeline">("review");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showAddJob, setShowAddJob] = useState(false);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const showToast = useCallback(
    (message: string, onUndo?: () => void) => {
      setToast({ message, onUndo });
    },
    []
  );

  // ── Active jobs (not dismissed, not on-site) ──

  const active = jobs.filter((j) => !j.dismissed && j.workType !== "On-site");

  const unreadCount = active.filter((j) => j.status === "New").length;
  const pursuingCount = active.filter(
    (j) => j.bookmarked && !j.applied && j.status !== "Interview"
  ).length;

  // ── Review tab data ──

  const reviewJobs = [...active]
    .filter((j) => {
      // Hide manual+bookmarked jobs from Review (they go straight to Pipeline)
      if (j.source === "Manual" && j.bookmarked && !j.applied) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by score descending, unread as tiebreaker
      const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const aNew = a.status === "New" ? 0 : 1;
      const bNew = b.status === "New" ? 0 : 1;
      return aNew - bNew;
    });

  const attentionJobs = active.filter(
    (j) =>
      j.status === "Interview" ||
      (daysUntil(j.applyBy) !== null &&
        daysUntil(j.applyBy)! >= 0 &&
        daysUntil(j.applyBy)! <= 3 &&
        !j.applied)
  );

  // ── Handlers ──

  function handleBookmark(id: string, bookmarked: boolean) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    const prev = job.bookmarked;
    // Optimistic update
    setJobs((p) =>
      p.map((j) =>
        j.id === id
          ? {
              ...j,
              bookmarked,
              resumeReviewStatus: bookmarked ? "Not Started" : j.resumeReviewStatus,
            }
          : j
      )
    );

    showToast(
      bookmarked ? "Added to shortlist" : "Removed from shortlist",
      () => {
        // Undo
        setJobs((p) =>
          p.map((j) =>
            j.id === id ? { ...j, bookmarked: prev } : j
          )
        );
      }
    );

    // Fire API call (no undo cancellation for simplicity — undo reverts local state and re-patches)
    apiPatch(`/api/jobs/${id}/bookmark`, { bookmarked }).catch((err) => {
      console.error("Bookmark failed:", err);
      // Revert on error
      setJobs((p) =>
        p.map((j) =>
          j.id === id ? { ...j, bookmarked: prev } : j
        )
      );
    });
  }

  function handleDismiss(id: string, reason: DismissReason) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    // Optimistic
    setJobs((p) =>
      p.map((j) =>
        j.id === id
          ? { ...j, dismissed: true, dismissedReason: reason }
          : j
      )
    );

    // Use a timeout so undo can cancel
    const timeout = setTimeout(() => {
      apiPatch(`/api/jobs/${id}/dismiss`, { reason }).catch((err) => {
        console.error("Dismiss failed:", err);
        setJobs((p) =>
          p.map((j) =>
            j.id === id ? { ...j, dismissed: false, dismissedReason: "" } : j
          )
        );
      });
    }, 3200);

    showToast(`Dismissed ${job.company}`, () => {
      clearTimeout(timeout);
      setJobs((p) =>
        p.map((j) =>
          j.id === id ? { ...j, dismissed: false, dismissedReason: "" } : j
        )
      );
    });
  }

  function handleApply(id: string) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    const today = new Date().toISOString().split("T")[0];

    setJobs((p) =>
      p.map((j) =>
        j.id === id
          ? { ...j, applied: true, status: "Applied" as const, dateApplied: today }
          : j
      )
    );

    const timeout = setTimeout(() => {
      apiPatch(`/api/jobs/${id}/apply`).catch((err) => {
        console.error("Apply failed:", err);
        setJobs((p) =>
          p.map((j) =>
            j.id === id
              ? { ...j, applied: false, status: job.status, dateApplied: job.dateApplied }
              : j
          )
        );
      });
    }, 3200);

    showToast(`Marked applied: ${job.jobTitle}`, () => {
      clearTimeout(timeout);
      setJobs((p) =>
        p.map((j) =>
          j.id === id
            ? { ...j, applied: false, status: job.status, dateApplied: job.dateApplied }
            : j
        )
      );
    });
  }

  function handleApproveResume(id: string) {
    setJobs((p) =>
      p.map((j) =>
        j.id === id
          ? { ...j, resumeReviewStatus: "Approved" as const }
          : j
      )
    );

    apiPatch(`/api/jobs/${id}/approve-resume`).catch((err) => {
      console.error("Approve resume failed:", err);
    });

    showToast("Resume approved");
  }

  function handleSaveNote(id: string, noteText: string) {
    setJobs((p) =>
      p.map((j) => (j.id === id ? { ...j, notes: noteText } : j))
    );
    apiPatch(`/api/jobs/${id}/note`, { notes: noteText }).catch((err) => {
      console.error("Note save failed:", err);
    });
  }

  function handleFollowUp(id: string, notes?: string) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    const today = new Date().toISOString().split("T")[0];
    setJobs((p) =>
      p.map((j) =>
        j.id === id
          ? {
              ...j,
              lastFollowUpDate: today,
              followUpCount: j.followUpCount + 1,
            }
          : j
      )
    );

    apiPatch(`/api/jobs/${id}/followup`, { notes }).catch((err) => {
      console.error("Follow-up failed:", err);
    });

    showToast("Follow-up recorded");
  }

  async function handleAddJob(data: {
    url?: string;
    title: string;
    company: string;
    salary?: string;
    workType?: string;
    notes?: string;
  }) {
    try {
      const newJob = await apiPost("/api/jobs/add-job", data);
      setJobs((p) => [newJob, ...p]);
      showToast(`Added: ${data.title}`);
      setTab("pipeline");
    } catch (err: any) {
      console.error("Add job failed:", err);
      showToast("Failed to add job");
    }
  }

  // ── Loading state ──

  if (loading) {
    return (
      <div className="max-w-app mx-auto px-4 pt-20 text-center">
        <div className="spinner w-6 h-6 rounded-full border-2 border-text-tertiary border-t-transparent mx-auto mb-3" />
        <p className="text-sm text-text-tertiary">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-app mx-auto px-4 pt-20 text-center">
        <p className="text-sm text-red font-medium mb-2">
          Something went wrong
        </p>
        <p className="text-xs text-text-tertiary mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-text-primary text-white px-4 py-2 rounded-std text-sm font-semibold border-none cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Render ──

  const userName = session?.user?.name || "Will";

  return (
    <div className="max-w-app mx-auto px-4 pb-[100px] bg-bg min-h-screen">
      {/* Header */}
      <div className="pt-5 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Hey, {userName}
          </h1>
          <p className="text-[13px] text-text-tertiary mt-0.5">
            {todayFormatted()}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs text-text-tertiary bg-transparent border-none cursor-pointer mt-1"
        >
          Sign out
        </button>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        unreadCount={unreadCount}
        pursuingCount={pursuingCount}
      />

      {/* Review Tab */}
      {tab === "review" && (
        <>
          <MondayBanner jobs={active} />

          {attentionJobs.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2 px-0.5">
                Needs attention
              </div>
              {attentionJobs.map((j) => (
                <div
                  key={j.id + "-attn"}
                  className={`rounded-std p-3 mb-1.5 flex items-center justify-between ${
                    j.status === "Interview"
                      ? "bg-purple-light border border-purple/10"
                      : "bg-amber-light border border-amber/15"
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-semibold text-text-primary">
                      {j.jobTitle} at {j.company}
                    </div>
                    <div
                      className={`text-xs font-medium mt-0.5 ${
                        j.status === "Interview"
                          ? "text-purple"
                          : "text-amber"
                      }`}
                    >
                      {j.status === "Interview"
                        ? "Interview upcoming"
                        : `Deadline ${fmtDate(j.applyBy)}`}
                    </div>
                  </div>
                  {j.status === "Interview" && (
                    <button className="bg-purple text-white border-none px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer">
                      Prep
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
              Jobs to review
            </span>
            <span className="text-xs text-text-tertiary">
              {reviewJobs.length}
            </span>
          </div>

          {reviewJobs.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-tertiary bg-surface-alt rounded-std border border-border">
              No new jobs to review. Check back tomorrow.
            </div>
          ) : (
            reviewJobs.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onBookmark={handleBookmark}
                onDismiss={handleDismiss}
                onApply={handleApply}
                onApproveResume={handleApproveResume}
                onSaveNote={handleSaveNote}
              />
            ))
          )}
        </>
      )}

      {/* Pipeline Tab */}
      {tab === "pipeline" && (
        <PipelineView
          jobs={active}
          onApproveResume={handleApproveResume}
          onFollowUp={handleFollowUp}
        />
      )}

      {/* Floating add button */}
      {!showAddJob && (
        <button
          onClick={() => setShowAddJob(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-text-primary text-white border-none text-2xl font-light cursor-pointer shadow-lg flex items-center justify-center z-[100] leading-none"
        >
          +
        </button>
      )}

      {showAddJob && (
        <AddJobOverlay
          onClose={() => setShowAddJob(false)}
          onAdd={handleAddJob}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          onClose={() => setToast(null)}
          onUndo={toast.onUndo}
        />
      )}
    </div>
  );
}
