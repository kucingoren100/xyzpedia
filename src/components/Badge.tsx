import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "mint-pop" | "sunburst" | "electric-blue" | "lavender" | "ember" | "voltage-violet" | "paper-white";
  className?: string;
}

export default function Badge({ children, variant = "mint-pop", className = "" }: BadgeProps) {
  const variantStyles = {
    "mint-pop": "bg-[#55db9c] text-carbon",
    sunburst: "bg-[#ffd731] text-carbon",
    "electric-blue": "bg-[#4da2ff] text-white",
    lavender: "bg-[#e9ccff] text-carbon",
    ember: "bg-[#fb4903] text-white",
    "voltage-violet": "bg-[#5c4ade] text-white",
    "paper-white": "bg-[#ffffff] text-carbon",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide border-2 border-carbon rounded-full shadow-[2px_2px_0px_0px_#000000] ${variantStyles[variant] || variantStyles["mint-pop"]} ${className}`}
    >
      {children}
    </span>
  );
}
