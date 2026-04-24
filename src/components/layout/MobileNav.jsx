import { Link, useLocation } from "react-router-dom";
import { BarChart3, List, GraduationCap, Upload } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: BarChart3 },
  { path: "/words", label: "Words", icon: List },
  { path: "/practice", label: "Practice", icon: GraduationCap },
  { path: "/import", label: "Import", icon: Upload },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-inter transition-all ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}