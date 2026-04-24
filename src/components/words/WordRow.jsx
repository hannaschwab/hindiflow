import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import SpeakButton from "@/components/common/SpeakButton";

function getMasteryLabel(mastery) {
  if (mastery >= 80) return { label: "Mastered", className: "bg-accent/15 text-accent border-accent/20" };
  if (mastery >= 50) return { label: "Familiar", className: "bg-chart-3/15 text-chart-3 border-chart-3/20" };
  if (mastery >= 20) return { label: "Learning", className: "bg-chart-4/15 text-chart-4 border-chart-4/20" };
  return { label: "New", className: "bg-destructive/10 text-destructive border-destructive/20" };
}

export default function WordRow({ word, onDelete }) {
  const { label, className } = getMasteryLabel(word.mastery || 0);

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-secondary/40 transition-colors group">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">{word.transliteration || word.hindi}</span>
            <SpeakButton text={word.hindi} lang="hi-IN" className="h-7 w-7" />
          </div>
          <p className="text-sm text-muted-foreground truncate">{word.english}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {word.category && word.category !== "other" && (
          <Badge variant="outline" className="text-xs hidden sm:inline-flex capitalize">
            {word.category}
          </Badge>
        )}
        <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(word.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}