import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flip, toast } from "react-toastify";
import Spinner from "../Components/Spinner";

export default function Auth({
  onAuth,
}: {
  onAuth?: (roomId: string | null) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(
      password
    )
      ? null
      : "Password must be at least 6 characters long, and include uppercase, lowercase, number, and special character.";
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in both email and password");
      return;
    }

    if (mode === "signup") {
      const error = validatePassword(password);
      if (error) {
        toast.error(error, {
          position: "top-center",
          autoClose: 4000,
          theme: "light",
          transition: Flip,
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/${mode}`,
        { email, password }
      );

      if (mode === "login") {
        toast("Welcome back! ✨", {
          position: "top-center",
          autoClose: 3000,
          theme: "light",
          transition: Flip,
        });
        localStorage.setItem("token", res.data.token);
        if (res.data.roomId) {
          localStorage.setItem("roomId", res.data.roomId);
          onAuth?.(res.data.roomId);
          navigate(`/timeline/${res.data.roomId}`, { replace: true });
        } else {
          localStorage.removeItem("roomId");
          onAuth?.(null);
          navigate("/", { replace: true });
        }
      } else {
        toast("Account created! Please log in 💕", {
          position: "top-center",
          autoClose: 3000,
          theme: "light",
          transition: Flip,
        });
        setMode("login");
        setEmail("");
        setPassword("");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Something went wrong", {
          position: "top-center",
          autoClose: 5000,
          theme: "light",
          transition: Flip,
        });
      } else if (err instanceof Error) {
        toast.error(err.message, {
          position: "top-center",
          autoClose: 5000,
          theme: "light",
          transition: Flip,
        });
      } else {
        toast.error("Unknown error occurred", {
          position: "top-center",
          autoClose: 5000,
          theme: "light",
          transition: Flip,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100">
      {/* Ambient background glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-12 left-16 text-3xl select-none opacity-60"
      >
        🌸
      </motion.div>
      <motion.div
        animate={{ y: [0, 14, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden md:flex absolute bottom-16 left-24 text-3xl select-none opacity-60"
      >
        💌
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="hidden md:flex absolute top-20 right-20 text-3xl select-none opacity-60"
      >
        ✨
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="hidden md:flex absolute bottom-12 right-24 text-3xl select-none opacity-60"
      >
        🥂
      </motion.div>

      {/* Glassmorphic Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md glass-card rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/80"
      >
        {/* Header section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill text-xs font-semibold text-pink-600 mb-3.5 tracking-wide">
            <span>✨</span>
            <span>A private sanctuary for two</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 drop-shadow-sm tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            BondBox
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-normal">
            Where your sweetest memories live forever
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="p-1 rounded-2xl bg-pink-100/70 backdrop-blur-md flex gap-1 mb-6 border border-pink-200/50">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              mode === "login"
                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md shadow-pink-500/20 scale-[1.02]"
                : "text-gray-600 hover:text-pink-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              mode === "signup"
                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md shadow-pink-500/20 scale-[1.02]"
                : "text-gray-600 hover:text-pink-600"
            }`}
          >
            Signup
          </button>
        </div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 w-full"
        >
          <div className="flex flex-col gap-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none"
            />

            <AnimatePresence>
              {mode === "signup" && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] text-gray-500 px-1 leading-tight"
                >
                  Must be 6+ chars with uppercase, lowercase, number & special char.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleAuth}
              disabled={isLoading}
              className="mt-1 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <Spinner size={20} thickness={2.5} speed="fast" />
              ) : (
                <>
                  <span>{mode === "login" ? "Login" : "Signup"}</span>
                  <span>✨</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-6 pt-5 border-t border-pink-100 text-center">
          <p className="text-xs text-gray-500">
            {mode === "login" ? "Don't have a room yet?" : "Already have an account?"}{" "}
            <span
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-bold text-pink-600 hover:text-pink-700 underline underline-offset-2 ml-1 cursor-pointer"
            >
              {mode === "login" ? "Create an account" : "Back to login"}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
