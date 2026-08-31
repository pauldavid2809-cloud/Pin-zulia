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
import { soundFX } from "@/lib/soundEffects";
import {
  ShieldCheck,
  X,
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
    { id: "reservas", label: "Pases QR", icon: QrCode, count: filteredBookings.length, badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { id: "whatsapp", label: "Bot WA", icon: MessageSquare },
    { id: "bytebridge", label: "ByteBridge", icon: Smartphone },
    { id: "pasarela", label: "Pasarela", icon: Zap },
    { id: "tasa", label: "Tasa BCV", icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="bg-[#040814] sm:bg-[#070e1e] sm:border-2 sm:border-white/15 sm:rounded-3xl w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* 1. TOP COMPACT HEADER */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-[#070e1e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0033CC] flex items-center justify-center text-white font-black shadow-md border border-white/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-white uppercase italic tracking-tight font-sans">
                  Consola Gerencial <span className="text-sky-400">PinZulia</span>
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-[#0033CC] text-white text-[8px] font-mono font-bold">
                  1963
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                14 Carriles • ByteBridge Pago Móvil • Bot WhatsApp Entradas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 font-mono text-[10px] sm:text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">{bcvRate.toFixed(2)} Bs/$</span>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="btn-tactile p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-white/10 cursor-pointer"
              title="Cerrar Consola"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. COMPACT METRICS STRIP (SAVING 70% HEIGHT ON MOBILE) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 bg-slate-950/90 border-b border-white/5 font-mono">
          <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-xl border border-sky-500/20 flex items-center justify-between">
            <div>
              <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold block">Pistas</span>
              <div className="text-sm sm:text-lg font-black text-sky-400">{activeCount} / {lanes.length}</div>
            </div>
            <span className="text-[9px] text-sky-300/80 font-bold">{occupancyPct}%</span>
          </div>

          <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold block">Ventas Hoy</span>
              <div className="text-sm sm:text-lg font-black text-emerald-400">${MANAGER_KPIS.todaySalesUSD}</div>
            </div>
            <span className="text-[8px] text-slate-500 hidden xs:inline">USD</span>
          </div>

          <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold block">Calzado</span>
              <div className="text-sm sm:text-lg font-black text-amber-300">{MANAGER_KPIS.shoesInUse} pares</div>
            </div>
            <span className="text-[8px] text-amber-400/80 font-bold">UV</span>
          </div>

          <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-xl border border-red-500/20 flex items-center justify-between">
            <div>
              <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold block">Tasa BCV</span>
              <div className="text-sm sm:text-lg font-black text-red-400">{bcvRate.toFixed(2)}</div>
            </div>
            <button onClick={handleSyncDolarApi} disabled={isSyncingDolarApi} className="p-0.5">
              <RefreshCw className={`w-3 h-3 text-sky-400 ${isSyncingDolarApi ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 3. TABS BAR WITH NO-SCROLLBAR SMOOTH CHIPS */}
        <div className="bg-slate-950/90 px-2 py-1.5 border-b border-white/10 overflow-x-auto no-scrollbar flex items-center gap-1">
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
                className={`btn-tactile py-1.5 px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  isActive
                    ? "bg-[#0033CC] text-white border-sky-400 shadow-md font-sans uppercase italic"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1 py-0.2 rounded-full text-[8px] font-mono font-bold border ${
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

        {/* 4. CONTENT BODY (2-COLUMN GRID FOR 14 LANES ON MOBILE) */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-3 pb-16 sm:pb-4">
          {/* TAB 1: 14 LANES COMPACT 2-COL MOBILE RACK */}
          {activeTab === "pistas" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/10 text-[10px] font-mono">
                <span className="font-bold text-white font-sans uppercase italic">🎳 14 Pistas Brunswick™</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {lanes.filter((l) => l.status === "disponible").length} Libres
                  </span>
                  <span className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                    {activeCount} En Juego
                  </span>
                </div>
              </div>

              {/* 2 COLUMNS ON MOBILE (< 640px) / 3 COLUMNS ON TABLET / 4 ON DESKTOP */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {lanes.map((lane) => {
                  const isPlaying = lane.status === "en_juego";
                  const isReserved = lane.status === "reservada";
                  const isAvailable = lane.status === "disponible";
                  const isVip = lane.laneNumber >= 13;

                  return (
                    <div
                      key={lane.id}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                        isPlaying
                          ? "bg-[#071329] border-sky-500/50 shadow-md shadow-sky-500/10"
                          : isReserved
                          ? "bg-amber-950/30 border-amber-500/30"
                          : "bg-slate-950/80 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs border ${
                              isVip ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-900 text-white border-white/10"
                            }`}
                          >
                            {lane.laneNumber.toString().padStart(2, "0")}
                          </span>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1">
                              <span>Pista {lane.laneNumber}</span>
                              {isVip && <span className="text-[7px] bg-amber-500 text-black px-1 font-bold rounded">VIP</span>}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase font-mono border ${
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

                      <div className="space-y-0.5 font-mono text-[9px] sm:text-[10px] bg-slate-950/80 p-1.5 rounded-lg border border-white/5">
                        <div className="text-slate-300 truncate">
                          {lane.currentPlayers && lane.currentPlayers.length > 0
                            ? `${lane.currentPlayers.length} jugadores`
                            : "Sin jugadores"}
                        </div>
                        {isPlaying && lane.remainingMinutes !== undefined && (
                          <div className="text-amber-300 font-bold flex items-center justify-between pt-0.5 border-t border-white/5">
                            <span>Restante:</span>
                            <span>{lane.remainingMinutes}m</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 pt-0.5">
                        {isAvailable && (
                          <button
                            onClick={() => handleStatusChange(lane.id, "en_juego")}
                            className="btn-tactile flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" />
                            <span>Iniciar</span>
                          </button>
                        )}

                        {isPlaying && (
                          <>
                            <button
                              onClick={() => handleAddMinutes(lane.id, 30)}
                              className="btn-tactile flex-1 py-1.5 rounded-lg bg-slate-900 text-sky-300 border border-sky-500/30 font-bold text-[10px] flex items-center justify-center gap-0.5"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>+30m</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(lane.id, "disponible")}
                              className="btn-tactile p-1.5 rounded-lg bg-red-950/80 text-red-300 border border-red-500/30"
                              title="Liberar Pista"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {isReserved && (
                          <button
                            onClick={() => handleStatusChange(lane.id, "en_juego")}
                            className="btn-tactile flex-1 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" />
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

          {/* TAB 2: QR RESERVATIONS & CHECK-IN */}
          {activeTab === "reservas" && (
            <div className="space-y-2.5">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar #PIN o cliente..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  {["ALL", "CONFIRMADA", "EN_PISTA", "PENDIENTE"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        soundFX.playClick();
                        setFilterStatus(st);
                      }}
                      className={`btn-tactile px-2 py-1 rounded text-[9px] font-mono font-bold whitespace-nowrap border ${
                        filterStatus === st ? "bg-sky-600 text-white border-sky-400" : "bg-slate-900 text-slate-400 border-white/5"
                      }`}
                    >
                      {st === "ALL" ? "Todos" : st === "CONFIRMADA" ? "Confirmadas" : st === "EN_PISTA" ? "En Pista" : "Pendientes"}
                    </button>
                  ))}
                </div>
              </div>

              {/* RESERVATION TOUCH CARDS */}
              <div className="space-y-2 font-mono text-xs">
                {filteredBookings.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-900/60 rounded-xl border border-white/5">
                    No se encontraron reservas con ese filtro.
                  </div>
                ) : (
                  filteredBookings.map((b: any) => (
                    <div
                      key={b.bookingCode}
                      className="p-3 bg-slate-900/90 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300 bg-amber-950/80 px-2 py-0.2 rounded border border-amber-500/40 text-[11px]">
                            #{b.bookingCode}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[8px] font-bold border ${
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

                        <div className="font-bold text-white font-sans text-xs">{b.clientName}</div>
                        <div className="text-slate-400 text-[10px]">
                          {b.clientPhone} • {b.packageName || "Pista Bowling"}
                        </div>
                        <div className="text-emerald-400 text-[10px]">
                          📅 {b.date} • ⏰ {b.time} • 👥 {b.playersCount} Jugadores
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div>
                          <span className="text-emerald-400 font-bold text-xs">{formatUSD(b.totalUSD || 25)}</span>
                          <span className="text-[8px] text-slate-500 block">≈ {formatVES(b.totalUSD || 25, bcvRate)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Link
                            href={`/ticket/${b.bookingCode}`}
                            target="_blank"
                            className="btn-tactile px-2 py-1 rounded bg-slate-950 text-slate-300 border border-white/10 text-[10px]"
                          >
                            Pase
                          </Link>

                          <button
                            onClick={() => handleCheckInBooking(b.bookingCode)}
                            className="btn-tactile px-2.5 py-1 rounded bg-[#0033CC] hover:bg-[#00289E] text-white text-[10px] font-bold font-sans shadow"
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

          {/* TAB 4: BYTEBRIDGE ANDROID APP */}
          {activeTab === "bytebridge" && <ByteBridgeSettings />}

          {/* TAB 5: MULTI-CHANNEL GATEWAY & SIMULATOR */}
          {activeTab === "pasarela" && (
            <div className="space-y-3">
              <div className="bg-slate-900/90 rounded-xl border border-sky-500/30 p-3 space-y-2.5">
                <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <h3 className="text-xs font-black text-white uppercase italic font-sans">
                    Simulador Ingesta Bancaria (Email / Push / SMS)
                  </h3>
                </div>

                <form onSubmit={handleRunSimulation} className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400">Canal:</span>
                    <select
                      value={simChannel}
                      onChange={(e) => setSimChannel(e.target.value as IngestionChannel)}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-white text-[11px]"
                    >
                      <option value="PUSH">Push (ByteBridge)</option>
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400">Banco:</span>
                    <select
                      value={simBank}
                      onChange={(e) => setSimBank(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-white text-[11px]"
                    >
                      <option value="Banesco">Banesco</option>
                      <option value="Mercantil">Mercantil</option>
                      <option value="BDV">BDV</option>
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400">Monto VES:</span>
                    <input
                      type="text"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      placeholder="1.15"
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-emerald-400 font-bold text-[11px]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400">Referencia:</span>
                    <input
                      type="text"
                      value={simRef}
                      onChange={(e) => setSimRef(e.target.value)}
                      placeholder="849201"
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-white text-[11px]"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-end">
                    <button
                      type="submit"
                      className="btn-tactile w-full py-1.5 rounded bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[11px] uppercase"
                    >
                      Disparar
                    </button>
                  </div>
                </form>

                {simResult && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-[10px] text-emerald-300 font-mono">
                    ✓ {simResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: BCV RATE & DOLARAPI */}
          {activeTab === "tasa" && (
            <div className="max-w-sm mx-auto bg-slate-900/90 p-4 rounded-2xl border border-sky-500/30 space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-white uppercase italic flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  Sincronización DolarAPI (BCV)
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Ajusta o actualiza la tasa oficial de cambio en bolívares.
                </p>
              </div>

              <form onSubmit={handleSaveRate} className="space-y-2.5 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-300">Tasa de Cambio Manual (Bs/USD):</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={tempRate}
                      onChange={(e) => setTempRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-black text-lg text-center focus:outline-none focus:border-sky-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">
                      Bs / $
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-tactile w-full py-2.5 rounded-xl bg-[#0033CC] text-white font-black text-xs uppercase italic"
                >
                  Guardar Tasa en el Sistema
                </button>

                {rateSaved && (
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-center text-[10px] text-emerald-300">
                    ✓ Tasa guardada exitosamente a {parseFloat(tempRate).toFixed(2)} Bs/$
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
