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
    if (criteriaCount <= 2) return "Gentle start...";
    if (criteriaCount <= 4) return "Good & secure";
    return "Wonderfully strong ✨";
  };

  const getStrengthColor = () => {
    if (criteriaCount <= 2) return "bg-rose-400";
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
        toast("Welcome back, love! ✨", {
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
        toast("Your sanctuary key is ready! Please sign in 💕", {
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
    <div className="relative min-h-screen flex items-center justify-center p-3.5 sm:p-6 overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />

      {/* Floating gentle decorative elements */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-14 left-16 text-3xl select-none opacity-50 pointer-events-none"
      >
        🌸
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden md:flex absolute bottom-16 left-20 text-3xl select-none opacity-50 pointer-events-none"
      >
        💌
      </motion.div>
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="hidden md:flex absolute top-20 right-20 text-3xl select-none opacity-50 pointer-events-none"
      >
        ✨
      </motion.div>

      {/* Glassmorphic Auth Sanctuary Card */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md glass-card rounded-[32px] p-6 sm:p-9 shadow-2xl border border-white/90"
      >
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill text-[11px] font-bold text-[#D66D7D] mb-3 tracking-wide shadow-2xs">
            <span>♡</span>
            <span>A private world for two</span>
            <span>♡</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold text-[#2E2627] tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Bondbox
          </h1>
          <p className="text-[#7A6B6D] text-xs sm:text-sm mt-1.5 font-medium">
            Where your sweetest memories live forever
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="p-1 rounded-2xl bg-[#FCE7EB]/70 backdrop-blur-md flex gap-1 mb-5 border border-[#F9D2D9]/60">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              mode === "login"
                ? "bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white shadow-md shadow-[#D66D7D]/25 scale-[1.02]"
                : "text-[#7A6B6D] hover:text-[#D66D7D]"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              mode === "signup"
                ? "bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white shadow-md shadow-[#D66D7D]/25 scale-[1.02]"
                : "text-[#7A6B6D] hover:text-[#D66D7D]"
            }`}
          >
            Signup
          </button>
        </div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full"
        >
          <div className="flex flex-col gap-3">
            {/* Email Input */}
            <label className="block text-[11px] font-bold text-[#4A3E40] -mb-1.5 ml-1 text-left">
              Your Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-2xl glass-input text-sm font-medium focus:outline-none placeholder:text-[#A89A9C]"
            />

            {/* Password Input with Interactive Eye Toggle */}
            <label className="block text-[11px] font-bold text-[#4A3E40] -mb-1.5 ml-1 text-left">
              Secret Password
            </label>
            <div className="relative flex items-center">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 pr-12 rounded-2xl glass-input text-sm font-medium focus:outline-none placeholder:text-[#A89A9C]"
              />
              <span
                role="presentation"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-[#7A6B6D] hover:text-[#D66D7D] transition-colors cursor-pointer select-none text-base"
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
                  className="p-3 rounded-2xl bg-[#FFF5F7] border border-[#F9D2D9] text-left text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#4A3E40]">Password Security</span>
                    <span className="text-[11px] font-extrabold text-[#D66D7D]">
                      {getStrengthText()}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full h-1.5 bg-[#F3E6E8] rounded-full overflow-hidden mb-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(criteriaCount / 5) * 100}%` }}
                      className={`h-full ${getStrengthColor()} rounded-full transition-all duration-300`}
                    />
                  </div>

                  {/* Checklist criteria */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <span className={`flex items-center gap-1 font-semibold ${hasMinLength ? "text-emerald-700" : "text-[#A89A9C]"}`}>
                      <span>{hasMinLength ? "✓" : "○"}</span> 6+ characters
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${hasUppercase ? "text-emerald-700" : "text-[#A89A9C]"}`}>
                      <span>{hasUppercase ? "✓" : "○"}</span> 1 uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${hasLowercase ? "text-emerald-700" : "text-[#A89A9C]"}`}>
                      <span>{hasLowercase ? "✓" : "○"}</span> 1 lowercase (a-z)
                    </span>

                    <span className={`flex items-center gap-1 font-semibold ${hasNumber ? "text-emerald-700" : "text-[#A89A9C]"}`}>
                      <span>{hasNumber ? "✓" : "○"}</span> 1 number (0-9)
                    </span>
                    <span className={`col-span-2 flex items-center gap-1 font-semibold ${hasSpecialChar ? "text-emerald-700" : "text-[#A89A9C]"}`}>
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
              className="mt-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D66D7D] via-[#E07A8A] to-[#F7BA9E] text-white font-bold text-sm shadow-lg shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-95"
            >
              {isLoading ? (
                <Spinner size={20} thickness={2.5} speed="fast" />
              ) : (
                <>
                  <span>{mode === "login" ? "Login" : "Sign up"}</span>
                  <span>✨</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>


        {/* Footer Note */}
        <div className="mt-5 pt-3.5 border-t border-[#F9D2D9]/70 text-center">
          <p className="text-xs text-[#7A6B6D]">
            {mode === "login" ? "Don't have a sanctuary yet?" : "Already have your sanctuary key?"}{" "}
            <span
              role="link"
              tabIndex={0}
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setShowPassword(false);
              }}
              className="font-bold text-[#D66D7D] hover:text-[#9E2A42] underline underline-offset-2 ml-1 cursor-pointer transition-colors inline-block"
            >
              {mode === "login" ? "Create an account" : "Sign in here"}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

