"use client";

const DEFAULT_BOOKINGS = [
  {
    bookingCode: "PIN-7401",
    clientName: "Alejandro Morales",
    clientPhone: "0414 1234567",
    packageName: "Pista de Bowling (1h)",
    serviceType: "bowling",
    date: new Date().toISOString().split("T")[0],
    time: "07:00 PM",
    playersCount: 5,
    shoesCount: 5,
    totalUSD: 37.5,
    status: "EN_PISTA",
  },
  {
    bookingCode: "PIN-7402",
    clientName: "Familia González",
    clientPhone: "0424 9876543",
    packageName: "Mesa de Pool Diamond (2h)",
    serviceType: "pool",
    date: new Date().toISOString().split("T")[0],
    time: "08:30 PM",
    playersCount: 4,
    shoesCount: 0,
    totalUSD: 40.0,
    status: "CONFIRMADA",
  },
  {
    bookingCode: "PIN-7403",
    clientName: "Grupo Occidental VIP",
    clientPhone: "0412 5551234",
    packageName: "Pista de Bowling (2h)",
    serviceType: "bowling",
    date: new Date().toISOString().split("T")[0],
    time: "09:30 PM",
    playersCount: 5,
    shoesCount: 5,
    totalUSD: 62.5,
    status: "PENDIENTE",
  },
];


import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PINZULIA_LANES,
  MANAGER_KPIS,
  BowlingLane,
  LaneStatus,
} from "@/data/pinzuliaData";
import { formatUSD, formatVES } from "@/lib/utils";
import { soundFX } from "@/lib/soundEffects";
import {
  ShieldCheck,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Zap,
  Users,
  Footprints,
  DollarSign,
  Search,
  Printer,
  QrCode,
  UtensilsCrossed,
  ChefHat,
  RefreshCw,
  ExternalLink,
  Bell,
  Sparkles,
  Radio,
  Send,
  Mail,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { TransactionStore } from "@/lib/gateway/transactionStore";
import { Transaction, ParsedBankNotification, IngestionChannel } from "@/lib/gateway/types";
import { BowlingScorecard } from "@/components/BowlingScorecard";
import { ByteBridgeSettings } from "@/components/ByteBridgeSettings";
import { WhatsAppBotManager } from "@/components/WhatsAppBotManager";

interface KitchenOrder {
  id: string;
  laneNumber: number;
  time: string;
  items: { name: string; qty: number; priceUSD: number }[];
  totalUSD: number;
  status: "pendiente" | "preparando" | "servido";
  notes?: string;
}

const INITIAL_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: "ORD-801",
    laneNumber: 7,
    time: "Hace 4 min",
    items: [
      { name: "Pinsa Cuatro Quesos & Pepperoni", qty: 1, priceUSD: 16.0 },
      { name: "Strike Smash Burger Doble", qty: 2, priceUSD: 24.0 },
      { name: "Cóctel Glow Strike Neón UV", qty: 3, priceUSD: 24.0 },
    ],
    totalUSD: 64.0,
    status: "preparando",
    notes: "Sin cebolla en 1 smash burger. Servir cócteles primero.",
  },
  {
    id: "ORD-802",
    laneNumber: 14,
    time: "Hace 8 min",
    items: [
      { name: "Tequeños Gigantes PinZulia (6 uds)", qty: 2, priceUSD: 18.0 },
      { name: "Balde de Cervezas Zulia (6 uds)", qty: 1, priceUSD: 14.0 },
    ],
    totalUSD: 32.0,
    status: "servido",
    notes: "Lounge VIP 14 - Agregar salsa tártara extra.",
  },
  {
    id: "ORD-803",
    laneNumber: 3,
    time: "Hace 1 min",
    items: [
      { name: "Alitas Buffalo Crispy (10 uds)", qty: 1, priceUSD: 13.0 },
      { name: "Perfect Game Gin Mule", qty: 2, priceUSD: 18.0 },
    ],
    totalUSD: 31.0,
    status: "pendiente",
  },
];

interface ManagerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  bcvRate: number;
  onUpdateBcvRate: (newRate: number) => void;
}

