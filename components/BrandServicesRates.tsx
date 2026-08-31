"use client";

import React, { useState } from "react";
import { soundFX } from "@/lib/soundEffects";
import { formatUSD, formatVES } from "@/lib/utils";
import { Users, Clock, Flame, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";

interface BrandServicesRatesProps {
  bcvRate: number;
  onSelectService?: (serviceType: "bowling" | "pool") => void;
}

export function BrandServicesRates({ bcvRate, onSelectService }: BrandServicesRatesProps) {
  return (
    <section id="tarifas-oficiales" className="py-12 sm:py-20 bg-[#040814] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#0033CC] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Servicios & Tarifas Oficiales 1963</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic retro-3d-text-blue leading-tight">
            Pistas de Bowling & Mesas de Pool
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Tarifas oficiales publicadas por hora. Recibimos en Bolívares a tasa oficial BCV en vivo, Zelle, Binance Pay y efectivo.
          </p>
        </div>

        {/* 2 Official Flyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* FLYER 1: PinZulia IS BACK! (Bowling $25 + Zapatos $2,5) */}
          <div className="relative rounded-3xl bg-[#0033CC] p-5 sm:p-8 md:p-9 shadow-2xl border-2 sm:border-4 border-white/20 flex flex-col justify-between space-y-5 select-none overflow-hidden group hover:scale-[1.01] transition-transform">
            {/* Background Bowling Pin Silhouette */}
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 240" className="w-44 h-64 fill-white">
                <path d="M50 8C40 8 36 20 36 34C36 48 40 60 38 78C34 110 14 140 14 190C14 225 30 236 50 236C70 236 86 225 86 190C86 140 66 110 62 78C60 60 64 48 64 34C64 20 60 8 50 8Z" />
              </svg>
            </div>

            <div className="space-y-4 sm:space-y-6 relative z-10">
              {/* Header: PinZulia IS BACK! */}
              <div className="text-center space-y-0.5">
                <div className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tight font-sans">
                  PinZulia
                </div>
                <div className="text-xl sm:text-3xl font-black text-[#ED1C24] uppercase italic tracking-wider drop-shadow-md">
                  IS BACK!
                </div>
              </div>

              {/* Main Service Box: PISTA $25 */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white/10 border-2 border-white/30 backdrop-blur-sm space-y-3 sm:space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tight retro-3d-text-red">
                    PISTA
                  </span>
                  <span className="text-3xl sm:text-5xl font-black text-white font-mono retro-3d-text-red">
                    $25
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-base font-bold text-white font-mono">
                  <span className="flex items-center gap-1 bg-black/30 px-2.5 sm:px-3 py-1 rounded-xl">
                    <Users className="w-3.5 h-3.5 text-sky-300" />
                    <span>5 personas</span>
                  </span>
                  <span className="flex items-center gap-1 bg-black/30 px-2.5 sm:px-3 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-[#ED1C24]" />
                    <span>1 hora</span>
                  </span>
                </div>

                <div className="text-[10px] sm:text-xs text-sky-200 font-mono font-bold pt-1">
                  ≈ {formatVES(25, bcvRate)} a tasa BCV en vivo
                </div>
              </div>

              {/* Shoe Rental Box: Zapatos $2,5 */}
              <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-between gap-2">
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white uppercase italic tracking-wider">
                    <span className="text-[#ED1C24] drop-shadow">Zapatos</span>{" "}
                    <span className="text-white font-mono">$2,5</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-300 font-sans block">
                    Calzado sanitizado UV por jugador
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 sm:px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0">
                  ≈ {formatVES(2.5, bcvRate)}
                </span>
              </div>
            </div>

            {/* Bottom Schedule & CTA */}
            <div className="space-y-3 pt-1 sm:pt-2 relative z-10">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/90 font-mono border-t border-white/20 pt-2.5">
                <span className="font-bold">Abiertos hoy:</span>
                <span className="bg-white text-[#0033CC] font-black px-2 py-0.5 rounded-md text-[10px] sm:text-xs">
                  Desde las 5:00 P.M.
                </span>
              </div>

              <a
                href="#reservas"
                onClick={() => {
                  soundFX.playClick();
                  if (onSelectService) onSelectService("bowling");
                }}
                className="btn-tactile w-full py-3 sm:py-3.5 rounded-2xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider shadow-xl flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer"
              >
                <span>Reservar Pista de Bowling ($25)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* FLYER 2: PinZulia POOL ($20 / 1h / 4 personas) */}
          <div className="relative rounded-3xl bg-[#0033CC] p-5 sm:p-8 md:p-9 shadow-2xl border-2 sm:border-4 border-white/20 flex flex-col justify-between space-y-5 select-none overflow-hidden group hover:scale-[1.01] transition-transform">
            {/* Background 3D Pool Triangle Watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-48 sm:w-56 h-48 sm:h-56 stroke-white" fill="none" strokeWidth="12">
                <polygon points="100,20 180,170 20,170" />
              </svg>
            </div>

            <div className="space-y-4 sm:space-y-6 relative z-10">
              {/* Header: PinZulia POOL */}
              <div className="text-center space-y-0.5">
                <div className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight font-sans">
                  PinZulia
                </div>
                <div className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight retro-3d-text-red leading-none">
                  POOL
                </div>
              </div>

              {/* Pool Triangle 3D Graphic */}
              <div className="flex justify-center py-1">
                <div className="relative w-28 sm:w-36 h-20 sm:h-28 flex items-center justify-center">
                  <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-2xl" fill="none">
                    {/* Outer Triangle Frame */}
                    <path
                      d="M80 15L145 125H15L80 15Z"
                      stroke="#FFFFFF"
                      strokeWidth="14"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Triangle 3D Bottom Lip */}
                    <path
                      d="M15 125L25 135H135L145 125"
                      stroke="#ED1C24"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Main Service Box: MESA DE POOL $20 */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white/10 border-2 border-white/30 backdrop-blur-sm space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                  <div>
                    <div className="text-[10px] sm:text-xs font-black text-[#ED1C24] uppercase font-mono">
                      MESA
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-white uppercase italic leading-none">
                      DE POOL
                    </div>
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-white font-mono retro-3d-text-red">
                    $20
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-base font-bold text-white font-mono">
                  <span className="flex items-center gap-1 bg-black/30 px-2.5 sm:px-3 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-[#ED1C24]" />
                    <span>1 HORA</span>
                  </span>
                  <span className="flex items-center gap-1 bg-black/30 px-2.5 sm:px-3 py-1 rounded-xl">
                    <Users className="w-3.5 h-3.5 text-sky-300" />
                    <span>4 PERSONAS</span>
                  </span>
                </div>

                <div className="text-center text-[10px] sm:text-xs text-sky-200 font-mono font-bold">
                  ≈ {formatVES(20, bcvRate)} a tasa BCV en vivo
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="space-y-3 pt-1 sm:pt-2 relative z-10">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/90 font-mono border-t border-white/20 pt-2.5">
                <span className="font-bold">Equipamiento:</span>
                <span className="bg-white text-[#0033CC] font-black px-2 py-0.5 rounded-md text-[10px] sm:text-xs">
                  Tacos & Bolas Diamond
                </span>
              </div>

              <a
                href="#reservas"
                onClick={() => {
                  soundFX.playClick();
                  if (onSelectService) onSelectService("pool");
                }}
                className="btn-tactile w-full py-3 sm:py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#0033CC] font-black text-xs uppercase italic tracking-wider shadow-xl flex items-center justify-center gap-2 border-2 border-[#0033CC] cursor-pointer"
              >
                <span>Reservar Mesa de Pool ($20)</span>
                <ArrowRight className="w-4 h-4 text-[#ED1C24]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}