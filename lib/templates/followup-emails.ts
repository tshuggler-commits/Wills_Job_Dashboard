export interface FollowUpTemplate {
  id: number;
  label: string;
  timing: string;
  subject: string;
  body: string;
}

export const followUpTemplates: FollowUpTemplate[] = [
  {
    id: 1,
    label: "Initial check-in",
    timing: "7-10 days after application",
    subject: "Following up: {jobTitle} application",
    body: `Hi {contactName},

I applied for the {jobTitle} role on {dateApplied} and wanted to check in. I'm still very interested in the opportunity and would welcome the chance to discuss how my operations and automation background could contribute to the team at {company}.

Happy to provide any additional information. Looking forward to hearing from you.

Best,
Will Sharp`,
  },
  {
    id: 2,
    label: "Second follow-up",
    timing: "14-21 days after application",
    subject: "Re: {jobTitle} at {company}",
    body: `Hi {contactName},

I wanted to follow up on my application for the {jobTitle} position. I understand hiring timelines can shift, and I'm flexible on timing.

If it would be helpful, I'm happy to share additional work samples or references. The role aligns closely with my experience in operations and process improvement, and I'd appreciate the opportunity to connect when it makes sense.

Thanks for your time,
Will Sharp`,
  },
  {
    id: 3,
    label: "Final check-in",
    timing: "30+ days after application",
    subject: "Checking in: {jobTitle}",
    body: `Hi {contactName},

I hope things are going well. I applied for the {jobTitle} role at {company} about a month ago and wanted to check in one more time. If the position has been filled, I completely understand.

If there are other opportunities at {company} where my background in operations, data migration, and AI adoption could be a fit, I'd be glad to explore those as well.

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
  const fill = (str: string) =>
    str
      .replace(/{company}/g, data.company)
      .replace(/{jobTitle}/g, data.jobTitle)
      .replace(/{dateApplied}/g, data.dateApplied)
      .replace(/{contactName}/g, data.contactName || "Hiring Team");

  return `Subject: ${fill(template.subject)}\n\n${fill(template.body)}`;
}
