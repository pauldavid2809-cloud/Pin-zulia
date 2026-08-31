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
  Radio,
  Lock,
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
  const [exactVES, setExactVES] = useState<number>(1.15);

  // 1. Initialize Payment Order on Mount
  useEffect(() => {
    if (!isOpen) return;

    const initPayment = async () => {
      setStatus("INITIALIZING");
      setUserReference("");
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

  // 2. Poll Status every 2.0 seconds
  useEffect(() => {
    if (!transactionId || status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/payments/${transactionId}/status`);
        const data = await res.json();

        if (data.status === "APPROVED") {
          setStatus("APPROVED");
          soundFX.playPinStrike();
          soundFX.playStrikeFanfare();
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
          setTimeout(() => {
            onPaymentApproved(transactionId, data.bankReference || userReference || "Auto-Decimal");
          }, 2200);
        }
      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, [transactionId, status, userReference, onPaymentApproved]);

  const handleCopy = (text: string, field: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleManualRefSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!transactionId || !userReference.trim()) return;

    soundFX.playClick();
    try {
      const res = await fetch(`/api/v1/payments/${transactionId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankReference: userReference.trim() }),
      });
      const data = await res.json();
      if (data.transaction && data.transaction.status === "APPROVED") {
        setStatus("APPROVED");
        soundFX.playPinStrike();
        soundFX.playStrikeFanfare();
        try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch {}
        setTimeout(() => {
          onPaymentApproved(transactionId, userReference.trim());
        }, 2200);
      }
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#040814] border-2 border-white/20 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0033CC] p-4 sm:p-5 flex items-center justify-between border-b-2 border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ED1C24] border-2 border-white flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg sm:text-xl uppercase italic tracking-tight font-sans">
                  Pago Móvil Automático
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-black border border-emerald-500/40">
                  Céntimos Únicos 0.2s
                </span>
              </div>
              <span className="text-xs text-sky-200 font-mono">
                Orden: #{referenceCode} • Auto-Conciliación Instantánea
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="btn-tactile p-2 rounded-xl bg-black/30 hover:bg-black/50 text-slate-300 hover:text-white border border-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Status: APPROVED Banner */}
          {status === "APPROVED" ? (
            <div className="p-6 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-center space-y-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-xl font-black text-white uppercase italic">
                ¡Pago Aprobado Automáticamente!
              </h4>
              <p className="text-xs text-emerald-200 font-mono">
                Monto exacto verificado por ByteBridge • Orden #{referenceCode} Activa
              </p>
            </div>
          ) : (
            <>
              {/* Dynamic Cents Amount Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0033CC]/40 border-2 border-[#ED1C24] flex items-center justify-between shadow-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-300 uppercase font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Transfiere el Monto Exacto con Céntimos:</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                    <span>Bs. {exactVES.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 block font-sans">
                    Los céntimos son únicos para tu orden y permiten auto-aprobarla en 1 segundo sin escribir referencia.
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(exactVES.toFixed(2), "amount")}
                  className="btn-tactile p-3 rounded-2xl bg-[#ED1C24] hover:bg-[#D8001D] text-white flex flex-col items-center gap-1 cursor-pointer shrink-0 shadow-md border border-white/20"
                  title="Copiar Monto Exacto"
                >
                  {copiedField === "amount" ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                  <span className="text-[9px] font-black uppercase font-mono">Copiar</span>
                </button>
              </div>

              {/* Bank Account Details */}
              <div className="space-y-2 rounded-2xl bg-slate-950 p-4 border border-white/10">
                <div className="text-xs font-black text-sky-400 uppercase font-mono flex items-center justify-between pb-1 border-b border-white/10">
                  <span>Datos Oficiales de Pago Móvil</span>
                  <span className="text-[10px] text-slate-400">Banco Provincial (0108)</span>
                </div>

                {/* Bank */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400 font-mono">Banco:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{PAYMENT_ACCOUNTS.pagoMovil.banco} (0108)</span>
                    <button
                      onClick={() => handleCopy(PAYMENT_ACCOUNTS.pagoMovil.banco, "banco")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedField === "banco" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400 font-mono">Teléfono:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{PAYMENT_ACCOUNTS.pagoMovil.telefono}</span>
                    <button
                      onClick={() => handleCopy(PAYMENT_ACCOUNTS.pagoMovil.telefono, "telefono")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedField === "telefono" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* RIF */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400 font-mono">C.I. / RIF:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{PAYMENT_ACCOUNTS.pagoMovil.rif}</span>
                    <button
                      onClick={() => handleCopy(PAYMENT_ACCOUNTS.pagoMovil.rif, "rif")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedField === "rif" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Radar Status Bar */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 font-mono text-xs text-emerald-200">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                <span>
                  Escuchando banco... En cuanto envíes los <strong>Bs. {exactVES.toFixed(2)}</strong>, esta pantalla se cerrará automáticamente.
                </span>
              </div>

              {/* Optional Reference Box (Speed Up) */}
              <form onSubmit={handleManualRefSubmit} className="pt-1 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>¿Deseas ingresar la referencia manualmente? (Opcional)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userReference}
                    onChange={(e) => setUserReference(e.target.value)}
                    placeholder="Ej: 12345678"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="btn-tactile px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold cursor-pointer"
                  >
                    Verificar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
