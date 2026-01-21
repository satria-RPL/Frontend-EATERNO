"use client";

interface TableCardProps {
  label: number | string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
  size?: "small" | "large";
}

export default function TableCard({
  label,
  disabled,
  active,
  onClick,
  size = "small",
}: TableCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center rounded-[10px] border-2 text-sm font-semibold transition
        ${size === "small" ? "w-14 h-14 sm:w-16 sm:h-16" : "w-28 h-12 sm:w-32 sm:h-14"} 
        ${
          disabled
            ? "bg-gray-300 text-white cursor-not-allowed border-gray-300"
            : active
            ? "bg-orange-600 text-white border-orange-600"
            : "border-orange-600 text-[#1c1c1c] hover:bg-orange-100"
        }
      `}
    >
      {label}
    </button>
  );
}
