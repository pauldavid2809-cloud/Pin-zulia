import { NextResponse } from "next/server";
import { parseBankPushNotification } from "@/lib/gateway/pushParsers";
import { TransactionStore } from "@/lib/gateway/transactionStore";
import { ByteBridgeManager } from "@/lib/gateway/bytebridgeConfig";
import { ParsedBankNotification } from "@/lib/gateway/types";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-bytebridge-signature") || req.headers.get("X-ByteBridge-Signature");

    // 1. HMAC-SHA256 Signature Verification
    if (signatureHeader) {
      const isValid = ByteBridgeManager.verifySignature(rawBody, signatureHeader);
      if (!isValid) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid X-ByteBridge-Signature HMAC" },
          { status: 401 }
        );
      }
    }

    // 2. Parse JSON Payload
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    let parsedNotification: ParsedBankNotification | null = null;

    // 3. Handle Standard ByteBridge Structured Event
    if (body.event === "payment.received" && body.data) {
      const {
        bank = "Banco de Venezuela",
        bankName,
        reference,
        amount,
        payerPhone,
        rawMessage,
      } = body.data;

      if (!reference || amount === undefined || amount === null) {
        return NextResponse.json(
          { error: "Payload data requires reference and amount" },
          { status: 422 }
        );
      }

      parsedNotification = {
        bank: bankName || bank || "Pago Móvil",
        reference: String(reference).trim(),
        amountVES: Number(amount),
        senderPhone: payerPhone || undefined,
        rawText: rawMessage || `Pago recibido por Bs. ${amount} Ref: ${reference}`,
        channel: "PUSH",
        timestamp: new Date(body.timestamp || Date.now()).toISOString(),
      };
    } else {
      // 4. Handle Raw Push Notification (e.g. from Android NotificationListener directly)
      const { packageName = "", title = "", text = "", message = "" } = body;
      const pushText = text || message;

      if (!pushText) {
        return NextResponse.json(
          { error: "Cuerpo de notificación vacío" },
          { status: 400 }
        );
      }

      parsedNotification = parseBankPushNotification(packageName, title, pushText);
    }

    if (!parsedNotification) {
      return NextResponse.json(
        {
          success: false,
          status: "PARSE_ERROR",
          message: "La notificación no contiene datos bancarios reconocidos de Pago Móvil.",
        },
        { status: 422 }
      );
    }

    // 5. Automated Reconciliation & Idempotency Store
    const result = TransactionStore.ingestBankNotification(parsedNotification);

    return NextResponse.json({
      status: "success",
      received: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al procesar notificación de ByteBridge" },
      { status: 500 }
    );
  }
}
