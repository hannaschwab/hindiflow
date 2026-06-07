import { useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { RotateCcw, Star, Check, X } from "lucide-react";
import PronunciationPlayer from "@/components/words/PronunciationPlayer";

const SWIPE_THRESHOLD = 70;
const VELOCITY_THRESHOLD = 200;

// direction: "hindi_to_english" (default) | "english_to_hindi"
export default function Flashcard({ word, showAnswer, onFlip, onAnswer, direction = "hindi_to_english", isBookmarked = false, onToggleBookmark }) {
  const hindiFirst = direction === "hindi_to_english";
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const greenOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const redOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (_e, info) => {
    if (!showAnswer) return;
    const { x: dx } = info.offset;
    const { x: vx } = info.velocity;
    if (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
      onAnswer?.(true);
    } else if (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
      onAnswer?.(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto select-none touch-pan-y">
      <motion.div
        drag={showAnswer ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        onClick={onFlip}
        className={`relative perspective-1000 ${showAnswer ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={showAnswer ? "back" : "front"}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-3xl border border-border shadow-lg p-10 min-h-[280px] flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            {/* Green overlay (swipe right = correct) */}
            <motion.div
              style={{ opacity: greenOpacity }}
              className="absolute inset-0 bg-emerald-500/10 rounded-3xl flex items-center justify-start pl-8 pointer-events-none"
            >
              <div className="bg-emerald-500 rounded-full p-3">
                <Check className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Red overlay (swipe left = incorrect) */}
            <motion.div
              style={{ opacity: redOpacity }}
              className="absolute inset-0 bg-destructive/10 rounded-3xl flex items-center justify-end pr-8 pointer-events-none"
            >
              <div className="bg-destructive rounded-full p-3">
                <X className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Bookmark button */}
            {onToggleBookmark && (
              <button
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors hover:bg-secondary z-10 ${isBookmarked ? "text-chart-3" : "text-muted-foreground"}`}
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
                      <div className="flex items-center justify-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
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
                      <div className="flex items-center justify-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
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
      </motion.div>

      {/* Swipe hint - mobile only */}
      <p className="text-xs text-muted-foreground text-center mt-4 md:hidden">
        ← Didn't know &nbsp;·&nbsp; Knew it →
      </p>
    </div>
  );
}