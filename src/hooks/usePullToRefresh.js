import { useEffect, useRef, useState } from "react";

export default function usePullToRefresh(onRefresh, containerRef) {
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(null);
  const THRESHOLD = 70;

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop === 0) {
        e.preventDefault();
        setPullY(Math.min(dy, THRESHOLD * 1.5));
        setPulling(dy >= THRESHOLD);
      }
    };

    const onTouchEnd = async () => {
      if (pulling) {
        await onRefresh();
      }
      startY.current = null;
      setPullY(0);
      setPulling(false);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pulling, containerRef]);

  return { pullY, pulling };
}