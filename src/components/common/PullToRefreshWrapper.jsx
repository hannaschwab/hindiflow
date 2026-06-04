import { useRef } from "react";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { RefreshCw } from "lucide-react";

export default function PullToRefreshWrapper({ onRefresh, children }) {
  const containerRef = useRef(null);
  const { pullY, pulling } = usePullToRefresh(onRefresh, containerRef);

  return (
    <div ref={containerRef} className="min-h-full relative">
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-150"
        style={{ height: pullY > 0 ? `${pullY}px` : 0 }}
      >
        <RefreshCw
          className={`w-5 h-5 text-primary transition-transform duration-300 ${pulling ? "rotate-180 text-primary" : "text-muted-foreground"}`}
          style={{ transform: `rotate(${(pullY / 70) * 180}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}