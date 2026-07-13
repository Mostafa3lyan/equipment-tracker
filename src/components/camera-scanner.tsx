import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, RefreshCw } from "lucide-react";

interface Props {
  onScanSuccess: (text: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = "camera-scanner-viewfinder";

  const handleStop = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current?.clear())
        .catch((err) => console.error("Error stopping scanner", err));
    }
  };

  useEffect(() => {
    // Instantiate Html5Qrcode on render
    const html5Qrcode = new Html5Qrcode(elementId);
    scannerRef.current = html5Qrcode;

    const qrCodeSuccessCallback = (decodedText: string) => {
      onScanSuccess(decodedText);
      handleStop();
    };

    const config = {
      fps: 10,
      qrbox: (width: number, height: number) => {
        const size = Math.min(width, height) * 0.7;
        return { width: size, height: size * 0.6 }; // Wider bounding box ideal for traditional barcodes
      },
    };

    // Attempt to open the environment-facing camera
    html5Qrcode
      .start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        () => {}, // Ignore frame analysis warnings/errors
      )
      .catch((err) => {
        console.error("Camera access failed:", err);
        setErrorMsg(
          "Could not access environment camera. Check browser permissions.",
        );
      });

    return () => {
      handleStop();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gray-900 shadow-2xl border border-gray-800">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2 text-white">
            <Camera size={18} className="text-blue-500 animate-pulse" />
            <span className="font-medium text-sm">Align code inside frame</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative aspect-video w-full bg-black">
          <div id={elementId} className="h-full w-full overflow-hidden" />

          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 px-6 text-center">
              <span className="text-sm text-red-400 mb-4">{errorMsg}</span>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                <RefreshCw size={14} /> Retry Permissions
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-gray-950 p-4 text-center">
          <p className="text-xs text-gray-500">
            Supports standard Barcodes and QR codes
          </p>
        </div>
      </div>
    </div>
  );
}
