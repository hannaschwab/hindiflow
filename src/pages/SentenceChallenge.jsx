import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import TutorAvatar from "@/components/sentence/TutorAvatar";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  if (message.role === "tool" || !message.content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border text-foreground"
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-foreground"
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}

export default function SentenceChallenge() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [avatarState, setAvatarState] = useState("idle");
  const bottomRef = useRef(null);

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // Detect celebratory responses from the agent
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "assistant" && lastMsg?.content) {
        const lower = lastMsg.content.toLowerCase();
        // Strong correct signals — only celebrate if clearly fully correct
        const strongCorrectWords = ["excellent", "perfect", "well done", "amazing", "fantastic", "bravo", "shabash", "spot on", "100%", "exactly right"];
        // Partial/weak correct signals — motivate instead of celebrate
        const weakCorrectWords = ["great", "correct", "good job", "nice"];
        const wrongWords = ["not quite", "almost", "close", "try again", "incorrect", "mistake", "actually", "should be", "let me correct", "wrong", "not right", "not correct"];
        const isStrongCorrect = strongCorrectWords.some(w => lower.includes(w));
        const isWrongAnswer = wrongWords.some(w => lower.includes(w));
        const isWeakCorrect = !isStrongCorrect && !isWrongAnswer && weakCorrectWords.some(w => lower.includes(w));
        if (isStrongCorrect && !loading) {
          setAvatarState("celebrating");
          setTimeout(() => setAvatarState("idle"), 3000);
        } else if (isWeakCorrect && !loading) {
          setAvatarState("encouraging");
          setTimeout(() => setAvatarState("idle"), 3000);
        } else if (isWrongAnswer && !loading) {
          setAvatarState("motivating");
          setTimeout(() => setAvatarState("idle"), 3000);
        }
      }
    }
  }, [messages]);

  const startConversation = async () => {
    setStarting(true);
    setAvatarState("thinking");
    const conv = await base44.agents.createConversation({
      agent_name: "sentence_challenge",
      metadata: { name: "Sentence Challenge" },
    });
    setConversation(conv);

    const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });

    // Send opening message
    await base44.agents.addMessage(conv, {
      role: "user",
      content: "Hi! I'm ready to practice. Please explain both modes briefly and ask me which I prefer.",
    });

    setStarting(false);
    setAvatarState("idle");
    return () => unsubscribe();
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !conversation) return;
    const text = input.trim();
    setInput("");
    setLoading(true);
    setAvatarState("thinking");
    await base44.agents.addMessage(conversation, { role: "user", content: text });
    setLoading(false);
    setAvatarState("idle");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChallenge = async () => {
    setMessages([]);
    setConversation(null);
    await startConversation();
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Sentence Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Practice Hindi with your vocabulary</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleNewChallenge}>
          <Plus className="w-4 h-4" /> New Session
        </Button>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-2">
        <TutorAvatar state={avatarState} />
      </div>

      {/* Quick mode shortcuts */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          disabled={loading || starting}
          onClick={async () => {
            if (!conversation) return;
            setLoading(true);
            await base44.agents.addMessage(conversation, { role: "user", content: "Give me a Free Build challenge." });
            setLoading(false);
          }}
        >
          ✏️ Free Build
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          disabled={loading || starting}
          onClick={async () => {
            if (!conversation) return;
            setLoading(true);
            await base44.agents.addMessage(conversation, { role: "user", content: "Give me a Translation challenge." });
            setLoading(false);
          }}
        >
          🔄 Translation
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
        {starting && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your sentence..."
          disabled={loading || starting}
          className="flex-1 rounded-xl"
        />
        <Button onClick={handleSend} disabled={loading || starting || !input.trim()} size="icon" className="rounded-xl shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}