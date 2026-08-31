package com.bytebridge.gateway.data.repository

import android.content.Context
import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.BusinessConfig
import com.bytebridge.gateway.core.model.DeliveryStatus
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.core.model.PaymentTransaction
import com.bytebridge.gateway.core.parser.BankParserEngine
import com.bytebridge.gateway.core.parser.ParsedPaymentResult
import com.bytebridge.gateway.core.security.HmacSigner
import com.bytebridge.gateway.data.local.AppDatabase
import com.bytebridge.gateway.data.local.dao.DailyMetrics
import com.bytebridge.gateway.data.local.dao.PaymentTransactionDao
import com.bytebridge.gateway.data.local.entity.PaymentTransactionEntity
import com.bytebridge.gateway.data.preference.AppPreferences
import com.bytebridge.gateway.data.remote.DispatchResult
import com.bytebridge.gateway.data.remote.WebhookDispatcher
import com.bytebridge.gateway.service.PaymentNotifier
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.UUID

class PaymentRepository(
    private val context: Context,
    private val dao: PaymentTransactionDao = AppDatabase.getDatabase(context).paymentTransactionDao(),
    private val preferences: AppPreferences = AppPreferences(context),
    private val webhookDispatcher: WebhookDispatcher = WebhookDispatcher()
) {

    private val repositoryScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    val recentTransactionsFlow: Flow<List<PaymentTransaction>> =
        dao.getRecentTransactionsFlow(100).map { list -> list.map { it.toDomain() } }

    val businessConfigFlow: Flow<BusinessConfig> = preferences.businessConfigFlow

    val isDaemonRunningFlow: Flow<Boolean> = preferences.isDaemonRunningFlow

    fun getDailyMetricsFlow(): Flow<DailyMetrics> {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        return dao.getDailyMetricsFlow(calendar.timeInMillis)
    }

    suspend fun saveBusinessConfig(config: BusinessConfig) {
        preferences.saveBusinessConfig(config)
    }

    suspend fun setDaemonRunning(running: Boolean) {
        preferences.setDaemonRunning(running)
    }

    suspend fun testWebhookConnection(): DispatchResult {
        val config = preferences.businessConfigFlow.first()
        return webhookDispatcher.pingWebhook(config)
    }

    /**
     * Central ingestion method called by PushListener, SMSReceiver and UI Simulator.
     */
    suspend fun processRawPayment(
        rawText: String,
        channel: IngestChannel,
        suggestedBank: Bank = Bank.UNKNOWN,
        senderOrPackage: String? = null
    ): ProcessPaymentResult = withContext(Dispatchers.IO) {
        // 1. Run determinist parser
        val parseResult: ParsedPaymentResult = BankParserEngine.parse(
            content = rawText,
            channel = channel,
            suggestedBank = suggestedBank,
            senderOrPackage = senderOrPackage
        )

        if (!parseResult.isSuccess || parseResult.amount == null || parseResult.reference == null) {
            return@withContext ProcessPaymentResult.ParseError(
                reason = parseResult.failureReason ?: "No se pudo interpretar el formato de pago",
                rawText = rawText
            )
        }

        // 2. Check Idempotency (Prevent Duplicate Payments)
        val idempotencyKey = HmacSigner.generateIdempotencyKey(
            bankCode = parseResult.bank.code,
            reference = parseResult.reference,
            amount = parseResult.amount
        )

        val existing = dao.getByIdempotencyKey(idempotencyKey)
        if (existing != null) {
            return@withContext ProcessPaymentResult.Duplicate(existing.toDomain())
        }

        // 3. Create initial transaction entity
        val transactionId = UUID.randomUUID().toString()
        val transaction = PaymentTransaction(
            id = transactionId,
            idempotencyKey = idempotencyKey,
            bank = parseResult.bank,
            reference = parseResult.reference,
            amount = parseResult.amount,
            currency = parseResult.currency,
            payerName = parseResult.payerName,
            payerPhone = parseResult.payerPhone,
            payerId = parseResult.payerId,
            timestamp = System.currentTimeMillis(),
            channel = channel,
            rawMessage = rawText,
            status = DeliveryStatus.PENDING
        )

        dao.insert(PaymentTransactionEntity.fromDomain(transaction))

        // 4. Dispatch immediately to Webhook
        val config = preferences.businessConfigFlow.first()
        if (config.isActive && config.webhookUrl.isNotBlank()) {
            val dispatchResult = webhookDispatcher.dispatch(transaction, config)
            val updatedStatus = if (dispatchResult.isSuccess) DeliveryStatus.DELIVERED else DeliveryStatus.FAILED

            dao.updateDeliveryStatus(
                id = transactionId,
                status = updatedStatus,
                latencyMs = dispatchResult.latencyMs,
                statusCode = dispatchResult.statusCode,
                errorMessage = dispatchResult.errorMessage
            )

            val finalized = transaction.copy(
                status = updatedStatus,
                deliveryLatencyMs = dispatchResult.latencyMs,
                httpStatusCode = dispatchResult.statusCode,
                signature = dispatchResult.signature,
                errorMessage = dispatchResult.errorMessage
            )

            if (dispatchResult.isSuccess) {
                PaymentNotifier.notifyPaymentSuccess(context, finalized)
            }

            return@withContext ProcessPaymentResult.Success(finalized, dispatchResult)
        } else {
            val finalized = transaction.copy(
                status = DeliveryStatus.FAILED,
                errorMessage = "Webhook inactivo o no configurado"
            )
            dao.updateDeliveryStatus(
                id = transactionId,
                status = DeliveryStatus.FAILED,
                latencyMs = null,
                statusCode = null,
                errorMessage = "Webhook inactivo o no configurado"
            )
            return@withContext ProcessPaymentResult.Success(
                transaction = finalized,
                dispatchResult = DispatchResult(
                    isSuccess = false,
                    statusCode = null,
                    latencyMs = 0L,
                    signature = "",
                    errorMessage = "Webhook inactivo o no configurado"
                )
            )
        }
    }

    suspend fun retryTransaction(transactionId: String): DispatchResult = withContext(Dispatchers.IO) {
        val entity = dao.getById(transactionId) ?: return@withContext DispatchResult(
            isSuccess = false,
            statusCode = null,
            latencyMs = 0,
            signature = "",
            errorMessage = "Transacción no encontrada"
        )

        val config = preferences.businessConfigFlow.first()
        dao.updateDeliveryStatus(
            id = transactionId,
            status = DeliveryStatus.RETRYING,
            latencyMs = null,
            statusCode = null,
            errorMessage = null
        )

        val result = webhookDispatcher.dispatch(entity.toDomain(), config)
        val status = if (result.isSuccess) DeliveryStatus.DELIVERED else DeliveryStatus.FAILED

        dao.updateDeliveryStatus(
            id = transactionId,
            status = status,
            latencyMs = result.latencyMs,
            statusCode = result.statusCode,
            errorMessage = result.errorMessage
        )

        if (result.isSuccess) {
            PaymentNotifier.notifyPaymentSuccess(context, entity.toDomain().copy(status = DeliveryStatus.DELIVERED))
        }

        result
    }

    suspend fun clearHistory() = withContext(Dispatchers.IO) {
        dao.clearAll()
    }
}

sealed class ProcessPaymentResult {
    data class Success(val transaction: PaymentTransaction, val dispatchResult: DispatchResult) : ProcessPaymentResult()
    data class Duplicate(val existingTransaction: PaymentTransaction) : ProcessPaymentResult()
    data class ParseError(val reason: String, val rawText: String) : ProcessPaymentResult()
}
