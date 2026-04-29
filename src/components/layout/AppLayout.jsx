import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";
import Dashboard from "@/pages/Dashboard";
import WordList from "@/pages/WordList";
import Practice from "@/pages/Practice";
import SentenceChallenge from "@/pages/SentenceChallenge";
import OnboardingTour from "@/components/common/OnboardingTour";
import { useAuth } from "@/lib/AuthContext";
import { useVocabSeeding } from "@/hooks/useVocabSeeding";

// Pages kept alive in DOM to preserve scroll + state when switching tabs
const PERSISTENT_ROUTES = ["/", "/words", "/practice", "/challenge"];

function KeepAliveRoute({ path, currentPath, children }) {
  const isActive = currentPath === path;
  return (
    <div className={isActive ? "h-full" : "hidden"} aria-hidden={!isActive}>
      {children}
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const isPersistent = PERSISTENT_ROUTES.includes(location.pathname);
  const { user } = useAuth();
  useVocabSeeding(user);

  return (
    <div
      className="flex min-h-screen bg-background font-inter"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-hidden relative">
          {/* Persistent pages — stay mounted, hidden when inactive */}
          <KeepAliveRoute path="/" currentPath={location.pathname}>
            <Dashboard />
          </KeepAliveRoute>
          <KeepAliveRoute path="/words" currentPath={location.pathname}>
            <WordList />
          </KeepAliveRoute>
          <KeepAliveRoute path="/practice" currentPath={location.pathname}>
            <Practice />
          </KeepAliveRoute>
          <KeepAliveRoute path="/challenge" currentPath={location.pathname}>
            <SentenceChallenge />
          </KeepAliveRoute>

          {/* Non-persistent pages rendered via Outlet */}
          {!isPersistent && (
            <div className="h-full overflow-auto pb-20 md:pb-0">
              <Outlet />
            </div>
          )}
        </main>
      </div>
      <MobileNav />
      <OnboardingTour />
    </div>
  );
}