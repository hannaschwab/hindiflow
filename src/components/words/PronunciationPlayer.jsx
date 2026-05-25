import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2, VolumeX } from "lucide-react";

/**
 * PronunciationPlayer
 * Shows a play button for a given audio URL.
 * Props:
 *   url       - audio file URL
 *   className - extra classes for the button
 */
export default function PronunciationPlayer({ url, className = "" }) {
  const [state, setState] = useState("idle"); // idle | loading | playing | error
  const audioRef = useRef(null);

  if (!url) return null;

  const handlePlay = () => {
    if (state === "playing") {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setState("idle");
      return;
    }

    setState("loading");
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setState("playing");
      audio.play();
    };
    audio.onended = () => setState("idle");
    audio.onerror = () => setState("error");
    audio.load();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 ${className}`}
      onClick={handlePlay}
      title={state === "error" ? "Audio unavailable" : "Play pronunciation"}
    >
      {state === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
      {state === "playing" && <Volume2 className="w-3.5 h-3.5 text-primary" />}
      {state === "idle" && <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />}
      {state === "error" && <VolumeX className="w-3.5 h-3.5 text-destructive" />}
    </Button>
  );
}