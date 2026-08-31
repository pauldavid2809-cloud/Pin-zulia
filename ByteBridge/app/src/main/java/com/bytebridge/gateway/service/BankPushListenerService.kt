package com.bytebridge.gateway.service

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.data.repository.PaymentRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class BankPushListenerService : NotificationListenerService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var repository: PaymentRepository

    override fun onCreate() {
        super.onCreate()
        repository = PaymentRepository(applicationContext)
        Log.i(TAG, "BankPushListenerService initialized")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: return
        val bank = Bank.fromPackage(packageName)

        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""
        val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString() ?: ""

        val fullContent = listOf(title, text, bigText, subText)
            .filter { it.isNotBlank() }
            .distinct()
            .joinToString(" ")

        if (fullContent.isBlank()) return

        // 1. Venezuelan Bank detection
        val isVenezuelanBank = bank != Bank.UNKNOWN && !bank.isZelle
        val isPagoMovilKeyword = fullContent.contains("pago", ignoreCase = true) ||
                fullContent.contains("recib", ignoreCase = true) ||
                fullContent.contains("transferencia", ignoreCase = true) ||
                fullContent.contains("crédito", ignoreCase = true) ||
                fullContent.contains("credito", ignoreCase = true) ||
                fullContent.contains("Bs", ignoreCase = true)

        // 2. Zelle detection (from US Banking apps, Gmail, Outlook, Messages)
        val isEmailApp = packageName in listOf("com.google.android.gm", "com.microsoft.office.outlook", "com.google.android.apps.messaging")
        val isZelleAlert = fullContent.contains("Zelle", ignoreCase = true) ||
                fullContent.contains("sent you $", ignoreCase = true) ||
                fullContent.contains("received $", ignoreCase = true) ||
                bank.isZelle

        val shouldProcess = isVenezuelanBank || isPagoMovilKeyword || (isEmailApp && isZelleAlert) || (bank.isZelle && isZelleAlert)

        if (shouldProcess) {
            Log.d(TAG, "Intercepted push from $packageName: $fullContent")
            serviceScope.launch {
                try {
                    repository.processRawPayment(
                        rawText = fullContent,
                        channel = IngestChannel.PUSH,
                        suggestedBank = bank,
                        senderOrPackage = packageName
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Error processing push payment", e)
                }
            }
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "Notification listener connected successfully")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.w(TAG, "Notification listener disconnected")
    }

    companion object {
        private const val TAG = "ByteBridge:Push"
    }
}
