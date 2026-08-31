package com.bytebridge.gateway.core.parser

import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.core.util.CurrencyFormatter

object BankParserEngine {

    // Negative debit keywords to reject immediately (Outgoing money, fees, debits)
    private val DEBIT_KEYWORDS = listOf(
        "transferiste",
        "has transferido",
        "enviaste",
        "has enviado",
        "débito",
        "debito",
        "cargo por",
        "comisión",
        "comision",
        "pago emitido",
        "retiro",
        "compra aprobada",
        "consumo con tarjeta"
    )

    /**
     * Parses raw incoming notification/SMS text and extracts structured transaction fields.
     */
    fun parse(
        content: String,
        channel: IngestChannel,
        suggestedBank: Bank = Bank.UNKNOWN,
        senderOrPackage: String? = null
    ): ParsedPaymentResult {
        val cleanText = content.trim().replace("\n", " ").replace("\r", " ")
        val lowerText = cleanText.lowercase()

        // 1. Strict Negative Debit Filter: Reject outgoing debits immediately
        if (DEBIT_KEYWORDS.any { lowerText.contains(it) }) {
            return ParsedPaymentResult(
                isSuccess = false,
                bank = suggestedBank,
                channel = channel,
                rawContent = cleanText,
                failureReason = "Notificación de débito o salida descartada (no es un pago recibido)"
            )
        }

        // 2. Identify or refine bank entity
        val detectedBank = when {
            suggestedBank != Bank.UNKNOWN -> suggestedBank
            !senderOrPackage.isNullOrBlank() -> {
                val fromPkg = Bank.fromPackage(senderOrPackage)
                if (fromPkg != Bank.UNKNOWN) fromPkg else Bank.fromSender(senderOrPackage)
            }
            else -> Bank.detectFromContent(cleanText)
        }.let { if (it == Bank.UNKNOWN) Bank.detectFromContent(cleanText) else it }

        // 3. Check if this is a Zelle transaction
        if (detectedBank.isZelle || cleanText.contains("Zelle", ignoreCase = true) || cleanText.contains("$")) {
            val zelleResult = tryZelleParse(cleanText, detectedBank, channel)
            if (zelleResult != null && zelleResult.isSuccess) {
                return zelleResult
            }
        }

        // 4. Try specialized Venezuelan bank-specific parser
        val specializedResult = trySpecializedParse(cleanText, detectedBank, channel)
        if (specializedResult != null && specializedResult.isSuccess) {
            return specializedResult
        }

        // 5. Fallback to modular heuristic extraction
        return heuristicParse(cleanText, detectedBank, channel)
    }

    private fun tryZelleParse(
        text: String,
        bank: Bank,
        channel: IngestChannel
    ): ParsedPaymentResult? {
        val finalBank = if (bank.isZelle) bank else Bank.ZELLE_GENERIC

        // 1. Pattern: "John Doe sent you $150.00 with Zelle"
        val sentMatcher = BankRegexRules.ZELLE_SENT_YOU.matcher(text)
        if (sentMatcher.find()) {
            val payerName = sentMatcher.group(1)?.trim()
            val amount = CurrencyFormatter.parseAmount(sentMatcher.group(2).orEmpty())
            val reference = extractReferenceOrGenerate(text)

            if (amount != null) {
                return ParsedPaymentResult(
                    isSuccess = true,
                    bank = finalBank,
                    amount = amount,
                    currency = "USD",
                    reference = reference,
                    payerName = payerName,
                    channel = channel,
                    rawContent = text,
                    confidence = 0.98f
                )
            }
        }

        // 2. Pattern: "You received $85.00 from Maria Perez with Zelle"
        val recMatcher = BankRegexRules.ZELLE_RECEIVED_FROM.matcher(text)
        if (recMatcher.find()) {
            val amount = CurrencyFormatter.parseAmount(recMatcher.group(1).orEmpty())
            val payerName = recMatcher.group(2)?.trim()
            val reference = extractReferenceOrGenerate(text)

            if (amount != null) {
                return ParsedPaymentResult(
                    isSuccess = true,
                    bank = finalBank,
                    amount = amount,
                    currency = "USD",
                    reference = reference,
                    payerName = payerName,
                    channel = channel,
                    rawContent = text,
                    confidence = 0.98f
                )
            }
        }

        // 3. Pattern: "Zelle payment received for $50.00"
        val genMatcher = BankRegexRules.ZELLE_PAYMENT_GENERIC.matcher(text)
        if (genMatcher.find()) {
            val amount = CurrencyFormatter.parseAmount(genMatcher.group(1).orEmpty())
            val reference = extractReferenceOrGenerate(text)

            if (amount != null) {
                return ParsedPaymentResult(
                    isSuccess = true,
                    bank = finalBank,
                    amount = amount,
                    currency = "USD",
                    reference = reference,
                    payerName = null,
                    channel = channel,
                    rawContent = text,
                    confidence = 0.90f
                )
            }
        }

        return null
    }

