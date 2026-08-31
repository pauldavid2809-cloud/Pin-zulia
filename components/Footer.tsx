"use client";

import React from "react";
import Link from "next/link";
import { soundFX } from "@/lib/soundEffects";
import { Instagram, Phone, MapPin, QrCode, ShieldCheck, Heart, Sparkles, Clock, UtensilsCrossed, Calendar, Trophy } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-[#030611] text-slate-400 text-xs border-t-2 border-[#ED1C24] pt-12 pb-24 lg:pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ED1C24] border-2 border-white flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 100 200" className="w-6 h-8 drop-shadow" fill="none">
                  <path
                    d="M50 8C40 8 36 20 36 34C36 48 40 60 38 78C34 110 14 140 14 190C14 225 30 236 50 236C70 236 86 225 86 190C86 140 66 110 62 78C60 60 64 48 64 34C64 20 60 8 50 8Z"
                    fill="#FFFFFF"
                    stroke="#0033CC"
                    strokeWidth="6"
                  />
                  <path d="M37 54C42 56 58 56 63 54" stroke="#ED1C24" strokeWidth="8" strokeLinecap="round" />
                  <path d="M37 68C42 70 58 70 63 68" stroke="#ED1C24" strokeWidth="8" strokeLinecap="round" />
                  <text x="50" y="165" textAnchor="middle" fill="#0033CC" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" fontSize="30" fontStyle="italic">PZ</text>
                </svg>
              </div>

              <div>
                <h3 className="font-black text-white text-xl uppercase italic tracking-tight">
                  PINZULIA
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-mono font-bold">
                  <span>BOWLING BOUTIQUE & GASTROPUB</span>
                  <span>•</span>
                  <span>DESDE 1963</span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 max-w-sm leading-relaxed">
              La bolera legendaria de Maracaibo. 14 pistas computarizadas Brunswick™, gastronomía de autor y coctelería UV en 5 de Julio.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase italic text-sm tracking-wider font-mono">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#horarios" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Horario Oficial</span>
                </a>
              </li>
              <li>
                <a href="#pistas" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-sm">🎳</span>
                  <span>14 Pistas Brunswick™</span>
                </a>
              </li>
              <li>
                <a href="#tarifas-oficiales" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-sm">🎱</span>
                  <span>Pool & Tarifas Oficiales</span>
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  <span>Carta Gastropub</span>
                </a>
              </li>
              <li>
                <a href="#reservas" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-400" />
                  <span>Reservar Pistas</span>
                </a>
              </li>
              <li>
                <a href="#torneos" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Ligas & Noches Glow UV</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Operations & Stands QR */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase italic text-sm tracking-wider font-mono">
              Operaciones & Mesa
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pistas-qr" className="text-sky-300 hover:text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Stands QR para 14 Pistas</span>
                </Link>
              </li>
              <li>
                <Link href="/pista/07" className="hover:text-white flex items-center gap-1.5">
                  <span>Mesa Demo (Pista 07)</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-amber-300 hover:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Consola Gerencial & Pasarela</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <div>
            © {new Date().getFullYear()} PinZulia C.A. • RIF: J-50412890-1 • Todos los derechos reservados.
          </div>
          <div className="text-slate-300">
            Fundada en 1963 • Maracaibo, Estado Zulia 🇻🇪
          </div>
        </div>
      </div>
    </footer>
  );
}
