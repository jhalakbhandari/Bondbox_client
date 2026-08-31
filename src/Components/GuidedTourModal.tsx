import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TourStep = {
  icon: string;
  badge: string;
  title: string;
  description: string;
  tip: string;
  gradient: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    icon: "🌸",
    badge: "Welcome Sanctuary",
    title: "A Private World for Just the Two of You",
    description:
      "BondBox is your dedicated, intimate space to preserve memories, milestones, and daily whispers together forever.",
    tip: "💡 Tip: Your sanctuary key connects both of your accounts seamlessly.",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    icon: "📸",
    badge: "Memory Composer",
    title: "Capture Polaroids, Videos & Voice Notes",
    description:
      "Post snapshots with organic polaroid frames, upload short video clips, or hold to record sweet voice whispers.",
    tip: "💡 Tip: Double-tap any polaroid in the stream to send floating reaction hearts!",
    gradient: "from-rose-500 to-orange-400",
  },
  {
    icon: "📖",
    badge: "2-Sided Scrapbook",
    title: "Interactive Open Book Collage",
    description:
      "Experience your memories like a real keepsake photo album with 2-sided spreads, washi tape, and page-turning animations.",
    tip: "💡 Tip: Use arrow keys (← / →) to flip pages, or toggle between Feed & Scrapbook in Settings!",
    gradient: "from-amber-500 to-pink-500",
  },
  {
    icon: "💌",
    badge: "Wax-Seal Letters",
    title: "Secret Love Notes with 3D Wax Seal",
    description:
      "Send surprise letters locked with a realistic wax seal. Your partner taps the seal to break the stamp and reveal your message.",
    tip: "💡 Tip: You can leave notes instant or scheduled for special dates!",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: "🎟️",
    badge: "Milestones & Wrapped",
    title: "VIP Golden Ticket & Bond Wrapped",
    description:
      "Invite your partner with a luxury boarding pass, track days bonded together, and share your 9:16 Story Wrapped on WhatsApp.",
    tip: "💡 Tip: Tap the 'Day of Us' header badge anytime to view your full story card.",
    gradient: "from-pink-500 via-rose-500 to-amber-500",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function GuidedTourModal({ isOpen, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem("has_seen_tour", "true");
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("has_seen_tour", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 overflow-hidden"
      >
        {/* Background decorative glowing orb */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br ${step.gradient} opacity-20 blur-3xl pointer-events-none transition-all duration-700`}
        />

        {/* Header: Step counter & Skip */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100/80 text-pink-700 border border-pink-200/60 shadow-2xs">
              ✨ Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {step.badge}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-gray-400 hover:text-pink-600 transition-colors cursor-pointer px-2 py-1"
          >
            Skip Tour
          </button>
        </div>

        {/* Step Content with Animated Switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center my-4"
          >
            {/* Animated Icon Orb */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.gradient} text-white text-4xl shadow-xl flex items-center justify-center mb-5 border-2 border-white/80`}
            >
              {step.icon}
            </motion.div>

            <h3
              className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight mb-2.5"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {step.title}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed max-w-md mb-4 font-normal">
              {step.description}
            </p>

            {/* Pro Tip Box */}
            <div className="w-full p-3 rounded-2xl bg-pink-50/70 border border-pink-200/60 text-xs text-pink-800 text-left font-medium shadow-2xs">
              {step.tip}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar & Dots */}
        <div className="flex items-center justify-center gap-1.5 my-5">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? "w-8 bg-pink-600 shadow-xs"
                  : idx < currentStep
                  ? "w-2.5 bg-pink-300"
                  : "w-2.5 bg-pink-200/70"
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-pink-100/80">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-pink-600 transition-colors disabled:opacity-0 cursor-pointer"
          >
            ← Back
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className={`px-6 py-2.5 rounded-2xl bg-gradient-to-r ${step.gradient} text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center gap-1.5 cursor-pointer`}
          >
            <span>{isLastStep ? "Start Creating Magic ✨" : "Next Step"}</span>
            {!isLastStep && <span>→</span>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