    private fun extractReferenceOrGenerate(text: String): String {
        val refMatcher = BankRegexRules.REFERENCE_PATTERN.matcher(text)
        if (refMatcher.find()) {
            return refMatcher.group(1).orEmpty()
        }
        val tokenMatcher = Regex("""\b([A-Z0-9]{6,16})\b""").findAll(text)
        for (m in tokenMatcher) {
            val v = m.value
            if (!v.equals("ZELLE", ignoreCase = true) && !v.equals("CHASE", ignoreCase = true) && !v.equals("ALERT", ignoreCase = true)) {
                return v
            }
        }
        return "ZEL-${Math.abs(text.hashCode()).toString().take(8)}"
    }

    private fun trySpecializedParse(
        text: String,
        bank: Bank,
        channel: IngestChannel
    ): ParsedPaymentResult? {
        when (bank) {
            Bank.BDV -> {
                val matcher = BankRegexRules.BDV_SMS_FULL.matcher(text)
                if (matcher.find()) {
                    val amount = CurrencyFormatter.parseAmount(matcher.group(1).orEmpty())
                    val phone = matcher.group(2)
                    val ci = matcher.group(3)?.let { "V-$it" }
                    val ref = matcher.group(4)

                    if (amount != null && !ref.isNullOrBlank()) {
                        return ParsedPaymentResult(
                            isSuccess = true,
                            bank = Bank.BDV,
                            amount = amount,
                            currency = "VES",
                            reference = ref,
                            payerPhone = phone,
                            payerId = ci,
                            channel = channel,
                            rawContent = text,
                            confidence = 0.98f
                        )
                    }
                }
            }

            Bank.BANESCO -> {
                val matcher = BankRegexRules.BANESCO_SMS_FULL.matcher(text)
                if (matcher.find()) {
                    val amount = CurrencyFormatter.parseAmount(matcher.group(1).orEmpty())
                    val ci = matcher.group(2)
                    val phone = matcher.group(3)
                    val ref = matcher.group(4)

                    if (amount != null && !ref.isNullOrBlank()) {
                        return ParsedPaymentResult(
                            isSuccess = true,
                            bank = Bank.BANESCO,
                            amount = amount,
                            currency = "VES",
                            reference = ref,
                            payerPhone = phone,
                            payerId = ci,
                            channel = channel,
                            rawContent = text,
                            confidence = 0.98f
                        )
                    }
                }
            }

            Bank.MERCANTIL -> {
                val matcher = BankRegexRules.MERCANTIL_SMS_FULL.matcher(text)
                if (matcher.find()) {
                    val ci = matcher.group(1)
                    val amount = CurrencyFormatter.parseAmount(matcher.group(2).orEmpty())
                    val ref = matcher.group(3)

                    if (amount != null && !ref.isNullOrBlank()) {
                        return ParsedPaymentResult(
                            isSuccess = true,
                            bank = Bank.MERCANTIL,
                            amount = amount,
                            currency = "VES",
                            reference = ref,
                            payerPhone = null,
                            payerId = ci,
                            channel = channel,
                            rawContent = text,
                            confidence = 0.98f
                        )
                    }
                }
            }

            Bank.BANCAMIGA -> {
                val matcher = BankRegexRules.BANCAMIGA_SMS_FULL.matcher(text)
                if (matcher.find()) {
                    val amount = CurrencyFormatter.parseAmount(matcher.group(1).orEmpty())
                    val phone = matcher.group(2)
                    val ref = matcher.group(3)

                    if (amount != null && !ref.isNullOrBlank()) {
                        return ParsedPaymentResult(
                            isSuccess = true,
                            bank = Bank.BANCAMIGA,
                            amount = amount,
                            currency = "VES",
                            reference = ref,
                            payerPhone = phone,
                            payerId = null,
                            channel = channel,
                            rawContent = text,
                            confidence = 0.98f
                        )
                    }
                }
            }

            Bank.BBVA_PROVINCIAL -> {
                val matcher = BankRegexRules.PROVINCIAL_SMS_FULL.matcher(text)
                if (matcher.find()) {
                    val amount = CurrencyFormatter.parseAmount(matcher.group(1).orEmpty())
                    val ci = matcher.group(2)
                    val ref = matcher.group(3)

                    if (amount != null && !ref.isNullOrBlank()) {
                        return ParsedPaymentResult(
                            isSuccess = true,
                            bank = Bank.BBVA_PROVINCIAL,
                            amount = amount,
                            currency = "VES",
                            reference = ref,
                            payerPhone = null,
                            payerId = ci,
                            channel = channel,
                            rawContent = text,
                            confidence = 0.98f
                        )
                    }
                }
            }

            else -> Unit
        }
        return null
    }

