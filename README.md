# Will's Job Dashboard

Mobile-first Next.js dashboard for daily job search. Reads from and writes to the existing Notion database that the pipeline, email, and prep systems already use.

## What's built

**Auth:** NextAuth credentials provider with 2 hardcoded accounts (Tanya + Will). JWT sessions lasting 30 days. Protected routes via middleware.

**Notion client** (`lib/notion.ts`): Full read/write layer. Maps all 47 Notion properties to TypeScript types. Handles pagination, property extraction, and all write operations.

**API routes (9 total):**
- `GET /api/jobs` — fetch active (non-dismissed, non-on-site) jobs sorted by score
- `PATCH /api/jobs/[id]/bookmark` — toggle bookmark, auto-set resume status
- `PATCH /api/jobs/[id]/dismiss` — dismiss with reason
- `PATCH /api/jobs/[id]/apply` — mark applied with today's date
- `PATCH /api/jobs/[id]/approve-resume` — approve tailored resume
- `PATCH /api/jobs/[id]/followup` — record follow-up, increment count
- `PATCH /api/jobs/[id]/note` — save notes
- `PATCH /api/jobs/[id]/interview` — update interview details
- `POST /api/jobs/add-job` — create manual job entry

**Dashboard UI:**
- Review tab: Monday banner, needs-attention alerts, job cards with bookmark/dismiss/expand
- Pipeline tab: Pursuing (with resume review), Applied (with follow-up nudges + email templates), Interviewing (with prep status)
- Add Job overlay: full-screen form, manual entries go straight to Pipeline
- Toast with undo for destructive actions (dismiss, mark applied)
- Optimistic updates on all mutations

**Design:** Tailwind CSS with the exact design tokens from the prototype. Inter + JetBrains Mono. Max-width 480px. No emojis, no clutter.

## Deploy to Vercel

### 1. Push to GitHub

```bash
cd wills-dashboard
git init
git add .
git commit -m "Initial dashboard build"
gh repo create wills-job-dashboard --private --push
```

### 2. Generate password hashes

Run this locally to hash passwords for both accounts:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(h => console.log(h))"
```

### 3. Set environment variables in Vercel

Connect the repo on [vercel.com](https://vercel.com), then add these env vars:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://wills-job-dashboard.vercel.app`) |
| `USER_EMAIL_1` | Tanya's email |
| `USER_PASSWORD_HASH_1` | bcrypt hash from step 2 |
| `USER_EMAIL_2` | `wilsharp20@gmail.com` |
| `USER_PASSWORD_HASH_2` | bcrypt hash from step 2 |
| `NOTION_API_KEY` | Same key used in Apps Script and GitHub Actions |
| `NOTION_DATABASE_ID` | `ac20106e-1c1c-4000-8065-f57850f48d10` |

### 4. Deploy

Vercel auto-deploys on push. First deploy takes ~60 seconds. After that, every `git push` triggers a new build.

## Local development

```bash
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

## File structure

```
app/
  layout.tsx              Root layout, fonts, global styles
  page.tsx                Redirect to /dashboard
  providers.tsx           NextAuth SessionProvider
  globals.css             Tailwind + custom animations
  login/page.tsx          Login form
  api/                    9 API routes (all auth-protected)
  dashboard/
    page.tsx              Main dashboard with state management
    components/
      Tabs.tsx            Review/Pipeline toggle
      JobCard.tsx         Review tab card (bookmark, expand, dismiss)
      PipelineView.tsx    Three pipeline sections
      ResumeReview.tsx    Inline resume approval panel
      MondayBanner.tsx    Weekly coaching banner
      AddJobOverlay.tsx   Full-screen add job form
      Toast.tsx           Notification with undo
lib/
  auth.ts                 NextAuth config
  notion.ts               Notion API client
  types.ts                TypeScript interfaces
  dates.ts                Date utilities
  templates/
    followup-emails.ts    3 follow-up email templates
middleware.ts             Auth protection for /dashboard
```
