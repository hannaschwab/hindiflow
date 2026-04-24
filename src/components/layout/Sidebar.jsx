import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, List, Upload, BarChart3 } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/words", label: "Word List", icon: List },
  { path: "/practice", label: "Practice", icon: GraduationCap },
  { path: "/import", label: "Import Words", icon: Upload },
];

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

      <div className="mt-auto pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground font-inter">
          Keep practicing daily! 🙏
        </p>
      </div>
    </aside>
  );
}