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
  const [submittedRef, setSubmittedRef] = useState<string>("");
  const [isSubmittingRef, setIsSubmittingRef] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [exactVES, setExactVES] = useState<number>(1.00);

  // 1. Initialize Payment Order on Mount
  useEffect(() => {
    if (!isOpen) return;

    const initPayment = async () => {
      setStatus("INITIALIZING");
      setUserReference("");
      setSubmittedRef("");
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
          setExactVES(data.transaction.amountVES || 1.00);
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
            onPaymentApproved(transactionId, data.bankReference || userReference);
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

  const handleReferenceSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!transactionId || !userReference.trim()) return;

    soundFX.playClick();
    setIsSubmittingRef(true);
    try {
      const res = await fetch(`/api/v1/payments/${transactionId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankReference: userReference.trim(),
        }),
      });
      const data = await res.json();
      setSubmittedRef(userReference.trim());

      if (data.transaction && data.transaction.status === "APPROVED") {
        setStatus("APPROVED");
        soundFX.playPinStrike();
        soundFX.playStrikeFanfare();
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
        setTimeout(() => {
          onPaymentApproved(transactionId, userReference.trim());
        }, 2200);
      }
    } catch {}
    setIsSubmittingRef(false);
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
                  ByteBridge 0.2s
                </span>
              </div>
              <span className="text-xs text-sky-200 font-mono">
                Orden: #{referenceCode} • Validación Estricta
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
                ¡Pago Validado con Éxito!
              </h4>
              <p className="text-xs text-emerald-200 font-mono">
                Ref: {userReference || "Bancaria Confirmada"} • Orden Aprobada
              </p>
            </div>
          ) : (
            <>
              {/* Amount Box */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    Monto Exacto a Transferir
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    Bs. {exactVES.toFixed(2)}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block">Total en USD</span>
                  <span className="text-sm font-black text-emerald-400">
                    {formatUSD(amountUSD)}
                  </span>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="space-y-2 rounded-2xl bg-slate-950 p-4 border border-white/10">
                <div className="text-xs font-black text-sky-400 uppercase font-mono flex items-center justify-between pb-1 border-b border-white/10">
                  <span>Datos Oficiales de Pago Móvil</span>
                  <span className="text-[10px] text-slate-400">Tasa BCV Oficial</span>
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

              {/* STRICT REFERENCE INPUT SECTION */}
              <form onSubmit={handleReferenceSubmit} className="space-y-3 p-4 rounded-2xl bg-[#0033CC]/20 border-2 border-[#0033CC] shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white uppercase italic font-sans flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>Ingresa el Número de Referencia</span>
                  </label>
                  <span className="text-[10px] font-mono text-sky-300 font-bold">
                    Completa o últimos dígitos
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userReference}
                    onChange={(e) => setUserReference(e.target.value)}
                    placeholder="Ej: 84920184 o 0184"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#ED1C24]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingRef || !userReference.trim()}
                    className="btn-tactile px-4 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#D8001D] disabled:opacity-50 text-white font-black text-xs uppercase italic tracking-wider cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    <span>{isSubmittingRef ? "Validando..." : "Validar"}</span>
                  </button>
                </div>

                {/* Radar Status Message */}
                <div className="flex items-center gap-2 text-[11px] font-mono pt-1 text-slate-300">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                  <span>
                    {submittedRef
                      ? `Escuchando banco para Ref: ${submittedRef}...`
                      : "Transfiere e ingresa la referencia completa o los últimos 4 dígitos para auto-aprobar."}
                  </span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
