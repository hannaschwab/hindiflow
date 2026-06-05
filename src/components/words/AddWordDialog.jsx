import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ChevronDown } from "lucide-react";
import CategoryPicker from "@/components/words/CategoryPicker";
import PronunciationRecorder from "@/components/words/PronunciationRecorder";

export default function AddWordDialog({ onAdd, open, onOpenChange }) {
  const [open_internal, setOpenInternal] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : open_internal;
  const setOpen = isControlled ? onOpenChange : setOpenInternal;

  const [form, setForm] = useState({
    hindi: "", transliteration: "", english: "",
    example_hindi: "", example_english: "", category: "other",
    pronunciation_audio_url: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.transliteration || !form.english) return;
    onAdd(form);
    setForm({ hindi: "", transliteration: "", english: "", example_hindi: "", example_english: "", category: "other", pronunciation_audio_url: "" });
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Word
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="translit">Hinglish *</Label>
              <Input id="translit" placeholder="namaste"
                value={form.transliteration} onChange={e => setForm({...form, transliteration: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="english">English *</Label>
              <Input id="english" placeholder="Hello"
                value={form.english}
                onChange={e => setForm({...form, english: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exHindi">Example (Hinglish)</Label>
              <Input id="exHindi" placeholder="Namaste, aap kaise hain?"
                value={form.example_hindi} onChange={e => setForm({...form, example_hindi: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="exEng">Example (English)</Label>
              <Input id="exEng" placeholder="Hello, how are you?"
                value={form.example_english} onChange={e => setForm({...form, example_english: e.target.value})} />
            </div>
          </div>
          <div className="relative">
            <Label className="mb-1 block">Category</Label>
            <CategoryPicker
              value={form.category}
              onChange={v => setForm({...form, category: v})}
              trigger={
                <button
                  type="button"
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm capitalize"
                >
                  {form.category}
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </button>
              }
            />
          </div>
          <div>
            <Label className="mb-1 block">Pronunciation</Label>
            <PronunciationRecorder
              existingUrl={form.pronunciation_audio_url}
              onRecorded={({ url }) => setForm(f => ({ ...f, pronunciation_audio_url: url }))}
              onDelete={() => setForm(f => ({ ...f, pronunciation_audio_url: "" }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!form.transliteration || !form.english}>
            Add Word
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}