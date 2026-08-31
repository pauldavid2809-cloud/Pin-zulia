"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { PINZULIA_LANES } from "@/data/pinzuliaData";
import { PinZuliaStrikeComposition } from "./PinZuliaStrikeComposition";
import { soundFX } from "@/lib/soundEffects";
import {
  Sparkles,
  Zap,
  Activity,
  Maximize2,
  Play,
  RotateCcw,
  Layers,
  Flame,
  Radio,
  Footprints,
  Clock,
  ArrowRight,
  ShieldCheck,
  Volume2,
} from "lucide-react";

const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

interface LaneLive3DVisualizerProps {
  onReserveLane: (laneNumber: number) => void;
}

export function LaneLive3DVisualizer({ onReserveLane }: LaneLive3DVisualizerProps) {
  const [selectedLaneId, setSelectedLaneId] = useState<number>(7);
  const [uvModeActive, setUvModeActive] = useState<boolean>(true);
  const [currentEvent, setCurrentEvent] = useState<"STRIKE" | "SPARE" | "SPLIT" | "TURKEY">("STRIKE");

  const selectedLane =
    PINZULIA_LANES.find((l) => l.laneNumber === selectedLaneId) ||
    PINZULIA_LANES[6];

  const handleSelectEvent = (event: "STRIKE" | "SPARE" | "SPLIT" | "TURKEY") => {
    soundFX.playClick();
    setCurrentEvent(event);
    soundFX.playBallRoll();
    setTimeout(() => {
      soundFX.playPinStrike();
      if (event === "STRIKE" || event === "TURKEY") {
        setTimeout(() => soundFX.playStrikeFanfare(), 300);
      }
    }, 900);
  };

  const handleSelectLane = (laneNum: number) => {
    soundFX.playClick();
    setSelectedLaneId(laneNum);
  };

  return (
    <section className="py-16 sm:py-20 bg-[#02040a] border-t border-white/5 relative overflow-hidden">
      {/* Cyberpunk UV Neon Atmosphere */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-sky-400/30 text-sky-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Gráficos 3D & Telemetría Remotion 60FPS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic">
              Visualizador 3D de las 14 Pistas
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Arquitectura interactiva de los 14 carriles computarizados Brunswick™ de PinZulia con
              reproducción de tiro en tiempo real, sensor de pinos y audio espacial sintetizado.
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                soundFX.playClick();
                setUvModeActive(!uvModeActive);
              }}
              className={`btn-tactile px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                uvModeActive
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/25"
                  : "bg-slate-900 text-slate-300 border-white/10 hover:border-white/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{uvModeActive ? "Modo Neón UV Activo" : "Madera Clásica"}</span>
            </button>

            <div className="bg-slate-900/90 border border-white/10 px-3 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>14 CARRILES EN VIVO</span>
            </div>
          </div>
        </div>

        {/* Visualizer Main Grid: Left 3D Blueprint, Right Telemetry & Remotion Jumbotron */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): 3D Isometric 14 Lanes Interactive Blueprint */}
          <div className="lg:col-span-7 bg-slate-950/90 rounded-3xl border border-sky-500/20 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
                LAYOUT ARQUITECTÓNICO C.C. INTERNACIONAL (14 PISTAS)
              </span>
              <span className="text-[10px] text-sky-400 font-mono bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                Pista Seleccionada: #{selectedLaneId < 10 ? `0${selectedLaneId}` : selectedLaneId}
              </span>
            </div>

            {/* 3D Isometric Lanes Matrix */}
            <div className="relative bg-[#02050e] rounded-2xl p-4 border border-white/5 overflow-hidden">
              <div className="grid grid-cols-7 sm:grid-cols-7 gap-2 sm:gap-2.5">
                {PINZULIA_LANES.map((lane) => {
                  const isSelected = lane.laneNumber === selectedLaneId;
                  const isVip = lane.laneNumber >= 13;
                  const isFree = lane.status === "disponible";
                  const isPlaying = lane.status === "en_juego";

                  return (
                    <button
                      key={lane.id}
                      onClick={() => handleSelectLane(lane.laneNumber)}
                      className={`btn-tactile group relative rounded-xl p-2 flex flex-col items-center justify-between h-36 sm:h-44 transition-all duration-200 border cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-b from-sky-950 via-slate-900 to-sky-900/60 border-sky-400 shadow-xl shadow-sky-500/30 ring-2 ring-sky-400/50 -translate-y-1"
                          : uvModeActive
                          ? "bg-slate-950/80 border-cyan-900/40 hover:border-cyan-400/60 hover:bg-slate-900"
                          : "bg-slate-950/80 border-amber-900/30 hover:border-amber-400/50 hover:bg-slate-900"
                      }`}
                    >
                      {/* Lane Number Header */}
                      <div className="w-full flex items-center justify-between text-[10px] font-mono font-black">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isSelected
                              ? "bg-sky-500 text-white"
                              : "bg-slate-900 text-slate-400"
                          }`}
                        >
                          {lane.laneNumber < 10 ? `0${lane.laneNumber}` : lane.laneNumber}
                        </span>

                        {isVip && (
                          <span className="text-[7px] text-amber-300 font-bold bg-amber-500/20 px-1 py-0.2 rounded font-mono">
                            VIP
                          </span>
                        )}
                      </div>

                      {/* Lane Track Simulation Visual */}
                      <div
                        className={`w-full flex-1 my-1.5 rounded-lg relative overflow-hidden flex flex-col justify-between p-1 ${
                          uvModeActive
                            ? "bg-gradient-to-b from-cyan-950/60 via-blue-950/40 to-slate-950 border-x border-cyan-500/30"
                            : "bg-gradient-to-b from-amber-950/40 via-amber-900/20 to-slate-950 border-x border-amber-500/30"
                        }`}
                      >
                        {/* 10 Pins Mini Triangle at Top */}
                        <div className="flex flex-col items-center space-y-0.5">
                          <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-white" />
                            <span className="w-1 h-1 rounded-full bg-white" />
                            <span className="w-1 h-1 rounded-full bg-white" />
                            <span className="w-1 h-1 rounded-full bg-white" />
                          </div>
                          <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-white" />
                            <span className="w-1 h-1 rounded-full bg-white" />
                            <span className="w-1 h-1 rounded-full bg-white" />
                          </div>
                          <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-white" />
                            <span className="w-1 h-1 rounded-full bg-white" />
                          </div>
                          <div>
                            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                          </div>
                        </div>

                        {/* Ball or Laser Indicator */}
                        {isPlaying && (
                          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-md shadow-sky-400 mx-auto animate-bounce" />
                        )}

                        {/* Foul line */}
                        <div className="w-full h-0.5 bg-red-500" />
                      </div>

                      {/* Status Dot Bottom */}
                      <div className="w-full flex items-center justify-center">
                        {isFree ? (
                          <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            LIBRE
                          </span>
                        ) : isPlaying ? (
                          <span className="text-[8px] font-bold text-sky-300 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            {lane.remainingMinutes}m
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold text-amber-400 font-mono">
                            RESV
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blueprint Legend Bar */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <div className="flex items-center gap-3 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Libre
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> En Juego
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Reservada
                </span>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                💡 Haz clic en cualquier pista para cargar su telemetría
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Remotion 60FPS Jumbotron & Live Lane Telemetry HUD */}
          <div className="lg:col-span-5 space-y-4">
            {/* Remotion Live Strike Jumbotron Video Player Box */}
            <div className="bg-slate-950 rounded-3xl border-2 border-sky-500/30 p-3 sm:p-4 shadow-2xl overflow-hidden space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-black text-white uppercase font-mono tracking-wider">
                    JUMBOTRON LIVE FEED — PISTA {selectedLaneId < 10 ? `0${selectedLaneId}` : selectedLaneId}
                  </span>
                </div>
                <span className="text-[10px] text-amber-300 font-bold font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  REMOTION 60FPS
                </span>
              </div>

              {/* Event Celebration Mode Switcher Buttons */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => handleSelectEvent("STRIKE")}
                  className={`btn-tactile py-1.5 rounded-lg text-[10px] font-black uppercase font-mono cursor-pointer transition-all ${
                    currentEvent === "STRIKE"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🔥 Strike
                </button>

                <button
                  onClick={() => handleSelectEvent("SPARE")}
                  className={`btn-tactile py-1.5 rounded-lg text-[10px] font-black uppercase font-mono cursor-pointer transition-all ${
                    currentEvent === "SPARE"
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ⚡ Spare
                </button>

                <button
                  onClick={() => handleSelectEvent("SPLIT")}
                  className={`btn-tactile py-1.5 rounded-lg text-[10px] font-black uppercase font-mono cursor-pointer transition-all ${
                    currentEvent === "SPLIT"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ⚠️ Split
                </button>

                <button
                  onClick={() => handleSelectEvent("TURKEY")}
                  className={`btn-tactile py-1.5 rounded-lg text-[10px] font-black uppercase font-mono cursor-pointer transition-all ${
                    currentEvent === "TURKEY"
                      ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🦃 Turkey
                </button>
              </div>

              {/* Remotion Canvas Video Player Component */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black border border-sky-500/30 shadow-inner">
                <Player
                  key={currentEvent + selectedLaneId}
                  component={PinZuliaStrikeComposition}
                  inputProps={{
                    eventType: currentEvent,
                    laneNumber: selectedLaneId,
                    speedKmh: selectedLaneId >= 13 ? 31.2 : 29.4,
                    rpm: selectedLaneId >= 13 ? 460 : 430,
                  }}
                  durationInFrames={120}
                  compositionWidth={640}
                  compositionHeight={400}
                  fps={30}
                  loop
                  autoPlay
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  controls={false}
                />
              </div>

              {/* Lane Technical Telemetry Gauges */}
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                <div className="bg-slate-900/90 border border-white/5 rounded-xl p-2 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Velocidad Bola</div>
                  <div className="text-sm font-black text-sky-400">
                    {selectedLaneId >= 13 ? "31.2 km/h" : "29.4 km/h"}
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-white/5 rounded-xl p-2 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Rotación RPM</div>
                  <div className="text-sm font-black text-amber-400">
                    {selectedLaneId >= 13 ? "460 RPM" : "430 RPM"}
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-white/5 rounded-xl p-2 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Ángulo Pocket</div>
                  <div className="text-sm font-black text-emerald-400">6.2° Entry</div>
                </div>
              </div>
            </div>

            {/* Selected Lane Details & Action Card */}
            <div className="bg-slate-950/90 rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <span>{selectedLane.name}</span>
                    {selectedLane.laneNumber >= 13 && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-black font-mono">
                        LOUNGE VIP
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedLane.status === "disponible"
                      ? "Pista lista para jugar. Calzado sanitizado y parachoques configurables."
                      : selectedLane.status === "en_juego"
                      ? `Partida en curso (${selectedLane.packageType || "1 Hora"}). Tiempo restante: ${selectedLane.remainingMinutes} min.`
                      : "Pista con reserva programada."}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onReserveLane(selectedLane.laneNumber);
                  }}
                  className="btn-tactile w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-sky-500/25 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <span>Reservar Pista {selectedLane.laneNumber} Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}