import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

type Props = {
  roomName: string;
  roomCode: string;
  onClose: () => void;
};

export default function GoldenTicketModal({ roomName, roomCode, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const inviteMessage = `Hey! 💌 I created a private sanctuary for us on BondBox: "${roomName}" ✨\n\nCome share memories, secret love notes, and photos with me.\nOur Secret Key: *${roomCode}*\n\nJoin here: ${window.location.origin}`;

  const shareToWhatsApp = () => {
    const encoded = encodeURIComponent(inviteMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const copyInviteText = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    toast.success("Full invite message copied to clipboard! 📋✨");
    setTimeout(() => setCopied(false), 3000);
  };

  const copyCodeOnly = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied! 🔑");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-lg flex flex-col items-center my-auto"
      >
        {/* Ticket Outer Wrapper */}
        <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-pink-100 p-1 shadow-2xl border-2 border-amber-200/80">
          
          {/* Inner Ticket Card */}
          <div className="relative bg-white/95 rounded-[22px] p-5 sm:p-8 overflow-hidden">
            {/* Top decorative header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-dashed border-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">🎟️</span>
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-extrabold text-amber-600 block">
                    VIP BOARDING PASS • SANCTUARY FOR TWO
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    BondBox Passport
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200 text-pink-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Left and Right Notches */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 z-20" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 z-20" />

            {/* Ticket Body Content */}
            <div className="my-5 sm:my-6 grid grid-cols-2 gap-3 sm:gap-4 text-left">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Destination</p>
                <p className="text-sm sm:text-base font-bold text-pink-600 truncate mt-0.5" style={{ fontFamily: "var(--font-serif)" }}>
                  {roomName || "Our Little World"}
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Passenger</p>
                <p className="text-sm sm:text-base font-bold text-gray-800 mt-0.5">
                  My Loved One 💕
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Class</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                  First Class • Forever Bond 🥂
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Validity</p>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                  Lifetime Pass ✨
                </p>
              </div>
            </div>

            {/* Secret Key Golden Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-100/70 via-rose-100/70 to-orange-100/70 border border-amber-300/80 text-center shadow-inner relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                🗝️ YOUR SECRET ADMISSION KEY
              </span>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-widest text-pink-700">
                  {roomCode}
                </span>
                <button
                  onClick={copyCodeOnly}
                  className="px-2.5 py-1 text-xs font-bold bg-white text-pink-600 rounded-xl shadow-xs hover:bg-pink-50 border border-pink-200 transition cursor-pointer active:scale-95"
                >
                  Copy Key
                </button>
              </div>
            </div>

            {/* Barcode & Cute Stamp Footer */}
            <div className="mt-5 pt-3 sm:mt-6 sm:pt-4 border-t-2 border-dashed border-amber-200 flex items-center justify-between">
              {/* Simulated barcode */}
              <div className="flex flex-col items-start">
                <div className="flex items-end gap-[3px] h-6 sm:h-7 opacity-70">
                  <div className="w-[2px] h-full bg-gray-800" />
                  <div className="w-[4px] h-full bg-gray-800" />
                  <div className="w-[1px] h-full bg-gray-800" />
                  <div className="w-[3px] h-full bg-gray-800" />
                  <div className="w-[2px] h-full bg-gray-800" />
                  <div className="w-[5px] h-full bg-gray-800" />
                  <div className="w-[1px] h-full bg-gray-800" />
                  <div className="w-[3px] h-full bg-gray-800" />
                  <div className="w-[4px] h-full bg-gray-800" />
                  <div className="w-[2px] h-full bg-gray-800" />
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 tracking-widest mt-1">BONDBOX-PASS-2026</span>
              </div>

              {/* Romantic Stamp */}
              <div className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border-2 border-dashed border-pink-400 text-pink-600 font-bold text-[10px] sm:text-[11px] transform -rotate-6">
                SEALED WITH LOVE ❤️
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-5 w-full flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={shareToWhatsApp}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>💬</span>
            <span>Send on WhatsApp</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copyInviteText}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{copied ? "✓ Copied!" : "💌 Copy Invite Card"}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
