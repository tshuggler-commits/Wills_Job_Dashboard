import { Client } from "@notionhq/client";
import { Job } from "./types";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB = process.env.NOTION_DATABASE_ID!;

// ── Helpers to extract values from Notion property objects ──

function text(prop: any): string {
  if (!prop) return "";
  if (prop.type === "rich_text") {
    return prop.rich_text?.map((t: any) => t.plain_text).join("") || "";
  }
  if (prop.type === "title") {
    return prop.title?.map((t: any) => t.plain_text).join("") || "";
  }
  return "";
}

function num(prop: any): number | null {
  if (!prop || prop.type !== "number") return null;
  return prop.number;
}

function sel(prop: any): string {
  if (!prop || prop.type !== "select" || !prop.select) return "";
  return prop.select.name || "";
}

function multiSel(prop: any): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select?.map((s: any) => s.name) || [];
}

function check(prop: any): boolean {
  if (!prop || prop.type !== "checkbox") return false;
  return prop.checkbox || false;
}

function url(prop: any): string {
  if (!prop || prop.type !== "url") return "";
  return prop.url || "";
}

function date(prop: any): string | null {
  if (!prop || prop.type !== "date" || !prop.date) return null;
  return prop.date.start || null;
}

// ── Map a Notion page to our Job type ──

function pageToJob(page: any): Job {
  const p = page.properties;
  return {
    id: page.id,
    jobTitle: text(p["Job Title"]),
    company: text(p["Company"]),
    matchScore: num(p["Match Score"]),
    status: sel(p["Status"]) as any || "New",
    workType: sel(p["Work Type"]) as any || "Remote",
    salaryRange: text(p["Salary Range"]),
    employmentType: sel(p["Employment Type"]),
    applyLink: url(p["Apply Link"]),
    applyBy: date(p["Apply By"]),
    dateFound: date(p["Date Found"]) || "",
    source: sel(p["Source"]),
    companyIntel: text(p["Company Intel"]),
    redFlags: multiSel(p["Red Flags"]),
    companySize: sel(p["Company Size"]),
    industry: sel(p["Industry"]),
    priority: sel(p["Priority"]),
    notes: text(p["Notes"]),
    bookmarked: check(p["Bookmarked"]),
    dismissed: check(p["Dismissed"]),
    dismissedReason: sel(p["Dismissed Reason"]),
    applied: check(p["Applied"]),
    dateApplied: date(p["Date Applied"]),
    resumeReviewStatus: sel(p["Resume Review Status"]) as any || null,
    tailoredSummary: text(p["Tailored Summary"]),
    skillsEmphasized: text(p["Skills Emphasized"]),
    experienceFraming: text(p["Experience Framing"]),
    interviewRound: sel(p["Interview Round"]),
    interviewerName: text(p["Interviewer Name"]),
    nextStep: text(p["Next Step"]),
    expectedResponseBy: date(p["Expected Response By"]),
    notebookLMStatus: sel(p["NotebookLM Status"]) as any || null,
    notebookLMUrls: text(p["NotebookLM URLs"]),
    lastFollowUpDate: date(p["Last Follow-Up Date"]),
    followUpCount: num(p["Follow-Up Count"]) || 0,
    followUpNotes: text(p["Follow-Up Notes"]),
    recruiterName: text(p["Recruiter Name"]),
    recruiterContact: text(p["Recruiter Contact"]),
    internalConnection: text(p["Internal Connection"]),
  };
}

// ── Query: get active jobs (not dismissed) ──

