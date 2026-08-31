import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post } from "../types";

export default function PostCard({ post, flip }: { post: Post; flip?: boolean }) {
  const [likes, setLikes] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => prev + 1);
    const newHeart = { id: Date.now(), x: (Math.random() - 0.5) * 40 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPolaroid = Boolean(post.photo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto mb-8 px-2"
    >
      <div
        className={`relative group ${
          isPolaroid
            ? `polaroid-card ${flip ? "-rotate-1" : "rotate-1"}`
            : "glass-card rounded-3xl p-6 shadow-xl border border-white/80"
        } transition-all duration-300`}
      >
        {/* Polaroid Washi Tape Accent */}
        {isPolaroid && <div className="washi-tape" />}

        {/* Memory Photo */}
        {post.photo && (
          <div className="relative overflow-hidden rounded-2xl bg-pink-50 mb-3.5 shadow-inner">
            <img
              src={post.photo}
              alt="Memory"
              loading="lazy"
              className="w-full object-cover max-h-96 rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        )}

        {/* Memory Video */}
        {post.video && (
          <div className="relative overflow-hidden rounded-2xl bg-black/5 mb-3.5 shadow-inner">
            <video
              controls
              className="w-full rounded-2xl max-h-80 object-cover"
              preload="metadata"
            >
              <source src={post.video} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Memory Audio / Voice Whisper */}
        {post.audio && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50 border border-pink-200/80 mb-3.5 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-pink-600">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🎙️</span>
                <span>Voice Whisper</span>
              </div>
              <span className="text-[10px] text-pink-400 font-mono">Audio Memory</span>
            </div>
            <audio controls className="w-full h-10 accent-pink-500">
              <source src={post.audio} />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {/* Memory Text Caption */}
        {post.text && (
          <p
            className={`text-gray-800 leading-relaxed ${
              isPolaroid
                ? "text-xl sm:text-2xl font-medium pt-1 px-1.5"
                : "text-base font-medium"
            }`}
            style={{
              fontFamily: isPolaroid
                ? "var(--font-handwriting), cursive"
                : "var(--font-sans), sans-serif",
            }}
          >
            {post.text}
          </p>
        )}

        {/* Footer: Date badge & Love Reaction */}
        <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-pink-100/70 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>📅</span>
            <span className="font-mono text-[11px] text-gray-500 font-medium tracking-tight">
              {formattedDate}
            </span>
          </div>

          {/* Heart Reaction Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleHeartClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 font-medium transition-colors cursor-pointer shadow-xs border border-pink-100"
              title="Send Love"
            >
              <motion.span
                whileTap={{ scale: 1.4 }}
                className="text-sm"
              >
                {likes > 0 ? "💖" : "🤍"}
              </motion.span>
              <span className="text-[11px] font-bold">{likes > 0 ? likes : "Love"}</span>
            </button>

            {/* Floating Hearts Animation */}
            <AnimatePresence>
              {floatingHearts.map((heart) => (
                <motion.span
                  key={heart.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8, x: heart.x }}
                  animate={{ opacity: 0, y: -45, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="absolute -top-3 left-2 text-base pointer-events-none select-none"
                >
                  💕
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
