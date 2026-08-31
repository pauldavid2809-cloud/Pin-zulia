"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, CheckCircle2, ShieldCheck, QrCode, AlertCircle } from "lucide-react";

export default function EscanearPage() {
  const [manualCode, setManualCode] = useState<string>("");
  const [scannedResult, setScannedResult] = useState<{
    code: string;
    client: string;
    lane: string;
    status: string;
    players: number;
    amount: string;
  } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const formatted = manualCode.toUpperCase().replace("#", "");

    // Mock validation
    setScannedResult({
      code: formatted,
      client: "Carlos Mendoza (Grupo)",
      lane: "Pista 07",
      status: "Confirmada QR",
      players: 5,
      amount: "$25.00 USD",
    });
  };

  return (
    <div className="min-h-screen bg-[#070f1e] text-slate-100 p-4 sm:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a PinZulia</span>
          </Link>

          <div className="flex items-center gap-1 text-xs text-red-400 font-bold bg-red-950/60 px-2.5 py-1 rounded-full border border-red-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Modo Anfitrión / Recepción</span>
          </div>
        </div>

        {/* Scanner Card */}
        <div className="bg-slate-900 rounded-3xl border-2 border-sky-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">
              Escáner de Pases QR PinZulia
            </h1>
            <p className="text-xs text-slate-400">
              Escanea el código QR del cliente o ingresa el código alfanumérico `#PIN-XXXX`.
            </p>
          </div>

          {/* Camera Viewfinder Mockup */}
          <div className="relative aspect-square max-w-[280px] mx-auto bg-black rounded-2xl border-2 border-sky-400 overflow-hidden flex flex-col items-center justify-center p-4">
            <div className="w-48 h-48 border-2 border-dashed border-sky-400/70 rounded-xl relative flex items-center justify-center animate-pulse">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 shadow-md shadow-red-500" />
              <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider bg-black/80 px-2 py-1 rounded">
                Apunta al código QR
              </span>
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 text-center">
              O ingresa el código de reservación:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej: PIN-501"
                className="flex-1 bg-slate-950 border border-sky-500/30 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                <span>Validar</span>
              </button>
            </div>
          </form>

          {/* Validation Result Box */}
          {scannedResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  PASE VERIFICADO Y ACTIVO
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  #{scannedResult.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] block">Cliente:</span>
                  <strong className="text-white">{scannedResult.client}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Pista:</span>
                  <strong className="text-sky-300">{scannedResult.lane}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Jugadores:</span>
                  <span className="text-white">{scannedResult.players} pax</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Monto:</span>
                  <span className="text-emerald-400 font-bold">{scannedResult.amount}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Pista ${scannedResult.lane} habilitada. ¡Buen juego!`)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs shadow-md"
              >
                Habilitar Pista & Entregar Calzado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
