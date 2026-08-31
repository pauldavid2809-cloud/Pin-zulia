package com.bytebridge.gateway.core.parser

import java.util.regex.Pattern

object BankRegexRules {

    // --- GENERIC EXTRACTION REGEX PATTERNS ---
    val AMOUNT_PATTERN: Pattern = Pattern.compile(
        """(?i)(?:Bs\.?S?\.?|VES|\$|USD|monto\s*:?|por\s*:?)\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})|[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:[.,][0-9]{2})?)""",
        Pattern.CASE_INSENSITIVE
    )

    val REFERENCE_PATTERN: Pattern = Pattern.compile(
        """(?i)(?:ref(?:erencia)?\.?|nro\.?|operaci[oó]n|recibo|aprobaci[oó]n|conf(?:irmation)?(?:\s+code|\s+number|\s+#)?|trx|transaction\s+id)\s*[:#\-]?\s*([A-Za-z0-9]{6,18})""",
        Pattern.CASE_INSENSITIVE
    )

    val PHONE_PATTERN: Pattern = Pattern.compile(
        """(?i)(?:tlf\.?|tel[ée]fono\.?|cel\.?|desde|del)\s*[:#\-]?\s*(04(?:12|14|16|24|26)[0-9]{7})|(04(?:12|14|16|24|26)[-.\s][0-9]{3}[-.\s]?[0-9]{4})""",
        Pattern.CASE_INSENSITIVE
    )

    val CEDULA_PATTERN: Pattern = Pattern.compile(
        """(?i)(?:ci\.?|c[ée]dula\.?|rif\.?|identificaci[oó]n\.?)\s*[:#\-]?\s*([VEJPGvejpg][\-.]?[0-9]{6,9})|([VEJPGvejpg][0-9]{7,9})""",
        Pattern.CASE_INSENSITIVE
    )

    // --- ZELLE DEDICATED REGEX PATTERNS ---
    // Example: "Chase QuickPay: John Doe sent you $150.00 with Zelle. Confirmation: ZEL-982341"
    val ZELLE_SENT_YOU: Pattern = Pattern.compile(
        """(?i)(?:Chase|Alerts?|Notice|Notification|BofA|Wells\s*Fargo)?[:\-]?\s*([A-Za-z\s]+?)\s+sent\s+you\s+\$([0-9.,]+)(?:\s+(?:with|using)\s+Zelle)?""",
        Pattern.CASE_INSENSITIVE
    )

    // Example: "You received $85.00 from Maria Perez with Zelle. Ref: 2026083012"
    val ZELLE_RECEIVED_FROM: Pattern = Pattern.compile(
        """(?i)(?:you\s+)?received\s+\$([0-9.,]+)\s+from\s+([A-Za-z\s]+?)(?:\s+(?:with|using)\s+Zelle)""",
        Pattern.CASE_INSENSITIVE
    )

    // Example: "Zelle payment received for $50.00"
    val ZELLE_PAYMENT_GENERIC: Pattern = Pattern.compile(
        """(?i)Zelle(?:\s+payment)?(?:\s+received)?\s*(?:for|of)?\s*\$([0-9.,]+)""",
        Pattern.CASE_INSENSITIVE
    )

    // --- VENEZUELAN BANK SPECIALIZED PATTERNS ---

    // 1. BDV (Banco de Venezuela)
    val BDV_SMS_FULL: Pattern = Pattern.compile(
        """(?i)PagoClave\s+recibido\s+(?:por\s+)?(?:Bs\.?S?\.?\s*)?([0-9.,]+)\s+de\s+([0-9]+)\s+ci\s+([0-9]+)\s+ref\s+([0-9]{6,14})""",
        Pattern.CASE_INSENSITIVE
    )

    // 2. BANESCO
    val BANESCO_SMS_FULL: Pattern = Pattern.compile(
        """(?i)Banesco(?:PagoMovil)?:\s*Recibiste\s*(?:Bs\.?S?\.?\s*)?([0-9.,]+)(?:\s+de\s+([VEJPGvejpg\-0-9]+))?(?:\s+tlf\s+([0-9]+))?\s+Ref:\s*([0-9]{6,14})""",
        Pattern.CASE_INSENSITIVE
    )

    // 3. MERCANTIL (Tpago)
    val MERCANTIL_SMS_FULL: Pattern = Pattern.compile(
        """(?i)Tpago:\s*Recibiste\s+pago\s+de\s+([VEJPGvejpg\-0-9]+)\s+por\s+(?:Bs\.?S?\.?\s*)?([0-9.,]+)\.\s*Ref\.?\s*([0-9]{6,14})""",
        Pattern.CASE_INSENSITIVE
    )

    // 4. BANCAMIGA
    val BANCAMIGA_SMS_FULL: Pattern = Pattern.compile(
        """(?i)Bancamiga:\s*Ha\s+recibido\s+un\s+Pago\s*Movil\s+por\s+(?:Bs\.?S?\.?\s*)?([0-9.,]+)(?:\s+del\s+tlf\s+([0-9]+))?\s+ref:\s*([0-9]{6,14})""",
        Pattern.CASE_INSENSITIVE
    )

    // 5. BBVA PROVINCIAL
    val PROVINCIAL_SMS_FULL: Pattern = Pattern.compile(
        """(?i)(?:BBVA\s*)?Provincial:\s*Recibiste\s+(?:Bs\.?S?\.?\s*)?([0-9.,]+)\s+por\s+Dinero\s+Rapido(?:\s+de\s+([VEJPGvejpg\-0-9]+))?\.\s*Ref:\s*([0-9]{6,14})""",
        Pattern.CASE_INSENSITIVE
    )
}
