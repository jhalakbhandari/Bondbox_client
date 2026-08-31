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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Robust Password Criteria Checklist
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const criteriaCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  const getStrengthText = () => {
    if (password.length === 0) return "";
    if (criteriaCount <= 2) return "Weak";
    if (criteriaCount <= 4) return "Good";
    return "Strong & Secure ✨";
  };

  const getStrengthColor = () => {
    if (criteriaCount <= 2) return "bg-red-400";
    if (criteriaCount <= 4) return "bg-amber-400";
    return "bg-emerald-500";
  };

  const validatePassword = (pass: string) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pass)
      ? null
      : "Password must be at least 6 characters, and include uppercase, lowercase, number, and special character.";
  };

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please fill in both email and password");
      return;
    }

    if (mode === "signup") {
      const error = validatePassword(cleanPassword);
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
        { email: cleanEmail, password: cleanPassword }
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
        toast("Account created securely! Please log in 💕", {
          position: "top-center",
          autoClose: 3500,
          theme: "light",
          transition: Flip,
        });
        setMode("login");
        setPassword("");
        setShowPassword(false);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.errors?.[0]?.msg ||
            "Authentication failed. Please check your details.",
          {
            position: "top-center",
            autoClose: 5000,
            theme: "light",
            transition: Flip,
          }
        );
      } else if (err instanceof Error) {
        toast.error(err.message, {
          position: "top-center",
          autoClose: 5000,
          theme: "light",
          transition: Flip,
        });
      } else {
        toast.error("Unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3.5 sm:p-4 overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100">
      {/* Ambient background glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-12 left-16 text-3xl select-none opacity-60 pointer-events-none"
      >
        🌸
      </motion.div>
      <motion.div
        animate={{ y: [0, 14, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden md:flex absolute bottom-16 left-24 text-3xl select-none opacity-60 pointer-events-none"
      >
        💌
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="hidden md:flex absolute top-20 right-20 text-3xl select-none opacity-60 pointer-events-none"
      >
        ✨
      </motion.div>

      {/* Glassmorphic Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md glass-card rounded-3xl p-5 sm:p-9 shadow-2xl border border-white/85"
      >
        {/* Header Section */}
        <div className="text-center mb-5 sm:mb-7">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill text-xs font-semibold text-pink-600 mb-2.5 tracking-wide shadow-2xs">
            <span>✨</span>
            <span>A private sanctuary for two</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 drop-shadow-sm tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Bondbox
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 font-normal">
            Where your sweetest memories live forever
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="p-1 rounded-2xl bg-pink-100/70 backdrop-blur-md flex gap-1 mb-5 border border-pink-200/50">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
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
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
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
          className="mt-3 w-full"
        >
          <div className="flex flex-col gap-3.5">
            {/* Email Input */}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none"
            />

            {/* Password Input with Interactive Eye Toggle */}
            <div className="relative flex items-center">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 pr-12 rounded-2xl glass-input text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none"
              />
              <span
                role="img"
                aria-label="Toggle password visibility"
                tabIndex={0}
                onClick={() => setShowPassword(!showPassword)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowPassword(!showPassword);
                  }
                }}
                className="absolute right-3.5 p-1 text-gray-400 hover:text-pink-600 transition-colors cursor-pointer select-none text-base"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>

            {/* Live Password Security Checklist for Signup */}
            <AnimatePresence>
              {mode === "signup" && password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-2xl bg-pink-50/70 border border-pink-200/60 text-left text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-600">Password Security</span>
                    <span className="text-[11px] font-extrabold text-pink-600">
                      {getStrengthText()}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(criteriaCount / 5) * 100}%` }}
                      className={`h-full ${getStrengthColor()} rounded-full transition-all duration-300`}
                    />
                  </div>

                  {/* Checklist criteria */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <span className={`flex items-center gap-1 font-semibold ${hasMinLength ? "text-emerald-600" : "text-gray-400"}`}>
                      <span>{hasMinLength ? "✓" : "○"}</span> 6+ characters
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${hasUppercase ? "text-emerald-600" : "text-gray-400"}`}>
                      <span>{hasUppercase ? "✓" : "○"}</span> 1 uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${hasLowercase ? "text-emerald-600" : "text-gray-400"}`}>
                      <span>{hasLowercase ? "✓" : "○"}</span> 1 lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${hasNumber ? "text-emerald-600" : "text-gray-400"}`}>
                      <span>{hasNumber ? "✓" : "○"}</span> 1 number (0-9)
                    </span>
                    <span className={`col-span-2 flex items-center gap-1 font-semibold ${hasSpecialChar ? "text-emerald-600" : "text-gray-400"}`}>
                      <span>{hasSpecialChar ? "✓" : "○"}</span> 1 special symbol (!@#$%...)
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleAuth}
              disabled={isLoading}
              className="mt-1 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-95"
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
        <div className="mt-5 pt-3.5 border-t border-pink-100 text-center">
          <p className="text-xs text-gray-500">
            {mode === "login" ? "Don't have a sanctuary yet?" : "Already have an account?"}{" "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setShowPassword(false);
              }}
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