export function ManagerDashboard({
  isOpen,
  onClose,
  bcvRate,
  onUpdateBcvRate,
}: ManagerDashboardProps) {
  const [lanes, setLanes] = useState<BowlingLane[]>(PINZULIA_LANES);
  const [tempRate, setTempRate] = useState<string>(bcvRate.toFixed(2));
  const [rateSaved, setRateSaved] = useState<boolean>(false);
  const [bookingList, setBookingList] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pinzulia_bookings");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return DEFAULT_BOOKINGS;
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleCheckInBooking = (code: string) => {
    setBookingList((prev) =>
      prev.map((b) =>
        b.bookingCode === code ? { ...b, status: "EN_PISTA" } : b
      )
    );
    try {
      const stored = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
      const updated = stored.map((b: any) =>
        b.bookingCode === code ? { ...b, status: "EN_PISTA" } : b
      );
      localStorage.setItem("pinzulia_bookings", JSON.stringify(updated));
    } catch {}
  };

  const filteredBookings = bookingList.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.bookingCode && b.bookingCode.toLowerCase().includes(q)) ||
      (b.clientName && b.clientName.toLowerCase().includes(q)) ||
      (b.clientPhone && b.clientPhone.includes(q))
    );
  });

  const [activeTab, setActiveTab] = useState<"pistas" | "comandas" | "reservas" | "pasarela" | "tasa">("pistas");
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(INITIAL_KITCHEN_ORDERS);
  const [isSyncingDolarApi, setIsSyncingDolarApi] = useState<boolean>(false);

  // Gateway Live Feed
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankLogs, setBankLogs] = useState<ParsedBankNotification[]>([]);
  const [simBank, setSimBank] = useState<string>("Banesco");
  const [simChannel, setSimChannel] = useState<IngestionChannel>("EMAIL");
  const [simAmount, setSimAmount] = useState<string>("19791.75");
  const [simRef, setSimRef] = useState<string>("849201");
  const [simResult, setSimResult] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "pasarela") {
      setTransactions(TransactionStore.getAllTransactions());
      setBankLogs(TransactionStore.getBankLogs());
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleStatusChange = (laneId: number, newStatus: LaneStatus) => {
    soundFX.playClick();
    setLanes((prev) =>
      prev.map((l) => {
        if (l.id === laneId) {
          return {
            ...l,
            status: newStatus,
            remainingMinutes: newStatus === "en_juego" ? 60 : undefined,
          };
        }
        return l;
      })
    );
  };

  const handleAddMinutes = (laneId: number, minutes: number) => {
    soundFX.playClick();
    setLanes((prev) =>
      prev.map((l) => {
        if (l.id === laneId) {
          const current = l.remainingMinutes || 0;
          return { ...l, remainingMinutes: current + minutes, status: "en_juego" };
        }
        return l;
      })
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: "pendiente" | "preparando" | "servido") => {
    soundFX.playClick();
    setKitchenOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      onUpdateBcvRate(val);
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2500);
    }
  };

  const handleSyncDolarApi = async () => {
    soundFX.playClick();
    setIsSyncingDolarApi(true);
    try {
      const res = await fetch("/api/bcv");
      const data = await res.json();
      if (data.rate && typeof data.rate === "number") {
        onUpdateBcvRate(data.rate);
        setTempRate(data.rate.toFixed(2));
        setRateSaved(true);
        setTimeout(() => setRateSaved(false), 2500);
      }
    } catch {}
    setIsSyncingDolarApi(false);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    try {
      const res = await fetch("/api/v1/ingest/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank: simBank,
          amountVES: parseFloat(simAmount) || 19791.75,
          reference: simRef.trim() || "849201",
          channel: simChannel,
        }),
      });
      const data = await res.json();
      setSimResult(data.result?.message || "Simulación procesada.");
      setTransactions(TransactionStore.getAllTransactions());
      setBankLogs(TransactionStore.getBankLogs());
      soundFX.playStrikeFanfare();
    } catch (e: any) {
      setSimResult("Error al simular: " + e.message);
    }
  };

  const activeCount = lanes.filter((l) => l.status === "en_juego").length;
  const reservedCount = lanes.filter((l) => l.status === "reservada").length;
  const occupancy = Math.round((activeCount / lanes.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-6xl my-auto bg-[#040814] rounded-3xl border-2 border-sky-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-base sm:text-lg uppercase italic">
                  Consola de Operaciones & Gerencia
                </h2>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase font-mono">
                  PinZulia 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                14 Pistas • Comandas • Pasarela Multi-Canal (Email / Push / SMS) • DolarAPI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pistas-qr"
              target="_blank"
              onClick={() => soundFX.playClick()}
              className="btn-tactile hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30 text-xs font-bold font-mono"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Stands QR</span>
            </Link>

            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="btn-tactile p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time KPIs Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-950/80 border-b border-white/5 font-mono">
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-sky-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Pistas en Juego
            </span>
            <div className="text-2xl font-black text-sky-400 pt-0.5">
              {activeCount} / {lanes.length}
            </div>
            <span className="text-[10px] text-slate-500">
              {occupancy}% aforo • {reservedCount} reservadas
            </span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-emerald-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Ventas Estimadas Hoy
            </span>
            <div className="text-2xl font-black text-emerald-400 pt-0.5">
              ${MANAGER_KPIS.todaySalesUSD} USD
            </div>
            <span className="text-[10px] text-slate-500">
              ≈ {formatVES(MANAGER_KPIS.todaySalesUSD, bcvRate)}
            </span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Calzado Sanitizado en Uso
            </span>
            <div className="text-2xl font-black text-amber-300 pt-0.5">
              {MANAGER_KPIS.shoesInUse} pares
            </div>
            <span className="text-[10px] text-slate-500">
              Cabinas de luz UV activas
            </span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Tasa BCV Oficial
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">DolarAPI</span>
            </div>
            <div className="text-2xl font-black text-red-400 pt-0.5">
              {bcvRate.toFixed(2)} Bs/$
            </div>
            <span className="text-[10px] text-slate-500">
              Sincronizada automáticamente
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab("pistas");
            }}
            className={`btn-tactile pb-3 px-1 text-xs sm:text-sm font-black uppercase italic transition-colors border-b-2 shrink-0 cursor-pointer ${
              activeTab === "pistas"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            🎳 Control de 14 Pistas ({lanes.length})
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab("comandas");
            }}
            className={`btn-tactile pb-3 px-1 text-xs sm:text-sm font-black uppercase italic transition-colors border-b-2 shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "comandas"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>ðŸ‘¨â€ðŸ³ Comandas de Cocina</span>
            <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-mono font-black">
              {kitchenOrders.filter((o) => o.status !== "servido").length}
            </span>
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab("pasarela");
            }}
            className={`btn-tactile pb-3 px-1 text-xs sm:text-sm font-black uppercase italic transition-colors border-b-2 shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pasarela"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>⚡ Pasarela Multi-Canal (3/3)</span>
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab("whatsapp");
            }}
            className={`btn-tactile pb-3 px-1 text-xs sm:text-sm font-black uppercase italic transition-colors border-b-2 shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "whatsapp"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>📲 Bot WhatsApp Entradas</span>
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab("reservas");
            }}
            className={`btn-tactile pb-3 px-1 text-xs sm:text-sm font-black uppercase italic transition-colors border-b-2 shrink-0 cursor-pointer ${
              activeTab === "reservas"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            ðŸ“‹ Pases Digitales QR
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab("tasa");
            }}
            className={`btn-tactile pb-3 px-1 text-xs sm:text-sm font-black uppercase italic transition-colors border-b-2 shrink-0 cursor-pointer ${
              activeTab === "tasa"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            ⚡ DolarAPI & Tasa BCV
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: 14 LANES */}
          {activeTab === "pistas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lanes.map((lane) => {
                const isInGame = lane.status === "en_juego";
                const isVip = lane.laneNumber >= 13;

                return (
                  <div
                    key={lane.id}
                    className={`p-4 rounded-2xl bg-slate-900/90 border transition-all space-y-3 ${
                      isInGame
                        ? "border-sky-500/40 shadow-md shadow-sky-950/30"
                        : isVip
                        ? "border-amber-500/30"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-slate-950 text-white font-black text-xs flex items-center justify-center font-mono border border-white/10">
                          {lane.laneNumber < 10 ? `0${lane.laneNumber}` : lane.laneNumber}
                        </span>
                        <div>
                          <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            {lane.name}
                            {isVip && (
                              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono font-black">
                                VIP
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <select
                        value={lane.status}
                        onChange={(e) => handleStatusChange(lane.id, e.target.value as LaneStatus)}
                        className="bg-slate-950 text-xs font-bold rounded-lg px-2 py-1 border border-slate-700 text-white focus:outline-none cursor-pointer"
                      >
                        <option value="disponible">🟢 Libre</option>
                        <option value="en_juego">🔴 En Juego</option>
                        <option value="reservada">🟡 Reservada</option>
                        <option value="mantenimiento">âšª Mant.</option>
                      </select>
                    </div>

                    {isInGame && (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-sky-500/20 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                          Tiempo restante:
                        </span>
                        <span className="font-mono font-black text-sky-300 text-sm">
                          {lane.remainingMinutes || 60} min
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <button
                        onClick={() => handleAddMinutes(lane.id, 60)}
                        className="btn-tactile py-1.5 px-2 rounded-lg bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-[10px] font-bold border border-sky-500/30 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" /> +1h
                      </button>
                      <button
                        onClick={() => handleAddMinutes(lane.id, 30)}
                        className="btn-tactile py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-white/5 cursor-pointer"
                      >
                        +30m
                      </button>
                      <button
                        onClick={() => handleStatusChange(lane.id, "disponible")}
                        className="btn-tactile py-1.5 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Libre
                      </button>
                      <Link
                        href={`/pista/${lane.laneNumber < 10 ? `0${lane.laneNumber}` : lane.laneNumber}`}
                        target="_blank"
                        className="btn-tactile py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-white/5 flex items-center justify-center"
                        title="Abrir vista de mesa"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: KITCHEN COMMANDS */}
          {activeTab === "comandas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kitchenOrders.map((ord) => (
                <div
                  key={ord.id}
                  className={`rounded-2xl p-4 sm:p-5 bg-slate-900/90 border flex flex-col justify-between space-y-3 ${
                    ord.status === "pendiente"
                      ? "border-red-500/40 shadow-lg shadow-red-950/30"
                      : ord.status === "preparando"
                      ? "border-amber-500/40 shadow-lg shadow-amber-950/30"
                      : "border-white/10 opacity-70"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sky-400 text-xs">{ord.id}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-sky-950 text-white font-mono font-black text-xs">
                          PISTA {ord.laneNumber < 10 ? `0${ord.laneNumber}` : ord.laneNumber}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ord.time}</span>
                    </div>

                    <ul className="space-y-1.5 text-xs">
                      {ord.items.map((it, idx) => (
                        <li key={idx} className="flex items-center justify-between text-slate-200">
                          <span className="font-semibold">
                            <span className="text-amber-400 font-bold">{it.qty}x</span> {it.name}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            ${(it.qty * it.priceUSD).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {ord.notes && (
                      <div className="p-2 bg-slate-950 rounded-xl border border-white/5 text-[11px] text-amber-300 font-mono">
                        ðŸ“ {ord.notes}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="font-mono">
                      <div className="text-sm font-black text-emerald-400">
                        ${ord.totalUSD.toFixed(2)} USD
                      </div>
                      <span className="text-[10px] text-slate-400">
                        ≈ {formatVES(ord.totalUSD, bcvRate)}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      {ord.status !== "preparando" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, "preparando")}
                          className="btn-tactile px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Preparar
                        </button>
                      )}

                      {ord.status !== "servido" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, "servido")}
                          className="btn-tactile px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Servido
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PASARELA & CONCILIACIÓN AUTOMÁTICA MULTI-CANAL */}
          {activeTab === "pasarela" && (
            <div className="space-y-6">
              {/* 3 Redundant Channels Status HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white font-sans">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span>Zero-Hardware Email Parse</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-emerald-300 font-bold">/api/v1/ingest/email</div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Resend, SendGrid o IMAP parser directo. Cero teléfonos requeridos.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white font-sans">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      <span>Push Notifications</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-sky-300 font-bold">/api/v1/ingest/push</div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Intercepta alertas push de BanescoMóvil, Tpago y BDVApp.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white font-sans">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Carrier SMS Webhook</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-amber-300 font-bold">/api/v1/ingest/sms</div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Reenvío directo de SMS bancarios de operadoras móviles.
                  </p>
                </div>
              </div>

              {/* Simulation Sandbox for Multi-Channel Testing */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-sky-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-sm font-black text-white uppercase italic flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Simulador Multi-Canal (Prueba de Ingestión en Vivo)
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Deduplicación Activa</span>
                </div>

                <form onSubmit={handleRunSimulation} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1 font-sans">Canal de Entrada</label>
                    <select
                      value={simChannel}
                      onChange={(e) => setSimChannel(e.target.value as IngestionChannel)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                    >
                      <option value="EMAIL">âœ‰ï¸ EMAIL (Zero-Hardware)</option>
                      <option value="PUSH">ðŸ”” PUSH Notif.</option>
                      <option value="SMS">💬 SMS Mensaje</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1 font-sans">Banco Emisor</label>
                    <select
                      value={simBank}
                      onChange={(e) => setSimBank(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Banesco">Banesco (0134)</option>
                      <option value="Mercantil">Mercantil (0105)</option>
                      <option value="BDV">Banco de Venezuela (0102)</option>
                      <option value="Bancamiga">Bancamiga (0172)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1 font-sans">Monto en Bs.</label>
                    <input
                      type="text"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1 font-sans">Nro. Referencia</label>
                    <input
                      type="text"
                      value={simRef}
                      onChange={(e) => setSimRef(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="btn-tactile w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md font-sans"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Disparar Ingesta</span>
                    </button>
                  </div>
                </form>

                {simResult && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono">
                    ✓ {simResult}
                  </div>
                )}
              </div>

              {/* Transactions & Bank Logs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                {/* Recent Gateway Transactions */}
                <div className="bg-slate-900/90 rounded-3xl border border-white/10 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="font-black text-white uppercase italic font-sans text-sm">
                      Transacciones de la Pasarela ({transactions.length})
                    </h4>
                    <button
                      onClick={() => setTransactions(TransactionStore.getAllTransactions())}
                      className="p-1 rounded bg-slate-950 text-slate-400 hover:text-white"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-slate-500 text-center py-6">
                      No hay transacciones registradas aún. Abre una reserva para iniciar un cobro.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sky-400">{tx.referenceCode}</span>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                                  tx.status === "APPROVED"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {tx.status} {tx.verifiedChannel ? `(${tx.verifiedChannel})` : ""}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Ref: {tx.bankReference || "Esperando cliente..."}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-emerald-400">Bs. {tx.amountVES.toFixed(2)}</div>
                            <span className="text-[10px] text-slate-500">${tx.amountUSD} USD</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Incoming Bank Notifications Stream */}
                <div className="bg-slate-900/90 rounded-3xl border border-white/10 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="font-black text-white uppercase italic font-sans text-sm flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Stream Multi-Canal de Notificaciones ({bankLogs.length})
                    </h4>
                    <button
                      onClick={() => setBankLogs(TransactionStore.getBankLogs())}
                      className="p-1 rounded bg-slate-950 text-slate-400 hover:text-white"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  {bankLogs.length === 0 ? (
                    <div className="text-slate-500 text-center py-6">
                      Esperando notificaciones entrantes de Email, Push o SMS...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {bankLogs.map((log, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 text-[9px] font-bold border border-sky-500/30">
                                {log.channel}
                              </span>
                              <span className="text-white font-bold">{log.bank}</span>
                            </div>
                            <span className="text-slate-500 text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-tight line-clamp-2">
                            {log.rawText}
                          </p>
                          <div className="text-[10px] text-emerald-400 font-bold">
                            Monto: Bs. {log.amountVES} • Ref: {log.reference}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP BOT AUTOMATION */}
          {activeTab === "whatsapp" && <WhatsAppBotManager />}

          {/* TAB 4: QR RESERVATIONS & RECEPTION */}
          {activeTab === "reservas" && (
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por código #PIN o cliente..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      const stored = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
                      setBookingList(stored.length > 0 ? stored : DEFAULT_BOOKINGS);
                    }}
                    className="btn-tactile px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer border border-white/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recargar Reservas</span>
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <div className="p-3 bg-slate-950 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase italic font-sans flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-300" />
                    <span>Listado Oficial de Pases & Reservaciones QR</span>
                  </span>
                  <span className="text-[10px] font-mono text-sky-300 font-bold">
                    {filteredBookings.length} Registradas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] border-b border-white/5 font-mono">
                      <tr>
                        <th className="p-3">Código QR</th>
                        <th className="p-3">Titular</th>
                        <th className="p-3">Servicio</th>
                        <th className="p-3">Fecha & Turno</th>
                        <th className="p-3">Jugadores & Zapatos</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            No se encontraron reservaciones con ese filtro.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b: any) => (
                          <tr key={b.bookingCode} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3">
                              <span className="font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                #{b.bookingCode}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-white font-sans">{b.clientName}</div>
                              <span className="text-[10px] text-slate-400">{b.clientPhone}</span>
                            </td>
                            <td className="p-3 text-sky-300 font-bold">
                              {b.packageName || b.serviceType || "Pista Bowling"}
                            </td>
                            <td className="p-3">
                              <div>{b.date}</div>
                              <span className="text-[10px] text-emerald-400">{b.time}</span>
                            </td>
                            <td className="p-3">
                              <div>{b.playersCount} Jugadores</div>
                              <span className="text-[10px] text-slate-400">
                                {b.shoesCount ? `${b.shoesCount} pares` : (b.shoeSizes?.length ? `${b.shoeSizes.length} pares` : "Sin calzado")}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-emerald-400">
                                {formatUSD(b.totalUSD || 25)}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                ≈ {formatVES(b.totalUSD || 25, bcvRate)}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === "EN_PISTA"
                                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                    : b.status === "CONFIRMADA"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {b.status === "EN_PISTA"
                                  ? "🎳 En Pista"
                                  : b.status === "CONFIRMADA"
                                  ? "✓ Confirmada"
                                  : "⏳ Pendiente"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  soundFX.playPinStrike();
                                  handleCheckInBooking(b.bookingCode);
                                }}
                                className="btn-tactile px-2.5 py-1 rounded-lg bg-[#0033CC] hover:bg-[#00289E] text-white text-[11px] font-bold font-sans cursor-pointer shadow border border-white/20"
                              >
                                Check-In Pista
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOLARAPI */}
          {activeTab === "tasa" && (
            <div className="max-w-md mx-auto bg-slate-900/90 p-6 rounded-3xl border border-sky-500/30 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white uppercase italic flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-400" />
                    Sincronización DolarAPI (BCV)
                  </h3>
                  <button
                    onClick={handleSyncDolarApi}
                    disabled={isSyncingDolarApi}
                    className="btn-tactile px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingDolarApi ? "animate-spin" : ""}`} />
                    <span>Sincronizar</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  La tasa oficial se consulta automáticamente cada 5 minutos desde DolarAPI. Puedes sobreescribirla manualmente aquí si es necesario.
                </p>
              </div>

              <form onSubmit={handleSaveRate} className="space-y-4 font-mono">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                    Tasa de Cambio Oficial (VES por 1 USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={tempRate}
                      onChange={(e) => setTempRate(e.target.value)}
                      className="w-full bg-slate-950 border border-sky-500/40 rounded-xl px-3.5 py-2.5 text-lg font-black text-white focus:outline-none focus:border-sky-400"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Bs / $
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-tactile w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar y Aplicar en Toda la WebApp</span>
                </button>

                {rateSaved && (
                  <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-in fade-in">
                    ✓ ¡Tasa BCV actualizada a {parseFloat(tempRate).toFixed(2)} Bs/$!
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}