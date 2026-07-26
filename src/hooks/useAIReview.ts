import { useState, useEffect } from "react";
import type { AIReviewPayload } from "../lib/types";

interface AIReviewState {
  review: string | null;
  loading: boolean;
  error: string | null;
}

export function useAIReview(quizId: string) {
  const [state, setState] = useState<AIReviewState>({
    review: null,
    loading: false,
    error: null,
  });

  const cacheKey = `quiz_ai_review_${quizId}`;

  // Restore cached review on client side mount
  useEffect(() => {
    if (!quizId) return;
    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => ({ ...prev, review: saved }));
      }
    } catch (err) {
      console.error("Failed to restore cached AI review:", err);
    }
  }, [quizId, cacheKey]);

  const getReview = async (payload: AIReviewPayload) => {
    setState({ review: null, loading: true, error: null });

    try {
      const response = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 429) {
        setState({
          review: null,
          loading: false,
          error:
            "You've used your 5 free reviews this hour. Try again later, or use the export option below.",
        });
        return;
      }

      if (!response.ok || data.error) {
        setState({
          review: null,
          loading: false,
          error: "AI review is temporarily unavailable.",
        });
        return;
      }

      setState({ review: data.review, loading: false, error: null });

      try {
        localStorage.setItem(cacheKey, data.review);
      } catch (err) {
        console.error("Failed to cache AI review:", err);
      }
    } catch {
      setState({
        review: null,
        loading: false,
        error: "AI review is temporarily unavailable.",
      });
    }
  };

  const clearReview = () => {
    try {
      localStorage.removeItem(cacheKey);
    } catch {}
    setState({ review: null, loading: false, error: null });
  };

  return { ...state, getReview, clearReview };
}

