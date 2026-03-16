"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { Job, DismissReason } from "@/lib/types";
import BottomNav, { Screen } from "./components/BottomNav";
import TodayView from "./components/TodayView";
import JobCard from "./components/JobCard";
import PipelineView from "./components/PipelineView";
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
  const [screen, setScreen] = useState<Screen>("today");
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

  // ── Review screen data ──

  const reviewJobs = [...active]
    .filter((j) => {
      // Hide manual+bookmarked jobs from Review (they go straight to Pipeline)
      if (j.source === "Manual" && j.bookmarked && !j.applied) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by total score descending, unread as tiebreaker
      const scoreDiff = (b.totalScore || 0) - (a.totalScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const aNew = a.status === "New" ? 0 : 1;
      const bNew = b.status === "New" ? 0 : 1;
      return aNew - bNew;
    });

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
      bookmarked ? "Added to Pipeline, tailoring resume" : "Removed from shortlist",
      () => {
        setJobs((p) =>
          p.map((j) =>
            j.id === id ? { ...j, bookmarked: prev } : j
          )
        );
      }
    );

    apiPatch(`/api/jobs/${id}/bookmark`, { bookmarked }).catch((err) => {
      console.error("Bookmark failed:", err);
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

    setJobs((p) =>
      p.map((j) =>
        j.id === id
          ? { ...j, dismissed: true, dismissedReason: reason }
          : j
      )
    );

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
      setScreen("pipeline");
    } catch (err: any) {
      console.error("Add job failed:", err);
      showToast("Failed to add job");
    }
  }

  // ── Loading state ──

  if (loading) {
    return (
      <div className="max-w-app mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        <div className="fade-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192x192.png"
            alt=""
            className="w-16 h-16 mx-auto mb-4 rounded-2xl"
          />
          <p className="text-lg font-semibold text-text-primary text-center">
            Career Compass
          </p>
          <div className="spinner w-5 h-5 rounded-full border-2 border-text-tertiary border-t-transparent mx-auto mt-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-app mx-auto px-4 pt-20 text-center">
        <p className="text-sm text-red font-medium mb-2">Something went wrong</p>
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
    <div className="max-w-app mx-auto px-4 pb-20 bg-bg min-h-screen">
      {/* Sign out - top right corner */}
      {screen === "today" && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => signOut()}
            className="text-xs text-text-tertiary bg-transparent border-none cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Review header */}
      {screen === "review" && (
        <div className="pt-5 pb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">Review</h1>
          <span className="text-xs text-text-tertiary">
            {reviewJobs.length} {reviewJobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>
      )}

      {/* Pipeline header */}
      {screen === "pipeline" && (
        <div className="pt-5 pb-4">
          <h1 className="text-xl font-bold text-text-primary">Pipeline</h1>
        </div>
      )}

      {/* Today Screen */}
      {screen === "today" && (
        <TodayView
          jobs={jobs}
          userName={userName}
          onApproveResume={handleApproveResume}
          onNavigateToReview={() => setScreen("review")}
        />
      )}

      {/* Review Screen */}
      {screen === "review" && (
        <>
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
                onSaveNote={handleSaveNote}
              />
            ))
          )}
        </>
      )}

      {/* Pipeline Screen */}
      {screen === "pipeline" && (
        <PipelineView
          jobs={active}
          onApproveResume={handleApproveResume}
          onFollowUp={handleFollowUp}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        active={screen}
        onChange={setScreen}
        onAddJob={() => setShowAddJob(true)}
        unreadCount={unreadCount}
        pursuingCount={pursuingCount}
      />

      {/* Add Job Overlay */}
      {showAddJob && (
        <AddJobOverlay
          onClose={() => setShowAddJob(false)}
          onAdd={handleAddJob}
        />
      )}

      {/* Toast */}
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
