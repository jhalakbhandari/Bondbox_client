import { toast } from "react-toastify";

export default function DownloadPDFButton({ roomId }: { roomId: string }) {
  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/exports/pdf/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // if (!res.ok) throw new Error("Failed to download PDF");
      if (!res.ok) {
        // try to parse backend JSON { error: "..." }
        let errorMsg = "Failed to download PDF";
        try {
          const data = await res.json();
          if (data?.error) errorMsg = data.error;
        } catch {
          // ignore JSON parse error, keep default
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
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <button
      onClick={downloadPDF}
      className="block w-full px-4 py-2 hover:bg-pink-100 rounded-lg"
    >
      Export Memories (PDF)
    </button>
  );
}
