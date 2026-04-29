import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, List, Upload, BarChart3, Sparkles, Trash2, Sun, Moon, Settings, Lightbulb, LogOut, Share2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useGreetingName } from "@/hooks/useGreetingName";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const navItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/words", label: "Word List", icon: List },
  { path: "/practice", label: "Practice", icon: GraduationCap },
  { path: "/challenge", label: "Sentence Builder", icon: Sparkles },
  { path: "/import", label: "Import Words", icon: Upload },
];

function SettingsDialog() {
  const { deleteAccount } = useAuth();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { greetingName, saveName } = useGreetingName();
  const [open, setOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { setNameInput(greetingName); }, [greetingName]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await saveName(nameInput.trim());
    toast.success("Name updated!");
  };

  const handleShare = async () => {
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: "HindiFlow", text: "Learn Hindi vocabulary with AI-powered flashcards!", url });
        return;
      }
    } catch {}
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleSendSuggestion = async () => {
    if (!suggestion.trim()) return;
    setSending(true);
    const user = await base44.auth.me();
    await base44.entities.Suggestion.create({
      message: suggestion.trim(),
      sender_name: user.full_name || "",
      sender_email: user.email || "",
    });
    toast.success("Suggestion sent – thank you!");
    setSuggestion("");
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
          <Settings className="w-3.5 h-3.5" /> Settings
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {/* Greeting name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your name</label>
            <div className="flex gap-2">
              <Input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="How should we greet you?" className="flex-1" />
              <button onClick={handleSaveName} disabled={!nameInput.trim() || nameInput === greetingName} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0">Save</button>
            </div>
          </div>

          {/* Dark mode */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Appearance</span>
            <button
              onClick={toggleDark}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? "Light" : "Dark"}
            </button>
          </div>

          {/* Suggestion */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-chart-3" /> Suggest an improvement
            </label>
            <textarea
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              rows={3}
              placeholder="What would make HindiFlow better?"
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
            />
            <button
              onClick={handleSendSuggestion}
              disabled={!suggestion.trim() || sending}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {sending ? "Sending…" : "Send Suggestion"}
            </button>
          </div>

          {/* Share */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share HindiFlow
            </button>
          </div>

          {/* Logout + Delete account */}
          <div className="pt-2 border-t border-border space-y-3">
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-destructive/70 hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all your vocabulary data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteAccount}>
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-card border-r border-border p-6">
      <Link to="/" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-inter font-bold text-lg text-foreground leading-tight">HindiFlow</h1>
          <p className="text-xs text-muted-foreground font-inter">Vocabulary Trainer</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-inter font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border space-y-3">
        <SettingsDialog />
        <p className="text-xs text-muted-foreground font-inter">Keep practicing daily! 🙏</p>
      </div>
    </aside>
  );
}