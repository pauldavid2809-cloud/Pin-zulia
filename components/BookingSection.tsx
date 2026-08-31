"use client";

import React, { useState } from "react";
import {
  BOOKING_PACKAGES,
  BookingPackage,
  PINZULIA_LANES,
  AVAILABLE_SHOE_SIZES,
} from "@/data/pinzuliaData";
import { CurrencyMode } from "@/data/currencies";
import { formatUSD, formatVES, generateBookingCode } from "@/lib/utils";
import { soundFX } from "@/lib/soundEffects";
import { AutoPaymentModal } from "./AutoPaymentModal";
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
} from "lucide-react";

export type BookingData = {
  bookingCode: string;
  packageId: string;
  packageName: string;
  laneNumber: number;
  date: string;
  time: string;
  playersCount: number;
  playerNames: string[];
  shoeSizes: string[];
  clientName: string;
  clientPhone: string;
  notes: string;
  totalUSD: number;
  totalVES: number;
  createdAt: string;
  isPaid?: boolean;
  bankReference?: string;
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
  const [selectedPackage, setSelectedPackage] = useState<BookingPackage>(
    BOOKING_PACKAGES[0]
  );
  const [selectedLane, setSelectedLane] = useState<number>(
    preselectedLane || 1
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState<string>("07:00 PM");
  const [playersCount, setPlayersCount] = useState<number>(4);
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
  const [isAutoPayOpen, setIsAutoPayOpen] = useState<boolean>(false);
  const [pendingBookingCode, setPendingBookingCode] = useState<string>("");

  const handlePlayersCountChange = (count: number) => {
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

  const createBookingObject = (isPaid: boolean = false, bankRef: string = ""): BookingData => {
    const bookingCode = pendingBookingCode || generateBookingCode();
    const totalUSD = selectedPackage.priceUSD;
    const totalVES = totalUSD * bcvRate;

    return {
      bookingCode,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      laneNumber: selectedLane,
      date,
      time,
      playersCount,
      playerNames,
      shoeSizes,
      clientName,
      clientPhone,
      notes: wantsBumpers ? `Bumpers solicitados. ${notes}` : notes,
      totalUSD,
      totalVES,
      createdAt: new Date().toISOString(),
      isPaid,
      bankReference: bankRef,
    };
  };

  const handleStartAutoPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert("Por favor ingresa tu nombre y número de teléfono WhatsApp");
      return;
    }
    soundFX.playClick();
    const code = generateBookingCode();
    setPendingBookingCode(code);
    setIsAutoPayOpen(true);
  };

  const handleAutoPaySuccess = (txId: string, ref: string) => {
    setIsAutoPayOpen(false);
    const booking = createBookingObject(true, ref);
    onBookingSuccess(booking);
  };

  const handleManualSubmit = () => {
    if (!clientName || !clientPhone) {
      alert("Por favor ingresa tu nombre y número de teléfono WhatsApp");
      return;
    }
    soundFX.playClick();
    const booking = createBookingObject(false);
    onBookingSuccess(booking);
  };

  // Synchronized with Official PinZulia Schedule:
  // L-J: 5pm-11pm, Vie: 5pm-2am, Sáb: 2pm-2am, Dom: 2pm-11pm
  const timeSlots = [
    "02:00 PM (Sáb / Dom)",
    "03:30 PM (Sáb / Dom)",
    "05:00 PM (Apertura)",
    "06:30 PM",
    "08:00 PM (Prime Time)",
    "09:30 PM",
    "11:00 PM (Noche Glow)",
    "12:30 AM (Vie / Sáb)",
  ];

  return (
    <section id="reservas" className="py-16 sm:py-20 bg-[#040814] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0033CC] text-white text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pase VIP Digital Instantáneo</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic retro-3d-text-blue">
            Reserva tu Pista & Paquetes
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Asegura tu carril preferido, asigna el calzado de tu grupo y paga con verificación automática en 3 segundos.
          </p>
        </div>

        {/* Step 1: Package Selector Cards with Two-Tone Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {BOOKING_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage.id === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedPackage(pkg);
                }}
                className={`btn-tactile cursor-pointer rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 border-2 flex flex-col justify-between select-none ${
                  isSelected
                    ? "border-[#ED1C24] ring-4 ring-[#ED1C24]/30 scale-[1.02]"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {/* Two-Tone Top Header: Crisp White */}
                <div className="p-3.5 bg-white border-b-2 border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-[#0033CC] text-base uppercase italic leading-none">
                      {pkg.name}
                    </h3>
                    {pkg.badge && (
                      <span className="inline-block mt-1 bg-[#ED1C24] text-white font-black text-[8px] uppercase px-2 py-0.5 rounded-full font-mono">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-[#0033CC] bg-[#0033CC] text-white"
                        : "border-slate-400 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                  </div>
                </div>

                {/* Two-Tone Bottom Body: Dark Obsidian / Emerald Pricing */}
                <div className="p-4 bg-[#071022] flex-1 flex flex-col justify-between space-y-3">
                  <div className="font-mono border-b border-white/10 pb-2">
                    <div className="text-2xl font-black text-emerald-400">
                      ${pkg.priceUSD} USD
                    </div>
                    <span className="text-[10px] text-sky-300 font-bold">
                      ≈ {formatVES(pkg.priceUSD, bcvRate)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {pkg.description}
                  </p>

                  <ul className="space-y-1 text-xs text-slate-400 pt-2">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3 h-3 text-sky-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 2: Form */}
        <div className="max-w-3xl mx-auto bg-slate-950/95 rounded-3xl border-2 border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleStartAutoPay} className="space-y-6">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-2">
                <span>Configura tu Partida</span>
              </h3>
              <span className="text-xs font-mono font-black text-white bg-[#ED1C24] px-3 py-1 rounded-xl shadow">
                {selectedPackage.name} (${selectedPackage.priceUSD})
              </span>
            </div>

            {/* Lane, Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-200 mb-1 uppercase font-mono">
                  Pista Preferida
                </label>
                <select
                  value={selectedLane}
                  onChange={(e) => setSelectedLane(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ED1C24] font-mono"
                >
                  {PINZULIA_LANES.map((lane) => (
                    <option key={lane.id} value={lane.laneNumber}>
                      Pista {lane.laneNumber < 10 ? `0${lane.laneNumber}` : lane.laneNumber} {lane.laneNumber >= 13 ? "(Lounge VIP)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-200 mb-1 uppercase font-mono">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ED1C24] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-200 mb-1 uppercase font-mono">
                  Turno / Hora Oficial
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ED1C24] font-mono"
                >
                  {timeSlots.map((ts) => (
                    <option key={ts} value={ts}>
                      {ts}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Players Count & Shoe Sizes */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Número de Jugadores (Máx. 6 por carril):
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePlayersCountChange(num)}
                      className={`btn-tactile w-8 h-8 rounded-xl text-xs font-black font-mono cursor-pointer ${
                        playersCount === num
                          ? "bg-[#0033CC] text-white shadow-md"
                          : "bg-slate-900 text-slate-400 border border-white/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shoes Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                {Array.from({ length: playersCount }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={playerNames[idx] || `Jugador ${idx + 1}`}
                      onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                      placeholder={`Jugador ${idx + 1}`}
                      className="w-1/2 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans"
                    />
                    <select
                      value={shoeSizes[idx] || "41 EU (8.5 US M)"}
                      onChange={(e) => handleShoeChange(idx, e.target.value)}
                      className="w-1/2 bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      {AVAILABLE_SHOE_SIZES.map((sz) => (
                        <option key={sz} value={sz}>
                          👟 {sz}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Mauricio Urdaneta"
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ED1C24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Teléfono WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: +58 412 1234567"
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ED1C24]"
                />
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="btn-tactile w-full bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-red-600/30 text-sm flex items-center justify-center gap-2 cursor-pointer uppercase italic tracking-wider border-2 border-white/30"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Pagar con Verificación Automática (3s) — ${selectedPackage.priceUSD} USD</span>
              </button>

              <button
                type="button"
                onClick={handleManualSubmit}
                className="btn-tactile w-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl border border-white/10 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Generar Pase Digital y Pagar en Taquilla / WhatsApp</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Auto Payment Modal */}
      {isAutoPayOpen && (
        <AutoPaymentModal
          isOpen={isAutoPayOpen}
          onClose={() => setIsAutoPayOpen(false)}
          amountUSD={selectedPackage.priceUSD}
          bcvRate={bcvRate}
          referenceCode={pendingBookingCode}
          onPaymentApproved={handleAutoPaySuccess}
        />
      )}
    </section>
  );
}