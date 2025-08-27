import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Timeline.css";
import type { Post, Room } from "../types";

export default function Timeline() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room|null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch room & posts
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const roomRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRoom(roomRes.data);

      const postRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/post/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPosts(postRes.data);
    };
    fetchData();
  }, [roomId]);

  // Add new post (text/photo/both)
  const addPost = async () => {
    if (!text && !photo) return alert("Post cannot be empty");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("roomId", roomId!);
    formData.append("text", text);
    if (photo) formData.append("photo", photo);

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/post`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setPosts([...posts, res.data]);
    setText("");
    setPhoto(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (!room) return <p className="text-center text-pink-500">Loading...</p>;

  return (
    <div className="timeline-container min-h-screen bg-gradient-to-br from-pink-200 via-orange-100 to-pink-300 flex flex-col items-center py-12">
      {/* Settings button */}
      <div className="absolute top-6 right-6" ref={dropdownRef}>
        <button
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          ⚙️
        </button>
        {showDropdown && (
          <div className="absolute right-full top-0 mr-2 bg-white shadow-lg rounded-xl py-2 w-32 text-center">
            <button
              className="block w-full px-4 py-2 hover:bg-pink-100 rounded-lg"
              onClick={logout}
            >
              Logout
            </button>
            <div className="px-2 py-1">
              <p className="text-gray-600 text-sm font-semibold">Room Code</p>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="text-gray-800 font-mono">{room.code}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(room.code)}
                  className="px-2 py-1 text-xs bg-pink-200 rounded-md hover:bg-pink-300"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 drop-shadow-lg mb-10 animate-pulse">
        {room.name || "BondBox"}
      </h2>

      {/* Post input */}
      <div className="post-input flex gap-3 mb-10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="✨ Write something magical..."
          className="rounded-xl px-4 py-2 border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/80 backdrop-blur-sm"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
          className="rounded-xl px-2 py-1 border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/80"
        />
        <button
          onClick={addPost}
          className="px-5 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 to-orange-400 shadow-lg hover:scale-105 transition-transform"
        >
          Post
        </button>
      </div>

      {/* Timeline */}
      <div className="relative mx-auto max-w-2xl">
        {/* dreamy glowing line */}
        <div className="absolute left-1/2 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-pink-400 via-orange-300 to-pink-500 shadow-[0_0_15px_rgba(255,192,203,0.7)]"></div>

        {posts.map((p, i) => (
          <div
            key={p._id}
            className={`mb-12 flex w-full items-center ${
              i % 2 === 0 ? "post-left" : "post-right"
            }`}
          >
            <div className="post">
              <div className="post-dot"></div>
              <div className="post-content">
                {p.text && <p className="post-text">{p.text}</p>}
                {p.photo && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${p.photo}`}
                    alt="Post"
                    className="mt-2 rounded-xl max-w-full"
                  />
                )}
                <span className="post-date">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