    private fun heuristicParse(
        text: String,
        bank: Bank,
        channel: IngestChannel
    ): ParsedPaymentResult {
        // 1. Extract Amount
        var amount: Double? = null
        val amountMatcher = BankRegexRules.AMOUNT_PATTERN.matcher(text)
        if (amountMatcher.find()) {
            amount = CurrencyFormatter.parseAmount(amountMatcher.group(1).orEmpty())
        }

        // 2. Extract Reference
        var reference: String? = null
        val refMatcher = BankRegexRules.REFERENCE_PATTERN.matcher(text)
        if (refMatcher.find()) {
            reference = refMatcher.group(1)
        } else {
            val digitsMatcher = Regex("""\b([0-9]{7,14})\b""").findAll(text)
            for (match in digitsMatcher) {
                val value = match.value
                if (!value.startsWith("041") && !value.startsWith("042") && !value.startsWith("202")) {
                    reference = value
                    break
                }
            }
        }

        // 3. Extract Phone
        var phone: String? = null
        val phoneMatcher = BankRegexRules.PHONE_PATTERN.matcher(text)
        if (phoneMatcher.find()) {
            phone = phoneMatcher.group(1) ?: phoneMatcher.group(2)
            phone = phone?.replace("[-.\\s]".toRegex(), "")
        }

        // 4. Extract Cédula
        var cedula: String? = null
        val cedulaMatcher = BankRegexRules.CEDULA_PATTERN.matcher(text)
        if (cedulaMatcher.find()) {
            cedula = cedulaMatcher.group(1) ?: cedulaMatcher.group(2)
        }

        val currency = if (text.contains("$") || text.contains("USD", ignoreCase = true) || bank.isZelle) "USD" else "VES"
        val isSuccess = amount != null && (!reference.isNullOrBlank() || bank.isZelle)
        val finalRef = reference ?: "REF-${Math.abs(text.hashCode()).toString().take(8)}"

        val confidence = when {
            isSuccess && bank != Bank.UNKNOWN && phone != null -> 0.90f
            isSuccess && bank != Bank.UNKNOWN -> 0.85f
            isSuccess -> 0.70f
            else -> 0.0f
        }

        return ParsedPaymentResult(
            isSuccess = isSuccess,
            bank = bank,
            amount = amount,
            currency = currency,
            reference = finalRef,
            payerPhone = phone,
            payerId = cedula,
            channel = channel,
            rawContent = text,
            confidence = confidence,
            failureReason = if (!isSuccess) {
                when {
                    amount == null && reference.isNullOrBlank() -> "No se detectó Monto ni Referencia"
                    amount == null -> "No se detectó el Monto ($ / Bs.)"
                    else -> "No se detectó el Número de Referencia"
                }
            } else null
        )
    }
}
