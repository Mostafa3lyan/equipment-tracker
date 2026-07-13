import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  type Html5QrcodeCameraScanConfig,
  type CameraDevice,
} from "html5-qrcode";
import { Camera, RefreshCw, SwitchCamera } from "lucide-react";

interface Props {
  onScanSuccess: (text: string) => void;
  onClose: () => void;
}

const FRONT_KEYWORDS = ["front", "user", "face", "selfie"];

function isLikelyFrontCamera(label: string) {
  const lower = label.toLowerCase();
  return FRONT_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Pick the best default camera: first one NOT labeled as front-facing. */
function pickDefaultCameraIndex(devices: CameraDevice[]) {
  const index = devices.findIndex((d) => !isLikelyFrontCamera(d.label));
  return index !== -1 ? index : 0;
}

const SCAN_CONFIG: Html5QrcodeCameraScanConfig = {
  fps: 15,
  qrbox: (width, height) => {
    const boxWidth = Math.min(width, height) * 0.85;
    const boxHeight = boxWidth * 0.4;
    return { width: boxWidth, height: boxHeight };
  },
};

const FORMATS_TO_SUPPORT = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
];

export default function CameraScanner({ onScanSuccess, onClose }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startTokenRef = useRef(0); // guards against races when switching fast
  const elementId = "camera-scanner-viewfinder";

  const handleStop = async () => {
    const instance = scannerRef.current;
    if (instance && instance.isScanning) {
      try {
        await instance.stop();
        instance.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const startScanning = async (cameraId: string) => {
    if (!scannerRef.current) return;

    const token = ++startTokenRef.current;
    await handleStop();
    if (token !== startTokenRef.current) return; // a newer switch happened

    setErrorMsg(null);

    try {
      await scannerRef.current.start(
        cameraId,
        SCAN_CONFIG,
        (decodedText) => {
          onScanSuccess(decodedText);
          handleStop();
        },
        () => {}, // per-frame decode failures, ignore
      );
    } catch (err) {
      console.error("Failed to start scanner with camera:", cameraId, err);
      setErrorMsg("Failed to start the selected camera.");
    }
  };

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode(elementId, {
      formatsToSupport: FORMATS_TO_SUPPORT,
      verbose: false,
    });
    scannerRef.current = html5Qrcode;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          throw new Error("No cameras found on this device.");
        }
        setCameras(devices);

        const defaultIndex = pickDefaultCameraIndex(devices);
        setCurrentCameraIndex(defaultIndex);
        startScanning(devices[defaultIndex].id);
      })
      .catch((err) => {
        console.error("Error fetching camera list:", err);
        setErrorMsg(
          "Could not access the camera. Check that permission was granted.",
        );
      });

    return () => {
      handleStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    startScanning(cameras[nextIndex].id);
  };

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

        {/* Footer info & Controls */}
        <div className="bg-gray-950 p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-left truncate">
            {cameras[currentCameraIndex]?.label || "Initializing lens..."}
          </p>

          {cameras.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              className="flex items-center gap-2 shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <SwitchCamera size={16} />
              Switch Lens
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
