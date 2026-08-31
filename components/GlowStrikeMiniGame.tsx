"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, RotateCcw, Copy, Check, Flame, Zap, Target } from "lucide-react";
import { soundFX } from "@/lib/soundEffects";

export function GlowStrikeMiniGame() {
  const [aimPosition, setAimPosition] = useState<number>(50); // 0 to 100
  const [power, setPower] = useState<number>(75); // 0 to 100
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [pinsState, setPinsState] = useState<boolean[]>([
    true, true, true, true, true, true, true, true, true, true,
  ]);
  const [scoreResult, setScoreResult] = useState<{
    pinsDown: number;
    title: string;
    message: string;
    couponCode?: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRoll = () => {
    if (isRolling) return;
    soundFX.playClick();
    setIsRolling(true);
    setScoreResult(null);

    // Play synthesized ball roll sound immediately
    soundFX.playBallRoll();

    // Calculate score based on center precision and power
    setTimeout(() => {
      soundFX.playPinStrike();

      const precisionError = Math.abs(aimPosition - 50);
      let pinsKnocked = 0;

      if (precisionError <= 8 && power >= 65) {
        // Strike!
        pinsKnocked = 10;
        setTimeout(() => soundFX.playStrikeFanfare(), 250);
      } else if (precisionError <= 18) {
        pinsKnocked = 7 + Math.floor(Math.random() * 3);
      } else if (precisionError <= 32) {
        pinsKnocked = 4 + Math.floor(Math.random() * 3);
      } else {
        pinsKnocked = Math.max(1, Math.floor(Math.random() * 4));
      }

      const newPins = Array(10).fill(false);
      const remainingPins = 10 - pinsKnocked;
      for (let i = 0; i < remainingPins; i++) {
        newPins[i] = true;
      }
      setPinsState(newPins);

      if (pinsKnocked === 10) {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#ef4444", "#f59e0b", "#ffffff"],
        });

        setScoreResult({
          pinsDown: 10,
          title: "🔥 ¡STRIKE PERFECTO! 🔥",
          message: "¡Derribaste los 10 pinos en la tronera central! Desbloqueaste un cupón de 10% de descuento en tu carril o tequeños gigantes de cortesía.",
          couponCode: "STRIKE10PZ",
        });
      } else if (pinsKnocked >= 7) {
        setScoreResult({
          pinsDown: pinsKnocked,
          title: "⚡ ¡Gran Tiro de Pista!",
          message: `Derribaste ${pinsKnocked} pinos. ¡Muy cerca del Strike! Ganaste 5% de descuento en tu comanda del Gastropub.`,
          couponCode: "PINZULIA5",
        });
      } else {
        setScoreResult({
          pinsDown: pinsKnocked,
          title: "🎳 Tiro de Calentamiento",
          message: `Derribaste ${pinsKnocked} pinos. Ajusta el tiro al centro de la pista (50%) con más del 70% de fuerza y repite.`,
        });
      }

      setIsRolling(false);
    }, 1100);
  };

  const handleReset = () => {
    soundFX.playClick();
    setPinsState(Array(10).fill(true));
    setScoreResult(null);
  };

  const handleCopyCoupon = (code: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="strike-game" className="py-16 sm:py-20 bg-[#02050e] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulador de Bowling Interactivo</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic">
            🎯 Tira tu Strike & Desbloquea Premios
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Apunta al centro de la pista y ajusta la fuerza de tu bola para derribar los 10 pinos.
            ¡Si sacas Strike, obtienes cupones de descuento válidos para tu visita a PinZulia!
          </p>
        </div>

        {/* Game Arcade Screen Box */}
        <div className="bg-slate-950 rounded-3xl border-2 border-sky-500/30 p-5 sm:p-8 shadow-2xl shadow-sky-950/40 space-y-6">
          {/* Top Scoreboard Digital Display */}
          <div className="bg-slate-900/90 rounded-2xl border border-white/10 p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                PINZULIA DIGITAL LANE 07
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">Pinos en Pie: <strong className="text-white text-sm">{pinsState.filter(Boolean).length}/10</strong></span>
              <span className="text-amber-400 font-bold">FRAME 10</span>
            </div>
          </div>

          {/* Lane Simulation Screen */}
          <div className="relative h-64 sm:h-72 bg-gradient-to-b from-[#030914] via-[#08172e] to-[#030914] rounded-2xl border border-sky-500/30 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            {/* 10 Bowling Pins Triangle */}
            <div className="flex flex-col items-center justify-center space-y-1.5 pt-2">
              {/* Row 4 (4 pins) */}
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-5 h-8 rounded-t-full border-2 transition-all duration-300 flex items-center justify-center text-[9px] font-black ${
                      pinsState[idx]
                        ? "bg-white border-red-500 text-red-600 shadow-md shadow-white/20"
                        : "opacity-0 scale-50 translate-y-6 rotate-45 pointer-events-none"
                    }`}
                  >
                    🎳
                  </div>
                ))}
              </div>

              {/* Row 3 (3 pins) */}
              <div className="flex gap-5">
                {[4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className={`w-5 h-8 rounded-t-full border-2 transition-all duration-300 flex items-center justify-center text-[9px] font-black ${
                      pinsState[idx]
                        ? "bg-white border-red-500 text-red-600 shadow-md shadow-white/20"
                        : "opacity-0 scale-50 translate-y-6 -rotate-45 pointer-events-none"
                    }`}
                  >
                    🎳
                  </div>
                ))}
              </div>

              {/* Row 2 (2 pins) */}
              <div className="flex gap-6">
                {[7, 8].map((idx) => (
                  <div
                    key={idx}
                    className={`w-5 h-8 rounded-t-full border-2 transition-all duration-300 flex items-center justify-center text-[9px] font-black ${
                      pinsState[idx]
                        ? "bg-white border-red-500 text-red-600 shadow-md shadow-white/20"
                        : "opacity-0 scale-50 translate-y-6 rotate-90 pointer-events-none"
                    }`}
                  >
                    🎳
                  </div>
                ))}
              </div>

              {/* Row 1 (Head Pin) */}
              <div>
                <div
                  className={`w-6 h-9 rounded-t-full border-2 transition-all duration-300 flex items-center justify-center text-xs font-black ${
                    pinsState[9]
                      ? "bg-white border-red-600 text-red-600 shadow-lg shadow-sky-400/40 animate-pulse"
                      : "opacity-0 scale-50 translate-y-6 rotate-180 pointer-events-none"
                  }`}
                >
                  👑
                </div>
              </div>
            </div>

            {/* Bowling Lane Lines & Guide Arrows */}
            <div className="absolute inset-x-8 top-0 bottom-12 flex justify-between opacity-15 pointer-events-none">
              <div className="w-1 h-full bg-cyan-400" />
              <div className="w-0.5 h-full bg-cyan-400" />
              <div className="w-0.5 h-full bg-cyan-400" />
              <div className="w-1 h-full bg-cyan-400" />
            </div>

            {/* Rolling Ball Indicator */}
            <div className="relative w-full h-12 flex items-center">
              <div
                style={{ left: `${aimPosition}%` }}
                className={`absolute -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-900 border-2 border-white shadow-xl shadow-sky-400/50 flex items-center justify-center transition-all duration-150 ${
                  isRolling
                    ? "-translate-y-36 scale-75 animate-spin"
                    : "hover:scale-110 cursor-ew-resize"
                }`}
              >
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-white/5">
            {/* Aim Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-400" />
                  Dirección del Tiro:
                </span>
                <span className="text-sky-400 font-mono text-xs">
                  {aimPosition < 45
                    ? "Carril Izquierdo"
                    : aimPosition > 55
                    ? "Carril Derecho"
                    : "🎯 Centro (Pocket)"}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={aimPosition}
                disabled={isRolling}
                onChange={(e) => setAimPosition(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Izq</span>
                <span className="text-sky-400">Centro</span>
                <span>Der</span>
              </div>
            </div>

            {/* Power Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Potencia de Lanzamiento:
                </span>
                <span className="text-amber-400 font-mono text-xs">{power}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="100"
                value={power}
                disabled={isRolling}
                onChange={(e) => setPower(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Suave</span>
                <span>Óptima</span>
                <span className="text-red-400">Máxima</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="btn-tactile w-full sm:flex-1 bg-gradient-to-r from-red-600 via-amber-500 to-sky-500 hover:from-red-500 hover:to-sky-400 text-white font-black py-3.5 px-6 rounded-xl shadow-xl shadow-red-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wide"
            >
              <Flame className="w-4 h-4" />
              <span>{isRolling ? "¡Lanzando Bola de Bowling...!" : "🎳 ¡LANZAR BOLA AHORA!"}</span>
            </button>

            <button
              onClick={handleReset}
              disabled={isRolling}
              className="btn-tactile w-full sm:w-auto p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Pinos</span>
            </button>
          </div>

          {/* Score & Coupon Display Result */}
          {scoreResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-red-950/80 border border-sky-400/40 text-center space-y-3 animate-in zoom-in-95">
              <h3 className="text-xl font-black text-white uppercase italic">{scoreResult.title}</h3>
              <p className="text-xs text-sky-100/90 max-w-md mx-auto">
                {scoreResult.message}
              </p>

              {scoreResult.couponCode && (
                <div className="inline-flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-amber-400/50 shadow-lg">
                  <span className="text-xs text-slate-400">Cupón de Premio:</span>
                  <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                    {scoreResult.couponCode}
                  </span>
                  <button
                    onClick={() => handleCopyCoupon(scoreResult.couponCode!)}
                    className="btn-tactile p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}