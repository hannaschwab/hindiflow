import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shuffle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Flashcard from "@/components/practice/Flashcard";

export default function Practice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [deck, setDeck] = useState(null);
  const queryClient = useQueryClient();

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => base44.entities.Vocabulary.list("-created_date", 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vocabulary.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const startPractice = useCallback((mode) => {
    let selectedWords = [...words];
    if (mode === "weak") {
      selectedWords = selectedWords.filter(w => (w.mastery || 0) < 50);
      if (selectedWords.length === 0) selectedWords = [...words];
    }
    // Shuffle
    for (let i = selectedWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedWords[i], selectedWords[j]] = [selectedWords[j], selectedWords[i]];
    }
    setDeck(selectedWords.slice(0, 20));
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0 });
  }, [words]);

  const handleAnswer = (correct) => {
    const word = deck[currentIndex];
    const newPracticed = (word.times_practiced || 0) + 1;
    const newCorrect = (word.times_correct || 0) + (correct ? 1 : 0);
    const newMastery = Math.round((newCorrect / newPracticed) * 100);

    updateMutation.mutate({
      id: word.id,
      data: {
        times_practiced: newPracticed,
        times_correct: newCorrect,
        mastery: newMastery,
        last_practiced: new Date().toISOString(),
      }
    });

    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    setShowAnswer(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setDeck(null); // Session complete
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // No words state
  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="text-center">
          <p className="font-devanagari text-4xl mb-4">📚</p>
          <h2 className="text-xl font-bold text-foreground mb-2">No words to practice</h2>
          <p className="text-sm text-muted-foreground">Add some vocabulary first, then come back to practice!</p>
        </div>
      </div>
    );
  }

  // Session complete
  if (deck === null && sessionStats.correct + sessionStats.incorrect > 0) {
    const total = sessionStats.correct + sessionStats.incorrect;
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-3xl border border-border shadow-lg p-10 text-center max-w-sm"
        >
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-foreground mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You got <span className="text-accent font-semibold">{sessionStats.correct}</span> out of{" "}
            <span className="font-semibold">{total}</span> correct
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setSessionStats({ correct: 0, incorrect: 0 }); setDeck(null); }}>
              Back
            </Button>
            <Button onClick={() => startPractice("all")} className="gap-2">
              <Shuffle className="w-4 h-4" /> Practice Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // No active session - show mode selection
  if (!deck) {
    const weakCount = words.filter(w => (w.mastery || 0) < 50).length;
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Practice</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose your practice mode</p>
        </div>

        <div className="grid gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => startPractice("all")}
            className="bg-card rounded-2xl border border-border shadow-sm p-6 text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg">All Words</h3>
                <p className="text-sm text-muted-foreground mt-1">Practice from your full collection ({words.length} words)</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => startPractice("weak")}
            className="bg-card rounded-2xl border border-border shadow-sm p-6 text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Focus on Weak Words</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Practice words you haven't mastered yet ({weakCount} words)
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // Active practice session
  const word = deck[currentIndex];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {currentIndex + 1} / {deck.length}
          </Badge>
          <div className="flex gap-2">
            <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">✓ {sessionStats.correct}</Badge>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">✗ {sessionStats.incorrect}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setDeck(null)}>
          End Session
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex) / deck.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <Flashcard word={word} showAnswer={showAnswer} onFlip={() => setShowAnswer(!showAnswer)} />

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => handleAnswer(false)}
            >
              <X className="w-4 h-4" /> Didn't Know
            </Button>
            <Button
              size="lg"
              className="gap-2 bg-accent hover:bg-accent/90"
              onClick={() => handleAnswer(true)}
            >
              <Check className="w-4 h-4" /> Got It!
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}