"use client";

import React from "react";
import Link from "next/link";
import { ByteBridgeSettings } from "@/components/ByteBridgeSettings";
import { ArrowLeft, ShieldCheck, Smartphone } from "lucide-react";

export default function ByteBridgeAdminPage() {
  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Consola Gerencial</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>ByteBridge Mobile POS Gateway</span>
          </div>
        </div>

        <ByteBridgeSettings />
      </div>
    </div>
  );
}
