package com.bytebridge.gateway.ui.scanner

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bytebridge.gateway.core.model.BusinessConfig
import com.bytebridge.gateway.data.repository.PaymentRepository
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class QRScannerUiState(
    val scannedConfig: BusinessConfig? = null,
    val isPairedSuccessfully: Boolean = false,
    val errorMessage: String? = null
)

class QRScannerViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = PaymentRepository(application)
    private val gson = Gson()

    private val _uiState = MutableStateFlow(QRScannerUiState())
    val uiState: StateFlow<QRScannerUiState> = _uiState.asStateFlow()

    fun onQrScanned(rawContent: String) {
        if (_uiState.value.scannedConfig != null) return // Already holding a detected QR

        try {
            val config = gson.fromJson(rawContent, BusinessConfig::class.java)
            if (config != null && config.webhookUrl.isNotBlank()) {
                _uiState.value = _uiState.value.copy(
                    scannedConfig = config,
                    errorMessage = null
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "El código QR no contiene una URL de Webhook válida"
                )
            }
        } catch (_: Exception) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Formato de QR no compatible con ByteBridge"
            )
        }
    }

    fun confirmPairing() {
        val config = _uiState.value.scannedConfig ?: return
        viewModelScope.launch {
            repository.saveBusinessConfig(config)
            _uiState.value = _uiState.value.copy(
                isPairedSuccessfully = true
            )
        }
    }

    fun dismissPairing() {
        _uiState.value = QRScannerUiState()
    }
}
