package com.bytebridge.gateway.core.model

import com.google.gson.annotations.SerializedName

data class BusinessConfig(
    @SerializedName("businessName")
    val businessName: String = "Negocio Principal",
    
    @SerializedName("webhookUrl")
    val webhookUrl: String = "",
    
    @SerializedName("apiKey")
    val apiKey: String = "",
    
    @SerializedName("isActive")
    val isActive: Boolean = true,
    
    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis()
)
