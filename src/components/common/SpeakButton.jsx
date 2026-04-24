import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SpeakButton({ text, lang = "hi-IN", size = "icon", className = "" }) {
  const speak = (e) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={speak}
      className={`text-muted-foreground hover:text-primary ${className}`}
      title="Listen to pronunciation"
    >
      <Volume2 className="w-4 h-4" />
    </Button>
  );
}