package com.bytebridge.gateway.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
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
import com.bytebridge.gateway.core.model.DeliveryStatus
import com.bytebridge.gateway.ui.theme.AmberWarning
import com.bytebridge.gateway.ui.theme.EmeraldSuccess
import com.bytebridge.gateway.ui.theme.RoseError
import com.bytebridge.gateway.ui.theme.SkyInfo

@Composable
fun StatusBadge(status: DeliveryStatus, modifier: Modifier = Modifier) {
    val (bgColor, textColor, dotColor, label) = when (status) {
        DeliveryStatus.DELIVERED -> Quadruple(
            Color(0x2210B981),
            EmeraldSuccess,
            EmeraldSuccess,
            "Despachado"
        )
        DeliveryStatus.PENDING -> Quadruple(
            Color(0x22F59E0B),
            AmberWarning,
            AmberWarning,
            "Pendiente"
        )
        DeliveryStatus.RETRYING -> Quadruple(
            Color(0x220EA5E9),
            SkyInfo,
            SkyInfo,
            "Reintentando"
        )
        DeliveryStatus.FAILED -> Quadruple(
            Color(0x22F43F5E),
            RoseError,
            RoseError,
            "Fallo HTTP"
        )
        DeliveryStatus.DUPLICATE -> Quadruple(
            Color(0x22F59E0B),
            AmberWarning,
            AmberWarning,
            "Duplicado"
        )
        DeliveryStatus.IGNORED -> Quadruple(
            Color(0x2264748B),
            Color(0xFF94A3B8),
            Color(0xFF94A3B8),
            "Ignorado"
        )
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 3.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(dotColor)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = label,
                color = textColor,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