export async function getActiveJobs(): Promise<Job[]> {
  const pages: any[] = [];
  let cursor: string | undefined = undefined;

  // Paginate through all results
  do {
    const response: any = await notion.databases.query({
      database_id: DB,
      filter: {
        property: "Dismissed",
        checkbox: { equals: false },
      },
      sorts: [
        { property: "Match Score", direction: "descending" },
      ],
      start_cursor: cursor,
      page_size: 100,
    });

    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  // Post-filter: exclude On-site (safety net)
  return pages
    .map(pageToJob)
    .filter((j) => j.workType !== "On-site");
}

// ── Write helpers ──

function richText(value: string) {
  return [{ text: { content: value } }];
}

function todayET(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

export async function toggleBookmark(pageId: string, bookmarked: boolean) {
  const updates: any = {
    Bookmarked: { checkbox: bookmarked },
  };

  // When bookmarking, set Resume Review Status to Not Started if empty
  if (bookmarked) {
    const page: any = await notion.pages.retrieve({ page_id: pageId });
    const currentStatus = sel(page.properties["Resume Review Status"]);
    if (!currentStatus) {
      updates["Resume Review Status"] = { select: { name: "Not Started" } };
    }
  }

  await notion.pages.update({
    page_id: pageId,
    properties: updates,
  });
}

export async function dismissJob(pageId: string, reason: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Dismissed: { checkbox: true },
      "Dismissed Reason": { select: { name: reason } },
    },
  });
}

export async function markApplied(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Applied: { checkbox: true },
      Status: { select: { name: "Applied" } },
      "Date Applied": { date: { start: todayET() } },
    },
  });
}

export async function approveResume(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Resume Review Status": { select: { name: "Approved" } },
    },
  });
}

export async function recordFollowUp(pageId: string, notes?: string) {
  // Get current count first
  const page: any = await notion.pages.retrieve({ page_id: pageId });
  const currentCount = num(page.properties["Follow-Up Count"]) || 0;
  const currentNotes = text(page.properties["Follow-Up Notes"]);

  const updates: any = {
    "Last Follow-Up Date": { date: { start: todayET() } },
    "Follow-Up Count": { number: currentCount + 1 },
  };

  if (notes) {
    const newNotes = currentNotes
      ? `${currentNotes}\n[${todayET()}] ${notes}`
      : `[${todayET()}] ${notes}`;
    updates["Follow-Up Notes"] = { rich_text: richText(newNotes) };
  }

  await notion.pages.update({ page_id: pageId, properties: updates });
}

export async function updateNote(pageId: string, noteText: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Notes: { rich_text: richText(noteText) },
    },
  });
}

export async function updateInterview(
  pageId: string,
  data: {
    round?: string;
    interviewerName?: string;
    nextStep?: string;
    expectedResponseBy?: string;
  }
) {
  const updates: any = {};
  if (data.round) {
    updates["Interview Round"] = { select: { name: data.round } };
  }
  if (data.interviewerName) {
    updates["Interviewer Name"] = { rich_text: richText(data.interviewerName) };
  }
  if (data.nextStep) {
    updates["Next Step"] = { rich_text: richText(data.nextStep) };
  }
  if (data.expectedResponseBy) {
    updates["Expected Response By"] = {
      date: { start: data.expectedResponseBy },
    };
  }

  if (Object.keys(updates).length > 0) {
    await notion.pages.update({ page_id: pageId, properties: updates });
  }
}

export async function addJob(data: {
  url?: string;
  title: string;
  company: string;
  salary?: string;
  workType?: string;
  notes?: string;
}) {
  const properties: any = {
    "Job Title": { title: richText(data.title) },
    Company: { rich_text: richText(data.company) },
    Source: { select: { name: "Manual" } },
    Bookmarked: { checkbox: true },
    Status: { select: { name: "New" } },
    "Date Found": { date: { start: todayET() } },
    "Resume Review Status": { select: { name: "Not Started" } },
  };

  if (data.url) {
    properties["Apply Link"] = { url: data.url };
  }
  if (data.salary) {
    properties["Salary Range"] = { rich_text: richText(data.salary) };
  }
  if (data.workType) {
    properties["Work Type"] = { select: { name: data.workType } };
  }
  if (data.notes) {
    properties["Notes"] = { rich_text: richText(data.notes) };
  }

  const page = await notion.pages.create({
    parent: { database_id: DB },
    properties,
  });

  return pageToJob(page as any);
}
