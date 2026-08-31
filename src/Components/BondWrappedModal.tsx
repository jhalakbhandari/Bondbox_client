import { motion } from "framer-motion";
import { toast } from "react-toastify";
import type { Note, Post, Room } from "../types";

type Props = {
  room: Room;
  posts: Post[];
  notes: Note[];
  onClose: () => void;
};

export default function BondWrappedModal({ room, posts, notes, onClose }: Props) {
  // Calculate Days Together
  const startDate = room.createdAt ? new Date(room.createdAt) : new Date();
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const daysTogether = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const totalMemories = posts.length;
  const voiceWhispers = posts.filter((p) => Boolean(p.audio)).length;
  const photoMemories = posts.filter((p) => Boolean(p.photo)).length;
  const totalNotes = notes.length;

  const handleCopySummary = () => {
    const summary = `✨ Our BondBox Story: "${room.name}" ✨\n\n🌸 ${daysTogether} Days of Love & Memories\n📸 ${photoMemories} Polaroid Snapshots\n🎙️ ${voiceWhispers} Voice Whispers Recorded\n💌 ${totalNotes} Secret Love Letters Exchanged\n\nPreserved forever on BondBox 💕`;
    navigator.clipboard.writeText(summary);
    toast.success("Story summary copied! Ready to post on Instagram or WhatsApp 📱✨");
  };

  const handleShareStory = () => {
    const summary = `✨ Our BondBox Story: "${room.name}" ✨\n\n🌸 ${daysTogether} Days of Love & Memories\n📸 ${photoMemories} Polaroid Snapshots\n🎙️ ${voiceWhispers} Voice Whispers\n💌 ${totalNotes} Love Notes\n\nPreserved on BondBox 💕`;
    const encoded = encodeURIComponent(summary);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-sm flex flex-col items-center my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white/90 shadow-lg text-gray-700 flex items-center justify-center font-bold text-sm z-30 hover:bg-white cursor-pointer"
        >
          ✕
        </button>

        {/* 9:16 Story Card */}
        <div
          id="story-card"
          className="w-full rounded-[32px] p-6 sm:p-7 shadow-2xl border-2 border-white/60 relative overflow-hidden bg-gradient-to-b from-pink-500 via-rose-400 to-orange-400 text-white text-center flex flex-col justify-between min-h-[540px]"
        >
          {/* Background decorative glows & stars */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-yellow-300/25 blur-2xl pointer-events-none" />

          {/* Story Card Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-white mb-3">
              <span>★</span>
              <span>Our Bond Wrapped 2026</span>
              <span>★</span>
            </div>

            <h2
              className="text-3xl font-extrabold text-white drop-shadow-md tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {room.name || "Our Sanctuary"}
            </h2>
            <p className="text-white/90 text-xs mt-1 font-medium">
              A private chapter written together
            </p>
          </div>

          {/* Hero Days Together Stat */}
          <div className="my-4 p-4 rounded-3xl bg-white/20 backdrop-blur-md border border-white/40 shadow-inner">
            <span className="text-xs uppercase tracking-widest font-bold text-pink-100">
              🌸 Time Bonded Together
            </span>
            <div className="text-5xl font-extrabold text-white mt-1 drop-shadow-sm font-mono">
              {daysTogether}
            </div>
            <span className="text-xs text-white/90 font-medium">
              Days of Laughter, Love & Moments
            </span>
          </div>

          {/* 4 Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 my-2 text-left">
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <span className="text-lg">📸</span>
              <p className="text-2xl font-bold text-white mt-1">{photoMemories}</p>
              <p className="text-[10px] text-pink-100 uppercase tracking-wider font-semibold">Snapshots</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <span className="text-lg">🎙️</span>
              <p className="text-2xl font-bold text-white mt-1">{voiceWhispers}</p>
              <p className="text-[10px] text-pink-100 uppercase tracking-wider font-semibold">Voice Whispers</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <span className="text-lg">💌</span>
              <p className="text-2xl font-bold text-white mt-1">{totalNotes}</p>
              <p className="text-[10px] text-pink-100 uppercase tracking-wider font-semibold">Love Letters</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <span className="text-lg">📖</span>
              <p className="text-2xl font-bold text-white mt-1">{totalMemories}</p>
              <p className="text-[10px] text-pink-100 uppercase tracking-wider font-semibold">Total Memories</p>
            </div>
          </div>

          {/* Relationship Badge */}
          <div className="mt-2 pt-3 border-t border-white/30 flex items-center justify-between text-xs">
            <span className="font-semibold text-white/90 text-[11px]">
              Vibe: <strong>Soulmates Forever 💫</strong>
            </span>
            <span className="font-mono text-[10px] text-pink-100 font-bold">
              BondBox.app
            </span>
          </div>
        </div>

        {/* Action Share Buttons */}
        <div className="mt-4 w-full flex gap-2.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShareStory}
            className="flex-1 py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>💬</span>
            <span>WhatsApp Story</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopySummary}
            className="flex-1 py-3 px-3 rounded-2xl bg-white hover:bg-pink-50 text-pink-600 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📋</span>
            <span>Copy Story Text</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
