import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Room } from "../types";
import { Flip, toast } from "react-toastify";
import Spinner from "../Components/Spinner";
import GoldenTicketModal from "../Components/GoldenTicketModal";

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
    toast.success("Code copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-3.5 sm:p-6 overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100">
      {/* Ambient background orbs */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Floating decorative emojis */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-16 left-20 text-4xl select-none opacity-50 pointer-events-none"
      >
        🌸
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden md:flex absolute bottom-20 right-20 text-4xl select-none opacity-50 pointer-events-none"
      >
        💌
      </motion.div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">
        {/* Header Tag */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold text-pink-600 mb-3 sm:mb-4 tracking-wide shadow-xs"
        >
          <span>✨</span>
          <span>Shared Memory Sanctuary</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 drop-shadow-sm tracking-tight mb-2 sm:mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Bondbox
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 text-xs sm:text-base max-w-md mb-6 sm:mb-10 font-normal leading-relaxed px-2"
        >
          Preserve milestones, secret wax-sealed love notes, voice whispers, and polaroid photos in your private shared space.
        </motion.p>

        {/* Room Action Cards */}
        {!createdRoom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full max-w-md justify-center px-1"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode(mode === "create" ? "" : "create")}
              className={`flex-1 py-3.5 sm:py-4 px-5 sm:px-6 rounded-3xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                mode === "create"
                  ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-pink-400/40 ring-4 ring-pink-300/40"
                  : "glass-card text-gray-800 hover:text-pink-600 hover:border-pink-300"
              }`}
            >
              <span>🌸</span>
              <span>Create a Room</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode(mode === "join" ? "" : "join")}
              className={`flex-1 py-3.5 sm:py-4 px-5 sm:px-6 rounded-3xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                mode === "join"
                  ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-orange-400/40 ring-4 ring-orange-300/40"
                  : "glass-card text-gray-800 hover:text-orange-600 hover:border-orange-300"
              }`}
            >
              <span>🔑</span>
              <span>Join a Room</span>
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
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 w-full max-w-md px-1"
            >
              <div className="glass-card rounded-3xl p-5 sm:p-8 shadow-xl border border-white/85">
                {mode === "create" ? (
                  <div className="flex flex-col gap-3.5 sm:gap-4">
                    <div className="text-left">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                        Name Your Space
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
                        className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={createRoom}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-sm shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Spinner size={20} thickness={2.5} speed="fast" />
                      ) : (
                        <>
                          <span>Create Space</span>
                          <span>✨</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 sm:gap-4">
                    <div className="text-left">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                        Enter Secret Room Code
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
                        className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium font-mono tracking-wider focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={joinRoom}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Spinner size={20} thickness={2.5} speed="fast" />
                      ) : (
                        <>
                          <span>Join Space</span>
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
            className="mt-5 w-full max-w-md glass-card rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/90"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 to-orange-300 text-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">
              🎉
            </div>
            <h3
              className="text-2xl font-bold text-gray-800"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Sanctuary Created!
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              Share this secret key with your partner to connect:
            </p>

            {/* Code Card */}
            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 flex items-center justify-between shadow-inner">
              <span className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-pink-600">
                {createdRoom.code}
              </span>
              <button
                onClick={() => handleCopyCode(createdRoom.code)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-pink-200 text-pink-700 shadow-xs hover:bg-pink-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mt-5 sm:mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTicketModal(true)}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-400 to-pink-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                className="w-full py-3 px-5 rounded-2xl bg-white border border-pink-200 text-pink-600 font-bold text-xs sm:text-sm shadow-xs hover:bg-pink-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
      </div>
    </div>
  );
}
