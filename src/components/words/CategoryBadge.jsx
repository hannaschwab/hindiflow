import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const CATEGORIES = ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"];

export default function CategoryBadge({ word, onEdit }) {
  const [open, setOpen] = useState(false);
  const isMobile = window.innerWidth < 768;

  const handleSelect = (category) => {
    onEdit(word.id, { ...word, category });
    setOpen(false);
  };

  const badge = (
    <Badge
      variant="outline"
      className="text-xs hidden sm:inline-flex capitalize cursor-pointer hover:bg-secondary transition-colors"
      onClick={() => setOpen(true)}
    >
      {word.category && word.category !== "other" ? word.category : "other"}
    </Badge>
  );

  const items = (
    <div className="p-2 space-y-1">
      {CATEGORIES.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => handleSelect(c)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${word.category === c ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
        >
          {c.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {badge}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader><DrawerTitle>Change Category</DrawerTitle></DrawerHeader>
            <div className="pb-6">{items}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <div className="relative hidden sm:block">
      {badge}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-44 bg-popover border border-border rounded-lg shadow-lg">
            {items}
          </div>
        </>
      )}
    </div>
  );
}