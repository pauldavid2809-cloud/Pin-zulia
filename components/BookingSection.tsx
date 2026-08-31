"use client";

import React, { useState } from "react";
import {
  AVAILABLE_SHOE_SIZES,
  OFFICIAL_RATES,
} from "@/data/pinzuliaData";
import { CurrencyMode } from "@/data/currencies";
import { formatUSD, formatVES, generateBookingCode } from "@/lib/utils";
import { soundFX } from "@/lib/soundEffects";
import confetti from "canvas-confetti";
import { AutoPaymentModal } from "@/components/AutoPaymentModal";
import {
  Sparkles,
  Calendar,
  Clock,
  Users,
  Footprints,
  ShieldCheck,
  Zap,
  QrCode,
  Phone,
  User,
  Info,
} from "lucide-react";

export type BookingData = {
  bookingCode: string;
  packageId: string;
  packageName: string;
  serviceType: "bowling" | "pool" | "combo";
  laneNumber?: number;
  date: string;
  time: string;
  durationHours: number;
  playersCount: number;
  playerNames: string[];
  shoeSizes: string[];
  shoesCount: number;
  shoesTotalUSD: number;
  basePriceUSD: number;
  totalUSD: number;
  totalVES: number;
  clientName: string;
  clientPhone: string;
  notes: string;
  wantsBumpers: boolean;
  createdAt: string;
  status: "PENDIENTE" | "CONFIRMADA" | "EN_PISTA";
};

interface BookingSectionProps {
  currency: CurrencyMode;
  bcvRate: number;
  preselectedLane?: number | null;
  onBookingSuccess: (booking: BookingData) => void;
}

