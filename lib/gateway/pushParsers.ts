import { ParsedBankNotification } from "./types";

export function parseBankPushNotification(packageName: string, title: string, text: string): ParsedBankNotification | null {
  const combined = `${title || ""} ${text || ""}`.trim();
  if (!combined) return null;

  let bank = "BANCO_DESCONOCIDO";
  if (/banesco/i.test(packageName) || /banesco/i.test(combined)) bank = "Banesco (0134)";
  else if (/mercantil/i.test(packageName) || /tpago|mercantil/i.test(combined)) bank = "Mercantil (0105)";
  else if (/bdv|venezuela/i.test(packageName) || /bdv|pagoclave/i.test(combined)) bank = "Banco de Venezuela (0102)";
  else if (/bancamiga/i.test(packageName) || /bancamiga/i.test(combined)) bank = "Bancamiga (0172)";
  else if (/provincial/i.test(packageName) || /bbva/i.test(combined)) bank = "BBVA Provincial (0108)";
  else if (/bnc/i.test(packageName) || /bnc/i.test(combined)) bank = "BNC (0191)";

  // Extract Reference
  const refMatch = combined.match(/Ref(?:erencia)?[:\.\s#]+([A-Za-z0-9]{4,14})/i) ||
    combined.match(/Nro[:\.\s#]+(\d{4,14})/i) ||
    combined.match(/([0-9]{6,12})/);

  const reference = refMatch ? refMatch[1].trim() : "";

  // Extract Amount
  const amountMatch = combined.match(/Bs\.?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})|[0-9]+(?:[\.,][0-9]{1,2})?)/i) ||
    combined.match(/([0-9\.,]+)\s*Bs/i);

  let amountVES = 0;
  if (amountMatch && amountMatch[1]) {
    let cleaned = amountMatch[1].trim();
    if (cleaned.includes(".") && cleaned.includes(",")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (cleaned.includes(",")) {
      cleaned = cleaned.replace(",", ".");
    }
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) amountVES = parsed;
  }

  // Extract Sender
  const phoneMatch = combined.match(/(04\d{9})/);
  const senderPhone = phoneMatch ? phoneMatch[1] : undefined;

  if (!reference || amountVES <= 0) return null;

  return {
    bank,
    rawText: `[PUSH: ${title}] ${text}`,
    amountVES: Number(amountVES.toFixed(2)),
    reference,
    senderPhone,
    timestamp: new Date().toISOString(),
    channel: "PUSH",
  };
}