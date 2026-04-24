import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

const CATEGORIES = ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"];

function CategoryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const isMobile = window.innerWidth < 768;

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm capitalize"
    >
      {value}
      <ChevronDown className="w-4 h-4 opacity-50" />
    </button>
  );

  const items = (
    <div className="p-2 space-y-1">
      {CATEGORIES.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => { onChange(c); setOpen(false); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${value === c ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
        >
          {c.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Select Category</DrawerTitle></DrawerHeader>
          <div className="pb-6">{items}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="relative">
      {trigger}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg">{items}</div>
        </>
      )}
    </div>
  );
}

export default function EditWordDialog({ word, open, onOpenChange, onSave }) {
  const [form, setForm] = useState({
    hindi: word.hindi || "",
    transliteration: word.transliteration || "",
    english: word.english || "",
    example_hindi: word.example_hindi || "",
    example_english: word.example_english || "",
    category: word.category || "other",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hindi || !form.english) return;
    onSave(word.id, form);
    onOpenChange(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Hindi *</Label>
          <Input value={form.hindi} onChange={e => setForm({ ...form, hindi: e.target.value })} />
        </div>
        <div>
          <Label>English *</Label>
          <Input value={form.english} onChange={e => setForm({ ...form, english: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Transliteration</Label>
        <Input value={form.transliteration} onChange={e => setForm({ ...form, transliteration: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Example (Hindi)</Label>
          <Input value={form.example_hindi} onChange={e => setForm({ ...form, example_hindi: e.target.value })} />
        </div>
        <div>
          <Label>Example (English)</Label>
          <Input value={form.example_english} onChange={e => setForm({ ...form, example_english: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <CategoryPicker value={form.category} onChange={v => setForm({ ...form, category: v })} />
      </div>
      <Button type="submit" className="w-full" disabled={!form.hindi || !form.english}>
        Save Changes
      </Button>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}