export function BookingSection({
  currency,
  bcvRate,
  preselectedLane,
  onBookingSuccess,
}: BookingSectionProps) {
  const [serviceType, setServiceType] = useState<"bowling" | "pool">("bowling");
  const [durationHours, setDurationHours] = useState<number>(1);
  const [selectedLane, setSelectedLane] = useState<number>(preselectedLane || 1);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [time, setTime] = useState<string>("07:00 PM");
  const [playersCount, setPlayersCount] = useState<number>(4);
  const [includeShoes, setIncludeShoes] = useState<boolean>(true);
  const [shoeSizes, setShoeSizes] = useState<string[]>(["40", "39", "41", "38"]);
  const [playerNames, setPlayerNames] = useState<string[]>(["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4"]);
  const [wantsBumpers, setWantsBumpers] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAutoPayment, setShowAutoPayment] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState<BookingData | null>(null);

  // Price Calculations
  const ratePerHour = serviceType === "bowling" ? OFFICIAL_RATES.bowlingHourUSD : OFFICIAL_RATES.poolHourUSD;
  const baseServiceUSD = ratePerHour * durationHours;
  const shoesCount = includeShoes ? playersCount : 0;
  const shoesTotalUSD = shoesCount * OFFICIAL_RATES.shoeRentalUSD;
  const totalUSD = baseServiceUSD + shoesTotalUSD;
  const totalVES = totalUSD * bcvRate;

  const handlePlayersChange = (newCount: number) => {
    setPlayersCount(newCount);
    const newSizes = [...shoeSizes];
    const newNames = [...playerNames];
    while (newSizes.length < newCount) {
      newSizes.push(AVAILABLE_SHOE_SIZES[3] || "40");
      newNames.push(`Jugador ${newSizes.length}`);
    }
    setShoeSizes(newSizes.slice(0, newCount));
    setPlayerNames(newNames.slice(0, newCount));
  };

  const handleShoeChange = (index: number, size: string) => {
    const updated = [...shoeSizes];
    updated[index] = size;
    setShoeSizes(updated);
  };

  const handleStartBooking = (payOnline: boolean) => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Por favor ingresa tu nombre y número de WhatsApp para emitir tu Pase Digital.");
      return;
    }

    soundFX.playPinStrike();

    const bookingCode = generateBookingCode();
    const packageName = serviceType === "bowling"
      ? `Pista de Bowling (${durationHours}h • ${playersCount} pers.)`
      : `Mesa de Pool Diamond (${durationHours}h • ${playersCount} pers.)`;

    const booking: BookingData = {
      bookingCode,
      packageId: `${serviceType}-${durationHours}h`,
      packageName,
      serviceType,
      laneNumber: serviceType === "bowling" ? selectedLane : undefined,
      date,
      time,
      durationHours,
      playersCount,
      playerNames: playerNames.slice(0, playersCount),
      shoeSizes: includeShoes ? shoeSizes.slice(0, playersCount) : [],
      shoesCount,
      shoesTotalUSD,
      basePriceUSD: baseServiceUSD,
      totalUSD,
      totalVES,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      notes: wantsBumpers ? `Bumpers solicitados. ${notes}` : notes,
      wantsBumpers,
      createdAt: new Date().toISOString(),
      status: "PENDIENTE",
    };

    if (payOnline) {
      setPendingBooking(booking);
      setShowAutoPayment(true);
    } else {
      finalizeBooking(booking);
    }
  };

  const handlePaymentApproved = (txId: string, bankRef: string) => {
    if (!pendingBooking) return;
    const confirmed: BookingData = {
      ...pendingBooking,
      status: "CONFIRMADA",
      notes: `${pendingBooking.notes || ""} [Pago Aprobado ByteBridge Ref: ${bankRef}]`.trim(),
    };
    setShowAutoPayment(false);
    finalizeBooking(confirmed);
  };

  const finalizeBooking = (booking: BookingData) => {
    soundFX.playStrikeFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    // Save to local storage cache for persistence
    try {
      const existing = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
      existing.unshift(booking);
      localStorage.setItem("pinzulia_bookings", JSON.stringify(existing.slice(0, 30)));
    } catch {}

    // Background automated dispatch via WhatsApp Bot (Parrandón Engine)
    const shoesText = includeShoes && shoeSizes.length > 0
      ? `${shoeSizes.length} pares (${shoeSizes.join(", ")})`
      : "Sin calzado";

    const autoMessage = `🎳 *PinZulia Bowling Boutique & Gastropub (1963)*\n\n` +
      `¡Hola * ${booking.clientName}*! Tu reservación ${booking.status === "CONFIRMADA" ? "ha sido PAGADA y CONFIRMADA" : "ha sido generada"} exitosamente.\n\n` +
      `🎟️ *Pase Digital:* #${booking.bookingCode}\n` +
      `🎯 *Servicio:* ${booking.packageName}\n` +
      `📅 *Fecha:* ${booking.date} a las ${booking.time}\n` +
      `👥 *Jugadores:* ${booking.playersCount} Personas\n` +
      `👟 *Calzado Sanitizado:* ${shoesText}\n` +
      (booking.wantsBumpers ? `🛡️ *Bumpers:* Activados para niños\n` : "") +
      `💵 *Total:` + (booking.status === "CONFIRMADA" ? " PAGADO" : " Estimado") + `:* $${booking.totalUSD.toFixed(2)} USD\n\n` +
      `👉 *Abre tu Pase VIP con Código QR aquí:*\nhttps://pin-zulia.vercel.app/ticket/${booking.bookingCode}\n\n` +
      `📍 *Ubicación:* C.C. Internacional, Av. 5 de Julio, Maracaibo.\n` +
      `_Presenta este boleto digital en la recepción para ingresar a tu pista._`;

    fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: booking.clientPhone,
        message: autoMessage,
      }),
    }).catch(() => {});

    onBookingSuccess(booking);
  };

  const timeSlots = [
    "02:00 PM (Sáb/Dom)",
    "03:30 PM",
    "05:00 PM (Apertura)",
    "06:30 PM",
    "08:00 PM (Prime Time)",
    "09:30 PM",
    "11:00 PM (Noche Glow)",
    "12:30 AM (Vie/Sáb)",
  ];

  return (
    <>
      <section id="reservar-qr" className="py-12 sm:py-20 bg-[#040814] relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0033CC]/10 rounded-full blur-[160px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Title */}
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ED1C24]/20 text-[#ED1C24] border border-[#ED1C24]/30 text-xs font-black uppercase tracking-wider font-mono">
              <QrCode className="w-3.5 h-3.5" />
              <span>RESERVA TU EXPERIENCIA BOUTIQUE ONLINE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight retro-3d-text-blue">
              ELIGE TU SERVICIO & PASE VIP
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Emite tu boleto digital con código QR al instante o paga con Pago Móvil automatizado (ByteBridge).
            </p>
          </div>

          {/* Main Card Container */}
          <div className="bg-[#070f1e]/95 border-2 border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            <form onSubmit={(e) => { e.preventDefault(); handleStartBooking(false); }} className="space-y-8">
              {/* STEP 1: SERVICE TYPE */}
              <div className="space-y-3">
                <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Selecciona el Servicio:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setServiceType("bowling");
                      if (playersCount > 5) setPlayersCount(5);
                    }}
                    className={`btn-tactile p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      serviceType === "bowling"
                        ? "bg-[#0033CC]/20 border-sky-400 shadow-lg shadow-sky-500/20"
                        : "bg-slate-900/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🎳</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0033CC] text-white text-[11px] font-black font-mono">
                        $25.00 / hora
                      </span>
                    </div>
                    <div className="text-base font-black text-white uppercase italic pt-2">
                      Pista de Bowling Brunswick™
                    </div>
                    <p className="text-xs text-slate-400 font-sans pt-1">
                      Capacidad hasta 5 jugadores por pista. Iluminación UV Glow Neón.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setServiceType("pool");
                      if (playersCount > 4) setPlayersCount(4);
                    }}
                    className={`btn-tactile p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      serviceType === "pool"
                        ? "bg-[#0033CC]/20 border-sky-400 shadow-lg shadow-sky-500/20"
                        : "bg-slate-900/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🎱</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ED1C24] text-white text-[11px] font-black font-mono">
                        $20.00 / hora
                      </span>
                    </div>
                    <div className="text-base font-black text-white uppercase italic pt-2">
                      Mesa de Pool Diamond
                    </div>
                    <p className="text-xs text-slate-400 font-sans pt-1">
                      Paño Simonis 860, bolas Aramith y servicio exclusivo de coctelería.
                    </p>
                  </button>
                </div>

                {/* Visual 14-Lanes Picker for Bowling */}
                {serviceType === "bowling" && (
                  <div className="pt-2 space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>Selecciona tu Pista Brunswick™ (1 a 14):</span>
                      </span>
                      <span className="text-[11px] font-mono text-sky-400 font-bold">
                        Pista {selectedLane.toString().padStart(2, "0")} Seleccionada {selectedLane >= 13 ? "🌟 VIP" : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 font-mono">
                      {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => {
                        const isSelected = selectedLane === num;
                        const isVip = num >= 13;

                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setSelectedLane(num);
                            }}
                            className={`btn-tactile py-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer border ${
                              isSelected
                                ? isVip
                                  ? "bg-gradient-to-b from-amber-500 to-yellow-600 text-black border-yellow-300 shadow-lg shadow-amber-500/30 scale-105"
                                  : "bg-[#0033CC] text-white border-sky-400 shadow-lg shadow-blue-600/30 scale-105"
                                : isVip
                                ? "bg-amber-950/40 text-amber-300 border-amber-500/30 hover:border-amber-400"
                                : "bg-slate-900 text-slate-300 border-white/10 hover:border-white/20 hover:text-white"
                            }`}
                            title={isVip ? `Pista ${num} (Lounge VIP Neón)` : `Pista ${num} (Brunswick Estándar)`}
                          >
                            <span>{num.toString().padStart(2, "0")}</span>
                            {isVip && <span className="text-[7px] font-sans font-bold uppercase tracking-tighter">VIP</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: DATE, TIME & DURATION */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Fecha, Turno Oficial & Duración:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#ED1C24]" />
                      <span>Fecha:</span>
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Turno de Apertura:</span>
                    </span>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
                    >
                      {timeSlots.map((ts) => (
                        <option key={ts} value={ts}>
                          {ts}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-sky-400" />
                      <span>Horas de Juego:</span>
                    </span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((hr) => (
                        <button
                          key={hr}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setDurationHours(hr);
                          }}
                          className={`btn-tactile flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            durationHours === hr
                              ? "bg-[#0033CC] text-white border-sky-400"
                              : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                          }`}
                        >
                          {hr}h
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: PLAYERS & SANITIZED SHOES */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Jugadores y Calzado Sanitizado ($2,5 c/u):</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-mono">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>Número de Jugadores:</span>
                    </span>
                    <div className="flex gap-2">
                      {Array.from({ length: serviceType === "bowling" ? 5 : 4 }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            handlePlayersChange(num);
                          }}
                          className={`btn-tactile flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            playersCount === num
                              ? "bg-[#0033CC] text-white border-sky-400"
                              : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {serviceType === "bowling" && (
                    <div className="space-y-1.5">
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-[#ED1C24]" />
                        <span>Alquiler de Calzado UV:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setIncludeShoes(!includeShoes);
                        }}
                        className={`btn-tactile w-full py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition-all ${
                          includeShoes
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-950 text-slate-400 border-white/10"
                        }`}
                      >
                        <span>{includeShoes ? "✓ Incluir Calzado para Todos" : "✗ Sin Alquiler de Calzado"}</span>
                        <span className="font-black">
                          {includeShoes ? `+$${shoesTotalUSD.toFixed(2)}` : "$0.00"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Shoe Sizes Selector */}
                {serviceType === "bowling" && includeShoes && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 bg-slate-950/60 p-3 rounded-2xl border border-white/10">
                    {Array.from({ length: playersCount }).map((_, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Jugador {idx + 1}
                        </span>
                        <select
                          value={shoeSizes[idx] || "40"}
                          onChange={(e) => handleShoeChange(idx, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-white/20 text-white font-mono text-xs focus:outline-none"
                        >
                          {AVAILABLE_SHOE_SIZES.map((sz) => (
                            <option key={sz} value={sz}>
                              Talla {sz}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bumpers option */}
                {serviceType === "bowling" && (
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wantsBumpers}
                      onChange={(e) => setWantsBumpers(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0033CC] focus:ring-0"
                    />
                    <span className="text-xs text-slate-300 font-sans">
                      Activar <strong>Bumpers automáticos</strong> (barandas para niños / principiantes sin costo adicional)
                    </span>
                  </label>
                )}
              </div>

              {/* STEP 4: CONTACT INFO */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Datos del Titular de la Reserva:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      <span>Nombre y Apellido:</span>
                    </span>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Carlos Mendoza"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Teléfono WhatsApp:</span>
                    </span>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ej: 0412 1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ESTIMATE TOTAL BREAKDOWN */}
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Estimado de la Experiencia
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{formatUSD(totalUSD)}</span>
                    <span className="text-xs text-emerald-400 font-bold">
                      ≈ {formatVES(totalUSD, bcvRate)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Tasa oficial BCV sincronizada automáticamente
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                  {/* Primary: Automated ByteBridge Payment */}
                  <button
                    type="button"
                    onClick={() => handleStartBooking(true)}
                    className="btn-tactile px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/40 border border-emerald-300/30 font-sans"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Pago Móvil Auto (ByteBridge)</span>
                  </button>

                  {/* Secondary: Instant Digital Pass */}
                  <button
                    type="button"
                    onClick={() => handleStartBooking(false)}
                    className="btn-tactile px-5 py-3 rounded-xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 border border-white/20 font-sans"
                  >
                    <QrCode className="w-4 h-4 text-amber-300" />
                    <span>Pase Digital QR</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ByteBridge Automated Payment Modal */}
      {showAutoPayment && pendingBooking && (
        <AutoPaymentModal
          isOpen={showAutoPayment}
          onClose={() => setShowAutoPayment(false)}
          amountUSD={pendingBooking.totalUSD}
          bcvRate={bcvRate}
          referenceCode={pendingBooking.bookingCode}
          onPaymentApproved={handlePaymentApproved}
        />
      )}
    </>
  );
}
