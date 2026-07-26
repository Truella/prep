import { useState, useEffect } from "react";
import type { AIReviewPayload } from "../lib/types";

interface AIReviewState {
  review: string | null;
  loading: boolean;
  error: string | null;
  isRateLimited: boolean;
}

export function useAIReview(quizId: string) {
  const [state, setState] = useState<AIReviewState>({
    review: null,
    loading: false,
    error: null,
    isRateLimited: false,
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
    setState({ review: null, loading: true, error: null, isRateLimited: false });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.status === 429) {
        setState({
          review: null,
          loading: false,
          error:
            "You've used your 5 free reviews this hour. Try again later, or use the export option below.",
          isRateLimited: true,
        });
        return;
      }

      if (!response.ok || data.error) {
        setState({
          review: null,
          loading: false,
          error: "AI review is temporarily unavailable.",
          isRateLimited: false,
        });
        return;
      }

      setState({ review: data.review, loading: false, error: null, isRateLimited: false });

      try {
        localStorage.setItem(cacheKey, data.review);
      } catch (err) {
        console.error("Failed to cache AI review:", err);
      }
    } catch {
      clearTimeout(timeoutId);
      setState({
        review: null,
        loading: false,
        error: "AI review is temporarily unavailable.",
        isRateLimited: false,
      });
    }
  };

  const clearReview = () => {
    try {
      localStorage.removeItem(cacheKey);
    } catch {}
    setState({ review: null, loading: false, error: null, isRateLimited: false });
  };

  return { ...state, getReview, clearReview };
}

