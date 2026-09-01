import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { useState } from "react";

export default function DownloadPDFButton({ roomId }: { roomId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      setIsLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/exports/pdf/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        let errorMsg = "Failed to download PDF";
        try {
          const data = await res.json();
          if (data?.error) errorMsg = data.error;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMsg);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `memories-${roomId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Timeline PDF exported successfully! 📄✨");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={downloadPDF}
      disabled={isLoading}
      className="w-full text-left px-3.5 py-2.5 rounded-xl text-[#4A3E40] hover:bg-[#FFF5F7] hover:text-[#D66D7D] font-medium transition-colors flex items-center justify-between cursor-pointer disabled:opacity-60 text-xs"
    >
      <div className="flex items-center gap-2">
        <span>📄</span>
        <span>Export Keepsake (PDF)</span>
      </div>
      {isLoading && <Spinner size={14} thickness={2} speed="fast" />}
    </button>
  );
}

