import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/AuthContext";

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
  const [settingsOpen, setSettingsOpen] = useState(false);
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
            <div>
              <p className="text-sm text-muted-foreground mb-1">Keep practicing daily! 🙏</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-3">Account</p>
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