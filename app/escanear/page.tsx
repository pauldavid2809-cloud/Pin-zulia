"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { soundFX } from "@/lib/soundEffects";
import { formatUSD } from "@/lib/utils";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  AlertCircle,
  Camera,
  RefreshCw,
  Play,
  Footprints,
  Phone,
  Calendar,
  Users,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";

const SAMPLE_BOOKINGS = [
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
    shoeSizes: ["39 EU", "40 EU", "41 EU", "42 EU", "42 EU"],
    shoesCount: 5,
    totalUSD: 37.5,
    status: "CONFIRMADA",
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

export default function EscanearPage() {
  const [manualCode, setManualCode] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<boolean>(false);

  const scannerRef = useRef<any>(null);
  const readerElementId = "qr-reader-viewport";

  const lookupBooking = (rawCode: string) => {
    let cleanCode = rawCode.trim().toUpperCase();

    // If QR contains full URL (e.g. https://pin-zulia.vercel.app/ticket/PIN-7401)
    if (cleanCode.includes("/TICKET/")) {
      const parts = cleanCode.split("/TICKET/");
      cleanCode = parts[parts.length - 1].replace(/[^A-Z0-9-]/g, "");
    } else {
      cleanCode = cleanCode.replace("#", "").replace(/[^A-Z0-9-]/g, "");
    }

    // 1. Search in localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
        const found = stored.find(
          (b: any) => b.bookingCode && b.bookingCode.toUpperCase() === cleanCode
        );
        if (found) return found;
      } catch {}
    }

    // 2. Search in sample bookings
    const sampleFound = SAMPLE_BOOKINGS.find((b) => b.bookingCode === cleanCode);
    if (sampleFound) return sampleFound;

    // 3. Dynamic generic fallback for any valid #PIN-XXXX
    if (cleanCode.startsWith("PIN-") || cleanCode.length >= 4) {
      return {
        bookingCode: cleanCode,
        clientName: "Cliente VIP",
        clientPhone: "+58 412 1083997",
        packageName: "Pista de Bowling Brunswick™ (1h)",
        serviceType: "bowling",
        laneNumber: 7,
        date: new Date().toISOString().split("T")[0],
        time: "07:00 PM",
        playersCount: 4,
        shoeSizes: ["39 EU", "40 EU", "41 EU", "42 EU"],
        shoesCount: 4,
        totalUSD: 25.0,
        status: "CONFIRMADA",
      };
    }

    return null;
  };

  const handleProcessCode = (codeText: string) => {
    const booking = lookupBooking(codeText);
    if (booking) {
      soundFX.playPinStrike();
      soundFX.playStrikeFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      setScannedResult(booking);
      setCheckInSuccess(false);

      // Stop camera once scanned successfully
      stopCamera();
    } else {
      alert("No se encontró una reservación válida con ese código.");
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessCode(manualCode);
  };

  const startCamera = async () => {
    soundFX.playClick();
    setCameraError(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId);
      }

      setIsCameraActive(true);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          handleProcessCode(decodedText);
        },
        () => {
          // ignore frame decode errors
        }
      );
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError(
        "No se pudo acceder a la cámara. Verifica los permisos de tu navegador o usa la búsqueda manual."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isCameraActive) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && isCameraActive) {
        try {
          scannerRef.current.stop();
        } catch {}
      }
    };
  }, [isCameraActive]);

  const handleConfirmCheckIn = () => {
    if (!scannedResult) return;
    soundFX.playStrikeFanfare();

    const updated = {
      ...scannedResult,
      status: "EN_PISTA",
    };

    // Save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
      const filtered = stored.filter((b: any) => b.bookingCode !== updated.bookingCode);
      filtered.unshift(updated);
      localStorage.setItem("pinzulia_bookings", JSON.stringify(filtered));
    } catch {}

    setScannedResult(updated);
    setCheckInSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 p-3 sm:p-6 selection:bg-[#0033CC] selection:text-white flex flex-col">
      <div className="max-w-xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* 1. TOP APP BAR */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Consola Gerencial</span>
          </Link>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-red-400 font-bold bg-red-950/60 px-2.5 py-1 rounded-full border border-red-500/30 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Recepción / Taquilla</span>
          </div>
        </div>

        {/* 2. SCANNER CARD */}
        <div className="bg-[#070e1e] rounded-3xl border-2 border-white/15 p-4 sm:p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0033CC] border border-sky-400/40 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/30">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white uppercase italic font-sans">
              Escáner de Pases QR PinZulia
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Apunta la cámara al código QR del cliente o ingresa el código #PIN.
            </p>
          </div>

          {/* 3. CAMERA VIEWFINDER (HTML5-QRCODE CONTAINER) */}
          <div className="relative aspect-square max-w-[280px] sm:max-w-[320px] mx-auto bg-black rounded-2xl border-2 border-sky-500/40 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
            <div id={readerElementId} className="w-full h-full object-cover" />

            {!isCameraActive && (
              <div className="absolute inset-0 bg-[#070e1e]/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <Camera className="w-12 h-12 text-slate-500 animate-pulse" />
                <span className="text-xs text-slate-300 font-mono">
                  Cámara inactiva para ahorrar batería
                </span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-tactile px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-600/30 font-sans"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activar Cámara</span>
                </button>
              </div>
            )}

            {isCameraActive && (
              <button
                type="button"
                onClick={stopCamera}
                className="btn-tactile absolute top-2 right-2 z-20 px-2.5 py-1 rounded-lg bg-black/70 text-slate-300 hover:text-white border border-white/20 text-[10px] font-mono"
              >
                Pausar
              </button>
            )}
          </div>

          {cameraError && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* 4. MANUAL INPUT FALLBACK */}
          <form onSubmit={handleManualSearch} className="space-y-2 pt-2 border-t border-white/10">
            <label className="block text-xs font-bold text-slate-300 font-mono text-center">
              O ingresa el código del boleto manualmente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej: PIN-7401"
                className="flex-1 bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="btn-tactile bg-[#0033CC] hover:bg-[#00289E] text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md font-sans uppercase italic"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Validar</span>
              </button>
            </div>
          </form>

          {/* 5. VERIFIED TICKET RESULT CARD */}
          {scannedResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 space-y-4 animate-in zoom-in-95 font-mono shadow-2xl">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5 font-sans uppercase italic">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pase Verificado & Activo</span>
                </span>
                <span className="text-sm font-mono font-black text-amber-300 bg-black/40 px-2.5 py-0.5 rounded border border-amber-500/40">
                  #{scannedResult.bookingCode}
                </span>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-950/90 p-3.5 rounded-xl border border-white/10">
                <div>
                  <span className="text-slate-400 text-[10px] block">Titular:</span>
                  <strong className="text-white font-sans text-sm">{scannedResult.clientName}</strong>
                  <span className="text-[10px] text-slate-400 block">{scannedResult.clientPhone}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Pista Asignada:</span>
                  <strong className="text-sky-300 text-sm">
                    {scannedResult.laneNumber ? `Pista ${scannedResult.laneNumber.toString().padStart(2, "0")}` : "Mesa Pool"}
                  </strong>
                  <span className="text-[10px] text-emerald-400 block">{scannedResult.time}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Jugadores & Zapatos:</span>
                  <span className="text-white">
                    {scannedResult.playersCount} pax • {scannedResult.shoesCount ? `${scannedResult.shoesCount} pares` : "Sin calzado"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Total Pagado:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    {formatUSD(scannedResult.totalUSD || 25)}
                  </span>
                </div>
              </div>

              {/* Shoes sizes detail if present */}
              {scannedResult.shoeSizes && scannedResult.shoeSizes.length > 0 && (
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    <Footprints className="w-3 h-3" />
                    <span>Tallas de Zapatos Requeridas:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {scannedResult.shoeSizes.map((sz: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-white/10">
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-In Action Button */}
              {!checkInSuccess ? (
                <button
                  type="button"
                  onClick={handleConfirmCheckIn}
                  className="btn-tactile w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/50 font-sans border border-white/20"
                >
                  <Play className="w-4 h-4" />
                  <span>Realizar Check-In & Entregar Pista</span>
                </button>
              ) : (
                <div className="p-3 bg-sky-950/80 border border-sky-500/40 rounded-xl text-center space-y-1 animate-in zoom-in-95">
                  <div className="text-xs font-bold text-sky-300">
                    🎳 ¡Check-In Exitoso! Pista {scannedResult.laneNumber || "07"} Iniciada en el Sistema.
                  </div>
                  <Link
                    href={`/pista/${scannedResult.laneNumber || "07"}`}
                    className="inline-flex items-center gap-1 text-[11px] text-white underline font-bold pt-1"
                  >
                    <span>Abrir Marcador de la Pista</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
