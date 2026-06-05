import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Sparkles, Loader2, CheckCircle2, FileText, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ImportWordsDialog({ open, onOpenChange, defaultTab }) {
  const [open_internal, setOpenInternal] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : open_internal;
  const setOpen = isControlled ? onOpenChange : setOpenInternal;

  useEffect(() => {
    const handler = (e) => {
      const file = e.detail?.file;
      if (file) {
        const fakeEvent = { target: { files: [file], value: "" } };
        handleImageUpload(fakeEvent);
      }
    };
    window.addEventListener("hindiflow:photo-upload", handler);
    return () => window.removeEventListener("hindiflow:photo-upload", handler);
  }, []);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const bulkCreate = useMutation({
    mutationFn: (words) => base44.entities.Vocabulary.bulkCreate(words),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const deduplicateWords = async (newWords) => {
    const user = await base44.auth.me();
    const existing = await base44.entities.Vocabulary.filter({ created_by: user.email }, "-created_date", 500);
    const existingHindi = new Set(existing.map(w => w.hindi?.trim().toLowerCase()));
    return newWords.filter(w => !existingHindi.has(w.hindi?.trim().toLowerCase()));
  };

  const processWords = async (words) => {
    const unique = await deduplicateWords(words);
    if (unique.length > 0) await bulkCreate.mutateAsync(unique);
    setResult({ count: unique.length });
    if (unique.length === 0) toast.info("All words already exist in your list.");
    else toast.success(`Imported ${unique.length} words!`);
  };

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract Hindi vocabulary from the following text. The text may be from a Google Doc used in Hindi language lessons. 
Extract each Hindi word/phrase with its English translation, transliteration (romanized pronunciation), category, and example sentences if available.

Text:
${text}

IMPORTANT RULES:
- Copy the Hindi words/phrases EXACTLY as they appear in the text. Do NOT replace, correct, or substitute any Hindi word with a different Hindi word.
- For the English translation, you may fix minor typos but do NOT change the meaning or replace it with a different word.
- If transliterations or examples aren't explicitly given, generate them based on the exact Hindi word provided.
- For the "example_hindi" field, provide the example sentence in transliteration (romanized Latin script, e.g. "Main ghar ja raha hoon"), NOT in Devanagari/Hindi script.
Return ALL vocabulary items you can find.`,
      response_json_schema: {
        type: "object",
        properties: {
          words: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hindi: { type: "string" },
                transliteration: { type: "string" },
                english: { type: "string" },
                example_hindi: { type: "string" },
                example_english: { type: "string" },
                category: { type: "string", enum: ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"] }
              },
              required: ["hindi", "english"]
            }
          }
        }
      }
    });
    if (res?.words?.length > 0) {
      await processWords(res.words);
      setText("");
    } else {
      toast.error("Couldn't find any vocabulary in the text.");
    }
    setIsProcessing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Look at this image and extract all Hindi vocabulary you can find. Extract each Hindi word/phrase with its English translation, transliteration (romanized pronunciation), category, and example sentences if you can infer them.
IMPORTANT: Copy Hindi words EXACTLY as shown. For "example_hindi", use romanized Latin script only.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          words: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hindi: { type: "string" },
                transliteration: { type: "string" },
                english: { type: "string" },
                example_hindi: { type: "string" },
                example_english: { type: "string" },
                category: { type: "string", enum: ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"] }
              },
              required: ["hindi", "english"]
            }
          }
        }
      }
    });
    if (res?.words?.length > 0) await processWords(res.words);
    else toast.error("Couldn't find any vocabulary in the image.");
    e.target.value = "";
    setIsProcessing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          words: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hindi: { type: "string" },
                transliteration: { type: "string" },
                english: { type: "string" },
                example_hindi: { type: "string" },
                example_english: { type: "string" },
                category: { type: "string", enum: ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"] }
              },
              required: ["hindi", "english"]
            }
          }
        }
      }
    });
    if (res?.status === "success" && res.output?.words?.length > 0) await processWords(res.output.words);
    else toast.error("Couldn't extract vocabulary from the file.");
    e.target.value = "";
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { setOpen(v); if (!v) { setText(""); setResult(null); } }}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Import Words
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Words</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Paste text */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Paste from Google Doc
            </p>
            <p className="text-xs text-muted-foreground">Copy text from your Google Doc — AI will extract the vocabulary automatically.</p>
            <Textarea
              placeholder={"Paste your Hindi vocabulary text here...\n\nExample:\nनमस्ते (namaste) - Hello\nधन्यवाद (dhanyavaad) - Thank you"}
              value={text}
              onChange={e => setText(e.target.value)}
              className="min-h-[140px] font-devanagari text-sm"
            />
            <Button onClick={handleExtract} disabled={isProcessing || !text.trim()} className="gap-2 w-full">
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</> : <><Sparkles className="w-4 h-4" /> Extract Vocabulary</>}
            </Button>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or upload</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* File & Photo upload */}
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex flex-col items-center justify-center p-5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}>
              <FileText className="w-6 h-6 text-muted-foreground mb-1.5" />
              <p className="text-sm text-muted-foreground font-medium">Document</p>
              <p className="text-xs text-muted-foreground mt-0.5">CSV, Excel, PDF, JSON</p>
              <input type="file" accept=".csv,.xlsx,.xls,.pdf,.json" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
            </label>
            <label className={`flex flex-col items-center justify-center p-5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}>
              <ImageIcon className="w-6 h-6 text-muted-foreground mb-1.5" />
              <p className="text-sm text-muted-foreground font-medium">Photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isProcessing} />
            </label>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing…
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/10 border border-accent/20 rounded-xl p-3 flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              <p className="text-sm text-foreground">
                Imported <strong>{result.count}</strong> new words into your collection!
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}