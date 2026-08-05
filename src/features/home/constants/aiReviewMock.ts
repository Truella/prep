import type { QuizCategory } from "@/lib/types";

export const PHASE_DURATIONS = [4200, 1200, 1500, 4000] as const;

export interface AIReviewMockDataset {
  category: Extract<
    QuizCategory,
    | "Technology"
    | "Science"
    | "History"
    | "Mathematics"
    | "Language & Literature"
    | "Geography"
  >;
  percentage: number;
  earnedPoints: number;
  totalPoints: number;
  reviewPoints: [string, string, string];
  recommendation: string;
}

export const AI_REVIEW_MOCK_DATASETS: AIReviewMockDataset[] = [
  {
    category: "Technology",
    percentage: 84,
    earnedPoints: 21,
    totalPoints: 25,
    reviewPoints: [
      "Data structures were rock solid.",
      "Network protocols need review.",
      "System design trade-offs were strong.",
    ],
    recommendation: "Next: review networking basics, then retry the quiz.",
  },
  {
    category: "Science",
    percentage: 72,
    earnedPoints: 18,
    totalPoints: 25,
    reviewPoints: [
      "Cell division stages need a second pass.",
      "Enzyme functions were your least consistent area.",
      "Genetics and inheritance were strong.",
    ],
    recommendation: "Next: review mitosis and enzyme roles, then retry the quiz.",
  },
  {
    category: "History",
    percentage: 64,
    earnedPoints: 16,
    totalPoints: 25,
    reviewPoints: [
      "Treaty dates were mixed up.",
      "Cause-and-effect chains were strong.",
      "20th century timeline needs another pass.",
    ],
    recommendation: "Next: review WWI and WWII timelines, then retry the quiz.",
  },
  {
    category: "Mathematics",
    percentage: 78,
    earnedPoints: 31,
    totalPoints: 40,
    reviewPoints: [
      "Algebraic manipulation was accurate.",
      "Trigonometric identities need more practice.",
      "Calculus reasoning was consistent.",
    ],
    recommendation: "Next: drill core trig identities, then retry the quiz.",
  },
  {
    category: "Language & Literature",
    percentage: 88,
    earnedPoints: 22,
    totalPoints: 25,
    reviewPoints: [
      "Theme analysis was thoughtful and precise.",
      "Poetic devices need closer attention.",
      "Context questions were consistently strong.",
    ],
    recommendation: "Next: revise poetic devices, then retry the quiz.",
  },
  {
    category: "Geography",
    percentage: 70,
    earnedPoints: 14,
    totalPoints: 20,
    reviewPoints: [
      "Map-reading skills were reliable.",
      "Climate systems need another pass.",
      "Population trends were well understood.",
    ],
    recommendation: "Next: review climate zones and circulation, then retry the quiz.",
  },
];
