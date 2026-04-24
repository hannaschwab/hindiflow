import { motion, AnimatePresence } from "framer-motion";

const AVATAR = {
  idle: "https://media.base44.com/images/public/69eb2d3796574eaf6d30369d/888a524e1_generated_image.png",
  thinking: "https://media.base44.com/images/public/69eb2d3796574eaf6d30369d/179cb1553_generated_image.png",
  celebrating: "https://media.base44.com/images/public/69eb2d3796574eaf6d30369d/1317fc47a_generated_image.png",
  encouraging: "https://media.base44.com/images/public/69eb2d3796574eaf6d30369d/fbcae4283_generated_image.png",
};

const STATE_CONFIG = {
  idle: { label: "Ready", color: "bg-accent" },
  thinking: { label: "Thinking...", color: "bg-yellow-400" },
  celebrating: { label: "Great job!", color: "bg-green-500" },
  encouraging: { label: "Keep trying!", color: "bg-orange-400" },
};

export default function TutorAvatar({ state = "idle" }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28 md:w-36 md:h-36">
        {/* Pulsing ring when thinking */}
        {state === "thinking" && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-yellow-400"
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
        {/* Glow when celebrating */}
        {state === "celebrating" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-300 opacity-30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}

        <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg bg-secondary">
        <AnimatePresence mode="wait">
          <motion.img
            key={state}
            src={AVATAR[state] || AVATAR.idle}
            alt="Hindi tutor avatar"
            className="w-full h-full object-cover object-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        key={state + "-label"}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-0.5"
      >
        <span className="text-sm font-semibold text-foreground">Apoorva</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.color}`} />
          <span className="text-xs text-muted-foreground">{config.label}</span>
        </div>
      </motion.div>
    </div>
  );
}