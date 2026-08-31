package com.bytebridge.gateway.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bytebridge.gateway.core.model.DeliveryStatus
import com.bytebridge.gateway.core.model.PaymentTransaction
import com.bytebridge.gateway.core.util.CurrencyFormatter
import com.bytebridge.gateway.core.util.DateTimeUtils
import com.bytebridge.gateway.ui.theme.DarkBorder
import com.bytebridge.gateway.ui.theme.DarkSurface
import com.bytebridge.gateway.ui.theme.DarkSurfaceVariant
import com.bytebridge.gateway.ui.theme.EmeraldSuccess
import com.bytebridge.gateway.ui.theme.TealPrimary
import com.bytebridge.gateway.ui.theme.TextMuted
import com.bytebridge.gateway.ui.theme.TextPrimary
import com.bytebridge.gateway.ui.theme.TextSecondary

@Composable
fun TransactionCard(
    transaction: PaymentTransaction,
    onRetryClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(DarkSurface)
            .border(1.dp, DarkBorder, RoundedCornerShape(14.dp))
            .clickable { expanded = !expanded }
            .padding(14.dp)
    ) {
        Column {
            // Main Top Row: Bank + Amount + Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    BankBadge(bank = transaction.bank)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = transaction.channel.tag,
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                StatusBadge(status = transaction.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Amount & Reference Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(
                        text = CurrencyFormatter.formatAmount(transaction.amount, transaction.currency),
                        color = TextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.3).sp
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Ref: ${transaction.reference}",
                            color = TextSecondary,
                            fontSize = 13.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        IconButton(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(transaction.reference))
                            },
                            modifier = Modifier.size(18.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = "Copiar Referencia",
                                tint = TextMuted,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = DateTimeUtils.getRelativeTimeSpan(transaction.timestamp),
                        color = TextMuted,
                        fontSize = 12.sp
                    )
                    if (transaction.deliveryLatencyMs != null && transaction.status == DeliveryStatus.DELIVERED) {
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "${transaction.deliveryLatencyMs}ms",
                            color = EmeraldSuccess,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Expand Icon Indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = TextMuted,
                    modifier = Modifier.size(16.dp)
                )
            }

            // Expanded Details Section
            AnimatedVisibility(visible = expanded) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(DarkSurfaceVariant)
                            .padding(10.dp)
                    ) {
                        Column {
                            if (!transaction.payerName.isNullOrBlank() || !transaction.payerId.isNullOrBlank() || !transaction.payerPhone.isNullOrBlank()) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    if (!transaction.payerName.isNullOrBlank()) {
                                        DetailItem(label = "Pagador", value = transaction.payerName)
                                    }
                                    if (!transaction.payerId.isNullOrBlank()) {
                                        DetailItem(label = "Cédula", value = transaction.payerId)
                                    }
                                    if (!transaction.payerPhone.isNullOrBlank()) {
                                        DetailItem(label = "Teléfono", value = transaction.payerPhone)
                                    }
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                            }

                            Text(
                                text = "Texto Original Ingerido:",
                                color = TextMuted,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(3.dp))
                            Text(
                                text = transaction.rawMessage,
                                color = TextSecondary,
                                fontSize = 12.sp,
                                lineHeight = 16.sp
                            )

                            if (transaction.errorMessage != null) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Error: ${transaction.errorMessage}",
                                    color = Color(0xFFF43F5E),
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }

                    if (transaction.status == DeliveryStatus.FAILED) {
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = { onRetryClick(transaction.id) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = TealPrimary
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "Reintentar Despacho Webhook", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailItem(label: String, value: String) {
    Column {
        Text(text = label, color = TextMuted, fontSize = 10.sp)
        Text(text = value, color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}
