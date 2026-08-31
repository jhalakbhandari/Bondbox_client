import { useState } from "react";
import { normalizeMediaUrl } from "../utils/media";
import ImageLightbox from "./ImageLightbox";

type Props = {
  src?: string | null;
  alt?: string;
  caption?: string;
  date?: string;
  className?: string;
  containerClassName?: string;
  allowLightbox?: boolean;
  isPolaroid?: boolean;
};

export default function MemoryImage({
  src,
  alt = "Memory",
  caption,
  date,
  className = "",
  containerClassName = "",
  allowLightbox = true,
  isPolaroid = false,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const normalizedSrc = normalizeMediaUrl(src);

  if (!normalizedSrc) {
    return null;
  }

  const handleImageClick = (e: React.MouseEvent) => {
    if (allowLightbox && !hasError) {
      e.stopPropagation();
      setIsLightboxOpen(true);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  return (
    <>
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 ${containerClassName}`}
        onClick={handleImageClick}
      >
        {/* Shimmer / Skeleton Loader */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-r from-pink-100/70 via-rose-100/90 to-pink-100/70 animate-pulse min-h-[200px]">
            <span className="text-2xl mb-1 animate-bounce">🌸</span>
            <span className="text-[11px] font-bold text-pink-500 tracking-wider">
              Developing photo...
            </span>
          </div>
        )}

        {/* Error Fallback State */}
        {hasError ? (
          <div className="min-h-[180px] p-6 flex flex-col items-center justify-center text-center bg-pink-50/80 rounded-2xl border border-dashed border-pink-200">
            <span className="text-3xl mb-1">📷</span>
            <p className="text-xs font-bold text-pink-700">Memory Photo Preview</p>
            <p className="text-[10px] text-gray-500 mt-0.5 max-w-[200px]">
              Tap to retry or view original photo
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-bold shadow-xs cursor-pointer transition"
              >
                ↻ Retry
              </button>
              <a
                href={normalizedSrc}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1 rounded-full bg-white text-pink-600 border border-pink-200 text-[11px] font-bold shadow-xs cursor-pointer hover:bg-pink-50 transition"
              >
                Open ↗
              </a>
            </div>
          </div>
        ) : (
          /* Actual Image Element */
          <img
            key={retryKey}
            src={normalizedSrc}
            alt={alt}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className={`w-full block transition-all duration-500 ${
              isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
            } ${allowLightbox ? "cursor-zoom-in" : ""} ${className}`}
            style={{
              maxHeight: isPolaroid ? "520px" : "480px",
              minHeight: "140px",
              objectFit: "cover",
            }}
          />
        )}

        {/* Lightbox Trigger Hint on Hover (Desktop) */}
        {!isLoading && !hasError && allowLightbox && (
          <div className="hidden sm:flex absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/40 text-white text-[10px] font-semibold backdrop-blur-xs opacity-0 hover:opacity-100 transition-opacity pointer-events-none items-center gap-1">
            <span>🔍 Tap to view</span>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {allowLightbox && (
        <ImageLightbox
          src={normalizedSrc}
          alt={alt}
          caption={caption}
          date={date}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
