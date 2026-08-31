"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PINZULIA_LANES,
  MANAGER_KPIS,
  BowlingLane,
  LaneStatus,
} from "@/data/pinzuliaData";
import { formatUSD, formatVES } from "@/lib/utils";
import { useBcvRate } from "@/lib/useBcvRate";
import { soundFX } from "@/lib/soundEffects";
import {
  ShieldCheck,
  Play,
  RotateCcw,
  Plus,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  Radio,
  RefreshCw,
  Printer,
  Smartphone,
  MessageSquare,
  QrCode,
  Search,
  ArrowLeft,
  ExternalLink,
  Users,
  Footprints,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  DollarSign,
  Phone,
  Lock,
} from "lucide-react";
import { ByteBridgeSettings } from "@/components/ByteBridgeSettings";
import { WhatsAppBotManager } from "@/components/WhatsAppBotManager";
import { TransactionStore } from "@/lib/gateway/transactionStore";
import type { Transaction, ParsedBankNotification, IngestionChannel } from "@/lib/gateway/types";

const DEFAULT_BOOKINGS = [
  {
    bookingCode: "PIN-7401",
    clientName: "Alejandro Morales",
    clientPhone: "0414 1234567",
    packageName: "Pista de Bowling (1h)",
    serviceType: "bowling",
    laneNumber: 7,
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
];

type AdminTab = "pistas" | "reservas" | "whatsapp" | "bytebridge" | "pasarela" | "tasa";

export default function AdminPage() {
  const { rate: bcvRate, setCustomRate: setBcvRate } = useBcvRate();
  const [lanes, setLanes] = useState<BowlingLane[]>(PINZULIA_LANES);
  const [tempRate, setTempRate] = useState<string>(bcvRate.toFixed(2));
  const [rateSaved, setRateSaved] = useState<boolean>(false);
  const [isSyncingDolarApi, setIsSyncingDolarApi] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("pistas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [bookingList, setBookingList] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pinzulia_bookings");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return DEFAULT_BOOKINGS;
  });

  // Gateway Live Feed
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankLogs, setBankLogs] = useState<ParsedBankNotification[]>([]);
  const [simBank, setSimBank] = useState<string>("Banesco");
  const [simChannel, setSimChannel] = useState<IngestionChannel>("PUSH");
  const [simAmount, setSimAmount] = useState<string>("1.15");
  const [simRef, setSimRef] = useState<string>("849201");
  const [simResult, setSimResult] = useState<string | null>(null);

  useEffect(() => {
    setTempRate(bcvRate.toFixed(2));
  }, [bcvRate]);

  useEffect(() => {
    if (activeTab === "pasarela") {
      setTransactions(TransactionStore.getAllTransactions());
      setBankLogs(TransactionStore.getBankLogs());
    }
  }, [activeTab]);

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

  const handleCheckInBooking = (code: string) => {
    soundFX.playPinStrike();
    setBookingList((prev) =>
      prev.map((b) => (b.bookingCode === code ? { ...b, status: "EN_PISTA" } : b))
    );
    try {
      const stored = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
      const updated = stored.map((b: any) =>
        b.bookingCode === code ? { ...b, status: "EN_PISTA" } : b
      );
      localStorage.setItem("pinzulia_bookings", JSON.stringify(updated));
    } catch {}
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      setBcvRate(val);
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
        setBcvRate(data.rate);
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
          amountVES: parseFloat(simAmount) || 1.15,
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
  const occupancyPct = Math.round((activeCount / lanes.length) * 100);

  const filteredBookings = bookingList.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      (b.bookingCode && b.bookingCode.toLowerCase().includes(q)) ||
      (b.clientName && b.clientName.toLowerCase().includes(q)) ||
      (b.clientPhone && b.clientPhone.includes(q));

    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "EN_PISTA" && b.status === "EN_PISTA") ||
      (filterStatus === "CONFIRMADA" && b.status === "CONFIRMADA") ||
      (filterStatus === "PENDIENTE" && b.status !== "CONFIRMADA" && b.status !== "EN_PISTA");

    return matchQuery && matchStatus;
  });

  const tabItems: { id: AdminTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: "pistas", label: "14 Pistas", icon: Layers, count: activeCount, badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    { id: "reservas", label: "Reservas", icon: QrCode, count: filteredBookings.length, badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { id: "whatsapp", label: "Bot WA", icon: MessageSquare },
    { id: "bytebridge", label: "ByteBridge", icon: Smartphone },
    { id: "pasarela", label: "Pasarela", icon: Zap },
    { id: "tasa", label: "Tasa BCV", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 selection:bg-[#0033CC] selection:text-white flex flex-col pb-20 md:pb-8">
      {/* 1. TOP APP BAR */}
      <header className="sticky top-0 z-40 bg-[#070e1e]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-8 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            onClick={() => soundFX.playClick()}
            className="btn-tactile w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
            title="Volver a la WebApp Pública"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-black text-white uppercase italic tracking-tight font-sans">
                Consola Gerencial <span className="text-sky-400">PinZulia</span>
              </h1>
              <span className="px-1.5 py-0.2 rounded-full bg-[#0033CC] text-white text-[8px] sm:text-[9px] font-mono font-bold">
                1963
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              14 Carriles • ByteBridge Pago Móvil • Bot WhatsApp Entradas
            </p>
          </div>
        </div>

        {/* Header Right Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-white/10 font-mono text-[10px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 hidden xs:inline">BCV:</span>
            <span className="text-emerald-400 font-bold">{bcvRate.toFixed(2)} Bs/$</span>
          </div>

          <Link
            href="/pistas-qr"
            target="_blank"
            onClick={() => soundFX.playClick()}
            className="btn-tactile hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-sky-300 border border-sky-500/30 text-xs font-bold font-mono"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Stands QR</span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN COCKPIT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* COMPACT METRICS BAR FOR MOBILE & DESKTOP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 font-mono">
          <div className="bg-slate-900/90 p-2.5 sm:p-3.5 rounded-2xl border border-sky-500/20 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[11px] font-bold uppercase">
              <span>Pistas en Juego</span>
              <Activity className="w-3 h-3 text-sky-400" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-sky-400 pt-0.5">
              {activeCount} <span className="text-xs text-slate-500">/ {lanes.length}</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block pt-0.5">
              {occupancyPct}% ocupación
            </span>
          </div>

          <div className="bg-slate-900/90 p-2.5 sm:p-3.5 rounded-2xl border border-emerald-500/20 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[11px] font-bold uppercase">
              <span>Ventas Hoy</span>
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-400 pt-0.5">
              ${MANAGER_KPIS.todaySalesUSD} <span className="text-xs text-slate-500">USD</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block pt-0.5">
              ≈ {formatVES(MANAGER_KPIS.todaySalesUSD, bcvRate)}
            </span>
          </div>

          <div className="bg-slate-900/90 p-2.5 sm:p-3.5 rounded-2xl border border-amber-500/20 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[11px] font-bold uppercase">
              <span>Zapatos en Uso</span>
              <Footprints className="w-3 h-3 text-amber-300" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-300 pt-0.5">
              {MANAGER_KPIS.shoesInUse} <span className="text-xs text-slate-500">pares</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block pt-0.5">
              Cabinas UV Sanitizantes
            </span>
          </div>

          <div className="bg-slate-900/90 p-2.5 sm:p-3.5 rounded-2xl border border-red-500/20 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[11px] font-bold uppercase">
              <span>Tasa BCV</span>
              <button onClick={handleSyncDolarApi} disabled={isSyncingDolarApi} className="p-0.5">
                <RefreshCw className={`w-3 h-3 text-sky-400 ${isSyncingDolarApi ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="text-lg sm:text-2xl font-black text-red-400 pt-0.5">
              {bcvRate.toFixed(2)} <span className="text-xs text-slate-500">Bs/$</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold block pt-0.5">
              ✓ DolarAPI Sincronizada
            </span>
          </div>
        </div>

        {/* DESKTOP TABS (HIDDEN ON MOBILE) */}
        <div className="hidden md:flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar items-center gap-1.5 shadow-lg">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab(tab.id);
                }}
                className={`btn-tactile flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isActive
                    ? "bg-[#0033CC] text-white border-sky-400 shadow-md font-sans uppercase italic"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border ${
                      isActive ? "bg-black/30 text-white border-white/20" : tab.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4. TAB CONTENTS */}
        <div className="space-y-4">
          {/* TAB 1: 14 LANES COMPACT TACTILE GRID */}
          {activeTab === "pistas" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-white/10">
                <span className="text-xs font-black text-white uppercase italic font-sans flex items-center gap-1.5">
                  <span>🎳 14 Pistas Brunswick™</span>
                </span>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    {lanes.filter((l) => l.status === "disponible").length} Libres
                  </span>
                  <span className="text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/30">
                    {activeCount} En Juego
                  </span>
                </div>
              </div>

              {/* 2-COLUMN GRID ON MOBILE (FLAWLESS DENSITY) / 4-COL ON DESKTOP */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                {lanes.map((lane) => {
                  const isPlaying = lane.status === "en_juego";
                  const isReserved = lane.status === "reservada";
                  const isAvailable = lane.status === "disponible";
                  const isVip = lane.laneNumber >= 13;

                  return (
                    <div
                      key={lane.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                        isPlaying
                          ? "bg-[#071329] border-sky-500/50 shadow-lg shadow-sky-500/10"
                          : isReserved
                          ? "bg-amber-950/30 border-amber-500/30"
                          : "bg-slate-950/80 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-mono font-black text-[11px] sm:text-xs border ${
                              isVip ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-900 text-white border-white/10"
                            }`}
                          >
                            {lane.laneNumber.toString().padStart(2, "0")}
                          </span>
                          <div>
                            <div className="text-[11px] sm:text-xs font-black text-white flex items-center gap-1">
                              <span>Pista {lane.laneNumber}</span>
                              {isVip && <span className="text-[7px] bg-amber-500 text-black px-1 font-bold rounded">VIP</span>}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black uppercase font-mono border ${
                            isPlaying
                              ? "bg-sky-500/20 text-sky-300 border-sky-500/30 animate-pulse"
                              : isReserved
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {isPlaying ? "Juego" : isReserved ? "Reserva" : "Libre"}
                        </span>
                      </div>

                      <div className="space-y-0.5 font-mono text-[10px] bg-slate-950/80 p-2 rounded-xl border border-white/5">
                        <div className="text-slate-300 truncate">
                          {lane.currentPlayers && lane.currentPlayers.length > 0
                            ? `${lane.currentPlayers.length} jugadores`
                            : "Sin jugadores"}
                        </div>
                        {isPlaying && lane.remainingMinutes !== undefined && (
                          <div className="text-amber-300 font-bold flex items-center justify-between pt-0.5 border-t border-white/5">
                            <span>Tiempo:</span>
                            <span>{lane.remainingMinutes}m</span>
                          </div>
                        )}
                      </div>

                      {/* Tactile Quick Actions */}
                      <div className="flex items-center gap-1 pt-0.5">
                        {isAvailable && (
                          <button
                            onClick={() => handleStatusChange(lane.id, "en_juego")}
                            className="btn-tactile flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            <span>Iniciar</span>
                          </button>
                        )}

                        {isPlaying && (
                          <>
                            <button
                              onClick={() => handleAddMinutes(lane.id, 30)}
                              className="btn-tactile flex-1 py-1.5 rounded-lg bg-slate-900 text-sky-300 border border-sky-500/30 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>+30m</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(lane.id, "disponible")}
                              className="btn-tactile p-1.5 rounded-lg bg-red-950/80 text-red-300 border border-red-500/30 cursor-pointer"
                              title="Liberar Pista"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {isReserved && (
                          <button
                            onClick={() => handleStatusChange(lane.id, "en_juego")}
                            className="btn-tactile flex-1 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            <span>Activar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: QR RESERVATIONS (TOUCH CARDS ON MOBILE) */}
          {activeTab === "reservas" && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por #PIN o cliente..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  {["ALL", "CONFIRMADA", "EN_PISTA", "PENDIENTE"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        soundFX.playClick();
                        setFilterStatus(st);
                      }}
                      className={`btn-tactile px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap border ${
                        filterStatus === st ? "bg-sky-600 text-white border-sky-400" : "bg-slate-900 text-slate-400 border-white/5"
                      }`}
                    >
                      {st === "ALL" ? "Todos" : st === "CONFIRMADA" ? "Confirmadas" : st === "EN_PISTA" ? "En Pista" : "Pendientes"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD VIEW FOR TOUCH ERGONOMICS */}
              <div className="space-y-2.5 font-mono">
                {filteredBookings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/60 rounded-2xl border border-white/5">
                    No hay reservas registradas con ese filtro.
                  </div>
                ) : (
                  filteredBookings.map((b: any) => (
                    <div
                      key={b.bookingCode}
                      className="p-3.5 bg-slate-900/90 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40 text-xs">
                            #{b.bookingCode}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${
                              b.status === "EN_PISTA"
                                ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                                : b.status === "CONFIRMADA"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {b.status === "EN_PISTA" ? "🎳 En Pista" : b.status === "CONFIRMADA" ? "✓ Confirmada" : "⏳ Pendiente"}
                          </span>
                        </div>

                        <div className="font-bold text-white font-sans text-xs sm:text-sm">{b.clientName}</div>
                        <div className="text-slate-400 text-[10px]">
                          {b.clientPhone} • {b.packageName || "Pista Bowling"}
                        </div>
                        <div className="text-emerald-400 text-[10px]">
                          📅 {b.date} • ⏰ {b.time} • 👥 {b.playersCount} Jugadores
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="sm:text-right">
                          <span className="text-emerald-400 font-black text-sm">{formatUSD(b.totalUSD || 25)}</span>
                          <span className="text-[9px] text-slate-500 block">≈ {formatVES(b.totalUSD || 25, bcvRate)}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/ticket/${b.bookingCode}`}
                            target="_blank"
                            className="btn-tactile px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-300 border border-white/10 text-xs"
                          >
                            Pase
                          </Link>

                          <button
                            onClick={() => handleCheckInBooking(b.bookingCode)}
                            className="btn-tactile px-3 py-1.5 rounded-xl bg-[#0033CC] hover:bg-[#00289E] text-white text-xs font-bold font-sans shadow-md border border-white/20"
                          >
                            Check-In
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP BOT */}
          {activeTab === "whatsapp" && <WhatsAppBotManager />}

          {/* TAB 4: BYTEBRIDGE APP */}
          {activeTab === "bytebridge" && <ByteBridgeSettings />}

          {/* TAB 5: MULTI-CHANNEL GATEWAY & SIMULATOR */}
          {activeTab === "pasarela" && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 rounded-2xl border border-sky-500/30 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                  <h3 className="text-xs font-black text-white uppercase italic font-sans">
                    Simulador Ingesta Bancaria (Email / Push / SMS)
                  </h3>
                </div>

                <form onSubmit={handleRunSimulation} className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Canal:</span>
                    <select
                      value={simChannel}
                      onChange={(e) => setSimChannel(e.target.value as IngestionChannel)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white"
                    >
                      <option value="PUSH">Push (ByteBridge)</option>
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Banco:</span>
                    <select
                      value={simBank}
                      onChange={(e) => setSimBank(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white"
                    >
                      <option value="Banesco">Banesco</option>
                      <option value="Mercantil">Mercantil</option>
                      <option value="BDV">BDV</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Monto VES:</span>
                    <input
                      type="text"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      placeholder="1.15"
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Referencia:</span>
                    <input
                      type="text"
                      value={simRef}
                      onChange={(e) => setSimRef(e.target.value)}
                      placeholder="849201"
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-end">
                    <button
                      type="submit"
                      className="btn-tactile w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase"
                    >
                      Disparar
                    </button>
                  </div>
                </form>

                {simResult && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono">
                    ✓ {simResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: BCV RATE */}
          {activeTab === "tasa" && (
            <div className="max-w-md mx-auto bg-slate-900/90 p-5 rounded-3xl border border-sky-500/30 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400" />
                  Sincronización DolarAPI (BCV)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Ajusta o actualiza en vivo la tasa oficial de cambio en bolívares.
                </p>
              </div>

              <form onSubmit={handleSaveRate} className="space-y-3">
                <div className="space-y-1 font-mono">
                  <span className="text-xs text-slate-300">Tasa de Cambio Manual (Bs/USD):</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={tempRate}
                      onChange={(e) => setTempRate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white font-black text-xl text-center focus:outline-none focus:border-sky-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">
                      Bs / $
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-tactile w-full py-3 rounded-xl bg-[#0033CC] text-white font-black text-xs uppercase italic"
                >
                  Guardar Tasa en el Sistema
                </button>

                {rateSaved && (
                  <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-center text-xs font-mono text-emerald-300">
                    ✓ Tasa guardada exitosamente a {parseFloat(tempRate).toFixed(2)} Bs/$
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </main>

      {/* 5. NATIVE MOBILE BOTTOM NAVIGATION DOCK (FIXED AT SCREEN BOTTOM ON MOBILE) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070e1e]/98 backdrop-blur-2xl border-t border-white/15 px-2 py-2 flex items-center justify-around shadow-2xl">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playClick();
                setActiveTab(tab.id);
              }}
              className={`btn-tactile flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[9px] font-bold transition-all relative cursor-pointer ${
                isActive ? "text-sky-400 scale-105 font-black" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
              <span className="pt-0.5">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-[#0033CC] text-white text-[8px] font-mono font-bold flex items-center justify-center border border-white/20">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
