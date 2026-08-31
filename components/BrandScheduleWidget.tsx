"use client";

import React from "react";
import { Sparkles, Clock, Calendar, Flame } from "lucide-react";
import { soundFX } from "@/lib/soundEffects";

interface BrandScheduleWidgetProps {
  onReserveClick?: () => void;
  compact?: boolean;
}

export function BrandScheduleWidget({ onReserveClick, compact = false }: BrandScheduleWidgetProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl bg-[#ED1C24] p-4 sm:p-7 md:p-10 shadow-2xl overflow-hidden border-2 sm:border-4 border-white/20 select-none">
      {/* Background Ghost Outlined Typography */}
      <div className="absolute top-1 sm:top-2 left-0 right-0 text-center pointer-events-none opacity-25 overflow-hidden">
        <div className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter retro-ghost-outline-white leading-none">
          HORARIO
        </div>
        <div className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter retro-ghost-outline-white leading-none -mt-2 sm:-mt-4">
          HORARIO
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 space-y-4 sm:space-y-6">
        {/* Header with NUEVO Badge and 3D Extruded Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-[#0033CC] text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md">
            <span>NUEVO</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase italic tracking-tight retro-3d-text-blue leading-none">
            HORARIO
          </h2>
        </div>

        {/* Schedule Cards Section */}
        <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
          {/* Card 1: Lunes a Jueves with Bowling Pin */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Retro Bowling Pin Mascot Graphic */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 100 240"
                className="w-10 sm:w-14 md:w-16 h-24 sm:h-32 md:h-36 drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Bowling Pin Body */}
                <path
                  d="M50 8C40 8 36 20 36 34C36 48 40 60 38 78C34 110 14 140 14 190C14 225 30 236 50 236C70 236 86 225 86 190C86 140 66 110 62 78C60 60 64 48 64 34C64 20 60 8 50 8Z"
                  fill="#FFFFFF"
                  stroke="#0033CC"
                  strokeWidth="6"
                />
                {/* Red Neck Stripes */}
                <path d="M37 54C42 56 58 56 63 54" stroke="#ED1C24" strokeWidth="7" strokeLinecap="round" />
                <path d="M37 68C42 70 58 70 63 68" stroke="#ED1C24" strokeWidth="7" strokeLinecap="round" />
                {/* PZ Emblem */}
                <circle cx="50" cy="155" r="22" fill="#ED1C24" stroke="#0033CC" strokeWidth="4" />
                <text
                  x="50"
                  y="163"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="'Barlow Condensed', sans-serif"
                  fontWeight="900"
                  fontSize="22"
                  fontStyle="italic"
                >
                  PZ
                </text>
              </svg>
            </div>

            {/* Lunes - Jueves Two-Tone Card */}
            <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-white">
              <div className="py-1.5 sm:py-2 px-2 sm:px-4 bg-white text-center border-b-2 border-slate-200">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-[#0033CC] font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider font-mono">
                  <span>Lunes</span>
                  <span className="text-slate-300">|</span>
                  <span>Martes</span>
                  <span className="text-slate-300">|</span>
                  <span>Miércoles</span>
                  <span className="text-slate-300">|</span>
                  <span>Jueves</span>
                </div>
              </div>
              <div className="py-2.5 sm:py-3.5 px-2 sm:px-4 bg-[#ED1C24] text-center">
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
                  5:00 p.m. / 11:00 p.m.
                </div>
              </div>
            </div>
          </div>

          {/* Cards 2, 3, 4: Viernes, Sábado, Domingo (3 Columns Grid on tablets, 3 rows on tiny screens) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            {/* Viernes */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white flex flex-col">
              <div className="py-1 px-1 sm:px-2 bg-white text-center border-b-2 border-slate-200">
                <span className="text-[#0033CC] font-black text-[10px] sm:text-xs uppercase tracking-wider font-mono">
                  Viernes
                </span>
              </div>
              <div className="py-2 px-1 sm:px-2 bg-[#ED1C24] text-center flex-1 flex flex-col justify-center">
                <div className="text-xs sm:text-sm md:text-base font-black text-white font-mono leading-tight">
                  5:00 p.m.
                </div>
                <div className="text-xs sm:text-sm md:text-base font-black text-white font-mono leading-tight">
                  / 2:00 a.m.
                </div>
              </div>
            </div>

            {/* Sábado */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white flex flex-col">
              <div className="py-1 px-1 sm:px-2 bg-white text-center border-b-2 border-slate-200">
                <span className="text-[#0033CC] font-black text-[10px] sm:text-xs uppercase tracking-wider font-mono">
                  Sábado
                </span>
              </div>
              <div className="py-2 px-1 sm:px-2 bg-[#ED1C24] text-center flex-1 flex flex-col justify-center">
                <div className="text-xs sm:text-sm md:text-base font-black text-white font-mono leading-tight">
                  2:00 p.m.
                </div>
                <div className="text-xs sm:text-sm md:text-base font-black text-white font-mono leading-tight">
                  / 2:00 a.m.
                </div>
              </div>
            </div>

            {/* Domingo */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white flex flex-col">
              <div className="py-1 px-1 sm:px-2 bg-white text-center border-b-2 border-slate-200">
                <span className="text-[#0033CC] font-black text-[10px] sm:text-xs uppercase tracking-wider font-mono">
                  Domingo
                </span>
              </div>
              <div className="py-2 px-1 sm:px-2 bg-[#ED1C24] text-center flex-1 flex flex-col justify-center">
                <div className="text-xs sm:text-sm md:text-base font-black text-white font-mono leading-tight">
                  2:00 p.m.
                </div>
                <div className="text-xs sm:text-sm md:text-base font-black text-white font-mono leading-tight">
                  / 11:00 p.m.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Pill Badge: BOWLING DESDE 1963 */}
        <div className="pt-1 text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#0033CC] text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider shadow-xl border-2 border-white/30">
            <span>BOWLING</span>
            <span className="text-[#ED1C24] text-sm sm:text-base leading-none">ðŸ’¥</span>
            <span>DESDE 1963</span>
          </div>
        </div>

        {/* Optional Interactive CTA */}
        {onReserveClick && (
          <div className="pt-1 text-center">
            <button
              onClick={() => {
                soundFX.playClick();
                onReserveClick();
              }}
              className="btn-tactile w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#0033CC] font-black text-xs sm:text-sm uppercase italic tracking-wider shadow-2xl cursor-pointer border-2 border-[#0033CC] flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 text-[#ED1C24]" />
              <span>Reservar Pista en estos Horarios</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}