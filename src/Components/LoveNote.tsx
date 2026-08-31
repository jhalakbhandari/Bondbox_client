import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import type { Note, User } from "../types";
import Spinner from "./Spinner";
import WaxSealEnvelope from "./WaxSealEnvelope";
import { formatMemoryDate } from "../utils/media";

type Props = {
  roomId: string;
  roomMembers: User[];
  onClose: () => void;
  fetchLoveNotes: () => void;
  notes: Note[];
};

export default function LoveNoteModal({
  roomId,
  roomMembers,
  onClose,
  fetchLoveNotes,
  notes,
}: Props) {
  const [activeTab, setActiveTab] = useState<"inbox" | "write">("inbox");
  const [noteType] = useState<"text" | "voice" | "doodle">("text");
  const [noteText, setNoteText] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [isInstant, setIsInstant] = useState(true);
  const [unlockDate, setUnlockDate] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLoveNote = async () => {
    if (
      (noteType === "text" && !noteText.trim()) ||
      (noteType !== "text" && !noteFile)
    ) {
      toast.error("Please add content for your love note!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;
    const currentUserId = JSON.parse(atob(token.split(".")[1])).id;

    const receiver = roomMembers.find((u) => u._id !== currentUserId);
    if (!receiver?._id) {
      toast.error("Could not find receiver in this room!");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("receiverId", receiver._id);
    formData.append("roomId", roomId);
    formData.append("type", noteType);
    if (noteType === "text") formData.append("text", noteText);
    if (noteFile) formData.append("file", noteFile);
    formData.append("isInstant", isInstant.toString());
    if (!isInstant && unlockDate) formData.append("unlockTime", unlockDate);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/lovenote`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Secret love note sent! 💌✨");
      setNoteText("");
      setNoteFile(null);
      setIsInstant(true);
      setUnlockDate("");
      fetchLoveNotes();
      setActiveTab("inbox");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send love note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
  };

  const unreadNotes = notes.filter((n) => !n.isRead);
  const readNotes = notes.filter((n) => n.isRead);

  return (
    <>
      <AnimatePresence>
        {selectedNote && (
          <WaxSealEnvelope
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onNoteOpened={() => fetchLoveNotes()}
          />
        )}
      </AnimatePresence>

      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-50 p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="glass-card rounded-3xl w-full max-w-md p-5 sm:p-7 shadow-2xl border border-white/90 flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-pink-100/80 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💌</span>
              <h3
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-400"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Secret Love Notes
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200 text-pink-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="p-1 rounded-2xl bg-pink-100/60 flex gap-1 mb-4">
            <button
              onClick={() => {
                setActiveTab("inbox");
                setSelectedNote(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "inbox"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-600 hover:text-pink-600"
              }`}
            >
              <span>📬 Vault ({notes.length})</span>
              {unreadNotes.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                  {unreadNotes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("write");
                setSelectedNote(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "write"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-600 hover:text-pink-600"
              }`}
            >
              <span>✍️ Write Note</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "inbox" && (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-72">
              {notes.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="text-4xl mb-2">🕊️</div>
                  <p className="text-sm font-semibold text-gray-700">No notes in the vault yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Surprise your partner with a secret note from the "Write Note" tab!
                  </p>
                </div>
              ) : (
                <>
                  {unreadNotes.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[11px] font-bold text-pink-600 uppercase tracking-wider mb-2">
                        ✨ Sealed Letters ({unreadNotes.length})
                      </p>
                      {unreadNotes.map((n) => (
                        <motion.div
                          key={n._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOpenNote(n)}
                          className="p-3.5 mb-2 rounded-2xl bg-gradient-to-r from-pink-100 to-rose-100 text-pink-900 border border-pink-300/80 shadow-sm cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl animate-bounce">💌</span>
                            <div>
                              <p className="text-xs font-bold">Wax-Sealed Letter</p>
                              <p className="text-[10px] text-pink-700">Tap wax seal to open</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-bold">
                            NEW
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {readNotes.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Opened Letters ({readNotes.length})
                      </p>
                      {readNotes.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleOpenNote(n)}
                          className="p-3 mb-2 rounded-2xl bg-white/80 hover:bg-white text-gray-700 border border-pink-100 shadow-xs cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base opacity-70">📜</span>
                            <p
                              className="text-sm truncate max-w-[200px]"
                              style={{ fontFamily: "var(--font-handwriting)" }}
                            >
                              {n.type === "text" ? n.content : "Voice whisper"}
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {formatMemoryDate(n.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "write" && (
            <div className="flex flex-col gap-3">
              {/* Inspiration Prompts */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <span className="text-gray-400 font-medium whitespace-nowrap">✨ Prompts:</span>
                {[
                  "Thinking of you right now 💕",
                  "You made my day brighter ✨",
                  "Can't wait for our next date 🌸",
                  "I love your laugh so much 💖",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setNoteText(prompt)}
                    className="px-2.5 py-0.5 rounded-full bg-pink-100/70 hover:bg-pink-200 text-pink-700 font-semibold whitespace-nowrap transition-colors cursor-pointer border border-pink-200/60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Whisper something sweet, funny, or heartfelt..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none resize-none"
                style={{ fontFamily: "var(--font-handwriting), cursive", fontSize: "1.15rem" }}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitLoveNote}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white font-bold text-sm shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Spinner size={18} thickness={2.5} speed="fast" />
                ) : (
                  <>
                    <span>Seal & Send Love Note</span>
                    <span>💌</span>
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-pink-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Close Vault
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
