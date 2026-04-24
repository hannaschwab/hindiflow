import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import WordRow from "@/components/words/WordRow";
import AddWordDialog from "@/components/words/AddWordDialog";

const CATEGORIES = ["all", "greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"];

export default function WordList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => base44.entities.Vocabulary.list("-created_date", 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Vocabulary.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vocabulary.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const filtered = words.filter(w => {
    const matchSearch = !search || 
      w.hindi?.toLowerCase().includes(search.toLowerCase()) ||
      w.english?.toLowerCase().includes(search.toLowerCase()) ||
      w.transliteration?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || w.category === category;
    return matchSearch && matchCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Word List</h1>
          <p className="text-sm text-muted-foreground mt-1">{words.length} words in your collection</p>
        </div>
        <AddWordDialog onAdd={createMutation.mutate} />
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
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c === "all" ? "All Categories" : c.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {words.length === 0 ? "No words yet. Add some or import from your Google Doc!" : "No words match your search."}
          </div>
        ) : (
          filtered.map(word => (
            <WordRow key={word.id} word={word} onDelete={deleteMutation.mutate} />
          ))
        )}
      </div>
    </div>
  );
}