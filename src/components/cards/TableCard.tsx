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
        flex items-center font-semibold justify-center rounded-[10px] border-3
        ${size === "small" ? "w-18 h-18" : "w-48 h-20"} 
        ${
          disabled
            ? "bg-gray-400 text-white cursor-not-allowed"
            : active
            ? "bg-orange-600 text-white border-orange-600"
            : "border-orange-600 hover:bg-orange-100"
        }
      `}
    >
      {label}
    </button>
  );
}
