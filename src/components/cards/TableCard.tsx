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
        flex items-center justify-center rounded-xl border-2
        ${size === "small" ? "w-20 h-12" : "w-48 h-16"} 
        ${
          disabled
            ? "bg-gray-400 text-white cursor-not-allowed"
            : active
            ? "bg-orange-500 text-white border-orange-500"
            : "border-orange-500 hover:bg-orange-100"
        }
      `}
    >
      {label}
    </button>
  );
}
