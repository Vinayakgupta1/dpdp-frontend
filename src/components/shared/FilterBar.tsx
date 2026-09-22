import React from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  label: string;
  options: FilterOption[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterBar({
  label,
  options,
  active,
  onChange,
  className = "",
}: FilterBarProps): React.JSX.Element {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-semibold text-slate-300">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              active === option.value
                ? "bg-cyan-600 text-white"
                : "border border-navy-500 bg-navy-800 text-slate-300 hover:bg-navy-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
