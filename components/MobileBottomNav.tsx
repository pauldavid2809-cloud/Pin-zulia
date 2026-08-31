"use client";

import React from "react";
import { soundFX } from "@/lib/soundEffects";
import { QrCode, ShieldCheck, MapPin, Calendar } from "lucide-react";

interface MobileBottomNavProps {
  onReserveClick: () => void;
  onOpenManager: () => void;
}

export function MobileBottomNav({
  onReserveClick,
  onOpenManager,
}: MobileBottomNavProps) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#040814]/95 backdrop-blur-md border-t-2 border-white/20 px-4 py-2.5 flex items-center justify-between shadow-2xl">
      <a
        href="#tarifas-oficiales"
        onClick={() => soundFX.playClick()}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-[10px] font-mono font-bold">Tarifas</span>
      </a>

      {/* Main QR Reserve Button */}
      <button
        onClick={() => {
          soundFX.playClick();
          onReserveClick();
        }}
        className="btn-tactile px-5 py-2.5 rounded-2xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/40 border border-white/30 cursor-pointer"
      >
        <QrCode className="w-4 h-4 text-amber-300" />
        <span>Reservar por QR</span>
      </button>

      <a
        href="#ubicacion"
        onClick={() => soundFX.playClick()}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
      >
        <MapPin className="w-4 h-4 text-sky-400" />
        <span className="text-[10px] font-mono font-bold">Ubicación</span>
      </a>

      <button
        onClick={() => {
          soundFX.playClick();
          onOpenManager();
        }}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
        title="Recepción / Admin"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-[10px] font-mono font-bold">Admin</span>
      </button>
    </div>
  );
}
