# Quiz App

A simple quiz creation and sharing application built with React, TypeScript, and Supabase.

## Features

- Create multiple-choice quizzes via CSV upload
- Generate shareable links for quizzes
- Take quizzes and see results instantly
- Track scores and review answers

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Routing**: React Router

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd quiz-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Supabase

Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up database

In your Supabase project, create a table called `quizzes`:
```sql
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  questions jsonb NOT NULL
);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON quizzes FOR SELECT
USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert"
ON quizzes FOR INSERT
WITH CHECK (true);
```

### 5. Run the app
```bash
npm start
```

The app will open at `http://localhost:3000`

## CSV Format

When creating a quiz, use this CSV format:
```csv
Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is 2+2?,2,3,4,5,C,1
Capital of France?,London,Paris,Berlin,Madrid,B,2
```

**Rules:**
- Headers must match exactly: `Question`, `Option_A`, `Option_B`, `Option_C`, `Option_D`, `Correct_Answer`, `Points`
- `Correct_Answer` should be a letter: A, B, C, or D
- `Points` should be a number

## Usage

### Creating a Quiz

1. Click "Create New Quiz"
2. Enter a quiz title
3. Upload your CSV file
4. Click "Create Quiz"
5. Copy the shareable link

### Taking a Quiz

1. Open the shareable link
2. Answer all questions
3. Click "Submit Quiz"
4. View your score and review answers

## Project Structure
```
quiz-app/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components
│   ├── lib/            # Supabase client and types
│   ├── utils/          # Helper functions (CSV parser)
│   └── App.tsx         # Main app component
├── public/
└── package.json
```

## Development
```bash
# Run development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## License

MIT

## Contributing

This is a personal study project. Feel free to fork and modify for your own use.