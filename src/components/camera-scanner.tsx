import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats, type Html5QrcodeCameraScanConfig } from "html5-qrcode";
import { Camera, RefreshCw } from "lucide-react";

interface Props {
  onScanSuccess: (text: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = "camera-scanner-viewfinder";

  // 1. Declare handleStop up here so it's lexically available to everything below
  const handleStop = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current?.clear())
        .catch((err) => console.error("Error stopping scanner", err));
    }
  };

  // 2. Now running the side effects safely
  useEffect(() => {
    const html5Qrcode = new Html5Qrcode(elementId);
    scannerRef.current = html5Qrcode;

    const qrCodeSuccessCallback = (decodedText: string) => {
      onScanSuccess(decodedText);
      handleStop();
    };

    const config = {
      fps: 15,
      qrbox: (width: number, height: number) => {
        const boxWidth = Math.min(width, height) * 0.85;
        const boxHeight = boxWidth * 0.35;
        return { width: boxWidth, height: boxHeight };
      },
      videoConstraints: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
        aspectRatio: { ideal: 1.7777777778 },
      },
    };

    const formatsToSupport = [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
    ];
    const scanConfig = { ...config, formatsToSupport } as Html5QrcodeCameraScanConfig | undefined ;

    html5Qrcode
      .start(
        { facingMode: { exact: "environment" } },
        scanConfig,
        qrCodeSuccessCallback,
        () => {},
      )
      .catch((err) => {
        console.warn(
          "Exact environment camera failed, trying loose facingMode...",
          err,
        );
        html5Qrcode
          .start(
            { facingMode: "environment" },
            scanConfig,
            qrCodeSuccessCallback,
            () => {},
          )
          .catch((fallbackErr) => {
            console.error(
              "All camera initialization attempts failed:",
              fallbackErr,
            );
            setErrorMsg("Camera access denied or device has no rear camera.");
          });
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
            <span className="font-medium text-sm">
              Align barcode inside frame
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative aspect-square w-full bg-black">
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
            Hold device steady. Ensure good lighting.
          </p>
        </div>
      </div>
    </div>
  );
}
