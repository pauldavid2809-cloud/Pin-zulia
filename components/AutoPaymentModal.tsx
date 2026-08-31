"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { soundFX } from "@/lib/soundEffects";
import { formatUSD, formatVES } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Zap,
  Copy,
  Check,
  Send,
  X,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { PAYMENT_ACCOUNTS } from "@/data/pinzuliaData";

interface AutoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountUSD: number;
  bcvRate: number;
  referenceCode: string;
  onPaymentApproved: (transactionId: string, reference: string) => void;
}

export function AutoPaymentModal({
  isOpen,
  onClose,
  amountUSD,
  bcvRate,
  referenceCode,
  onPaymentApproved,
}: AutoPaymentModalProps) {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"INITIALIZING" | "PENDING" | "APPROVED" | "FAILED">("INITIALIZING");
  const [userReference, setUserReference] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [exactVES, setExactVES] = useState<number>(Number((amountUSD * bcvRate).toFixed(2)));
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>("Banesco");

  // 1. Initialize Payment Order on Mount
  useEffect(() => {
    if (!isOpen) return;

    const initPayment = async () => {
      setStatus("INITIALIZING");
      try {
        const res = await fetch("/api/v1/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD,
            referenceCode,
            paymentMethod: "pago_movil",
          }),
        });
        const data = await res.json();
        if (data.success && data.transaction) {
          setTransactionId(data.transaction.id);
          setExactVES(data.transaction.amountVES);
          setStatus("PENDING");
        }
      } catch (e) {
        setStatus("FAILED");
      }
    };

    initPayment();
  }, [isOpen, amountUSD, referenceCode]);

  // 2. Poll Status every 2.5 seconds
  useEffect(() => {
    if (!transactionId || status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/payments/${transactionId}/status`);
        const data = await res.json();

        if (data.status === "APPROVED") {
          setStatus("APPROVED");
          soundFX.playStrikeFanfare();
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
          setTimeout(() => {
            onPaymentApproved(transactionId, data.bankReference || userReference);
          }, 2500);
        }
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [transactionId, status, userReference, onPaymentApproved]);

  const handleCopy = (text: string, field: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegisterUserReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !userReference.trim()) return;

    soundFX.playClick();
    try {
      await fetch(`/api/v1/payments/${transactionId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankReference: userReference.trim() }),
      });
    } catch {}
  };

  // 3. Simulator for instant testing
  const handleSimulateBankSMS = async () => {
    if (!transactionId) return;
    setIsSimulating(true);
    soundFX.playClick();

    const mockRef = userReference.trim() || `${Math.floor(100000 + Math.random() * 900000)}`;
    if (!userReference) {
      setUserReference(mockRef);
      // Register reference first
      await fetch(`/api/v1/payments/${transactionId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankReference: mockRef }),
      });
    }

    try {
      await fetch("/api/v1/ingest/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank: selectedBank,
          amountVES: exactVES,
          reference: mockRef,
        }),
      });
    } catch {}

    setIsSimulating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#040814] rounded-3xl border-2 border-sky-500/40 p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-black text-white uppercase italic">
                  Pago Móvil Automático
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full font-mono">
                  3 Segundos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verificación bancaria instantánea sin comprobación manual
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State 1: APPROVED SUCCESS */}
        {status === "APPROVED" && (
          <div className="p-6 rounded-3xl bg-emerald-950/80 border-2 border-emerald-400/60 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-white uppercase italic">
              ¡Pago Verificado por el Banco!
            </h4>
            <p className="text-xs text-emerald-200 font-mono">
              Conciliación bancaria exitosa. Monto recibido: Bs. {exactVES.toFixed(2)}
            </p>
            <div className="text-[11px] text-slate-300 font-mono pt-1">
              Desbloqueando tu pase digital y carril...
            </div>
          </div>
        )}

        {/* State 2: PENDING PAYMENT INSTRUCTIONS */}
        {status === "PENDING" && (
          <div className="space-y-4">
            {/* Amount Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Monto a Transferir (Tasa BCV {bcvRate.toFixed(2)} Bs/$)
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  Bs. {exactVES.toFixed(2)}
                </div>
                <span className="text-xs text-slate-400">≈ ${amountUSD.toFixed(2)} USD</span>
              </div>

              <button
                onClick={() => handleCopy(exactVES.toFixed(2), "amount")}
                className="btn-tactile px-3 py-2 rounded-xl bg-slate-900 text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 cursor-pointer font-sans font-bold"
              >
                {copiedField === "amount" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copiar Bs</span>
              </button>
            </div>

            {/* Bank Info Cards */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">BANCO DESTINO</span>
                  <span className="text-white font-bold">{PAYMENT_ACCOUNTS.pagoMovil.banco}</span>
                </div>
                <span className="text-[10px] text-sky-400 font-bold">0134 / 0105</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">TELÉFONO AFILIADO</span>
                  <span className="text-white font-bold">{PAYMENT_ACCOUNTS.pagoMovil.telefono}</span>
                </div>
                <button
                  onClick={() => handleCopy(PAYMENT_ACCOUNTS.pagoMovil.telefono, "telf")}
                  className="p-1.5 bg-slate-900 rounded-lg text-slate-300"
                >
                  {copiedField === "telf" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">RIF / CÉDULA</span>
                  <span className="text-white font-bold">{PAYMENT_ACCOUNTS.pagoMovil.rif}</span>
                </div>
                <button
                  onClick={() => handleCopy(PAYMENT_ACCOUNTS.pagoMovil.rif, "rif")}
                  className="p-1.5 bg-slate-900 rounded-lg text-slate-300"
                >
                  {copiedField === "rif" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Reference Input */}
            <form onSubmit={handleRegisterUserReference} className="space-y-2 pt-1 font-mono">
              <label className="text-xs font-bold text-slate-300 font-sans block">
                Últimos 6 dígitos de la referencia bancaria:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={12}
                  value={userReference}
                  onChange={(e) => setUserReference(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ej: 849201"
                  className="flex-1 bg-slate-950 border border-sky-500/40 rounded-xl px-3.5 py-2.5 text-base font-black text-white focus:outline-none focus:border-sky-400 tracking-wider placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="btn-tactile px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-sans font-bold text-xs cursor-pointer"
                >
                  Registrar
                </button>
              </div>
            </form>

            {/* Live Radar Listening Indicator */}
            <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <span className="absolute w-8 h-8 rounded-full bg-sky-500/20 animate-ping" />
                <Clock className="w-5 h-5 text-sky-400 animate-spin" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-sky-300">Escuchando confirmación bancaria en vivo...</div>
                <p className="text-[11px] text-slate-400">
                  Tu pago se validará automáticamente en cuanto entre la notificación del banco.
                </p>
              </div>
            </div>

            {/* Development / Testing Simulation Panel */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Simulador Bancario (Demostración)
                </span>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="bg-slate-900 text-slate-300 text-[10px] rounded px-1.5 py-0.5 border border-slate-700"
                >
                  <option value="Banesco">Banesco</option>
                  <option value="Mercantil">Mercantil</option>
                  <option value="BDV">BDV</option>
                  <option value="Bancamiga">Bancamiga</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSimulateBankSMS}
                disabled={isSimulating}
                className="btn-tactile w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simular Disparo de SMS {selectedBank} (Aprobación Instantánea)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}