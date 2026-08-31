package com.bytebridge.gateway.core.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object DateTimeUtils {

    private val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    private val fullDateTimeFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

    fun formatTime(timestamp: Long): String {
        return timeFormat.format(Date(timestamp))
    }

    fun formatFullDateTime(timestamp: Long): String {
        return fullDateTimeFormat.format(Date(timestamp))
    }

    fun getRelativeTimeSpan(timestamp: Long): String {
        val diff = System.currentTimeMillis() - timestamp
        val seconds = diff / 1000
        val minutes = seconds / 60
        val hours = minutes / 60
        val days = hours / 24

        return when {
            seconds < 5 -> "Justo ahora"
            seconds < 60 -> "Hace ${seconds}s"
            minutes < 60 -> "Hace ${minutes}m"
            hours < 24 -> "Hace ${hours}h"
            days == 1L -> "Ayer"
            else -> "Hace ${days}d"
        }
    }
}
