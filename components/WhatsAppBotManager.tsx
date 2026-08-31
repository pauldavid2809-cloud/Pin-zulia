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
    "🎳 *¡Hola desde PinZulia 1963!* Este es un mensaje de prueba del sistema automatizado de entrega de pases digitales."
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
        setSendResult(`✅ Mensaje enviado con éxito (ID: ${data.messageId})`);
      } else {
        setSendResult(`❌ Error: ${data.error || "No se pudo enviar"}`);
      }
    } catch (err: any) {
      setSendResult(`❌ Error de conexión: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Connection Status Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white uppercase italic font-sans tracking-tight">
                  Bot Automatizado de WhatsApp (Parrandón Engine)
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${
                    status.isConnected
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                      : status.state === "qr"
                      ? "bg-amber-950 text-amber-300 border-amber-500/50 animate-pulse"
                      : "bg-red-950 text-red-300 border-red-500/50"
                  }`}
                >
                  {status.isConnected
                    ? "🟢 Conectado Oficial"
                    : status.state === "qr"
                    ? "🟡 Escanear Código QR"
                    : "🔴 Bot Offline (Puerto 3001)"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Envía automáticamente el Pase VIP Digital al WhatsApp del cliente al generar su reserva.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                fetchStatus();
              }}
              className="btn-tactile p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 cursor-pointer"
              title="Refrescar Estado"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {status.isConnected && (
              <button
                onClick={handleDisconnect}
                className="btn-tactile px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            )}
          </div>
        </div>

        {/* Content based on Connection State */}
        {status.isConnected ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Línea de WhatsApp Vinculada: +{status.phone}
                </span>
                <span className="text-[11px] text-emerald-300 font-mono">
                  Todas las reservaciones se están despachando automáticamente a los teléfonos de los clientes.
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-900/60 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              ⚡ Listo para Enviar
            </span>
          </div>
        ) : status.qrCode ? (
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-[#0033CC]">
              <img
                src={status.qrCode}
                alt="Escanear QR de WhatsApp"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-black text-white uppercase italic">
                Vincula tu WhatsApp de Recepción
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                1. Abre WhatsApp en el teléfono del local.<br />
                2. Ve a <strong>Ajustes ➡️ Dispositivos vinculados</strong>.<br />
                3. Apunta la cámara a este código QR para conectar el bot.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold text-white uppercase">
              Servicio Local de WhatsApp Bot Apagado
            </h4>
            <p className="text-[11px] text-slate-400 font-mono max-w-md mx-auto">
              Para iniciar el bot automatizado en tu máquina o servidor, ejecuta en la terminal:<br />
              <code className="px-2 py-0.5 bg-black rounded text-amber-300 font-bold block mt-1">
                npm run whatsapp:bot
              </code>
            </p>
          </div>
        )}
      </div>

      {/* Manual Test Dispatcher */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
        <h4 className="text-sm font-black text-white uppercase italic font-sans flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-400" />
          <span>Prueba de Envío Manual de Entradas / Notificaciones</span>
        </h4>

        <form onSubmit={handleSendTest} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-400">Teléfono Destino (con código de país o 0414):</span>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Ej: 04121234567 ó 584121234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSending || !status.isConnected}
                className="btn-tactile w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase italic tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg font-sans text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Enviando..." : "Enviar Prueba WhatsApp"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400">Mensaje a Enviar:</span>
            <textarea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>

          {sendResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono ${
                sendResult.startsWith("✅")
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/60 border-red-500/40 text-red-300"
              }`}
            >
              {sendResult}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
