import { NextRequest, NextResponse } from "next/server";
import type { AIReviewPayload } from "../../../src/lib/types";

// In-memory rate limit store — resets on cold start, acceptable for portfolio scale
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= RATE_LIMIT) {
      const minutesLeft = Math.ceil((record.resetAt - now) / 60000);
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        },
        { status: 429 }
      );
    }
    record.count++;
  } else {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  }

  let payload: AIReviewPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { questions, selectedAnswers, score, totalPoints } = payload;

  if (
    !Array.isArray(questions) ||
    typeof selectedAnswers !== "object" ||
    selectedAnswers === null ||
    !Number.isFinite(score) ||
    !Number.isFinite(totalPoints) ||
    totalPoints <= 0
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const percentage = Math.round((score / totalPoints) * 100);

  const questionLines = questions
    .map((q, i) => {
      const userIdx = selectedAnswers[i] ?? -1;
      const options = [q.optionA, q.optionB, q.optionC, q.optionD];
      const userAnswer = userIdx >= 0 ? options[userIdx] : "Not answered";
      const correctAnswer = options[q.correctIndex];
      const correct = userIdx === q.correctIndex;
      return `Q${i + 1}: ${q.questionText}\nUser answered: ${userAnswer} (${correct ? "Correct" : "Wrong"})\nCorrect answer: ${correctAnswer}`;
    })
    .join("\n\n");

  const prompt = `You are a supportive, insightful tutor reviewing a user's quiz performance. The user scored ${score}/${totalPoints} (${percentage}%) on the quiz.

${questionLines}

Provide a brief, personalized performance review directly to the user (address them as "you"):
- 3-5 sentences on what you did well
- 3-5 sentences on areas for you to improve
- 2-3 specific, actionable study suggestions

Be concise and specific to the questions above. Maintain a direct, encouraging tutor-to-student tone.`;

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 600,
          temperature: 0.4,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!groqResponse.ok) {
      return NextResponse.json(
        { error: "AI review temporarily unavailable." },
        { status: 502 }
      );
    }

    const data = await groqResponse.json();
    const review: string | undefined = data.choices?.[0]?.message?.content;

    if (!review) {
      return NextResponse.json(
        { error: "AI review temporarily unavailable." },
        { status: 502 }
      );
    }

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json(
      { error: "AI review temporarily unavailable." },
      { status: 502 }
    );
  }
}
