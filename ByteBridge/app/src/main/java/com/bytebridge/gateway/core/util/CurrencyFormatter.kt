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
     * Cleans and extracts a valid Double amount from any string format.
     */
    fun parseAmount(raw: String): Double? {
        val sanitized = raw.replace("(?i)Bs\\.?S?\\.?|VES|VEF|USD|\\$".toRegex(), "")
            .trim()
            .replace(" ", "")

        if (sanitized.isEmpty()) return null

        try {
            // Case 1: Both dot and comma present (determine decimal separator by position)
            if (sanitized.contains('.') && sanitized.contains(',')) {
                val lastDot = sanitized.lastIndexOf('.')
                val lastComma = sanitized.lastIndexOf(',')
                val normalized = if (lastComma > lastDot) {
                    // Venezuelan format: 19.791,75 -> 19791.75
                    sanitized.replace(".", "").replace(',', '.')
                } else {
                    // US format: 19,791.75 -> 19791.75
                    sanitized.replace(",", "")
                }
                return normalized.toDoubleOrNull()
            }

            // Case 2: Only contains comma (e.g. 19791,75 or 1,50)
            if (sanitized.contains(',')) {
                val parts = sanitized.split(',')
                return if (parts.size > 2) {
                    sanitized.replace(",", "").toDoubleOrNull()
                } else {
                    sanitized.replace(',', '.').toDoubleOrNull()
                }
            }

            // Case 3: Only contains dot (e.g. 150.00 or 19791.75 or 1.500)
            if (sanitized.contains('.')) {
                val parts = sanitized.split('.')
                return when {
                    parts.size > 2 -> sanitized.replace(".", "").toDoubleOrNull()
                    parts.last().length == 3 && sanitized.length > 5 -> sanitized.replace(".", "").toDoubleOrNull()
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
