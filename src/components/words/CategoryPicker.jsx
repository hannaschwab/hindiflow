import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

function CategoryList({ value, onSelect, allCategories, addCategory }) {
  const [newCat, setNewCat] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (!newCat.trim()) return;
    const added = addCategory(newCat);
    onSelect(added);
    setNewCat("");
    setAdding(false);
  };

  return (
    <div className="p-2 space-y-1">
      {allCategories.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${value === c ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
        >
          {c === "all" ? "All Categories" : c.replace(/_/g, " ")}
        </button>
      ))}

      {adding ? (
        <div className="flex gap-2 pt-1 px-1">
          <Input
            autoFocus
            placeholder="New category name..."
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } if (e.key === "Escape") setAdding(false); }}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={handleAdd} disabled={!newCat.trim()}>Add</Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> New category
        </button>
      )}
    </div>
  );
}

export default function CategoryPicker({ value, onChange, trigger, includeAll = false }) {
  const [open, setOpen] = useState(false);
  const { allCategories, addCategory } = useCategories();
  const isMobile = window.innerWidth < 768;
  const categories = includeAll ? ["all", ...allCategories] : allCategories;

  const handleSelect = (c) => { onChange(c); setOpen(false); };

  if (isMobile) {
    return (
      <>
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader><DrawerTitle>Select Category</DrawerTitle></DrawerHeader>
            <div className="pb-6">
              <CategoryList value={value} onSelect={handleSelect} allCategories={categories} addCategory={addCategory} />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <div className="relative">
      <div onClick={() => setOpen(true)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto">
            <CategoryList value={value} onSelect={handleSelect} allCategories={categories} addCategory={addCategory} />
          </div>
        </>
      )}
    </div>
  );
}