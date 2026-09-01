import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Room } from "../types";
import { Flip, toast } from "react-toastify";
import Spinner from "../Components/Spinner";
import GoldenTicketModal from "../Components/GoldenTicketModal";
import WhimsicalMusicPlayer from "../Components/WhimsicalMusicPlayer";

export default function Home() {

  const [mode, setMode] = useState<"" | "create" | "join">("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);

  const navigate = useNavigate();

  const isAlphanumeric = (value: string) => /^[a-zA-Z0-9 ]+$/.test(value);

  const createRoom = async () => {
    if (!name.trim() || !isAlphanumeric(name)) {
      toast.error("Room name can only contain letters and numbers");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/room/create`,
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreatedRoom(res.data);
      toast("🎉 Sanctuary Created! Share your secret key with your loved one!", {
        position: "top-center",
        autoClose: 3500,
        theme: "light",
        transition: Flip,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to create room", {
          position: "top-center",
          autoClose: 5000,
          theme: "light",
          transition: Flip,
        });
      } else {
        toast.error("Failed to create room");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!code.trim() || !/^[a-zA-Z0-9]+$/.test(code.trim())) {
      toast.error("Room code can only contain letters and numbers");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/room/join/${code.trim()}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast("Connected! Welcome to your space 💕", {
        position: "top-center",
        autoClose: 2500,
        theme: "light",
        transition: Flip,
      });
      localStorage.setItem("roomId", res.data._id);
      navigate(`/timeline/${res.data._id}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Room not found or already full", {
          position: "top-center",
          autoClose: 5000,
          theme: "light",
          transition: Flip,
        });
      } else if (err instanceof Error) {
        toast.error(err.message, {
          position: "top-center",
          autoClose: 5000,
          theme: "light",
          transition: Flip,
        });
      } else {
        toast.error("Unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Secret room code copied! 🔑");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-16 left-20 text-4xl select-none opacity-45 pointer-events-none"
      >
        🌸
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden md:flex absolute bottom-20 right-20 text-4xl select-none opacity-45 pointer-events-none"
      >
        💌
      </motion.div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">
        {/* Header Tag */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-pill text-[11px] font-bold text-[#D66D7D] mb-3.5 tracking-wide shadow-2xs"
        >
          <span>♡</span>
          <span>Shared Sanctuary For Two</span>
          <span>♡</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#2E2627] tracking-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Bondbox
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="text-[#7A6B6D] text-xs sm:text-base max-w-md mb-8 sm:mb-10 font-normal leading-relaxed px-2"
        >
          Preserve milestones, secret wax-sealed love notes, voice whispers, and polaroid photos in your private shared space.
        </motion.p>

        {/* Room Action Cards */}
        {!createdRoom && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3.5 sm:gap-5 w-full max-w-md justify-center px-1"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode(mode === "create" ? "" : "create")}
              className={`flex-1 py-4 px-5 rounded-[26px] font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                mode === "create"
                  ? "bg-gradient-to-r from-[#D66D7D] to-[#E07A8A] text-white shadow-[#D66D7D]/35 ring-4 ring-[#FCE7EB]"
                  : "glass-card text-[#2E2627] hover:text-[#D66D7D] hover:border-[#D66D7D]/50"
              }`}
            >
              <span>🌸</span>
              <span>Create Space</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode(mode === "join" ? "" : "join")}
              className={`flex-1 py-4 px-5 rounded-[26px] font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                mode === "join"
                  ? "bg-gradient-to-r from-[#F7BA9E] to-[#E07A8A] text-white shadow-[#F7BA9E]/35 ring-4 ring-[#FDE2D0]"
                  : "glass-card text-[#2E2627] hover:text-[#C55869] hover:border-[#F7BA9E]/50"
              }`}
            >
              <span>🗝️</span>
              <span>Join with Key</span>
            </motion.button>
          </motion.div>
        )}

        {/* Form Container */}
        <AnimatePresence mode="wait">
          {mode && !createdRoom && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 w-full max-w-md px-1"
            >
              <div className="glass-card rounded-[32px] p-6 sm:p-8 shadow-xl border border-white/90">
                {mode === "create" ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-left">
                      <label className="block text-[11px] font-bold text-[#4A3E40] mb-1.5 ml-1">
                        Name Your Romantic Space
                      </label>
                      <input
                        value={name}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^[a-zA-Z0-9 ]*$/.test(value)) {
                            setName(value);
                          }
                        }}
                        placeholder="e.g. Mia & Leo's Little World"
                        className="w-full px-4 py-3 rounded-2xl glass-input text-sm font-medium focus:outline-none placeholder:text-[#A89A9C]"
                        autoFocus
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={createRoom}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white font-bold text-sm shadow-md shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Spinner size={20} thickness={2.5} speed="fast" />
                      ) : (
                        <>
                          <span>Create Our Sanctuary</span>
                          <span>✨</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="text-left">
                      <label className="block text-[11px] font-bold text-[#4A3E40] mb-1.5 ml-1">
                        Enter Secret Room Key
                      </label>
                      <input
                        value={code}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^[a-zA-Z0-9]*$/.test(value)) {
                            setCode(value);
                          }
                        }}
                        placeholder="e.g. ab3k9x"
                        className="w-full px-4 py-3 rounded-2xl glass-input text-sm font-medium font-mono tracking-wider focus:outline-none placeholder:text-[#A89A9C]"
                        autoFocus
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={joinRoom}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F7BA9E] to-[#D66D7D] text-white font-bold text-sm shadow-md shadow-[#F7BA9E]/25 hover:shadow-[#F7BA9E]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Spinner size={20} thickness={2.5} speed="fast" />
                      ) : (
                        <>
                          <span>Join Sanctuary</span>
                          <span>🗝️</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Room Created Success Modal */}
        {createdRoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-5 w-full max-w-md glass-card rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/95 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#D66D7D] to-[#F7BA9E] text-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">
              🎉
            </div>
            <h3
              className="text-2xl font-bold text-[#2E2627]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Sanctuary Created!
            </h3>
            <p className="text-[#7A6B6D] text-xs mt-1">
              Share this secret key with your partner to connect:
            </p>

            {/* Code Card */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#FFF5F7] to-[#FDF8F3] border border-[#F9D2D9] flex items-center justify-between shadow-inner">
              <span className="text-xl sm:text-2xl font-mono font-extrabold tracking-widest text-[#D66D7D]">
                {createdRoom.code}
              </span>
              <button
                onClick={() => handleCopyCode(createdRoom.code)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#F9D2D9] text-[#D66D7D] shadow-xs hover:bg-[#FCE7EB] transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? "✓ Copied!" : "📋 Copy Key"}
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTicketModal(true)}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#E07A8A] to-[#D66D7D] text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🎟️</span>
                <span>View & Share VIP Boarding Pass</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  localStorage.setItem("roomId", createdRoom._id);
                  navigate(`/timeline/${createdRoom._id}`);
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-white border border-[#F9D2D9] text-[#D66D7D] font-bold text-xs sm:text-sm shadow-xs hover:bg-[#FFF5F7] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Our Sanctuary</span>
                <span>🌸</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Golden Ticket Invite Modal */}
        {showTicketModal && createdRoom && (
          <GoldenTicketModal
            roomName={createdRoom.name}
            roomCode={createdRoom.code}
            onClose={() => setShowTicketModal(false)}
          />
        )}

        {/* Whimsical Ambient Music Box Player */}
        <WhimsicalMusicPlayer />
      </div>
    </div>
  );
}


