"use client";

import React from "react";
import { Sparkles, Trophy, GraduationCap, Users, Calendar, Clock, ArrowRight, Music, Flame } from "lucide-react";
import { soundFX } from "@/lib/soundEffects";

interface TournamentsSectionProps {
  onReserveClick: () => void;
}

export function TournamentsSection({ onReserveClick }: TournamentsSectionProps) {
  const events = [
    {
      id: "glow-party-weekend",
      title: "Glow Bowling UV Party & DJ en Vivo",
      tagline: "Luces ultravioleta, cócteles neón y DJ residente",
      day: "Viernes & Sábados",
      time: "8:00 PM – 2:00 AM",
      badge: "Top Noche",
      badgeColor: "bg-[#0033CC] text-white",
      icon: <Music className="w-5 h-5 text-white" />,
      description: "Apagamos las luces tradicionales y encendemos el bowling fluorescente UV con DJ residente, cócteles neón y juego con premios sorpresa.",
    },
    {
      id: "liga-zuliana-bowling",
      title: "Liga Zuliana de Bowling (Torneo Parejas)",
      tagline: "Competencia oficial por rondas acumulativas",
      day: "Jueves de Competencia",
      time: "7:00 PM – 10:30 PM",
      badge: "Torneo Oficial",
      badgeColor: "bg-[#ED1C24] text-white",
      icon: <Trophy className="w-5 h-5 text-white" />,
      description: "Competencia por rondas acumulativas para jugadores aficionados y avanzados con tabla de posiciones y trofeos mensuales.",
    },
    {
      id: "miercoles-universitarios",
      title: "Miércoles 2x1 Universitario & After-Office",
      tagline: "Pagas 1 hora y juegas 2 horas continuas",
      day: "Miércoles",
      time: "5:00 PM – 8:30 PM",
      badge: "2x1 en Pistas",
      badgeColor: "bg-[#0033CC] text-white",
      icon: <GraduationCap className="w-5 h-5 text-white" />,
      description: "Pagas 1 hora de pista y juegas 2 horas con carnet de estudiante universitario o credencial de trabajo.",
    },
    {
      id: "domingo-familiar-strike-kids",
      title: "Domingos Familiares & Strike Kids",
      tagline: "Bumpers automáticos y bolas livianas de 6-8 lbs",
      day: "Domingos",
      time: "2:00 PM – 7:00 PM",
      badge: "Para la Familia",
      badgeColor: "bg-emerald-600 text-white",
      icon: <Users className="w-5 h-5 text-white" />,
      description: "Pistas equipadas con parachoques automáticos para niños, bolas livianas y combos de pinsas familiares.",
    },
  ];

  return (
    <section id="torneos" className="py-16 sm:py-20 bg-[#040814] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0033CC] text-white text-xs font-black uppercase tracking-wider shadow-md">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Agenda Semanal de Actividades</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic retro-3d-text-blue">
            Ligas de Bowling, Torneos & Noches Glow UV
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Cada día de la semana tiene una vibra única en PinZulia. Desde promociones universitarias hasta torneos y fiestas con luces fluorescentes.
          </p>
        </div>

        {/* Events Grid: Two-Tone Card Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200"
            >
              {/* Two-Tone Top Header */}
              <div className="p-3.5 bg-white border-b-2 border-slate-200 flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#0033CC] flex items-center justify-center shadow">
                  {evt.icon}
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono ${evt.badgeColor}`}>
                  {evt.badge}
                </span>
              </div>

              {/* Two-Tone Bottom Body */}
              <div className="p-4 bg-[#071022] flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-black text-white text-base uppercase italic leading-snug group-hover:text-sky-300 transition-colors">
                    {evt.title}
                  </h3>
                  <div className="text-xs text-amber-300 font-bold font-mono">
                    {evt.tagline}
                  </div>
                </div>

                <div className="space-y-1 py-2 border-y border-white/10 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#ED1C24]" />
                    <span>{evt.day}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{evt.time}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {evt.description}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onReserveClick();
                    }}
                    className="btn-tactile w-full py-2.5 px-3 rounded-xl bg-[#ED1C24] hover:bg-[#D8001D] text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Reservar Cupo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}