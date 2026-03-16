// lib/content/daily-tips.ts
// 50 rotating tips for Will's Today screen.
// Tips are weighted by category based on pipeline state.
// Rotate by day-of-year to avoid repeats within a month.

export type TipCategory =
  | "interview_prep"
  | "career_gap"
  | "networking"
  | "application_strategy"
  | "mindset"
  | "followup"
  | "self_care";

export interface DailyTip {
  id: number;
  category: TipCategory;
  text: string;
}

// Weight multipliers applied when pipeline state matches
export const TIP_WEIGHTS: Record<string, { category: TipCategory; multiplier: number }[]> = {
  has_active_interview: [{ category: "interview_prep", multiplier: 3 }],
  pursuing_not_applied: [{ category: "application_strategy", multiplier: 2 }],
  followup_overdue: [{ category: "followup", multiplier: 2 }],
  no_activity_5_days: [{ category: "mindset", multiplier: 2 }],
};

export const DAILY_TIPS: DailyTip[] = [
  // Interview Prep (1-10)
  { id: 1, category: "interview_prep", text: "Prepare 2-3 questions that show you've researched the company. Interviewers remember candidates who are curious." },
  { id: 2, category: "interview_prep", text: "Your 'tell me about yourself' answer should be 90 seconds. Lead with your most recent relevant experience." },
  { id: 3, category: "interview_prep", text: "For case study rounds, narrate your thinking out loud. They're evaluating your process, not just your answer." },
  { id: 4, category: "interview_prep", text: "When asked about your career gap, lead with what you built during it. AI certifications and self-directed learning show initiative." },
  { id: 5, category: "interview_prep", text: "End every interview by asking about the team's biggest challenge right now. It positions you as a problem solver." },
  { id: 6, category: "interview_prep", text: "Mirror the interviewer's energy. If they're casual, relax. If they're structured, match it. Rapport matters as much as answers." },
  { id: 7, category: "interview_prep", text: "The best interview answers have numbers in them. Quantify your impact whenever you can." },
  { id: 8, category: "interview_prep", text: "Write down the names of everyone you speak with. Reference something specific from each conversation in your thank-you note." },
  { id: 9, category: "interview_prep", text: "Practice your answers out loud, not just in your head. The difference is bigger than you'd expect." },
  { id: 10, category: "interview_prep", text: "If you don't know the answer, say so honestly and explain how you'd find it. That's more impressive than guessing." },
  // Career Gap (11-15)
  { id: 11, category: "career_gap", text: "Career gaps are more common than ever. 60% of workers have taken one. Frame yours as a strategic investment period." },
  { id: 12, category: "career_gap", text: "When the gap comes up, pivot to what you built during it. Your AI certifications aren't a footnote. They're the headline." },
  { id: 13, category: "career_gap", text: "Hiring managers care about what you can do now. Lead with current capabilities, not a timeline." },
  { id: 14, category: "career_gap", text: "Your gap story is simple: you invested in AI skills because you saw where operations is headed. That's forward-thinking." },
  { id: 15, category: "career_gap", text: "The companies worth working for understand career gaps. The ones that don't aren't a fit anyway." },
  // Networking (16-23)
  { id: 16, category: "networking", text: "80% of jobs are filled through networking. One LinkedIn message to someone at a target company is worth 10 cold applications." },
  { id: 17, category: "networking", text: "Don't ask people for a job. Ask about their experience at the company. You'll learn things the posting won't tell you." },
  { id: 18, category: "networking", text: "After an interview, connect with your interviewer on LinkedIn within 24 hours with a note referencing something specific from the conversation." },
  { id: 19, category: "networking", text: "Check if target companies have veteran employee resource groups. Warm intros beat cold applications." },
  { id: 20, category: "networking", text: "Commenting on posts from people at companies you're targeting puts your name on their radar before you ever apply." },
  { id: 21, category: "networking", text: "Informational interviews aren't just for college students. A 15-minute call with someone in the role you want is the best research you can do." },
  { id: 22, category: "networking", text: "Recruiters on LinkedIn are more responsive than you'd think. A short, specific message about a posted role gets replies." },
  { id: 23, category: "networking", text: "Your network from Hiscox and AIG is an asset. People who've worked with you can vouch for you in ways a resume can't." },
  // Application Strategy (24-30)
  { id: 24, category: "application_strategy", text: "Apply within the first week of a posting going live. Early applicants get more attention." },
  { id: 25, category: "application_strategy", text: "If a job says 'preferred' and not 'required,' apply anyway. Preferred means nice-to-have." },
  { id: 26, category: "application_strategy", text: "One well-researched application beats five generic ones. The system tailors your resume. You research the company." },
  { id: 27, category: "application_strategy", text: "Salary ranges in postings are usually the middle of the band. If you're senior, aim for the top third." },
  { id: 28, category: "application_strategy", text: "Look at the company's recent news before applying. Mentioning something current in your application shows you're paying attention." },
  { id: 29, category: "application_strategy", text: "If a role has been posted for 30+ days, they're probably struggling to fill it. Your application might be exactly what they need." },
  { id: 30, category: "application_strategy", text: "Contract roles aren't lesser roles. They get you in the door, build recent experience, and often convert to full-time." },
  // Mindset and Perspective (31-40)
  { id: 31, category: "mindset", text: "The average job search takes 3-6 months. You're not behind. You're in the process." },
  { id: 32, category: "mindset", text: "Rejection isn't personal. Companies pass on candidates for dozens of reasons that have nothing to do with qualifications." },
  { id: 33, category: "mindset", text: "Comparison is the thief of momentum. Your timeline isn't anyone else's." },
  { id: 34, category: "mindset", text: "On hard days, look at your pipeline stats. You're not starting from zero. You've built something." },
  { id: 35, category: "mindset", text: "The right role doesn't just need your skills. It needs your specific combination of experience. That's rare." },
  { id: 36, category: "mindset", text: "10 years of operations experience is uncommon. Add AI literacy and you're in a category most candidates can't touch." },
  { id: 37, category: "mindset", text: "The job search is temporary. Your skills and experience are permanent." },
  { id: 38, category: "mindset", text: "Some weeks feel like nothing is happening. Then one email changes everything. Keep the pipeline full." },
  { id: 39, category: "mindset", text: "You're not just looking for a job. You're looking for the right job. That takes longer, and it's worth it." },
  { id: 40, category: "mindset", text: "Every 'no' narrows the field toward the right 'yes.' That's not optimism. That's math." },
  // Follow-Up and Persistence (41-45)
  { id: 41, category: "followup", text: "Following up isn't pushy. It's professional. Hiring managers are busy and your email might have been buried." },
  { id: 42, category: "followup", text: "The second follow-up is where most people give up. That's exactly why the third one often gets a response." },
  { id: 43, category: "followup", text: "If a company ghosts you, it's not a reflection of your worth. It's a reflection of their process." },
  { id: 44, category: "followup", text: "A follow-up email doesn't need to be long. Three sentences: checking in, still interested, happy to provide anything else." },
  { id: 45, category: "followup", text: "Timing matters for follow-ups. Tuesday through Thursday mornings tend to get the best response rates." },
  // Self-Care (46-50)
  { id: 46, category: "self_care", text: "Take a walk today without thinking about the job search. Your brain solves problems in the background." },
  { id: 47, category: "self_care", text: "If you've been grinding all week, today is for rest. The pipeline runs without you." },
  { id: 48, category: "self_care", text: "The search is a marathon. Treat yourself like an athlete: effort, recovery, repeat." },
  { id: 49, category: "self_care", text: "Write down one thing you're proud of from this week. Not job-related. Just something good." },
  { id: 50, category: "self_care", text: "Talk to someone today who isn't part of the job search. Connection keeps perspective." },
];

// Tip selection: rotate by day-of-year, weighted by pipeline state
export function selectTip(
  pipelineState: string[],
  dayOfYear: number
): DailyTip {
  // Build weighted pool
  const pool: DailyTip[] = [];
  for (const tip of DAILY_TIPS) {
    let weight = 1;
    for (const state of pipelineState) {
      const boosts = TIP_WEIGHTS[state];
      if (boosts) {
        for (const boost of boosts) {
          if (boost.category === tip.category) {
            weight = Math.max(weight, boost.multiplier);
          }
        }
      }
    }
    for (let i = 0; i < weight; i++) {
      pool.push(tip);
    }
  }

  // Deterministic selection by day
  const index = dayOfYear % pool.length;
  return pool[index];
}
