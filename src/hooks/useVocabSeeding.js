import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import defaultVocabulary from "@/lib/defaultVocabulary.json";

export function useVocabSeeding(user) {
  const seeding = useRef(false);

  useEffect(() => {
    if (!user || user.default_vocab_seeded || seeding.current) return;

    seeding.current = true;

    const seed = async () => {
      const words = defaultVocabulary.map(w => ({
        ...w,
        mastery: 0,
        times_practiced: 0,
        times_correct: 0,
        srs_interval: 1,
        srs_ease: 2.5,
        practiced_today: false,
      }));

      await base44.entities.Vocabulary.bulkCreate(words);
      await base44.auth.updateMe({ default_vocab_seeded: true });
    };

    seed().catch(console.error);
  }, [user?.id, user?.default_vocab_seeded]);
}