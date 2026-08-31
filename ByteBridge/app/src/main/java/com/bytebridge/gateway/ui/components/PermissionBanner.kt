package com.bytebridge.gateway.ui.components

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
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
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Power
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.bytebridge.gateway.service.WatchdogHelper
import com.bytebridge.gateway.ui.theme.AmberWarning
import com.bytebridge.gateway.ui.theme.DarkBorder
import com.bytebridge.gateway.ui.theme.DarkSurface
import com.bytebridge.gateway.ui.theme.TealPrimary
import com.bytebridge.gateway.ui.theme.TextMuted
import com.bytebridge.gateway.ui.theme.TextPrimary
import com.bytebridge.gateway.ui.theme.TextSecondary

@Composable
fun PermissionCheckBanner(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    val hasPushListener = isNotificationServiceEnabled(context)
    val hasSmsPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.RECEIVE_SMS
    ) == PackageManager.PERMISSION_GRANTED
    val isBatteryOptimized = isIgnoringBatteryOptimizations(context)
    val manufacturerGuide = remember { WatchdogHelper.getManufacturerGuide() }
    var showManufacturerTip by remember { mutableStateOf(false) }

    if (hasPushListener && hasSmsPermission && isBatteryOptimized && manufacturerGuide == null) {
        return // All permissions are granted!
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(DarkSurface)
            .border(1.dp, AmberWarning.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
            .padding(14.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = AmberWarning,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Configuración del Sistema Requerida",
                    color = AmberWarning,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Para interceptar confirmaciones en tiempo real y evitar que Android cierre la app, activa los siguientes permisos:",
                color = TextMuted,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            if (!hasPushListener) {
                PermissionActionRow(
                    title = "Acceso a Notificaciones Push",
                    icon = Icons.Default.NotificationsActive,
                    actionText = "Activar",
                    onAction = {
                        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                        context.startActivity(intent)
                    }
                )
            }

            if (!hasSmsPermission) {
                Spacer(modifier = Modifier.height(6.dp))
                PermissionActionRow(
                    title = "Permiso de Lectura SMS",
                    icon = Icons.Default.Sms,
                    actionText = "Permitir",
                    onAction = {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", context.packageName, null)
                        }
                        context.startActivity(intent)
                    }
                )
            }

            if (!isBatteryOptimized) {
                Spacer(modifier = Modifier.height(6.dp))
                PermissionActionRow(
                    title = "Sin Restricción de Batería",
                    icon = Icons.Default.Power,
                    actionText = "Excluir",
                    onAction = {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                data = Uri.parse("package:${context.packageName}")
                            }
                            context.startActivity(intent)
                        }
                    }
                )
            }

            // Manufacturer Specific Guide (Xiaomi, Tecno, Infinix, Samsung)
            if (manufacturerGuide != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF1E293B))
                        .clickable { showManufacturerTip = !showManufacturerTip }
                        .padding(10.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = null,
                                    tint = TealPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Persistencia ${manufacturerGuide.brand}",
                                    color = TextPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            Text(
                                text = if (showManufacturerTip) "Ocultar" else "Ver Guía",
                                color = TealPrimary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        if (showManufacturerTip) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = manufacturerGuide.tip,
                                color = TextSecondary,
                                fontSize = 11.sp,
                                lineHeight = 15.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PermissionActionRow(
    title: String,
    icon: ImageVector,
    actionText: String,
    onAction: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF1E293B))
            .padding(horizontal = 10.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = TextPrimary,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = title,
                color = TextPrimary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }

        Button(
            onClick = onAction,
            colors = ButtonDefaults.buttonColors(
                containerColor = AmberWarning,
                contentColor = Color.Black
            ),
            shape = RoundedCornerShape(6.dp),
            modifier = Modifier.height(28.dp)
        ) {
            Text(
                text = actionText,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

fun isNotificationServiceEnabled(context: Context): Boolean {
    val pkgName = context.packageName
    val flat = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
    return flat?.contains(pkgName) == true
}

fun isIgnoringBatteryOptimizations(context: Context): Boolean {
    val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && powerManager != null) {
        powerManager.isIgnoringBatteryOptimizations(context.packageName)
    } else {
        true
    }
}
