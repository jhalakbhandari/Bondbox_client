import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import type { Note } from "../types";
import { normalizeMediaUrl, formatMemoryDate } from "../utils/media";

type Props = {
  note: Note;
  onClose: () => void;
  onNoteOpened?: (noteId: string) => void;
};

export default function WaxSealEnvelope({ note, onClose, onNoteOpened }: Props) {
  // states: "sealed" | "breaking" | "opened"
  const [stage, setStage] = useState<"sealed" | "breaking" | "opened">("sealed");
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const handleBreakSeal = async () => {
    if (stage !== "sealed") return;

    // Generate confetti / sparkle burst
    const emojis = ["✨", "💖", "💕", "🌸", "❤️", "✨"];
    const newParticles = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160 - 30,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(newParticles);
    setStage("breaking");

    // Mark as read in backend
    try {
      const token = localStorage.getItem("token");
      if (token && !note.isRead) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/lovenote/read/${note._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onNoteOpened?.(note._id);
      }
    } catch (err) {
      console.error("Failed to mark note as read:", err);
    }

    // Transition to opened state after flap animation
    setTimeout(() => {
      setStage("opened");
    }, 600);
  };

  useEffect(() => {
    // If note was already read previously, open directly after entry
    if (note.isRead) {
      setStage("opened");
    }
  }, [note.isRead]);

  const normalizedAudio = normalizeMediaUrl(note.audio || (note.type === "audio" ? note.content : ""));

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-[100] p-3 sm:p-4 overflow-y-auto">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center my-auto">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/90 shadow-xl text-[#2E2627] flex items-center justify-center font-bold text-sm hover:bg-white transition cursor-pointer z-50 border border-[#F9D2D9]"
          title="Close"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {stage !== "opened" ? (
            /* ============================================================ */
            /* 1. SEALED ENVELOPE VIEW */
            /* ============================================================ */
            <motion.div
              key="sealed-envelope"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full relative select-none"
            >
              {/* Envelope Card Container */}
              <div
                onClick={handleBreakSeal}
                className="relative w-full h-72 sm:h-80 rounded-[32px] bg-gradient-to-br from-[#FFFDF9] via-[#FCE7EB] to-[#FDE2D0] p-1 shadow-[0_20px_60px_rgba(214,109,125,0.4)] border-2 border-white/95 cursor-pointer overflow-hidden flex flex-col items-center justify-between text-center group"
              >
                {/* Envelope Interior Lining Pattern */}
                <div className="absolute inset-2 rounded-[28px] bg-gradient-to-b from-[#FCE7EB] to-[#FFFDF9]/90 shadow-inner overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                      <line x1="0" y1="300" x2="200" y2="150" stroke="#D66D7D" strokeWidth="2" />
                      <line x1="400" y1="300" x2="200" y2="150" stroke="#D66D7D" strokeWidth="2" />
                      <line x1="0" y1="0" x2="200" y2="150" stroke="#D66D7D" strokeWidth="2" />
                      <line x1="400" y1="0" x2="200" y2="150" stroke="#D66D7D" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Animated Top Flap */}
                <motion.div
                  animate={stage === "breaking" ? { rotateX: 160, opacity: 0 } : { rotateX: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute top-0 left-0 right-0 h-36 origin-top bg-gradient-to-b from-[#D66D7D]/80 via-[#F9D2D9] to-[#FFFDF9] [clip-path:polygon(0_0,100%_0,50%_100%)] shadow-md z-20 border-t border-white/70"
                />

                {/* Top Subtitle */}
                <div className="relative z-30 pt-6 px-4">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#D66D7D] bg-white/90 px-3.5 py-1 rounded-full shadow-xs border border-[#F9D2D9]">
                    💌 Confidential Love Letter
                  </span>
                </div>

                {/* Central Wax Seal Stamp */}
                <div className="relative z-40 my-auto flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    animate={
                      stage === "breaking"
                        ? { scale: [1, 1.3, 0], rotate: [0, -15, 25], opacity: 0 }
                        : { scale: [1, 1.04, 1] }
                    }
                    transition={
                      stage === "breaking"
                        ? { duration: 0.5 }
                        : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    }
                    className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#801F34] via-[#9E2A42] to-[#B83250] shadow-[0_10px_25px_rgba(158,42,66,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border-4 border-[#F9D2D9] flex items-center justify-center cursor-pointer"
                  >
                    {/* Wax Stamp Heart Icon */}
                    <span className="text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] select-none">
                      ❤️
                    </span>

                    {/* Wax Seal Rim Detailing */}
                    <div className="absolute inset-1 rounded-full border border-[#801F34]/50 pointer-events-none" />
                  </motion.div>

                  {/* Breaking Particles Explosion */}
                  <AnimatePresence>
                    {particles.map((p) => (
                      <motion.span
                        key={p.id}
                        initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, x: p.x, y: p.y }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute text-xl pointer-events-none select-none"
                      >
                        {p.emoji}
                      </motion.span>
                    ))}
                  </AnimatePresence>

                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-3 text-xs font-extrabold text-[#9E2A42] bg-white/95 px-4 py-1 rounded-full shadow-md tracking-wide border border-[#F9D2D9]"
                  >
                    ✨ Tap Wax Seal to Break ✨
                  </motion.span>
                </div>

                {/* Bottom Sender Badge */}
                <div className="relative z-30 pb-4 text-xs font-semibold text-[#7A6B6D]">
                  <span>To: <strong>My Favorite Person</strong> 💕</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ============================================================ */
            /* 2. UNFOLDED LETTER VIEW */
            /* ============================================================ */
            <motion.div
              key="opened-letter"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative rounded-[32px] bg-gradient-to-b from-[#FFFDF9] via-[#FFF8F5] to-[#FFF3F3] p-6 sm:p-8 shadow-[0_25px_60px_rgba(214,109,125,0.35)] border-2 border-[#F9D2D9] overflow-hidden"
            >
              {/* Washi Tape at Top */}
              <div className="washi-tape" />

              {/* Letter Header */}
              <div className="text-center mt-3 mb-5 pb-3 border-b border-dashed border-[#F9D2D9]">
                <div className="inline-flex items-center gap-1 text-2xl mb-1">
                  <span>💌</span>
                  <span>✨</span>
                </div>
                <h4
                  className="text-xl font-bold text-[#D66D7D] tracking-tight"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Secret Love Note
                </h4>
                <p className="text-[11px] text-[#A89A9C] font-mono mt-0.5">
                  Opened on {formatMemoryDate(new Date().toISOString())}
                </p>
              </div>

              {/* Note Content */}
              {note.type === "text" ? (
                <div className="my-5 px-2 min-h-[120px] flex items-center justify-center text-center">
                  <p
                    className="text-2xl sm:text-3xl text-[#2E2627] leading-relaxed drop-shadow-xs"
                    style={{ fontFamily: "var(--font-handwriting), cursive" }}
                  >
                    "{note.content}"
                  </p>
                </div>
              ) : (
                <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-[#FFF5F7] to-[#FAF0E6] border border-[#F9D2D9] flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D66D7D]">
                    <span className="text-base">🎙️</span>
                    <span>Voice Whisper from the Heart:</span>
                  </div>
                  <audio
                    controls
                    src={normalizedAudio}
                    className="w-full h-10 accent-[#D66D7D]"
                    autoPlay
                  />
                </div>
              )}

              {/* Handwritten Sign-off Footer */}
              <div className="mt-6 pt-4 border-t border-dashed border-[#F9D2D9] flex items-center justify-between text-xs">
                <span className="text-[#7A6B6D] font-mono text-[11px]">
                  Sent: {formatMemoryDate(note.createdAt)}
                </span>
                <span
                  className="text-xl text-[#D66D7D] font-bold"
                  style={{ fontFamily: "var(--font-handwriting), cursive" }}
                >
                  Forever & Always ❤️
                </span>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D66D7D] via-[#E07A8A] to-[#F7BA9E] text-white font-bold text-sm shadow-md shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save in Love Vault</span>
                <span>✨</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

