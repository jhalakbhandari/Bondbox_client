import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post, Room } from "../types";
import MemoryImage from "./MemoryImage";
import { formatMemoryDate, formatMemoryTime, normalizeMediaUrl } from "../utils/media";

type Props = {
  posts: Post[];
  room: Room;
};

export default function ScrapbookView({ posts, room }: Props) {
  // Sort posts in ascending order (oldest to newest) to tell the chronological journey
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Each spread has 2 pages on desktop (Left Page & Right Page)
  const POSTS_PER_SPREAD = 2;
  const totalSpreads = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_SPREAD));

  // Open on the latest / most recent spread by default
  const [currentSpread, setCurrentSpread] = useState(() =>
    Math.max(0, totalSpreads - 1)
  );
  const [direction, setDirection] = useState(0);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    setCurrentSpread(Math.max(0, totalSpreads - 1));
  }, [totalSpreads]);

  const handleNext = () => {
    if (currentSpread < totalSpreads - 1) {
      setDirection(1);
      setCurrentSpread((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSpread > 0) {
      setDirection(-1);
      setCurrentSpread((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSpread, totalSpreads]);

  const handleHeartClick = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    const newHeart = { id: Date.now(), x: (Math.random() - 0.5) * 40 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  if (sortedPosts.length === 0) {
    return (
      <div className="w-full max-w-xl text-center py-16 px-6 glass-card rounded-[32px] shadow-xl border border-white/90">
        <div className="text-5xl mb-3">📖</div>
        <h3
          className="text-2xl font-bold text-[#2E2627]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Our Keepsake Scrapbook
        </h3>
        <p className="text-[#7A6B6D] text-xs sm:text-sm mt-2 leading-relaxed">
          No memories captured yet. Post a snapshot, whisper, or note above to start filling the pages of your story together!
        </p>
      </div>
    );
  }

  const leftPostIndex = currentSpread * POSTS_PER_SPREAD;
  const rightPostIndex = leftPostIndex + 1;

  const leftPost = sortedPosts[leftPostIndex];
  const rightPost = sortedPosts[rightPostIndex];

  // Helper renderer for a single collage page
  const renderCollagePage = (
    post: Post | undefined,
    pageNumber: number,
    isLeft: boolean
  ) => {
    if (!post) {
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center border-dashed border-2 border-[#F9D2D9] rounded-2xl bg-[#FAF6F0]/50">
          <div className="text-4xl mb-2 animate-bounce">🌸</div>
          <h4
            className="text-xl font-bold text-[#D66D7D]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Our Story Continues...
          </h4>
          <p className="text-xs text-[#A89A9C] mt-2 max-w-[220px] leading-relaxed">
            Capture another snapshot or whisper above to fill this next page of your journey!
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-[#FFF5F7] text-[#D66D7D] text-[10px] font-bold border border-[#F9D2D9]">
            ✨ Page #{pageNumber}
          </div>
        </div>
      );
    }

    const postLikes = likes[post._id] || 0;
    const normalizedVideo = normalizeMediaUrl(post.video);
    const normalizedAudio = normalizeMediaUrl(post.audio);

    return (
      <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6">
        {/* Washi Tape Accent */}
        <div
          className={`washi-tape ${
            isLeft ? "-top-3.5 left-6 -rotate-2" : "-top-3.5 right-6 rotate-2"
          }`}
        />

        {/* Page Top Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-dashed border-[#F9D2D9] mb-3">
          {post.sessionId?.label ? (
            <span className="text-[10px] sm:text-[11px] font-extrabold text-[#D66D7D] bg-[#FFF5F7] px-3 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-[#F9D2D9]">
              <span>🔖</span>
              <span className="truncate max-w-[140px]">{post.sessionId.label}</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#A89A9C] font-mono">
              ✨ Memory #{pageNumber}
            </span>
          )}

          <div className="text-right">
            <span className="text-[11px] font-bold text-[#4A3E40] font-mono">
              {formatMemoryDate(post.createdAt)}
            </span>
            <span className="text-[10px] text-[#A89A9C] font-mono ml-1.5 hidden sm:inline">
              {formatMemoryTime(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Collage Core Content */}
        <div className="my-auto py-2 flex flex-col items-center justify-center">
          {/* Polaroid Snapshot Frame */}
          {post.photo && (
            <div
              className={`relative mx-auto w-full max-w-[290px] p-2.5 bg-white shadow-md border border-[#F9D2D9]/60 rounded-2xl transition-transform duration-300 ${
                isLeft ? "sm:-rotate-1 sm:hover:rotate-0" : "sm:rotate-1 sm:hover:rotate-0"
              }`}
            >
              {/* Photo Corner Mounting Tabs */}
              <div className="photo-corner-tl" />
              <div className="photo-corner-tr" />
              <div className="photo-corner-bl" />
              <div className="photo-corner-br" />

              <MemoryImage
                src={post.photo}
                alt="Scrapbook Memory"
                caption={post.text}
                date={post.createdAt}
                containerClassName="rounded-xl shadow-inner"
                className="w-full object-cover max-h-52 sm:max-h-60 rounded-xl"
              />
            </div>
          )}

          {/* Video Frame */}
          {normalizedVideo && (
            <div className="relative mx-auto w-full max-w-[280px] rounded-xl overflow-hidden shadow-md border border-gray-200 my-1">
              <video
                controls
                className="w-full rounded-xl max-h-48 object-cover"
                preload="metadata"
                playsInline
              >
                <source src={normalizedVideo} />
              </video>
            </div>
          )}

          {/* Audio Whisper Card */}
          {normalizedAudio && (
            <div className="w-full max-w-[280px] my-2 p-3 rounded-2xl bg-gradient-to-r from-[#FFF5F7] to-[#FAF0E6] border border-[#F9D2D9] shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D66D7D]">
                <span className="text-sm">🎙️</span>
                <span>Voice Whisper:</span>
              </div>
              <audio controls className="w-full h-8 accent-[#D66D7D]">
                <source src={normalizedAudio} />
              </audio>
            </div>
          )}

          {/* Handwritten Caption */}
          {post.text && (
            <div
              className={`mt-3 px-2 py-1.5 max-w-[280px] text-center ${
                !post.photo && !post.video
                  ? "p-4 rounded-2xl bg-[#FFF5F7] border border-[#F9D2D9] shadow-2xs"
                  : ""
              }`}
            >
              <p
                className={`text-[#2E2627] leading-relaxed ${
                  !post.photo && !post.video
                    ? "text-2xl sm:text-3xl"
                    : "text-xl sm:text-2xl"
                }`}
                style={{ fontFamily: "var(--font-handwriting), cursive" }}
              >
                "{post.text}"
              </p>
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div className="mt-3 pt-2.5 border-t border-dashed border-[#F9D2D9] flex items-center justify-between">
          <span className="text-[10px] text-[#A89A9C] font-mono">Page #{pageNumber}</span>

          {/* Reaction Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => handleHeartClick(post._id, e)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#D66D7D] font-bold transition-colors cursor-pointer border border-[#F9D2D9] shadow-2xs active:scale-95"
            >
              <motion.span whileTap={{ scale: 1.4 }} className="text-xs">
                {postLikes > 0 ? "💖" : "🤍"}
              </motion.span>
              <span className="text-[11px] font-bold">
                {postLikes > 0 ? postLikes : "Love"}
              </span>
            </button>

            {/* Floating Hearts */}
            <AnimatePresence>
              {floatingHearts.map((heart) => (
                <motion.span
                  key={heart.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8, x: heart.x }}
                  animate={{ opacity: 0, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="absolute -top-3 left-2 text-sm pointer-events-none select-none"
                >
                  💕
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  // Spread flip animation variants
  const spreadVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 35 : -35,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -35 : 35,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center select-none px-1">
      {/* Scrapbook Header */}
      <div className="w-full flex items-center justify-between mb-4 px-2 sm:px-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <div>
            <h3
              className="text-base sm:text-lg font-bold text-[#2E2627] tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {room.name || "Our Story"} Keepsake Album
            </h3>
            <p className="text-[10px] text-[#A89A9C] font-mono">
              Chronological Journey (Oldest → Present)
            </p>
          </div>
        </div>

        {/* Spread Navigation Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentSpread === totalSpreads - 1 && (
            <span className="hidden sm:inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold animate-pulse border border-emerald-200">
              📍 Current
            </span>
          )}

          <button
            onClick={handlePrev}
            disabled={currentSpread === 0}
            className="sm:hidden w-7 h-7 rounded-full bg-white shadow-xs border border-[#F9D2D9] text-[#D66D7D] font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95"
            aria-label="Previous spread"
            title="Earlier (←)"
          >
            ‹
          </button>

          <span className="text-xs font-bold text-[#D66D7D] bg-[#FFF5F7] px-3.5 py-1 rounded-full shadow-xs whitespace-nowrap border border-[#F9D2D9]">
            Spread {currentSpread + 1} of {totalSpreads}
          </span>

          <button
            onClick={handleNext}
            disabled={currentSpread === totalSpreads - 1}
            className="sm:hidden w-7 h-7 rounded-full bg-white shadow-xs border border-[#F9D2D9] text-[#D66D7D] font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95"
            aria-label="Next spread"
            title="Recent (→)"
          >
            ›
          </button>
        </div>
      </div>

      {/* Main Open Keepsake Album Container */}
      <div className="relative w-full [perspective:1600px]">
        {/* Outer Frame with Romantic Keepsake Glow */}
        <div className="relative w-full rounded-[32px] p-2.5 sm:p-4 bg-gradient-to-br from-[#9E2A42]/15 via-[#D66D7D]/10 to-[#F7BA9E]/15 shadow-[0_24px_60px_rgba(214,109,125,0.25)] border-2 sm:border-4 border-[#9E2A42]/20">
          
          {/* Animated Spread */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSpread}
              custom={direction}
              variants={spreadVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative min-h-[460px] sm:min-h-[520px] rounded-[24px] bg-[#FFFDF9] bg-[radial-gradient(#f0e6df_1px,transparent_1px)] [background-size:16px_16px] shadow-xl border border-[#F9D2D9] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dashed divide-[#F9D2D9] overflow-hidden"
            >
              {/* Spine Crease on Desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 pointer-events-none z-20 bg-gradient-to-r from-black/5 via-transparent to-black/5" />

              {/* LEFT PAGE */}
              <div className="relative w-full h-full">
                {renderCollagePage(leftPost, leftPostIndex + 1, true)}
              </div>

              {/* RIGHT PAGE */}
              <div className="relative w-full h-full">
                {renderCollagePage(rightPost, rightPostIndex + 1, false)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Left Arrow Flip Button (Desktop) */}
        {currentSpread > 0 && (
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/95 text-[#D66D7D] shadow-xl border border-[#F9D2D9] hover:bg-[#D66D7D] hover:text-white hover:scale-105 active:scale-95 transition-all items-center justify-center text-lg md:text-xl font-extrabold cursor-pointer z-30"
            title="Flip to Earlier Memories (←)"
            aria-label="Previous Spread"
          >
            <span>←</span>
          </button>
        )}

        {/* Right Arrow Flip Button (Desktop) */}
        {currentSpread < totalSpreads - 1 && (
          <button
            onClick={handleNext}
            className="hidden sm:flex absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/95 text-[#D66D7D] shadow-xl border border-[#F9D2D9] hover:bg-[#D66D7D] hover:text-white hover:scale-105 active:scale-95 transition-all items-center justify-center text-lg md:text-xl font-extrabold cursor-pointer z-30"
            title="Flip to Recent Memories (→)"
            aria-label="Next Spread"
          >
            <span>→</span>
          </button>
        )}
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="flex items-center justify-between w-full max-w-md mt-5 px-3 sm:px-4">
        <button
          onClick={handlePrev}
          disabled={currentSpread === 0}
          className="px-4 py-2 rounded-2xl glass-pill font-bold text-xs text-[#4A3E40] hover:text-[#D66D7D] transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs border border-[#F9D2D9]/60"
          aria-label="Earlier spread"
        >
          <span>←</span>
          <span>Earlier</span>
        </button>

        {/* Spread Navigation Dots */}
        <div className="flex gap-1 sm:gap-1.5 items-center px-1">
          {Array.from({ length: Math.min(totalSpreads, 8) }).map((_, i) => {
            const spreadIdx =
              totalSpreads <= 8
                ? i
                : Math.max(0, Math.min(currentSpread - 3, totalSpreads - 8)) + i;
            return (
              <button
                key={spreadIdx}
                onClick={() => {
                  setDirection(spreadIdx > currentSpread ? 1 : -1);
                  setCurrentSpread(spreadIdx);
                }}
                className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSpread === spreadIdx
                    ? "bg-[#D66D7D] w-5 sm:w-7 shadow-2xs"
                    : "bg-[#F9D2D9] hover:bg-[#E07A8A] w-2 sm:w-2.5"
                }`}
                title={`Go to spread ${spreadIdx + 1}`}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentSpread === totalSpreads - 1}
          className="px-4 py-2 rounded-2xl glass-pill font-bold text-xs text-[#4A3E40] hover:text-[#D66D7D] transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs border border-[#F9D2D9]/60"
          aria-label="Next spread"
        >
          <span>Recent</span>
          <span>→</span>
        </button>
      </div>

      {/* Keyboard Hint */}
      <p className="text-[11px] text-[#A89A9C] font-medium mt-2.5">
        💡 Tip: Use <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-[#4A3E40] font-mono text-[10px]">←</kbd> and <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-[#4A3E40] font-mono text-[10px]">→</kbd> arrow keys to turn pages
      </p>
    </div>
  );
}

