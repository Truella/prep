# Prep — Quiz Builder

A full-featured quiz creation and taking application built with Next.js, TypeScript, and Supabase.

## Features

- **Quiz Builder** — Create quizzes via a visual inline builder (add/reorder/delete questions) or CSV upload
- **CSV Import/Export** — Upload questions via CSV; download generated CSV templates
- **Shareable Links** — Generate shareable links for quizzes after creation
- **Timed Quizzes** — Optional time limit (1–180 min) with countdown, warning toast, and auto-submit
- **Take Quiz** — Answer questions with navigation, question overview, and progress tracking
- **Results & Review** — Instant scoring, time tracking, and answer review
- **Dashboard** — View all quizzes with stats and analytics
- **Authentication** — Email/password auth via Supabase Auth with protected routes
- **Progress Persistence** — Quiz progress saved locally to survive refreshes; timer persists via localStorage deadline

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **CSV Parsing**: PapaParse
- **Icons**: Hugeicons
- **Notifications**: react-hot-toast
- **Test Runner**: Vitest with jsdom, Testing Library
- **Linter**: ESLint 9 with typescript-eslint

## Prerequisites

- Node.js (v20 or higher)
- npm
- Supabase account

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd prep
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run database migrations

```bash
npx supabase login
npx supabase link --project-ref your_project_ref
npx supabase db push
```

### 5. Run the dev server

```bash
npm run dev
```

The app will open at `http://localhost:3000`.

## CSV Format

Download the template from the CSV upload tab, or use this format:

```csv
Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is 2+2?,2,3,4,5,C,1
Capital of France?,London,Paris,Berlin,Madrid,B,2
```

**Rules:**
- Headers must match exactly: `Question`, `Option_A`–`Option_D`, `Correct_Answer`, `Points`
- `Correct_Answer` is a single letter: A, B, C, or D
- `Points` is a positive integer
- Fields with commas or quotes are properly escaped on export

## Usage

### Creating a Quiz

1. Go to the landing page and click **Get Started**, then sign in
2. Navigate to **Dashboard → Create Quiz**
3. Enter a title and optional description
4. Optionally set a time limit (1–180 minutes)
5. Click **Create Quiz** to persist the quiz
6. Add questions using the **Build** tab (visual builder) or **Upload CSV** tab
7. Click **Publish Questions** to save them

### Taking a Quiz

1. Open a shareable link or navigate from the dashboard
2. Answer questions using the navigation or overview grid
3. The timer (if set) counts down with color-coded warnings
4. Click **Submit Quiz** or let the timer auto-submit
5. View your score, time taken, and review answers

## Project Structure

```
prep/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Sign-in / sign-up page
│   ├── dashboard/
│   │   ├── create/               # Create quiz page (builder + CSV)
│   │   ├── my-quizzes/           # Quiz list page
│   │   ├── layout.tsx            # Dashboard layout (RequireAuth + Sidebar)
│   │   └── page.tsx              # Dashboard home (stats)
│   ├── quiz/                     # Quiz result pages
│   ├── results/                  # Results listing
│   ├── take/                     # Quiz-taking page
│   ├── layout.tsx                # Root layout (AuthProvider, Toaster)
│   ├── page.tsx                  # Landing page
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── auth/                 # AuthPageClient
│   │   ├── quiz/                 # Quiz-taking UI (Timer, QuestionCard, Results, Review, etc.)
│   │   ├── quiz-builder/         # BuilderQuestionCard, QuizBuilder, TimeLimitInput
│   │   ├── skeletons/            # Loading skeletons
│   │   ├── DashboardLayout.tsx    # Sidebar + TopBar layout
│   │   ├── UploadQuestionsForm.tsx# CSV upload form
│   │   ├── ShareableLink.tsx     # Link copy component
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx       # Auth provider + hook
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state hook
│   │   ├── useCreateQuiz.ts      # Quiz creation + question upload
│   │   ├── useTakeQuiz.ts        # Quiz-taking logic (timer, progress, submit)
│   │   ├── useQuizProgress.ts    # LocalStorage progress persistence
│   │   ├── useQuizzes.ts         # Quiz listing
│   │   ├── useStats.ts           # Dashboard stats
│   │   ├── useQuestionCollapse.ts# Builder collapse state
│   │   └── ...
│   ├── lib/
│   │   ├── types.ts              # Shared TypeScript types
│   │   └── supabase.ts           # Supabase client
│   ├── utils/
│   │   ├── csvParser.ts          # CSV → questions parsing
│   │   ├── csvGenerator.ts       # Questions → CSV export
│   │   ├── transforms.ts         # DB ↔ App data transforms
│   │   ├── questionValidation.ts # Question/quiz validation
│   │   └── helpers.ts
│   ├── views/
│   │   ├── CreateQuiz.tsx        # Tabbed create page (build / csv)
│   │   ├── Dashboard.tsx         # Dashboard stats view
│   │   ├── Quizzes.tsx           # Quiz list view
│   │   └── Auth/                 # Auth page view
│   ├── constants/
│   │   └── navItems.ts           # Sidebar navigation config
│   └── index.css
├── supabase/
│   ├── migrations/               # SQL migrations (managed via Supabase CLI)
│   └── config.toml
├── docs/
│   └── prt.md                    # Pull request tracking plan
├── vitest.config.ts
├── eslint.config.mjs
└── next.config.ts
```

## Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start dev server          |
| `npm run build`      | Production build          |
| `npm start`          | Start production server   |
| `npm run lint`       | Run ESLint                |
| `npm run typecheck`  | Run TypeScript check      |
| `npm test`           | Run Vitest                |

## Environment Variables

| Variable                         | Description              |
| -------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase anonymous key   |

## Database

The project uses two main tables managed through Supabase migrations:

- **quizzes** — `id`, `created_at`, `title`, `description`, `time_limit` (nullable, CHECK 1–180)
- **questions** — `id`, `created_at`, `quiz_id` (FK), `question_text`, `option_a`–`d`, `correct_index`, `points`, `order`

Run `npx supabase db push` to apply migrations.

## License

MIT

## Contributing

This is a personal study project. Feel free to fork and modify for your own use.
