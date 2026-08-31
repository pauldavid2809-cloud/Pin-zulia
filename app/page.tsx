"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BrandServicesRates } from "@/components/BrandServicesRates";
import { LaneLive3DVisualizer } from "@/components/remotion/LaneLive3DVisualizer";
import { LaneStatusGrid } from "@/components/LaneStatusGrid";
import { BookingSection, BookingData } from "@/components/BookingSection";
import { GastropubMenu } from "@/components/GastropubMenu";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { QrTicketModal } from "@/components/QrTicketModal";
import { GlowStrikeMiniGame } from "@/components/GlowStrikeMiniGame";
import { TournamentsSection } from "@/components/TournamentsSection";
import { ManagerDashboard } from "@/components/ManagerDashboard";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CurrencyMode } from "@/data/currencies";
import { MenuItem } from "@/data/pinzuliaData";
import { useBcvRate } from "@/lib/useBcvRate";

export default function HomePage() {
  const [currency, setCurrency] = useState<CurrencyMode>("USD");
  const { rate: bcvRate, setCustomRate: setBcvRate } = useBcvRate();
  const [glowMode, setGlowMode] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [activeBooking, setActiveBooking] = useState<BookingData | null>(null);
  const [preselectedLane, setPreselectedLane] = useState<number | null>(null);

  // Check URL query parameters (e.g. ?gerente=true or ?admin=true or ?pista=7)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gerente") === "true" || params.get("admin") === "true") {
        setIsManagerOpen(true);
      }
      const laneParam = params.get("pista");
      if (laneParam) {
        const laneNum = parseInt(laneParam);
        if (!isNaN(laneNum)) {
          setPreselectedLane(laneNum);
        }
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

  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantity: newQty } : ci
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectLaneForBooking = (laneNumber: number) => {
    setPreselectedLane(laneNumber);
    const element = document.getElementById("reservas");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectLaneForOrder = (laneNumber: number) => {
    setPreselectedLane(laneNumber);
    setIsCartOpen(true);
  };

  const scrollToReservas = () => {
    const element = document.getElementById("reservas");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToMenu = () => {
    const element = document.getElementById("menu");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const totalCartCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#040814] text-slate-100 relative selection:bg-[#ED1C24] selection:text-white">
      {/* Header with Live DolarAPI BCV Rate */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        bcvRate={bcvRate}
        glowMode={glowMode}
        onToggleGlow={handleToggleGlow}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenManager={() => setIsManagerOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Hero
          onReserveClick={scrollToReservas}
          onMenuClick={scrollToMenu}
        />

        {/* Official Services & Pricing Showcase (Bowling $25, Zapatos $2,5, Pool $20) */}
        <BrandServicesRates
          bcvRate={bcvRate}
          onSelectService={() => scrollToReservas()}
        />

        {/* Remotion Live 3D Architectural Visualizer */}
        <LaneLive3DVisualizer onReserveLane={handleSelectLaneForBooking} />

        <LaneStatusGrid
          onSelectLaneForBooking={handleSelectLaneForBooking}
          onSelectLaneForOrder={handleSelectLaneForOrder}
        />

        <BookingSection
          currency={currency}
          bcvRate={bcvRate}
          preselectedLane={preselectedLane}
          onBookingSuccess={(booking) => setActiveBooking(booking)}
        />

        <GastropubMenu
          currency={currency}
          bcvRate={bcvRate}
          onAddToCart={handleAddToCart}
        />

        <GlowStrikeMiniGame />

        <TournamentsSection onReserveClick={scrollToReservas} />

        <LocationSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav
        onReserveClick={scrollToReservas}
        onMenuClick={scrollToMenu}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        currency={currency}
        bcvRate={bcvRate}
        initialLane={preselectedLane || 1}
      />

      {/* QR Ticket Modal */}
      {activeBooking && (
        <QrTicketModal
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
          bcvRate={bcvRate}
        />
      )}

      {/* Manager Operations Dashboard */}
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