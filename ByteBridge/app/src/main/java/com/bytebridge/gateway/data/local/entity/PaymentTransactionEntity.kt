package com.bytebridge.gateway.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.DeliveryStatus
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.core.model.PaymentTransaction

@Entity(
    tableName = "payment_transactions",
    indices = [
        Index(value = ["idempotencyKey"], unique = true),
        Index(value = ["bank", "reference"]),
        Index(value = ["status"]),
        Index(value = ["timestamp"])
    ]
)
data class PaymentTransactionEntity(
    @PrimaryKey
    val id: String,
    val idempotencyKey: String,
    val bank: Bank,
    val reference: String,
    val amount: Double,
    val currency: String,
    val payerName: String?,
    val payerPhone: String?,
    val payerId: String?,
    val timestamp: Long,
    val channel: IngestChannel,
    val rawMessage: String,
    val status: DeliveryStatus,
    val deliveryLatencyMs: Long?,
    val httpStatusCode: Int?,
    val signature: String?,
    val retryCount: Int,
    val errorMessage: String?
) {
    fun toDomain(): PaymentTransaction = PaymentTransaction(
        id = id,
        idempotencyKey = idempotencyKey,
        bank = bank,
        reference = reference,
        amount = amount,
        currency = currency,
        payerName = payerName,
        payerPhone = payerPhone,
        payerId = payerId,
        timestamp = timestamp,
        channel = channel,
        rawMessage = rawMessage,
        status = status,
        deliveryLatencyMs = deliveryLatencyMs,
        httpStatusCode = httpStatusCode,
        signature = signature,
        retryCount = retryCount,
        errorMessage = errorMessage
    )

    companion object {
        fun fromDomain(domain: PaymentTransaction): PaymentTransactionEntity = PaymentTransactionEntity(
            id = domain.id,
            idempotencyKey = domain.idempotencyKey,
            bank = domain.bank,
            reference = domain.reference,
            amount = domain.amount,
            currency = domain.currency,
            payerName = domain.payerName,
            payerPhone = domain.payerPhone,
            payerId = domain.payerId,
            timestamp = domain.timestamp,
            channel = domain.channel,
            rawMessage = domain.rawMessage,
            status = domain.status,
            deliveryLatencyMs = domain.deliveryLatencyMs,
            httpStatusCode = domain.httpStatusCode,
            signature = domain.signature,
            retryCount = domain.retryCount,
            errorMessage = domain.errorMessage
        )
    }
}
