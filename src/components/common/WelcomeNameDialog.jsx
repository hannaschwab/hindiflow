import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WelcomeNameDialog({ open, onSave }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm" hideClose>
        <DialogHeader>
          <DialogTitle className="text-xl">Namaste! 🙏</DialogTitle>
          <DialogDescription>
            Welcome to HindiFlow! What should we call you?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            autoFocus
            placeholder="Your name..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Let's go!
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}