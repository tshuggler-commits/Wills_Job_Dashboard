export type JobStatus =
  | "New"
  | "Reviewing"
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Offer"
  | "Expired"
  | "Withdrawn";

export type WorkType = "Remote" | "Hybrid" | "On-site";

export type ResumeReviewStatus =
  | "Not Started"
  | "AI Draft Ready"
  | "Under Review"
  | "Approved"
  | "Needs Revision"
  | null;

export type DismissReason =
  | "Low Pay"
  | "Wrong Location"
  | "Bad Fit"
  | "Company Red Flags"
  | "Expired/Filled"
  | "Other";

export type InterviewRound =
  | "Phone Screen"
  | "Technical"
  | "Case Study"
  | "Hiring Manager"
  | "Panel"
  | "Final";

export type NotebookLMStatus =
  | "Not Started"
  | "Sources Uploaded"
  | "Audio Generated"
  | "Prep Complete"
  | null;

export interface FitBreakdownItem {
  value: string;
  score: number;
}

export interface MatchBreakdownSkills {
  matched: string[];
  gaps: string[];
  score: number;
}

export interface MatchBreakdownItem {
  reasoning?: string;
  level?: string;
  requested?: string;
  score: number;
}

export interface FitBreakdown {
  work_arrangement?: FitBreakdownItem;
  salary?: FitBreakdownItem;
  company_size?: FitBreakdownItem;
  industry?: FitBreakdownItem;
  employment_type?: FitBreakdownItem;
}

export interface MatchBreakdown {
  skills_overlap?: MatchBreakdownSkills;
  experience_relevance?: MatchBreakdownItem;
  seniority?: MatchBreakdownItem;
  education_fit?: MatchBreakdownItem;
  years?: MatchBreakdownItem;
}

export interface Job {
  id: string;
  jobTitle: string;
  company: string;
  // v6 scoring: two sub-scores + total
  fitScore: number | null;
  matchScore: number | null;
  totalScore: number | null;
  fitBreakdown: FitBreakdown | null;
  matchBreakdown: MatchBreakdown | null;
  roleSummary: string;
  keyRequirements: string[];
  whyMatch: string;
  skillGaps: string[];
  matchedSkills: string[];
  // status & metadata
  status: JobStatus;
  workType: WorkType;
  salaryRange: string;
  employmentType: string;
  applyLink: string;
  applyBy: string | null;
  dateFound: string;
  source: string;
  companyIntel: string;
  redFlags: string[];
  companySize: string;
  industry: string;
  priority: string;
  notes: string;
  bookmarked: boolean;
  dismissed: boolean;
  dismissedReason: string;
  applied: boolean;
  dateApplied: string | null;
  resumeReviewStatus: ResumeReviewStatus;
  tailoredSummary: string;
  skillsEmphasized: string;
  experienceFraming: string;
  interviewRound: string;
  interviewerName: string;
  nextStep: string;
  expectedResponseBy: string | null;
  notebookLMStatus: NotebookLMStatus;
  notebookLMUrls: string;
  lastFollowUpDate: string | null;
  followUpCount: number;
  followUpNotes: string;
  recruiterName: string;
  recruiterContact: string;
  internalConnection: string;
}
