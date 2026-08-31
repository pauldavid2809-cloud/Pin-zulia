import { NextResponse } from "next/server";
import { DEFAULT_BCV_RATE } from "@/data/currencies";

export const revalidate = 300; // Cache 5 minutes

export async function GET() {
  try {
    const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 300 },
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`DolarAPI returned ${response.status}`);
    }

    const data = await response.json();
    const rate = Number(data.promedio) || DEFAULT_BCV_RATE;

    return NextResponse.json({
      rate: Number(rate.toFixed(2)),
      currency: "VES",
      base: "USD",
      source: "DolarAPI (BCV Oficial)",
      lastUpdate: data.fechaActualizacion || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "success",
    });
  } catch (error: any) {
    console.error("Error fetching live BCV from DolarAPI:", error?.message);
    return NextResponse.json({
      rate: DEFAULT_BCV_RATE,
      currency: "VES",
      base: "USD",
      source: "Fallback Oficial",
      error: error?.message || "DolarAPI unreachable",
      timestamp: new Date().toISOString(),
      status: "fallback",
    });
  }
}