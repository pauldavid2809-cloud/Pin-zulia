package com.bytebridge.gateway.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.bytebridge.gateway.R
import com.bytebridge.gateway.core.util.CurrencyFormatter
import com.bytebridge.gateway.data.repository.PaymentRepository
import com.bytebridge.gateway.ui.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class DaemonForegroundService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var metricsCollectorJob: Job? = null
    private lateinit var repository: PaymentRepository

    override fun onCreate() {
        super.onCreate()
        repository = PaymentRepository(applicationContext)
        createNotificationChannels()
        startForeground(NOTIFICATION_ID, buildNotification("Iniciando daemon de conciliación..."))
        observeDailyMetrics()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    private fun observeDailyMetrics() {
        metricsCollectorJob?.cancel()
        metricsCollectorJob = serviceScope.launch {
            repository.getDailyMetricsFlow().collectLatest { metrics ->
                val text = if (metrics.deliveredCount > 0) {
                    "${metrics.deliveredCount} pagos hoy • ${CurrencyFormatter.formatVES(metrics.totalAmountVES)}"
                } else {
                    "Listo para conciliar pagos (Push y SMS)"
                }
                val notification = buildNotification(text)
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.notify(NOTIFICATION_ID, notification)
            }
        }
    }

    private fun buildNotification(contentText: String): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("ByteBridge Daemon Activo ⚡")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "ByteBridge Daemon",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Mantiene el servicio activo para conciliación instantánea"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        metricsCollectorJob?.cancel()
        super.onDestroy()
    }

    companion object {
        const val CHANNEL_ID = "bytebridge_daemon_channel"
        const val NOTIFICATION_ID = 1001

        fun start(context: Context) {
            val intent = Intent(context, DaemonForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, DaemonForegroundService::class.java)
            context.stopService(intent)
        }
    }
}
