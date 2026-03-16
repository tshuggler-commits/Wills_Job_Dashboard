// lib/content/contextual-messages.ts
// Context-aware messages for Will's Today screen.
// The app checks pipeline state and picks the highest-priority matching message.
// Only one message shows per day. Priority 1 is highest.

export interface ContextualMessage {
  priority: number;
  trigger: string;
  messages: string[];
}

export const CONTEXTUAL_MESSAGES: ContextualMessage[] = [
  {
    priority: 1,
    trigger: "interview_within_48h",
    messages: [
      "Your {company} interview is {timeframe}. You've done the prep. Trust it.",
      "Interview with {company} coming up. You know this material. Walk in like you belong there.",
      "Almost time for {company}. Take 10 minutes to review your prep, then let it go. You're ready.",
      "{company} interview is {timeframe}. They invited you because your background fits. This is a conversation, not a test.",
      "Big day {timeframe}. The prep is done. Tonight, do something that has nothing to do with work.",
    ],
  },
  {
    priority: 2,
    trigger: "resume_just_approved",
    messages: [
      "Resume approved for {company}. That's another application ready to go.",
      "{company} resume is locked in. One tap and it's out the door.",
      "Your {jobTitle} resume is approved. The system tailored it. You reviewed it. Now send it.",
    ],
  },
  {
    priority: 3,
    trigger: "resume_ready_for_review",
    messages: [
      "Your {company} resume is ready for review. Takes about 2 minutes.",
      "New tailored resume waiting: {jobTitle} at {company}. Take a look when you're ready.",
      "Cowork finished tailoring your {company} resume. Your call on whether it's right.",
    ],
  },
  {
    priority: 4,
    trigger: "followup_due",
    messages: [
      "Your {company} application is {days} days old. A short follow-up keeps you top of mind.",
      "It's been {days} days since you applied to {company}. Most hiring managers appreciate a check-in.",
      "{company} hasn't responded in {days} days. A two-sentence follow-up can make the difference.",
    ],
  },
  {
    priority: 5,
    trigger: "new_jobs_found",
    messages: [
      "The pipeline found {count} new matches overnight. Your system is working while you rest.",
      "{count} new jobs to look at this morning. Grab your coffee.",
      "Fresh batch: {count} new matches came in. Let's see what's out there.",
      "Your pipeline pulled {count} new roles since yesterday. Some look solid.",
    ],
  },
  {
    priority: 6,
    trigger: "application_sent_yesterday",
    messages: [
      "Application sent to {company} yesterday. Every application is a real shot. This one's in play.",
      "You applied to {company}. That's {totalApplied} applications total. The numbers are working in your favor.",
      "{company} application is out the door. Onto the next one.",
    ],
  },
  {
    priority: 7,
    trigger: "pipeline_active_nothing_urgent",
    messages: [
      "Pipeline is healthy. {pursuing} jobs in progress, {applied} applications out. Steady wins this.",
      "No fires today. {applied} applications working their way through. Good day to review new matches.",
      "Your tracker is running in the background. Nothing needs your attention right now, and that's fine.",
      "Everything is moving. {pursuing} in progress, {applied} out there. You're in a good rhythm.",
    ],
  },
  {
    priority: 8,
    trigger: "dry_spell_5_plus_days",
    messages: [
      "It's been {days} days since your last application. Even one keeps the momentum going.",
      "The search has been quiet. That's okay. One bookmark, one review, one application. Pick one.",
      "No applications this week yet. Today's a good day to change that. You've got matches waiting.",
    ],
  },
  {
    priority: 9,
    trigger: "nothing_happening",
    messages: [
      "Quiet morning. The pipeline keeps scanning. Good day to invest in a connection or sharpen a skill.",
      "Nothing on the board today. That's rare. Take the win and do something you enjoy.",
      "Slow day on the tracker. The system is still running. Rest when you can.",
      "No action items this morning. Some days are for recharging. The pipeline doesn't take days off.",
    ],
  },
];
