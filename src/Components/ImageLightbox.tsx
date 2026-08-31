import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMemoryDate, formatMemoryTime } from "../utils/media";

type Props = {
  src: string;
  alt?: string;
  caption?: string;
  date?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ImageLightbox({
  src,
  alt = "Memory Snapshot",
  caption,
  date,
  isOpen,
  onClose,
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Lightbox Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center"
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between px-2 pb-3 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-pink-200">Memory Snapshot</span>
                  {date && (
                    <span className="text-[10px] text-gray-300 font-mono">
                      {formatMemoryDate(date)} • {formatMemoryTime(date)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="bondbox-memory.jpg"
                  className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1 cursor-pointer"
                  title="Open Original"
                >
                  <span>↗</span>
                  <span className="hidden sm:inline">Open Full</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm backdrop-blur-md transition cursor-pointer"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Main Image Frame */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-3xl overflow-hidden bg-black/40 border border-white/20 shadow-2xl p-1 sm:p-2">
              <img
                src={src}
                alt={alt}
                className="max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-inner"
              />
            </div>

            {/* Caption & Romantic Footer */}
            {caption && (
              <div className="mt-3.5 px-6 py-2.5 rounded-2xl bg-white/95 text-gray-800 text-center shadow-xl border border-pink-100 max-w-xl backdrop-blur-md">
                <p
                  className="text-lg sm:text-2xl font-medium"
                  style={{ fontFamily: "var(--font-handwriting), cursive" }}
                >
                  "{caption}"
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
