package com.bytebridge.gateway.core.util

import com.bytebridge.gateway.core.model.BusinessConfig

object GoogleScriptGenerator {

    /**
     * Generates a turnkey Google Apps Script pre-filled with the specific business webhook,
     * API secret key, and business name.
     */
    fun generateScript(config: BusinessConfig): String {
        val webhookUrl = config.webhookUrl.ifBlank { "https://tu-webapp.com/api/v1/ingest/push" }
        val apiKey = config.apiKey.ifBlank { "TU_CLAVE_SECRETA_HMAC" }
        val businessName = config.businessName.ifBlank { "Mi Negocio" }

        return """
/**
 * ⚡ ByteBridge - Google Cloud Auto-Reconciliation Script
 * Negocio Vinculado: $businessName
 * 
 * INSTRUCCIONES DE ACTIVACIÓN (2 Minutos):
 * 1. Entra en https://script.google.com con el correo de tu negocio ($businessName).
 * 2. Haz clic en "Nuevo proyecto", borra todo y pega este código completo.
 * 3. Haz clic en "Guardar" (ícono de disco) y luego en "Ejecutar" para conceder permisos a Gmail.
 * 4. En el menú izquierdo ve a "Activadores" (ícono de reloj) > "Añadir activador":
 *    - Función a ejecutar: syncZelleAndBankEmails
 *    - Origen del evento: Según tiempo
 *    - Tipo de temporizador: Temporizador por minutos (cada 1 minuto).
 * ¡Listo! Zelle y correos bancarios se conciliarán 24/7 en la nube para $businessName.
 */

const WEBHOOK_URL = "$webhookUrl";
const API_KEY = "$apiKey";
const BUSINESS_NAME = "$businessName";

function syncZelleAndBankEmails() {
  // Buscar correos no leídos de Zelle y bancos de los últimos 2 días
  const query = 'is:unread (from:zelle OR from:chase OR from:bankofamerica OR from:wellsfargo OR from:citi OR subject:"Zelle" OR subject:"PagoClave" OR subject:"Pago Movil" OR subject:"Tpago")';
  const threads = GmailApp.search(query, 0, 15);

  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const message of messages) {
      if (message.isUnread()) {
        const body = message.getPlainBody();
        const subject = message.getSubject();
        const from = message.getFrom();

        const paymentData = parseEmailPayment(subject + " " + body, from);
        if (paymentData) {
          const success = dispatchWebhook(paymentData, body);
          if (success) {
            message.markRead(); // Marcar como procesado para no duplicar
          }
        }
      }
    }
  }
}

function parseEmailPayment(text, from) {
  // 1. Zelle: "John Doe sent you $150.00 with Zelle"
  const zelleSent = text.match(/(.+?)\s+sent\s+you\s+\$([0-9.,]+)/i);
  // 2. Zelle: "You received $85.00 from Maria Perez with Zelle"
  const zelleRec = text.match(/received\s+\$([0-9.,]+)\s+from\s+(.+?)(?:\s+with\s+Zelle|\.)/i);
  // 3. Confirmación / Ref
  const refMatch = text.match(/(?:confirmation|reference|ref|trx|code|recibo)[:\s#]+([A-Za-z0-9\-_]{6,18})/i);

  if (zelleSent) {
    return {
      bank: "ZELLE_CLOUD",
      bankName: "Zelle ($businessName)",
      amount: parseFloat(zelleSent[2].replace(",", "")),
      currency: "USD",
      payerName: zelleSent[1].trim(),
      reference: refMatch ? refMatch[1] : "ZEL-" + new Date().getTime().toString().slice(-8)
    };
  }

  if (zelleRec) {
    return {
      bank: "ZELLE_CLOUD",
      bankName: "Zelle ($businessName)",
      amount: parseFloat(zelleRec[1].replace(",", "")),
      currency: "USD",
      payerName: zelleRec[2].trim(),
      reference: refMatch ? refMatch[1] : "ZEL-" + new Date().getTime().toString().slice(-8)
    };
  }

  // 4. PagoClave BDV vía Correo
  const bdvMatch = text.match(/PagoClave.*?por\s+(?:Bs\.?\s*)?([0-9.,]+).*?ref\s+([0-9]{6,14})/i);
  if (bdvMatch) {
    return {
      bank: "BDV",
      bankName: "Banco de Venezuela (Email)",
      amount: parseFloat(bdvMatch[1].replace(".", "").replace(",", ".")),
      currency: "VES",
      reference: bdvMatch[2]
    };
  }

  return null;
}

function dispatchWebhook(data, rawText) {
  const payload = {
    event: "payment.received",
    eventId: Utilities.getUuid(),
    idempotencyKey: Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.bank + data.reference + data.amount)).substring(0, 24),
    timestamp: new Date().getTime(),
    channel: "GMAIL_CLOUD_SCRIPT",
    data: {
      ...data,
      rawMessage: rawText.substring(0, 300),
      receivedAt: new Date().getTime()
    },
    metadata: {
      bridgeVersion: "1.0.0-gas",
      businessName: BUSINESS_NAME
    }
  };

  const jsonBody = JSON.stringify(payload);
  
  // Calcular firma HMAC-SHA256 con la API Key del negocio
  const signatureBytes = Utilities.computeHmacSha256Signature(jsonBody, API_KEY);
  const signature = signatureBytes.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "X-ByteBridge-Signature": signature,
      "X-ByteBridge-Timestamp": payload.timestamp.toString(),
      "X-ByteBridge-Event-ID": payload.eventId,
      "X-ByteBridge-Currency": data.currency,
      "User-Agent": "ByteBridge-GoogleAppsScript/1.0"
    },
    payload: jsonBody,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    return response.getResponseCode() >= 200 && response.getResponseCode() < 300;
  } catch (e) {
    Logger.log("Error despachando webhook: " + e.toString());
    return false;
  }
}
        """.trimIndent()
    }
}
