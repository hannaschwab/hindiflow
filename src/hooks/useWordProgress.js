import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Fetches the current user's progress records and merges them with vocabulary words.
 * Returns an array of words enriched with the user's personal progress fields.
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

  // Merge words with their progress
  const mergedWords = words.map(word => {
    const p = progressMap[word.id] || {};
    return {
      ...word,
      // progress fields with defaults
      mastery: p.mastery ?? 0,
      times_practiced: p.times_practiced ?? 0,
      times_correct: p.times_correct ?? 0,
      last_practiced: p.last_practiced ?? null,
      last_practiced_date: p.last_practiced_date ?? null,
      next_review: p.next_review ?? null,
      srs_interval: p.srs_interval ?? 1,
      srs_ease: p.srs_ease ?? 2.5,
      // keep a reference to the progress record id (for updates)
      _progress_id: p.id ?? null,
    };
  });

  return { mergedWords, progressMap, isLoading };
}