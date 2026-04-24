import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import WordRow from "@/components/words/WordRow";
import AddWordDialog from "@/components/words/AddWordDialog";
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
    <PullToRefreshWrapper onRefresh={handleRefresh}>
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-20 md:pb-10">
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
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {words.length === 0 ? "No words yet. Add some or import from your Google Doc!" : "No words match your search."}
          </div>
        ) : (
          filtered.map(word => (
            <WordRow key={word.id} word={word} onDelete={deleteMutation.mutate} onEdit={(id, data) => updateMutation.mutate({ id, data })} />
          ))
        )}
      </div>
    </div>
    </PullToRefreshWrapper>
  );
}