import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

const CATEGORIES = ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"];

export default function AddWordDialog({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    hindi: "", transliteration: "", english: "",
    example_hindi: "", example_english: "", category: "other"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hindi || !form.english) return;
    onAdd(form);
    setForm({ hindi: "", transliteration: "", english: "", example_hindi: "", example_english: "", category: "other" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Word
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hindi">Hindi *</Label>
              <Input id="hindi" placeholder="namaste"
                value={form.hindi} onChange={e => setForm({...form, hindi: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="english">English *</Label>
              <Input id="english" placeholder="Hello"
                value={form.english} onChange={e => setForm({...form, english: e.target.value})} />
            </div>
          </div>
          <div>
            <Label htmlFor="translit">Transliteration</Label>
            <Input id="translit" placeholder="namaste"
              value={form.transliteration} onChange={e => setForm({...form, transliteration: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exHindi">Example (Hindi)</Label>
              <Input id="exHindi" placeholder="Namaste, aap kaise hain?"
                value={form.example_hindi} onChange={e => setForm({...form, example_hindi: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="exEng">Example (English)</Label>
              <Input id="exEng" placeholder="Hello, how are you?"
                value={form.example_english} onChange={e => setForm({...form, example_english: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={!form.hindi || !form.english}>
            Add Word
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}