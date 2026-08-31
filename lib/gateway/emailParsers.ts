import { ParsedBankNotification } from "./types";

export function parseBankEmail(subject: string, bodyText: string, htmlContent?: string): ParsedBankNotification | null {
  const fullText = `${subject || ""} ${bodyText || ""} ${htmlContent ? htmlContent.replace(/<[^>]*>?/gm, " ") : ""}`.trim();
  if (!fullText) return null;

  // 1. Detect Bank from Sender or Subject/Body
  let bank = "BANCO_DESCONOCIDO";
  if (/banesco/i.test(fullText)) bank = "Banesco (0134)";
  else if (/mercantil|tpago/i.test(fullText)) bank = "Mercantil (0105)";
  else if (/bdv|pagoclave|venezuela/i.test(fullText)) bank = "Banco de Venezuela (0102)";
  else if (/bancamiga/i.test(fullText)) bank = "Bancamiga (0172)";
  else if (/provincial|bbva/i.test(fullText)) bank = "BBVA Provincial (0108)";
  else if (/bnc/i.test(fullText)) bank = "BNC (0191)";

  // 2. Extract Reference
  const refPatterns = [
    /Ref(?:erencia)?[:\.\s#]+([A-Za-z0-9]{4,14})/i,
    /Nro\.?\s*de\s*(?:operaci[oó]n|referencia|comprobante)[:\.\s#]+([A-Za-z0-9]{4,14})/i,
    /comprobante[:\.\s#]+([A-Za-z0-9]{4,14})/i,
    /n[uú]mero\s*de\s*aprobaci[oó]n[:\.\s#]+([A-Za-z0-9]{4,14})/i,
    /([0-9]{6,12})/i,
  ];

  let reference = "";
  for (const pattern of refPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      reference = match[1].trim();
      break;
    }
  }

  // 3. Extract Amount in VES
  const amountPatterns = [
    /Bs\.?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})|[0-9]+(?:[\.,][0-9]{1,2})?)/i,
    /monto[:\s]+Bs\.?\s*([0-9\.,]+)/i,
    /importe[:\s]+Bs\.?\s*([0-9\.,]+)/i,
    /por\s+Bs\.?\s*([0-9\.,]+)/i,
    /total[:\s]+Bs\.?\s*([0-9\.,]+)/i,
  ];

  let amountVES = 0;
  for (const pattern of amountPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const rawNum = match[1].trim();
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

  // 4. Extract Sender Info
  const phoneMatch = fullText.match(/(?:telefono|telf|celular|desde)[:\.\s]*(04\d{2}[-\s]?\d{3}[-\s]?\d{4}|04\d{9})/i);
  const senderPhone = phoneMatch ? phoneMatch[1].replace(/[-\s]/g, "") : undefined;

  if (!reference || amountVES <= 0) {
    return null;
  }

  return {
    bank,
    rawText: `[EMAIL: ${subject}] ${bodyText.substring(0, 150)}...`,
    amountVES: Number(amountVES.toFixed(2)),
    reference,
    senderPhone,
    timestamp: new Date().toISOString(),
    channel: "EMAIL",
  };
}