"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { formatUSD, formatVES } from "@/lib/utils";
import { DEFAULT_BCV_RATE } from "@/data/currencies";
import { useBcvRate } from "@/lib/useBcvRate";
import { SITE_CONFIG } from "@/lib/config";
import {
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Footprints,
  Phone,
  Share2,
  Printer,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface TicketPageProps {
  params: Promise<{ code: string }>;
}

export default function TicketCodePage({ params }: TicketPageProps) {
  const resolvedParams = use(params);
  const code = (resolvedParams.code || "PIN-501").toUpperCase();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const { rate: bcvRate } = useBcvRate();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Generate QR
    const currentUrl = typeof window !== "undefined" ? window.location.href : `https://pin-zulia.vercel.app/ticket/${code}`;
    QRCode.toDataURL(
      currentUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: "#0033CC",
          light: "#FFFFFF",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );

    // Look up booking in localStorage if available
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
        const found = stored.find((b: any) => b.bookingCode && b.bookingCode.toUpperCase() === code);
        if (found) {
          setBookingData(found);
        }
      } catch {}
    }
  }, [code]);

  const clientName = bookingData?.clientName || "Titular VIP";
  const clientPhone = bookingData?.clientPhone || "+58 412 1083997";
  const serviceName = bookingData?.packageName || "Pista de Bowling Brunswick™";
  const laneDisplay = bookingData?.laneNumber
    ? `Pista ${bookingData.laneNumber.toString().padStart(2, "0")} ${bookingData.laneNumber >= 13 ? "(VIP Lounge)" : "(Computarizada)"}`
    : (bookingData?.serviceType === "pool" ? "Mesa de Pool Diamond" : "Pista 07 (Asignación Auto)");
  const dateDisplay = bookingData?.date || new Date().toISOString().split("T")[0];
  const timeDisplay = bookingData?.time || "07:00 PM";
  const playersCount = bookingData?.playersCount || 4;
  const shoesSummary = bookingData?.shoeSizes && bookingData.shoeSizes.length > 0
    ? `${bookingData.shoeSizes.length} pares (${bookingData.shoeSizes.join(", ")})`
    : (bookingData?.shoesCount ? `${bookingData.shoesCount} pares` : "Sin calzado");
  const totalUSD = bookingData?.totalUSD || 25.0;
  const statusDisplay = bookingData?.status || "CONFIRMADA";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col justify-between p-4 sm:p-8 selection:bg-[#ED1C24] selection:text-white">
      {/* Top Bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pb-6 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Inicio PinZulia</span>
        </Link>
        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {statusDisplay === "CONFIRMADA" ? "Pase Confirmado" : "Pase Registrado"}
        </span>
      </div>

      {/* Ticket Card */}
      <div className="max-w-md mx-auto w-full bg-[#070f1e] rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0033CC] via-[#00289E] to-[#ED1C24] p-5 text-center text-white relative">
          <div className="text-2xl font-black italic tracking-wider font-sans">
            PIN<span className="text-sky-300">ZULIA</span> BOWLING
          </div>
          <p className="text-[11px] text-white/90 font-mono pt-0.5">
            C.C. Internacional · 5 de Julio, Maracaibo · Desde 1963
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Código de Localizador VIP
            </span>
            <div className="text-3xl font-black text-amber-300 font-mono tracking-widest">
              #{code}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl max-w-[220px] mx-auto shadow-xl border-2 border-[#0033CC]">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR ${code}`}
                className="w-44 h-44 rounded-lg object-contain"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                Cargando QR...
              </div>
            )}
            <span className="text-[9px] font-black text-[#0033CC] mt-1.5 uppercase tracking-wider font-mono">
              Escanear en Recepción
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs bg-slate-950/80 p-4 rounded-2xl border border-white/10 font-mono">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Titular:</span>
              <span className="font-bold text-white font-sans">{clientName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Pista / Mesa:</span>
              <span className="font-black text-sky-400">{laneDisplay}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Servicio:</span>
              <span className="font-bold text-white">{serviceName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Turno & Fecha:</span>
              <span className="font-bold text-amber-300">{dateDisplay} • {timeDisplay}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Jugadores & Zapatos:</span>
              <span className="text-slate-200">{playersCount} pax • {shoesSummary}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Total:</span>
              <div className="text-right">
                <span className="font-black text-emerald-400 text-sm">{formatUSD(totalUSD)}</span>
                <span className="text-[10px] text-slate-500 block">≈ {formatVES(totalUSD, bcvRate)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1 print:hidden font-sans">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                `🎳 *¡Hola PinZulia!* Tengo mi Pase Digital #${code} para ${laneDisplay} el ${dateDisplay} a las ${timeDisplay}. ¿Me confirman la recepción?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl text-xs uppercase italic tracking-wider shadow-lg shadow-emerald-600/30 transition-all border border-white/20"
            >
              <Phone className="w-4 h-4" />
              <span>Confirmar por WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="btn-tactile w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/10 transition-all cursor-pointer font-mono"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-md mx-auto w-full text-center text-[10px] text-slate-500 font-mono pt-6">
        PinZulia Bowling Boutique 1963 · Maracaibo, Venezuela.
      </div>
    </div>
  );
}
