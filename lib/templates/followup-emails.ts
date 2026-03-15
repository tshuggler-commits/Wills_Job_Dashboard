export interface FollowUpTemplate {
  id: number;
  label: string;
  timing: string;
  body: string;
}

export const followUpTemplates: FollowUpTemplate[] = [
  {
    id: 1,
    label: "Initial follow-up",
    timing: "7-10 days",
    body: `Hi {contactName},

I wanted to follow up on my application for the {jobTitle} role at {company}, submitted on {dateApplied}. I remain very interested in this opportunity and would welcome the chance to discuss how my background in operations and process improvement could contribute to your team.

Please let me know if there's any additional information I can provide.

Best regards,
Will Sharp`,
  },
  {
    id: 2,
    label: "Second follow-up",
    timing: "14-21 days",
    body: `Hi {contactName},

I'm reaching out again regarding the {jobTitle} position at {company}. I applied on {dateApplied} and wanted to check in on the timeline for next steps. I'm happy to provide any additional materials or references that would be helpful.

Looking forward to hearing from you.

Best,
Will Sharp`,
  },
  {
    id: 3,
    label: "Final check-in",
    timing: "30+ days",
    body: `Hi {contactName},

I hope you're doing well. I applied for the {jobTitle} role at {company} on {dateApplied} and wanted to check whether the position has been filled. If the search is still active, I'd love to remain in consideration.

Either way, I appreciate your time.

Best,
Will Sharp`,
  },
];

export function fillTemplate(
  template: FollowUpTemplate,
  data: {
    company: string;
    jobTitle: string;
    dateApplied: string;
    contactName?: string;
  }
): string {
  return template.body
    .replace(/{company}/g, data.company)
    .replace(/{jobTitle}/g, data.jobTitle)
    .replace(/{dateApplied}/g, data.dateApplied)
    .replace(/{contactName}/g, data.contactName || "Hiring Team");
}
