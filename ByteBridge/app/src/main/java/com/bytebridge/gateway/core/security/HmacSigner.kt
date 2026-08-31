package com.bytebridge.gateway.core.security

import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object HmacSigner {

    private const val HMAC_SHA256 = "HmacSHA256"

    /**
     * Computes the HMAC-SHA256 signature for a given payload and secret key.
     * Output format: lowercase hexadecimal string.
     */
    fun sign(payload: String, secretKey: String): String {
        if (secretKey.isBlank()) return ""
        val keySpec = SecretKeySpec(secretKey.toByteArray(Charsets.UTF_8), HMAC_SHA256)
        val mac = Mac.getInstance(HMAC_SHA256)
        mac.init(keySpec)
        val hmacBytes = mac.doFinal(payload.toByteArray(Charsets.UTF_8))
        return bytesToHex(hmacBytes)
    }

    /**
     * Verifies if a given signature matches the computed signature for payload.
     */
    fun verify(payload: String, secretKey: String, signature: String): Boolean {
        if (secretKey.isBlank() || signature.isBlank()) return false
        val expected = sign(payload, secretKey)
        return MessageDigest.isEqual(expected.toByteArray(), signature.toByteArray())
    }

    /**
     * Generates a unique SHA-256 idempotency key from bank code, reference, amount and date.
     */
    fun generateIdempotencyKey(bankCode: String, reference: String, amount: Double): String {
        val raw = "$bankCode:$reference:${"%.2f".format(java.util.Locale.US, amount)}"
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(raw.toByteArray(Charsets.UTF_8))
        return bytesToHex(hash).take(24)
    }

    private fun bytesToHex(bytes: ByteArray): String {
        val sb = StringBuilder(bytes.size * 2)
        for (b in bytes) {
            sb.append(String.format("%02x", b.toInt() and 0xFF))
        }
        return sb.toString()
    }
}
