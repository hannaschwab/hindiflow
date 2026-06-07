import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, List, GraduationCap, Sparkles } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: BarChart3 },
  { path: "/practice", label: "Practice", icon: GraduationCap },
  { path: "/words", label: "Words", icon: List },
  { path: "/challenge", label: "Builder", icon: Sparkles },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabPress = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      <div className="flex justify-around">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => handleTabPress(path)}
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-inter transition-all ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}