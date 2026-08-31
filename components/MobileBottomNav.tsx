"use client";

import React from "react";
import {
  Calendar,
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  Trophy,
  Flame,
} from "lucide-react";
import { soundFX } from "@/lib/soundEffects";

interface MobileBottomNavProps {
  onReserveClick: () => void;
  onMenuClick: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

export function MobileBottomNav({
  onReserveClick,
  onMenuClick,
  onOpenCart,
  cartCount,
}: MobileBottomNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#040814]/95 backdrop-blur-lg border-t-2 border-[#ED1C24]/50 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl select-none">
      {/* 1. Pistas 01-14 */}
      <a
        href="#pistas"
        onClick={() => soundFX.playClick()}
        className="btn-tactile min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase text-slate-300 hover:text-white"
      >
        <span className="text-base leading-none">🎳</span>
        <span className="font-mono tracking-tight">Pistas</span>
      </a>

      {/* 2. Pool & Tarifas */}
      <a
        href="#tarifas-oficiales"
        onClick={() => soundFX.playClick()}
        className="btn-tactile min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase text-slate-300 hover:text-white"
      >
        <span className="text-base leading-none">🎱</span>
        <span className="font-mono tracking-tight">Pool & Precios</span>
      </a>

      {/* 3. Floating Center Action: Reservar */}
      <button
        onClick={() => {
          soundFX.playClick();
          onReserveClick();
        }}
        className="btn-tactile flex items-center gap-1.5 bg-[#ED1C24] hover:bg-[#D8001D] text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-xl shadow-red-600/40 -mt-5 border-2 border-white cursor-pointer active:scale-95 transition-transform uppercase italic tracking-wider"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Reservar</span>
      </button>

      {/* 4. Menú Gastropub */}
      <button
        onClick={() => {
          soundFX.playClick();
          onMenuClick();
        }}
        className="btn-tactile min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase text-slate-300 hover:text-white cursor-pointer"
      >
        <UtensilsCrossed className="w-4 h-4 text-amber-400" />
        <span className="font-mono tracking-tight">Menú</span>
      </button>

      {/* 5. Comanda Cart */}
      <button
        onClick={() => {
          soundFX.playClick();
          onOpenCart();
        }}
        className="btn-tactile relative min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase text-slate-300 hover:text-white cursor-pointer"
      >
        <ShoppingBag className="w-4 h-4 text-sky-400" />
        <span className="font-mono tracking-tight">Comanda</span>
        {cartCount > 0 && (
          <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-[#ED1C24] text-white font-black text-[9px] flex items-center justify-center font-mono border border-white shadow">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
