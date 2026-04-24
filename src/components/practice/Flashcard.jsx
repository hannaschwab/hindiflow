import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

export default function Flashcard({ word, showAnswer, onFlip }) {
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
          className="bg-card rounded-3xl border border-border shadow-lg p-10 min-h-[280px] flex flex-col items-center justify-center text-center relative"
        >
          {!showAnswer ? (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Hindi</p>
              <p className="font-devanagari text-5xl font-bold text-foreground mb-3">{word.hindi}</p>
              {word.transliteration && (
                <p className="text-base text-muted-foreground italic">{word.transliteration}</p>
              )}
              <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Tap to reveal
              </p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">English</p>
              <p className="text-3xl font-bold text-foreground mb-3">{word.english}</p>
              {word.example_hindi && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-xl">
                  <p className="font-devanagari text-sm text-foreground">{word.example_hindi}</p>
                  {word.example_english && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{word.example_english}</p>
                  )}
                </div>
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