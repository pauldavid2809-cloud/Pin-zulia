package com.bytebridge.gateway.ui.dashboard

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bytebridge.gateway.R
import com.bytebridge.gateway.ui.components.MetricSummaryCard
import com.bytebridge.gateway.ui.components.PermissionCheckBanner
import com.bytebridge.gateway.ui.components.TransactionCard
import com.bytebridge.gateway.ui.theme.DarkBackground
import com.bytebridge.gateway.ui.theme.DarkSurface
import com.bytebridge.gateway.ui.theme.EmeraldSuccess
import com.bytebridge.gateway.ui.theme.TealPrimary
import com.bytebridge.gateway.ui.theme.TextMuted
import com.bytebridge.gateway.ui.theme.TextPrimary
import com.bytebridge.gateway.ui.theme.TextSecondary

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = viewModel(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val transactions by viewModel.transactions.collectAsStateWithLifecycle()
    val metrics by viewModel.metrics.collectAsStateWithLifecycle()
    val businessConfig by viewModel.businessConfig.collectAsStateWithLifecycle()
    val isDaemonRunning by viewModel.isDaemonRunning.collectAsStateWithLifecycle()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(uiState.toastMessage) {
        uiState.toastMessage?.let {
            Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            viewModel.clearToast()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // App Top Bar with Official ByteBridge Logo
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(
                    painter = painterResource(id = R.drawable.bytebridge_logo),
                    contentDescription = "ByteBridge Logo",
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "ByteBridge",
                        color = TextPrimary,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    )
                    Text(
                        text = businessConfig.businessName.ifBlank { "Sin vincular" },
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = if (isDaemonRunning) "ON" else "OFF",
                    color = if (isDaemonRunning) EmeraldSuccess else TextMuted,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(8.dp))
                Switch(
                    checked = isDaemonRunning,
                    onCheckedChange = { viewModel.toggleDaemon() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = EmeraldSuccess,
                        checkedTrackColor = EmeraldSuccess.copy(alpha = 0.3f),
                        uncheckedThumbColor = TextMuted,
                        uncheckedTrackColor = DarkSurface
                    )
                )
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. System Permission Banner
            item {
                PermissionCheckBanner()
            }

            // 2. Metrics Summary
            item {
                MetricSummaryCard(
                    metrics = metrics,
                    isDaemonActive = isDaemonRunning
                )
            }

            // 3. Transactions Section Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Feed de Ingesta en Vivo",
                            color = TextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(DarkSurface)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "${transactions.size}",
                                color = TealPrimary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    if (transactions.isNotEmpty()) {
                        IconButton(
                            onClick = { viewModel.clearAllHistory() },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.DeleteOutline,
                                contentDescription = "Limpiar Feed",
                                tint = TextMuted,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            // 4. Ingested Transaction List
            if (transactions.isEmpty()) {
                item {
                    EmptyTransactionsPlaceholder()
                }
            } else {
                items(transactions, key = { it.id }) { item ->
                    TransactionCard(
                        transaction = item,
                        onRetryClick = { id -> viewModel.retryTransaction(id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyTransactionsPlaceholder() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(DarkSurface)
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.PowerSettingsNew,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Esperando Pagos Entrantes",
                color = TextPrimary,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Las notificaciones de Pago Móvil (Bs.) y Zelle ($) se procesarán y despacharán automáticamente en <0.2s.",
                color = TextMuted,
                fontSize = 12.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                lineHeight = 16.sp
            )
        }
    }
}
