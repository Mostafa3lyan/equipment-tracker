import { useMemo, useState } from "react";

import { normalize } from "./utils/normalize";
import { Camera, Laptop } from "lucide-react";
import { equipments } from "./data/equipment";
import SearchBar from "./components/search-bar";
import EquipmentCard from "./components/equipment-card";
import CameraScanner from "./components/camera-scanner";

function App() {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Instant fuzzy matches
  const matchedEquipment = useMemo(() => {
    const cleanQuery = normalize(query);
    if (!cleanQuery) return null;

    return (
      equipments.find((item) => normalize(item.equipmentNo) === cleanQuery) ||
      null
    );
  }, [query]);

  const handleCameraScanSuccess = (decodedText: string) => {
    setQuery(decodedText);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-md">
        {/* Header Branding */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Laptop size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Equipment Tracker
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Hospital Inventory verification portal
          </p>
        </header>

        {/* Input Interface */}
        <div className="space-y-4">
          <SearchBar value={query} onChange={setQuery} />

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              or
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={() => setIsScanning(true)}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <Camera size={18} />
            Scan Equipment barcode
          </button>
        </div>

        {/* Dynamic State Feedback */}
        {query && matchedEquipment && (
          <EquipmentCard equipment={matchedEquipment} />
        )}

        {query && !matchedEquipment && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
            <span className="block text-2xl mb-1">❌</span>
            <h3 className="font-bold text-red-800">No match found</h3>
            <p className="text-xs text-red-600/80 mt-1 font-mono">"{query}"</p>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Ensure you typed it correctly or that the scanned code represents
              the exact Equipment No.
            </p>
          </div>
        )}

        {/* Camera overlay */}
        {isScanning && (
          <CameraScanner
            onScanSuccess={handleCameraScanSuccess}
            onClose={() => setIsScanning(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
