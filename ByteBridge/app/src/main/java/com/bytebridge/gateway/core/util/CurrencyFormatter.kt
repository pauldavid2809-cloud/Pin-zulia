package com.bytebridge.gateway.core.util

import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

object CurrencyFormatter {

    private val vesFormat: DecimalFormat by lazy {
        val symbols = DecimalFormatSymbols(Locale("es", "VE")).apply {
            groupingSeparator = '.'
            decimalSeparator = ','
        }
        DecimalFormat("#,##0.00", symbols)
    }

    private val usdFormat: DecimalFormat by lazy {
        val symbols = DecimalFormatSymbols(Locale.US).apply {
            groupingSeparator = ','
            decimalSeparator = '.'
        }
        DecimalFormat("#,##0.00", symbols)
    }

    fun formatVES(amount: Double): String {
        return "Bs. ${vesFormat.format(amount)}"
    }

    fun formatUSD(amount: Double): String {
        return "$${usdFormat.format(amount)}"
    }

    fun formatAmount(amount: Double, currency: String): String {
        return if (currency.equals("USD", ignoreCase = true) || currency == "$") {
            formatUSD(amount)
        } else {
            formatVES(amount)
        }
    }

    /**
     * Cleans and extracts a valid Double amount from a messy string.
     * Examples handled:
     * - "$150.00" -> 150.0
     * - "USD 85.50" -> 85.5
     * - "Bs. 19.791,75" -> 19791.75
     * - "19791.75" -> 19791.75
     */
    fun parseAmount(raw: String): Double? {
        val sanitized = raw.replace("(?i)Bs\\.?S?\\.?|VES|VEF|USD|\\$".toRegex(), "")
            .trim()
            .replace(" ", "")

        if (sanitized.isEmpty()) return null

        try {
            // Case 1: Standard Venezuelan format with dots for thousands and comma for decimal (19.791,75 or 19791,75)
            if (sanitized.contains(',')) {
                val normalized = sanitized.replace(".", "").replace(',', '.')
                return normalized.toDoubleOrNull()
            }

            // Case 2: Standard US format with commas for thousands and dot for decimal (19,791.75 or 150.00)
            if (sanitized.contains('.') && sanitized.contains(',')) {
                val normalized = sanitized.replace(",", "")
                return normalized.toDoubleOrNull()
            }

            // Case 3: Only contains dots (e.g. 150.00 or 19791.75 or 1.500)
            if (sanitized.contains('.')) {
                val parts = sanitized.split('.')
                return when {
                    parts.size > 2 -> sanitized.replace(".", "").toDoubleOrNull()
                    parts.last().length == 2 -> sanitized.toDoubleOrNull()
                    parts.last().length == 3 -> sanitized.replace(".", "").toDoubleOrNull()
                    else -> sanitized.toDoubleOrNull()
                }
            }

            // Case 4: Plain integer (e.g. "500")
            return sanitized.toDoubleOrNull()
        } catch (_: Exception) {
            return null
        }
    }
}
