import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/bucketlist/${roomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setItems(res.data);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/bucketlist`,
      { roomId, item: newItem },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setItems([...items, res.data]);
    setNewItem("");
    toast.success("Added to bucket list!");
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const token = localStorage.getItem("token");
    const res = await axios.patch(
      `${import.meta.env.VITE_API_URL}/bucketlist/${id}`,
      { completed: !completed },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setItems(items.map((i) => (i._id === id ? res.data : i)));
  };

  const deleteItem = async (id: string) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${import.meta.env.VITE_API_URL}/bucketlist/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(items.filter((i) => i._id !== id));
    toast.info("Removed from bucket list");
  };

  useEffect(() => {
    fetchItems();
  }, [roomId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Our Bucket List
        </h2>

        {/* Input + Add button */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add something to do..."
            className="flex-1 border border-pink-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400"
          />
          <button
            onClick={addItem}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            ➕
          </button>
        </div>

        {/* Items List */}
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {items.map((i) => (
            <li
              key={i._id}
              className="flex items-center justify-between px-3 py-2 bg-pink-100 rounded-lg"
            >
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={i.completed}
                  onChange={() => toggleComplete(i._id, i.completed)}
                  className="w-5 h-5 text-pink-500 rounded border-gray-300 focus:ring-pink-400"
                />
                <span
                  className={`${
                    i.completed ? "line-through text-gray-500" : "text-gray-800"
                  }`}
                >
                  {i.item}
                </span>
              </label>
              <button
                onClick={() => deleteItem(i._id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 rounded-lg py-2 hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
