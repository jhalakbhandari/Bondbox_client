import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import type { Post } from "../types";
import MemoryImage from "./MemoryImage";
import { formatMemoryDate, formatMemoryTime, normalizeMediaUrl } from "../utils/media";

type Props = {
  post: Post;
  flip?: boolean;
  onDelete?: (postId: string) => void;
};

export default function PostCard({ post, flip, onDelete }: Props) {
  const [likes, setLikes] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const spawnHearts = () => {
    setLikes((prev) => prev + 1);
    const count = 3;
    const newHearts = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -Math.random() * 20,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts((prev) =>
        prev.filter((h) => !newHearts.some((nh) => nh.id === h.id))
      );
    }, 1200);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    spawnHearts();
  };

  const handleDoubleTap = () => {
    spawnHearts();
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/post/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Memory removed from sanctuary 🕊️");
      onDelete?.(post._id);
    } catch (err) {
      console.error("Failed to delete memory:", err);
      toast.error("Failed to delete memory");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isPolaroid = Boolean(post.photo);
  const normalizedVideo = normalizeMediaUrl(post.video);
  const normalizedAudio = normalizeMediaUrl(post.audio);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto mb-6 px-1 sm:px-2"
      onDoubleClick={handleDoubleTap}
    >
      <div
        className={`relative group ${
          isPolaroid
            ? `polaroid-card ${flip ? "sm:-rotate-[0.8deg]" : "sm:rotate-[0.8deg]"}`
            : "glass-card rounded-3xl p-5 sm:p-6 shadow-xl border border-white/85"
        } transition-all duration-300`}
      >
        {/* Polaroid Washi Tape Accent */}
        {isPolaroid && <div className="washi-tape" />}

        {/* Polaroid Photo Corner Tabs */}
        {isPolaroid && (
          <>
            <div className="photo-corner-tl" />
            <div className="photo-corner-tr" />
            <div className="photo-corner-bl" />
            <div className="photo-corner-br" />
          </>
        )}

        {/* Delete Memory Button / Confirmation Overlay */}
        <div className="absolute top-3 right-3 z-30">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="w-7 h-7 rounded-full bg-white/70 hover:bg-rose-100 text-gray-400 hover:text-red-500 shadow-2xs flex items-center justify-center text-xs opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Delete this memory"
            >
              🗑️
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card px-3 py-1.5 rounded-2xl shadow-xl border border-rose-200 flex items-center gap-2 bg-white/95 text-xs font-semibold"
            >
              <span className="text-gray-700 text-[11px]">Delete?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-0.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold transition cursor-pointer"
              >
                {isDeleting ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </div>

        {/* Chapter / Session Tag if available */}
        {post.sessionId?.label && (
          <div className="mb-2.5 flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-pink-700 bg-pink-100/90 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
              <span>🔖</span>
              <span className="truncate max-w-[180px] sm:max-w-[240px]">{post.sessionId.label}</span>
            </span>
          </div>
        )}

        {/* Memory Photo with Robust Normalization, Shimmer, & Fullscreen Lightbox */}
        {post.photo && (
          <div className="relative overflow-hidden rounded-2xl mb-3.5 shadow-sm">
            <MemoryImage
              src={post.photo}
              alt={post.text || "BondBox memory photo"}
              caption={post.text}
              date={post.createdAt}
              isPolaroid={true}
              containerClassName="rounded-2xl"
              className="rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        )}

        {/* Memory Video */}
        {normalizedVideo && (
          <div className="relative overflow-hidden rounded-2xl bg-black/5 mb-3.5 shadow-inner border border-gray-100">
            <video
              controls
              className="w-full rounded-2xl max-h-80 object-cover"
              preload="metadata"
              playsInline
            >
              <source src={normalizedVideo} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Whimsical Audio / Voice Whisper Player */}
        {normalizedAudio && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200/80 mb-3.5 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition cursor-pointer text-xs"
                  title={isPlayingAudio ? "Pause Whisper" : "Play Whisper"}
                >
                  {isPlayingAudio ? "⏸" : "▶"}
                </button>
                <div>
                  <span className="text-xs font-bold text-pink-700 block leading-tight">
                    Voice Whisper
                  </span>
                  <span className="text-[10px] text-pink-400 font-mono">
                    {isPlayingAudio ? "Whispering love..." : "Audio Memory"}
                  </span>
                </div>
              </div>

              {/* Animated Soundwave Equalizer */}
              <div className="flex items-center gap-1 h-6 px-2">
                <div
                  className={`w-1 bg-pink-400 rounded-full transition-all ${
                    isPlayingAudio ? "animate-wave-1" : "h-1.5"
                  }`}
                />
                <div
                  className={`w-1 bg-pink-500 rounded-full transition-all ${
                    isPlayingAudio ? "animate-wave-2" : "h-3"
                  }`}
                />
                <div
                  className={`w-1 bg-rose-400 rounded-full transition-all ${
                    isPlayingAudio ? "animate-wave-3" : "h-2"
                  }`}
                />
                <div
                  className={`w-1 bg-orange-400 rounded-full transition-all ${
                    isPlayingAudio ? "animate-wave-4" : "h-3.5"
                  }`}
                />
                <div
                  className={`w-1 bg-pink-400 rounded-full transition-all ${
                    isPlayingAudio ? "animate-wave-5" : "h-1.5"
                  }`}
                />
              </div>
            </div>

            <audio
              ref={audioRef}
              src={normalizedAudio}
              onPlay={() => setIsPlayingAudio(true)}
              onPause={() => setIsPlayingAudio(false)}
              onEnded={() => setIsPlayingAudio(false)}
              controls
              className="w-full h-8 accent-pink-500 opacity-90 mt-1"
            />
          </div>
        )}

        {/* Memory Text / Handwritten Note */}
        {post.text && (
          <p
            className={`text-gray-800 leading-relaxed ${
              isPolaroid
                ? "text-xl sm:text-2xl font-medium pt-1 px-1 text-center sm:text-left"
                : "text-sm sm:text-base font-medium"
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

        {/* Footer: Date Stamp & Love Reaction */}
        <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-pink-100/70 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="text-xs">📅</span>
            <span className="font-mono text-[11px] text-gray-500 font-medium tracking-tight">
              {formatMemoryDate(post.createdAt)}
            </span>
            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
              • {formatMemoryTime(post.createdAt)}
            </span>
          </div>

          {/* Heart Reaction Button with Floating Multi-Hearts */}
          <div className="relative">
            <button
              type="button"
              onClick={handleHeartClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 font-medium transition-colors cursor-pointer shadow-xs border border-pink-100 select-none active:scale-95"
              title="Send Love (Double-tap memory)"
            >
              <motion.span whileTap={{ scale: 1.4 }} className="text-xs">
                {likes > 0 ? "💖" : "🤍"}
              </motion.span>
              <span className="text-[11px] font-bold">
                {likes > 0 ? likes : "Love"}
              </span>
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
