"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { GastropubMenu } from "@/components/GastropubMenu";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { AutoPaymentModal } from "@/components/AutoPaymentModal";
import { BowlingScorecard } from "@/components/BowlingScorecard";
import {
  MenuItem,
  PINZULIA_LANES,
  BowlingLane,
  LaneStatus,
  PAYMENT_ACCOUNTS,
  AVAILABLE_SHOE_SIZES,
} from "@/data/pinzuliaData";
import { CurrencyMode } from "@/data/currencies";
import { formatUSD, formatVES } from "@/lib/utils";
import { useBcvRate } from "@/lib/useBcvRate";
import { soundFX } from "@/lib/soundEffects";
import {
  ArrowLeft,
  Sparkles,
  Utensils,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Users,
  Bell,
  PlusCircle,
  Flame,
  Zap,
  Phone,
  ShieldAlert,
  CreditCard,
  Copy,
  Check,
  Footprints,
  HelpCircle,
  DollarSign,
  Send,
  X,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface PistaPageProps {
  params: Promise<{ lane: string }>;
}

type PlacedLaneOrder = {
  id: string;
  items: { name: string; qty: number; priceUSD: number }[];
  totalUSD: number;
  status: "pendiente" | "preparando" | "servido";
  time: string;
};

export default function PistaOrderPage({ params }: PistaPageProps) {
  const resolvedParams = use(params);
  const laneNumber = parseInt(resolvedParams.lane) || 7;

  const defaultLaneData =
    PINZULIA_LANES.find((l) => l.laneNumber === laneNumber) ||
    PINZULIA_LANES[0];

  const [laneStatus, setLaneStatus] = useState<LaneStatus>(defaultLaneData.status);
  const [remainingMin, setRemainingMin] = useState<number>(defaultLaneData.remainingMinutes || 35);
  const [currency, setCurrency] = useState<CurrencyMode>("USD");
  const { rate: bcvRate } = useBcvRate();
  const [glowMode, setGlowMode] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Active Placed Orders in this session
  const [placedOrders, setPlacedOrders] = useState<PlacedLaneOrder[]>([
    {
      id: "CMD-401",
      items: [
        { name: "Pinsa Cuatro Quesos & Pepperoni", qty: 1, priceUSD: 16.0 },
        { name: "Cóctel Glow Strike Neón UV", qty: 2, priceUSD: 16.0 },
      ],
      totalUSD: 32.0,
      status: "preparando",
      time: "Hace 12 min",
    },
  ]);

  // Modal States
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [supportReason, setSupportReason] = useState<string>("ball_stuck");
  const [supportShoeSize, setSupportShoeSize] = useState<string>("41 EU (8.5 US M)");
  const [supportNote, setSupportNote] = useState<string>("");
  const [supportSent, setSupportSent] = useState<boolean>(false);

  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [paymentTab, setPaymentTab] = useState<"pagomovil" | "zelle" | "binance" | "efectivo">("pagomovil");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto Pay Modal
  const [isAutoPayOpen, setIsAutoPayOpen] = useState<boolean>(false);

  const [ticketInput, setTicketInput] = useState<string>("");

  // Live Timer Countdown
  useEffect(() => {
    if (laneStatus === "en_juego" && remainingMin > 0) {
      const interval = setInterval(() => {
        setRemainingMin((prev) => Math.max(0, prev - 1));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [laneStatus, remainingMin]);

  const handleToggleGlow = () => {
    soundFX.playClick();
    setGlowMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("glow-mode-active");
      } else {
        document.documentElement.classList.remove("glow-mode-active");
      }
      return next;
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    soundFX.playClick();
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleSendSupportRequest = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setSupportSent(true);

    const reasonsMap: { [k: string]: string } = {
      ball_stuck: "🎳 Bola Atascada / Fallo en Mecanismo de Pinos",
      shoe_swap: `👟 Cambio de Talla de Calzado a ${supportShoeSize}`,
      bumpers: "🛡️ï¸ Activar / Desactivar Parachoques (Bumpers de Niños)",
      waiter: "🍕 Atención de Mesero / Hielo / Vasos",
      bill: "🧾 Solicitar Cuenta de Mesa",
    };

    const reasonText = reasonsMap[supportReason] || supportReason;
    const msg = `ðŸ›Žï¸ *LLAMADO DE SOPORTE — PISTA ${laneNumber < 10 ? `0${laneNumber}` : laneNumber}*\n\n• *Motivo:* ${reasonText}\n${supportNote ? `• *Nota:* ${supportNote}\n` : ""}• *Hora:* ${new Date().toLocaleTimeString()}`;
    const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");

    setTimeout(() => {
      setSupportSent(false);
      setIsSupportModalOpen(false);
    }, 2000);
  };

  const handleExtendMatch = (addedMinutes: number) => {
    soundFX.playClick();
    setRemainingMin((prev) => prev + addedMinutes);
    alert(`¡Se han añadido +${addedMinutes} minutos al carril de la Pista ${laneNumber}!`);
  };

  const handleCopy = (text: string, key: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isVip = laneNumber >= 13;
  const isAvailable = laneStatus === "disponible";
  const isInGame = laneStatus === "en_juego";
  const isReserved = laneStatus === "reservada";

  // Calculations for Bill
  const bowlingPriceUSD = isInGame ? 25.0 : 0;
  const ordersTotalUSD = placedOrders.reduce((sum, o) => sum + o.totalUSD, 0);
  const cartSubtotalUSD = cartItems.reduce((sum, ci) => sum + ci.item.priceUSD * ci.quantity, 0);
  const subtotalUSD = bowlingPriceUSD + ordersTotalUSD + cartSubtotalUSD;
  const tipAmountUSD = (subtotalUSD * tipPercentage) / 100;
  const grandTotalUSD = subtotalUSD + tipAmountUSD;

  const handleAutoPaySuccess = (txId: string, ref: string) => {
    setIsAutoPayOpen(false);
    setIsBillModalOpen(false);
    setPlacedOrders([]);
    setCartItems([]);
    alert(`¡Pago de Cuenta verificado con éxito por el Banco (Ref: ${ref})! Gracias por su visita.`);
  };

  const totalCartCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#040814] text-slate-100 selection:bg-sky-500 selection:text-white">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        bcvRate={bcvRate}
        glowMode={glowMode}
        onToggleGlow={handleToggleGlow}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenManager={() => {}}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={() => soundFX.playClick()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la WebApp Principal</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Sesión Escaneada en Mesa Carril {laneNumber < 10 ? `0${laneNumber}` : laneNumber}</span>
          </div>
        </div>

        {/* Dynamic Live Status Banner */}
        <div className="rounded-3xl bg-slate-950/90 border-2 border-sky-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white font-black text-lg flex items-center justify-center font-mono shadow-lg shadow-sky-500/20">
                  {laneNumber < 10 ? `0${laneNumber}` : laneNumber}
                </span>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic flex items-center gap-2">
                    <span>{defaultLaneData.name}</span>
                    {isVip && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-black font-mono">
                        LOUNGE VIP
                      </span>
                    )}
                  </h1>
                  <span className="text-xs text-slate-400 font-mono">
                    C.C. Internacional 5 de Julio • Control Brunswick™
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Cluster */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live Status Pill */}
              {isAvailable && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-black font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>🟢 PISTA DISPONIBLE</span>
                </div>
              )}

              {isInGame && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-black font-mono">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>🔴 EN JUEGO ({remainingMin} MIN)</span>
                </div>
              )}

              {isReserved && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-950/80 border border-amber-400/40 text-amber-300 text-xs font-black font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>🟡 PISTA RESERVADA</span>
                </div>
              )}

              {/* Support / Waiter Modal Trigger */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsSupportModalOpen(true);
                }}
                className="btn-tactile flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md shadow-red-600/20 cursor-pointer uppercase tracking-wider"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Asistencia de Pista</span>
              </button>

              {/* Pay Bill Modal Trigger */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsBillModalOpen(true);
                }}
                className="btn-tactile flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md shadow-emerald-600/20 cursor-pointer uppercase tracking-wider"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pedir Cuenta / Pagar</span>
              </button>
            </div>
          </div>

          {/* If In Game: Active Match HUD & Extension */}
          {isInGame && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-sky-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Tiempo Restante</span>
                  <div className="text-2xl font-black text-sky-400">{remainingMin} min</div>
                </div>
                <Clock className="w-8 h-8 text-sky-400 animate-spin" />
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Plan Activo</span>
                  <div className="text-sm font-bold text-white font-sans">
                    {defaultLaneData.packageType || "Strike Night (2h)"}
                  </div>
                </div>
                <Flame className="w-6 h-6 text-red-400" />
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Añadir Tiempo</span>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleExtendMatch(30)}
                      className="btn-tactile px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                    >
                      +30m
                    </button>
                    <button
                      onClick={() => handleExtendMatch(60)}
                      className="btn-tactile px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                    >
                      +1 hora
                    </button>
                  </div>
                </div>
                <PlusCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          )}

          {/* Active Orders Placed by this Table */}
          {placedOrders.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Utensils className="w-3.5 h-3.5 text-sky-400" />
                Historial de Comandas en esta Pista ({placedOrders.length})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {placedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sky-400">{ord.id}</span>
                        <span className="text-[10px] text-slate-400">{ord.time}</span>
                        <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase font-mono">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-slate-300 pt-1">
                        {ord.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-black text-emerald-400">${ord.totalUSD.toFixed(2)}</div>
                      <span className="text-[9px] text-slate-400">
                        ≈ {formatVES(ord.totalUSD, bcvRate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gastropub Menu Direct Ordering */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic">
              Pedir Comida & Bebidas a la Pista {laneNumber < 10 ? `0${laneNumber}` : laneNumber}
            </h2>
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-tactile flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-md"
            >
              <Utensils className="w-4 h-4" />
              <span>Ver Comanda ({totalCartCount})</span>
            </button>
          </div>

          <GastropubMenu
            currency={currency}
            bcvRate={bcvRate}
            onAddToCart={handleAddToCart}
          />
        </div>
      </main>

      {/* MODAL 1: SOPORTE DE PISTA & ASISTENCIA */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 rounded-3xl border-2 border-sky-500/40 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-black text-white uppercase italic">
                  Soporte & Asistencia — Pista {laneNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendSupportRequest} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-300 uppercase tracking-wider block">
                  Selecciona el motivo de asistencia:
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "ball_stuck", label: "🎳 Bola Atascada / Fallo en Mecanismo de Pinos" },
                    { id: "shoe_swap", label: "👟 Cambio de Talla de Calzado Sanitizado" },
                    { id: "bumpers", label: "🛡️ï¸ Activar / Desactivar Bumpers (Niños)" },
                    { id: "waiter", label: "🍕 Atención de Mesero / Hielo / Vasos" },
                    { id: "bill", label: "🧾 Solicitar Cuenta de Mesa" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`btn-tactile flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer ${
                        supportReason === opt.id
                          ? "bg-sky-950/80 border-sky-400 text-white shadow-md shadow-sky-500/20"
                          : "bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="supportReason"
                        checked={supportReason === opt.id}
                        onChange={() => setSupportReason(opt.id)}
                        className="accent-sky-400"
                      />
                      <span className="font-semibold">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* If shoe swap selected */}
              {supportReason === "shoe_swap" && (
                <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-white/5">
                  <label className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5" />
                    Selecciona la talla requerida:
                  </label>
                  <select
                    value={supportShoeSize}
                    onChange={(e) => setSupportShoeSize(e.target.value)}
                    className="w-full bg-slate-950 text-xs px-3 py-2 rounded-lg border border-white/10 text-white font-mono"
                  >
                    {AVAILABLE_SHOE_SIZES.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Extra note */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Nota adicional (opcional):</label>
                <input
                  type="text"
                  value={supportNote}
                  onChange={(e) => setSupportNote(e.target.value)}
                  placeholder="Ej: Jugador carril derecho necesita apoyo..."
                  className="w-full bg-slate-900 px-3 py-2 rounded-xl border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                className="btn-tactile w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{supportSent ? "¡Llamado Enviado al Staff!" : "Despachar Llamado Inmediato"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CUENTA DEL CARRIL & MÉTODOS DE PAGO */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 rounded-3xl border-2 border-emerald-500/40 p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white uppercase italic">
                  Cuenta & Pago — Pista {laneNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsBillModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2 font-sans font-bold uppercase text-[10px]">
                <span>Concepto</span>
                <span>Monto USD</span>
              </div>

              {bowlingPriceUSD > 0 && (
                <div className="flex justify-between text-slate-200">
                  <span>🎳 Partida de Bowling (Carril {laneNumber})</span>
                  <span>${bowlingPriceUSD.toFixed(2)}</span>
                </div>
              )}

              {ordersTotalUSD > 0 && (
                <div className="flex justify-between text-slate-200">
                  <span>🍕 Comanda Gastropub Servida ({placedOrders.length} pedidos)</span>
                  <span>${ordersTotalUSD.toFixed(2)}</span>
                </div>
              )}

              {cartSubtotalUSD > 0 && (
                <div className="flex justify-between text-sky-300">
                  <span>ðŸ›’ Ítems Pendientes en Carrito</span>
                  <span>${cartSubtotalUSD.toFixed(2)}</span>
                </div>
              )}

              {/* Tip selector */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-slate-400 mb-1 font-sans">
                  <span>Propina sugerida al staff:</span>
                  <span className="text-emerald-400 font-bold font-mono">+${tipAmountUSD.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTipPercentage(pct)}
                      className={`btn-tactile py-1.5 rounded-lg text-xs font-bold ${
                        tipPercentage === pct
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-950 text-slate-400 border border-white/5"
                      }`}
                    >
                      {pct === 0 ? "0%" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-sans font-bold text-slate-400 text-xs uppercase block">Total a Pagar</span>
                  <span className="text-[10px] text-slate-500">Tasa DolarAPI: {bcvRate.toFixed(2)} Bs/$</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400">${grandTotalUSD.toFixed(2)} USD</div>
                  <div className="text-sm font-bold text-sky-300">≈ {formatVES(grandTotalUSD, bcvRate)}</div>
                </div>
              </div>
            </div>

            {/* Instant Automated Pay Button */}
            <button
              onClick={() => setIsAutoPayOpen(true)}
              className="btn-tactile w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Pagar con Verificación Automática en 3s (Pago Móvil)</span>
            </button>

            {/* Payment Method Tabs */}
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/5 text-[10px] font-black uppercase font-mono">
                <button
                  onClick={() => setPaymentTab("pagomovil")}
                  className={`btn-tactile py-1.5 rounded-lg ${
                    paymentTab === "pagomovil" ? "bg-sky-500 text-white" : "text-slate-400"
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setPaymentTab("zelle")}
                  className={`btn-tactile py-1.5 rounded-lg ${
                    paymentTab === "zelle" ? "bg-sky-500 text-white" : "text-slate-400"
                  }`}
                >
                  Zelle
                </button>
                <button
                  onClick={() => setPaymentTab("binance")}
                  className={`btn-tactile py-1.5 rounded-lg ${
                    paymentTab === "binance" ? "bg-sky-500 text-white" : "text-slate-400"
                  }`}
                >
                  Binance
                </button>
                <button
                  onClick={() => setPaymentTab("efectivo")}
                  className={`btn-tactile py-1.5 rounded-lg ${
                    paymentTab === "efectivo" ? "bg-sky-500 text-white" : "text-slate-400"
                  }`}
                >
                  Efectivo
                </button>
              </div>

              {/* Payment Details Body */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 space-y-2.5 text-xs">
                {paymentTab === "pagomovil" && (
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-500 block">BANCO / RIF</span>
                        <span className="text-white font-bold">{PAYMENT_ACCOUNTS.pagoMovil.banco}</span>
                        <div className="text-slate-300 text-[11px]">{PAYMENT_ACCOUNTS.pagoMovil.rif}</div>
                      </div>
                      <button
                        onClick={() => handleCopy(PAYMENT_ACCOUNTS.pagoMovil.rif, "rif")}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-300"
                      >
                        {copiedKey === "rif" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-500 block">TELÉFONO</span>
                        <span className="text-white font-bold">{PAYMENT_ACCOUNTS.pagoMovil.telefono}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(PAYMENT_ACCOUNTS.pagoMovil.telefono, "telf")}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-300"
                      >
                        {copiedKey === "telf" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                      <div>
                        <span className="text-[10px] text-emerald-300 block">MONTO EXACTO EN BS</span>
                        <span className="text-emerald-400 font-black text-sm">{(grandTotalUSD * bcvRate).toFixed(2)} Bs.</span>
                      </div>
                      <button
                        onClick={() => handleCopy((grandTotalUSD * bcvRate).toFixed(2), "bs")}
                        className="p-1.5 bg-emerald-900/60 rounded-lg text-emerald-300"
                      >
                        {copiedKey === "bs" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {paymentTab === "zelle" && (
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-500 block">CORREO ZELLE</span>
                        <span className="text-white font-bold">{PAYMENT_ACCOUNTS.zelle.correo}</span>
                        <div className="text-slate-300 text-[11px]">{PAYMENT_ACCOUNTS.zelle.titular}</div>
                      </div>
                      <button
                        onClick={() => handleCopy(PAYMENT_ACCOUNTS.zelle.correo, "zelle")}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-300"
                      >
                        {copiedKey === "zelle" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {paymentTab === "binance" && (
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-500 block">BINANCE PAY ID</span>
                        <span className="text-white font-bold">{PAYMENT_ACCOUNTS.binance.payId}</span>
                        <div className="text-amber-400 text-[11px]">Moneda: USDT</div>
                      </div>
                      <button
                        onClick={() => handleCopy(PAYMENT_ACCOUNTS.binance.payId, "binance")}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-300"
                      >
                        {copiedKey === "binance" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {paymentTab === "efectivo" && (
                  <div className="bg-slate-950 p-3 rounded-xl text-center space-y-1 text-slate-300">
                    <DollarSign className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="font-bold">Pago en Efectivo o Punto de Venta</p>
                    <p className="text-[11px] text-slate-400">
                      Un mesero se acercará a la Pista {laneNumber} con el punto inalámbrico o para recibir tu pago en dólares en efectivo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Payment via WhatsApp */}
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                `🧾 *PAGO DE CUENTA — PISTA ${laneNumber}*\n\n• Monto: $${grandTotalUSD.toFixed(2)} USD (≈ ${formatVES(grandTotalUSD, bcvRate)})\n• Método: ${paymentTab.toUpperCase()}\n• Hora: ${new Date().toLocaleTimeString()}\n\n_Adjunto mi comprobante de pago._`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Comprobante de Pago por WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Auto Payment Modal for Lane Bill */}
      {isAutoPayOpen && (
        <AutoPaymentModal
          isOpen={isAutoPayOpen}
          onClose={() => setIsAutoPayOpen(false)}
          amountUSD={grandTotalUSD}
          bcvRate={bcvRate}
          referenceCode={`PISTA-${laneNumber}`}
          onPaymentApproved={handleAutoPaySuccess}
        />
      )}

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, qty) => {
          if (qty <= 0) {
            setCartItems((prev) => prev.filter((ci) => ci.item.id !== id));
          } else {
            setCartItems((prev) =>
              prev.map((ci) =>
                ci.item.id === id ? { ...ci, quantity: qty } : ci
              )
            );
          }
        }}
        onRemoveItem={(id) =>
          setCartItems((prev) => prev.filter((ci) => ci.item.id !== id))
        }
        onClearCart={() => setCartItems([])}
        currency={currency}
        bcvRate={bcvRate}
        initialLane={laneNumber}
      />
    </div>
  );
}