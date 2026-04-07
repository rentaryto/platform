import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Logo de Rentaryto usando el ícono Building2 de lucide-react
 * SVG extraído directamente de lucide-react/icons/building-2
 */
export function LogoIcon({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <div className="bg-blue-600 p-2 rounded-lg">
        <LogoIcon size={20} className="text-white" />
      </div>
      <span className="text-lg font-bold">Rentaryto</span>
    </div>
  );
}
