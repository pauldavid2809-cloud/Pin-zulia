package com.bytebridge.gateway.parser

import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.core.parser.BankParserEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class BankParserEngineTest {

    // --- DEBIT NEGATIVE FILTER TESTS ---

    @Test
    fun testRejectOutgoingDebitNotification() {
        val debitSms = "Banesco: Has transferido Bs. 500,00 a V-12345678. Ref: 99887766"
        val result = BankParserEngine.parse(
            content = debitSms,
            channel = IngestChannel.SMS,
            suggestedBank = Bank.BANESCO
        )

        assertFalse(result.isSuccess)
        assertTrue(result.failureReason!!.contains("débito"))
    }

    @Test
    fun testRejectBankFeeCharge() {
        val feeSms = "BDV: Cargo por comisión de mantenimiento de cuenta Bs. 45,00. Ref 11223344"
        val result = BankParserEngine.parse(
            content = feeSms,
            channel = IngestChannel.SMS,
            suggestedBank = Bank.BDV
        )

        assertFalse(result.isSuccess)
    }

    // --- ZELLE UNIT TESTS ---

    @Test
    fun testChaseZelleAlertParser() {
        val raw = "Chase Alerts: John Doe sent you $150.00 with Zelle. Confirmation: ZEL-982341"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.PUSH,
            suggestedBank = Bank.ZELLE_CHASE,
            senderOrPackage = "com.chase.sig.android"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.ZELLE_CHASE, result.bank)
        assertEquals(150.00, result.amount!!, 0.001)
        assertEquals("USD", result.currency)
        assertEquals("ZEL-982341", result.reference)
        assertEquals("John Doe", result.payerName)
    }

    @Test
    fun testBofAZelleParser() {
        val raw = "Bank of America: You received $85.00 from Maria Perez with Zelle. Ref: 2026083012"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.PUSH,
            suggestedBank = Bank.ZELLE_BOFA,
            senderOrPackage = "com.infonow.bofa"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.ZELLE_BOFA, result.bank)
        assertEquals(85.00, result.amount!!, 0.001)
        assertEquals("USD", result.currency)
        assertEquals("2026083012", result.reference)
        assertEquals("Maria Perez", result.payerName)
    }

    @Test
    fun testGmailZelleNotificationParser() {
        val raw = "Zelle: Robert Smith sent you $120.00 with Zelle. Funds are available in your account."
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.PUSH,
            suggestedBank = Bank.UNKNOWN,
            senderOrPackage = "com.google.android.gm"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.ZELLE_GENERIC, result.bank)
        assertEquals(120.00, result.amount!!, 0.001)
        assertEquals("USD", result.currency)
        assertEquals("Robert Smith", result.payerName)
        assertNotNull(result.reference)
    }

    // --- VENEZUELAN BANKS (PAGO MÓVIL) UNIT TESTS ---

    @Test
    fun testBdvSmsParser() {
        val raw = "PagoClave recibido por Bs. 19.791,75 de 04141234567 ci 12345678 ref 123456789012 al 30/08/2026 14:20"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.SMS,
            suggestedBank = Bank.BDV,
            senderOrPackage = "2661"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.BDV, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("123456789012", result.reference)
        assertEquals("04141234567", result.payerPhone)
        assertEquals("V-12345678", result.payerId)
    }

    @Test
    fun testBdvPushNotificationParser() {
        val raw = "Pago Móvil BDV recibido: Ha recibido un pago por Bs. 19.791,75 de V-12345678. Referencia: 123456789012"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.PUSH,
            suggestedBank = Bank.UNKNOWN,
            senderOrPackage = "com.bancodevenezuela.bdvapp"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.BDV, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("123456789012", result.reference)
        assertEquals("V-12345678", result.payerId)
    }

    @Test
    fun testBanescoSmsParser() {
        val raw = "BanescoPagoMovil: Recibiste Bs. 19.791,75 de V-12345678 tlf 04141234567 Ref: 0123456789 el 30/08/2026"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.SMS,
            suggestedBank = Bank.BANESCO,
            senderOrPackage = "0134"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.BANESCO, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("0123456789", result.reference)
        assertEquals("04141234567", result.payerPhone)
    }

    @Test
    fun testMercantilTpagoParser() {
        val raw = "Tpago: Recibiste pago de V-12345678 por Bs. 19.791,75. Ref. 123456789. Mercantil"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.SMS,
            suggestedBank = Bank.MERCANTIL,
            senderOrPackage = "24024"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.MERCANTIL, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("123456789", result.reference)
        assertEquals("V-12345678", result.payerId)
    }

    @Test
    fun testBancamigaPushParser() {
        val raw = "Bancamiga: Ha recibido un Pago Movil por Bs. 19.791,75 del tlf 04141234567 ref: 0098765432"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.PUSH,
            suggestedBank = Bank.BANCAMIGA,
            senderOrPackage = "com.bancamiga.bancamigamovil"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.BANCAMIGA, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("0098765432", result.reference)
        assertEquals("04141234567", result.payerPhone)
    }

    @Test
    fun testBbvaProvincialParser() {
        val raw = "BBVA Provincial: Recibiste Bs. 19.791,75 por Dinero Rapido de V12345678. Ref: 123456789"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.PUSH,
            suggestedBank = Bank.BBVA_PROVINCIAL,
            senderOrPackage = "com.bbva.provinet"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.BBVA_PROVINCIAL, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("123456789", result.reference)
    }

    @Test
    fun testBncParser() {
        val raw = "BNC: Pago Movil Recibido por Bs. 19.791,75 de V12345678 tlf 04141234567 ref 1234567890"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.SMS,
            suggestedBank = Bank.BNC,
            senderOrPackage = "BNC"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.BNC, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("1234567890", result.reference)
    }

    @Test
    fun testBancaribeParser() {
        val raw = "Bancaribe: Recibio Pago Movil por Bs. 19.791,75 de V-12345678 Ref: 123456789"
        val result = BankParserEngine.parse(
            content = raw,
            channel = IngestChannel.PUSH,
            suggestedBank = Bank.BANCARIBE,
            senderOrPackage = "com.bancaribe.movil"
        )

        assertTrue(result.isSuccess)
        assertEquals(Bank.BANCARIBE, result.bank)
        assertEquals(19791.75, result.amount!!, 0.001)
        assertEquals("VES", result.currency)
        assertEquals("123456789", result.reference)
    }
}
