import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import CategoryPicker from "@/components/words/CategoryPicker";

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
    if (!form.transliteration || !form.english) return;
    onSave(word.id, form);
    onOpenChange(false);
  };

  const categoryTrigger = (
    <button
      type="button"
      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm capitalize"
    >
      {form.category}
      <ChevronDown className="w-4 h-4 opacity-50" />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hinglish *</Label>
              <Input value={form.transliteration} onChange={e => setForm({ ...form, transliteration: e.target.value })} placeholder="e.g. kaam karna" />
            </div>
            <div>
              <Label>English *</Label>
              <Input value={form.english} onChange={e => setForm({ ...form, english: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Example (Hinglish)</Label>
              <Input value={form.example_hindi} onChange={e => setForm({ ...form, example_hindi: e.target.value })} placeholder="e.g. Main safar kar raha hoon" />
            </div>
            <div>
              <Label>Example (English)</Label>
              <Input value={form.example_english} onChange={e => setForm({ ...form, example_english: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <CategoryPicker
              value={form.category}
              onChange={v => setForm({ ...form, category: v })}
              trigger={categoryTrigger}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!form.transliteration || !form.english}>
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}