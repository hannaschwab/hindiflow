import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import defaultVocabulary from "@/lib/defaultVocabulary.json";

/**
 * Admin-only: seeds the shared vocabulary list once if it's empty.
 */
export function useVocabSeeding(user) {
  const seeding = useRef(false);

  useEffect(() => {
    if (!user || user.role !== "admin" || seeding.current) return;

    seeding.current = true;

    const seed = async () => {
      const existing = await base44.entities.Vocabulary.list("-created_date", 1);
      if (existing.length > 0) return; // Already seeded

      await base44.entities.Vocabulary.bulkCreate(defaultVocabulary);
    };

    seed().catch(console.error);
  }, [user?.id]);
}