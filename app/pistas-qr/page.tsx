"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PINZULIA_LANES } from "@/data/pinzuliaData";
import { CurrencyMode, DEFAULT_BCV_RATE } from "@/data/currencies";
import { ArrowLeft, Printer, Sparkles, QrCode, ExternalLink, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function PistasQrStandsPage() {
  const [currency, setCurrency] = useState<CurrencyMode>("USD");
  const [bcvRate] = useState<number>(DEFAULT_BCV_RATE);
  const [glowMode, setGlowMode] = useState<boolean>(false);
  const [qrImages, setQrImages] = useState<{ [lane: number]: string }>({});

  useEffect(() => {
    const generateAllQrs = async () => {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://pinzulia.com";
      const qrs: { [lane: number]: string } = {};

      for (const lane of PINZULIA_LANES) {
        const laneStr = lane.laneNumber < 10 ? `0${lane.laneNumber}` : `${lane.laneNumber}`;
        const url = `${baseUrl}/pista/${laneStr}`;
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 320,
            margin: 1.5,
            color: {
              dark: "#040814",
              light: "#ffffff",
            },
          });
          qrs[lane.laneNumber] = dataUrl;
        } catch {}
      }
      setQrImages(qrs);
    };

    generateAllQrs();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#040814] text-slate-100 selection:bg-sky-500 selection:text-white">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        bcvRate={bcvRate}
        glowMode={glowMode}
        onToggleGlow={() => setGlowMode(!glowMode)}
        cartCount={0}
        onOpenCart={() => {}}
        onOpenManager={() => {}}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Top Actions & Print Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 print:hidden">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la WebApp Principal</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic">
              Tarjetas & Stands QR para las 14 Pistas
            </h1>
            <p className="text-xs text-slate-400">
              Imprime o visualiza los códigos QR individuales para colocar sobre el soporte acrílico de cada mesa en el carril.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="btn-tactile inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold px-5 py-3 rounded-2xl shadow-xl shadow-sky-500/25 text-xs sm:text-sm cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Tarjetas de Mesa</span>
          </button>
        </div>

        {/* 14 QR Printable Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PINZULIA_LANES.map((lane) => {
            const laneStr = lane.laneNumber < 10 ? `0${lane.laneNumber}` : `${lane.laneNumber}`;
            const qrSrc = qrImages[lane.laneNumber];
            const isVip = lane.laneNumber >= 13;

            return (
              <div
                key={lane.id}
                className="bg-slate-950 rounded-3xl border-2 border-sky-500/30 p-5 flex flex-col items-center justify-between shadow-2xl text-center space-y-4 relative overflow-hidden group hover:border-sky-400 transition-all duration-200"
              >
                {/* Header Badge */}
                <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-1.5 font-mono font-black text-xs text-white">
                    <span>🎳 PINZULIA</span>
                    <span className="text-red-400">1963</span>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono ${
                      isVip
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    }`}
                  >
                    {isVip ? "Lounge VIP" : "Carril Standard"}
                  </span>
                </div>

                {/* Big Lane Number */}
                <div className="space-y-0.5">
                  <div className="text-4xl font-black text-white font-mono tracking-tight">
                    PISTA {laneStr}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    C.C. Internacional 5 de Julio
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-slate-900 w-48 h-48 flex items-center justify-center">
                  {qrSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrSrc}
                      alt={`QR Pista ${laneStr}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-16 h-16 text-slate-400 animate-pulse" />
                  )}
                </div>

                {/* Call to action text */}
                <div className="space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-white/5 w-full">
                  <div className="text-xs font-bold text-sky-300">
                    📱 Escanea con tu Cámara
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    • Conoce si la pista está libre u ocupada
                    <br />
                    • Pide comida y cócteles a esta mesa
                    <br />
                    • Activa tu reserva al llegar
                  </p>
                </div>

                {/* Direct Link button */}
                <div className="w-full print:hidden">
                  <Link
                    href={`/pista/${laneStr}`}
                    className="btn-tactile w-full py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-slate-200 hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-1.5"
                  >
                    <span>Abrir Demo Pista {laneStr}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}