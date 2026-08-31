"use client";

import React from "react";
import Link from "next/link";
import { ManagerDashboard } from "@/components/ManagerDashboard";
import { useBcvRate } from "@/lib/useBcvRate";
import { ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const { rate: bcvRate, setCustomRate: setBcvRate } = useBcvRate();

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 p-4 selection:bg-sky-500 selection:text-white">
      <div className="max-w-6xl mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      <ManagerDashboard
        isOpen={true}
        onClose={() => {
          window.location.href = "/";
        }}
        bcvRate={bcvRate}
        onUpdateBcvRate={setBcvRate}
      />
    </div>
  );
}