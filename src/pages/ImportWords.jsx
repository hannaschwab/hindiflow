import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Sparkles, Loader2, CheckCircle2, FileText, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ImportWords() {
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

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract Hindi vocabulary from the following text. The text may be from a Google Doc used in Hindi language lessons. 
Extract each Hindi word/phrase with its English translation, transliteration (romanized pronunciation), category, and example sentences if available.

Text:
${text}

Return ALL vocabulary items you can find. Be thorough. If transliterations or examples aren't explicitly given, generate them.`,
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
                category: { 
                  type: "string",
                  enum: ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"]
                }
              },
              required: ["hindi", "english"]
            }
          }
        }
      }
    });

    if (res?.words?.length > 0) {
      const unique = await deduplicateWords(res.words);
      const skipped = res.words.length - unique.length;
      if (unique.length > 0) await bulkCreate.mutateAsync(unique);
      setResult({ count: unique.length });
      setText("");
      if (unique.length === 0) toast.info("All words already exist in your list.");
      else toast.success(`Imported ${unique.length} words!`);
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
      prompt: `Look at this image and extract all Hindi vocabulary you can find. This could be a photo of a textbook, flashcards, a whiteboard, handwritten notes, or any learning material.
Extract each Hindi word/phrase with its English translation, transliteration (romanized pronunciation), category, and example sentences if you can infer them.
If transliterations or examples aren't visible, generate them yourself.
Return ALL vocabulary items you can find.`,
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
                category: {
                  type: "string",
                  enum: ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"]
                }
              },
              required: ["hindi", "english"]
            }
          }
        }
      }
    });

    if (res?.words?.length > 0) {
      const unique = await deduplicateWords(res.words);
      const skipped = res.words.length - unique.length;
      if (unique.length > 0) await bulkCreate.mutateAsync(unique);
      setResult({ count: unique.length });
      if (unique.length === 0) toast.info("All words already exist in your list.");
      else toast.success(`Imported ${unique.length} words from image!`);
    } else {
      toast.error("Couldn't find any vocabulary in the image.");
    }

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
                category: {
                  type: "string",
                  enum: ["greetings", "food", "travel", "numbers", "family", "colors", "verbs", "adjectives", "phrases", "other"]
                }
              },
              required: ["hindi", "english"]
            }
          }
        }
      }
    });

    if (res?.status === "success" && res.output?.words?.length > 0) {
      const unique = await deduplicateWords(res.output.words);
      const skipped = res.output.words.length - unique.length;
      if (unique.length > 0) await bulkCreate.mutateAsync(unique);
      setResult({ count: unique.length });
      if (unique.length === 0) toast.info("All words already exist in your list.");
      else toast.success(`Imported ${unique.length} words!`);
    } else {
      toast.error("Couldn't extract vocabulary from the file.");
    }

    setIsProcessing(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Import Words</h1>
        <p className="text-sm text-muted-foreground mt-1">Import vocabulary from your Google Doc or any text</p>
      </div>

      <div className="grid gap-6">
        {/* Paste text method */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" /> 
              Paste from Google Doc
            </CardTitle>
            <CardDescription>
              Copy the text from your Google Doc and paste it below. AI will automatically extract the vocabulary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your Hindi vocabulary text here...

Example:
नमस्ते (namaste) - Hello
धन्यवाद (dhanyavaad) - Thank you
कैसे हैं? (kaise hain?) - How are you?"
              value={text}
              onChange={e => setText(e.target.value)}
              className="min-h-[200px] font-devanagari"
            />
            <Button
              onClick={handleExtract}
              disabled={isProcessing || !text.trim()}
              className="gap-2"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Extract Vocabulary</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* File & Photo upload method */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="w-5 h-5 text-primary" />
              Upload File or Photo
            </CardTitle>
            <CardDescription>
              Upload a document or a photo of your notes, textbook, or flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
                <FileText className="w-7 h-7 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Document</p>
                <p className="text-xs text-muted-foreground mt-0.5">CSV, Excel, PDF, JSON</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf,.json"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
                <ImageIcon className="w-7 h-7 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Photo</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Success message */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <p className="text-sm text-foreground">
              Successfully imported <strong>{result.count}</strong> words into your collection!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}