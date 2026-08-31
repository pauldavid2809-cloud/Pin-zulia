"use client";

import React from "react";
import { MapPin, Phone, Instagram, Clock, Car, Navigation, ShieldCheck, Flame, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { soundFX } from "@/lib/soundEffects";

export function LocationSection() {
  return (
    <section id="ubicacion" className="py-16 sm:py-20 bg-[#040814] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0033CC] text-white text-xs font-black uppercase tracking-wider shadow-md">
            <MapPin className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span>En el Corazón de Maracaibo</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic retro-3d-text-blue">
            Ubicación & Horarios Oficiales
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Fácil acceso por la Av. 5 de Julio, amplio estacionamiento privado y seguridad 24/7 en el C.C. Internacional.
          </p>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Schedule Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address Card with Two-Tone Styling */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white">
              <div className="p-3.5 bg-white border-b-2 border-slate-200 flex items-center justify-between">
                <h3 className="font-black text-[#0033CC] text-base uppercase italic">
                  Dirección de la Sede
                </h3>
                <span className="text-[10px] font-black bg-[#ED1C24] text-white px-2 py-0.5 rounded-full font-mono">
                  Av. 5 de Julio
                </span>
              </div>
              <div className="p-4 bg-[#071022] space-y-3 text-xs">
                <p className="text-slate-200 font-medium leading-relaxed">
                  {SITE_CONFIG.address}
                </p>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Car className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Estacionamiento privado vigilado dentro del centro comercial.</span>
                </div>
              </div>
            </div>

            {/* Official Hours Quick Card */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white">
              <div className="p-3.5 bg-white border-b-2 border-slate-200 flex items-center justify-between">
                <h3 className="font-black text-[#0033CC] text-base uppercase italic flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#ED1C24]" />
                  <span>Horarios Oficiales de Apertura</span>
                </h3>
                <span className="text-[9px] font-black bg-[#0033CC] text-white px-2 py-0.5 rounded-full font-mono">
                  1963 — 2026
                </span>
              </div>
              <div className="p-4 bg-[#071022] space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-300">Lunes a Jueves:</span>
                  <span className="text-white font-black bg-slate-900 px-2 py-0.5 rounded border border-white/10">5:00 PM – 11:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-300">Viernes:</span>
                  <span className="text-[#ED1C24] font-black bg-slate-900 px-2 py-0.5 rounded border border-white/10">5:00 PM – 2:00 AM</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-300">Sábado:</span>
                  <span className="text-sky-300 font-black bg-slate-900 px-2 py-0.5 rounded border border-white/10">2:00 PM – 2:00 AM</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-300">Domingo:</span>
                  <span className="text-emerald-400 font-black bg-slate-900 px-2 py-0.5 rounded border border-white/10">2:00 PM – 11:00 PM</span>
                </div>
              </div>
            </div>

            {/* Quick Routing Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href={SITE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFX.playClick()}
                className="btn-tactile py-3 px-3 rounded-2xl bg-[#0033CC] hover:bg-[#002299] text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Navigation className="w-4 h-4" />
                <span>Abrir en Maps</span>
              </a>

              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFX.playClick()}
                className="btn-tactile py-3 px-3 rounded-2xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Sede</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Dark Frame */}
          <div className="lg:col-span-7 h-[380px] lg:h-[440px] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.036746654877!2d-71.62648482496001!3d10.654261789487313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8999818817a151%3A0xe54d9229ad16ecb6!2sPinzulia!5e0!3m2!1ses!2sve!4v1709400000000!5m2!1es!2sve"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación PinZulia Bowling"
            />
          </div>
        </div>
      </div>
    </section>
  );
}