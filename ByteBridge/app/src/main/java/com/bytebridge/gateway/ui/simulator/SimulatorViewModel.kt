package com.bytebridge.gateway.ui.simulator

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.core.parser.BankParserEngine
import com.bytebridge.gateway.core.parser.ParsedPaymentResult
import com.bytebridge.gateway.data.repository.PaymentRepository
import com.bytebridge.gateway.data.repository.ProcessPaymentResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PresetTemplate(
    val title: String,
    val bank: Bank,
    val channel: IngestChannel,
    val sampleText: String
)

data class SimulatorUiState(
    val inputText: String = "",
    val selectedBank: Bank = Bank.BDV,
    val selectedChannel: IngestChannel = IngestChannel.PUSH,
    val parsedResult: ParsedPaymentResult? = null,
    val isExecuting: Boolean = false,
    val executionSummary: String? = null,
    val isError: Boolean = false
)

class SimulatorViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = PaymentRepository(application)

    val templates: List<PresetTemplate> = listOf(
        // Zelle Templates
        PresetTemplate(
            title = "🇺🇸 Chase: Zelle $150.00 (John Doe)",
            bank = Bank.ZELLE_CHASE,
            channel = IngestChannel.PUSH,
            sampleText = "Chase Alerts: John Doe sent you $150.00 with Zelle. Confirmation: ZEL-982341"
        ),
        PresetTemplate(
            title = "🇺🇸 BofA: Zelle $85.00 (Maria Perez)",
            bank = Bank.ZELLE_BOFA,
            channel = IngestChannel.PUSH,
            sampleText = "Bank of America: You received $85.00 from Maria Perez with Zelle. Ref: 2026083012"
        ),
        PresetTemplate(
            title = "🇺🇸 Wells Fargo: Zelle $50.00",
            bank = Bank.ZELLE_WELLS_FARGO,
            channel = IngestChannel.PUSH,
            sampleText = "Wells Fargo: Zelle payment received for $50.00 from Carlos Gomez. Trx: WF-448201"
        ),
        PresetTemplate(
            title = "🇺🇸 Gmail: Notificación Correo Zelle",
            bank = Bank.ZELLE_GENERIC,
            channel = IngestChannel.PUSH,
            sampleText = "Zelle: Robert Smith sent you $120.00 with Zelle. Funds are available in your account."
        ),

        // Venezuelan Banks (Pago Móvil) Templates
        PresetTemplate(
            title = "🇻🇪 BDV: PagoClave SMS (2661)",
            bank = Bank.BDV,
            channel = IngestChannel.SMS,
            sampleText = "PagoClave recibido por Bs. 19.791,75 de 04141234567 ci 12345678 ref 123456789012 al 30/08/2026 14:20"
        ),
        PresetTemplate(
            title = "🇻🇪 BDV: Push BDVApp",
            bank = Bank.BDV,
            channel = IngestChannel.PUSH,
            sampleText = "Pago Móvil BDV recibido: Ha recibido un pago por Bs. 19.791,75 de V-12345678. Referencia: 123456789012"
        ),
        PresetTemplate(
            title = "🇻🇪 Banesco: PagoMóvil SMS (0134)",
            bank = Bank.BANESCO,
            channel = IngestChannel.SMS,
            sampleText = "BanescoPagoMovil: Recibiste Bs. 19.791,75 de V-12345678 tlf 04141234567 Ref: 0123456789 el 30/08/2026"
        ),
        PresetTemplate(
            title = "🇻🇪 Banesco: Push BanescoMóvil",
            bank = Bank.BANESCO,
            channel = IngestChannel.PUSH,
            sampleText = "Banesco PagoMóvil: Recibiste un pago móvil de Bs. 19.791,75. Ref: 0123456789"
        ),
        PresetTemplate(
            title = "🇻🇪 Mercantil: Tpago SMS / Push",
            bank = Bank.MERCANTIL,
            channel = IngestChannel.SMS,
            sampleText = "Tpago: Recibiste pago de V-12345678 por Bs. 19.791,75. Ref. 123456789. Mercantil"
        ),
        PresetTemplate(
            title = "🇻🇪 Bancamiga: Pago Móvil",
            bank = Bank.BANCAMIGA,
            channel = IngestChannel.PUSH,
            sampleText = "Bancamiga: Ha recibido un Pago Movil por Bs. 19.791,75 del tlf 04141234567 ref: 0098765432"
        ),
        PresetTemplate(
            title = "🇻🇪 BBVA Provincial: Dinero Rápido",
            bank = Bank.BBVA_PROVINCIAL,
            channel = IngestChannel.PUSH,
            sampleText = "BBVA Provincial: Recibiste Bs. 19.791,75 por Dinero Rapido de V12345678. Ref: 123456789"
        ),
        PresetTemplate(
            title = "🇻🇪 BNC: Pago Móvil Recibido",
            bank = Bank.BNC,
            channel = IngestChannel.SMS,
            sampleText = "BNC: Pago Movil Recibido por Bs. 19.791,75 de V12345678 tlf 04141234567 ref 1234567890"
        ),
        PresetTemplate(
            title = "🇻🇪 Bancaribe: Mi Pago",
            bank = Bank.BANCARIBE,
            channel = IngestChannel.PUSH,
            sampleText = "Bancaribe: Recibio Pago Movil por Bs. 19.791,75 de V-12345678 Ref: 123456789"
        )
    )

    private val _uiState = MutableStateFlow(SimulatorUiState())
    val uiState: StateFlow<SimulatorUiState> = _uiState.asStateFlow()

    init {
        applyTemplate(templates.first())
    }

    fun applyTemplate(template: PresetTemplate) {
        val parsed = BankParserEngine.parse(
            content = template.sampleText,
            channel = template.channel,
            suggestedBank = template.bank
        )
        _uiState.value = _uiState.value.copy(
            inputText = template.sampleText,
            selectedBank = template.bank,
            selectedChannel = template.channel,
            parsedResult = parsed,
            executionSummary = null
        )
    }

    fun updateInputText(newText: String) {
        val parsed = BankParserEngine.parse(
            content = newText,
            channel = _uiState.value.selectedChannel,
            suggestedBank = _uiState.value.selectedBank
        )
        _uiState.value = _uiState.value.copy(
            inputText = newText,
            parsedResult = parsed,
            executionSummary = null
        )
    }

    fun setBank(bank: Bank) {
        _uiState.value = _uiState.value.copy(selectedBank = bank)
        updateInputText(_uiState.value.inputText)
    }

    fun setChannel(channel: IngestChannel) {
        _uiState.value = _uiState.value.copy(selectedChannel = channel)
        updateInputText(_uiState.value.inputText)
    }

    fun executeSimulation() {
        val currentState = _uiState.value
        if (currentState.inputText.isBlank()) return

        _uiState.value = currentState.copy(isExecuting = true, executionSummary = null)

        viewModelScope.launch {
            val result = repository.processRawPayment(
                rawText = currentState.inputText,
                channel = currentState.selectedChannel,
                suggestedBank = currentState.selectedBank
            )

            when (result) {
                is ProcessPaymentResult.Success -> {
                    val dispatch = result.dispatchResult
                    val summary = if (dispatch.isSuccess) {
                        "✅ Ingesta y Despacho Exitoso en ${dispatch.latencyMs}ms (HTTP ${dispatch.statusCode ?: 200})"
                    } else {
                        "⚠️ Ingestado en BD local, pero falló el webhook: ${dispatch.errorMessage}"
                    }
                    _uiState.value = _uiState.value.copy(
                        isExecuting = false,
                        executionSummary = summary,
                        isError = !dispatch.isSuccess
                    )
                }
                is ProcessPaymentResult.Duplicate -> {
                    _uiState.value = _uiState.value.copy(
                        isExecuting = false,
                        executionSummary = "⚠️ Pago duplicado detectado: Ya existe la ref ${result.existingTransaction.reference}",
                        isError = true
                    )
                }
                is ProcessPaymentResult.ParseError -> {
                    _uiState.value = _uiState.value.copy(
                        isExecuting = false,
                        executionSummary = "❌ Error de parseo: ${result.reason}",
                        isError = true
                    )
                }
            }
        }
    }
}
