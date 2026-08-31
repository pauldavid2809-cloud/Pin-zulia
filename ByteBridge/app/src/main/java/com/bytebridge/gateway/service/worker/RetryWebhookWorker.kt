package com.bytebridge.gateway.service.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.bytebridge.gateway.core.model.DeliveryStatus
import com.bytebridge.gateway.data.local.AppDatabase
import com.bytebridge.gateway.data.preference.AppPreferences
import com.bytebridge.gateway.data.remote.WebhookDispatcher
import kotlinx.coroutines.flow.first

class RetryWebhookWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val database = AppDatabase.getDatabase(applicationContext)
        val dao = database.paymentTransactionDao()
        val preferences = AppPreferences(applicationContext)
        val dispatcher = WebhookDispatcher()

        val pendingList = dao.getPendingTransactions()
        if (pendingList.isEmpty()) return Result.success()

        val config = preferences.businessConfigFlow.first()
        if (!config.isActive || config.webhookUrl.isBlank()) {
            return Result.retry()
        }

        var anyFailed = false

        for (item in pendingList) {
            val dispatchResult = dispatcher.dispatch(item.toDomain(), config)
            if (dispatchResult.isSuccess) {
                dao.updateDeliveryStatus(
                    id = item.id,
                    status = DeliveryStatus.DELIVERED,
                    latencyMs = dispatchResult.latencyMs,
                    statusCode = dispatchResult.statusCode,
                    errorMessage = null
                )
            } else {
                anyFailed = true
                dao.updateDeliveryStatus(
                    id = item.id,
                    status = DeliveryStatus.FAILED,
                    latencyMs = dispatchResult.latencyMs,
                    statusCode = dispatchResult.statusCode,
                    errorMessage = dispatchResult.errorMessage
                )
            }
        }

        return if (anyFailed) Result.retry() else Result.success()
    }
}
