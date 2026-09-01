import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Soundscape = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bpm: number;
  scale: number[]; // Frequencies for notes
  pattern: number[]; // Index into scale
  chordScale: number[];
};

// Beautiful romantic frequencies (Hz)
const SCALES = {
  musicBox: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0], // C Pentatonic
  starlight: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25], // A minor / C major
  waltz: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 783.99], // C major 7th
};

const SOUNDSCAPES: Soundscape[] = [
  {
    id: "music_box",
    name: "Sanctuary Music Box",
    emoji: "🌸",
    description: "Gentle music box chime playing sweet melodies",
    bpm: 72,
    scale: SCALES.musicBox,
    pattern: [0, 2, 4, 5, 7, 5, 4, 2, 1, 3, 5, 6, 4, 3, 2, 0, 0, 4, 7, 9, 7, 4, 2, 0],
    chordScale: [130.81, 164.81, 196.0, 220.0],
  },
  {
    id: "starlight",
    name: "Starlight Lullaby",
    emoji: "✨",
    description: "Dreamy celestial tones under a night sky",
    bpm: 60,
    scale: SCALES.starlight,
    pattern: [5, 4, 3, 2, 0, 2, 4, 5, 7, 5, 4, 2, 3, 1, 0, 2],
    chordScale: [110.0, 130.81, 146.83, 164.81],
  },
  {
    id: "cozy_rain",
    name: "Cozy Rain & Melody",
    emoji: "🌧️",
    description: "Soothing melody droplets & warm peaceful chords",
    bpm: 65,
    scale: SCALES.musicBox,
    pattern: [4, 7, 5, 2, 0, 4, 3, 1, 2, 5, 7, 4, 0, 2, 4, 2],
    chordScale: [130.81, 174.61, 196.0, 220.0],
  },
  {
    id: "candlelight",
    name: "Candlelight Waltz",
    emoji: "🕯️",
    description: "Romantic 3/4 waltz arpeggio for two",
    bpm: 80,
    scale: SCALES.waltz,
    pattern: [0, 2, 4, 2, 4, 5, 4, 2, 1, 3, 5, 3, 5, 6, 5, 3],
    chordScale: [130.81, 164.81, 196.0],
  },
];

