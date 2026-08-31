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
    { id: "whatsapp", label: "Bot WhatsApp", icon: MessageSquare },
    { id: "bytebridge", label: "ByteBridge", icon: Smartphone },
    { id: "pasarela", label: "Pasarela Live", icon: Zap },
    { id: "tasa", label: "Tasa BCV", icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="bg-[#070e1e] border-2 border-white/15 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0033CC] flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30 border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase italic tracking-tight font-sans">
                  Consola Gerencial <span className="text-sky-400">PinZulia</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#0033CC] text-white text-[9px] font-mono font-bold">
                  PROD 1963
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                14 Carriles • ByteBridge Pago Móvil • Bot WhatsApp Entradas • DolarAPI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pistas-qr"
              target="_blank"
              onClick={() => soundFX.playClick()}
              className="btn-tactile hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 text-xs font-bold font-mono"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Stands QR</span>
            </Link>

            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="btn-tactile p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time KPIs Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-slate-950/80 border-b border-white/5 font-mono">
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-sky-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Pistas en Juego
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-400 pt-0.5">
              {activeCount} / {lanes.length}
            </div>
            <span className="text-[10px] text-slate-500">
              {occupancyPct}% aforo • {reservedCount} reservadas
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Ventas Estimadas Hoy
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 pt-0.5">
              ${MANAGER_KPIS.todaySalesUSD} USD
            </div>
            <span className="text-[10px] text-slate-500">
              ≈ {formatVES(MANAGER_KPIS.todaySalesUSD, bcvRate)}
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Zapatos Sanitizados
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 pt-0.5">
              {MANAGER_KPIS.shoesInUse} pares
            </div>
            <span className="text-[10px] text-slate-500">
              Cabinas UV Activas
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Tasa BCV Oficial
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">DolarAPI</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-400 pt-0.5">
              {bcvRate.toFixed(2)} Bs/$
            </div>
            <span className="text-[10px] text-slate-500">
              Sincronizada automáticamente
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="bg-slate-950/90 p-1.5 border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-1.5">
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
                className={`btn-tactile py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                  isActive
                    ? "bg-[#0033CC] text-white border-sky-400 shadow-md shadow-blue-600/30 font-sans uppercase italic"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: 14 LANES */}
          {activeTab === "pistas" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {lanes.map((lane) => {
                const isPlaying = lane.status === "en_juego";
                const isReserved = lane.status === "reservada";
                const isAvailable = lane.status === "disponible";
                const isVip = lane.laneNumber >= 13;

                return (
                  <div
                    key={lane.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isPlaying
                        ? "bg-[#071329] border-sky-500/40 shadow-lg shadow-sky-500/10"
                        : isReserved
                        ? "bg-amber-950/30 border-amber-500/30"
                        : "bg-slate-950/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs border ${
                            isVip ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-slate-900 text-white border-white/10"
                          }`}
                        >
                          {lane.laneNumber.toString().padStart(2, "0")}
                        </span>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1">
                            <span>Pista {lane.laneNumber.toString().padStart(2, "0")}</span>
                            {isVip && <span className="text-[8px] bg-amber-500 text-black px-1 font-bold rounded">VIP</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lane.name}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono border ${
                          isPlaying
                            ? "bg-sky-500/20 text-sky-300 border-sky-500/30 animate-pulse"
                            : isReserved
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {isPlaying ? "En Juego" : isReserved ? "Reservada" : "Disponible"}
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <div className="text-slate-300 flex items-center justify-between">
                        <span>Jugadores:</span>
                        <span className="font-bold text-white">
                          {lane.currentPlayers && lane.currentPlayers.length > 0
                            ? `${lane.currentPlayers.length} pax`
                            : "Sin jugadores"}
                        </span>
                      </div>
                      {isPlaying && lane.remainingMinutes !== undefined && (
                        <div className="text-sky-300 font-bold flex items-center justify-between pt-1 border-t border-white/5">
                          <span>Tiempo Restante:</span>
                          <span className="text-amber-300">{lane.remainingMinutes} min</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {isAvailable && (
                        <button
                          onClick={() => handleStatusChange(lane.id, "en_juego")}
                          className="btn-tactile flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Iniciar</span>
                        </button>
                      )}

                      {isPlaying && (
                        <>
                          <button
                            onClick={() => handleAddMinutes(lane.id, 30)}
                            className="btn-tactile flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+30m</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(lane.id, "disponible")}
                            className="btn-tactile p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30"
                            title="Liberar Pista"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {isReserved && (
                        <button
                          onClick={() => handleStatusChange(lane.id, "en_juego")}
                          className="btn-tactile flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1"
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
          )}

          {/* TAB 2: QR RESERVATIONS & RECEPTION */}
          {activeTab === "reservas" && (
            <div className="space-y-4">
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

                <div className="flex items-center gap-2">
                  {["ALL", "CONFIRMADA", "EN_PISTA", "PENDIENTE"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        soundFX.playClick();
                        setFilterStatus(st);
                      }}
                      className={`btn-tactile px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer border ${
                        filterStatus === st
                          ? "bg-sky-600 text-white border-sky-400"
                          : "bg-slate-950 text-slate-400 border-white/5 hover:text-white"
                      }`}
                    >
                      {st === "ALL" ? "Todos" : st === "CONFIRMADA" ? "Confirmadas" : st === "EN_PISTA" ? "En Pista" : "Pendientes"}
                    </button>
                  ))}
                </div>
              </div>

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
                                {b.shoesCount ? `${b.shoesCount} pares` : "Sin calzado"}
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
                            <td className="p-3 text-right space-x-1.5">
                              <Link
                                href={`/ticket/${b.bookingCode}`}
                                target="_blank"
                                className="btn-tactile px-2 py-1 rounded-lg bg-slate-900 text-slate-300 text-[11px] font-mono border border-white/10"
                              >
                                Pase
                              </Link>
                              <button
                                onClick={() => handleCheckInBooking(b.bookingCode)}
                                className="btn-tactile px-2.5 py-1 rounded-lg bg-[#0033CC] hover:bg-[#00289E] text-white text-[11px] font-bold font-sans cursor-pointer shadow border border-white/20"
                              >
                                Check-In
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

          {/* TAB 3: WHATSAPP BOT */}
          {activeTab === "whatsapp" && <WhatsAppBotManager />}

          {/* TAB 4: BYTEBRIDGE ANDROID APP CONFIG */}
          {activeTab === "bytebridge" && <ByteBridgeSettings />}

          {/* TAB 5: MULTI-CHANNEL GATEWAY & LOGS */}
          {activeTab === "pasarela" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 rounded-3xl border border-sky-500/30 p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase italic font-sans tracking-wide">
                        Simulador de Ingesta Bancaria en Vivo (Email / Push / SMS)
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Dispara notificaciones simuladas para probar la auto-aprobación en &lt; 3 segundos.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRunSimulation} className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Canal:</span>
                    <select
                      value={simChannel}
                      onChange={(e) => setSimChannel(e.target.value as IngestionChannel)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="PUSH">Push (ByteBridge)</option>
                      <option value="EMAIL">Email (Gmail)</option>
                      <option value="SMS">SMS (Banco)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Banco:</span>
                    <select
                      value={simBank}
                      onChange={(e) => setSimBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Banesco">Banesco</option>
                      <option value="Mercantil">Mercantil</option>
                      <option value="BDV">Banco de Venezuela</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Monto VES:</span>
                    <input
                      type="text"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      placeholder="1.15"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Referencia:</span>
                    <input
                      type="text"
                      value={simRef}
                      onChange={(e) => setSimRef(e.target.value)}
                      placeholder="849201"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="btn-tactile w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md font-sans"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Disparar</span>
                    </button>
                  </div>
                </form>

                {simResult && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono">
                    ✓ {simResult}
                  </div>
                )}
              </div>

              {/* Transactions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
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
                      No hay transacciones registradas aún.
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

          {/* TAB 6: DOLARAPI */}
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
                    className="btn-tactile px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 hover:text-white border border-sky-500/30 text-[10px] font-mono font-bold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingDolarApi ? "animate-spin" : ""}`} />
                    <span>Actualizar</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Obtiene el valor oficial de la tasa de cambio en vivo desde la API de DolarAPI / BCV.
                </p>
              </div>

              <form onSubmit={handleSaveRate} className="space-y-4">
                <div className="space-y-1.5 font-mono">
                  <span className="text-xs text-slate-300">Tasa de Cambio Manual / Forzada (Bs/USD):</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={tempRate}
                      onChange={(e) => setTempRate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white font-black text-xl text-center focus:outline-none focus:border-sky-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      Bs / $
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-tactile w-full py-3 rounded-xl bg-[#0033CC] hover:bg-[#00289E] text-white font-black text-xs uppercase italic tracking-wider shadow-lg border border-white/20"
                >
                  Guardar Tasa en el Sistema
                </button>

                {rateSaved && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-center text-xs font-mono text-emerald-300">
                    ✓ Tasa actualizada exitosamente a {parseFloat(tempRate).toFixed(2)} Bs/$
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
