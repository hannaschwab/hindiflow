import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import CategoryPicker from "@/components/words/CategoryPicker";

export default function CategoryBadge({ word, onEdit }) {
  const trigger = (
    <Badge
      variant="outline"
      className="text-xs hidden sm:inline-flex capitalize cursor-pointer hover:bg-secondary transition-colors"
    >
      {word.category || "other"}
    </Badge>
  );

  return (
    <div className="hidden sm:block">
      <CategoryPicker
        value={word.category || "other"}
        onChange={(category) => onEdit(word.id, { ...word, category })}
        trigger={trigger}
      />
    </div>
  );
}