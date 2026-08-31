import { NextResponse } from "next/server";
import { LaneBridgeStore } from "@/lib/bowling/laneBridgeStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const laneParam = searchParams.get("lane");

    if (laneParam) {
      const laneNumber = parseInt(laneParam, 10);
      if (isNaN(laneNumber) || laneNumber < 1 || laneNumber > 14) {
        return NextResponse.json({ error: "Número de pista inválido (1-14)" }, { status: 400 });
      }
      const laneGame = LaneBridgeStore.getLaneGame(laneNumber);
      return NextResponse.json({ success: true, laneGame });
    }

    const allLanes = LaneBridgeStore.getAllLanes();
    return NextResponse.json({ success: true, lanes: allLanes });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al obtener marcadores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { laneNumber, action = "pinfall", pinsKnocked = 10, ballSpeedKmh = 27.5, playerNames } = body;

    if (!laneNumber || laneNumber < 1 || laneNumber > 14) {
      return NextResponse.json({ error: "Número de pista requerido (1-14)" }, { status: 400 });
    }

    if (action === "reset") {
      const resetGame = LaneBridgeStore.resetLaneGame(laneNumber, playerNames);
      return NextResponse.json({ success: true, message: "Partida reiniciada", laneGame: resetGame });
    }

    const updatedGame = LaneBridgeStore.recordPinFall(laneNumber, pinsKnocked, ballSpeedKmh);
    return NextResponse.json({ success: true, message: "Tiro registrado con éxito", laneGame: updatedGame });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al registrar tiro de bowling" }, { status: 500 });
  }
}
