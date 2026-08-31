import { NextResponse } from "next/server";
import { parseBankSMS } from "@/lib/gateway/bankParsers";
import { TransactionStore } from "@/lib/gateway/transactionStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessage = body.message || body.text || body.rawMessage || body.body || "";

    if (!rawMessage) {
      return NextResponse.json({ error: "Texto de mensaje requerido" }, { status: 400 });
    }

    const parsed = parseBankSMS(rawMessage);
    if (!parsed) {
      return NextResponse.json({
        success: false,
        status: "PARSE_ERROR",
        message: "El mensaje no coincide con un formato bancario reconocido de Pago Móvil.",
      }, { status: 422 });
    }

    parsed.channel = "SMS";
    const result = TransactionStore.ingestBankNotification(parsed);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al procesar notificación" }, { status: 500 });
  }
}