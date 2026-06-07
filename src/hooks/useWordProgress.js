import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Fetches the current user's progress records and merges them with vocabulary words.
 * Falls back to progress fields stored directly on the word (legacy format).
 */
export function useWordProgress(words = []) {
  const { data: progressList = [], isLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: () => base44.entities.UserProgress.list("-updated_date", 1000),
    enabled: words.length > 0,
  });

  // Build a map of word_id -> progress record
  const progressMap = {};
  for (const p of progressList) {
    progressMap[p.word_id] = p;
  }

  // Merge words with their progress, falling back to legacy fields on the word itself
  const mergedWords = words.map(word => {
    const p = progressMap[word.id];
    return {
      ...word,
      mastery: p?.mastery ?? word.mastery ?? 0,
      times_practiced: p?.times_practiced ?? word.times_practiced ?? 0,
      times_correct: p?.times_correct ?? word.times_correct ?? 0,
      last_practiced: p?.last_practiced ?? word.last_practiced ?? null,
      last_practiced_date: p?.last_practiced_date ?? word.last_practiced_date ?? null,
      next_review: p?.next_review ?? word.next_review ?? null,
      srs_interval: p?.srs_interval ?? word.srs_interval ?? 1,
      srs_ease: p?.srs_ease ?? word.srs_ease ?? 2.5,
      _progress_id: p?.id ?? null,
    };
  });

  return { mergedWords, progressMap, isLoading };
}