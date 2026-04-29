import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Settings, Trash2, Sun, Moon, Lightbulb, LogOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/AuthContext";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useGreetingName } from "@/hooks/useGreetingName";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/words": "Word List",
  "/practice": "Practice",
  "/challenge": "Sentence Builder",
  "/import": "Import Words",
};

export default function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { greetingName, saveName } = useGreetingName();
  const [settingsOpen, setSettingsOpen] = useState(false);
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
  const isHome = location.pathname === "/";
  const title = PAGE_TITLES[location.pathname] || "HindiFlow";

  return (
    <>
      <header
        className="md:hidden flex items-center h-14 px-4 bg-card border-b border-border sticky top-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {!isHome && (
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="font-semibold text-foreground text-base">{title}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-6">
            {/* Greeting name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your name</label>
              <div className="flex gap-2">
                <Input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="How should we greet you?" className="flex-1" />
                <button onClick={handleSaveName} disabled={!nameInput.trim() || nameInput === greetingName} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0">Save</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Appearance</p>
                <p className="text-xs text-muted-foreground">{isDark ? "Dark mode" : "Light mode"}</p>
              </div>
              <button
                onClick={toggleDark}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? "Light" : "Dark"}
              </button>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
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
            <div className="border-t border-border pt-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 w-full"
              >
                <Share2 className="w-4 h-4" /> Share HindiFlow
              </button>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-3">Account</p>
              <button
                onClick={() => base44.auth.logout()}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-destructive/80 hover:text-destructive transition-colors">
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
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={deleteAccount}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}