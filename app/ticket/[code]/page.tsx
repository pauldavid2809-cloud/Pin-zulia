"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { formatUSD, formatVES } from "@/lib/utils";
import { DEFAULT_BCV_RATE } from "@/data/currencies";
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
} from "lucide-react";

interface TicketPageProps {
  params: Promise<{ code: string }>;
}

export default function TicketCodePage({ params }: TicketPageProps) {
  const resolvedParams = use(params);
  const code = (resolvedParams.code || "PIN-501").toUpperCase();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    QRCode.toDataURL(
      currentUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: "#0284C7",
          light: "#FFFFFF",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [code]);

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Inicio PinZulia</span>
        </Link>
        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Pase Válido
        </span>
      </div>

      {/* Ticket Card */}
      <div className="max-w-md mx-auto w-full bg-slate-900 rounded-3xl border-2 border-sky-500/40 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-red-600 p-5 text-center text-white">
          <div className="text-2xl font-black italic tracking-wider">
            PIN<span className="text-sky-200">ZULIA</span> BOWLING
          </div>
          <p className="text-xs text-white/90">
            C.C. Internacional · 5 de Julio, Maracaibo
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Código de Pase VIP
            </span>
            <div className="text-3xl font-black text-sky-400 font-mono tracking-widest">
              #{code}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl max-w-[220px] mx-auto shadow-inner">
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
            <span className="text-[9px] font-black text-slate-600 mt-1 uppercase tracking-wider">
              Validar en Recepción
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs bg-slate-950/80 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Pista Asignada:</span>
              <span className="font-extrabold text-sky-300">Pista 07 (Carril Computarizado)</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Paquete:</span>
              <span className="font-medium text-white">1 Hora de Bowling (hasta 6 pax)</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Calzado Sanitizado:</span>
              <span className="font-medium text-emerald-400">✓ 5 pares incluidos</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Ubicación:</span>
              <span className="font-medium text-slate-300">Av. 5 de Julio esq. Av. 13</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Estado de Pago:</span>
              <span className="font-mono font-bold text-emerald-400">Confirmado</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=Hola%20PinZulia%20tengo%20el%20pase%20%23${code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Contactar a Recepción por WhatsApp</span>
            </a>

            <a
              href={SITE_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs border border-white/10"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Cómo Llegar (Google Maps)</span>
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 pt-6">
        © {new Date().getFullYear()} PinZulia Bowling Boutique & Gastropub.
      </div>
    </div>
  );
}