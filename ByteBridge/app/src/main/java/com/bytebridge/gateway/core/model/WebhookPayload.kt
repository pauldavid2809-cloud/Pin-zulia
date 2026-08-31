package com.bytebridge.gateway.core.model

import com.google.gson.annotations.SerializedName

data class WebhookPayload(
    @SerializedName("event")
    val event: String = "payment.received",
    
    @SerializedName("eventId")
    val eventId: String,
    
    @SerializedName("idempotencyKey")
    val idempotencyKey: String,
    
    @SerializedName("timestamp")
    val timestamp: Long,
    
    @SerializedName("channel")
    val channel: String,
    
    @SerializedName("data")
    val data: PaymentData,
    
    @SerializedName("metadata")
    val metadata: Metadata
)

data class PaymentData(
    @SerializedName("bank")
    val bank: String,
    
    @SerializedName("bankCode")
    val bankCode: String,
    
    @SerializedName("bankName")
    val bankName: String,
    
    @SerializedName("reference")
    val reference: String,
    
    @SerializedName("amount")
    val amount: Double,
    
    @SerializedName("currency")
    val currency: String = "VES",
    
    @SerializedName("payerName")
    val payerName: String?,
    
    @SerializedName("payerPhone")
    val payerPhone: String?,
    
    @SerializedName("payerId")
    val payerId: String?,
    
    @SerializedName("rawMessage")
    val rawMessage: String,
    
    @SerializedName("receivedAt")
    val receivedAt: Long
)

data class Metadata(
    @SerializedName("bridgeVersion")
    val bridgeVersion: String = "1.0.0",
    
    @SerializedName("businessName")
    val businessName: String,
    
    @SerializedName("deviceTimestamp")
    val deviceTimestamp: Long = System.currentTimeMillis()
)
