import { NextResponse } from "next/server";
import { parseBankEmail } from "@/lib/gateway/emailParsers";
import { TransactionStore } from "@/lib/gateway/transactionStore";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let subject = "";
    let text = "";
    let html = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      subject = body.subject || body.Subject || "";
      text = body.text || body.body || body.textBody || body.plain || "";
      html = body.html || body.htmlBody || "";
    } else {
      // Multipart / FormData for SendGrid / Mailgun / Postmark
      const formData = await req.formData();
      subject = (formData.get("subject") as string) || "";
      text = (formData.get("text") as string) || (formData.get("body-plain") as string) || "";
      html = (formData.get("html") as string) || "";
    }

    const parsed = parseBankEmail(subject, text, html);
    if (!parsed) {
      return NextResponse.json({
        success: false,
        status: "PARSE_ERROR",
        message: "El correo no coincide con un formato bancario de notificación de Pago Móvil.",
      }, { status: 422 });
    }

    const result = TransactionStore.ingestBankNotification(parsed);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al procesar correo bancario" }, { status: 500 });
  }
}