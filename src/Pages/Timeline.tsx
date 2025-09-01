import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import "./Timeline.css";
import type { Note, Post, Room } from "../types";
import { Flip, toast } from "react-toastify";
import PostCard from "../Components/PostCard";
import LoveNoteModal from "../Components/LoveNote";
import io from "socket.io-client"; // ✅ works for most setups

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
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("");
  // const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  // const [ setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const sessionId = localStorage.getItem("session");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loveNotes, setLoveNotes] = useState<Note[]>([]);
  // const socketRef = useRef<Socket | null>(null);

  //Note
  // Love Notes
  const [showLoveNotesModal, setShowLoveNotesModal] = useState(false);

  const fetchLoveNotes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/lovenote/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Directly assign res.data
      const notes = res.data || [];
      setLoveNotes(notes);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch love notes on mount
  useEffect(() => {
    fetchLoveNotes();
  }, [roomId]);

  const navigate = useNavigate();
  // const timeline = [];

  // Group posts by sessionId
  const sessionMap: Record<string, { label: string; posts: Post[] }> = {};
  const standalonePosts: Post[] = [];

  posts.forEach((p) => {
    if (p.sessionId && p.sessionId._id) {
      // <-- check _id, not _is
      if (!sessionMap[p.sessionId._id]) {
        sessionMap[p.sessionId._id] = {
          label: p.sessionId.label || "",
          posts: [],
        };
      }
      sessionMap[p.sessionId._id].posts.push(p);
    } else {
      standalonePosts.push(p);
    }
  });

  // Build timeline: sessions + standalone posts
  const timeline: {
    type: "session" | "post";
    label?: string;
    posts?: Post[];
    post?: Post;
  }[] = [];

  // Push sessions
  Object.values(sessionMap).forEach((s) => {
    timeline.push({ type: "session", label: s.label, posts: s.posts });
  });

  // Push standalone posts
  standalonePosts.forEach((p) => {
    timeline.push({ type: "post", post: p });
  });

  // Sort by createdAt
  timeline.sort((a, b) => {
    const aTime =
      a.type === "session"
        ? new Date(a.posts![0].createdAt).getTime()
        : new Date(a.post!.createdAt).getTime();
    const bTime =
      b.type === "session"
        ? new Date(b.posts![0].createdAt).getTime()
        : new Date(b.post!.createdAt).getTime();
    return bTime - aTime;
  });
  const fetchActiveSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/session/active/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setIsSessionActive(true);
        setCurrentSessionId(res.data._id);
        setSessionLabel(res.data.label);
        localStorage.setItem("session", res.data._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    setRoom({
      ...roomRes.data,
      members: roomRes.data.users,
    });
    const postRes = await axios.get(
      `${import.meta.env.VITE_API_URL}/post/${roomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setPosts(postRes.data);
  };
  async function startSession() {
    if (!sessionLabel.trim()) {
      toast.error("Please enter a label for your session!");
      return;
    }

    if (isSessionActive) return; // already active

    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/session/start`,
      { roomId, label: sessionLabel },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCurrentSessionId(res.data._id);
    localStorage.setItem("session", res.data._id);
    setIsSessionActive(true);
    toast.success(`Started session: ${sessionLabel}`);
  }

  async function finishSession() {
    if (!isSessionActive || !currentSessionId) return;

    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("session");

    await axios.post(
      `${import.meta.env.VITE_API_URL}/session/finish/${sessionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setIsSessionActive(false);
    setSessionLabel("");
    setCurrentSessionId(null);
    localStorage.removeItem("session");
  }

  // Fetch room & posts
  // Call it on mount
  useEffect(() => {
    fetchData();
    fetchActiveSession();
  }, [roomId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id;

    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket", "polling"],
    });

    socket.emit("register", userId);

    socket.on("newLoveNote", (note: Note) => {
      console.log("Received new love note:", note);
      setLoveNotes((prev) => [...prev, note]);
      toast.info("💌 You received a new love note!");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;
  //   console.log("token", token);

  //   try {
  //     const payloadBase64 = token.split(".")[1];
  //     const payload = JSON.parse(atob(payloadBase64));
  //     const userId = payload.id; // or payload._id depending on your backend
  //     console.log("Frontend uaserId:", userId);

  //     if (!userId) return;

  //     // Only initialize socket once
  //     if (!socketRef.current) {
  //       const socket = io(`${import.meta.env.VITE_API_URL}/lovenote`, {
  //         transports: ["websocket", "polling"], // force websocket fallback
  //       });
  //       socketRef.current = socket;

  //       // Register user
  //       socket.emit("register", userId);

  //       // Listen for new love notes
  //       socket.on("newLoveNote", (note) => {
  //         console.log("Received newLoveNote:", note); // ✅ log it first

  //         toast.info("💌 You received a new love note!");
  //         fetchLoveNotes(); // refresh notes list
  //       });
  //     }

  //     return () => {
  //       socketRef.current?.disconnect();
  //     };
  //   } catch (err) {
  //     console.error("Invalid token", err);
  //   }
  // }, []); // empty dependency ensures it runs only once on mount

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
    const currentSession = localStorage.getItem("session");

    if (isSessionActive) {
      formData.append("sessionId", currentSession || ""); // <-- session created from backend
    }
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
        // setAudioBlob(blob);
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
    // setAudioBlob(null);
    setMediaType(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (!room) return <p className="text-center text-pink-500">Loading...</p>;

  return (
    <div className="timeline-container min-h-screen bg-gradient-to-br from-pink-200 via-orange-100 to-pink-300 flex flex-col items-center py-8 px-4 md:py-12 md:px-0 w-full">
      {/* Header row: Love Notes, Title, Settings */}

      <div className="flex w-full max-w-4xl items-center justify-between mb-6 px-4 md:px-0">
        <button
          onClick={() => {
            setShowLoveNotesModal(true);
            setUnreadCount(0);
          }}
          className="relative px-3 py-2 bg-pink-400 text-white rounded-lg shadow hover:bg-pink-500"
        >
          💌
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </button>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 drop-shadow-lg animate-pulse text-center flex-1">
          {room.name || "BondBox"}
        </h2>

        <div className="relative" ref={dropdownRef}>
          <button
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            ⚙️
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-xl py-2 w-40 text-center z-50 flex flex-col gap-2">
              {!isSessionActive ? (
                <button
                  className="block w-full px-4 py-2 hover:bg-pink-100 rounded-lg"
                  onClick={() => setShowSessionModal(true)}
                >
                  ▶ Start Session
                </button>
              ) : (
                <button
                  className="block w-full px-4 py-2 hover:bg-red-100 rounded-lg"
                  onClick={finishSession}
                >
                  ⏹ Finish Session
                </button>
              )}
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
      </div>

      {/* Session Label Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-pink-600 text-center">
              Enter Session Name
            </h3>
            <input
              type="text"
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              placeholder="e.g. Spain Trip"
              className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
            />
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setShowSessionModal(false)}
                className="flex-1 px-3 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  startSession();
                  setShowSessionModal(false);
                }}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Love Note Modal */}
      {showLoveNotesModal && (
        <LoveNoteModal
          roomId={roomId!}
          roomMembers={room.users || []}
          onClose={() => setShowLoveNotesModal(false)}
          fetchLoveNotes={fetchLoveNotes}
          notes={loveNotes}
        />
      )}

      {/* Post input */}
      <div className="mb-8 sm:mb-10 w-full max-w-2xl lg:max-w-2xl bg-white/60 p-3 rounded-xl shadow-md">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="✨ Write something magical..."
          className="w-full rounded-lg px-4 py-2 border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/80 resize-none"
        />
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

        <div className="flex gap-3 mt-4">
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

          <button
            onClick={addPost}
            className="flex-1 px-3 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-pink-500 to-orange-400 shadow hover:scale-105 transition"
          >
            🚀 Post
          </button>
        </div>
      </div>

      {/* Timeline */}
      {/* Timeline */}
      <div className="timeline relative w-full max-w-5xl flex flex-col items-center space-y-12">
        {/* Center vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-pink-400/40 transform -translate-x-1/2 z-0"></div>

        {timeline.map((item, idx) =>
          item.type === "session" ? (
            <div key={idx} className="w-full relative z-10">
              {/* <h3 className="text-2xl font-bold text-center text-pink-600 mb-6 bg-orange-100 p-2 w-full max-w-md mx-auto">
                {item.label}
              </h3> */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-3 w-5 h-5 rounded-full bg-pink-500 border-4 border-white z-20 shadow" />
                <h3 className="text-2xl font-bold text-center text-pink-600 bg-orange-100 px-4 py-2 rounded-xl shadow-md">
                  {item.label}
                </h3>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {item.posts!.map((p, i) => (
                  <div
                    key={p._id}
                    className={`flex relative ${
                      i % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
                  >
                    <PostCard post={p} flip={i % 2 === 0} />
                  </div>
                ))}
              </div> */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
              {item.posts!.map((p, i) => (
                <div
                  key={p._id}
                  className={`w-full relative z-10 flex ${
                    i % 2 === 0
                      ? "justify-end md:pr-12"
                      : "justify-start md:pl-12"
                  }`}
                >
                  <div className="hidden sm:block absolute left-1/2 top-6 sm:top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-pink-400 border-2 border-white z-20"></div>

                  <PostCard post={p} flip={i % 2 === 0} />
                </div>
              ))}
            </div>
          ) : (
            // </div>
            // <div
            //   key={item.post!._id}
            //   className={`w-full relative z-10 flex ${
            //     idx % 2 === 0 ? "justify-start" : "justify-end"
            //   }`}
            // >
            //   <PostCard post={item.post!} flip={idx % 2 === 0} />
            // </div>
            <div
              key={item.post!._id}
              className={`w-full relative z-10 flex ${
                idx % 2 === 0
                  ? "justify-end md:pr-12"
                  : "justify-start md:pl-12"
              }`}
            >
              <div className="hidden sm:block absolute left-1/2 top-6 sm:top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-pink-400 border-2 border-white z-20"></div>

              <PostCard post={item.post!} flip={idx % 2 === 0} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
