"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  OFFICIAL_RATES,
  AVAILABLE_SHOE_SIZES,
  PINZULIA_LANES,
} from "@/data/pinzuliaData";
import { formatUSD, formatVES } from "@/lib/utils";
import { soundFX } from "@/lib/soundEffects";
import {
  Calendar,
  Clock,
  Users,
  Footprints,
  Sparkles,
  ShieldAlert,
  Zap,
  Phone,
  User,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { AutoPaymentModal } from "@/components/AutoPaymentModal";

export type BookingData = {
  bookingCode: string;
  packageId: string;
  packageName: string;
  serviceType: "bowling" | "pool";
  laneNumber?: number;
  date: string;
  time: string;
  durationHours: number;
  playersCount: number;
  playerNames: string[];
  shoeSizes: string[];
  shoesCount: number;
  shoesTotalUSD: number;
  wantsBumpers?: boolean;
  basePriceUSD: number;
  totalUSD: number;
  clientName: string;
  clientPhone: string;
  notes?: string;
  status: "PENDIENTE" | "CONFIRMADA" | "EN_PISTA";
};

interface BookingSectionProps {
  bcvRate: number;
  onBookingSuccess: (booking: BookingData) => void;
  preselectedPackageId?: string;
  preselectedLane?: number;
}

export function BookingSection({
  bcvRate,
  onBookingSuccess,
  preselectedPackageId,
  preselectedLane,
}: BookingSectionProps) {
  const [serviceType, setServiceType] = useState<"bowling" | "pool">(
    preselectedPackageId?.includes("pool") ? "pool" : "bowling"
  );
  const [selectedLane, setSelectedLane] = useState<number>(preselectedLane || 1);
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [time, setTime] = useState<string>("08:00 PM (Prime Time)");
  const [durationHours, setDurationHours] = useState<number>(1);
  const [playersCount, setPlayersCount] = useState<number>(4);
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Jugador 1",
    "Jugador 2",
    "Jugador 3",
    "Jugador 4",
  ]);
  const [includeShoes, setIncludeShoes] = useState<boolean>(true);
  const [shoeSizes, setShoeSizes] = useState<string[]>([
    "39 EU (6.5 US M / 8.0 US W)",
    "40 EU (7.5 US M)",
    "41 EU (8.5 US M)",
    "42 EU (9.5 US M)",
  ]);
  const [wantsBumpers, setWantsBumpers] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAutoPayment, setShowAutoPayment] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState<BookingData | null>(null);

  // Real-time occupied lanes for selected date & time
  const [occupiedLanes, setOccupiedLanes] = useState<number[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);

  // Fetch slot availability whenever date or time changes
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const res = await fetch(`/api/v1/bookings/availability?date=${date}&time=${encodeURIComponent(time)}`);
        const data = await res.json();
        if (data.allUnavailableLanes) {
          setOccupiedLanes(data.allUnavailableLanes);

          // If the currently selected lane is occupied, switch to the first free lane
          if (data.allUnavailableLanes.includes(selectedLane)) {
            const firstFree = Array.from({ length: 14 }, (_, i) => i + 1).find(
              (n) => !data.allUnavailableLanes.includes(n)
            );
            if (firstFree) setSelectedLane(firstFree);
          }
        }
      } catch {}
      setIsLoadingAvailability(false);
    };

    fetchAvailability();
  }, [date, time]);

  // Price Calculations
  const ratePerHour = serviceType === "bowling" ? OFFICIAL_RATES.bowlingHourUSD : OFFICIAL_RATES.poolHourUSD;
  const baseServiceUSD = ratePerHour * durationHours;
  const shoesCount = includeShoes && serviceType === "bowling" ? playersCount : 0;
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

  const generateBookingCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `PIN-${randomDigits}`;
  };

  const handleStartPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Por favor ingresa tu nombre y número de WhatsApp para confirmar tu reserva.");
      return;
    }

    if (serviceType === "bowling" && occupiedLanes.includes(selectedLane)) {
      alert(`La Pista ${selectedLane} ya se encuentra ocupada para ese turno. Por favor selecciona otra pista disponible.`);
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
      shoeSizes: includeShoes && serviceType === "bowling" ? shoeSizes.slice(0, playersCount) : [],
      shoesCount,
      shoesTotalUSD,
      wantsBumpers: serviceType === "bowling" ? wantsBumpers : false,
      basePriceUSD: baseServiceUSD,
      totalUSD,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      notes: notes.trim(),
      status: "PENDIENTE",
    };

    // Register 10-minute hold in API
    try {
      await fetch("/api/v1/bookings/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          laneNumber: selectedLane,
          bookingCode,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          status: "HOLD",
          serviceType,
          totalUSD,
        }),
      });
      // Add to local occupied list
      setOccupiedLanes((prev) => Array.from(new Set([...prev, selectedLane])));
    } catch {}

    setPendingBooking(booking);
    setShowAutoPayment(true);
  };

  const handlePaymentApproved = async (txId: string, bankRef: string) => {
    if (!pendingBooking) return;
    const confirmed: BookingData = {
      ...pendingBooking,
      status: "CONFIRMADA",
      notes: `${pendingBooking.notes || ""} [Pago Aprobado ByteBridge Ref: ${bankRef}]`.trim(),
    };

    // Confirm booking in API
    try {
      await fetch("/api/v1/bookings/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: confirmed.date,
          time: confirmed.time,
          laneNumber: confirmed.laneNumber,
          bookingCode: confirmed.bookingCode,
          clientName: confirmed.clientName,
          clientPhone: confirmed.clientPhone,
          status: "CONFIRMADA",
          serviceType: confirmed.serviceType,
          totalUSD: confirmed.totalUSD,
        }),
      });
    } catch {}

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

    // Save to local storage cache
    try {
      const existing = JSON.parse(localStorage.getItem("pinzulia_bookings") || "[]");
      existing.unshift(booking);
      localStorage.setItem("pinzulia_bookings", JSON.stringify(existing.slice(0, 30)));
    } catch {}

    // Background automated dispatch via WhatsApp Bot
    const shoesText = includeShoes && shoeSizes.length > 0
      ? `${shoeSizes.length} pares (${shoeSizes.join(", ")})`
      : "Sin calzado";

    const laneText = booking.laneNumber
      ? `Pista ${booking.laneNumber.toString().padStart(2, "0")} ${booking.laneNumber >= 13 ? "(Lounge VIP)" : "(Brunswick Computarizada)"}`
      : "Mesa de Pool Diamond";

    const autoMessage = `🎳 *PinZulia Bowling Boutique & Gastropub (1963)*\n\n` +
      `¡Hola * ${booking.clientName}*! Tu reservación para *${laneText}* ha sido *PAGADA y CONFIRMADA* exitosamente.\n\n` +
      `🎟️ *Pase Digital:* #${booking.bookingCode}\n` +
      `🎯 *Servicio:* ${booking.packageName}\n` +
      `📅 *Fecha:* ${booking.date} a las ${booking.time}\n` +
      `👥 *Jugadores:* ${booking.playersCount} Personas\n` +
      `👟 *Calzado Sanitizado:* ${shoesText}\n` +
      (booking.wantsBumpers ? `🛡️ *Bumpers:* Activados para niños\n` : "") +
      `💵 *Total Pagado:* $${booking.totalUSD.toFixed(2)} USD\n\n` +
      `👉 *Abre tu Pase VIP con Código QR aquí:*\nhttps://pin-zulia.vercel.app/ticket/${booking.bookingCode}\n\n` +
      `📍 *Ubicación:* C.C. Internacional, Av. 5 de Julio, Maracaibo.\n` +
      `_Presenta este boleto digital en la recepción para ingresar directo a tu pista._`;

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
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight retro-3d-text-blue font-sans">
              ELIGE TU SERVICIO & PASE VIP
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Selecciona tu pista en vivo, confirma tu horario y paga con Pago Móvil automatizado en menos de 3 segundos.
            </p>
          </div>

          {/* Main Card Container */}
          <div className="bg-[#070f1e]/95 border-2 border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleStartPayment} className="space-y-8">
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

                {/* 14-Lanes Availability Grid for Bowling */}
                {serviceType === "bowling" && (
                  <div className="pt-2 space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>Disponibilidad en Vivo de las 14 Pistas:</span>
                      </span>
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Libre</span>
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span>Ocupada</span>
                        </span>
                        <span className="flex items-center gap-1 text-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span>Lounge VIP (13-14)</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 font-mono">
                      {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => {
                        const isOccupied = occupiedLanes.includes(num);
                        const isSelected = selectedLane === num;
                        const isVip = num >= 13;

                        return (
                          <button
                            key={num}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => {
                              if (!isOccupied) {
                                soundFX.playClick();
                                setSelectedLane(num);
                              }
                            }}
                            className={`btn-tactile py-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border relative ${
                              isOccupied
                                ? "bg-red-950/40 text-red-400/60 border-red-500/20 cursor-not-allowed opacity-50"
                                : isSelected
                                ? isVip
                                  ? "bg-gradient-to-b from-amber-500 to-yellow-600 text-black border-yellow-300 shadow-lg shadow-amber-500/30 scale-105"
                                  : "bg-[#0033CC] text-white border-sky-400 shadow-lg shadow-blue-600/30 scale-105"
                                : isVip
                                ? "bg-amber-950/40 text-amber-300 border-amber-500/30 hover:border-amber-400 cursor-pointer"
                                : "bg-slate-900 text-slate-300 border-white/10 hover:border-white/20 hover:text-white cursor-pointer"
                            }`}
                            title={
                              isOccupied
                                ? `Pista ${num} (Ocupada en este turno)`
                                : isVip
                                ? `Pista ${num} (Lounge VIP Neón Disponible)`
                                : `Pista ${num} (Brunswick Disponible)`
                            }
                          >
                            {isOccupied && <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-red-400" />}
                            <span>{num.toString().padStart(2, "0")}</span>
                            {isVip && !isOccupied && (
                              <span className="text-[7px] font-sans font-bold uppercase tracking-tighter">VIP</span>
                            )}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>Fecha de la Reserva:</span>
                    </span>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Turno Oficial:</span>
                    </span>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-400"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Horas de Juego:</span>
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setDurationHours(hrs);
                          }}
                          className={`btn-tactile py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                            durationHours === hrs
                              ? "bg-[#0033CC] text-white border-sky-400 shadow-md shadow-blue-600/30"
                              : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                          }`}
                        >
                          {hrs} {hrs === 1 ? "Hora" : "Horas"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: PLAYERS & SHOE SIZES */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0033CC] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Jugadores & Calzado Sanitizado:</span>
                  </label>

                  <span className="text-xs font-mono text-slate-400">
                    {serviceType === "bowling" ? "Máx 5 por pista" : "Máx 4 por mesa"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300 font-mono flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      <span>Número de Jugadores en tu Grupo:</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5]
                        .filter((n) => (serviceType === "pool" ? n <= 4 : true))
                        .map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              handlePlayersChange(num);
                            }}
                            className={`btn-tactile w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition-all border cursor-pointer ${
                              playersCount === num
                                ? "bg-[#0033CC] text-white border-sky-400 shadow-md"
                                : "bg-slate-900 text-slate-400 border-white/10 hover:text-white"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Shoe Rental Toggle for Bowling */}
                  {serviceType === "bowling" && (
                    <div className="p-3 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Footprints className="w-4 h-4 text-amber-300" />
                        <div>
                          <div className="text-xs font-bold text-white">
                            Alquiler de Calzado Sanitizado UV ($2.50 c/u)
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Requerido para el cuidado del carril de madera
                          </span>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeShoes}
                          onChange={(e) => setIncludeShoes(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Dynamic Shoe Sizes Selectors */}
                {serviceType === "bowling" && includeShoes && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {Array.from({ length: playersCount }).map((_, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-white/10 space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 block">
                          Talla Jugador {idx + 1}:
                        </span>
                        <select
                          value={shoeSizes[idx] || AVAILABLE_SHOE_SIZES[3]}
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

              {/* ESTIMATE TOTAL BREAKDOWN & SINGLE CHECKOUT ACTION */}
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Oficial de la Experiencia
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

                {/* SINGLE PRIMARY CHECKOUT BUTTON */}
                <button
                  type="submit"
                  className="btn-tactile w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase italic tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-emerald-950/50 border border-emerald-300/40 font-sans"
                >
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>Pagar Reserva con Pago Móvil Auto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* BYTEBRIDGE AUTOMATED PAYMENT MODAL */}
      {showAutoPayment && pendingBooking && (
        <AutoPaymentModal
          isOpen={showAutoPayment}
          onClose={() => setShowAutoPayment(false)}
          amountUSD={pendingBooking.totalUSD}
          referenceCode={pendingBooking.bookingCode}
          bcvRate={bcvRate}
          onPaymentApproved={handlePaymentApproved}
        />
      )}
    </>
  );
}
