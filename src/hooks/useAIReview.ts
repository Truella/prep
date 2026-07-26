import { useState } from "react";
import type { AIReviewPayload } from "../lib/types";

interface AIReviewState {
  review: string | null;
  loading: boolean;
  error: string | null;
}

export function useAIReview() {
  const [state, setState] = useState<AIReviewState>({
    review: null,
    loading: false,
    error: null,
  });

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
    } catch {
      setState({
        review: null,
        loading: false,
        error: "AI review is temporarily unavailable.",
      });
    }
  };

  const clearReview = () =>
    setState({ review: null, loading: false, error: null });

  return { ...state, getReview, clearReview };
}
