package com.bytebridge.gateway

import android.app.Application
import android.util.Log
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.bytebridge.gateway.data.preference.AppPreferences
import com.bytebridge.gateway.service.DaemonForegroundService
import com.bytebridge.gateway.service.worker.RetryWebhookWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class ByteBridgeApp : Application() {

    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    override fun onCreate() {
        super.onCreate()
        Log.i("ByteBridgeApp", "Initializing ByteBridge Gateway...")

        setupPeriodicRetryWork()

        appScope.launch {
            val preferences = AppPreferences(applicationContext)
            val isDaemonEnabled = preferences.isDaemonRunningFlow.first()
            if (isDaemonEnabled) {
                DaemonForegroundService.start(applicationContext)
            }
        }
    }

    private fun setupPeriodicRetryWork() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val retryRequest = PeriodicWorkRequestBuilder<RetryWebhookWorker>(
            repeatInterval = 15,
            repeatIntervalTimeUnit = TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "ByteBridgeRetryWorker",
            ExistingPeriodicWorkPolicy.KEEP,
            retryRequest
        )
    }
}
