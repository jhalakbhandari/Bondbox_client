/**
 * Reusable gradient spinner for React (Tailwind CSS)
 * - Pink → Orange gradient stroke (fits light & dark)
 * - Size, thickness, and speed are configurable
 * - Accessible (role="status" + optional label)
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size={48} thickness={4} speed="fast" label="Loading posts" />
 */

type SpinnerProps = {
  /** Diameter of the spinner in pixels */
  size?: number;
  /** Stroke thickness in pixels */
  thickness?: number;
  /** Animation speed */
  speed?: "slow" | "normal" | "fast";
  /** Accessible label (visually hidden) */
  label?: string;
  /** Extra classes for outer wrapper */
  className?: string;
};

const SPEED_MAP: Record<NonNullable<SpinnerProps["speed"]>, string> = {
  slow: "1.4s",
  normal: "0.9s",
  fast: "0.6s",
};

export default function Spinner({
  size = 32,
  thickness = 3,
  speed = "normal",
  label = "Loading",
  className = "",
}: SpinnerProps) {
  // SVG viewBox will be 0..size, but stroke is centered on radius →
  // use radius so the stroke doesn't get clipped.
  const r = (size - thickness) / 2;
  const center = size / 2;

  // Dash settings for that classic spinner gap
  const circumference = 2 * Math.PI * r;
  const dash = 0.75 * circumference; // 75% arc visible
  const gap = circumference - dash; // 25% gap hidden

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-spin"
        style={{ animationDuration: SPEED_MAP[speed] }}
      >
        <defs>
          <linearGradient
            id="spinnerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {/* Tailwind colors via currentColor are tough in SVG gradients, so we hard-code gradient stops matching Tailwind palette */}
            <stop offset="0%" stopColor="#ec4899" />
            {/* pink-500 */}
            <stop offset="100%" stopColor="#fb923c" />
            {/* orange-400 */}
          </linearGradient>
        </defs>

        {/* Track (subtle) */}
        <circle
          cx={center}
          cy={center}
          r={r}
          strokeWidth={thickness}
          className="opacity-20"
          stroke="#ec4899" // base pink for track
          fill="none"
        />

        {/* Animated arc */}
        <circle
          cx={center}
          cy={center}
          r={r}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          stroke="url(#spinnerGradient)"
          fill="none"
        />
      </svg>

      {/* Visually hidden label for screen readers */}
      <span className="sr-only">{label}</span>
    </span>
  );
}
