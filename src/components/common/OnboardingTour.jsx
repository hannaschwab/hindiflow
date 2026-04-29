import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, BarChart3, List, GraduationCap, Sparkles, Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "hindiflow_onboarding_done";

const STEPS = [
  {
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
    title: "Welcome to HindiFlow! 🙏",
    description: "This quick tour will show you around. HindiFlow helps you learn Hindi vocabulary with smart tools and spaced repetition.",
  },
  {
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
    title: "Dashboard",
    description: "Your home base. See your progress at a glance — total words, mastery %, daily goal, and recent activity.",
  },
  {
    icon: Upload,
    color: "bg-chart-4/10 text-chart-4",
    title: "Import Words",
    description: "Add vocabulary fast by pasting text from your Google Doc, uploading a file, or even taking a photo of your notes. AI extracts the words for you.",
  },
  {
    icon: List,
    color: "bg-accent/10 text-accent",
    title: "Word List",
    description: "Browse and manage all your saved words. Filter by category, search, edit entries, or auto-categorize with AI.",
  },
  {
    icon: GraduationCap,
    color: "bg-chart-5/10 text-chart-5",
    title: "Practice",
    description: "Study with flashcards using spaced repetition (SRS). The app schedules reviews so you never forget a word.",
  },
  {
    icon: Sparkles,
    color: "bg-chart-3/10 text-chart-3",
    title: "Sentence Builder",
    description: "Chat with an AI tutor to practice building real Hindi sentences. Great for putting your vocabulary into context.",
  },
  {
    icon: Settings,
    color: "bg-secondary text-secondary-foreground",
    title: "Settings & Feedback",
    description: "Open Settings (gear icon) to change your name, toggle dark mode, or send us a suggestion. We'd love to hear from you!",
  },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  const prev = () => setStep(s => s - 1);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6"
          >
            {/* Close */}
            <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${current.color}`}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <h2 className="text-lg font-bold text-foreground mb-2">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.description}</p>

            {/* Step dots */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="outline" size="sm" onClick={prev} className="gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                )}
                <Button size="sm" onClick={next} className="gap-1">
                  {isLast ? "Get started!" : <>Next <ChevronRight className="w-3.5 h-3.5" /></>}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}