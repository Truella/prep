export const FEATURES = [
  {
    title: "Timed practice",
    description:
      "Set a countdown that matches your real exam conditions. Auto-submits when time runs out.",
    icon: "⏱",
  },
  {
    title: "AI performance review",
    description:
      "After each attempt, get a breakdown of your strengths and the specific topics you need to revisit.",
    icon: "◈",
  },
  {
    title: "CSV upload",
    description:
      "Turn your notes or past paper questions into a quiz in seconds. One spreadsheet, ready to share.",
    icon: "↑",
  },
  {
    title: "Public quiz bank",
    description:
      "Browse quizzes shared by others. Filter by subject and difficulty. No account needed to take.",
    icon: "⊞",
  },
  {
    title: "Share with anyone",
    description:
      "One link. Your study group can take the quiz immediately — no sign-up required for takers.",
    icon: "⇢",
  },
  {
    title: "Progress saved",
    description:
      "Close the tab and pick up exactly where you left off. Your answers are saved automatically.",
    icon: "◉",
  },
];

export const STEPS = [
  {
    label: "Add your questions",
    description:
      "Build a question set manually or upload a CSV from your notes or past papers. Set an optional time limit.",
  },
  {
    label: "Share the link",
    description:
      "Copy the link and send it to your study group. No account needed to take the quiz.",
  },
  {
    label: "Review your results",
    description:
      "See your score, question-by-question breakdown, and an AI analysis of where you need to focus.",
  },
];

export const USE_CASES = [
  {
    title: "Solo exam prep",
    description:
      "Build your own question bank from past papers and textbook chapters. Practice under timed conditions until the format feels familiar.",
  },
  {
    title: "Study groups",
    description:
      "One person creates the quiz, everyone else takes it. Compare scores, discuss the questions you all got wrong.",
  },
  {
    title: "Educators",
    description:
      "Set practice tests for your students without managing accounts. Share a link, they take it, you share results.",
  },
];

export const SAMPLE_QUIZZES = [
  { title: "Cell Biology — Chapter 3", category: "Biology", difficulty: "Intermediate", taken: 142 },
  { title: "WAEC Mathematics 2023", category: "Mathematics", difficulty: "Advanced", taken: 891 },
  { title: "Introduction to Microeconomics", category: "Economics", difficulty: "Beginner", taken: 204 },
];

export const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "text-green-500 bg-green-500/10 border-green-500/20",
  Intermediate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  Advanced: "text-red-500 bg-red-500/10 border-red-500/20",
};