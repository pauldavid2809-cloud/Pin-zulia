"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { BookingData } from "./BookingSection";
import { formatUSD, formatVES } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Footprints,
  Download,
  Share2,
  Phone,
  Copy,
  Check,
} from "lucide-react";

interface QrTicketModalProps {
  booking: BookingData | null;
  onClose: () => void;
  bcvRate: number;
}

export function QrTicketModal({
  booking,
  onClose,
  bcvRate,
}: QrTicketModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (booking) {
      const ticketUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/ticket/${booking.bookingCode}`;
      QRCode.toDataURL(
        ticketUrl,
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
    }
  }, [booking]);

  if (!booking) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `🎳 *¡Hola PinZulia Bowling!* Vengo a confirmar mi reservación de pista.\n\n` +
      `🎟️ *Código de Pase:* #${booking.bookingCode}\n` +
      `👤 *Cliente:* ${booking.clientName}\n` +
      `🎳 *Pista:* Pista ${booking.laneNumber < 10 ? "0" + booking.laneNumber : booking.laneNumber}\n` +
      `📦 *Paquete:* ${booking.packageName}\n` +
      `📅 *Fecha y Hora:* ${booking.date} a las ${booking.time}\n` +
      `👥 *Jugadores:* ${booking.playersCount} personas\n` +
      `👟 *Calzado:* ${booking.shoeSizes.join(", ")}\n` +
      `💵 *Monto:* $${booking.totalUSD} USD (o ${(booking.totalUSD * bcvRate).toFixed(2)} Bs)\n\n` +
      `📍 *Ubicación:* C.C. Internacional, 5 de Julio, Maracaibo.\n` +
      `¿Me confirman la recepción? ¡Gracias!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-md my-8 bg-gradient-to-b from-slate-900 via-[#070f1e] to-[#040810] rounded-3xl border-2 border-sky-500/40 shadow-2xl shadow-sky-500/20 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ticket Top Notch Header */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-red-600 p-4 text-center text-white relative">
          <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            Pase VIP Emitido con Éxito
          </div>
          <h2 className="text-xl font-black italic tracking-wide">
            PIN<span className="text-sky-200">ZULIA</span> BOWLING
          </h2>
          <p className="text-[11px] text-white/80">
            C.C. Internacional · Av. 5 de Julio, Maracaibo
          </p>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* Booking Code Callout */}
          <div className="flex items-center justify-between bg-slate-950/80 p-3.5 rounded-2xl border border-sky-500/30">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Código de Reservación
              </span>
              <div className="text-2xl font-black text-sky-400 font-mono tracking-widest">
                #{booking.bookingCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 border border-white/10"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner max-w-[240px] mx-auto">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR ${booking.bookingCode}`}
                className="w-48 h-48 rounded-lg object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                Generando QR...
              </div>
            )}
            <span className="text-[10px] font-extrabold text-slate-600 mt-1 uppercase tracking-wider">
              Escanear en Recepción PinZulia
            </span>
          </div>

          {/* Ticket Information Table */}
          <div className="space-y-2.5 text-xs bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Titular del Pase:</span>
              <span className="font-bold text-white">{booking.clientName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Pista Asignada:</span>
              <span className="font-extrabold text-sky-400">
                Pista {booking.laneNumber < 10 ? `0${booking.laneNumber}` : booking.laneNumber}{" "}
                {booking.laneNumber >= 13 ? "(VIP Lounge)" : ""}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Paquete:</span>
              <span className="font-medium text-white">{booking.packageName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Fecha y Hora:</span>
              <span className="font-bold text-amber-300">
                {booking.date} · {booking.time}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Jugadores ({booking.playersCount}):</span>
              <span className="text-slate-300 font-medium text-right truncate max-w-[180px]">
                {booking.playerNames.join(", ")}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Total a Liquidar:</span>
              <span className="font-black text-sky-400 font-mono text-sm">
                {formatUSD(booking.totalUSD)} / {formatVES(booking.totalUSD, bcvRate)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <Phone className="w-4 h-4" />
              <span>Confirmar Pase por WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
            >
              Cerrar y Volver a la WebApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
