/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - PINZULIA AUTOMATED ZERO-HARDWARE BANK EMAIL FORWARDER
 * ==============================================================================
 * 
 * Instrucciones de Instalación (100% Gratis en 2 minutos):
 * 1. Ingresa a https://script.google.com con la cuenta de Gmail de pagos (ej: pinzuliapagos@gmail.com).
 * 2. Haz clic en "Nuevo proyecto".
 * 3. Pega este código completo reemplazando todo el contenido.
 * 4. Cambia 'WEBHOOK_URL' por la URL pública de tu servidor (ej: https://tu-dominio.com/api/v1/ingest/email).
 * 5. Haz clic en el icono de Reloj ("Activadores" / Triggers) en el menú lateral izquierdo.
 * 6. Añade un activador:
 *    - Función que se debe ejecutar: checkBankEmails
 *    - Origen del evento: Según tiempo
 *    - Tipo de activador basado en tiempo: Temporizador de minutos (Cada 1 minuto).
 * 7. Guarda y autoriza los permisos. ¡Listo! Cada Pago Móvil se procesará solo.
 */

const CONFIG = {
  WEBHOOK_URL: "https://pinzulia.com/api/v1/ingest/email", // Cambiar por tu URL de producción
  API_SECRET: "PINZULIA_SECURE_TOKEN_2026", // Opcional para seguridad
  PROCESSED_LABEL: "PROCESADO_PINZULIA",
  SEARCH_QUERY: 'is:unread (from:notificaciones@banvenez.com OR from:notificaciones@mercantilbanco.com OR from:alertas@banesco.com OR from:notificaciones@bancamiga.com.ve OR subject:"Pago Movil" OR subject:"PagoClave" OR subject:"Tpago")'
};

function checkBankEmails() {
  // Asegurar que exista la etiqueta de procesados
  let label = GmailApp.getUserLabelByName(CONFIG.PROCESSED_LABEL);
  if (!label) {
    label = GmailApp.createLabel(CONFIG.PROCESSED_LABEL);
  }

  // Buscar correos bancarios no leídos
  const threads = GmailApp.search(CONFIG.SEARCH_QUERY, 0, 10);

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    
    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      
      if (msg.isUnread()) {
        const emailPayload = {
          sender: msg.getFrom(),
          subject: msg.getSubject(),
          body: msg.getPlainBody() || msg.getBody(),
          date: msg.getDate().toISOString(),
          messageId: msg.getId()
        };

        Logger.log("Enviando correo bancario a PinZulia API: " + emailPayload.subject);

        try {
          const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, {
            method: "POST",
            contentType: "application/json",
            headers: {
              "x-api-key": CONFIG.API_SECRET
            },
            payload: JSON.stringify(emailPayload),
            muteHttpExceptions: true
          });

          Logger.log("Respuesta de la API (" + response.getResponseCode() + "): " + response.getContentText());

          // Marcar como leído y etiquetar
          msg.markRead();
          threads[i].addLabel(label);
        } catch (err) {
          Logger.log("Error enviando webhook: " + err.toString());
        }
      }
    }
  }
}
