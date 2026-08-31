package com.bytebridge.gateway.core.model

enum class IngestChannel(val displayName: String, val tag: String) {
    PUSH("Push Notification", "PUSH"),
    SMS("SMS Bancario", "SMS"),
    MANUAL_SIMULATION("Simulación Manual", "SIMULATOR")
}
