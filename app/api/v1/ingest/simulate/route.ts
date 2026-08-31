import { NextResponse } from "next/server";
import { parseBankSMS } from "@/lib/gateway/bankParsers";
import { parseBankEmail } from "@/lib/gateway/emailParsers";
import { parseBankPushNotification } from "@/lib/gateway/pushParsers";
import { TransactionStore } from "@/lib/gateway/transactionStore";
import { IngestionChannel } from "@/lib/gateway/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bank = "Banesco",
      amountVES,
      reference,
      senderPhone = "04121234567",
      channel = "EMAIL",
    } = body;

    let parsed = null;

    if (channel === "EMAIL") {
      const subject = `Notificación de Pago Móvil Recibido - ${bank}`;
      const emailBody = `Estimado cliente, le informamos que ha recibido una transferencia de Pago Móvil por un monto de Bs. ${amountVES} desde el teléfono ${senderPhone} bajo el número de referencia ${reference}. Fecha: ${new Date().toLocaleDateString()}`;
      parsed = parseBankEmail(subject, emailBody);
    } else if (channel === "PUSH") {
      const pkg = bank === "Banesco" ? "com.banesco.banescomovil" : "com.mercantil.tpago";
      const title = `${bank} Alertas`;
      const pushText = `Pago Móvil recibido por Bs. ${amountVES}. Ref: ${reference}`;
      parsed = parseBankPushNotification(pkg, title, pushText);
    } else {
      let smsText = "";
      if (bank === "Banesco") {
        smsText = `Banesco Pago Movil: Recibiste Bs. ${amountVES} de ${senderPhone}. Ref: ${reference}. ${new Date().toLocaleTimeString()}`;
      } else if (bank === "Mercantil") {
        smsText = `Mercantil Tpago: Ha recibido un pago de Bs ${amountVES} desde el telefono ${senderPhone} ref ${reference}`;
      } else {
        smsText = `BDV PagoClave: Pago recibido por Bs. ${amountVES} desde ${senderPhone}. Ref: ${reference}`;
      }
      parsed = parseBankSMS(smsText);
    }

    if (!parsed) {
      return NextResponse.json({ error: "Error al generar simulación bancaria" }, { status: 400 });
    }

    parsed.channel = channel as IngestionChannel;
    const result = TransactionStore.ingestBankNotification(parsed);
    return NextResponse.json({
      channel,
      parsedData: parsed,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}