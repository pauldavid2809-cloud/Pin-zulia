package com.bytebridge.gateway.ui.dashboard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bytebridge.gateway.core.model.BusinessConfig
import com.bytebridge.gateway.core.model.PaymentTransaction
import com.bytebridge.gateway.data.local.dao.DailyMetrics
import com.bytebridge.gateway.data.repository.PaymentRepository
import com.bytebridge.gateway.service.DaemonForegroundService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DashboardUiState(
    val selectedBankFilter: String = "ALL",
    val isRefreshing: Boolean = false,
    val toastMessage: String? = null
)

class DashboardViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = PaymentRepository(application)

    val transactions: StateFlow<List<PaymentTransaction>> = repository.recentTransactionsFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val metrics: StateFlow<DailyMetrics> = repository.getDailyMetricsFlow()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = DailyMetrics(0, 0, 0, 0.0, 0.0)
        )

    val businessConfig: StateFlow<BusinessConfig> = repository.businessConfigFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = BusinessConfig()
        )

    val isDaemonRunning: StateFlow<Boolean> = repository.isDaemonRunningFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = true
        )

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    fun toggleDaemon() {
        viewModelScope.launch {
            val current = isDaemonRunning.value
            val target = !current
            repository.setDaemonRunning(target)
            if (target) {
                DaemonForegroundService.start(getApplication())
            } else {
                DaemonForegroundService.stop(getApplication())
            }
        }
    }

    fun retryTransaction(transactionId: String) {
        viewModelScope.launch {
            val result = repository.retryTransaction(transactionId)
            _uiState.value = _uiState.value.copy(
                toastMessage = if (result.isSuccess) "Despacho exitoso (${result.latencyMs}ms)" else "Error: ${result.errorMessage}"
            )
        }
    }

    fun clearToast() {
        _uiState.value = _uiState.value.copy(toastMessage = null)
    }

    fun clearAllHistory() {
        viewModelScope.launch {
            repository.clearHistory()
        }
    }
}
