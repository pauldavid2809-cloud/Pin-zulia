"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_BCV_RATE } from "@/data/currencies";

export interface BcvRateState {
  rate: number;
  source: string;
  lastUpdate: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useBcvRate(initialRate: number = DEFAULT_BCV_RATE) {
  const [rateState, setRateState] = useState<BcvRateState>({
    rate: initialRate,
    source: "DolarAPI (BCV Oficial)",
    lastUpdate: null,
    isLoading: true,
    error: null,
  });

  const fetchLiveRate = useCallback(async () => {
    try {
      setRateState((prev) => ({ ...prev, isLoading: true, error: null }));
      const res = await fetch("/api/bcv");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.rate && typeof data.rate === "number") {
        setRateState({
          rate: data.rate,
          source: data.source || "DolarAPI (BCV Oficial)",
          lastUpdate: data.lastUpdate || null,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      setRateState((prev) => ({
        ...prev,
        isLoading: false,
        error: err?.message || "No se pudo sincronizar DolarAPI",
      }));
    }
  }, []);

  useEffect(() => {
    fetchLiveRate();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchLiveRate, 300000);
    return () => clearInterval(interval);
  }, [fetchLiveRate]);

  return {
    ...rateState,
    refreshRate: fetchLiveRate,
    setCustomRate: (newRate: number) =>
      setRateState((prev) => ({ ...prev, rate: newRate, source: "Manual (Gerente)" })),
  };
}