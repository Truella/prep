import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

async function fetchRating(quizId: string, userId: string): Promise<number | null> {
  const { data } = await supabase
    .from("quiz_ratings")
    .select("rating")
    .eq("quiz_id", quizId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? data.rating : null;
}

async function upsertRating(
  quizId: string,
  userId: string,
  rating: number
): Promise<void> {
  const { error } = await supabase
    .from("quiz_ratings")
    .upsert(
      { quiz_id: quizId, user_id: userId, rating },
      { onConflict: "quiz_id,user_id" }
    );
  if (error) throw error;

  // Recalculate average_rating
  const { data: ratings } = await supabase
    .from("quiz_ratings")
    .select("rating")
    .eq("quiz_id", quizId);

  if (ratings && ratings.length > 0) {
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await supabase
      .from("quizzes")
      .update({ average_rating: avg })
      .eq("id", quizId);
  }
}

export function useRating(quizId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentRating = null, isLoading: loading } = useQuery({
    queryKey: ["rating", quizId, user?.id],
    queryFn: () => fetchRating(quizId, user!.id),
    enabled: !!user && !!quizId,
  });

  const mutation = useMutation({
    mutationFn: (rating: number) => upsertRating(quizId, user!.id, rating),
    onSuccess: (_, rating) => {
      queryClient.setQueryData(["rating", quizId, user?.id], rating);
      queryClient.invalidateQueries({ queryKey: ["quizBank"] });
      toast.success("Rating submitted!");
    },
    onError: () => toast.error("Failed to submit rating"),
  });

  return {
    currentRating,
    loading,
    error: mutation.error ? (mutation.error as Error).message : null,
    submitRating: async (rating: number) => {
      if (!user) return undefined;
      try {
        await mutation.mutateAsync(rating);
        return true;
      } catch {
        return false;
      }
    },
  };
}
