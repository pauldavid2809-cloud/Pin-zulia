package com.bytebridge.gateway.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.bytebridge.gateway.core.model.DeliveryStatus
import com.bytebridge.gateway.data.local.entity.PaymentTransactionEntity
import kotlinx.coroutines.flow.Flow

data class DailyMetrics(
    val totalCount: Int,
    val deliveredCount: Int,
    val failedCount: Int,
    val totalAmountVES: Double,
    val avgLatencyMs: Double
)

@Dao
interface PaymentTransactionDao {

    @Query("SELECT * FROM payment_transactions ORDER BY timestamp DESC")
    fun getAllTransactionsFlow(): Flow<List<PaymentTransactionEntity>>

    @Query("SELECT * FROM payment_transactions ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentTransactionsFlow(limit: Int = 50): Flow<List<PaymentTransactionEntity>>

    @Query("SELECT * FROM payment_transactions WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): PaymentTransactionEntity?

    @Query("SELECT * FROM payment_transactions WHERE idempotencyKey = :idempotencyKey LIMIT 1")
    suspend fun getByIdempotencyKey(idempotencyKey: String): PaymentTransactionEntity?

    @Query("SELECT * FROM payment_transactions WHERE status IN ('PENDING', 'FAILED', 'RETRYING') ORDER BY timestamp ASC")
    suspend fun getPendingTransactions(): List<PaymentTransactionEntity>

    @Query("""
        SELECT 
            COUNT(*) as totalCount,
            SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as deliveredCount,
            SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failedCount,
            COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN amount ELSE 0 END), 0.0) as totalAmountVES,
            COALESCE(AVG(CASE WHEN status = 'DELIVERED' AND deliveryLatencyMs IS NOT NULL THEN deliveryLatencyMs ELSE NULL END), 0.0) as avgLatencyMs
        FROM payment_transactions 
        WHERE timestamp >= :startOfDayTimestamp
    """)
    fun getDailyMetricsFlow(startOfDayTimestamp: Long): Flow<DailyMetrics>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(transaction: PaymentTransactionEntity): Long

    @Update
    suspend fun update(transaction: PaymentTransactionEntity)

    @Query("""
        UPDATE payment_transactions 
        SET status = :status, 
            deliveryLatencyMs = :latencyMs, 
            httpStatusCode = :statusCode, 
            retryCount = retryCount + 1, 
            errorMessage = :errorMessage 
        WHERE id = :id
    """)
    suspend fun updateDeliveryStatus(
        id: String,
        status: DeliveryStatus,
        latencyMs: Long?,
        statusCode: Int?,
        errorMessage: String?
    )

    @Query("DELETE FROM payment_transactions")
    suspend fun clearAll()
}
