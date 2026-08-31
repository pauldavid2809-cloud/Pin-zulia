package com.bytebridge.gateway.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.data.repository.PaymentRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class SMSReceiver : BroadcastReceiver() {

    private val receiverScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        try {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            if (messages.isNullOrEmpty()) return

            // Group multipart SMS by sender
            val messagesBySender = messages.groupBy { it.originatingAddress.orEmpty() }

            val repository = PaymentRepository(context.applicationContext)

            for ((sender, parts) in messagesBySender) {
                val fullBody = parts.joinToString("") { it.messageBody.orEmpty() }
                if (fullBody.isBlank()) continue

                val bank = Bank.fromSender(sender)
                val isBankSender = bank != Bank.UNKNOWN
                val isPaymentSms = fullBody.contains("pago", ignoreCase = true) ||
                        fullBody.contains("recibi", ignoreCase = true) ||
                        fullBody.contains("Bs", ignoreCase = true) ||
                        fullBody.contains("ref", ignoreCase = true)

                if (isBankSender || isPaymentSms) {
                    Log.d(TAG, "Intercepted SMS from $sender: $fullBody")
                    val pendingResult = goAsync()
                    receiverScope.launch {
                        try {
                            repository.processRawPayment(
                                rawText = fullBody,
                                channel = IngestChannel.SMS,
                                suggestedBank = bank,
                                senderOrPackage = sender
                            )
                        } catch (e: Exception) {
                            Log.e(TAG, "Error ingesting SMS payment", e)
                        } finally {
                            pendingResult.finish()
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error receiving SMS", e)
        }
    }

    companion object {
        private const val TAG = "ByteBridge:SMS"
    }
}
