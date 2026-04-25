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
      await bulkCreate.mutateAsync(res.words);
      setResult({ count: res.words.length });
      setText("");
      toast.success(`Imported ${res.words.length} words!`);
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
      await bulkCreate.mutateAsync(res.words);
      setResult({ count: res.words.length });
      toast.success(`Imported ${res.words.length} words from image!`);
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
      await bulkCreate.mutateAsync(res.output.words);
      setResult({ count: res.output.words.length });
      toast.success(`Imported ${res.output.words.length} words!`);
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

        {/* Image upload method */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5 text-primary" />
              Import from Photo
            </CardTitle>
            <CardDescription>
              Take a photo or upload an image of your notes, textbook, or flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click to upload or take a photo</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP, HEIC</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isProcessing}
              />
            </label>
          </CardContent>
        </Card>

        {/* File upload method */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Upload a File
            </CardTitle>
            <CardDescription>
              Upload a document (.csv, .xlsx, .pdf, .json) with your vocabulary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, Excel, PDF, or JSON</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf,.json"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
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