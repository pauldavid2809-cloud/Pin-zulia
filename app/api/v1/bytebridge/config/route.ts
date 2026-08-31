import { NextResponse } from "next/server";
import { ByteBridgeManager } from "@/lib/gateway/bytebridgeConfig";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const origin = url.origin || "http://localhost:3000";
    const pairingConfig = ByteBridgeManager.getPairingConfig(origin);

    return NextResponse.json({
      success: true,
      config: pairingConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al obtener configuración de ByteBridge" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "regenerate_key") {
      const newKey = ByteBridgeManager.regenerateApiKey();
      const url = new URL(req.url);
      const pairingConfig = ByteBridgeManager.getPairingConfig(url.origin);

      return NextResponse.json({
        success: true,
        message: "Nueva clave secreta HMAC generada con éxito",
        newApiKey: newKey,
        config: pairingConfig,
      });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al actualizar configuración" }, { status: 500 });
  }
}
