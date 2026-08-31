"use client";

import React, { useState } from "react";
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  MenuItem,
  MenuCategory,
} from "@/data/pinzuliaData";
import { CurrencyMode } from "@/data/currencies";
import { formatUSD, formatVES } from "@/lib/utils";
import { soundFX } from "@/lib/soundEffects";
import {
  Sparkles,
  Plus,
  Flame,
  Search,
  Check,
  ShoppingBag,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

interface GastropubMenuProps {
  currency: CurrencyMode;
  bcvRate: number;
  onAddToCart: (item: MenuItem) => void;
}

export function GastropubMenu({
  currency,
  bcvRate,
  onAddToCart,
}: GastropubMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>("pinsas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "todas" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item: MenuItem) => {
    soundFX.playClick();
    onAddToCart(item);
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1200);
  };

  return (
    <section id="menu" className="py-16 sm:py-20 bg-[#040814] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0033CC] text-white text-xs font-black uppercase tracking-wider shadow-md">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
            <span>Masa Madre 72h & Bar de Pistas</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic retro-3d-text-blue">
            Carta Gastropub & Coctelería UV
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Pinsas Romanas artesanales horneadas a la piedra, Smash Burgers dobles y cócteles neón que brillan bajo las luces UV de nuestras pistas.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en la carta (ej: Pinsa, Smash, Alitas, Neón)..."
              className="w-full bg-slate-950 border border-white/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ED1C24] shadow-inner font-sans"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveCategory("todas");
            }}
            className={`btn-tactile px-4 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider cursor-pointer ${
              activeCategory === "todas"
                ? "bg-[#ED1C24] text-white shadow-lg shadow-red-600/30 border-2 border-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            ðŸ½ï¸ Todo el Menú ({MENU_ITEMS.length})
          </button>

          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFX.playClick();
                setActiveCategory(cat.id);
              }}
              className={`btn-tactile px-4 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-[#ED1C24] text-white shadow-lg shadow-red-600/30 border-2 border-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Menu Items Grid: Two-Tone Card Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isPopular = item.popular;
            const isJustAdded = addedItemId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200"
              >
                {/* Two-Tone Top Header: Crisp White */}
                <div className="p-3.5 bg-white border-b-2 border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPopular && (
                      <span className="w-6 h-6 rounded-full bg-[#ED1C24] text-white flex items-center justify-center shadow">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                    <h3 className="font-black text-[#0033CC] text-base uppercase italic leading-tight">
                      {item.name}
                    </h3>
                  </div>

                  {isPopular && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#ED1C24] font-black text-[9px] uppercase font-mono border border-red-300">
                      Favorito
                    </span>
                  )}
                </div>

                {/* Two-Tone Bottom Body: Dark Obsidian with Red/Emerald Accents */}
                <div className="p-4 bg-[#071022] flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    {/* Dual Pricing Badges */}
                    <div className="font-mono">
                      <div className="text-xl font-black text-emerald-400">
                        ${item.priceUSD.toFixed(2)} USD
                      </div>
                      <span className="text-[10px] text-sky-300 font-bold block">
                        ≈ {formatVES(item.priceUSD, bcvRate)}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAdd(item)}
                      className={`btn-tactile px-4 py-2.5 rounded-xl font-black text-xs uppercase italic tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md ${
                        isJustAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-[#ED1C24] hover:bg-[#D8001D] text-white shadow-red-600/25"
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>¡Agregado!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Pedir a Pista</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}