/**
 * Servidor Webhook de Prueba para ByteBridge (Soporta Pago Móvil VES y Zelle USD)
 * Ejecútalo con: node mock_webhook_server.js
 */
const http = require('http');
const crypto = require('crypto');

const PORT = 4000;
const SECRET_API_KEY = "SECURE_BRIDGE_KEY_2026";

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/v1/ingest/push') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const signature = req.headers['x-bytebridge-signature'];
            const timestamp = req.headers['x-bytebridge-timestamp'];
            const eventId = req.headers['x-bytebridge-event-id'];
            const bankCode = req.headers['x-bytebridge-bank'];
            const currencyHeader = req.headers['x-bytebridge-currency'] || 'VES';

            // Calcular firma HMAC-SHA256 esperada
            const expectedSignature = crypto
                .createHmac('sha256', SECRET_API_KEY)
                .update(body)
                .digest('hex');

            const isSignatureValid = signature === expectedSignature;

            console.log("\n=======================================================");
            console.log(`⚡ [${new Date().toLocaleTimeString()}] NUEVO EVENTO RECIBIDO DE BYTEBRIDGE`);
            console.log("=======================================================");
            console.log(`📌 Event ID:     ${eventId}`);
            console.log(`🏛️ Código Banco: ${bankCode}`);
            console.log(`💵 Moneda:       ${currencyHeader}`);
            console.log(`⏱️ Timestamp:    ${timestamp}`);
            console.log(`🔐 Firma HMAC:   ${signature}`);
            console.log(`✅ ¿Firma Válida?: ${isSignatureValid ? 'SÍ (AUTÉNTICO)' : 'NO (INVÁLIDO / CLAVE INCORRECTA)'}`);
            
            try {
                const parsed = JSON.parse(body);
                const isZelle = parsed.data?.currency === 'USD' || bankCode.startsWith('ZEL');
                const symbol = isZelle ? '$' : 'Bs.';

                console.log("\n📦 DATOS DEL PAGO CONCILIADO:");
                console.log(`   - Red / Banco: ${parsed.data?.bankName || parsed.data?.bank}`);
                console.log(`   - Monto:      ${symbol} ${parsed.data?.amount} ${parsed.data?.currency || 'VES'}`);
                console.log(`   - Referencia: ${parsed.data?.reference}`);
                if (parsed.data?.payerName) {
                    console.log(`   - Pagador:    ${parsed.data?.payerName} (Zelle)`);
                }
                if (parsed.data?.payerId) {
                    console.log(`   - Emisor CI:  ${parsed.data?.payerId}`);
                }
                if (parsed.data?.payerPhone) {
                    console.log(`   - Teléfono:   ${parsed.data?.payerPhone}`);
                }
                console.log(`   - Canal:      ${parsed.channel}`);
                console.log(`   - Negocio:    ${parsed.metadata?.businessName}`);
            } catch (e) {
                console.log("Cuerpo:", body);
            }
            console.log("=======================================================\n");

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: "success", 
                message: "Pago conciliado con éxito en el servidor",
                signatureVerified: isSignatureValid
            }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Endpoint no encontrado. Usa POST /api/v1/ingest/push" }));
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Servidor Webhook de Prueba escuchando en: http://localhost:${PORT}/api/v1/ingest/push`);
    console.log(`🔑 Clave Secreta API configurada: "${SECRET_API_KEY}"\n`);
});
