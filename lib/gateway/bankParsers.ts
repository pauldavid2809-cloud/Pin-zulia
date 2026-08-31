import { ParsedBankNotification } from "./types";

export function parseBankSMS(rawText: string): ParsedBankNotification | null {
  if (!rawText || typeof rawText !== "string") return null;

  const text = rawText.trim();

  // 1. Detect Bank
  let bank = "BANCO_DESCONOCIDO";
  if (/banesco/i.test(text)) bank = "Banesco (0134)";
  else if (/mercantil|tpago/i.test(text)) bank = "Mercantil (0105)";
  else if (/bdv|pagoclave|venezuela/i.test(text)) bank = "Banco de Venezuela (0102)";
  else if (/bancamiga/i.test(text)) bank = "Bancamiga (0172)";
  else if (/provincial|bbva|dinero rapido/i.test(text)) bank = "BBVA Provincial (0108)";
  else if (/bnc/i.test(text)) bank = "BNC (0191)";
  else if (/bancaribe/i.test(text)) bank = "Bancaribe (0114)";

  // 2. Extract Reference (alphanumeric or numeric, 4 to 12 digits)
  const refPatterns = [
    /Ref(?:erencia)?[:\.\s#]+([A-Za-z0-9]{4,14})/i,
    /Nro(?:[:\.\s#]+)?(\d{4,14})/i,
    /comprobante[:\.\s#]+(\d{4,14})/i,
    /operaci[oó]n[:\.\s#]+(\d{4,14})/i,
    /(?:ref|doc)\s*(\d{4,14})/i,
  ];

  let reference = "";
  for (const pattern of refPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      reference = match[1].trim();
      break;
    }
  }

  // 3. Extract Amount in VES (Bs. / Bs / VES)
  const amountPatterns = [
    /Bs\.?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})|[0-9]+(?:[\.,][0-9]{1,2})?)/i,
    /monto[:\s]+Bs\.?\s*([0-9\.,]+)/i,
    /por\s+Bs\.?\s*([0-9\.,]+)/i,
    /recibiste\s+Bs\.?\s*([0-9\.,]+)/i,
  ];

  let amountVES = 0;
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const rawNum = match[1].trim();
      // Handle Venezuelan currency formats (e.g., 19.791,75 -> 19791.75 or 19791.75)
      let cleaned = rawNum;
      if (cleaned.includes(".") && cleaned.includes(",")) {
        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
      } else if (cleaned.includes(",")) {
        cleaned = cleaned.replace(",", ".");
      }
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed > 0) {
        amountVES = parsed;
        break;
      }
    }
  }

  // 4. Extract Sender Phone
  const phoneMatch = text.match(/(?:desde|de|telf|telefono|tel)?\s*(04\d{2}[-\s]?\d{3}[-\s]?\d{4}|04\d{9})/i);
  const senderPhone = phoneMatch ? phoneMatch[1].replace(/[-\s]/g, "") : undefined;

  if (!reference || amountVES <= 0) {
    return null;
  }

  return {
    bank,
    rawText: text,
    amountVES: Number(amountVES.toFixed(2)),
    reference,
    senderPhone,
    timestamp: new Date().toISOString(),
    channel: "SMS",
  };
}