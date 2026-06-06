import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Star } from "lucide-react";
import PronunciationPlayer from "@/components/words/PronunciationPlayer";

// direction: "hindi_to_english" (default) | "english_to_hindi"
export default function Flashcard({ word, showAnswer, onFlip, direction = "hindi_to_english", isBookmarked = false, onToggleBookmark }) {
  const hindiFirst = direction === "hindi_to_english";

  return (
    <div 
      className="w-full max-w-md mx-auto cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={showAnswer ? "back" : "front"}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-3xl border border-border shadow-lg p-10 min-h-[280px] flex flex-col items-center justify-center text-center relative select-none"
        >
          {onToggleBookmark && (
            <button
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors hover:bg-secondary ${isBookmarked ? "text-chart-3" : "text-muted-foreground"}`}
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(word.id); }}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? "fill-chart-3" : ""}`} />
            </button>
          )}
          {!showAnswer ? (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                {hindiFirst ? "Hindi" : "English"}
              </p>
              {hindiFirst ? (
                <>
                  <p className="text-4xl font-bold text-foreground mb-2">{word.transliteration || word.hindi}</p>
                  {word.pronunciation_audio_url && (
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <PronunciationPlayer url={word.pronunciation_audio_url} />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-3xl font-bold text-foreground mb-2">{word.english}</p>
              )}
              <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Tap to reveal
              </p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                {hindiFirst ? "English" : "Hindi"}
              </p>
              {hindiFirst ? (
                <>
                  <p className="text-3xl font-bold text-foreground mb-3">{word.english}</p>
                  {word.example_english && (
                    <div className="mt-4 p-3 bg-secondary/50 rounded-xl">
                      <p className="text-sm text-foreground italic">{word.example_english}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-foreground mb-2">{word.transliteration || word.hindi}</p>
                  {word.pronunciation_audio_url && (
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <PronunciationPlayer url={word.pronunciation_audio_url} />
                    </div>
                  )}
                  {word.example_hindi && (
                    <div className="mt-4 p-3 bg-secondary/50 rounded-xl">
                      <p className="text-sm text-foreground italic font-inter">{word.example_hindi}</p>
                    </div>
                  )}
                </>
              )}
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Tap to flip back
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}