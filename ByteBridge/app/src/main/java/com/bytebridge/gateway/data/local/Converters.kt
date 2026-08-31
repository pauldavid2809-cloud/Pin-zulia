package com.bytebridge.gateway.data.local

import androidx.room.TypeConverter
import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.DeliveryStatus
import com.bytebridge.gateway.core.model.IngestChannel

class Converters {

    @TypeConverter
    fun fromBank(bank: Bank): String = bank.name

    @TypeConverter
    fun toBank(value: String): Bank = try {
        Bank.valueOf(value)
    } catch (_: Exception) {
        Bank.UNKNOWN
    }

    @TypeConverter
    fun fromChannel(channel: IngestChannel): String = channel.name

    @TypeConverter
    fun toChannel(value: String): IngestChannel = try {
        IngestChannel.valueOf(value)
    } catch (_: Exception) {
        IngestChannel.PUSH
    }

    @TypeConverter
    fun fromDeliveryStatus(status: DeliveryStatus): String = status.name

    @TypeConverter
    fun toDeliveryStatus(value: String): DeliveryStatus = try {
        DeliveryStatus.valueOf(value)
    } catch (_: Exception) {
        DeliveryStatus.PENDING
    }
}
