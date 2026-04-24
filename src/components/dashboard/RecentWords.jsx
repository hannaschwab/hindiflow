import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SpeakButton from "@/components/common/SpeakButton";

export default function RecentWords({ words }) {
  const recent = [...words]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recently Added</h3>
        <Link to="/words" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No words yet. Import or add some!</p>
      ) : (
        <div className="space-y-3">
          {recent.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">{word.transliteration || word.hindi}</span>
                <SpeakButton text={word.hindi} lang="hi-IN" className="h-7 w-7" />
              </div>
              <span className="text-sm text-muted-foreground">{word.english}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}