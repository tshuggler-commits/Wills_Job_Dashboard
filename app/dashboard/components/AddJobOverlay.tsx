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
    "w-full px-4 py-3 border border-border rounded-std text-sm outline-none text-text-primary bg-surface-warm focus:border-teal focus:ring-1 focus:ring-teal/20 transition-all placeholder:text-text-tertiary/60";

  return (
    <div
      className="fixed inset-0 z-[200] sheet-backdrop"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="sheet-panel absolute bottom-0 left-0 right-0 bg-surface rounded-t-[20px] shadow-sheet max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={onClose}
            className="text-text-secondary text-sm font-medium bg-transparent border-none cursor-pointer"
          >
            Cancel
          </button>
          <span className="text-[15px] font-bold text-text-primary">
            Add a Job
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`text-sm font-bold border-none cursor-pointer bg-transparent transition-colors ${
              canSubmit ? "text-green" : "text-text-tertiary/40"
            }`}
          >
            Save
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-10">
          <div className="space-y-5">
            <div>
              <label className="section-label block mb-2">
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
              <label className="section-label block mb-2">
                Job title <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operations Analyst"
                className={inputClass}
              />
            </div>

            <div>
              <label className="section-label block mb-2">
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className={inputClass}
              />
            </div>

            {!showMore && (
              <button
                onClick={() => setShowMore(true)}
                className="text-sm text-teal font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                More details
              </button>
            )}

            {showMore && (
              <div className="space-y-5 fade-in-fast">
                <div>
                  <label className="section-label block mb-2">
                    Salary range
                  </label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. $80K–$100K"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="section-label block mb-2">
                    Work type
                  </label>
                  <div className="flex gap-2">
                    {["Remote", "Hybrid"].map((wt) => (
                      <button
                        key={wt}
                        onClick={() =>
                          setWorkType(workType === wt ? "" : wt)
                        }
                        className={`flex-1 py-2.5 rounded-std text-sm font-semibold cursor-pointer border transition-all ${
                          workType === wt
                            ? "bg-teal text-white border-teal shadow-sm"
                            : "bg-surface-warm text-text-secondary border-border"
                        }`}
                      >
                        {wt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="section-label block mb-2">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
