package com.bytebridge.gateway.ui.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bytebridge.gateway.core.model.BusinessConfig
import com.bytebridge.gateway.data.preference.AppPreferences
import com.bytebridge.gateway.data.remote.DispatchResult
import com.bytebridge.gateway.data.repository.PaymentRepository
import com.bytebridge.gateway.service.WatchdogHelper
import com.bytebridge.gateway.updater.AppUpdateManager
import com.bytebridge.gateway.updater.UpdateInfo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class SettingsUiState(
    val businessName: String = "",
    val webhookUrl: String = "",
    val apiKey: String = "",
    val isTestingPing: Boolean = false,
    val pingResult: DispatchResult? = null,
    val saveSuccess: Boolean = false,
    val isCheckingUpdate: Boolean = false,
    val updateInfo: UpdateInfo? = null,
    val updateStatusMessage: String? = null
)

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = PaymentRepository(application)
    private val preferences = AppPreferences(application)

    val currentConfig: StateFlow<BusinessConfig> = repository.businessConfigFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = BusinessConfig()
        )

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.businessConfigFlow.collect { config ->
                _uiState.value = _uiState.value.copy(
                    businessName = config.businessName,
                    webhookUrl = config.webhookUrl,
                    apiKey = config.apiKey
                )
            }
        }
    }

    fun updateBusinessName(name: String) {
        _uiState.value = _uiState.value.copy(businessName = name, saveSuccess = false)
    }

    fun updateWebhookUrl(url: String) {
        _uiState.value = _uiState.value.copy(webhookUrl = url, saveSuccess = false)
    }

    fun updateApiKey(key: String) {
        _uiState.value = _uiState.value.copy(apiKey = key, saveSuccess = false)
    }

    fun saveChanges() {
        viewModelScope.launch {
            val config = BusinessConfig(
                businessName = _uiState.value.businessName.trim(),
                webhookUrl = _uiState.value.webhookUrl.trim(),
                apiKey = _uiState.value.apiKey.trim(),
                isActive = true
            )
            repository.saveBusinessConfig(config)
            _uiState.value = _uiState.value.copy(saveSuccess = true)
        }
    }

    fun testWebhookPing() {
        val state = _uiState.value
        if (state.webhookUrl.isBlank()) return

        _uiState.value = state.copy(isTestingPing = true, pingResult = null)
        viewModelScope.launch {
            val config = BusinessConfig(
                businessName = state.businessName,
                webhookUrl = state.webhookUrl,
                apiKey = state.apiKey,
                isActive = true
            )
            repository.saveBusinessConfig(config)

            val result = repository.testWebhookConnection()
            _uiState.value = _uiState.value.copy(
                isTestingPing = false,
                pingResult = result
            )
        }
    }

    fun checkForAppUpdate() {
        _uiState.value = _uiState.value.copy(isCheckingUpdate = true, updateStatusMessage = null)
        viewModelScope.launch {
            // Check version against active backend update endpoint if configured
            val updateEndpoint = _uiState.value.webhookUrl.replace("/ingest/push", "/version/check")
            val info = AppUpdateManager.checkForUpdate(1, updateEndpoint)
            _uiState.value = _uiState.value.copy(
                isCheckingUpdate = false,
                updateInfo = info,
                updateStatusMessage = if (info.hasUpdate) "Nueva versión ${info.latestVersionName} disponible" else "Estás en la última versión (v1.0.0)"
            )
        }
    }

    fun installUpdate() {
        val info = _uiState.value.updateInfo ?: return
        if (info.apkDownloadUrl.isNotBlank()) {
            AppUpdateManager.downloadAndInstall(getApplication(), info.apkDownloadUrl)
        }
    }

    fun rebindListener() {
        WatchdogHelper.forceRebindNotificationListener(getApplication())
    }

    fun clearLocalDatabase() {
        viewModelScope.launch {
            repository.clearHistory()
        }
    }
}
