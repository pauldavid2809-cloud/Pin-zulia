package com.bytebridge.gateway.util

import com.bytebridge.gateway.core.util.CurrencyFormatter
import org.junit.Assert.assertEquals
import org.junit.Test

class CurrencyFormatterTest {

    @Test
    fun testParseAmountFormats() {
        assertEquals(19791.75, CurrencyFormatter.parseAmount("Bs. 19.791,75")!!, 0.001)
        assertEquals(19791.75, CurrencyFormatter.parseAmount("Bs. 19,791.75")!!, 0.001)
        assertEquals(19791.75, CurrencyFormatter.parseAmount("19791,75")!!, 0.001)
        assertEquals(19791.75, CurrencyFormatter.parseAmount("19791.75")!!, 0.001)
        assertEquals(500.0, CurrencyFormatter.parseAmount("Bs. 500")!!, 0.001)
        assertEquals(1250.50, CurrencyFormatter.parseAmount("Bs. 1.250,50")!!, 0.001)
    }

    @Test
    fun testFormatVES() {
        val formatted = CurrencyFormatter.formatVES(19791.75)
        assertEquals("Bs. 19.791,75", formatted)
    }
}
