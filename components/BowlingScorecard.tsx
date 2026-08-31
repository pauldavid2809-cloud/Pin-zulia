"use client";

import React, { useState, useEffect } from "react";
import { soundFX } from "@/lib/soundEffects";
import { LaneGameState, PlayerGame, BowlingFrame } from "@/lib/bowling/types";
import { Trophy, Zap, Sparkles, RefreshCw, Flame, Gauge, Crown } from "lucide-react";

interface BowlingScorecardProps {
  laneNumber: number;
  initialGame?: LaneGameState;
  compact?: boolean;
}

export function BowlingScorecard({
  laneNumber,
  initialGame,
  compact = false,
}: BowlingScorecardProps) {
  const [gameState, setGameState] = useState<LaneGameState | null>(initialGame || null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastEventMsg, setLastEventMsg] = useState<string>("");

  const fetchScore = async () => {
    try {
      const res = await fetch(`/api/v1/bowling/scores?lane=${laneNumber}`);
      if (res.ok) {
        const data = await res.json();
        if (data.laneGame) setGameState(data.laneGame);
      }
    } catch {}
  };

  useEffect(() => {
    if (!initialGame) {
      fetchScore();
    }
  }, [laneNumber]);

  const handleRoll = async (pins: number, isStrike = false) => {
    soundFX.playClick();
    setIsSimulating(true);

    const speed = (24 + Math.random() * 8).toFixed(1);

    if (pins === 10) {
      soundFX.playPinStrike(); soundFX.playStrikeFanfare();
      setLastEventMsg("💥 ¡¡¡STRIKE PERFECTO!!!");
    } else if (pins >= 7) {
      soundFX.playPinStrike();
      setLastEventMsg(`🎳 ${pins} Pines Derribados (${speed} km/h)`);
    } else {
      soundFX.playPinStrike();
      setLastEventMsg(`🎳 ${pins} Pines (${speed} km/h)`);
    }

    try {
      const res = await fetch("/api/v1/bowling/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          laneNumber,
          action: "pinfall",
          pinsKnocked: pins,
          ballSpeedKmh: parseFloat(speed),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.laneGame) setGameState(data.laneGame);
      }
    } catch {}
    setIsSimulating(false);
  };

  const handleReset = async () => {
    soundFX.playClick();
    try {
      const res = await fetch("/api/v1/bowling/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          laneNumber,
          action: "reset",
          playerNames: ["Carlos M.", "Mariana R."],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.laneGame) {
          setGameState(data.laneGame);
          setLastEventMsg("🔄 Nueva Partida Iniciada");
        }
      }
    } catch {}
  };

  if (!gameState) {
    return (
      <div className="p-6 rounded-3xl bg-slate-950 border border-white/10 text-center font-mono text-xs text-slate-400">
        Cargando marcador de Pista {laneNumber}...
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-[#040814] text-white select-none">
      {/* Scoreboard Header: Brunswick TV Display */}
      <div className="bg-[#0033CC] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ED1C24] border-2 border-white flex items-center justify-center font-black text-white text-base shadow-md font-mono">
            {laneNumber < 10 ? `0${laneNumber}` : laneNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-lg sm:text-xl uppercase italic tracking-tight font-sans leading-none">
                Marcador Brunswick™ Vector Plus
              </h3>
              <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-black uppercase border border-emerald-500/40">
                ● En Vivo
              </span>
            </div>
            <span className="text-xs text-sky-200 font-mono font-bold">
              Telemetría Frame a Frame • PinZulia Bowling 1963
            </span>
          </div>
        </div>

        {/* Speed Radar & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 font-mono text-xs">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Velocidad:</span>
            <span className="font-black text-amber-300">
              {gameState.lastBallSpeedKmh || 27.5} km/h
            </span>
          </div>

          <button
            onClick={handleReset}
            className="btn-tactile p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/20 cursor-pointer"
            title="Reiniciar Partida"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frame by Frame Scoreboard Grid */}
      <div className="p-4 sm:p-6 space-y-6 overflow-x-auto">
        {gameState.players.map((player, pIdx) => {
          const isCurrentPlayer = gameState.activePlayerIndex === pIdx;

          return (
            <div
              key={player.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                isCurrentPlayer
                  ? "border-[#ED1C24] bg-slate-950/90 shadow-xl shadow-red-950/30"
                  : "border-white/10 bg-slate-950/50"
              }`}
            >
              {/* Player Header */}
              <div className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCurrentPlayer && <Crown className="w-4 h-4 text-amber-400" />}
                  <span className="font-black text-white text-sm sm:text-base uppercase italic font-sans">
                    {player.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({player.strikesCount} 💥 Strikes / {player.sparesCount} 🎳 Spares)
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-xs text-slate-400">Puntaje Total:</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    {player.totalScore}
                  </span>
                </div>
              </div>

              {/* 10 Frames Grid */}
              <div className="grid grid-cols-10 divide-x divide-white/10 text-center font-mono">
                {player.frames.map((frame, fIdx) => {
                  const isCurrentFrame = player.currentFrameIndex === fIdx;

                  return (
                    <div
                      key={fIdx}
                      className={`flex flex-col justify-between py-2 px-1 ${
                        isCurrentFrame ? "bg-[#ED1C24]/10" : ""
                      }`}
                    >
                      {/* Frame Number Header */}
                      <div className="text-[10px] font-black text-slate-400 border-b border-white/10 pb-1">
                        {frame.frameNumber}
                      </div>

                      {/* Rolls Box */}
                      <div className="py-2 flex items-center justify-center gap-1 text-xs sm:text-sm font-black">
                        {/* Roll 1 */}
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            frame.isStrike
                              ? "bg-[#ED1C24] text-white"
                              : "text-white"
                          }`}
                        >
                          {frame.isStrike ? "X" : frame.roll1 !== null ? frame.roll1 : "-"}
                        </span>

                        {/* Roll 2 */}
                        {fIdx < 9 && !frame.isStrike && (
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center border-l border-white/10 ${
                              frame.isSpare
                                ? "bg-[#0033CC] text-white"
                                : "text-slate-300"
                            }`}
                          >
                            {frame.isSpare ? "/" : frame.roll2 !== null ? frame.roll2 : "-"}
                          </span>
                        )}

                        {/* 10th Frame Roll 2 & 3 */}
                        {fIdx === 9 && (
                          <>
                            <span className="w-5 h-5 rounded flex items-center justify-center text-white border-l border-white/10">
                              {frame.roll2 === 10 ? "X" : frame.isSpare ? "/" : frame.roll2 !== null ? frame.roll2 : "-"}
                            </span>
                            <span className="w-5 h-5 rounded flex items-center justify-center text-white border-l border-white/10">
                              {frame.roll3 === 10 ? "X" : frame.roll3 !== null ? frame.roll3 : "-"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Cumulative Score */}
                      <div className="text-xs sm:text-sm font-black text-sky-300 pt-1 border-t border-white/10">
                        {frame.frameScore !== null ? frame.frameScore : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Live Simulator Pin Throw Controls */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase italic font-sans flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#ED1C24]" />
              <span>Simulador de Tiro IoT (Brunswick Bridge)</span>
            </span>
            {lastEventMsg && (
              <span className="text-xs font-mono font-bold text-amber-300 animate-bounce">
                {lastEventMsg}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
            <button
              onClick={() => handleRoll(10, true)}
              disabled={isSimulating}
              className="btn-tactile py-2.5 px-3 rounded-xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider cursor-pointer shadow-md"
            >
              💥 Strike (10)
            </button>
            <button
              onClick={() => handleRoll(9)}
              disabled={isSimulating}
              className="btn-tactile py-2.5 px-3 rounded-xl bg-[#0033CC] hover:bg-[#002299] text-white font-black text-xs uppercase italic tracking-wider cursor-pointer shadow-md"
            >
              🎳 9 Pines (Pocket)
            </button>
            <button
              onClick={() => handleRoll(7)}
              disabled={isSimulating}
              className="btn-tactile py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase italic tracking-wider cursor-pointer border border-white/10"
            >
              🎳 7 Pines (Split)
            </button>
            <button
              onClick={() => handleRoll(5)}
              disabled={isSimulating}
              className="btn-tactile py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase italic tracking-wider cursor-pointer border border-white/10"
            >
              🎳 5 Pines
            </button>
            <button
              onClick={() => handleRoll(0)}
              disabled={isSimulating}
              className="btn-tactile py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 font-black text-xs uppercase italic tracking-wider cursor-pointer border border-white/10"
            >
              ❌ Canal / Gutter (0)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
