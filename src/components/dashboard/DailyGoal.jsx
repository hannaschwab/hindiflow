import { Link } from "react-router-dom";
import { Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { countPracticedToday } from "@/lib/srs";
import { getDueWords } from "@/lib/srs";

const DAILY_GOAL = 5;

export default function DailyGoal({ words }) {
  const practicedToday = countPracticedToday(words);
  const dueCount = getDueWords(words).length;
  const progress = Math.min(practicedToday / DAILY_GOAL, 1);
  const done = practicedToday >= DAILY_GOAL;

  return (
    <div className={`rounded-2xl p-6 border shadow-sm ${done ? "bg-accent/10 border-accent/30" : "bg-card border-border"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {done
            ? <Flame className="w-5 h-5 text-accent" />
            : <Target className="w-5 h-5 text-primary" />
          }
          <h3 className="text-sm font-semibold text-foreground">Daily Goal</h3>
        </div>
        {dueCount > 0 && (
          <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
            {dueCount} due for review
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{practicedToday} / {DAILY_GOAL} words practiced today</span>
          {done && <span className="text-accent font-semibold">Goal reached! 🎉</span>}
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${done ? "bg-accent" : "bg-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {!done && (
        <Link to="/practice" className="text-xs text-primary font-medium hover:underline">
          Practice now →
        </Link>
      )}
    </div>
  );
}