export default function WhimsicalMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const saved = localStorage.getItem("bondbox_music_track");
    return saved ? Math.min(Number(saved), SOUNDSCAPES.length - 1) : 0;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("bondbox_music_vol");
    return saved ? Number(saved) : 0.35;
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Web Audio Context References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  const currentTrack = SOUNDSCAPES[currentTrackIndex];

  // Initialize Web Audio Engine
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Play a gentle, whimsical chime / music box note with realistic envelope
  const playNote = (freq: number, isBass = false) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const noteGain = ctx.createGain();

    // Reverb / Dreamy Delay Simulation
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.25;

    // Filter to soften high frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = isBass ? 600 : 2800;

    // Timbres: Music box sine + gentle harmonic
    osc.type = isBass ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime); // 1 octave overtone

    const now = ctx.currentTime;
    const duration = isBass ? 1.8 : 1.2;

    // Bell / Chime Envelope: fast attack, exponential soft decay
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(isBass ? 0.2 : 0.28, now + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Wire up nodes
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);

    noteGain.connect(master);
    noteGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(master);
    delayGain.connect(delay); // feedback

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.5);
    osc2.stop(now + duration + 0.5);
  };

  // Start the background melody sequence
  const startMelody = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const track = SOUNDSCAPES[currentTrackIndex];
    const intervalMs = (60 / track.bpm) * 1000 * 0.5; // 8th notes

    timerRef.current = setInterval(() => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== "running") return;

      const noteIdx = track.pattern[stepRef.current % track.pattern.length];
      const freq = track.scale[noteIdx % track.scale.length];
      
      // Play melody chime
      playNote(freq);

      // Play soft root bass note every 4 steps
      if (stepRef.current % 4 === 0) {
        const bassIdx = Math.floor(stepRef.current / 4) % track.chordScale.length;
        const bassFreq = track.chordScale[bassIdx];
        playNote(bassFreq, true);
      }

      stepRef.current += 1;
    }, intervalMs);
  };

  const stopMelody = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Toggle playback
  const togglePlay = () => {
    initAudio();
    if (isPlaying) {
      stopMelody();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startMelody();
    }
  };

  // Switch Track
  const changeTrack = (newIndex: number) => {
    const idx = (newIndex + SOUNDSCAPES.length) % SOUNDSCAPES.length;
    setCurrentTrackIndex(idx);
    localStorage.setItem("bondbox_music_track", idx.toString());
    stepRef.current = 0;
    if (isPlaying) {
      stopMelody();
      setTimeout(() => startMelody(), 100);
    }
  };

  // Handle Volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    localStorage.setItem("bondbox_music_vol", newVol.toString());
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(newVol, audioCtxRef.current.currentTime, 0.05);
    }
  };

  useEffect(() => {
    return () => {
      stopMelody();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end select-none">
      {/* Expanded Control Box */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-72 sm:w-80 glass-card rounded-[28px] p-4 sm:p-5 shadow-2xl border border-white/95 text-[#2E2627]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F9D2D9]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎶</span>
                <div>
                  <h4
                    className="text-sm font-bold text-[#2E2627]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Whimsical Ambiance
                  </h4>
                  <span className="text-[10px] text-[#A89A9C] font-semibold">
                    Romantic Music Box
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-full bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#D66D7D] flex items-center justify-center text-xs font-bold transition cursor-pointer border border-[#F9D2D9]"
              >
                ✕
              </button>
            </div>

            {/* Current Track Banner */}
            <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-[#FFF5F7] via-[#FAF0E6] to-[#FFF5F7] border border-[#F9D2D9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentTrack.emoji}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#D66D7D] truncate max-w-[150px]">
                    {currentTrack.name}
                  </p>
                  <p className="text-[10px] text-[#7A6B6D] line-clamp-1">
                    {currentTrack.description}
                  </p>
                </div>
              </div>

              {/* Animated Equalizer Bars */}
              {isPlaying && (
                <div className="flex items-end gap-[3px] h-5 px-1">
                  <motion.span
                    animate={{ height: ["4px", "18px", "8px", "16px", "6px"] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[3px] bg-[#D66D7D] rounded-full"
                  />
                  <motion.span
                    animate={{ height: ["14px", "6px", "18px", "10px", "14px"] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="w-[3px] bg-[#E07A8A] rounded-full"
                  />
                  <motion.span
                    animate={{ height: ["8px", "18px", "6px", "14px", "10px"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                    className="w-[3px] bg-[#F7BA9E] rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Track Switcher Chips */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {SOUNDSCAPES.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => changeTrack(idx)}
                  className={`p-2 rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    currentTrackIndex === idx
                      ? "bg-gradient-to-r from-[#D66D7D] to-[#E07A8A] text-white border-[#D66D7D] shadow-xs"
                      : "bg-white/80 text-[#4A3E40] border-[#F9D2D9] hover:bg-[#FFF5F7]"
                  }`}
                >
                  <span>{track.emoji}</span>
                  <span className="truncate">{track.name.replace("Sanctuary ", "")}</span>
                </button>
              ))}
            </div>

            {/* Play/Pause & Navigation Controls */}
            <div className="flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => changeTrack(currentTrackIndex - 1)}
                className="p-2 rounded-xl bg-white/80 hover:bg-[#FFF5F7] text-[#D66D7D] border border-[#F9D2D9] transition cursor-pointer text-xs font-bold"
                title="Previous Soundscape"
              >
                ⏮
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#D66D7D] via-[#E07A8A] to-[#F7BA9E] text-white font-bold text-xs shadow-md shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isPlaying ? "⏸ Pause Ambiance" : "▶ Play Whimsical Music"}</span>
              </motion.button>

              <button
                onClick={() => changeTrack(currentTrackIndex + 1)}
                className="p-2 rounded-xl bg-white/80 hover:bg-[#FFF5F7] text-[#D66D7D] border border-[#F9D2D9] transition cursor-pointer text-xs font-bold"
                title="Next Soundscape"
              >
                ⏭
              </button>
            </div>

            {/* Volume Control */}
            <div className="mt-3 pt-2.5 border-t border-[#F9D2D9] flex items-center gap-2.5 text-xs text-[#7A6B6D]">
              <span
                className="cursor-pointer"
                onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.35)}
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? "🔇" : volume < 0.4 ? "🔉" : "🔊"}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-[#F3E6E8] rounded-lg appearance-none cursor-pointer accent-[#D66D7D]"
              />
              <span className="text-[10px] font-mono text-[#A89A9C] w-7 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg border transition-all cursor-pointer backdrop-blur-md ${
            isPlaying
              ? "bg-gradient-to-r from-[#D66D7D] via-[#E07A8A] to-[#F7BA9E] text-white border-white/80 shadow-[#D66D7D]/30"
              : "glass-card text-[#4A3E40] border-white/95 hover:border-[#D66D7D]/40"
          }`}
          title="Whimsical Music Player"
        >
          {/* Spinning Mini Vinyl */}
          <motion.span
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isPlaying
                ? { duration: 3.5, repeat: Infinity, ease: "linear" }
                : { duration: 0.3 }
            }
            className="text-base inline-block select-none"
          >
            {isPlaying ? "💿" : "🎵"}
          </motion.span>

          <span className="text-xs font-bold">
            {isPlaying ? currentTrack.name.replace("Sanctuary ", "") : "Music Box"}
          </span>

          {/* Quick Play/Pause Mini Toggle */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="ml-1 w-5 h-5 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center text-[10px] transition font-bold"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
