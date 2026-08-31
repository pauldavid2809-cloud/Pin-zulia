"use client";

import React, { useState } from "react";
import {
  BOOKING_PACKAGES,
  BookingPackage,
  PINZULIA_LANES,
  AVAILABLE_SHOE_SIZES,
  OFFICIAL_RATES,
} from "@/data/pinzuliaData";
import { CurrencyMode } from "@/data/currencies";
import { formatUSD, formatVES, generateBookingCode } from "@/lib/utils";
import { soundFX } from "@/lib/soundEffects";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Check,
  Calendar,
  Clock,
  Users,
  Footprints,
  ChevronRight,
  ShieldCheck,
  Zap,
  Flame,
  QrCode,
  Lock,
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
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Jugador 1",
    "Jugador 2",
    "Jugador 3",
    "Jugador 4",
  ]);
  const [shoeSizes, setShoeSizes] = useState<string[]>([
    "41 EU (8.5 US M)",
    "38 EU (7.5 US)",
    "42 EU (9.5 US M)",
    "37 EU (6.5 US)",
  ]);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [wantsBumpers, setWantsBumpers] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pricing calculations
  const hourlyRateUSD = serviceType === "bowling" ? OFFICIAL_RATES.bowlingHourUSD : OFFICIAL_RATES.poolHourUSD;
  const baseServiceUSD = hourlyRateUSD * durationHours;
  const shoePricePerPairUSD = OFFICIAL_RATES.shoeRentalUSD;
  const shoesCount = (serviceType === "bowling" && includeShoes) ? playersCount : 0;
  const shoesTotalUSD = shoesCount * shoePricePerPairUSD;
  const totalUSD = baseServiceUSD + shoesTotalUSD;
  const totalVES = totalUSD * bcvRate;

  const handlePlayersCountChange = (count: number) => {
    soundFX.playClick();
    setPlayersCount(count);
    const newNames = [...playerNames];
    const newSizes = [...shoeSizes];
    while (newNames.length < count) {
      newNames.push(`Jugador ${newNames.length + 1}`);
      newSizes.push("40 EU (7.5 US M)");
    }
    setPlayerNames(newNames.slice(0, count));
    setShoeSizes(newSizes.slice(0, count));
  };

  const handleShoeChange = (index: number, size: string) => {
    const updated = [...shoeSizes];
    updated[index] = size;
    setShoeSizes(updated);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const handleGenerateBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Por favor ingresa tu nombre y número de WhatsApp para emitir tu Pase Digital.");
      return;
    }

    soundFX.playPinStrike();
    soundFX.playStrikeFanfare();
    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

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
      status: "PENDING" as any,
    };

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
      `¡Hola * ${booking.clientName}*! Tu reservación ha sido generada exitosamente.\n\n` +
      `🎟️ *Pase Digital:* #${booking.bookingCode}\n` +
      `🎯 *Servicio:* ${booking.packageName}\n` +
      `📅 *Fecha:* ${booking.date} a las ${booking.time}\n` +
      `👥 *Jugadores:* ${booking.playersCount} Personas\n` +
      `👟 *Calzado Sanitizado:* ${shoesText}\n` +
      (booking.wantsBumpers ? `🛡️ *Bumpers:* Activados para niños\n` : "") +
      `💵 *Total Estimado:* ${booking.totalUSD.toFixed(2)} USD\n\n` +
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

    setTimeout(() => {
      setIsSubmitting(false);
      onBookingSuccess(booking);
    }, 400);
  };

  // Official Schedule Time Slots
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
    <section id="reservar-qr" className="py-12 sm:py-20 bg-[#040814] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0033CC]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Badge */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#ED1C24] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>Reservación Oficial por QR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic retro-3d-text-blue leading-tight">
            Reserva tu Pista o Mesa
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Completa tus datos, selecciona tus tallas de calzado y genera tu <strong>Ticket VIP con Código QR</strong> en 10 segundos.
          </p>
        </div>

        {/* Booking Form Card */}
        <div className="bg-[#070f1e]/90 border-2 border-white/20 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleGenerateBooking} className="space-y-8">
            {/* STEP 1: SERVICE TYPE SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Selecciona tu Servicio:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bowling Option */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setServiceType("bowling");
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    serviceType === "bowling"
                      ? "bg-[#0033CC] border-white text-white shadow-xl shadow-[#0033CC]/40 scale-[1.01]"
                      : "bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-xl font-black uppercase italic tracking-tight font-sans">
                      🎳 Pista de Bowling
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-black/40 text-amber-300 font-mono font-black text-sm">
                      $25 / hora
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    Carril computarizado Brunswick™ para hasta 5 personas. Incluye marcadores en vivo.
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-sky-200">
                    <span>• Hasta 5 jugadores</span>
                    <span>• Calzado $2,5 c/u</span>
                  </div>
                </button>

                {/* Pool Table Option */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setServiceType("pool");
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    serviceType === "pool"
                      ? "bg-[#0033CC] border-white text-white shadow-xl shadow-[#0033CC]/40 scale-[1.01]"
                      : "bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-xl font-black uppercase italic tracking-tight font-sans">
                      🎱 Mesa de Pool Diamond
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-black/40 text-emerald-300 font-mono font-black text-sm">
                      $20 / hora
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    Paño Simonis 860 Tournament Edition con tacos y bolas oficiales Aramith.
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-sky-200">
                    <span>• Hasta 4 jugadores</span>
                    <span>• No requiere calzado</span>
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 2: DATE, TIME & DURATION */}
            <div className="space-y-3">
              <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">2</span>
                <span>Fecha, Horario y Duración:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Fecha:</span>
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-[#ED1C24]"
                    required
                  />
                </div>

                {/* Time Slot */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#ED1C24]" />
                    <span>Turno / Hora:</span>
                  </span>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-[#ED1C24]"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Duración:</span>
                  </span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setDurationHours(h);
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                          durationHours === h
                            ? "bg-[#ED1C24] text-white border-2 border-white shadow-md"
                            : "bg-slate-950 text-slate-400 border border-white/10 hover:text-white"
                        }`}
                      >
                        {h} {h === 1 ? "Hora" : "Horas"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: PLAYERS & SANITIZED SHOE SIZES */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Jugadores & Calzado Sanitizado ($2,5 c/u):</span>
                </label>

                {/* Players Count Pills */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
                  {(serviceType === "bowling" ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handlePlayersCountChange(count)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        playersCount === count
                          ? "bg-[#0033CC] text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {count} {count === 1 ? "Jugador" : "Jugadores"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shoe Toggle for Bowling */}
              {serviceType === "bowling" && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-200 font-sans">
                      Incluir alquiler de zapatos sanitizados UV ($2,5 por jugador)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeShoes}
                    onChange={(e) => setIncludeShoes(e.target.checked)}
                    className="w-4 h-4 accent-[#ED1C24] cursor-pointer"
                  />
                </div>
              )}

              {/* Dynamic Player Names & Sizes Grid */}
              {serviceType === "bowling" && includeShoes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {playerNames.slice(0, playersCount).map((pName, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-[#0033CC] text-white flex items-center justify-center text-xs font-mono font-black shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={pName}
                          onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                          placeholder={`Jugador ${idx + 1}`}
                          className="w-full bg-transparent text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>

                      <select
                        value={shoeSizes[idx] || AVAILABLE_SHOE_SIZES[3]}
                        onChange={(e) => handleShoeChange(idx, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/20 text-[11px] font-mono text-sky-200 focus:outline-none"
                      >
                        {AVAILABLE_SHOE_SIZES.map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Bumpers Option */}
              {serviceType === "bowling" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="bumpers-chk"
                    checked={wantsBumpers}
                    onChange={(e) => setWantsBumpers(e.target.checked)}
                    className="w-4 h-4 accent-[#0033CC] cursor-pointer"
                  />
                  <label htmlFor="bumpers-chk" className="text-xs text-slate-300 font-sans cursor-pointer">
                    Activar <strong>Bumpers automáticos</strong> (barandas para niños / principiantes sin costo adicional)
                  </label>
                </div>
              )}
            </div>

            {/* STEP 4: CUSTOMER CONTACT DETAILS */}
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#ED1C24]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#ED1C24]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SUMMARY & SUBMIT BUTTON */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border-2 border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
              <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Total Estimado de la Experiencia
                </span>
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    {formatUSD(totalUSD)}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    ≈ {formatVES(totalUSD, bcvRate)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Tasa oficial BCV en vivo • Pago al llegar o vía WhatsApp
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-tactile w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-sm sm:text-base uppercase italic tracking-wider cursor-pointer shadow-xl shadow-red-600/30 border-2 border-white flex items-center justify-center gap-2 group shrink-0"
              >
                <QrCode className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>{isSubmitting ? "Generando Ticket..." : "Generar Reserva & Ticket QR"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
