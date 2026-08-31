"use client";

import React, { useState } from "react";
import { MenuItem, PINZULIA_LANES } from "@/data/pinzuliaData";
import { CurrencyMode } from "@/data/currencies";
import { formatUSD, formatVES } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  Sparkles,
  MapPin,
} from "lucide-react";

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  currency: CurrencyMode;
  bcvRate: number;
  initialLane?: number;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currency,
  bcvRate,
  initialLane,
}: CartDrawerProps) {
  const [selectedLane, setSelectedLane] = useState<number>(initialLane || 1);
  const [isAtBar, setIsAtBar] = useState<boolean>(false);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [orderNotes, setOrderNotes] = useState<string>("");

  if (!isOpen) return null;

  const subtotalUSD = items.reduce(
    (sum, ci) => sum + ci.item.priceUSD * ci.quantity,
    0
  );
  const tipUSD = (subtotalUSD * tipPercentage) / 100;
  const totalUSD = subtotalUSD + tipUSD;
  const totalVES = totalUSD * bcvRate;

  const locationText = isAtBar
    ? "Barra Central de Mixología"
    : `Pista ${selectedLane < 10 ? "0" + selectedLane : selectedLane} (${
        selectedLane >= 13 ? "VIP Lounge" : "Carril Computarizado"
      })`;

  const handleSendOrder = () => {
    if (items.length === 0) return;

    let itemsList = "";
    items.forEach((ci) => {
      const lineUSD = ci.item.priceUSD * ci.quantity;
      itemsList += `• ${ci.quantity}x ${ci.item.name} ($${lineUSD.toFixed(2)})\n`;
    });

    const msg = encodeURIComponent(
      `🎳 *¡Nueva Comanda Gastropub — PinZulia Bowling!* 🍕\n\n` +
        `📍 *Ubicación del Pedido:* ${locationText}\n\n` +
        `📝 *Detalle de la Comanda:*\n` +
        itemsList +
        `\n💵 *Subtotal:* $${subtotalUSD.toFixed(2)} USD\n` +
        `🪙 *Propina (${tipPercentage}%):* $${tipUSD.toFixed(2)} USD\n` +
        `🔥 *TOTAL:* $${totalUSD.toFixed(2)} USD (ó ${totalVES.toFixed(2)} Bs)\n` +
        (orderNotes ? `\n📌 *Notas del Cliente:* ${orderNotes}\n` : "") +
        `\n🚀 *Favor marchar a la pista indicada.* ¡Muchas gracias!`
    );

    window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#070f1e] border-l border-sky-500/30 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-slate-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              <h2 className="font-extrabold text-white text-base">
                Comanda de Gastropub & Bar
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lane Selector Bar */}
          <div className="p-4 bg-slate-950/90 border-b border-sky-500/20 space-y-2">
            <label className="block text-xs font-bold text-sky-300">
              📍 ¿A dónde te llevamos el pedido?
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAtBar(false)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  !isAtBar
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                    : "bg-slate-900 text-slate-400 border border-white/5"
                }`}
              >
                🎳 A mi Pista
              </button>

              <button
                type="button"
                onClick={() => setIsAtBar(true)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  isAtBar
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                    : "bg-slate-900 text-slate-400 border border-white/5"
                }`}
              >
                🍸 En la Barra
              </button>
            </div>

            {!isAtBar && (
              <div className="pt-1">
                <select
                  value={selectedLane}
                  onChange={(e) => setSelectedLane(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-sky-500/30 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-400"
                >
                  {PINZULIA_LANES.map((lane) => (
                    <option key={lane.id} value={lane.laneNumber}>
                      {lane.name} {lane.laneNumber >= 13 ? "(Lounge VIP)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-white/5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-2xl text-sky-400">
                  🍕
                </div>
                <h3 className="font-bold text-white text-sm">Tu comanda está vacía</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Explora nuestra carta de Pinsas Romanas, Smash Burgers, Alitas y Cócteles Neón y
                  agrega tus favoritos.
                </p>
              </div>
            ) : (
              items.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-extrabold text-white leading-tight">
                      {item.name}
                    </h4>
                    <div className="text-xs text-sky-400 font-mono font-bold">
                      {currency === "USD"
                        ? formatUSD(item.priceUSD * quantity)
                        : formatVES(item.priceUSD * quantity, bcvRate)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-extrabold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-red-400 hover:text-red-300 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-sky-500/20 space-y-4">
              {/* Tip Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Propina sugerida al Staff:</span>
                  <span className="text-sky-400 font-mono">
                    +${tipUSD.toFixed(2)} USD
                  </span>
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercentage(pct)}
                      className={`py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        tipPercentage === pct
                          ? "bg-sky-500 text-white"
                          : "bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      {pct === 0 ? "0%" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kitchen Notes */}
              <div>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Notas de cocina (ej: hamburguesa sin cebolla)..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1 border-t border-white/10 pt-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatUSD(subtotalUSD)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Propina ({tipPercentage}%):</span>
                  <span className="font-mono">{formatUSD(tipUSD)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-white pt-1">
                  <span>Total a Pagar:</span>
                  <div className="text-right">
                    <div className="text-base font-black text-sky-400 font-mono">
                      {currency === "USD"
                        ? formatUSD(totalUSD)
                        : formatVES(totalUSD, bcvRate)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {currency === "USD"
                        ? formatVES(totalUSD, bcvRate)
                        : formatUSD(totalUSD)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSendOrder}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-xl shadow-emerald-900/40 text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comanda a Cocina por WhatsApp</span>
              </button>

              <button
                onClick={onClearCart}
                className="w-full text-center text-[11px] text-slate-400 hover:text-red-400 transition-colors"
              >
                Vaciar Comanda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
