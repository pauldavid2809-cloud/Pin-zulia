package com.bytebridge.gateway.data.remote

import com.bytebridge.gateway.core.model.BusinessConfig
import com.bytebridge.gateway.core.model.Metadata
import com.bytebridge.gateway.core.model.PaymentData
import com.bytebridge.gateway.core.model.PaymentTransaction
import com.bytebridge.gateway.core.model.WebhookPayload
import com.bytebridge.gateway.core.security.HmacSigner
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

data class DispatchResult(
    val isSuccess: Boolean,
    val statusCode: Int?,
    val latencyMs: Long,
    val signature: String,
    val errorMessage: String? = null
)

class WebhookDispatcher(
    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .writeTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build(),
    private val gson: Gson = GsonBuilder().create()
) {

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun dispatch(
        transaction: PaymentTransaction,
        config: BusinessConfig
    ): DispatchResult = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()

        if (config.webhookUrl.isBlank()) {
            return@withContext DispatchResult(
                isSuccess = false,
                statusCode = null,
                latencyMs = 0L,
                signature = "",
                errorMessage = "URL de Webhook no configurada en ByteBridge"
            )
        }

        try {
            val payload = WebhookPayload(
                event = "payment.received",
                eventId = transaction.id,
                idempotencyKey = transaction.idempotencyKey,
                timestamp = transaction.timestamp,
                channel = transaction.channel.tag,
                data = PaymentData(
                    bank = transaction.bank.name,
                    bankCode = transaction.bank.code,
                    bankName = transaction.bank.displayName,
                    reference = transaction.reference,
                    amount = transaction.amount,
                    currency = transaction.currency,
                    payerName = transaction.payerName,
                    payerPhone = transaction.payerPhone,
                    payerId = transaction.payerId,
                    rawMessage = transaction.rawMessage,
                    receivedAt = transaction.timestamp
                ),
                metadata = Metadata(
                    bridgeVersion = "1.0.0",
                    businessName = config.businessName,
                    deviceTimestamp = System.currentTimeMillis()
                )
            )

            val jsonBody = gson.toJson(payload)
            val signature = HmacSigner.sign(jsonBody, config.apiKey)
            val timestampStr = transaction.timestamp.toString()

            val requestBuilder = Request.Builder()
                .url(config.webhookUrl)
                .post(jsonBody.toRequestBody(jsonMediaType))
                .addHeader("Content-Type", "application/json")
                .addHeader("X-ByteBridge-Signature", signature)
                .addHeader("X-ByteBridge-Timestamp", timestampStr)
                .addHeader("X-ByteBridge-Event-ID", transaction.id)
                .addHeader("X-ByteBridge-Idempotency-Key", transaction.idempotencyKey)
                .addHeader("X-ByteBridge-Bank", transaction.bank.code)
                .addHeader("X-ByteBridge-Currency", transaction.currency)
                .addHeader("User-Agent", "ByteBridge-Android/1.0.0")

            if (config.apiKey.isNotBlank()) {
                requestBuilder.addHeader("Authorization", "Bearer ${config.apiKey}")
            }

            val request = requestBuilder.build()
            val response = okHttpClient.newCall(request).execute()
            val latency = System.currentTimeMillis() - startTime
            val statusCode = response.code
            val isSuccessful = response.isSuccessful

            response.close()

            DispatchResult(
                isSuccess = isSuccessful,
                statusCode = statusCode,
                latencyMs = latency,
                signature = signature,
                errorMessage = if (!isSuccessful) "HTTP Error $statusCode: ${response.message}" else null
            )
        } catch (e: Exception) {
            val latency = System.currentTimeMillis() - startTime
            DispatchResult(
                isSuccess = false,
                statusCode = null,
                latencyMs = latency,
                signature = "",
                errorMessage = e.localizedMessage ?: "Fallo de conexión de red"
            )
        }
    }

    suspend fun pingWebhook(config: BusinessConfig): DispatchResult = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()
        if (config.webhookUrl.isBlank()) {
            return@withContext DispatchResult(
                isSuccess = false,
                statusCode = null,
                latencyMs = 0L,
                signature = "",
                errorMessage = "URL de Webhook vacía"
            )
        }

        try {
            val pingPayload = mapOf(
                "event" to "bridge.ping",
                "timestamp" to System.currentTimeMillis(),
                "businessName" to config.businessName,
                "version" to "1.0.0"
            )
            val jsonBody = gson.toJson(pingPayload)
            val signature = HmacSigner.sign(jsonBody, config.apiKey)

            val request = Request.Builder()
                .url(config.webhookUrl)
                .post(jsonBody.toRequestBody(jsonMediaType))
                .addHeader("Content-Type", "application/json")
                .addHeader("X-ByteBridge-Signature", signature)
                .addHeader("X-ByteBridge-Event-ID", "ping-${System.currentTimeMillis()}")
                .build()

            val response = okHttpClient.newCall(request).execute()
            val latency = System.currentTimeMillis() - startTime
            val code = response.code
            val isSuccess = response.isSuccessful
            response.close()

            DispatchResult(
                isSuccess = isSuccess,
                statusCode = code,
                latencyMs = latency,
                signature = signature,
                errorMessage = if (!isSuccess) "HTTP $code" else null
            )
        } catch (e: Exception) {
            DispatchResult(
                isSuccess = false,
                statusCode = null,
                latencyMs = System.currentTimeMillis() - startTime,
                signature = "",
                errorMessage = e.localizedMessage ?: "Error al conectar con endpoint"
            )
        }
    }
}
