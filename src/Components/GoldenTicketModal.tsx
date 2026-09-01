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
    <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex justify-center items-center z-50 p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-lg flex flex-col items-center my-auto"
      >
        {/* Ticket Outer Wrapper */}
        <div className="w-full relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-200/80 via-[#FDE2D0] to-[#F9D2D9] p-1.5 shadow-2xl border-2 border-amber-300/80">
          
          {/* Inner Ticket Card */}
          <div className="relative bg-[#FFFDF9] rounded-[26px] p-6 sm:p-8 overflow-hidden">
            {/* Top decorative header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-dashed border-[#F9D2D9]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">🎟️</span>
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-extrabold text-amber-800 block">
                    VIP BOARDING PASS • SANCTUARY FOR TWO
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-bold text-[#2E2627] leading-tight"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    BondBox Passport
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#D66D7D] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer border border-[#F9D2D9]"
              >
                ✕
              </button>
            </div>

            {/* Left and Right Notches */}
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 z-20" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 z-20" />

            {/* Ticket Body Content */}
            <div className="my-5 sm:my-6 grid grid-cols-2 gap-3.5 sm:gap-4 text-left">
              <div>
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#A89A9C]">Destination</p>
                <p className="text-sm sm:text-base font-bold text-[#D66D7D] truncate mt-0.5" style={{ fontFamily: "var(--font-serif)" }}>
                  {roomName || "Our Little World"}
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#A89A9C]">Passenger</p>
                <p className="text-sm sm:text-base font-bold text-[#2E2627] mt-0.5">
                  My Loved One 💕
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#A89A9C]">Class</p>
                <p className="text-xs font-semibold text-[#4A3E40] mt-0.5">
                  First Class • Forever Bond 🥂
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#A89A9C]">Validity</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  Lifetime Pass ✨
                </p>
              </div>
            </div>

            {/* Secret Key Golden Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-[#FFF5F7] to-orange-50 border border-amber-300 text-center shadow-inner relative">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                🗝️ YOUR SECRET ADMISSION KEY
              </span>
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-widest text-[#D66D7D]">
                  {roomCode}
                </span>
                <button
                  onClick={copyCodeOnly}
                  className="px-3 py-1 text-xs font-bold bg-white text-[#D66D7D] rounded-xl shadow-xs hover:bg-[#FCE7EB] border border-[#F9D2D9] transition cursor-pointer active:scale-95"
                >
                  Copy Key
                </button>
              </div>
            </div>

            {/* Barcode & Cute Stamp Footer */}
            <div className="mt-5 pt-3.5 sm:mt-6 sm:pt-4 border-t-2 border-dashed border-[#F9D2D9] flex items-center justify-between">
              {/* Simulated barcode */}
              <div className="flex flex-col items-start">
                <div className="flex items-end gap-[3px] h-6 sm:h-7 opacity-75">
                  <div className="w-[2px] h-full bg-[#2E2627]" />
                  <div className="w-[4px] h-full bg-[#2E2627]" />
                  <div className="w-[1px] h-full bg-[#2E2627]" />
                  <div className="w-[3px] h-full bg-[#2E2627]" />
                  <div className="w-[2px] h-full bg-[#2E2627]" />
                  <div className="w-[5px] h-full bg-[#2E2627]" />
                  <div className="w-[1px] h-full bg-[#2E2627]" />
                  <div className="w-[3px] h-full bg-[#2E2627]" />
                  <div className="w-[4px] h-full bg-[#2E2627]" />
                  <div className="w-[2px] h-full bg-[#2E2627]" />
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-[#A89A9C] tracking-widest mt-1">BONDBOX-PASS-2026</span>
              </div>

              {/* Romantic Stamp */}
              <div className="px-3 py-1 rounded-full border-2 border-dashed border-[#D66D7D] text-[#D66D7D] font-extrabold text-[10px] sm:text-[11px] transform -rotate-6 shadow-2xs">
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
            className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>💬</span>
            <span>Send on WhatsApp</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copyInviteText}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{copied ? "✓ Copied!" : "💌 Copy Invite Card"}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

