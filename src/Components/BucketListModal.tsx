import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Spinner from "./Spinner";

export default function BucketListModal({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) {
  const [items, setItems] = useState<
    { _id: string; item: string; completed: boolean }[]
  >([]);
  const [newItem, setNewItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/bucketlist/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/bucketlist`,
        { roomId, item: newItem.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setItems((prev) => [...prev, res.data]);
      setNewItem("");
      toast.success("Dream added to bucket list! 🌟");
    } catch (err) {
      toast.error("Failed to add bucket list item");
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/bucketlist/${id}`,
        { completed: !completed },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setItems((prev) => prev.map((i) => (i._id === id ? res.data : i)));
      if (!completed) {
        toast("🎉 Dream achieved together! 🌸", {
          autoClose: 2000,
        });
      }
    } catch (err) {
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/bucketlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.info("Removed from list");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [roomId]);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex justify-center items-center z-50 p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="glass-card rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-white/95 flex flex-col max-h-[85vh] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F9D2D9] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2
              className="text-2xl font-bold text-[#2E2627]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Our Bucket List
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#D66D7D] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer border border-[#F9D2D9]"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF5F7] to-[#FAF0E6] border border-[#F9D2D9]">
            <div className="flex justify-between text-xs font-bold text-[#4A3E40] mb-1.5">
              <span>Dreams Fulfilled Together</span>
              <span className="text-[#D66D7D] font-extrabold">{completedCount} of {items.length} ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-[#F3E6E8] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#D66D7D] via-[#E07A8A] to-[#F7BA9E] rounded-full"
              />
            </div>
          </div>
        )}

        {/* Input + Add button */}
        <div className="flex flex-col gap-2.5 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Add a dream to fulfill together..."
              className="flex-1 px-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm font-medium focus:outline-none placeholder:text-[#A89A9C]"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={addItem}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white rounded-2xl font-bold shadow-md shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all cursor-pointer text-xs sm:text-sm whitespace-nowrap active:scale-95 flex items-center gap-1"
            >
              <span>➕</span>
              <span>Add</span>
            </motion.button>
          </div>

          {/* Quick Idea Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-[#A89A9C] font-semibold whitespace-nowrap">💡 Ideas:</span>
            {[
              "✈️ Paris trip",
              "🍕 Candlelight dinner",
              "🏕️ Stargazing night",
              "🎵 Live concert",
              "🚲 Sunset bike ride",
            ].map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setNewItem(idea)}
                className="px-2.5 py-0.5 rounded-full bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#D66D7D] font-bold whitespace-nowrap transition-colors cursor-pointer border border-[#F9D2D9] active:scale-95"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-64">
          {isLoading ? (
            <div className="text-center py-8">
              <Spinner size={28} thickness={3} speed="normal" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 px-4 text-[#A89A9C] text-xs">
              <p className="text-3xl mb-2">🎈</p>
              <p className="font-bold text-[#4A3E40]">No dreams listed yet</p>
              <p className="mt-1">Add trips, date nights, or goals you want to experience together!</p>
            </div>
          ) : (
            <AnimatePresence>
              {items.map((i) => (
                <motion.div
                  key={i._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${
                    i.completed
                      ? "bg-[#FAF6F0]/70 border-[#F9D2D9]/60 opacity-60"
                      : "bg-white/95 border-[#F9D2D9] shadow-2xs hover:border-[#D66D7D]"
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                    <input
                      type="checkbox"
                      checked={i.completed}
                      onChange={() => toggleComplete(i._id, i.completed)}
                      className="w-4 h-4 text-[#D66D7D] rounded border-[#F9D2D9] focus:ring-[#D66D7D] accent-[#D66D7D] cursor-pointer"
                    />
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        i.completed
                          ? "line-through text-[#A89A9C]"
                          : "text-[#2E2627]"
                      }`}
                    >
                      {i.item}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteItem(i._id)}
                    className="text-[#A89A9C] hover:text-[#9E2A42] text-xs p-1 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#F9D2D9]/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A6B6D] hover:bg-[#FFF5F7] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

