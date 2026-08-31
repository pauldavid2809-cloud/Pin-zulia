package com.bytebridge.gateway.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.bytebridge.gateway.R
import com.bytebridge.gateway.core.model.PaymentTransaction
import com.bytebridge.gateway.core.util.CurrencyFormatter
import com.bytebridge.gateway.ui.MainActivity

object PaymentNotifier {

    const val PAYMENT_CHANNEL_ID = "bytebridge_payment_alerts"

    fun notifyPaymentSuccess(context: Context, transaction: PaymentTransaction) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createPaymentChannel(context)

        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            transaction.id.hashCode(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val formattedAmount = CurrencyFormatter.formatAmount(transaction.amount, transaction.currency)
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val notification = NotificationCompat.Builder(context, PAYMENT_CHANNEL_ID)
            .setContentTitle("✅ Pago Recibido: $formattedAmount")
            .setContentText("${transaction.bank.displayName} • Ref: ${transaction.reference}")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setSound(defaultSoundUri)
            .setVibrate(longArrayOf(0, 250, 100, 250)) // Gentle double vibration
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        manager.notify(transaction.id.hashCode(), notification)
    }

    private fun createPaymentChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                PAYMENT_CHANNEL_ID,
                "Alertas de Pagos Recibidos",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notificaciones de confirmación con sonido estándar y vibración suave"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 100, 250)
            }
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
