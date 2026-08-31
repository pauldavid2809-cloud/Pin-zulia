package com.bytebridge.gateway.security

import com.bytebridge.gateway.core.security.HmacSigner
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class HmacSignerTest {

    @Test
    fun testHmacSigningAndVerification() {
        val payload = """{"event":"payment.received","amount":19791.75,"reference":"12345678"}"""
        val secretKey = "SECURE_BRIDGE_KEY_2026"

        val signature = HmacSigner.sign(payload, secretKey)
        assertNotNull(signature)
        assertTrue(signature.isNotEmpty())

        val isValid = HmacSigner.verify(payload, secretKey, signature)
        assertTrue(isValid)

        val isTamperedValid = HmacSigner.verify(payload + "tampered", secretKey, signature)
        assertFalse(isTamperedValid)
    }

    @Test
    fun testIdempotencyKeyGeneration() {
        val key1 = HmacSigner.generateIdempotencyKey("0102", "12345678", 19791.75)
        val key2 = HmacSigner.generateIdempotencyKey("0102", "12345678", 19791.75)
        val keyDifferent = HmacSigner.generateIdempotencyKey("0102", "12345679", 19791.75)

        assertEquals(key1, key2)
        assertNotEquals(key1, keyDifferent)
    }
}
