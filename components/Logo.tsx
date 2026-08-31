"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ size = "md", showTagline = true }: LogoProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <Link href="/" className="flex items-center gap-2.5 group focus:outline-none select-none">
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-red-600 p-0.5 shadow-md shadow-sky-500/20 group-hover:shadow-sky-400/40 transition-all duration-300 ${
          isSm ? "w-8 h-8" : isLg ? "w-12 h-12" : "w-9 h-9"
        }`}
      >
        <div className="w-full h-full bg-[#040814] rounded-[10px] flex items-center justify-center overflow-hidden relative">
          <div className="text-base select-none group-hover:scale-110 transition-transform duration-200">
            🎳
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight text-white uppercase italic ${
              isSm ? "text-base" : isLg ? "text-xl" : "text-lg"
            }`}
          >
            PIN<span className="text-sky-400">ZULIA</span>
          </span>
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-black px-1 py-0.2 rounded font-mono uppercase tracking-wider">
            1963
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
            Bowling & Gastropub
          </span>
        )}
      </div>
    </Link>
  );
}