"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { soundFX } from "@/lib/soundEffects";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Phone,
  MapPin,
  Menu as MenuIcon,
  X,
  Volume2,
  VolumeX,
  Clock,
  Flame,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { CurrencyMode } from "@/data/currencies";

interface HeaderProps {
  currency: CurrencyMode;
  onCurrencyChange: (mode: CurrencyMode) => void;
  bcvRate: number;
  glowMode: boolean;
  onToggleGlow: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenManager: () => void;
}

export function Header({
  currency,
  onCurrencyChange,
  bcvRate,
  glowMode,
  onToggleGlow,
  cartCount,
  onOpenCart,
  onOpenManager,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.setMuted(next);
    if (!next) {
      soundFX.playClick();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-[#040814]/95 backdrop-blur-md border-b-2 border-[#ED1C24]/40 shadow-xl shadow-black/70"
          : "bg-[#040814]/90 backdrop-blur-sm border-b border-white/10"
      }`}
    >
      {/* Top Banner with address, hours & DolarAPI */}
      <div className="hidden lg:flex items-center justify-between px-4 lg:px-8 py-1.5 text-[11px] bg-gradient-to-r from-[#ED1C24]/20 via-[#040814] to-[#0033CC]/30 border-b border-white/5 text-slate-300 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-200">
            <MapPin className="w-3 h-3 text-[#ED1C24] shrink-0" />
            <span className="font-sans font-medium">C.C. Internacional 5 de Julio, Maracaibo</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Abierto Hoy desde las 5:00 PM</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sky-300">
            <Zap className="w-3 h-3 text-[#0033CC] shrink-0 fill-sky-400" /> Tasa DolarAPI:{" "}
            <strong className="text-white font-mono">{bcvRate.toFixed(2)} Bs/$</strong>
          </span>
          <span className="text-white/20">•</span>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold font-sans"
          >
            <Phone className="w-3 h-3 shrink-0" /> WhatsApp Directo
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Official Brand Logo */}
          <Link
            href="/"
            onClick={() => soundFX.playClick()}
            className="flex items-center gap-2.5 sm:gap-3 group select-none"
          >
            {/* Bowling Pin Icon PZ */}
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-[#ED1C24] border-2 border-white flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform shrink-0">
              <svg viewBox="0 0 100 200" className="w-6 sm:w-7 h-8 sm:h-9 drop-shadow" fill="none">
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

            {/* Brand Typography */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tight leading-none group-hover:text-[#ED1C24] transition-colors">
                  PINZULIA
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#0033CC] text-white font-black text-[9px] font-mono uppercase tracking-wider border border-white/20">
                  DESDE 1963
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                Bowling Boutique & Gastropub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { href: "#horarios", label: "Horario", icon: "⏰" },
              { href: "#pistas", label: "Pistas en Vivo", icon: "🎳" },
              { href: "#menu", label: "Gastropub", icon: "🍕" },
              { href: "#reservas", label: "Reservar", icon: "🎟️ï¸" },
              { href: "#torneos", label: "Ligas & UV", icon: "🏆" },
              { href: "#ubicacion", label: "Ubicación", icon: "📍" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => soundFX.playClick()}
                className="btn-tactile px-3 py-2 rounded-xl text-xs font-black uppercase italic text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-white/10 transition-all flex items-center gap-1.5"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Audio Toggle Button */}
            <button
              onClick={handleToggleMute}
              className="btn-tactile p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs cursor-pointer"
              title={isMuted ? "Activar Sonido" : "Silenciar Sonido"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>

            {/* UV Glow Mode Switch */}
            <button
              onClick={() => {
                soundFX.playClick();
                onToggleGlow();
              }}
              className={`btn-tactile px-2.5 sm:px-3 py-2 rounded-xl text-xs font-black uppercase font-mono transition-all border cursor-pointer flex items-center gap-1.5 ${
                glowMode
                  ? "bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/30"
                  : "bg-slate-900 text-cyan-300 border-cyan-500/30 hover:border-cyan-400"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Glow UV</span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenCart();
              }}
              className="btn-tactile relative p-2 sm:p-2.5 rounded-xl bg-[#0033CC] hover:bg-[#002299] text-white border border-white/20 text-xs cursor-pointer shadow-md shadow-blue-900/30"
              title="Ver Comanda"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#ED1C24] text-white text-[10px] font-black flex items-center justify-center font-mono border-2 border-white shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* CTA Reserve Button */}
            <a
              href="#reservas"
              onClick={() => soundFX.playClick()}
              className="btn-tactile hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider shadow-lg shadow-red-600/30 border border-white/20"
            >
              <span>Reservar</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="btn-tactile md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#040814] border-b-2 border-[#ED1C24] p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "#horarios", label: "⏰ Horario Oficial" },
              { href: "#pistas", label: "🎳 14 Pistas" },
              { href: "#menu", label: "🍕 Gastropub" },
              { href: "#reservas", label: "🎟️ï¸ Reservar Pista" },
              { href: "#torneos", label: "🏆 Ligas & Torneos" },
              { href: "#ubicacion", label: "📍 Ubicación" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  soundFX.playClick();
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl bg-slate-900 text-xs font-black uppercase italic text-white border border-white/10 text-center"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Tasa BCV: {bcvRate.toFixed(2)} Bs/$</span>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sky-400 font-bold flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gerencia</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}