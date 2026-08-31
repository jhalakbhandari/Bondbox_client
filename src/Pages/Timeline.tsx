import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import type { Note, Post, Room } from "../types";
import { Flip, toast } from "react-toastify";
import PostCard from "../Components/PostCard";
import LoveNoteModal from "../Components/LoveNote";
import io from "socket.io-client";
import BucketListModal from "../Components/BucketListModal";
import GoldenTicketModal from "../Components/GoldenTicketModal";
import BondWrappedModal from "../Components/BondWrappedModal";
import ScrapbookView from "../Components/ScrapbookView";
import GuidedTourModal from "../Components/GuidedTourModal";
import BuyMeCoffeeModal from "../Components/BuyMeCoffeeModal";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "../Components/Spinner";

export default function Timeline() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<"stream" | "scrapbook">(() => {
    return (localStorage.getItem("timeline_view") as "stream" | "scrapbook") || "stream";
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [text, setText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video" | "audio" | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGoldenTicketModal, setShowGoldenTicketModal] = useState(false);
  const [showBondWrappedModal, setShowBondWrappedModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loveNotes, setLoveNotes] = useState<Note[]>([]);
  const [showBucketListModal, setShowBucketListModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showLoveNotesModal, setShowLoveNotesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

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
      const notes = res.data || [];
      setLoveNotes(notes);
      const unread = notes.filter((n: Note) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching love notes:", err);
    }
  };

  const fetchMorePosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/post/${roomId}?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newItems = res.data.posts || [];
      setPosts((prev) => [...prev, ...newItems]);
      setHasMore(res.data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching more posts:", err);
    }
  };

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
      console.error("Error fetching active session:", err);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    setIsLoading(true);
    try {
      const roomRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoom({
        ...roomRes.data,
        members: roomRes.data.users,
      });

      const postRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/post/${roomId}?page=1&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(postRes.data.posts || []);
      setHasMore(postRes.data.hasMore);
      setPage(2);
    } catch (err) {
      console.error("Error fetching timeline data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLoveNotes();
    fetchActiveSession();

    const hasSeenTour = localStorage.getItem("has_seen_tour");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setShowTourModal(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [roomId]);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      const socket = io(import.meta.env.VITE_API_URL, {
        transports: ["websocket", "polling"],
      });

      socket.emit("register", userId);

      socket.on("newLoveNote", (note: Note) => {
        setLoveNotes((prev) => [...prev, note]);
        setUnreadCount((c) => c + 1);
        toast("💌 You received a new love note!", {
          position: "top-center",
          autoClose: 3500,
          theme: "light",
          transition: Flip,
        });
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.error("Socket error", e);
    }
  }, []);

  // Group posts by session
  const sessionMap: Record<
    string,
    {
      id: string;
      label: string;
      startedAt?: string;
      finishedAt?: string;
      posts: Post[];
    }
  > = {};
  const standalonePosts: Post[] = [];

  posts.forEach((p) => {
    if (p.sessionId && p.sessionId._id) {
      const sId = p.sessionId._id;
      if (!sessionMap[sId]) {
        sessionMap[sId] = {
          id: sId,
          label: p.sessionId.label || "Chapter",
          startedAt: p.sessionId.startedAt,
          finishedAt: p.sessionId.finishedAt,
          posts: [],
        };
      }
      sessionMap[sId].posts.push(p);
    } else {
      standalonePosts.push(p);
    }
  });

  const timeline: {
    type: "session" | "post";
    sessionId?: string;
    label?: string;
    startedAt?: string;
    finishedAt?: string;
    posts?: Post[];
    post?: Post;
  }[] = [];

  Object.values(sessionMap).forEach((s) => {
    timeline.push({
      type: "session",
      sessionId: s.id,
      label: s.label,
      startedAt: s.startedAt,
      finishedAt: s.finishedAt,
      posts: s.posts,
    });
  });

  standalonePosts.forEach((p) => {
    timeline.push({ type: "post", post: p });
  });

  timeline.sort((a, b) => {
    const aTime =
      a.type === "session"
        ? new Date(a.posts![0]?.createdAt || 0).getTime()
        : new Date(a.post!.createdAt).getTime();
    const bTime =
      b.type === "session"
        ? new Date(b.posts![0]?.createdAt || 0).getTime()
        : new Date(b.post!.createdAt).getTime();
    return bTime - aTime;
  });

  async function startSession() {
    if (!sessionLabel.trim()) {
      toast.error("Please enter a label for your session!");
      return;
    }

    if (isSessionActive) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/session/start`,
        { roomId, label: sessionLabel.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentSessionId(res.data._id);
      localStorage.setItem("session", res.data._id);
      setIsSessionActive(true);
      toast.success(`✨ Started new chapter: "${sessionLabel}"`);
      fetchData();
    } catch (err) {
      toast.error("Failed to start session");
    }
  }

  async function finishSession() {
    if (!isSessionActive || !currentSessionId) return;

    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("session");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/session/finish/${sessionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSessionActive(false);
      setSessionLabel("");
      setCurrentSessionId(null);
      localStorage.removeItem("session");
      toast.success("🏁 Chapter concluded and saved to your story!");
      fetchData();
    } catch (err) {
      toast.error("Failed to end session");
    }
  }

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
        autoClose: 3500,
        theme: "light",
        transition: Flip,
      });
      return;
    }

    setIsPosting(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("roomId", roomId!);
    formData.append("text", text);
    const currentSession = localStorage.getItem("session");

    if (isSessionActive) {
      formData.append("sessionId", currentSession || "");
    }
    if (media && mediaType === "photo") formData.append("photo", media);
    if (media && mediaType === "video") formData.append("video", media);
    if (media && mediaType === "audio") formData.append("audio", media);

    try {
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
      setPosts((prev) => [res.data, ...prev]);
      setText("");
      clearMedia();
      toast.success("Memory captured forever! ✨");
    } catch (err) {
      toast.error("Failed to post memory");
    } finally {
      setIsPosting(false);
    }
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
        setMedia(new File([blob], "voice-whisper.webm", { type: "audio/webm" }));
        setMediaType("audio");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaType(null);
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handleCopyCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roomId");
    localStorage.removeItem("session");
    navigate("/auth");
  };

  if (isLoading && !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100">
        <Spinner size={54} thickness={4} speed="fast" label="Opening memory vault..." />
        <p className="mt-4 text-sm font-semibold text-pink-600 animate-pulse">
          Opening your sanctuary... ✨
        </p>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100 flex flex-col items-center py-6 px-3 sm:px-6 md:py-10">
      {/* Ambient background glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Top Floating Glass Navigation Bar */}
      <header className="relative z-40 w-full max-w-4xl glass-card rounded-3xl px-4 py-3 sm:px-6 sm:py-4 mb-6 shadow-xl border border-white/80 flex items-center justify-between">
        {/* Left: Love Note Trigger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowLoveNotesModal(true);
            setUnreadCount(0);
          }}
          className="relative px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/20 hover:shadow-pink-500/35 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>💌</span>
          <span className="hidden sm:inline">Love Notes</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* Center: Sanctuary Room Name & Days Milestone Badge */}
        <div className="text-center flex-1 px-2 flex flex-col items-center">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {room.name || "BondBox"}
          </h2>
          <button
            onClick={() => setShowBondWrappedModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-pink-100 to-orange-100 border border-pink-200 text-[11px] font-bold text-pink-700 tracking-wide mt-1 hover:scale-105 transition shadow-xs cursor-pointer"
            title="View Our Bond Wrapped Story"
          >
            <span>🌸 Day {Math.max(1, Math.ceil(Math.abs(new Date().getTime() - new Date(room.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))} of Us</span>
            <span>•</span>
            <span>📊 Our Story</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGoldenTicketModal(true)}
            className="hidden sm:flex px-3 py-2 rounded-2xl glass-pill text-xs font-bold text-amber-800 hover:text-amber-900 hover:border-amber-300 transition-colors items-center gap-1.5 cursor-pointer bg-amber-50/70"
            title="Invite with Boarding Pass"
          >
            <span>🎟️</span>
            <span>Invite Pass</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBucketListModal(true)}
            className="hidden sm:flex px-3 py-2 rounded-2xl glass-pill text-xs font-bold text-gray-700 hover:text-pink-600 transition-colors items-center gap-1 cursor-pointer"
          >
            <span>✨</span>
            <span>Bucket List</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCoffeeModal(true)}
            className="hidden sm:flex px-3 py-2 rounded-2xl glass-pill text-xs font-bold text-amber-900 hover:text-amber-950 hover:border-amber-400 transition-colors items-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-100/90 to-orange-100/90 shadow-2xs"
            title="Buy Us a Coffee"
          >
            <span className="animate-bounce">☕</span>
            <span>Buy Coffee</span>
          </motion.button>

          {/* Settings / Menu Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-lg hover:border-pink-300 transition-all cursor-pointer shadow-sm"
              title="Menu & Settings"
            >
              ⚙️
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl p-2.5 shadow-2xl border border-white/90 z-50 flex flex-col gap-1 text-xs font-semibold"
                >
                  {/* Timeline View Layout Mode Switch */}
                  <div className="p-2.5 rounded-xl bg-pink-50/80 mb-1 border border-pink-100/90">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">
                        Timeline Layout
                      </span>
                      <span className="text-[10px] font-bold text-pink-600">
                        {viewMode === "stream" ? "📜 Feed" : "📖 Album"}
                      </span>
                    </div>
                    <div className="flex bg-white/90 p-0.5 rounded-xl border border-pink-200/70 shadow-inner">
                      <button
                        onClick={() => {
                          setViewMode("stream");
                          localStorage.setItem("timeline_view", "stream");
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          viewMode === "stream"
                            ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xs"
                            : "text-gray-600 hover:text-pink-600"
                        }`}
                      >
                        <span>📜</span>
                        <span>Feed</span>
                      </button>
                      <button
                        onClick={() => {
                          setViewMode("scrapbook");
                          localStorage.setItem("timeline_view", "scrapbook");
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          viewMode === "scrapbook"
                            ? "bg-gradient-to-r from-pink-500 via-rose-400 to-amber-500 text-white shadow-xs"
                            : "text-gray-600 hover:text-pink-600"
                        }`}
                      >
                        <span>📖</span>
                        <span>Scrapbook</span>
                      </button>
                    </div>
                  </div>

                  <button
                    className="w-full text-left px-3 py-2 rounded-xl text-amber-900 hover:bg-amber-100/70 transition-colors flex items-center gap-2 cursor-pointer bg-amber-50/50"
                    onClick={() => {
                      setShowCoffeeModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <span>☕</span> Buy Us a Coffee & Support
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 transition-colors flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      setShowGoldenTicketModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <span>🎟️</span> Golden Ticket Invite
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 rounded-xl text-pink-700 hover:bg-pink-100/70 transition-colors flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      setShowBondWrappedModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <span>📊</span> Our Bond Wrapped Story
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 rounded-xl text-gray-700 hover:bg-pink-100/70 transition-colors flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      setShowBucketListModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <span>✨</span> Our Bucket List
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 rounded-xl text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      setShowTourModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <span>💡</span> Sanctuary Guided Tour
                  </button>

                  {!isSessionActive ? (
                    <button
                      className="w-full text-left px-3 py-2 rounded-xl text-gray-700 hover:bg-pink-100/70 transition-colors flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        setShowSessionModal(true);
                        setShowDropdown(false);
                      }}
                    >
                      <span>▶</span> Start Trip / Chapter
                    </button>
                  ) : (
                    <button
                      className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-100/70 transition-colors flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        finishSession();
                        setShowDropdown(false);
                      }}
                    >
                      <span>⏹</span> Finish Chapter
                    </button>
                  )}

                  <div className="my-1 border-t border-pink-100/80" />

                  {/* Room Code with Copy */}
                  <div className="p-2 rounded-xl bg-pink-50/70 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Room Key</p>
                      <p className="font-mono text-xs font-bold text-pink-600">{room.code}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCode(room.code)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white border border-pink-200 text-pink-700 shadow-xs hover:bg-pink-100 transition-colors cursor-pointer"
                    >
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>

                  <button
                    className="w-full text-left px-3 py-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer mt-1"
                    onClick={logout}
                  >
                    <span>🚪</span> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Active Session Ribbon Banner */}
      {isSessionActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-30 w-full max-w-2xl mb-6 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/90 via-rose-400/90 to-orange-400/90 text-white shadow-lg backdrop-blur-md flex items-center justify-between text-xs sm:text-sm font-semibold"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>📍 Active Chapter: <strong>{sessionLabel}</strong></span>
          </div>
          <button
            onClick={finishSession}
            className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            End Chapter
          </button>
        </motion.div>
      )}

      {/* Memory Composer Box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-30 w-full max-w-2xl glass-card rounded-3xl p-4 sm:p-6 shadow-xl border border-white/80 mb-10"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-gray-700 tracking-wide flex items-center gap-1.5">
            <span>📸</span>
            <span>Capture a New Memory</span>
          </span>
          {isSessionActive && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold border border-pink-200">
              🏷️ Tagged: {sessionLabel}
            </span>
          )}
        </div>

        {/* Whimsical Inspiration Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 no-scrollbar text-[11px]">
          <span className="text-gray-400 font-medium whitespace-nowrap">✨ Ideas:</span>
          {[
            "Today with you 🌸",
            "A moment I loved 💕",
            "Remember this? ✨",
            "Our sweet adventure 🏕️",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setText((prev) => (prev ? `${prev} ${prompt}` : prompt))}
              className="px-2.5 py-0.5 rounded-full bg-pink-100/70 hover:bg-pink-200 text-pink-700 font-semibold whitespace-nowrap transition-colors cursor-pointer border border-pink-200/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="✨ Write a sweet note, polaroid caption, or funny thought..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none resize-none"
        />

        {/* Previews */}
        {media && mediaType === "photo" && (
          <div className="relative mt-3 inline-block">
            <img
              src={URL.createObjectURL(media)}
              alt="Preview"
              className="rounded-2xl max-h-48 object-cover shadow-md border-2 border-white"
            />
            <button
              onClick={clearMedia}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600 cursor-pointer"
              title="Remove"
            >
              ✕
            </button>
          </div>
        )}

        {media && mediaType === "video" && (
          <div className="relative mt-3">
            <video
              controls
              className="rounded-2xl max-h-48 w-full object-cover shadow-md"
              src={URL.createObjectURL(media)}
            />
            <button
              onClick={clearMedia}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600 cursor-pointer"
              title="Remove"
            >
              ✕
            </button>
          </div>
        )}

        {media && mediaType === "audio" && (
          <div className="relative mt-3 p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-600">
              <span>🎙️</span>
              <span>Voice Note Attached</span>
            </div>
            <audio controls src={URL.createObjectURL(media)} className="h-8 max-w-[200px]" />
            <button
              onClick={clearMedia}
              className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        {/* Recording active state */}
        {isRecording && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Recording Voice Whisper... ({recordingSeconds}s)</span>
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-1 rounded-xl bg-red-500 text-white text-xs font-bold shadow hover:bg-red-600 cursor-pointer"
            >
              ⏹ Stop & Attach
            </button>
          </div>
        )}

        {/* Action toolbar */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-pink-100/60">
          <div className="flex items-center gap-2">
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
                      else if (file.type.startsWith("video")) setMediaType("video");
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="mediaUpload"
                  className="px-3.5 py-2 rounded-2xl glass-pill text-xs font-semibold text-pink-700 hover:text-pink-800 hover:border-pink-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📷</span>
                  <span className="hidden sm:inline">Photo/Video</span>
                </label>

                <button
                  type="button"
                  onClick={startRecording}
                  className="px-3.5 py-2 rounded-2xl glass-pill text-xs font-semibold text-rose-700 hover:text-rose-800 hover:border-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🎙️</span>
                  <span className="hidden sm:inline">Voice</span>
                </button>
              </>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={addPost}
            disabled={isPosting}
            className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isPosting ? (
              <Spinner size={18} thickness={2.5} speed="fast" />
            ) : (
              <>
                <span>Capture Memory</span>
                <span>✨</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {viewMode === "scrapbook" ? (
        <ScrapbookView posts={posts} room={room} />
      ) : (
        /* Timeline Stream */
        <div className="timeline relative w-full max-w-2xl flex flex-col items-center">
          <InfiniteScroll
            dataLength={timeline.length}
            next={fetchMorePosts}
            hasMore={hasMore}
            loader={
              <div className="text-center py-6">
                <Spinner size={32} thickness={3} speed="normal" label="Loading older memories..." />
              </div>
            }
            endMessage={
              timeline.length > 0 ? (
                <div className="text-center py-8 text-xs font-semibold text-gray-400 flex items-center justify-center gap-2">
                  <span>🌸</span>
                  <span>You've explored all your beautiful memories together</span>
                  <span>✨</span>
                </div>
              ) : null
            }
            className="w-full flex flex-col items-center space-y-4"
          >
            {timeline.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 px-6 glass-card rounded-3xl max-w-md shadow-lg border border-white/80"
              >
                <div className="text-5xl mb-3">📖</div>
                <h3
                  className="text-2xl font-bold text-gray-800"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Our Story Begins
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-2 leading-relaxed">
                  No memories posted yet. Take a snapshot, write a thought, or record a sweet whisper above to start your journey together!
                </p>
              </motion.div>
            ) : (
              timeline.map((item, idx) =>
                item.type === "session" ? (
                  <div key={idx} className="w-full mb-10">
                    {/* Session / Chapter Ribbon Header */}
                    <div className="relative flex items-center justify-center mb-6 mt-6">
                      <div className="glass-card px-5 py-2.5 rounded-full shadow-md border border-white/90 flex items-center gap-2.5 bg-gradient-to-r from-rose-50/95 via-pink-50/95 to-amber-50/95">
                        <span className="text-base">🔖</span>
                        <h3
                          className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500 tracking-tight"
                          style={{ fontFamily: "var(--font-serif)" }}
                        >
                          {item.label}
                        </h3>
                        <span className="text-[11px] font-bold text-pink-600 bg-pink-100/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                          {isSessionActive && currentSessionId === item.sessionId ? "🔴 Live Trip" : "Chapter"}
                        </span>
                      </div>
                    </div>

                    {/* Session Posts */}
                    <div className="space-y-4">
                      {item.posts!.map((p, i) => (
                        <PostCard key={`${p._id}-${i}`} post={p} flip={i % 2 === 0} />
                      ))}
                    </div>

                    {/* Chapter Ending / Concluded Milestone Card */}
                    {isSessionActive && currentSessionId === item.sessionId ? (
                      <div className="w-full flex items-center justify-center my-6 px-2">
                        <div className="glass-card px-5 py-2.5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/95 to-orange-50/95 shadow-sm flex items-center gap-2.5 text-xs font-semibold text-amber-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                          <span>Chapter in progress... Keep capturing your memories together! 📸</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center my-6 px-2">
                        <div className="glass-card px-6 py-4 rounded-3xl border border-pink-200/90 bg-gradient-to-r from-pink-50/90 via-rose-50/90 to-amber-50/90 shadow-md text-center max-w-lg w-full flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                            <span>🏁</span>
                            <span>Chapter Concluded: "{item.label}"</span>
                            <span>✨</span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {item.posts?.length || 0} {(item.posts?.length || 0) === 1 ? "memory" : "memories"} safely captured & preserved in vault
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-pink-700 bg-white/80 px-3.5 py-1 rounded-full shadow-xs border border-pink-100">
                            <span>🔒 Trip Ended • Preserved Forever</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <PostCard
                    key={`${item.post!._id}-${idx}`}
                    post={item.post!}
                    flip={idx % 2 === 0}
                  />
                )
              )
            )}
          </InfiniteScroll>
        </div>
      )}

      {/* Bucket List Modal */}
      {showBucketListModal && (
        <BucketListModal
          roomId={roomId!}
          onClose={() => setShowBucketListModal(false)}
        />
      )}

      {/* Session Label Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-white/90 text-center"
          >
            <div className="text-3xl mb-2">🏷️</div>
            <h3
              className="text-xl font-bold text-gray-800 mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Start a New Chapter
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Group memories together (e.g. "Paris Getaway", "Our Anniversary Weekend")
            </p>

            <input
              type="text"
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              placeholder="e.g. Spain Trip 2026"
              className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none mb-4"
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowSessionModal(false)}
                className="flex-1 py-2.5 rounded-2xl glass-pill font-semibold text-xs text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  startSession();
                  setShowSessionModal(false);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-xs shadow-md hover:shadow-pink-500/30 transition-all cursor-pointer"
              >
                Start Chapter
              </button>
            </div>
          </motion.div>
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

      {/* Golden Ticket Invite Modal */}
      {showGoldenTicketModal && (
        <GoldenTicketModal
          roomName={room.name || "Our Sanctuary"}
          roomCode={room.code}
          onClose={() => setShowGoldenTicketModal(false)}
        />
      )}

      {/* Our Bond Wrapped Story Modal */}
      {showBondWrappedModal && (
        <BondWrappedModal
          room={room}
          posts={posts}
          notes={loveNotes}
          onClose={() => setShowBondWrappedModal(false)}
        />
      )}

      {/* Sanctuary Guided Tour Modal */}
      <GuidedTourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
      />

      {/* Buy Me a Coffee Support Modal */}
      <BuyMeCoffeeModal
        isOpen={showCoffeeModal}
        onClose={() => setShowCoffeeModal(false)}
      />
    </div>
  );
}
