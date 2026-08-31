"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { soundFX } from "@/lib/soundEffects";
import {
  QrCode,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Zap,
  Radio,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";

export function ByteBridgeSettings() {
  const [config, setConfig] = useState<any>({
    businessName: "PinZulia Bowling Boutique & Gastropub",
    webhookUrl: "http://192.168.31.204:3000/api/v1/ingest/push",
    apiKey: "bb_sec_pinzulia_2026_98a7b6c5d4e3",
    isActive: true,
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Load config on mount
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/v1/bytebridge/config");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          generateQR(data.config);
        }
      }
    } catch {
      generateQR(config);
    }
  };

  const generateQR = async (cfg: any) => {
    try {
      const qrPayload = JSON.stringify({
        businessName: cfg.businessName,
        webhookUrl: cfg.webhookUrl,
        apiKey: cfg.apiKey,
        isActive: cfg.isActive,
      });

      const url = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0033CC",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(url);
    } catch (e) {
      console.error("Error generating QR", e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleCopy = (text: string, field: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleRegenerateKey = async () => {
    if (!confirm("¿Estás seguro de regenerar la Clave Secreta HMAC? Deberás volver a escanear el QR en la app ByteBridge del celular.")) {
      return;
    }

    soundFX.playClick();
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/v1/bytebridge/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_key" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          generateQR(data.config);
        }
      }
    } catch {}
    setIsRegenerating(false);
  };

  const handleTestSimulation = async () => {
    soundFX.playClick();
    setSimulating(true);
    setSimResult(null);

    const testPayload = {
      event: "payment.received",
      eventId: `evt_${Date.now()}`,
      idempotencyKey: `idemp_${Date.now()}`,
      timestamp: Date.now(),
      channel: "PUSH",
      data: {
        bank: "BDV",
        bankCode: "0102",
        bankName: "Banco de Venezuela",
        reference: Math.floor(10000000 + Math.random() * 90000000).toString(),
        amount: 1500.0,
        currency: "VES",
        payerName: "Mauricio Urdaneta",
        payerPhone: "04120308674",
        payerId: "V-20184920",
        rawMessage: "BDVApp: PagoClave recibido por Bs. 1.500,00 de 04120308674",
        receivedAt: Date.now(),
      },
    };

    try {
      const res = await fetch("/api/v1/ingest/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });
      const data = await res.json();
      setSimResult(data);
      if (data.status === "success") {
        soundFX.playPinStrike();
      }
    } catch (e: any) {
      setSimResult({ error: e.message });
    }
    setSimulating(false);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0033CC] via-[#040814] to-[#ED1C24] p-6 sm:p-8 border-2 border-white/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-emerald-300 font-mono text-xs font-black border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ByteBridge Daemon • Conexión Nativa Activa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight font-sans">
            Vinculación de la App Android "ByteBridge"
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Captura instantánea (0.2s) de notificaciones bancarias de Pago Móvil y Zelle en el teléfono de la caja sin intermediarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestSimulation}
            disabled={simulating}
            className="btn-tactile px-4 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider flex items-center gap-2 shadow-lg cursor-pointer border border-white/20"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{simulating ? "Probando..." : "Simular Evento ByteBridge"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: QR Pairing Card + Credential Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dynamic QR Pairing Stand */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-4 border-[#0033CC] text-center space-y-4">
          <div className="space-y-1">
            <div className="inline-block px-3 py-0.5 rounded-full bg-[#0033CC] text-white font-black text-[10px] uppercase tracking-wider font-mono">
              EMPAREJAMIENTO RÁPIDO
            </div>
            <h3 className="text-xl font-black text-[#0033CC] uppercase italic leading-none">
              Escanear con ByteBridge
            </h3>
          </div>

          {/* QR Code Canvas Frame */}
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Código QR de Vinculación ByteBridge"
                className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-xl drop-shadow"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center font-mono text-xs text-slate-400">
                Generando QR...
              </div>
            )}
          </div>

          {/* Instruction Text */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#0033CC] uppercase font-mono">
              <Smartphone className="w-4 h-4 text-[#ED1C24]" />
              <span>Instrucciones de Uso:</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed font-sans">
              Abre <strong>ByteBridge</strong> en el teléfono de la caja, ve a <strong>"📷 Escanear QR"</strong> y apunta a este código para vincular los pagos automáticamente.
            </p>
          </div>
        </div>

        {/* Right Column: Webhook URL, HMAC Secret Key & Logs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Credentials Card */}
          <div className="rounded-3xl bg-slate-950/90 border-2 border-white/20 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                <h3 className="font-black text-white uppercase italic text-sm font-sans">
                  Credenciales de Seguridad & Webhook
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                HMAC-SHA256
              </span>
            </div>

            {/* Field 1: Business Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase font-mono">
                Nombre del Negocio
              </label>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono flex items-center justify-between">
                <span>{config.businessName}</span>
                <button
                  onClick={() => handleCopy(config.businessName, "name")}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedField === "name" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 2: Webhook URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase font-mono flex items-center justify-between">
                <span>URL del Endpoint Webhook (POST)</span>
                <span className="text-[10px] text-emerald-400">Listo para Recibir</span>
              </label>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-sky-300 font-mono flex items-center justify-between gap-2 overflow-hidden">
                <span className="truncate">{config.webhookUrl}</span>
                <button
                  onClick={() => handleCopy(config.webhookUrl, "url")}
                  className="btn-tactile p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                  title="Copiar URL"
                >
                  {copiedField === "url" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 3: HMAC Secret API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase font-mono">
                  Clave Secreta HMAC (API Key)
                </label>
                <button
                  onClick={handleRegenerateKey}
                  disabled={isRegenerating}
                  className="btn-tactile text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
                  <span>Regenerar Clave</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-amber-300 font-mono flex items-center justify-between gap-2 overflow-hidden">
                <span className="truncate">{config.apiKey}</span>
                <button
                  onClick={() => handleCopy(config.apiKey, "key")}
                  className="btn-tactile p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                  title="Copiar Clave"
                >
                  {copiedField === "key" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                La app ByteBridge calcula la firma <code>X-ByteBridge-Signature</code> con esta clave para proteger los envíos.
              </p>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="rounded-3xl bg-slate-950 border-2 border-[#ED1C24]/50 p-5 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#ED1C24]" />
                  <span className="font-black text-white text-xs uppercase italic font-sans">
                    Resultado de Simulación ByteBridge
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[9px] font-black border border-emerald-500/40">
                  HTTP 200 OK
                </span>
              </div>
              <pre className="p-3 rounded-xl bg-black font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {JSON.stringify(simResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
