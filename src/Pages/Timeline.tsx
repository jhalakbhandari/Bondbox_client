import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import "./Timeline.css";
import type { Post, Room } from "../types";
import { Flip, toast } from "react-toastify";

export default function Timeline() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [text, setText] = useState("");
  // const [photo, setPhoto] = useState<File | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // const [photo, setPhoto] = useState<File | null>(null);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<
    "photo" | "video" | "audio" | null
  >(null);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
  // Fetch room & posts
  useEffect(() => {
    fetchData();
  }, [roomId]);

  // Add new post (text/photo/both)
  const addPost = async () => {
    if (
      !text.trim() &&
      !(
        media &&
        (mediaType === "photo" ||
          mediaType === "video" ||
          mediaType === "audio")
      )
    ) {
      toast("You haven't created a memory yet!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Flip,
      });
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("roomId", roomId!);
    formData.append("text", text);

    if (media && mediaType === "photo") formData.append("photo", media);
    if (media && mediaType === "video") formData.append("video", media);
    if (media && mediaType === "audio") formData.append("audio", media);

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
    clearMedia();
    fetchData();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setMedia(new File([blob], "voice-note.webm", { type: "audio/webm" }));
        setMediaType("audio");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Clear media
  const clearMedia = () => {
    setMedia(null);
    setAudioBlob(null);
    setMediaType(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (!room) return <p className="text-center text-pink-500">Loading...</p>;

  return (
    <div className="timeline-container min-h-screen bg-gradient-to-br from-pink-200 via-orange-100 to-pink-300 flex flex-col items-center py-8 px-4 md:py-12 md:px-0">
      {/* Settings button */}
      <div
        className="absolute top-4 right-4 md:top-6 md:right-6"
        ref={dropdownRef}
      >
        <button
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          ⚙️
        </button>
        {showDropdown && (
          <div className="absolute right-full top-0 mr-2 bg-white shadow-lg rounded-xl py-2 w-32 text-center z-50">
            <button
              className="block w-full px-4 py-2 hover:bg-pink-100 rounded-lg"
              onClick={logout}
            >
              Logout
            </button>
            <div className="px-2 py-1">
              <p className="text-gray-600 text-sm font-semibold">Room Code</p>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="text-gray-800 font-mono truncate">
                  {room.code}
                </span>
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

      <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 drop-shadow-lg mb-8 sm:mb-10 animate-pulse text-center">
        {room.name || "BondBox"}
      </h2>

      {/* Post input row */}
      <div className="mb-8 sm:mb-10 w-full max-w-2xl lg:max-w-2xl bg-white/60 p-3 rounded-xl shadow-md">
        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="✨ Write something magical..."
          className="w-full rounded-lg px-4 py-2 border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/80 resize-none"
        />

        {/* Media preview (only when audio recorded or file selected) */}
        {media && mediaType === "audio" && (
          <div className="mt-3">
            <audio
              controls
              src={URL.createObjectURL(media)}
              className="w-full"
            />
          </div>
        )}
        {media && mediaType === "photo" && (
          <div className="mt-3">
            <img
              src={URL.createObjectURL(media)}
              alt="Preview"
              className="rounded-lg max-h-48"
            />
          </div>
        )}
        {media && mediaType === "video" && (
          <div className="mt-3">
            <video
              controls
              className="rounded-lg max-h-48 w-full"
              src={URL.createObjectURL(media)}
            />
          </div>
        )}

        {/* Action buttons row */}
        <div className="flex gap-3 mt-4">
          {/* Upload button (hidden file input) */}
          {!isRecording && !media && (
            <>
              <input
                type="file"
                id="mediaUpload"
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setMedia(file);
                    if (file.type.startsWith("image")) setMediaType("photo");
                    else if (file.type.startsWith("video"))
                      setMediaType("video");
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="mediaUpload"
                className="flex-1 px-3 py-2 bg-pink-200 text-pink-800 rounded-lg text-center cursor-pointer hover:bg-pink-300"
              >
                📁 Upload
              </label>
            </>
          )}

          {/* Record / Stop / Remove */}
          <div className="flex-1">
            {!isRecording && !media ? (
              <button
                onClick={startRecording}
                className="w-full px-3 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600"
              >
                🎤 Record
              </button>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full px-3 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
              >
                ⏹ Stop
              </button>
            ) : (
              <button
                onClick={clearMedia}
                className="w-full px-3 py-2 bg-gray-300 text-black rounded-lg shadow hover:bg-gray-400"
              >
                ❌ Remove
              </button>
            )}
          </div>

          {/* Post button */}
          <button
            onClick={addPost}
            className="flex-1 px-3 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-pink-500 to-orange-400 shadow hover:scale-105 transition"
          >
            🚀 Post
          </button>
        </div>
      </div>

      {/* Preview for selected media */}
      {/* {media && (
        <div className="mt-3 w-full max-w-2xl lg:max-w-3xl flex justify-start">
          {mediaType === "photo" && (
            <img
              src={URL.createObjectURL(media)}
              alt="Preview"
              className="rounded-lg max-h-48"
            />
          )}
          {mediaType === "video" && (
            <video
              controls
              className="rounded-lg max-h-48"
              src={URL.createObjectURL(media)}
            />
          )}
          {mediaType === "audio" && (
            <audio controls src={URL.createObjectURL(media)} />
          )}
        </div>
      )} */}

      {/* Timeline */}
      <div className="relative mx-auto w-full max-w-md sm:max-w-2xl">
        {/* vertical line */}
        <div className="absolute left-1/2 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-pink-400 via-orange-300 to-pink-500 shadow-[0_0_15px_rgba(255,192,203,0.7)] hidden sm:block"></div>

        {posts.map((p, i) => (
          <div
            key={p._id}
            className={`mb-8 flex w-full flex-col items-center sm:flex-row ${
              i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
            }`}
          >
            <div className="post flex flex-col w-full sm:w-1/2 px-2">
              <div className="post-content bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md w-full break-words ">
                {p.text && (
                  <p className="post-text text-gray-800 pb-4">{p.text}</p>
                )}
                {/* {p.photo && (
                  <img
                    src={p.photo}
                    alt="Post"
                    className="mt-2 rounded-xl max-w-full"
                  />
                )} */}
                {p.photo && (
                  <img
                    src={p.photo}
                    alt="Post"
                    className="mt-2 rounded-xl max-w-full"
                  />
                )}
                {p.audio && (
                  <audio controls className="mt-2 w-full">
                    <source src={p.audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                {p.video && (
                  <video controls className="mt-2 rounded-xl w-full max-h-96">
                    <source src={p.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <span className="post-date text-xs text-gray-500 mt-1 block">
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
