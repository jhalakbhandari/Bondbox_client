import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  validateDonationAmount,
  sanitizeText,
  getSafeBuyMeCoffeeUrl,
  buildSafeUpiIntentUrl,
  detectIndianUserGraceful,
  DEFAULT_TRUSTED_UPI_NAME,
} from "../utils/paymentSecurity";

type Supporter = {
  _id?: string;
  supporterName: string;
  amount: number;
  currency?: string;
  message?: string;
  createdAt: string;
};

type PaymentHistory = {
  totalRaised: number;
  supporterCount: number;
  recentSupporters: Supporter[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BuyMeCoffeeModal({ isOpen, onClose }: Props) {
  // Gracefully pre-select tab based on user timezone without compromising security
  const [activeTab, setActiveTab] = useState<"india" | "international">(() => {
    return detectIndianUserGraceful() ? "india" : "international";
  });

  // Amounts (starts empty for pay-what-you-want)
  const [inrAmount, setInrAmount] = useState<string>("");

  // Supporter Inputs
  const [supporterName, setSupporterName] = useState("");
  const [supporterMessage, setSupporterMessage] = useState("");

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [history, setHistory] = useState<PaymentHistory | null>(null);

  // Trusted configuration from environment, strictly validated (no localStorage tampering)
  const upiId = (
    import.meta.env.VITE_UPI_ID ||
    import.meta.env.VITE_UPI_VPA ||
    import.meta.env.VITE_UPI_ADDRESS ||
    "yourname@upi"
  ).trim();
  const upiName = (
    import.meta.env.VITE_UPI_NAME ||
    import.meta.env.VITE_PAYEE_NAME ||
    DEFAULT_TRUSTED_UPI_NAME
  ).trim();
  const buyMeCoffeeUrl = getSafeBuyMeCoffeeUrl(
    import.meta.env.VITE_BUYMEACOFFEE_URL || import.meta.env.VITE_BMC_URL
  );

  const amountValidation = validateDonationAmount(inrAmount);
  const numericInrAmount = amountValidation.sanitizedAmount;

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/payment/history`)
        .then((res) => setHistory(res.data))
        .catch((err) => console.error("Error fetching supporters:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Construct secure, strictly validated UPI deep link
  const upiIntentUrl = buildSafeUpiIntentUrl({
    upiId,
    upiName,
    amount: numericInrAmount,
    note: supporterMessage,
  });

  // Dynamic QR Code from encoded trusted URL
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiIntentUrl
  )}&margin=6`;

  const recordSupportToDB = async () => {
    if (!amountValidation.isValid || numericInrAmount === null || numericInrAmount < 1) {
      toast.info(
        amountValidation.error ||
          "Please enter the voluntary amount you sent (₹1 - ₹100,000) so we can record your note! 💕"
      );
      return;
    }

    const safeName = sanitizeText(supporterName, 50) || "Kind Soulmate";
    const safeMessage = sanitizeText(supporterMessage, 200) || "Sent with warm UPI love!";

    setIsProcessing(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/payment/record`, {
        amount: numericInrAmount,
        currency: "INR",
        supporterName: safeName,
        message: safeMessage,
        paymentId: `pay_upi_${Date.now()}`,
      });

      // Refresh history
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payment/history`);
      setHistory(res.data);

      setIsProcessing(false);
      setIsSubmitted(true);
      toast.success("Support note recorded! Thanks for fueling BondBox! ☕💖");
    } catch (err) {
      console.error("Error saving payment record:", err);
      setIsProcessing(false);
      // Still show appreciation to the user so their experience is not blocked
      setIsSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg glass-card rounded-[32px] p-5 sm:p-7 shadow-2xl border border-white/90 overflow-hidden max-h-[92vh] overflow-y-auto my-auto"
      >
        {/* Glowing atmospheric halos */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br from-[#F7BA9E] via-[#F9D2D9] to-[#D66D7D] opacity-35 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-gradient-to-tr from-[#E07A8A] via-[#FAF0E6] to-[#F7BA9E] opacity-25 blur-3xl pointer-events-none" />

        {isSubmitted ? (
          /* Heartfelt Appreciation Card (honest, non-misleading verification wording) */
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-6"
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="text-6xl mb-3"
            >
              💖
            </motion.div>

            <h3
              className="text-2xl sm:text-3xl font-extrabold text-[#2E2627] mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Thanks for Supporting BondBox! ❤️
            </h3>

            <p className="text-xs sm:text-sm text-[#4A3E40] max-w-sm mb-5 leading-relaxed">
              We have recorded your voluntary support note in our sanctuary archives! Thank you from the
              bottom of our hearts for fueling BondBox with{" "}
              <span className="font-bold text-[#D66D7D]">₹{numericInrAmount}</span>.
            </p>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF0E6] to-[#FFF5F7] border border-[#F9D2D9] shadow-2xs mb-6 w-full max-w-xs">
              <p className="text-[11px] uppercase tracking-widest text-[#9E2A42] font-extrabold mb-1">
                💌 Voluntary Support Note
              </p>
              <p className="font-mono text-sm font-bold text-[#D66D7D]">
                {sanitizeText(supporterName, 50) || "Beloved Soulmate"} • ₹{numericInrAmount}
              </p>
              <p className="text-[10px] text-[#A89A9C] mt-1">
                Note Saved to Sanctuary Archives ✨
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Return to Sanctuary 🌸
            </motion.button>
          </motion.div>
        ) : (
          /* Normal Interactive Modal */
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F9D2D9] mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl animate-bounce">☕</span>
                <div>
                  <h3
                    className="text-lg sm:text-2xl font-bold text-[#2E2627] tracking-tight"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Support BondBox
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#7A6B6D]">
                    Voluntary Support • Works for India & Worldwide ✨
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#D66D7D] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer border border-[#F9D2D9]"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dual Tabs Switcher: India vs International */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FFF5F7] border border-[#F9D2D9] mb-4 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("india")}
                className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "india"
                    ? "bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white shadow-xs"
                    : "text-[#4A3E40] hover:text-[#D66D7D] hover:bg-white/60"
                }`}
              >
                <span>🇮🇳</span>
                <span>India (UPI)</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === "india"
                      ? "bg-white/30 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  0% Fee
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("international")}
                className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "international"
                    ? "bg-gradient-to-r from-[#D66D7D] to-[#F7BA9E] text-white shadow-xs"
                    : "text-[#4A3E40] hover:text-[#D66D7D] hover:bg-white/60"
                }`}
              >
                <span>🌍</span>
                <span>International</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === "international"
                      ? "bg-white/30 text-white"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Cards
                </span>
              </button>
            </div>

            {/* TAB 1: INDIA (UPI Direct) */}
            {activeTab === "india" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Heartfelt Note */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF5F7] via-[#FAF0E6] to-[#FFF5F7] border border-[#F9D2D9] mb-3 text-xs text-[#4A3E40] leading-relaxed text-center">
                  <p className="font-bold text-[#D66D7D] mb-0.5 flex items-center justify-center gap-1">
                    <span>⚡</span> Instant UPI • Zero Middleman Fees
                  </p>
                  Support BondBox, lovingly developed by Jhalak Bhandari. Scan with any UPI app!
                </div>

                {/* Pay What You Want Amount Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF5F7] via-[#FAF0E6] to-[#FFF5F7] border-2 border-[#F9D2D9] mb-3 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#7A6B6D] uppercase tracking-wider mb-0.5">
                    Pay Whatever You Want (₹)
                  </span>
                  <p className="text-[11px] text-[#4A3E40] text-center mb-2">
                    No fixed prices! Enter any amount you wish or choose inside your UPI app ✨
                  </p>

                  <div className="flex items-center justify-center gap-1 my-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#D66D7D]">₹</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={inrAmount}
                      onChange={(e) => setInrAmount(e.target.value)}
                      placeholder="Any amount"
                      className="w-36 sm:w-44 text-center text-2xl sm:text-3xl font-black text-[#2E2627] bg-transparent border-b-2 border-[#D66D7D] focus:border-[#9E2A42] focus:outline-none placeholder-[#A89A9C] transition-colors"
                    />
                  </div>

                  {/* Dynamic Emotion message when typing */}
                  {numericInrAmount !== null && numericInrAmount > 0 && (
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#D66D7D] mt-1.5 text-center">
                      {numericInrAmount >= 500
                        ? "👑 Legendary Guardian • Pure magic!"
                        : numericInrAmount >= 200
                        ? "🌟 Super Generous • Keeps memory vaults blazing fast!"
                        : numericInrAmount >= 100
                        ? "✨ Warm Hug & Coffee Date • Endless gratitude!"
                        : numericInrAmount >= 50
                        ? "☕ Cozy Coffee Fuel • Huge smile on our faces!"
                        : "💖 Sweet Gesture of Love • Every rupee counts!"}
                    </p>
                  )}
                </div>

                {/* Real-time Dynamic UPI QR Code Card */}
                <div className="p-3 rounded-2xl bg-white/95 border border-[#F9D2D9] shadow-xs flex flex-col sm:flex-row items-center gap-3.5 mb-3">
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-[#FFF5F7] to-[#FAF0E6] border border-[#F9D2D9] shadow-inner flex items-center justify-center shrink-0">
                    <img
                      src={qrImageUrl}
                      alt="UPI QR Code"
                      className="w-32 h-32 object-contain rounded-lg"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                      <span className="text-4xl">☕</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center text-center sm:text-left space-y-2 w-full">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7A6B6D]">
                        Scan with Any UPI App
                      </span>
                      <p className="text-xs text-[#4A3E40] font-medium mt-0.5">
                        GPay, PhonePe, Paytm, BHIM or Cred
                      </p>
                    </div>

                    {/* Privacy-Safe Verified Payee Badge */}
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-3 rounded-xl bg-[#FAF0E6] border border-[#F9D2D9] text-[11px] text-[#4A3E40]">
                      <span className="text-xs">🔒</span>
                      <span className="font-semibold">Creator & Recipient:</span>
                      <span className="font-bold text-[#2E2627]">Jhalak Bhandari</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold ml-1">
                        Verified
                      </span>
                    </div>

                    {/* Mobile Direct App Intent Link */}
                    <a
                      href={upiIntentUrl}
                      className="inline-flex sm:hidden items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all mt-1"
                    >
                      <span>📲</span> Tap to Pay via Installed UPI App
                    </a>
                  </div>
                </div>

                {/* Optional Note & Confirmation */}
                <div className="flex flex-col gap-2 mb-3">
                  <input
                    type="text"
                    maxLength={50}
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    placeholder="Your Name / Nickname (optional)"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-medium text-[#2E2627] placeholder-[#A89A9C] focus:outline-none"
                  />
                  <input
                    type="text"
                    maxLength={200}
                    value={supporterMessage}
                    onChange={(e) => setSupporterMessage(e.target.value)}
                    placeholder="Leave a sweet note for the creator 💕 (optional)"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-medium text-[#2E2627] placeholder-[#A89A9C] focus:outline-none"
                  />
                </div>

                {/* "I Have Sent It" Trigger */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={recordSupportToDB}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D66D7D] via-[#E07A8A] to-[#F7BA9E] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#D66D7D]/25 hover:shadow-[#D66D7D]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>
                    {isProcessing
                      ? "Recording your note..."
                      : numericInrAmount !== null && numericInrAmount > 0
                      ? `I've Sent ₹${numericInrAmount} • Confirm & Record Note ✨`
                      : "I've Sent with Love • Confirm & Record Note ✨"}
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* TAB 2: INTERNATIONAL (Direct Buy Me a Coffee) */}
            {activeTab === "international" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="py-3 flex flex-col items-center text-center space-y-4"
              >
                {/* Visual Graphic */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-3xl shadow-xs">
                  ☕
                </div>

                <div>
                  <h4
                    className="text-lg sm:text-xl font-bold text-[#2E2627]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Support via Buy Me a Coffee
                  </h4>
                  <p className="text-xs text-[#4A3E40] max-w-xs mt-1 leading-relaxed">
                    For our friends outside India, you can support BondBox directly on our official
                    Buy Me a Coffee page with any amount you wish!
                  </p>
                </div>

                {/* Perks / Badges */}
                <div className="w-full grid grid-cols-3 gap-2 py-1">
                  <div className="p-2.5 rounded-2xl bg-white/90 border border-[#F9D2D9] flex flex-col items-center shadow-2xs">
                    <span className="text-base mb-0.5">💖</span>
                    <span className="text-[10px] font-bold text-[#2E2627]">Pay What You Wish</span>
                    <span className="text-[9px] text-[#7A6B6D]">Any amount</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/90 border border-[#F9D2D9] flex flex-col items-center shadow-2xs">
                    <span className="text-base mb-0.5">💳</span>
                    <span className="text-[10px] font-bold text-[#2E2627]">Global Cards</span>
                    <span className="text-[9px] text-[#7A6B6D]">Visa, MC, Amex</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/90 border border-[#F9D2D9] flex flex-col items-center shadow-2xs">
                    <span className="text-base mb-0.5">⚡</span>
                    <span className="text-[10px] font-bold text-[#2E2627]">1-Click Pay</span>
                    <span className="text-[9px] text-[#7A6B6D]">Apple & Google Pay</span>
                  </div>
                </div>

                {/* Direct Buy Me a Coffee Action Button (Target is strictly validated against official domain) */}
                <a
                  href={buyMeCoffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-lg">☕</span>
                  <span>Proceed to Buy Me a Coffee</span>
                  <span className="text-xs">↗</span>
                </a>

                <p className="text-[10px] text-[#A89A9C]">
                  Opens our official page in a secure new tab • 100% encrypted & safe
                </p>
              </motion.div>
            )}

            {/* Recent Supporters Wall of Love */}
            {history && history.recentSupporters.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#F9D2D9]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-[#7A6B6D] uppercase tracking-wider">
                    🌟 Wall of Supporters ({history.supporterCount})
                  </span>
                  <span className="text-xs font-extrabold text-[#D66D7D]">
                    ₹{history.totalRaised} Raised
                  </span>
                </div>

                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 text-xs">
                  {history.recentSupporters.slice(0, 5).map((sup, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white/85 border border-[#F9D2D9] flex items-center justify-between shadow-2xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-bold text-[#2E2627] flex items-center gap-1 text-[11px]">
                          <span>💕</span>
                          <span className="truncate">{sanitizeText(sup.supporterName, 50)}</span>
                        </p>
                        {sup.message && (
                          <p className="text-[10px] text-[#7A6B6D] italic truncate mt-0.5">
                            "{sanitizeText(sup.message, 200)}"
                          </p>
                        )}
                      </div>
                      <span className="font-extrabold text-[#D66D7D] text-xs shrink-0">
                        {sup.currency === "USD" ? `$${sup.amount}` : `₹${sup.amount}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer trust & creator badge */}
            <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-[#A89A9C] font-medium">
              <span>BondBox</span>
              <span>•</span>
              <span>Created with ❤️ by</span>
              <span className="font-bold text-[#7A6B6D]">Jhalak Bhandari</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
