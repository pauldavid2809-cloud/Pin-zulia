package com.bytebridge.gateway.core.model

import java.util.UUID

enum class DeliveryStatus {
    PENDING,
    DELIVERED,
    FAILED,
    RETRYING,
    DUPLICATE,
    IGNORED
}

data class PaymentTransaction(
    val id: String = UUID.randomUUID().toString(),
    val idempotencyKey: String,
    val bank: Bank,
    val reference: String,
    val amount: Double,
    val currency: String = "VES",
    val payerName: String? = null,
    val payerPhone: String? = null,
    val payerId: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val channel: IngestChannel,
    val rawMessage: String,
    val status: DeliveryStatus = DeliveryStatus.PENDING,
    val deliveryLatencyMs: Long? = null,
    val httpStatusCode: Int? = null,
    val signature: String? = null,
    val retryCount: Int = 0,
    val errorMessage: String? = null
)
