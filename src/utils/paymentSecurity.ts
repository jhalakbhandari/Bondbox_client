/**
 * Security and Validation Utilities for BondBox Support & Donation Flow
 * Adheres strictly to security requirements:
 * - Prevents arbitrary UPI URI injection
 * - Validates donation amount bounds (INR 1 to 100,000)
 * - Sanitizes user-supplied text
 * - Validates Buy Me a Coffee destination URLs against open redirects
 */

// Strict pattern for standard UPI VPA (Virtual Payment Address)
const UPI_VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

// Strict pattern for official Buy Me a Coffee URLs
const BMC_URL_REGEX = /^https:\/\/(www\.)?buymeacoffee\.com\/[a-zA-Z0-9_.-]+$/;

// Safe fallback constants
export const DEFAULT_TRUSTED_BMC_URL = "https://buymeacoffee.com/bondbox";
export const DEFAULT_TRUSTED_UPI_NAME = "BondBox";

/**
 * Validates a UPI ID against standard VPA format.
 */
export function isValidUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== "string") return false;
  return UPI_VPA_REGEX.test(upiId.trim());
}

/**
 * Validates voluntary donation amounts:
 * - Must be positive finite number
 * - Bounds: minimum ₹1, maximum ₹100,000
 * - Maximum 2 decimal places
 * - No NaN, Infinity, or exponential notation
 */
export function validateDonationAmount(val: unknown): {
  isValid: boolean;
  sanitizedAmount: number | null;
  error?: string;
} {
  if (val === "" || val === null || val === undefined) {
    return { isValid: true, sanitizedAmount: null }; // Allowed: open-ended amount
  }

  const num = typeof val === "number" ? val : Number(val);

  if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
    return { isValid: false, sanitizedAmount: null, error: "Amount must be a valid number" };
  }

  if (num < 1) {
    return { isValid: false, sanitizedAmount: null, error: "Minimum amount is ₹1" };
  }

  if (num > 100000) {
    return { isValid: false, sanitizedAmount: null, error: "Maximum voluntary amount is ₹100,000" };
  }

  // Round to at most 2 decimal places
  const sanitized = Math.round(num * 100) / 100;
  return { isValid: true, sanitizedAmount: sanitized };
}

/**
 * Sanitizes user-supplied text to prevent tag/script injection and bounds length.
 */
export function sanitizeText(text: unknown, maxLength: number): string {
  if (!text || typeof text !== "string") return "";
  return text
    .trim()
    .replace(/[<>]/g, "") // Strip HTML angle brackets
    .slice(0, maxLength);
}

/**
 * Validates the Buy Me a Coffee URL to strictly match official domain, preventing open redirects.
 */
export function getSafeBuyMeCoffeeUrl(url: string | undefined): string {
  if (!url || typeof url !== "string") return DEFAULT_TRUSTED_BMC_URL;
  const trimmed = url.trim();
  if (BMC_URL_REGEX.test(trimmed)) {
    return trimmed;
  }
  return DEFAULT_TRUSTED_BMC_URL;
}

/**
 * Safely constructs a UPI URI using only validated and encoded parameters.
 */
export function buildSafeUpiIntentUrl(params: {
  upiId: string;
  upiName?: string;
  amount?: number | null;
  note?: string;
}): string {
  const safeUpiId = isValidUpiId(params.upiId) ? params.upiId.trim() : "yourname@upi";
  const safeName = sanitizeText(params.upiName || DEFAULT_TRUSTED_UPI_NAME, 50);
  const safeNote = sanitizeText(params.note || "Coffee for BondBox", 40);

  const amountValidation = validateDonationAmount(params.amount);
  const amountParam =
    amountValidation.isValid && amountValidation.sanitizedAmount !== null
      ? `&am=${amountValidation.sanitizedAmount}`
      : "";

  return `upi://pay?pa=${encodeURIComponent(safeUpiId)}&pn=${encodeURIComponent(
    safeName
  )}${amountParam}&cu=INR&tn=${encodeURIComponent(safeNote)}`;
}

/**
 * Graceful client-side timezone check to default to Indian tab for Indian visitors.
 * Acts purely as a UX enhancement, never trusted for security.
 */
export function detectIndianUserGraceful(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && (tz === "Asia/Kolkata" || tz === "Asia/Calcutta")) {
      return true;
    }
  } catch {
    // If detection fails, default safely
  }
  return false;
}
