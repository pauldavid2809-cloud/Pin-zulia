"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { BookingData } from "./BookingSection";
import { formatUSD, formatVES } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import { soundFX } from "@/lib/soundEffects";
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
  Printer,
  Sparkles,
  Send,
  ShieldCheck,
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
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booking) {
      const ticketUrl = `https://pin-zulia.vercel.app/ticket/${booking.bookingCode}`;
      QRCode.toDataURL(
        ticketUrl,
        {
          width: 360,
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
    }
  }, [booking]);

  if (!booking) return null;

  const handleCopyCode = () => {
    soundFX.playClick();
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  const formattedDate = booking.date;
  const shoesSummary = booking.shoeSizes && booking.shoeSizes.length > 0
    ? `${booking.shoeSizes.length} pares (${booking.shoeSizes.join(", ")})`
    : "Sin alquiler de calzado";

  const whatsappMessage = encodeURIComponent(
    `🎳 *¡Hola PinZulia Bowling!* Vengo a confirmar mi reservación.

` +
      `🎟️ *Pase Digital:* #${booking.bookingCode}
` +
      `👤 *Titular:* ${booking.clientName}
` +
      `📱 *WhatsApp:* ${booking.clientPhone}
` +
      `🎯 *Servicio:* ${booking.packageName}
` +
      `📅 *Fecha y Turno:* ${formattedDate} a las ${booking.time}
` +
      `👥 *Personas:* ${booking.playersCount} jugadores
` +
      `👟 *Calzado Sanitizado:* ${shoesSummary}
` +
      (booking.wantsBumpers ? `🛡️ *Bumpers:* Activados
` : "") +
      `💵 *Total Estimado:* $${booking.totalUSD.toFixed(2)} USD (ó ${(booking.totalUSD * bcvRate).toFixed(2)} Bs)

` +
      `📍 *Local:* C.C. Internacional, Av. 5 de Julio, Maracaibo.
` +
      `¿Me confirman la disponibilidad en recepción? ¡Muchas gracias!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in select-none">
      <div className="relative w-full max-w-lg my-6 bg-[#040814] rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/50 hover:bg-black text-slate-300 hover:text-white border border-white/20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* PRINTABLE TICKET CONTAINER */}
        <div ref={ticketRef} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Ticket Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0033CC] via-blue-700 to-[#ED1C24] p-4 sm:p-5 text-center text-white relative shadow-lg overflow-hidden border border-white/20">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Pase VIP Oficial Generado</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight uppercase font-sans">
              PinZulia <span className="text-amber-300">1963</span>
            </h2>
            <p className="text-[11px] text-sky-100 font-mono">
              Bowling Boutique & Gastropub • Maracaibo
            </p>
          </div>

          {/* QR Code and Code Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border-2 border-white/15 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-[#0033CC]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Reserva ${booking.bookingCode}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-900 font-mono text-xs">
                  Generando QR...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Localizador de Reserva
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-wider">
                  #{booking.bookingCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                  title="Copiar Código"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Reservation Breakdown Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 text-xs font-mono">
            {/* Client & Service */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-slate-400 block text-[10px]">Titular:</span>
                <span className="font-bold text-white text-sm">{booking.clientName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Servicio:</span>
                <span className="font-bold text-sky-400">{booking.packageName}</span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block">Fecha</span>
                  <span className="font-bold text-white">{booking.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ED1C24] shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block">Turno</span>
                  <span className="font-bold text-white">{booking.time}</span>
                </div>
              </div>
            </div>

            {/* Players & Shoes */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block">Jugadores</span>
                  <span className="font-bold text-white">{booking.playersCount} Personas</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block">Calzado</span>
                  <span className="font-bold text-white">
                    {booking.shoesCount > 0 ? `${booking.shoesCount} pares` : "Sin calzado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="flex items-center justify-between pt-1 text-sm font-black text-white">
              <span>Total Estimado:</span>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {formatUSD(booking.totalUSD)}
                </div>
                <span className="text-[10px] text-slate-400 font-normal block font-mono">
                  ≈ {formatVES(booking.totalUSD, bcvRate)}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2.5 pt-1">
            {/* WhatsApp Confirmation CTA */}
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="btn-tactile w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase italic tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 border-2 border-white/20 cursor-pointer"
            >
              <Send className="w-5 h-5 text-white" />
              <span>Confirmar Reserva por WhatsApp</span>
            </a>

            {/* Secondary Actions: Print/Download & Close */}
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="btn-tactile flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>Imprimir / Guardar</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onClose();
                }}
                className="btn-tactile flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold border border-white/10 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
