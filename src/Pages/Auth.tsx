import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/${mode}`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      // localStorage.setItem("user", JSON.stringify(res.data.user)); // stringify object
      if (res.data.roomId) {
        navigate(`/timeline/${res.data.roomId}`);
      } else {
        if (mode == "login") {
          navigate("/");
        }
      }
      setEmail("");
      setPassword("");
      // if (res.data.token) {
      //   navigate("/");
      // }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // err is now typed as Error
        alert("Error: " + err.message);
      } else {
        alert("Unknown error occurred");
      }
    }
  };
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     navigate("/"); // user is logged in → go to home
  //   }
  // }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-orange-200 text-center">
      {/* Title */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 drop-shadow-[0_5px_20px_rgba(255,105,180,0.6)]"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        BondBox
      </motion.h1>

      {/* Mode Toggle */}
      <div className="flex gap-6 mt-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setMode("login")}
          className={`px-6 py-3 rounded-2xl ${
            mode === "login"
              ? "bg-gradient-to-r from-pink-500 to-orange-500"
              : "bg-gray-200 text-gray-700"
          } text-white font-semibold shadow-lg`}
        >
          Login
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setMode("signup")}
          className={`px-6 py-3 rounded-2xl ${
            mode === "signup"
              ? "bg-gradient-to-r from-orange-500 to-pink-500"
              : "bg-gray-200 text-gray-700"
          } text-white font-semibold shadow-lg`}
        >
          Signup
        </motion.button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-10 w-full max-w-md px-4"
      >
        <div className="flex flex-col gap-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="p-3 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-md"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="p-3 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-md"
          />
          <button
            onClick={handleAuth}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-pink-500/40"
          >
            {mode === "login" ? "Login" : "Signup"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
