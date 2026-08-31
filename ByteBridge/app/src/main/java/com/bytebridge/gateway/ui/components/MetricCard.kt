package com.bytebridge.gateway.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bytebridge.gateway.core.util.CurrencyFormatter
import com.bytebridge.gateway.data.local.dao.DailyMetrics
import com.bytebridge.gateway.ui.theme.DarkBorder
import com.bytebridge.gateway.ui.theme.DarkSurface
import com.bytebridge.gateway.ui.theme.EmeraldSuccess
import com.bytebridge.gateway.ui.theme.TealPrimary
import com.bytebridge.gateway.ui.theme.TextMuted
import com.bytebridge.gateway.ui.theme.TextPrimary

@Composable
fun MetricSummaryCard(
    metrics: DailyMetrics,
    isDaemonActive: Boolean,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(DarkSurface)
            .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column {
            // Header with Live Pulse Indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(if (isDaemonActive) EmeraldSuccess else Color(0xFFEF4444))
                    )
                    Spacer(modifier = Modifier.size(6.dp))
                    Text(
                        text = if (isDaemonActive) "DAEMON ACTIVO" else "DAEMON DETENIDO",
                        color = if (isDaemonActive) EmeraldSuccess else Color(0xFFEF4444),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                }

                Text(
                    text = "HOY",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Main Total Amount
            Text(
                text = "Total Conciliado",
                color = TextMuted,
                fontSize = 12.sp
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = CurrencyFormatter.formatVES(metrics.totalAmountVES),
                color = TextPrimary,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.5).sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Secondary Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                StatItem(
                    label = "Pagos Exitosos",
                    value = "${metrics.deliveredCount}",
                    accentColor = EmeraldSuccess
                )
                StatItem(
                    label = "Fallos / Pendientes",
                    value = "${metrics.failedCount}",
                    accentColor = if (metrics.failedCount > 0) Color(0xFFF43F5E) else TextMuted
                )
                StatItem(
                    label = "Latencia Promedio",
                    value = if (metrics.avgLatencyMs > 0) "${metrics.avgLatencyMs.toInt()} ms" else "<200 ms",
                    accentColor = TealPrimary
                )
            }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String, accentColor: Color) {
    Column {
        Text(text = label, color = TextMuted, fontSize = 11.sp)
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            color = accentColor,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
