package com.bytebridge.gateway.ui.simulator

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Science
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bytebridge.gateway.core.model.IngestChannel
import com.bytebridge.gateway.core.parser.ParsedPaymentResult
import com.bytebridge.gateway.core.util.CurrencyFormatter
import com.bytebridge.gateway.ui.components.BankBadge
import com.bytebridge.gateway.ui.theme.DarkBackground
import com.bytebridge.gateway.ui.theme.DarkBorder
import com.bytebridge.gateway.ui.theme.DarkSurface
import com.bytebridge.gateway.ui.theme.DarkSurfaceVariant
import com.bytebridge.gateway.ui.theme.EmeraldSuccess
import com.bytebridge.gateway.ui.theme.RoseError
import com.bytebridge.gateway.ui.theme.TealPrimary
import com.bytebridge.gateway.ui.theme.TextMuted
import com.bytebridge.gateway.ui.theme.TextPrimary
import com.bytebridge.gateway.ui.theme.TextSecondary

@Composable
fun SimulatorScreen(
    viewModel: SimulatorViewModel = viewModel(),
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Science,
                contentDescription = null,
                tint = TealPrimary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Simulador de Conciliación",
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Prueba Pago Móvil (Bs.) y Zelle (USD) sin pagos reales",
                    color = TextMuted,
                    fontSize = 12.sp
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // 1. Bank Template Preset Selector
            Text(
                text = "Plantillas Reales (Pago Móvil & Zelle)",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))

            LazyRow(
                contentPadding = PaddingValues(end = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(viewModel.templates) { template ->
                    val isSelected = uiState.inputText == template.sampleText
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) TealPrimary.copy(alpha = 0.2f) else DarkSurface)
                            .border(
                                1.dp,
                                if (isSelected) TealPrimary else DarkBorder,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable { viewModel.applyTemplate(template) }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = template.title,
                            color = if (isSelected) TealPrimary else TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. Channel Selector
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ChannelChip(
                    title = "Push Notificación",
                    isSelected = uiState.selectedChannel == IngestChannel.PUSH,
                    onClick = { viewModel.setChannel(IngestChannel.PUSH) },
                    modifier = Modifier.weight(1f)
                )
                ChannelChip(
                    title = "SMS Bancario",
                    isSelected = uiState.selectedChannel == IngestChannel.SMS,
                    onClick = { viewModel.setChannel(IngestChannel.SMS) },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 3. Input Text Area
            Text(
                text = "Mensaje a Parsear",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = uiState.inputText,
                onValueChange = { viewModel.updateInputText(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp),
                placeholder = {
                    Text(
                        text = "Pega aquí la notificación push, SMS o correo de Zelle...",
                        color = TextMuted,
                        fontSize = 13.sp
                    )
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    unfocusedBorderColor = DarkBorder,
                    focusedContainerColor = DarkSurface,
                    unfocusedContainerColor = DarkSurface,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 4. Live Parse Extraction Inspection Box
            Text(
                text = "Extracción Determinista (Tiempo Real)",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(6.dp))

            ParseInspectionBox(parsed = uiState.parsedResult)

            Spacer(modifier = Modifier.height(16.dp))

            // 5. Execution Summary Banner
            if (uiState.executionSummary != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (uiState.isError) RoseError.copy(alpha = 0.15f) else EmeraldSuccess.copy(alpha = 0.15f))
                        .border(
                            1.dp,
                            if (uiState.isError) RoseError else EmeraldSuccess,
                            RoundedCornerShape(10.dp)
                        )
                        .padding(12.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (uiState.isError) Icons.Default.ErrorOutline else Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = if (uiState.isError) RoseError else EmeraldSuccess,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.executionSummary.orEmpty(),
                            color = TextPrimary,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                Spacer(modifier = Modifier.height(14.dp))
            }

            // 6. Action Button
            Button(
                onClick = { viewModel.executeSimulation() },
                enabled = !uiState.isExecuting && uiState.parsedResult?.isSuccess == true,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TealPrimary,
                    contentColor = DarkBackground,
                    disabledContainerColor = DarkSurfaceVariant,
                    disabledContentColor = TextMuted
                )
            ) {
                if (uiState.isExecuting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = DarkBackground,
                        strokeWidth = 2.dp
                    )
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Simular Ingesta y Despachar Webhook",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun ChannelChip(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected) TealPrimary.copy(alpha = 0.2f) else DarkSurface)
            .border(1.dp, if (isSelected) TealPrimary else DarkBorder, RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            color = if (isSelected) TealPrimary else TextSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun ParseInspectionBox(parsed: ParsedPaymentResult?) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface)
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        if (parsed == null || !parsed.isSuccess) {
            Column {
                Text(
                    text = "⚠️ No se ha detectado un pago válido en el texto.",
                    color = Color(0xFFF59E0B),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
                if (parsed?.failureReason != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Motivo: ${parsed.failureReason}",
                        color = TextMuted,
                        fontSize = 12.sp
                    )
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        BankBadge(bank = parsed.bank)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = parsed.bank.displayName,
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }

                    Text(
                        text = "Confianza: ${(parsed.confidence * 100).toInt()}%",
                        color = EmeraldSuccess,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "Monto Extraído (${parsed.currency})", color = TextMuted, fontSize = 11.sp)
                        Text(
                            text = CurrencyFormatter.formatAmount(parsed.amount ?: 0.0, parsed.currency),
                            color = EmeraldSuccess,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "Número de Referencia", color = TextMuted, fontSize = 11.sp)
                        Text(
                            text = parsed.reference ?: "N/A",
                            color = TextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                if (!parsed.payerName.isNullOrBlank() || !parsed.payerId.isNullOrBlank() || !parsed.payerPhone.isNullOrBlank()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        if (!parsed.payerName.isNullOrBlank()) {
                            Column {
                                Text(text = "Pagador (Zelle)", color = TextMuted, fontSize = 11.sp)
                                Text(
                                    text = parsed.payerName,
                                    color = TextPrimary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                        if (!parsed.payerId.isNullOrBlank()) {
                            Column {
                                Text(text = "Cédula Emisor", color = TextMuted, fontSize = 11.sp)
                                Text(
                                    text = parsed.payerId,
                                    color = TextPrimary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                        if (!parsed.payerPhone.isNullOrBlank()) {
                            Column(horizontalAlignment = Alignment.End) {
                                Text(text = "Teléfono Emisor", color = TextMuted, fontSize = 11.sp)
                                Text(
                                    text = parsed.payerPhone,
                                    color = TextPrimary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
