import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Plus, FileText, ImageIcon, Star } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import WordRow from "@/components/words/WordRow";
import AddWordDialog from "@/components/words/AddWordDialog";
import ImportWordsDialog from "@/components/words/ImportWordsDialog";
import PullToRefreshWrapper from "@/components/common/PullToRefreshWrapper";
import CategoryPicker from "@/components/words/CategoryPicker";
import { useCategories } from "@/hooks/useCategories";

function CategorySelect({ value, onChange }) {
  const { allCategories } = useCategories();
  const label = value === "all" ? "All Categories" : value.replace(/_/g, " ");
  const trigger = (
    <button
      type="button"
      className="flex h-9 w-40 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm capitalize shrink-0"
    >
      {label}
      <ChevronDown className="w-4 h-4 opacity-50" />
    </button>
  );
  return (
    <CategoryPicker
      value={value}
      onChange={onChange}
      trigger={trigger}
      includeAll
    />
  );
}

export default function WordList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const queryClient = useQueryClient();
  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] });

  const [showBookmarked, setShowBookmarked] = useState(false);
  const { bookmarkedWordIds, toggleBookmark } = useBookmarks();

  const [addWordOpen, setAddWordOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importMode, setImportMode] = useState("file");
  const photoInputRef = useState(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });
  const isAdmin = !!currentUser;

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => base44.entities.Vocabulary.list("-created_date", 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Vocabulary.create(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] });
      const previous = queryClient.getQueryData(["vocabulary"]);
      queryClient.setQueryData(["vocabulary"], (old = []) => [{ ...data, id: `temp-${Date.now()}` }, ...old]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["vocabulary"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vocabulary.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] });
      const previous = queryClient.getQueryData(["vocabulary"]);
      queryClient.setQueryData(["vocabulary"], (old = []) => old.filter(w => w.id !== id));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["vocabulary"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vocabulary.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] });
      const previous = queryClient.getQueryData(["vocabulary"]);
      queryClient.setQueryData(["vocabulary"], (old = []) => old.map(w => w.id === id ? { ...w, ...data } : w));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["vocabulary"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const handleAddWord = (newWord) => {
    const existing = words.find(w =>
      w.transliteration?.toLowerCase().trim() === newWord.transliteration?.toLowerCase().trim()
    );

    if (existing) {
      const updates = {};
      if (!existing.example_hindi && newWord.example_hindi) updates.example_hindi = newWord.example_hindi;
      if (!existing.example_english && newWord.example_english) updates.example_english = newWord.example_english;

      if (Object.keys(updates).length > 0) {
        updateMutation.mutate({ id: existing.id, data: updates });
        toast.success("Examples added to existing word!");
      } else {
        toast.info("This word already exists in your collection.");
      }
      return;
    }

    createMutation.mutate(newWord);
  };


  const filtered = words.filter(w => {
    const matchSearch = !search || 
      w.hindi?.toLowerCase().includes(search.toLowerCase()) ||
      w.english?.toLowerCase().includes(search.toLowerCase()) ||
      w.transliteration?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || w.category === category;
    const matchBookmark = !showBookmarked || bookmarkedWordIds.has(w.id);
    return matchSearch && matchCategory && matchBookmark;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-20 md:pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Word List</h1>
          <p className="text-sm text-muted-foreground mt-1">{words.length} words</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add Words <ChevronDown className="w-3 h-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setAddWordOpen(true)}>
                  <Plus className="w-4 h-4" /> Add single word
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { setImportMode("file"); setImportOpen(true); }}>
                  <FileText className="w-4 h-4" /> Import from file
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { setImportMode("photo"); setPhotoInputKey(k => k + 1); setTimeout(() => document.getElementById("photo-upload-trigger")?.click(), 50); }}>
                  <ImageIcon className="w-4 h-4" /> Upload photo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              id="photo-upload-trigger"
              key={photoInputKey}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImportOpen(true);
                // Small delay to let the dialog mount, then trigger image upload
                setTimeout(() => {
                  const evt = new CustomEvent("hindiflow:photo-upload", { detail: { file } });
                  window.dispatchEvent(evt);
                }, 200);
              }}
            />
            <AddWordDialog onAdd={handleAddWord} open={addWordOpen} onOpenChange={setAddWordOpen} />
            <ImportWordsDialog open={importOpen} onOpenChange={setImportOpen} mode={importMode} />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <CategorySelect value={category} onChange={setCategory} />
        <Button
          variant={showBookmarked ? "default" : "outline"}
          className="gap-2 shrink-0"
          onClick={() => setShowBookmarked(v => !v)}
        >
          <Star className={`w-4 h-4 ${showBookmarked ? "fill-primary-foreground" : ""}`} />
          Saved
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {words.length === 0 ? "No words yet. Add some or import from your Google Doc!" : "No words match your search."}
          </div>
        ) : (
          filtered.map(word => (
            <WordRow key={word.id} word={word} onDelete={deleteMutation.mutate} onEdit={(id, data) => updateMutation.mutate({ id, data })} isAdmin={isAdmin} isBookmarked={bookmarkedWordIds.has(word.id)} onToggleBookmark={toggleBookmark} />
          ))
        )}
      </div>
    </div>
    </PullToRefreshWrapper>
  );
}