"use client";

import React, { useState, useEffect } from "react";
import { soundFX } from "@/lib/soundEffects";
import {
  MessageSquare,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  PowerOff,
  Radio,
  Phone,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function WhatsAppBotManager() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    state: string;
    phone: string | null;
    qrCode: string | null;
  }>({
    isConnected: false,
    state: "offline",
    phone: null,
    qrCode: null,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [testPhone, setTestPhone] = useState<string>("");
  const [testMessage, setTestMessage] = useState<string>(
    "🎳 *¡Hola desde PinZulia 1963!* Tu reserva para la Pista 07 ha sido confirmada con éxito. Ver Pase VIP: https://pin-zulia.vercel.app/ticket/PIN-7401"
  );
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      setStatus({
        isConnected: data.isConnected || false,
        state: data.state || "offline",
        phone: data.phone || null,
        qrCode: data.qrCode || null,
      });
    } catch {
      setStatus({
        isConnected: false,
        state: "offline",
        phone: null,
        qrCode: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDisconnect = async () => {
    soundFX.playClick();
    if (!confirm("¿Deseas desconectar la sesión de WhatsApp oficial?")) return;
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
      fetchStatus();
    } catch {}
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    soundFX.playClick();
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone.trim(),
          message: testMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundFX.playStrikeFanfare();
        setSendResult(`✅ Mensaje entregado con éxito (ID: ${data.messageId})`);
      } else {
        setSendResult(`❌ Error: ${data.error || "No se pudo enviar"}`);
      }
    } catch (err: any) {
      setSendResult(`❌ Error de red: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: BOT CONNECTION CARD (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase italic tracking-tight font-sans">
                    Bot WhatsApp Entradas
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Motor Baileys · Multi-Dispositivo
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                    status.isConnected
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : status.state === "connecting"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status.isConnected
                        ? "bg-emerald-400 animate-pulse"
                        : status.state === "connecting"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  />
                  <span>
                    {status.isConnected
                      ? "Conectado"
                      : status.state === "connecting"
                      ? "Escaneando QR..."
                      : "Desconectado"}
                  </span>
                </span>
              </div>
            </div>

            {/* QR Scanner or Connected State */}
            {status.isConnected ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div>
                  <div className="text-sm font-bold text-white">
                    ¡Bot Vinculado & Operativo!
                  </div>
                  <div className="text-xs text-emerald-300 font-mono pt-1">
                    Número: {status.phone || "Línea Oficial PinZulia"}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Los pases digitales QR y notificaciones de pago se enviarán de forma automática a los clientes.
                </p>
                <button
                  onClick={handleDisconnect}
                  className="btn-tactile px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>Desvincular WhatsApp</span>
                </button>
              </div>
            ) : status.qrCode ? (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-white rounded-2xl max-w-[240px] mx-auto shadow-2xl border-4 border-emerald-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={status.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    Escanea este código con tu WhatsApp:
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    WhatsApp ➡️ Dispositivos Vinculados ➡️ Vincular Dispositivo
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950 border border-white/5 text-center space-y-3">
                <Radio className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <div className="text-xs text-slate-400 font-mono">
                  Iniciando demonio de WhatsApp...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Daemon Node: Puerto 3001</span>
            <button
              onClick={fetchStatus}
              className="text-sky-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>Verificar</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MANUAL TEST DISPATCHER (7 Cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase italic tracking-tight font-sans">
                Despachador Manual de Pases & Mensajes
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Envía pruebas o reenvía pases digitales directamente a cualquier número.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold rounded-full border border-sky-500/30">
              API Instantánea
            </span>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Teléfono de Destino (con código de país ej: 584121234567):
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="584121083997 o 04121083997"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Plantilla del Mensaje:
              </label>
              <textarea
                rows={4}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-tactile w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 border border-white/20"
            >
              <Send className={`w-4 h-4 ${isSending ? "animate-spin" : ""}`} />
              <span>{isSending ? "Enviando por WhatsApp..." : "Despachar Mensaje de Prueba"}</span>
            </button>
          </form>

          {sendResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-mono ${
                sendResult.startsWith("✅")
                  ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/80 border border-red-500/40 text-red-300"
              }`}
            >
              {sendResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
