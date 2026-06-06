import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, PlusSquare, MoreVertical, Smartphone } from "lucide-react";
import { useState } from "react";

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function InstallGuideDialog({ open, onOpenChange }) {
  const [tab, setTab] = useState(isIOS ? "ios" : "android");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" /> Install HindiFlow
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">Add HindiFlow to your home screen to use it like a native app!</p>

        <div className="flex bg-secondary rounded-lg p-1 text-sm mt-2">
          <button
            onClick={() => setTab("ios")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "ios" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            iPhone / iOS
          </button>
          <button
            onClick={() => setTab("android")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "android" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Android
          </button>
        </div>

        {tab === "ios" && (
          <div className="space-y-4 text-sm text-foreground mt-2">
            {[
              { icon: null, text: <>Open this page in <strong>Safari</strong>.</> },
              { icon: <Share2 className="w-4 h-4 text-primary shrink-0" />, text: <>Tap the <strong>Share</strong> button in the bottom toolbar.</> },
              { icon: <PlusSquare className="w-4 h-4 text-primary shrink-0" />, text: <>Tap <strong>Add to Home Screen</strong> and confirm.</> },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">{i + 1}</div>
                <p className="flex items-center gap-1.5 flex-wrap">{step.icon}{step.text}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "android" && (
          <div className="space-y-4 text-sm text-foreground mt-2">
            {[
              { icon: null, text: <>Open this page in <strong>Chrome</strong>.</> },
              { icon: <MoreVertical className="w-4 h-4 text-primary shrink-0" />, text: <>Tap the <strong>menu icon</strong> in the top-right corner.</> },
              { icon: null, text: <>Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</> },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">{i + 1}</div>
                <p className="flex items-center gap-1.5 flex-wrap">{step.icon}{step.text}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}