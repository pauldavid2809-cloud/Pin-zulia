package com.bytebridge.gateway.core.parser

import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.IngestChannel

data class ParsedPaymentResult(
    val isSuccess: Boolean,
    val bank: Bank,
    val amount: Double? = null,
    val currency: String = "VES",
    val reference: String? = null,
    val payerName: String? = null,
    val payerPhone: String? = null,
    val payerId: String? = null,
    val channel: IngestChannel,
    val rawContent: String,
    val confidence: Float = 0.0f,
    val failureReason: String? = null
)
