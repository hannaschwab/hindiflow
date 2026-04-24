import { useState } from "react";

const BASE_CATEGORIES = ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"];
const STORAGE_KEY = "hindiflow_custom_categories";

function getCustomCategories() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useCategories() {
  const [custom, setCustom] = useState(getCustomCategories);

  const allCategories = [...BASE_CATEGORIES, ...custom.filter(c => !BASE_CATEGORIES.includes(c))];

  const addCategory = (name) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || allCategories.includes(trimmed)) return trimmed;
    const updated = [...custom, trimmed];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setCustom(updated);
    return trimmed;
  };

  return { allCategories, addCategory };
}