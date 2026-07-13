import { Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type Equipment No (e.g. L0100-0007)..."
        className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-lg shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
