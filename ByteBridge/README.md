# ⚡ ByteBridge - Native Android Payment Gateway & Reconciliation Daemon

**ByteBridge** (`com.bytebridge.gateway`) es una aplicación nativa para Android desarrollada en **Kotlin** y **Jetpack Compose**. Transforma un smartphone Android estándar en un puente de conciliación bancaria instantáneo (<0.2s) para negocios y cajas de cobro, capturando automáticamente confirmaciones de **Pago Móvil (VES)** y **Zelle (USD)** vía Notificaciones Push, Correos Electrónicos y Mensajes SMS y despachándolas hacia la WebApp del comercio (ej: *PinZulia Bowling*, *The Corner*) vía Webhooks seguros con firma criptográfica HMAC-SHA256.

---

## 🏛️ Redes y Bancos Soportados de Forma Nativa

### 🇻🇪 1. Pago Móvil (Venezuela - VES)
| Banco | Paquete App Android | Emisores SMS | Formato Detectado |
| :--- | :--- | :--- | :--- |
| **Banco de Venezuela (BDV)** | `com.bancodevenezuela.bdvapp` | `2661`, `2662`, `BDV` | PagoClave, Pago Móvil BDV |
| **Banesco** | `com.banesco.banescomovil` | `0134`, `2846`, `BANESCO` | BanescoPagoMovil, Push BanescoMóvil |
| **Banco Mercantil** | `com.mercantil.tpago` | `24024`, `TPAGO` | Tpago Mercantil |
| **Bancamiga** | `com.bancamiga.bancamigamovil` | `BANCAMIGA`, `8900` | Pago Móvil Bancamiga |
| **BBVA Provincial** | `com.bbva.provinet` | `1339`, `PROVINET` | Dinero Rápido Provincial |
| **Banco Nacional de Crédito (BNC)** | `com.bnc.bncenlinea` | `BNC`, `0191` | Pago Móvil BNC |
| **Bancaribe** | `com.bancaribe.movil` | `2274`, `BANCARIBE` | Mi Pago Bancaribe |

### 🇺🇸 2. Zelle Network (Estados Unidos - USD)
| Banco / Origen | Paquete / Cliente | Formato Detectado |
| :--- | :--- | :--- |
| **Zelle vía Correo (Gmail / Outlook)** | `com.google.android.gm`, `com.microsoft.office.outlook` | *"John Doe sent you $150.00 with Zelle"* |
| **Chase Bank Mobile** | `com.chase.sig.android` | *"Chase Alerts: You received $150.00 with Zelle"* |
| **Bank of America Mobile** | `com.infonow.bofa` | *"BofA: You received $85.00 from Maria Perez with Zelle"* |
| **Wells Fargo Mobile** | `com.wf.wellsfargomobile` | *"Wells Fargo: Zelle payment received for $50.00"* |
| **Citi Mobile & Zelle App** | `com.citi.citimobile`, `com.zellepay.zelle` | *"Zelle payment received from Carlos Gomez"* |

---

## ⚙️ Arquitectura Técnica

1. **Capturador Push (`BankPushListenerService`)**:
   - Hereda de `NotificationListenerService`.
   - Filtra eventos de la barra de estado emitidos por apps bancarias y notificaciones de correo (Gmail/Outlook).
   - Extrae título, texto, bigText y remitente en milisegundos.

2. **Capturador SMS (`SMSReceiver`)**:
   - `BroadcastReceiver` registrado con prioridad `999` para `android.provider.Telephony.SMS_RECEIVED`.
   - Soporte para mensajes multipart concatenados y números cortos oficiales.

3. **Motor Regex Determinista (`BankParserEngine`)**:
   - Limpieza y extracción estricta de montos en Bolívares (`Bs. 19.791,75` o `19791.75`) y Dólares (`$150.00`).
   - Extracción de número de referencia / Confirmation Code.
   - Identificación de Nombre del Pagador (Zelle), Cédula/RIF y Teléfono (Pago Móvil).

4. **Despachador Webhook Ultra-Rápido (`WebhookDispatcher`)**:
   - Conexión directa HTTP POST mediante OkHttp coroutines (<200ms de latencia).
   - Generación de firma `X-ByteBridge-Signature: HMAC-SHA256(jsonBody, apiKey)`.
   - Prevención de pagos duplicados mediante clave de idempotencia `hash(bank, ref, amount)`.
   - Persistencia local en SQLite con **Room Database**.
   - Reintentos garantizados fuera de línea vía **WorkManager** (`RetryWebhookWorker`).

5. **Emparejamiento QR Rápido**:
   - Visor con **CameraX** y **Google ML Kit Barcode Scanning**.
   - Vinculación instantánea del perfil del negocio escaneando el QR del panel `/admin`.

---

## 📦 Payloads de Webhook Enviados a tu Servidor

### Ejemplo A: Pago Móvil (VES)
```json
{
  "event": "payment.received",
  "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "idempotencyKey": "9f86d081884c7d659a2feaa0",
  "timestamp": 1725050000000,
  "channel": "PUSH",
  "data": {
    "bank": "BDV",
    "bankCode": "0102",
    "bankName": "Banco de Venezuela",
    "reference": "123456789012",
    "amount": 19791.75,
    "currency": "VES",
    "payerPhone": "04141234567",
    "payerId": "V-12345678",
    "rawMessage": "Pago Móvil BDV recibido: Ha recibido un pago por Bs. 19.791,75 de V-12345678. Referencia: 123456789012",
    "receivedAt": 1725050000000
  },
  "metadata": {
    "bridgeVersion": "1.0.0",
    "businessName": "PinZulia Bowling"
  }
}
```

### Ejemplo B: Zelle Payment (USD)
```json
{
  "event": "payment.received",
  "eventId": "e9b2c8a1-4321-4f89-9a12-8852b59cbfa5",
  "idempotencyKey": "7c89f1a234bc56de78fa9012",
  "timestamp": 1725050000000,
  "channel": "PUSH",
  "data": {
    "bank": "ZELLE_CHASE",
    "bankCode": "ZEL_CHASE",
    "bankName": "Zelle (Chase Bank)",
    "reference": "ZEL-982341",
    "amount": 150.00,
    "currency": "USD",
    "payerName": "John Doe",
    "rawMessage": "Chase Alerts: John Doe sent you $150.00 with Zelle. Confirmation: ZEL-982341",
    "receivedAt": 1725050000000
  },
  "metadata": {
    "bridgeVersion": "1.0.0",
    "businessName": "PinZulia Bowling"
  }
}
```

---

## 🔐 Verificación de Firma en el Servidor (Node.js / Express)

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

const SECRET_API_KEY = "SECURE_BRIDGE_KEY_2026";

app.post('/api/v1/ingest/push', express.raw({ type: 'application/json' }), (req, res) => {
    const rawBody = req.body.toString('utf-8');
    const signature = req.headers['x-bytebridge-signature'];
    const currency = req.headers['x-bytebridge-currency'] || 'VES';
    
    // Validar firma HMAC
    const expectedSignature = crypto
        .createHmac('sha256', SECRET_API_KEY)
        .update(rawBody)
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(401).json({ error: "Firma HMAC inválida" });
    }

    const payload = JSON.parse(rawBody);
    console.log(`Pago recibido de ${payload.data.bankName}: ${payload.data.currency} ${payload.data.amount} (Ref: ${payload.data.reference})`);
    
    // Conciliar en base de datos de PinZulia / The Corner
    // ...
    
    res.status(200).json({ status: "success", received: true });
});
```
