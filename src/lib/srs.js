/**
 * SM-2 inspired Spaced Repetition System
 * Returns updated SRS fields based on whether the answer was correct.
 */
export function computeSRS(word, correct) {
  const now = new Date();
  const ease = word.srs_ease ?? 2.5;
  const interval = word.srs_interval ?? 1;

  let newEase, newInterval;

  if (correct) {
    // Increase interval
    if (interval === 1) newInterval = 3;
    else if (interval === 3) newInterval = 7;
    else newInterval = Math.round(interval * ease);
    newEase = Math.max(1.3, ease + 0.1);
  } else {
    // Reset interval on wrong answer
    newInterval = 1;
    newEase = Math.max(1.3, ease - 0.2);
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    srs_interval: newInterval,
    srs_ease: parseFloat(newEase.toFixed(2)),
    next_review: nextReview.toISOString(),
  };
}

/**
 * Returns words that are due for review today (next_review <= now, or never reviewed).
 */
export function getDueWords(words) {
  const now = new Date();
  return words.filter(w => !w.next_review || new Date(w.next_review) <= now);
}

/**
 * Today's date as YYYY-MM-DD string
 */
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Count how many distinct words were practiced today
 */
export function countPracticedToday(words) {
  const today = todayStr();
  return words.filter(w => w.last_practiced_date === today).length;
}