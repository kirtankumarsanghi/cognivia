# Cogniva

**Turn confusion into clarity.**

Cogniva is a real-time learning intelligence platform for classrooms. Students privately flag the exact moment they get confused during a lesson — no raised hands, no public embarrassment — and Cogniva turns those signals into an AI-tutored explanation for the student and a same-day, prioritized revision map for the educator.

It is the same "silent classroom confusion" problem tackled by the PulseCheck concept: professors in large lecture halls have no real-time signal for where the room lost the thread, and students rarely admit confusion out loud. Cogniva is a working full-stack implementation of that idea — a discreet confusion button, a confusion-intensity pulse per concept, an AI tutor, and an educator dashboard that turns raw signals into a ranked "what to re-teach next" list.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [How Confusion Becomes a Signal](#how-confusion-becomes-a-signal)
- [Data Model](#data-model)
- [API Surface](#api-surface)
- [Frontend Structure](#frontend-structure)
- [Design System](#design-system)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Mode (No AI Key Required)](#demo-mode-no-ai-key-required)
- [Known Gaps / Work in Progress](#known-gaps--work-in-progress)

---

## What It Does

### For students
- **Flag confusion in the moment.** A persistent "I'm Confused" button lets a student mark a concept as `Confused`, `Partially Clear`, or `Clear`, with an optional free-text note about what's unclear.
- **Get an AI explanation instantly.** Cogniva's AI Tutor (Google Gemini) responds with a structured explanation: a simple explanation, why it works, a relatable example, a common mistake, a quick comprehension check, and a next step. If the student is still lost, they can ask for the concept to be explained a *different* way rather than repeated.
- **See a personal mastery map.** Every concept has a mastery score (0–100) that rises with correct practice attempts and confirmed clarity, and falls when confusion is signaled.
- **Follow a same-day revision plan.** Any concept marked `Confused` is automatically added to a prioritized revision queue (High/Medium/Low) with a suggested time investment, and removed once the student demonstrates understanding.
- **Practice with instant feedback.** MCQ / true-false / short-answer questions per concept, with accuracy feeding back into the mastery score.
- **Track streaks and weekly progress.** A learning score blends mastery, practice accuracy, clarity confirmations, and completed revisions into a single number, plus a day-streak and a weekly activity chart.

### For educators
- **A live confusion pulse.** Every confusion signal across every student rolls up per concept into a 0–100% "confusion percentage," bucketed into LOW / MEDIUM / HIGH.
- **A confusion heatmap and topic breakdown.** Bar-chart and ranked-list views of which concepts are causing the most trouble class-wide.
- **AI-generated teaching recommendations.** Gemini turns the class's confusion metrics into a concrete, two-sentence suggestion for the next lecture (e.g., what to revisit before introducing the next topic).
- **Class-wide analytics.** Student count, average class mastery score, and count of "critical" concepts (≥66% confusion).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| Styling | Tailwind CSS (custom dark theme, design tokens), Framer Motion for animation |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript (`ts-node-dev` for local dev) |
| Database / Auth | Supabase (Postgres + Row-Level Security) |
| AI | Google Generative AI (`gemini-1.5-flash`) via `@google/generative-ai`, with a deterministic demo-mode fallback |
| Validation | Zod (backend) |
| Package management | npm workspaces (root `package.json` links `frontend` and `backend`) |

---

## Monorepo Structure

```
cognivia/
├── backend/                 Express + TypeScript API
│   └── src/
│       ├── server.ts        App entrypoint, CORS, error handling
│       ├── config/          Env loading, Supabase client
│       ├── controllers/     (scaffolded, currently empty — see "Known Gaps")
│       ├── middleware/      (scaffolded, currently empty — see "Known Gaps")
│       ├── routes/          index.ts holds ALL current API routes
│       ├── services/        geminiService.ts is implemented; others are stubs
│       ├── types/           shared TS types (stub)
│       └── utils/           scoring/validation/prompt helpers (stubs)
├── database/
│   ├── schema.sql           Full Postgres schema + RLS policies
│   └── seed.sql              Demo data: 1 educator, 1 student, 1 course, 7 concepts
└── frontend/                 React + Vite SPA
    └── src/
        ├── components/
        │   ├── landing/       Marketing site (Hero, Problem, HowItWorks, sections, CTA)
        │   ├── dashboard/     Student-facing app (Dashboard, Courses, Tutor, Revision…)
        │   ├── educator/      Educator-facing analytics dashboard
        │   ├── tutor/         Chat-style tutor UI primitives
        │   ├── concepts/      Concept detail / graph / mastery bar (stubs)
        │   └── ui/            Shared primitives (Badge, Button, Card, Modal, Loading)
        ├── hooks/             useAuth, useApi, useDashboard, useTutor, useConfusionSignal
        ├── layouts/           StudentLayout, EducatorLayout, PublicLayout
        ├── pages/             Route-level page wrappers
        ├── services/          Frontend API client wrappers
        └── types/             Shared frontend TS types
```

The root `package.json` is an npm **workspaces** root (`"workspaces": ["frontend", "backend"]`), so `npm install` at the repo root installs both packages' dependencies.

---

## How Confusion Becomes a Signal

1. **Student submits a signal** — `POST /api/confusion/signal` with `{ concept_id, signal }` where `signal` is `Confused` | `Partially Clear` | `Clear`.
2. **Mastery updates immediately:**
   - `Confused` → mastery score drops by 10 (floored at 0), and the concept is upserted into `revision_plans` as **High priority, 10 minutes**.
   - `Clear` → mastery score rises by 15 (capped at 100), any pending revision plan for that concept is deleted, and a "you improved!" notification is created.
3. **Concept-level confusion %** is computed on read (`GET /api/concepts/:id`) from the student's last 10 signals for that concept: `Confused` = 1.0 weight, `Partially Clear` = 0.5, `Clear` = 0.0, averaged and expressed as a percentage.
4. **The aggregate "pulse"** (`GET /api/confusion/pulse` for students, `/api/analytics/educator` for class-wide) groups *all* signals by concept, computes the same weighted average across every student who has signaled on that concept, and buckets it:
   - `≥ 66%` → **HIGH**
   - `33–65%` → **MEDIUM**
   - `< 33%` → **LOW**
5. **Revision completion** (`POST /api/revision/:id/complete`) or a **practice streak of ≥3 attempts with ≥80% accuracy** nudges mastery back up, and logs a `learning_sessions` row so streaks and weekly-activity charts stay accurate.

This is the same anti-noise idea as an aggregate "confusion intensity" ranking discussed for classroom pulse tools: individual signals are cheap to give, but only the **aggregate, weighted, decayed-by-recency (last 10 signals)** view is what surfaces on a dashboard — a single student can't dominate a concept's confusion score.

---

## Data Model

Defined in `database/schema.sql`, applied to Supabase Postgres:

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users`; role is `student`, `educator`, or `admin` |
| `courses` | Top-level course, owned by an educator |
| `lessons` | Ordered lessons within a course |
| `concepts` | Individual learnable concepts within a lesson, with a difficulty tier |
| `concept_dependencies` | Self-referential graph: which concepts are prerequisites for which |
| `confusion_signals` | Every `Confused` / `Partially Clear` / `Clear` event a student submits |
| `mastery_scores` | One row per (student, concept), 0–100 |
| `ai_conversations` | Full Q&A history with the AI tutor, answer stored as structured JSONB |
| `revision_plans` | Auto-generated queue of concepts to revisit, with priority + estimated minutes |
| `practice_attempts` | Every answered practice question, correct or not |
| `learning_sessions` | Engagement log (lesson / practice / revision / tutor), powers streaks |
| `saved_explanations` | Student-bookmarked tutor explanations |
| `notifications` | In-app notifications (improvements, attention needed, plan ready) |
| `course_enrollments` | Student ↔ course join table |
| `practice_questions` | Seeded MCQ / true-false / short-answer bank per concept |

Row-Level Security is enabled on every table. For the MVP, policies are intentionally permissive (`auth.role() = 'authenticated'` can read everything) with tighter `INSERT`/`UPDATE` policies restricting students to writing their own rows (`auth.uid() = student_id`). This is documented in the schema as a simplification to revisit before production use.

`database/seed.sql` populates one demo educator, one demo student, one course ("Data Structures & Algorithms"), and seven interlinked concepts (Arrays → Searching → Big-O / Logarithms → Binary Search, etc.) with realistic seeded mastery scores, confusion signals, and practice history so the app is populated out of the box.

---

## API Surface

All routes are currently defined in a single file — `backend/src/routes/index.ts` — and mounted at the root. Authentication for the MVP is a lightweight header-based mock (see [Known Gaps](#known-gaps--work-in-progress)): every request must include `x-user-id` and `x-user-role` headers, checked by an inline `requireAuth` middleware.

| Area | Endpoints |
|---|---|
| Health | `GET /api/health` |
| Profile / Me | `GET /api/me`, `GET /api/profile`, `PUT /api/profile` |
| Courses | `GET /api/courses`, `GET /api/courses/:id`, `GET /api/lessons/:id`, `GET /api/concepts/:id` |
| Confusion | `POST /api/confusion/signal`, `GET /api/confusion/pulse`, `GET /api/confusion/history` |
| AI Tutor | `POST /api/tutor/chat`, `POST /api/tutor/explain-again`, `GET /api/tutor/history` |
| Revision | `GET /api/revision/plan`, `POST /api/revision/:id/complete` |
| Practice | `GET /api/practice`, `POST /api/practice/attempt` |
| Analytics | `GET /api/analytics/student`, `GET /api/analytics/educator` |
| Notifications | `GET /api/notifications`, `POST /api/notifications/:id/read` |
| Saved explanations | `GET /api/saved-explanations`, `POST /api/saved-explanations`, `DELETE /api/saved-explanations/:id` |
| Search | `GET /api/search?q=` (courses, lessons, concepts) |

The `analyticsController`, `authController`, `confusionController`, `courseController`, `revisionController`, and `tutorController` files under `controllers/`, along with everything in `middleware/` and most of `services/`, exist as **empty scaffolding** — the actual logic currently lives directly in `routes/index.ts`. Splitting that file into the scaffolded controllers/services/middleware is the natural next refactor (see below).

---

## Frontend Structure

- **Routing** (`App.tsx`): a public marketing site at `/`, a `/login` page, and two protected route trees gated by `ProtectedRoute` + `useAuth`:
  - **Student** (`allowedRole="student"`): `/dashboard`, `/courses`, `/course/:id`, `/tutor`, `/revision`, wrapped in `StudentLayout`.
  - **Educator** (`allowedRole="educator"`): `/educator`, wrapped in `EducatorLayout`.
  - Route transitions are animated with Framer Motion (`AnimatePresence` + a shared `RouteTransition` wrapper).
- **Landing page** (`components/landing/`): Hero with an animated 3D-style "abstract core" graphic, problem statement, a 5-step "How It Works" explainer, a student section, an educator section with a live dashboard mockup, a final CTA, and a footer.
- **Student dashboard** (`components/dashboard/`): a circular "Learning Score" gauge, streak card, AI-recommended next action, today's Clarity Plan (revision queue), a confusion-signal timeline, weekly progress stats, and unread notifications — all driven by `GET /api/analytics/student`.
- **Confusion flow**: `ConfusionButton.tsx` is a floating action button that opens a modal to pick course → lesson → concept → signal (Confused / Partially Clear / Clear) → optional note, then posts to `/api/confusion/signal`.
- **Tutor** (`components/dashboard/Tutor.tsx`): a single-question chat-style interface backed by `/api/tutor/chat`; renders the structured Gemini response (explanation, why it works, example, common mistake, quick check, next step) and lets the student confirm clarity (`Now I'm Clear`, with a small celebratory particle burst) or ask for an alternate explanation.
- **Revision** (`components/dashboard/Revision.tsx`): lists the prioritized revision queue and launches a practice-question flow per concept; completing a session with ≥70% accuracy auto-marks the revision item complete.
- **Educator dashboard** (`components/educator/EducatorDashboard.tsx`): summary cards (student count, average class score, high-confusion topic count), a Recharts bar chart of confusion-by-concept, a ranked topic breakdown with progress bars, and an AI-generated recommendation panel.
- **Several components are intentionally left as stubs** (e.g., `Sidebar.tsx`, `Topbar.tsx`, `ConceptGraph.tsx`, `ConfusionPulse.tsx`, most of `educator/*` besides `EducatorDashboard.tsx`). A helper script, `frontend/fix-empty.cjs`, walks `src/` and auto-fills any zero-byte `.tsx` file with a minimal placeholder component so the app always compiles even mid-scaffolding.

---

## Design System

Defined via Tailwind config (`frontend/tailwind.config.js`) and CSS custom properties (`frontend/src/index.css`):

- **Palette:** near-black background (`#000000`/`#0a0a0a`), a coral/red accent (`#e84040`) used for the confusion/urgency signal, and a warm gold (`#e8a634`) used as the primary brand/CTA color.
- **Typography:** Hanken Grotesk for display/headline text, Inter for body copy, JetBrains Mono for uppercase labels and eyebrow text — all loaded via Google Fonts in `index.html`.
- **Motion:** Framer Motion drives staggered section reveals (`fadeUp`/`staggerContainer` helpers in `utils/animation.tsx`), an animated circular progress ring for the Learning Score, animated confusion-heatmap bars, and a fully custom animated cursor (`CustomCursor.tsx`) with a trailing glow, ring, and dot that react to hoverable elements.
- **Material Symbols** (Google's icon font) are used throughout for iconography instead of an SVG icon library, alongside `lucide-react` for a handful of components.

---

## Getting Started

### 1. Database
Create a Supabase project, then run against it in order:
```bash
# in the Supabase SQL editor, or via the CLI
database/schema.sql
database/seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example ../.env      # copy to the REPO ROOT as `.env`
# edit .env: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev                  # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173 (Vite default)
```

Or, from the repo root, `npm install` will install both workspaces at once via npm workspaces.

---

## Environment Variables

Set in a `.env` file at the **repository root** (not inside `backend/`), per `backend/src/config/env.ts`:

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Defaults to `5000` |
| `FRONTEND_URL` | No | Defaults to `http://localhost:5173`; used for CORS |
| `SUPABASE_URL` | Yes (for real data) | Falls back to a mock localhost URL if unset |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for real data) | Backend uses the service role key to bypass RLS and filters by `student_id` in queries manually |
| `GEMINI_API_KEY` | No | See Demo Mode below |

---

## Demo Mode (No AI Key Required)

`geminiService.ts` checks for `GEMINI_API_KEY` at startup. If it's missing:
- `askTutor()` and `explainAgain()` return a fixed, well-formed **binary search** explanation (with `isDemo: true`), so the entire student tutor flow — ask, receive structured explanation, confirm clarity or ask for an alternate explanation — works end-to-end with zero API cost.
- `generateEducatorRecommendation()` returns a canned recommendation string.

This means the full product can be demoed (e.g., for a hackathon judge) without ever configuring a Gemini key — only live, dynamic AI responses require one.

---

## Known Gaps / Work in Progress

This is an early-stage MVP codebase, not a finished product. Worth knowing before building on it:

- **Auth is a placeholder.** `requireAuth` in `routes/index.ts` trusts client-supplied `x-user-id` / `x-user-role` headers with no signature or session verification — there is no real login/session issuance wired up yet (`authController.ts`, `authMiddleware.ts`, and `authRoutes.ts` are all empty). This must be replaced with real Supabase Auth (or equivalent JWT verification) before handling real user data.
- **Routes aren't split into controllers yet.** All business logic lives in one large `routes/index.ts`; the `controllers/`, most of `services/`, and `middleware/` directories are scaffolded but empty. Recommended next step: move each route group's logic into its matching controller + service pair, and move `requireAuth` into `middleware/authMiddleware.ts` with a real role-check in `roleMiddleware.ts`.
- **`utils/scoring.ts`, `utils/validators.ts`, `utils/prompts.ts`, `types/index.ts` are empty** — scoring math (mastery deltas, confusion-percentage weighting) and Gemini prompt templates currently live inline in `routes/index.ts` and `geminiService.ts` rather than being centralized and reusable/testable.
- **RLS policies are permissive by design** (`"Allow all authenticated read"` on nearly every table) — appropriate for an MVP demo, not for multi-tenant production use.
- **Frontend has two `layouts/` directories** (`components/layouts/` and `layouts/`) with overlapping `EducatorLayout.tsx` / `StudentLayout.tsx` — worth consolidating to avoid drift between the two copies.
- **Several UI components are unfinished stubs** (see Frontend Structure above) generated by `fix-empty.cjs` — they render a placeholder `<div>` rather than real UI.
