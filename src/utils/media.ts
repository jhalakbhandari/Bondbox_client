/**
 * Media URL normalizer utility
 * Ensures that relative paths, Windows backslashes, insecure HTTP protocols,
 * and Cloudinary URLs are properly formatted for all mobile and desktop browsers.
 */

export function normalizeMediaUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";

  let cleanUrl = url.trim();
  if (!cleanUrl) return "";

  // Handle blob and data URLs directly
  if (cleanUrl.startsWith("blob:") || cleanUrl.startsWith("data:")) {
    return cleanUrl;
  }

  // Replace Windows backslashes with forward slashes
  cleanUrl = cleanUrl.replace(/\\/g, "/");

  // Upgrade insecure http:// to https:// for Cloudinary or external secure CDN assets
  if (cleanUrl.startsWith("http://res.cloudinary.com/")) {
    cleanUrl = cleanUrl.replace("http://res.cloudinary.com/", "https://res.cloudinary.com/");
  }

  // Clean any accidental whitespace in Cloudinary cloud name
  if (cleanUrl.includes("res.cloudinary.com/%20")) {
    cleanUrl = cleanUrl.replace("res.cloudinary.com/%20", "res.cloudinary.com/");
  }

  // Handle Cloudinary dynamic format delivery & iPhone HEIC/HEIF auto-conversion:
  // Browsers (Chrome/Edge/Firefox) cannot display raw HEIC/HEIF files in <img>.
  // Adding f_auto,q_auto and converting .heic/.heif to .jpg enables Cloudinary on-the-fly rendering.
  if (cleanUrl.includes("res.cloudinary.com") && cleanUrl.includes("/image/upload/")) {
    if (!cleanUrl.includes("/f_auto") && !cleanUrl.includes("/f_")) {
      cleanUrl = cleanUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
    }
    cleanUrl = cleanUrl.replace(/\.(heic|heif|HEIC|HEIF)(\?.*)?$/i, ".jpg$2");
  }

  // If already absolute URL (http/https)
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  // If relative path (e.g. "uploads/...", "/uploads/...", "photo.jpg")
  const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const relativePath = cleanUrl.replace(/^\/+/, "");

  if (apiUrl) {
    return `${apiUrl}/${relativePath}`;
  }

  return `/${relativePath}`;
}


export function formatMemoryDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function formatMemoryTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
