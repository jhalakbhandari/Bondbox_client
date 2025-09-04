import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Room } from "../types";
import { Flip, toast } from "react-toastify";
import Spinner from "../Components/Spinner";

export default function Home() {
  const [mode, setMode] = useState(""); // "create" | "join"
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);

  const navigate = useNavigate();

  const createRoom = async () => {
    if (!isAlphanumeric(name)) {
      toast.error("Room name can only contain letters and numbers");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("token");
    // console.log(token);
    if (!token) throw new Error("No token found");

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/room/create`,
      { name }, // body only needs room name
      { headers: { Authorization: `Bearer ${token}` } } // correct headers
    );
    setCreatedRoom(res.data); // save created room info
    toast("Room Created! Share the code!", {
      position: "top-center",
      autoClose: 400,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Flip,
    });
    setIsLoading(false);
    // navigate(`/timeline/${res.data._id}`); // use room ID for timeline
  };

  const joinRoom = async () => {
    if (!isAlphanumeric(name)) {
      toast.error("Room name can only contain letters and numbers");
      return;
    }
    const token = localStorage.getItem("token");
    // console.log(token);

    if (!token) throw new Error("No token found");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/room/join/${code}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast("Enjoy Sharing!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Flip,
      });
      navigate(`/timeline/${res.data._id}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // If backend sends a proper error response (like res.status(400).json({ message: "Invalid credentials" }))
        toast.error(err.response?.data?.message || "Something went wrong", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Flip,
        });
      } else if (err instanceof Error) {
        // Fallback for generic errors
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
    }
    setIsLoading(false);
  };
  const isAlphanumeric = (value: string) => /^[a-zA-Z0-9]+$/.test(value);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-orange-200 text-center">
      {/* Title */}
      {isLoading ?? <Spinner />}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 drop-shadow-[0_5px_20px_rgba(255,105,180,0.6)]"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        BondBox
      </motion.h1>

      {/* Buttons */}
      <div className="flex gap-6 mt-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("create")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-orange-400 text-white font-semibold shadow-lg hover:shadow-pink-400/50"
        >
          Create a Room
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("join")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold shadow-lg hover:shadow-orange-400/50"
        >
          Join a Room
        </motion.button>
      </div>

      {/* Conditional input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: mode ? 1 : 0, y: mode ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="mt-10 w-full max-w-md px-4"
      >
        {mode === "create" && (
          <div className="flex flex-col gap-4">
            <input
              value={name}
              // onChange={(e) => setName(e.target.value)}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[a-zA-Z0-9]*$/.test(value)) {
                  setName(value); // only update if valid
                }
              }}
              placeholder="Enter room name"
              className="p-3 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-md"
            />
            <button
              onClick={createRoom}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-pink-500/40"
            >
              Create
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="flex flex-col gap-4">
            <input
              value={code}
              // onChange={(e) => setCode(e.target.value)}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[a-zA-Z0-9]*$/.test(value)) {
                  setCode(value); // only update if valid
                }
              }}
              placeholder="Enter room code"
              className="p-3 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-md"
            />
            <button
              onClick={joinRoom}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-orange-500/40"
            >
              Join
            </button>
          </div>
        )}
      </motion.div>
      {createdRoom && (
        <div className="mt-6 p-4 bg-white shadow-lg rounded-xl text-center">
          <p className="text-lg font-bold text-pink-600">
            🎉 Room created successfully!
          </p>
          <p className="mt-2">Share this code with your partner:</p>
          <p className="text-2xl font-mono text-orange-500 mt-2">
            {createdRoom.code}
          </p>
          <button
            onClick={() => navigate(`/timeline/${createdRoom._id}`)}
            className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold shadow-lg hover:scale-105 transition"
          >
            Go to Timeline
          </button>
        </div>
      )}
    </div>
  );
}
