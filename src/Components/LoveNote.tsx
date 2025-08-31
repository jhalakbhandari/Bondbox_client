import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import type { User } from "../types";

type Props = {
  roomId: string;
  roomMembers: User[];
  onClose: () => void;
  fetchLoveNotes: () => void;
  notes: any[]; // notes from Timeline
};

export default function LoveNoteModal({
  roomId,
  roomMembers,
  onClose,
  fetchLoveNotes,
  notes,
}: Props) {
  const [noteType, setNoteType] = useState<"text" | "voice" | "doodle">("text");
  const [noteText, setNoteText] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [isInstant, setIsInstant] = useState(true);
  const [unlockDate, setUnlockDate] = useState("");

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
      toast.error("Could not find receiver!");
      return;
    }

    const formData = new FormData();
    formData.append("receiverId", receiver._id);
    formData.append("roomId", roomId);
    formData.append("type", noteType);
    if (noteType === "text") formData.append("text", noteText);
    if (noteFile) formData.append("file", noteFile);
    formData.append("isInstant", isInstant.toString());
    if (!isInstant) formData.append("unlockTime", unlockDate);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/lovenote`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Love note sent! 💌");
      onClose();
      setNoteText("");
      setNoteFile(null);
      setIsInstant(true);
      setUnlockDate("");
      fetchLoveNotes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send love note!");
    }
  };

  const handleOpenNote = async (note: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    toast.info(note.type === "text" ? note.content : "📎 File note");

    try {
      // mark as read for both receiver and notify sender
      await axios.post(
        `${import.meta.env.VITE_API_URL}/lovenote/read/${note._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLoveNotes();
    } catch (err) {
      console.error("Failed to mark note as read", err);
      toast.error("Failed to open note!");
    }
  };
  const unreadNotes = notes.filter((n) => !n.isRead);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg flex flex-col">
        <h3 className="text-xl font-bold mb-4 text-pink-600 text-center">
          💌 Love Notes
        </h3>

        <div className="flex-1 overflow-y-auto mb-3 max-h-60 border rounded-lg p-2">
          {unreadNotes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">No notes yet</p>
          ) : (
            unreadNotes.map((n) => (
              <div
                key={n._id}
                className="p-2 mb-2 rounded-lg bg-pink-100 text-pink-800 cursor-pointer"
                onClick={() => handleOpenNote(n)}
              >
                {n.type === "text"
                  ? "💌 Click to open"
                  : "📎 Click to open file"}
              </div>
            ))
          )}
        </div>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write a secret note..."
          className="w-full px-3 py-2 border rounded-lg mb-3"
        />

        <div className="flex justify-between gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={submitLoveNote}
            className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
