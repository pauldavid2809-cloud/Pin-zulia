"use client";

import React, { useState } from "react";
import Image from "next/image";
import { soundFX } from "@/lib/soundEffects";
import { BrandScheduleWidget } from "./BrandScheduleWidget";
import {
  Play,
  Sparkles,
  Calendar,
  UtensilsCrossed,
  ShieldCheck,
  X,
  ArrowUpRight,
  Clock,
  Flame,
  Zap,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface HeroProps {
  onReserveClick: () => void;
  onMenuClick: () => void;
}

export function Hero({ onReserveClick, onMenuClick }: HeroProps) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="relative min-h-[85dvh] flex items-center justify-center overflow-hidden pt-8 pb-16 lg:py-16 bg-[#040814]">
      {/* Background Ambient Glow Lights */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] bg-[#ED1C24]/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#0033CC]/20 rounded-full blur-[140px]" />
      </div>

      {/* Ghost Outlined Background Text */}
      <div className="absolute top-10 left-0 right-0 text-center pointer-events-none opacity-10 overflow-hidden select-none -z-5">
        <div className="text-7xl sm:text-9xl font-black uppercase italic tracking-tighter retro-ghost-outline-white leading-none">
          PINZULIA BOWLING 1963
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Typography & Pitch */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Heritage Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0033CC] text-white text-xs font-black uppercase tracking-wider shadow-lg border border-white/20">
              <span className="text-[#ED1C24] text-sm">ðŸ’¥</span>
              <span>BOWLING BOUTIQUE & GASTROPUB 1963</span>
            </div>

            {/* Main Brand Title with 3D Cobalt Blue Extrusion */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight uppercase italic leading-[1.05] retro-3d-text-blue">
                DONDE CADA TIRO ES UNA FIESTA
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed pt-2">
                14 pistas computarizadas Brunswick™, gastronomía de gastropub con Pinsas Romanas 72h, cócteles de autor y noches electrizantes de Glow UV en 5 de Julio.
              </p>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  onReserveClick();
                }}
                className="btn-tactile flex items-center gap-2 bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-red-600/30 text-sm uppercase italic tracking-wider border-2 border-white/30 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar por QR</span>
                <ArrowUpRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onMenuClick();
                }}
                className="btn-tactile flex items-center gap-2 bg-[#0033CC] hover:bg-[#002299] text-white font-black px-5 py-3.5 rounded-2xl border-2 border-white/20 text-sm uppercase italic tracking-wider cursor-pointer shadow-lg shadow-blue-900/30"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Carta Gastropub</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setVideoModalOpen(true);
                }}
                className="btn-tactile flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold px-4 py-3.5 rounded-2xl border border-white/10 text-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#ED1C24] fill-current" />
                <span>Ver Reel</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 text-left font-mono">
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3">
                <div className="text-lg font-black text-white">14</div>
                <div className="text-[10px] text-slate-400 font-sans font-bold">
                  Pistas Brunswick™
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3">
                <div className="text-lg font-black text-[#ED1C24]">72h</div>
                <div className="text-[10px] text-slate-400 font-sans font-bold">
                  Pinsas Romanas
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3">
                <div className="text-lg font-black text-sky-400">3s</div>
                <div className="text-[10px] text-slate-400 font-sans font-bold">
                  Pago Móvil Auto
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3">
                <div className="text-lg font-black text-amber-400">UV</div>
                <div className="text-[10px] text-slate-400 font-sans font-bold">
                  Glow Bowling Nights
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Official Brand Schedule Graphic Widget */}
          <div id="horarios" className="lg:col-span-6 flex justify-center lg:justify-end w-full">
            <BrandScheduleWidget onReserveClick={onReserveClick} />
          </div>
        </div>
      </div>

      {/* Video / Reel Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-slate-950 rounded-3xl border-2 border-[#ED1C24]/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#ED1C24]" />
                <h3 className="font-black text-white uppercase italic text-base">
                  Experiencia PinZulia Bowling Boutique
                </h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl bg-slate-900 border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#ED1C24]/20 border-2 border-[#ED1C24] flex items-center justify-center text-[#ED1C24]">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <div>
                <h4 className="font-black text-white text-lg uppercase italic">
                  Glow UV Party & Torneos Semanales
                </h4>
                <p className="text-xs text-slate-400 max-w-md pt-1">
                  14 pistas computarizadas, coctelería neón, DJ residente y la mejor pinsa romana de Maracaibo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}