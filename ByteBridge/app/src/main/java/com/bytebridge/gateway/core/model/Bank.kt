package com.bytebridge.gateway.core.model

/**
 * Supported Banking Entities & Payment Networks (Venezuela Pago Móvil & US Zelle Networks).
 */
enum class Bank(
    val code: String,
    val displayName: String,
    val shortName: String,
    val packageName: String,
    val smsSenders: List<String>,
    val brandHexColor: Long,
    val defaultCurrency: String = "VES"
) {
    // --- VENEZUELAN BANKS (PAGO MÓVIL) ---
    BDV(
        code = "0102",
        displayName = "Banco de Venezuela",
        shortName = "BDV",
        packageName = "com.bancodevenezuela.bdvapp",
        smsSenders = listOf("2661", "2662", "BDV", "BDVApp", "PAGOMOVILBDV"),
        brandHexColor = 0xFF004F9F,
        defaultCurrency = "VES"
    ),
    BANESCO(
        code = "0134",
        displayName = "Banesco Banco Universal",
        shortName = "Banesco",
        packageName = "com.banesco.banescomovil",
        smsSenders = listOf("0134", "2846", "BANESCO", "BanescoMovil"),
        brandHexColor = 0xFF007833,
        defaultCurrency = "VES"
    ),
    MERCANTIL(
        code = "0105",
        displayName = "Banco Mercantil",
        shortName = "Mercantil",
        packageName = "com.mercantil.tpago",
        smsSenders = listOf("24024", "TPAGO", "MERCANTIL", "MercantilMovil"),
        brandHexColor = 0xFF003882,
        defaultCurrency = "VES"
    ),
    BANCAMIGA(
        code = "0172",
        displayName = "Bancamiga Banco Universal",
        shortName = "Bancamiga",
        packageName = "com.bancamiga.bancamigamovil",
        smsSenders = listOf("BANCAMIGA", "8900", "BancamigaMovil"),
        brandHexColor = 0xFFE30613,
        defaultCurrency = "VES"
    ),
    BBVA_PROVINCIAL(
        code = "0108",
        displayName = "BBVA Provincial",
        shortName = "Provincial",
        packageName = "com.bbva.provinet",
        smsSenders = listOf("1339", "PROVINET", "BBVA", "DINERORAPIDO"),
        brandHexColor = 0xFF004481,
        defaultCurrency = "VES"
    ),
    BNC(
        code = "0191",
        displayName = "Banco Nacional de Crédito",
        shortName = "BNC",
        packageName = "com.bnc.bncenlinea",
        smsSenders = listOf("BNC", "BNCMOVIL", "0191"),
        brandHexColor = 0xFF006738,
        defaultCurrency = "VES"
    ),
    BANCARIBE(
        code = "0114",
        displayName = "Bancaribe",
        shortName = "Bancaribe",
        packageName = "com.bancaribe.movil",
        smsSenders = listOf("2274", "BANCARIBE", "MIPAGO"),
        brandHexColor = 0xFF1A3A8F,
        defaultCurrency = "VES"
    ),

    // --- US BANKS & ZELLE NETWORKS (USD) ---
    ZELLE_CHASE(
        code = "ZEL_CHASE",
        displayName = "Zelle (Chase Bank)",
        shortName = "Zelle Chase",
        packageName = "com.chase.sig.android",
        smsSenders = listOf("24273", "CHASE", "ChaseAlerts"),
        brandHexColor = 0xFF7414CA,
        defaultCurrency = "USD"
    ),
    ZELLE_BOFA(
        code = "ZEL_BOFA",
        displayName = "Zelle (Bank of America)",
        shortName = "Zelle BofA",
        packageName = "com.infonow.bofa",
        smsSenders = listOf("73981", "BOFA", "BankOfAmerica"),
        brandHexColor = 0xFFE31837,
        defaultCurrency = "USD"
    ),
    ZELLE_WELLS_FARGO(
        code = "ZEL_WF",
        displayName = "Zelle (Wells Fargo)",
        shortName = "Zelle WF",
        packageName = "com.wf.wellsfargomobile",
        smsSenders = listOf("93557", "WELLS", "WellsFargo"),
        brandHexColor = 0xFFCD1309,
        defaultCurrency = "USD"
    ),
    ZELLE_CITI(
        code = "ZEL_CITI",
        displayName = "Zelle (Citi Mobile)",
        shortName = "Zelle Citi",
        packageName = "com.citi.citimobile",
        smsSenders = listOf("248422", "CITI"),
        brandHexColor = 0xFF003B70,
        defaultCurrency = "USD"
    ),
    ZELLE_GENERIC(
        code = "ZEL_GEN",
        displayName = "Zelle Pay Network",
        shortName = "Zelle",
        packageName = "com.zellepay.zelle",
        smsSenders = listOf("ZELLE", "ZellePay"),
        brandHexColor = 0xFF7414CA,
        defaultCurrency = "USD"
    ),

    UNKNOWN(
        code = "0000",
        displayName = "Banco Desconocido / Genérico",
        shortName = "Genérico",
        packageName = "",
        smsSenders = emptyList(),
        brandHexColor = 0xFF64748B,
        defaultCurrency = "VES"
    );

    val isZelle: Boolean
        get() = this in listOf(ZELLE_CHASE, ZELLE_BOFA, ZELLE_WELLS_FARGO, ZELLE_CITI, ZELLE_GENERIC)

    companion object {
        private val PACKAGE_MAP = entries.filter { it.packageName.isNotEmpty() }
            .associateBy { it.packageName }

        fun fromPackage(packageName: String): Bank {
            return PACKAGE_MAP[packageName] ?: UNKNOWN
        }

        fun fromSender(sender: String): Bank {
            val normalizedSender = sender.trim().uppercase()
            return entries.firstOrNull { bank ->
                bank.smsSenders.any { normalizedSender.contains(it) || it.contains(normalizedSender) }
            } ?: UNKNOWN
        }

        fun detectFromContent(content: String): Bank {
            val upper = content.uppercase()
            return when {
                // Zelle Patterns
                upper.contains("ZELLE") -> when {
                    upper.contains("CHASE") -> ZELLE_CHASE
                    upper.contains("BANK OF AMERICA") || upper.contains("BOFA") -> ZELLE_BOFA
                    upper.contains("WELLS FARGO") || upper.contains("WELLS") -> ZELLE_WELLS_FARGO
                    upper.contains("CITI") -> ZELLE_CITI
                    else -> ZELLE_GENERIC
                }
                upper.contains("CHASE") && upper.contains("SENT YOU") -> ZELLE_CHASE
                upper.contains("BOFA") && (upper.contains("RECEIVED") || upper.contains("SENT")) -> ZELLE_BOFA

                // Venezuelan Banks Patterns
                upper.contains("BDV") || upper.contains("BANCO DE VENEZUELA") || upper.contains("PAGOCLAVE") -> BDV
                upper.contains("BANESCO") || upper.contains("PAGOMOVIL BANESCO") -> BANESCO
                upper.contains("MERCANTIL") || upper.contains("TPAGO") -> MERCANTIL
                upper.contains("BANCAMIGA") || upper.contains("PAGO MOVIL BANCAMIGA") -> BANCAMIGA
                upper.contains("PROVINCIAL") || upper.contains("BBVA") || upper.contains("DINERO RAPIDO") -> BBVA_PROVINCIAL
                upper.contains("BNC") || upper.contains("NACIONAL DE CREDITO") -> BNC
                upper.contains("BANCARIBE") || upper.contains("MI PAGO BANCARIBE") -> BANCARIBE
                else -> UNKNOWN
            }
        }
    }
}
