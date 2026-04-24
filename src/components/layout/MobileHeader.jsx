import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const isHome = location.pathname === "/";
  const title = PAGE_TITLES[location.pathname] || "HindiFlow";

  return (
    <header className="md:hidden flex items-center h-14 px-4 bg-card border-b border-border sticky top-0 z-30"
      style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center gap-2 w-full">
        {!isHome && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="font-semibold text-foreground text-base">{title}</h1>
      </div>
    </header>
  );
}