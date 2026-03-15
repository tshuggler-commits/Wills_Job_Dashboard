"use client";

import { useState } from "react";

interface AddJobOverlayProps {
  onClose: () => void;
  onAdd: (data: {
    url?: string;
    title: string;
    company: string;
    salary?: string;
    workType?: string;
    notes?: string;
  }) => void;
}

export default function AddJobOverlay({ onClose, onAdd }: AddJobOverlayProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [salary, setSalary] = useState("");
  const [workType, setWorkType] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = title.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onAdd({
      url: url.trim() || undefined,
      title: title.trim(),
      company: company.trim(),
      salary: salary.trim() || undefined,
      workType: workType || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  const inputClass =
    "w-full px-3 py-3 border border-border rounded-std text-sm outline-none text-text-primary bg-surface focus:border-text-primary transition-colors";

  return (
    <div className="fixed inset-0 z-[150] bg-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <button
          onClick={onClose}
          className="text-text-secondary text-sm font-medium bg-transparent border-none cursor-pointer"
        >
          Cancel
        </button>
        <span className="text-sm font-semibold text-text-primary">
          Add Job
        </span>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`text-sm font-semibold border-none cursor-pointer bg-transparent ${
            canSubmit ? "text-green" : "text-text-tertiary"
          }`}
        >
          Save
        </button>
      </div>

      {/* Form - scrollable with bottom padding for keyboard */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-[120px]">
        <div className="max-w-app mx-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Job posting URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Job title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Operations Analyst"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              className={inputClass}
            />
          </div>

          {!showMore && (
            <button
              onClick={() => setShowMore(true)}
              className="text-sm text-text-tertiary font-medium bg-transparent border-none cursor-pointer"
            >
              + Add more details
            </button>
          )}

          {showMore && (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                  Salary range
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="$80K–$100K"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                  Work type
                </label>
                <div className="flex gap-2">
                  {["Remote", "Hybrid"].map((wt) => (
                    <button
                      key={wt}
                      onClick={() =>
                        setWorkType(workType === wt ? "" : wt)
                      }
                      className={`flex-1 py-2.5 rounded-std text-sm font-medium cursor-pointer border transition-colors ${
                        workType === wt
                          ? "bg-text-primary text-white border-text-primary"
                          : "bg-surface text-text-secondary border-border"
                      }`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How you found it, referral info, etc."
                  rows={3}
                  className={`${inputClass} resize-y min-h-[72px]`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
