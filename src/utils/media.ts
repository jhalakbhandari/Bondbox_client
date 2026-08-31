/**
 * Media URL normalizer utility
 * Ensures that relative paths, Windows backslashes, insecure HTTP protocols,
 * and Cloudinary URLs are properly formatted for all mobile and desktop browsers.
 */

export function normalizeMediaUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  // Handle blob and data URLs directly
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Replace Windows backslashes with forward slashes
  let cleanUrl = trimmed.replace(/\\/g, "/");

  // Upgrade insecure http:// to https:// for Cloudinary or external secure CDN assets to avoid mixed content on mobile
  if (cleanUrl.startsWith("http://res.cloudinary.com/")) {
    cleanUrl = cleanUrl.replace("http://res.cloudinary.com/", "https://res.cloudinary.com/");
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
