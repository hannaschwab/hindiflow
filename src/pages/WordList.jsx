import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import WordRow from "@/components/words/WordRow";
import AddWordDialog from "@/components/words/AddWordDialog";
import PullToRefreshWrapper from "@/components/common/PullToRefreshWrapper";
import CategoryPicker from "@/components/words/CategoryPicker";
import { useCategories } from "@/hooks/useCategories";

const MIN_CATEGORY_SIZE = 5;

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

  const [isAdmin, setIsAdmin] = useState(false);

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const user = await base44.auth.me();
      setIsAdmin(user?.role === "admin");
      return base44.entities.Vocabulary.list("-created_date", 500);
    },
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

  useEffect(() => {
    if (words.length > 0) handleDeduplicate(true);
  }, [words.length]);

  const [autoCategorizing, setAutoCategorizing] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const [fixingExamples, setFixingExamples] = useState(false);

  const handleDeduplicate = async (silent = false) => {
    setDeduplicating(true);
    const seen = new Map();
    const toDelete = [];

    for (const word of [...words].reverse()) {
      const key = word.transliteration?.toLowerCase().trim();
      if (seen.has(key)) {
        const existing = seen.get(key);
        // Merge examples into the keeper if it's missing them
        const updates = {};
        if (!existing.example_hindi && word.example_hindi) updates.example_hindi = word.example_hindi;
        if (!existing.example_english && word.example_english) updates.example_english = word.example_english;
        if (Object.keys(updates).length > 0) {
          await base44.entities.Vocabulary.update(existing.id, updates);
        }
        toDelete.push(word.id);
      } else {
        seen.set(key, word);
      }
    }

    for (const id of toDelete) {
      await base44.entities.Vocabulary.delete(id);
    }

    await queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    setDeduplicating(false);
    if (!silent) toast.success(toDelete.length > 0 ? `Removed ${toDelete.length} duplicate(s)!` : "No duplicates found.");
    else if (toDelete.length > 0) toast.success(`Removed ${toDelete.length} duplicate(s)!`);
  };
  const { addCategory } = useCategories();

  const handleFixExamples = async () => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const toFix = words.filter(w => w.example_hindi && devanagariRegex.test(w.example_hindi));
    if (toFix.length === 0) { toast.info("All examples are already in transliteration!"); return; }
    setFixingExamples(true);
    let updated = 0;
    for (const word of toFix) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Transliterate this Hindi sentence into romanized Latin script only (e.g. "Mujhe kaam karna hai"). Output only the transliteration, nothing else.\n\nHindi: "${word.example_hindi}"`,
        response_json_schema: { type: "object", properties: { transliteration: { type: "string" } } }
      });
      if (result?.transliteration) {
        await base44.entities.Vocabulary.update(word.id, { example_hindi: result.transliteration });
        updated++;
      }
    }
    await queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    setFixingExamples(false);
    toast.success(`Converted ${updated} examples to transliteration!`);
  };

  const handleAutoCategorize = async () => {
    const uncategorized = words.filter(w => !w.category || w.category === "other");
    if (uncategorized.length === 0) { toast.info("All words already have a category!"); return; }
    setAutoCategorizing(true);

    // Step 1: Ask LLM for a suggested category for each word
    const proposals = [];
    for (const word of uncategorized) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Categorize the Hindi word "${word.hindi}" (meaning: "${word.english}") into a short, descriptive category name (e.g. greetings, food, travel, numbers, family, colors, verbs, adjectives, phrases, body parts, emotions, clothing, animals, time, etc). Reply with only the lowercase category name, nothing else.`,
        response_json_schema: { type: "object", properties: { category: { type: "string" } } }
      });
      const suggested = result?.category?.toLowerCase().trim().replace(/\s+/g, "_") || "other";
      proposals.push({ word, suggested });
    }

    // Step 2: Count occurrences of each proposed category
    const counts = {};
    for (const { suggested } of proposals) {
      counts[suggested] = (counts[suggested] || 0) + 1;
    }

    // Step 3: Save only categories that have >= MIN_CATEGORY_SIZE words; register new ones
    let updated = 0;
    for (const { word, suggested } of proposals) {
      const finalCat = (counts[suggested] >= MIN_CATEGORY_SIZE) ? suggested : "other";
      if (finalCat !== "other") {
        addCategory(finalCat);
        await base44.entities.Vocabulary.update(word.id, { category: finalCat });
        updated++;
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    setAutoCategorizing(false);
    toast.success(`Categorized ${updated} of ${uncategorized.length} words! (min ${MIN_CATEGORY_SIZE} per category)`);
  };

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
          <p className="text-sm text-muted-foreground mt-1">{words.length} words</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="gap-2" onClick={handleAutoCategorize} disabled={autoCategorizing}>
              {autoCategorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {autoCategorizing ? "Categorizing..." : "Auto-categorize"}
            </Button>
            <AddWordDialog onAdd={handleAddWord} />
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
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {words.length === 0 ? "No words yet. Add some or import from your Google Doc!" : "No words match your search."}
          </div>
        ) : (
          filtered.map(word => (
            <WordRow key={word.id} word={word} onDelete={deleteMutation.mutate} onEdit={(id, data) => updateMutation.mutate({ id, data })} isAdmin={isAdmin} />
          ))
        )}
      </div>
    </div>
    </PullToRefreshWrapper>
  );
}