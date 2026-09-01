import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TourStep = {
  icon: string;
  badge: string;
  title: string;
  description: string;
  tip: string;
  gradient: string;
  previewCard?: {
    tag: string;
    subtext: string;
  };
};

const TOUR_STEPS: TourStep[] = [
  {
    icon: "🌸",
    badge: "Welcome Sanctuary",
    title: "A Private World for Just the Two of You",
    description:
      "BondBox is your dedicated, intimate space to preserve memories, milestones, and daily whispers together forever.",
    tip: "💡 Tip: Your sanctuary key connects both of your accounts seamlessly.",
    gradient: "from-[#D66D7D] to-[#E07A8A]",
  },
  {
    icon: "📸",
    badge: "Memory Composer",
    title: "Capture Polaroids, Videos & Voice Notes",
    description:
      "Post snapshots with organic polaroid frames, upload short video clips, or hold to record sweet voice whispers with soundwaves.",
    tip: "💡 Tip: Double-tap any polaroid in the stream to send floating reaction hearts!",
    gradient: "from-[#D66D7D] to-[#F7BA9E]",
  },
  {
    icon: "📍",
    badge: "Trips & Chapters",
    title: "Live Trips & Story Chapters",
    description:
      "Going on vacation, celebrating an anniversary, or planning a date night? Tap 'Start Trip / Chapter' (e.g. 'Paris Getaway', 'Our 1st Anniversary'). Every photo, video, and whisper you post will automatically be bound into that chapter!",
    tip: "💡 Tip: When your trip ends, tap 'Finish Chapter' to permanently seal and celebrate that chapter in your timeline story.",
    gradient: "from-[#9E2A42] via-[#D66D7D] to-[#F7BA9E]",
    previewCard: {
      tag: "🔖 Chapter: Paris Getaway 2026",
      subtext: "Live Trip Active • 12 Memories Tagged",
    },
  },
  {
    icon: "📖",
    badge: "2-Sided Scrapbook",
    title: "Interactive Keepsake Album",
    description:
      "Experience your journey like a real open book keepsake photo album with 2-sided spreads, washi tape, stamps, and page-turning animations.",
    tip: "💡 Tip: Use arrow keys (← / →) to flip pages, or toggle between Feed & Scrapbook in Settings!",
    gradient: "from-[#D66D7D] to-[#F7BA9E]",
  },
  {
    icon: "💌",
    badge: "Wax-Seal Letters",
    title: "Secret Love Notes with 3D Wax Seal",
    description:
      "Send surprise letters locked with a realistic wax seal. Your partner taps the seal to break the stamp and reveal your message.",
    tip: "💡 Tip: You can leave notes instant or scheduled for special dates!",
    gradient: "from-[#9E2A42] to-[#D66D7D]",
  },
  {
    icon: "🎟️",
    badge: "Milestones & Wrapped",
    title: "VIP Golden Ticket & Bond Wrapped",
    description:
      "Invite your partner with a luxury boarding pass, track days bonded together, and share your 9:16 Story Wrapped on WhatsApp.",
    tip: "💡 Tip: Tap the 'Day of Us' header badge anytime to view your full story card.",
    gradient: "from-[#D66D7D] via-[#E07A8A] to-[#F7BA9E]",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg glass-card rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/95 overflow-hidden max-h-[92vh] overflow-y-auto my-auto"
      >
        {/* Background decorative glowing orb */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br ${step.gradient} opacity-25 blur-3xl pointer-events-none transition-all duration-700`}
        />

        {/* Header: Step counter & Skip */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFF5F7] text-[#D66D7D] border border-[#F9D2D9] shadow-2xs">
              ✨ Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#A89A9C] uppercase tracking-wider">
              {step.badge}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-bold text-[#A89A9C] hover:text-[#D66D7D] transition-colors cursor-pointer px-2 py-1"
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
            className="flex flex-col items-center text-center my-3 sm:my-4"
          >
            {/* Animated Icon Orb */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br ${step.gradient} text-white text-3xl sm:text-4xl shadow-xl flex items-center justify-center mb-4 sm:mb-5 border-2 border-white/85`}
            >
              {step.icon}
            </motion.div>

            <h3
              className="text-xl sm:text-3xl font-extrabold text-[#2E2627] tracking-tight mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {step.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#4A3E40] leading-relaxed max-w-md mb-3.5 font-normal">
              {step.description}
            </p>

            {/* Special Visual Preview for Chapters / Features */}
            {step.previewCard && (
              <div className="w-full mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF0E6] to-[#FFF5F7] border border-[#F9D2D9] text-center shadow-inner">
                <span className="text-xs font-bold text-[#9E2A42] block">
                  {step.previewCard.tag}
                </span>
                <span className="text-[10px] text-[#D66D7D] font-semibold">
                  {step.previewCard.subtext}
                </span>
              </div>
            )}

            {/* Pro Tip Box */}
            <div className="w-full p-3.5 rounded-2xl bg-[#FFF5F7] border border-[#F9D2D9] text-xs text-[#9E2A42] text-left font-medium shadow-2xs">
              {step.tip}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar & Dots */}
        <div className="flex items-center justify-center gap-1.5 my-4 sm:my-5">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? "w-8 bg-[#D66D7D] shadow-xs"
                  : idx < currentStep
                  ? "w-2.5 bg-[#F9D2D9]"
                  : "w-2.5 bg-[#F3E6E8]"
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F9D2D9]/70">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A6B6D] hover:text-[#D66D7D] transition-colors disabled:opacity-0 cursor-pointer"
          >
            ← Back
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className={`px-5 sm:px-6 py-2.5 rounded-2xl bg-gradient-to-r ${step.gradient} text-white text-xs font-bold shadow-lg shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95`}
          >
            <span>{isLastStep ? "Start Creating Magic ✨" : "Next Step"}</span>
            {!isLastStep && <span>→</span>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

