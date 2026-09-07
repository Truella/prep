export const TYPING_RATE_MS = 40;
export const TYPING_SETTLE_MS = 300;
export const OPTION_STAGGER_MS = 400;
export const OPTION_FADE_MS = 250;
export const OPTION_SETTLE_MS = 300;
export const CLICK_TRAVEL_MS = 600;
export const CLICK_PRESS_MS = 200;
export const COLLAPSED_CARD_HOLD_MS = 800;
export const PUBLISH_SETTLE_MS = 400;
export const SUCCESS_HOLD_MS = 2000;

export const QUIZ_BUILD_MOCK = {
  title: "Data Structures Fundamentals",
  question: "Which data structure provides O(1) indexed access?",
  options: ["Array", "Linked list", "Binary tree", "Hash set"],
  correctAnswerIndex: 0,
  secondQuestion: "Which data structure follows last in, first out (LIFO)?",
  secondOptions: ["Queue", "Stack", "Graph", "Heap"],
  secondCorrectAnswerIndex: 1,
  shareableLink: "prep.app/quiz/data-structures",
  shareCode: "DSA101",
} as const;

export const QUIZ_BUILD_PHASE_DURATIONS = [
  QUIZ_BUILD_MOCK.title.length * TYPING_RATE_MS + TYPING_SETTLE_MS,
  QUIZ_BUILD_MOCK.question.length * TYPING_RATE_MS + TYPING_SETTLE_MS,
  (QUIZ_BUILD_MOCK.options.length - 1) * OPTION_STAGGER_MS +
    OPTION_FADE_MS +
    OPTION_SETTLE_MS,
  CLICK_TRAVEL_MS + CLICK_PRESS_MS + PUBLISH_SETTLE_MS,
  OPTION_FADE_MS + COLLAPSED_CARD_HOLD_MS,
  CLICK_TRAVEL_MS + CLICK_PRESS_MS,
  SUCCESS_HOLD_MS,
] as const;
