import { useState } from "react";
import {
  Check,
  Copy,
  Tag,
  Compass,
  Landmark,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import type { Equipment } from "../types";

interface Props {
  equipment: Equipment;
}

export default function EquipmentCard({ equipment }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(equipment.equipmentNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-xl transition-all hover:shadow-2xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-green-50 px-6 py-4 border-b border-green-100">
        <span className="flex items-center gap-2 font-semibold text-green-700">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          Equipment Found
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy No.</span>
            </>
          )}
        </button>
      </div>

      {/* Info Rows */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100/50">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Compass size={14} /> Equipment No.
            </span>
            <span className="text-lg font-mono font-bold text-gray-800">
              {equipment.equipmentNo}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100/50">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Landmark size={14} /> Room
            </span>
            <span className="text-lg font-bold text-gray-800">
              {equipment.room}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-gray-400">
              <Tag size={18} />
            </span>
            <div>
              <span className="block text-xs font-semibold text-blue-400 uppercase">
                Description
              </span>
              <span className="text-gray-800 font-medium">
                {equipment.description}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-gray-50 pt-3">
            <span className="mt-1 text-gray-400">
              <Briefcase size={18} />
            </span>
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">
                Brand
              </span>
              <span className="text-gray-800 font-medium">
                {equipment.brand}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-gray-50 pt-3">
            <span className="mt-1 text-gray-400">
              <HelpCircle size={18} />
            </span>
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">
                Model
              </span>
              <span className="text-gray-800 font-medium">
                {equipment.model || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
