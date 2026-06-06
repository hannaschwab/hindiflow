const STREAK_KEY = "hindiflow_streak";
const STREAK_DATE_KEY = "hindiflow_streak_last_date";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getStreak() {
  const streak = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);
  const lastDate = localStorage.getItem(STREAK_DATE_KEY) || "";
  return { streak, lastDate };
}

export function recordPracticeSession() {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const { streak, lastDate } = getStreak();

  if (lastDate === today) {
    // Already recorded today — no change
    return streak;
  } else if (lastDate === yesterday) {
    // Consecutive day — increment
    const newStreak = streak + 1;
    localStorage.setItem(STREAK_KEY, String(newStreak));
    localStorage.setItem(STREAK_DATE_KEY, today);
    return newStreak;
  } else {
    // Missed a day or first time — reset to 1
    localStorage.setItem(STREAK_KEY, "1");
    localStorage.setItem(STREAK_DATE_KEY, today);
    return 1;
  }
}

import { useState, useEffect } from "react";

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const { streak: s } = getStreak();
    setStreak(s);
  }, []);

  const record = () => {
    const newStreak = recordPracticeSession();
    setStreak(newStreak);
    return newStreak;
  };

  return { streak, recordPracticeSession: record };
}