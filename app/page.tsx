"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BrandServicesRates } from "@/components/BrandServicesRates";
import { BookingSection, BookingData } from "@/components/BookingSection";
import { QrTicketModal } from "@/components/QrTicketModal";
import { ManagerDashboard } from "@/components/ManagerDashboard";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CurrencyMode } from "@/data/currencies";
import { useBcvRate } from "@/lib/useBcvRate";

export default function HomePage() {
  const [currency, setCurrency] = useState<CurrencyMode>("USD");
  const { rate: bcvRate, setCustomRate: setBcvRate } = useBcvRate();
  const [glowMode, setGlowMode] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [activeBooking, setActiveBooking] = useState<BookingData | null>(null);

  // Check URL query parameters (?admin=true or ?gerente=true)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gerente") === "true" || params.get("admin") === "true") {
        setIsManagerOpen(true);
      }
    }
  }, []);

  const handleToggleGlow = () => {
    setGlowMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("glow-mode-active");
      } else {
        document.documentElement.classList.remove("glow-mode-active");
      }
      return next;
    });
  };

  const scrollToReservas = () => {
    const element = document.getElementById("reservar-qr");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#040814] text-slate-100 relative selection:bg-[#ED1C24] selection:text-white">
      {/* Header */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        bcvRate={bcvRate}
        glowMode={glowMode}
        onToggleGlow={handleToggleGlow}
        onOpenManager={() => setIsManagerOpen(true)}
      />

      {/* Main Streamlined Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onReserveClick={scrollToReservas}
          onMenuClick={scrollToReservas}
        />

        {/* 2. Official Rates & Heritage Showcase */}
        <BrandServicesRates
          bcvRate={bcvRate}
          onSelectService={() => scrollToReservas()}
        />

        {/* 3. Core QR Reservation Experience */}
        <BookingSection
          currency={currency}
          bcvRate={bcvRate}
          onBookingSuccess={(booking) => setActiveBooking(booking)}
        />

        {/* 4. Location & Schedules */}
        <LocationSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav
        onReserveClick={scrollToReservas}
        onOpenManager={() => setIsManagerOpen(true)}
      />

      {/* QR Ticket Modal */}
      {activeBooking && (
        <QrTicketModal
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
          bcvRate={bcvRate}
        />
      )}

      {/* Manager Operations Console */}
      {isManagerOpen && (
        <ManagerDashboard
          isOpen={isManagerOpen}
          onClose={() => setIsManagerOpen(false)}
          bcvRate={bcvRate}
          onUpdateBcvRate={setBcvRate}
        />
      )}
    </div>
  );
}
