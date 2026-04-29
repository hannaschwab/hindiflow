import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, BarChart3, List, GraduationCap, Sparkles, Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "hindiflow_onboarding_done";

// position: where the callout card appears on desktop
// mobilePosition: where it appears on mobile
// highlight: optional CSS selector to spotlight (unused visually but marks intent)
const STEPS = [
  {
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
    title: "Welcome to HindiFlow! 🙏",
    description: "This quick tour will show you around. HindiFlow helps you learn Hindi vocabulary with smart tools and spaced repetition.",
    route: "/",
    position: "center",
  },
  {
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
    title: "Dashboard",
    description: "Your home base. See your progress at a glance — total words, mastery %, daily goal, and recent activity.",
    route: "/",
    // top-center, pointing at the stats area
    position: "top-center",
  },
  {
    icon: Upload,
    color: "bg-chart-4/10 text-chart-4",
    title: "Import Words",
    description: "Add vocabulary fast by pasting text from your Google Doc, uploading a file, or even taking a photo of your notes. AI extracts the words for you.",
    route: "/import",
    position: "top-center",
  },
  {
    icon: List,
    color: "bg-accent/10 text-accent",
    title: "Word List",
    description: "Browse and manage all your saved words. Filter by category, search, edit entries, or auto-categorize with AI.",
    route: "/words",
    position: "top-center",
  },
  {
    icon: GraduationCap,
    color: "bg-chart-5/10 text-chart-5",
    title: "Practice",
    description: "Study with flashcards using spaced repetition (SRS). The app schedules reviews so you never forget a word.",
    route: "/practice",
    position: "top-center",
  },
  {
    icon: Sparkles,
    color: "bg-chart-3/10 text-chart-3",
    title: "Sentence Builder",
    description: "Chat with an AI tutor to practice building real Hindi sentences. Great for putting your vocabulary into context.",
    route: "/challenge",
    position: "top-center",
  },
  {
    icon: Settings,
    color: "bg-secondary text-secondary-foreground",
    title: "Settings & Feedback",
    description: "Open the gear icon (⚙️) in the sidebar or top bar to change your name, toggle dark mode, or send us a suggestion.",
    route: "/",
    // bottom-left to point at sidebar settings area on desktop, bottom on mobile
    position: "bottom-left",
  },
];

// Returns Tailwind positioning classes for the card based on position key
function getPositionClasses(position) {
  switch (position) {
    case "top-center":
      return "md:top-6 md:left-1/2 md:-translate-x-1/2 md:translate-y-0";
    case "bottom-left":
      return "md:bottom-20 md:left-72 md:translate-y-0";
    case "center":
    default:
      return "md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2";
  }
}

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const goToStep = (nextStep) => {
    setStep(nextStep);
    navigate(STEPS[nextStep].route);
  };

  const next = () => {
    if (step < STEPS.length - 1) goToStep(step + 1);
    else dismiss();
  };

  const prev = () => goToStep(step - 1);

  // Navigate to the correct route when tour first opens
  useEffect(() => {
    if (visible) navigate(STEPS[0].route);
  }, [visible]);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const posClasses = getPositionClasses(current.position);

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
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed z-50 w-full max-w-sm
              /* mobile: bottom sheet */
              bottom-0 left-0 right-0
              rounded-t-3xl
              /* desktop: positioned callout */
              md:bottom-auto md:left-auto md:right-auto md:rounded-2xl md:w-80
              ${posClasses}
              bg-card border border-border shadow-2xl p-6`}
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Drag handle (mobile only) */}
            <div className="md:hidden w-10 h-1 bg-border rounded-full mx-auto mb-5" />

            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${current.color}`}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <h2 className="text-lg font-bold text-foreground mb-1.5">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.description}</p>

            {/* Step dots + nav */}
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
                  <Button variant="outline" size="sm" onClick={prev} className="gap-1 h-9 px-3">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                )}
                <Button size="sm" onClick={next} className="gap-1 h-9 px-4">
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