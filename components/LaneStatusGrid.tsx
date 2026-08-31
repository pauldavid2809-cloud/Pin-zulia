"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PINZULIA_LANES, BowlingLane, LaneStatus } from "@/data/pinzuliaData";
import { soundFX } from "@/lib/soundEffects";
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Ban,
  Utensils,
  ArrowRight,
  ExternalLink,
  Flame,
  Zap,
  QrCode,
} from "lucide-react";

interface LaneStatusGridProps {
  onSelectLaneForBooking: (laneNumber: number) => void;
  onSelectLaneForOrder: (laneNumber: number) => void;
}

export function LaneStatusGrid({
  onSelectLaneForBooking,
  onSelectLaneForOrder,
}: LaneStatusGridProps) {
  const [filter, setFilter] = useState<"todas" | LaneStatus>("todas");

  const lanes = PINZULIA_LANES;

  const filteredLanes = lanes.filter((lane) => {
    if (filter === "todas") return true;
    return lane.status === filter;
  });

  const availableCount = lanes.filter((l) => l.status === "disponible").length;
  const inGameCount = lanes.filter((l) => l.status === "en_juego").length;
  const reservedCount = lanes.filter((l) => l.status === "reservada").length;

  return (
    <section id="pistas" className="py-16 sm:py-20 bg-[#040814] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0033CC] text-white text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pistas 01 a 14 Brunswick™</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic retro-3d-text-blue">
            Monitor de Pistas en Tiempo Real
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Disponibilidad en vivo de los 14 carriles. Escanea el código QR de mesa o reserva tu turno online.
          </p>

          {/* Real-time Summary Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {availableCount} Libres
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-black font-mono">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              {inGameCount} En Juego
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-black font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {reservedCount} Reservadas
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: "todas", label: `Todas (14)` },
            { id: "disponible", label: `Libres (${availableCount})` },
            { id: "en_juego", label: `En Juego (${inGameCount})` },
            { id: "reservada", label: `Reservadas (${reservedCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundFX.playClick();
                setFilter(f.id as any);
              }}
              className={`btn-tactile px-4 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider cursor-pointer transition-all ${
                filter === f.id
                  ? "bg-[#ED1C24] text-white shadow-lg shadow-red-600/30 border-2 border-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 14 Lanes Grid: Two-Tone Card Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLanes.map((lane) => {
            const isAvailable = lane.status === "disponible";
            const isInGame = lane.status === "en_juego";
            const isReserved = lane.status === "reservada";
            const isVip = lane.laneNumber >= 13;

            return (
              <div
                key={lane.id}
                className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white flex flex-col justify-between group transition-all duration-200 hover:-translate-y-1"
              >
                {/* Two-Tone Top Header: Crisp White */}
                <div className="p-3.5 bg-white border-b-2 border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-[#0033CC] text-white font-black text-sm flex items-center justify-center font-mono shadow-md">
                      {lane.laneNumber < 10 ? `0${lane.laneNumber}` : lane.laneNumber}
                    </span>
                    <div>
                      <h3 className="font-black text-[#0033CC] text-base uppercase italic leading-none">
                        {lane.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        {isVip ? "Lounge VIP 1963" : "Pista Computarizada"}
                      </span>
                    </div>
                  </div>

                  {/* Status Tag */}
                  {isAvailable && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase font-mono border border-emerald-300">
                      Libre
                    </span>
                  )}
                  {isInGame && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase font-mono border border-red-300">
                      En Juego
                    </span>
                  )}
                  {isReserved && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase font-mono border border-amber-300">
                      Reservada
                    </span>
                  )}
                </div>

                {/* Two-Tone Bottom Body: Dark Obsidian / Red Accent */}
                <div className="p-4 bg-[#071022] text-slate-200 flex-1 flex flex-col justify-between space-y-3">
                  {/* Telemetry info */}
                  <div className="space-y-2">
                    {isInGame && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-sky-500/30 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                          Tiempo restante:
                        </span>
                        <span className="font-black text-sky-300 text-sm">
                          {lane.remainingMinutes || 45} min
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>Capacidad:</span>
                      <span className="font-bold text-white">Máx. 6 jugadores</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>Bumpers niños:</span>
                      <span className="text-emerald-400 font-bold">Automáticos</span>
                    </div>
                  </div>

                  {/* Action Cluster */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        onSelectLaneForBooking(lane.laneNumber);
                      }}
                      className="btn-tactile flex-1 py-2.5 px-3 rounded-xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <span>Reservar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/pista/${lane.laneNumber < 10 ? `0${lane.laneNumber}` : lane.laneNumber}`}
                      onClick={() => soundFX.playClick()}
                      className="btn-tactile p-2.5 rounded-xl bg-[#0033CC] hover:bg-[#002299] text-white border border-white/20 flex items-center justify-center shadow"
                      title="Abrir Mesa QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </Link>
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