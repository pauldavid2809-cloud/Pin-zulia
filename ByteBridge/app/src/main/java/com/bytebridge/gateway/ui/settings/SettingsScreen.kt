package com.bytebridge.gateway.ui.settings

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryAlert
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.SystemUpdate
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bytebridge.gateway.core.model.BusinessConfig
import com.bytebridge.gateway.core.util.GoogleScriptGenerator
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
fun SettingsScreen(
    viewModel: SettingsViewModel = viewModel(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val scrollState = rememberScrollState()

    var showApiKey by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = null,
                tint = TealPrimary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Ajustes del Gateway",
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Configuración de Webhooks, HMAC y Sistema",
                    color = TextMuted,
                    fontSize = 12.sp
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Business & Webhook Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurface)
                    .border(1.dp, DarkBorder, RoundedCornerShape(14.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Parámetros de Integración Webhook",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    // Business Name
                    OutlinedTextField(
                        value = uiState.businessName,
                        onValueChange = { viewModel.updateBusinessName(it) },
                        label = { Text("Nombre del Negocio / WebApp Activa", color = TextMuted) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = outlinedFieldColors(),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )

                    // Webhook URL
                    OutlinedTextField(
                        value = uiState.webhookUrl,
                        onValueChange = { viewModel.updateWebhookUrl(it) },
                        label = { Text("URL Endpoint Webhook", color = TextMuted) },
                        placeholder = { Text("https://pinzulia.com/api/v1/ingest/push", color = TextMuted) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = outlinedFieldColors(),
                        shape = RoundedCornerShape(8.dp),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                        singleLine = true
                    )

                    // API Key
                    OutlinedTextField(
                        value = uiState.apiKey,
                        onValueChange = { viewModel.updateApiKey(it) },
                        label = { Text("Clave Secreta HMAC (API Key)", color = TextMuted) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = outlinedFieldColors(),
                        shape = RoundedCornerShape(8.dp),
                        visualTransformation = if (showApiKey) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            IconButton(onClick = { showApiKey = !showApiKey }) {
                                Icon(
                                    imageVector = if (showApiKey) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = TextMuted
                                )
                            }
                        },
                        singleLine = true
                    )

                    // Ping Result feedback
                    if (uiState.pingResult != null) {
                        val ping = uiState.pingResult!!
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (ping.isSuccess) EmeraldSuccess.copy(alpha = 0.15f) else RoseError.copy(alpha = 0.15f))
                                .padding(10.dp)
                        ) {
                            Text(
                                text = if (ping.isSuccess) "✅ Endpoint responde OK (Latencia: ${ping.latencyMs}ms)" else "❌ Error de conexión: ${ping.errorMessage}",
                                color = if (ping.isSuccess) EmeraldSuccess else RoseError,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    // Action Buttons Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.testWebhookPing() },
                            enabled = !uiState.isTestingPing && uiState.webhookUrl.isNotBlank(),
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = TealPrimary),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            if (uiState.isTestingPing) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = TealPrimary, strokeWidth = 2.dp)
                            } else {
                                Icon(imageVector = Icons.Default.Wifi, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = "Probar Ping", fontSize = 12.sp)
                            }
                        }

                        Button(
                            onClick = { viewModel.saveChanges() },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp), tint = DarkBackground)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (uiState.saveSuccess) "¡Guardado!" else "Guardar",
                                color = DarkBackground,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            // 2. Google Apps Script Dedicated Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurface)
                    .border(1.dp, TealPrimary.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
                    .padding(16.dp)
            ) {
                val activeConfig = BusinessConfig(
                    businessName = uiState.businessName.ifBlank { "Mi Negocio" },
                    webhookUrl = uiState.webhookUrl,
                    apiKey = uiState.apiKey
                )
                val scriptCode = GoogleScriptGenerator.generateScript(activeConfig)

                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.CloudDone,
                                contentDescription = null,
                                tint = TealPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Google Apps Script (${activeConfig.businessName})",
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Genera un script pre-rellenado para que la cuenta de Gmail de ${activeConfig.businessName} concilie Zelle 24/7 en la nube de Google.",
                        color = TextMuted,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(scriptCode))
                                Toast.makeText(context, "Script copiado al portapapeles", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                        ) {
                            Icon(imageVector = Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp), tint = DarkBackground)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "Copiar Script", color = DarkBackground, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = {
                                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_SUBJECT, "Google Script para ${activeConfig.businessName}")
                                    putExtra(Intent.EXTRA_TEXT, scriptCode)
                                }
                                context.startActivity(Intent.createChooser(shareIntent, "Compartir Script de ${activeConfig.businessName}"))
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary)
                        ) {
                            Icon(imageVector = Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "Compartir", fontSize = 12.sp)
                        }
                    }
                }
            }

            // 3. Auto-Updater & Watchdog Actions
            Text(
                text = "Mantenimiento y Actualizaciones",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            // Auto-Updater Check Tile
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(DarkSurface)
                    .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(TealPrimary.copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(imageVector = Icons.Default.SystemUpdate, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(20.dp))
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(text = "Actualizaciones de la App", color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                Text(text = uiState.updateStatusMessage ?: "Versión actual: v1.0.0", color = TextMuted, fontSize = 11.sp)
                            }
                        }

                        if (uiState.isCheckingUpdate) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = TealPrimary, strokeWidth = 2.dp)
                        } else if (uiState.updateInfo?.hasUpdate == true) {
                            Button(
                                onClick = { viewModel.installUpdate() },
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text("Descargar v${uiState.updateInfo?.latestVersionName}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DarkBackground)
                            }
                        } else {
                            OutlinedButton(
                                onClick = { viewModel.checkForAppUpdate() },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = TealPrimary),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text("Buscar", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            // Watchdog Force Re-Bind Tile
            SettingsActionTile(
                title = "Re-enganchar Watchdog de Notificaciones",
                subtitle = "Fuerza a Android a reconectar el interceptor push si se durmió",
                icon = Icons.Default.Refresh,
                onClick = {
                    viewModel.rebindListener()
                    Toast.makeText(context, "Watchdog reconectado con éxito", Toast.LENGTH_SHORT).show()
                }
            )

            // 4. System Permissions & Battery Quick Links
            Text(
                text = "Accesos del Sistema Operativo",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            SettingsActionTile(
                title = "Acceso a Notificaciones Push",
                subtitle = "Permiso especial NotificationListenerService",
                icon = Icons.Default.NotificationsActive,
                onClick = {
                    context.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
                }
            )

            SettingsActionTile(
                title = "Optimización de Batería",
                subtitle = "Excluir ByteBridge para ejecución ininterrumpida",
                icon = Icons.Default.BatteryAlert,
                onClick = {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                            data = Uri.parse("package:${context.packageName}")
                        }
                        context.startActivity(intent)
                    }
                }
            )

            SettingsActionTile(
                title = "Permisos de la Aplicación",
                subtitle = "SMS, Cámara y Notificaciones en Ajustes de Android",
                icon = Icons.Default.Security,
                onClick = {
                    val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.fromParts("package", context.packageName, null)
                    }
                    context.startActivity(intent)
                }
            )

            // 5. Maintenance & Database Reset
            Text(
                text = "Mantenimiento",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            SettingsActionTile(
                title = "Limpiar Historial de Transacciones",
                subtitle = "Elimina la base de datos local SQLite/Room",
                icon = Icons.Default.DeleteSweep,
                iconTint = RoseError,
                onClick = {
                    viewModel.clearLocalDatabase()
                    Toast.makeText(context, "Historial limpiado", Toast.LENGTH_SHORT).show()
                }
            )

            // 6. App Info Footer
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "ByteBridge Gateway v1.0.0 (Production Daemon Ready)",
                        color = TextMuted,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "Package: com.bytebridge.gateway • Arch: Kotlin / Compose / Room",
                        color = TextMuted,
                        fontSize = 10.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsActionTile(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconTint: Color = TealPrimary,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface)
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(iconTint.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = title, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Text(text = subtitle, color = TextMuted, fontSize = 11.sp)
            }
        }

        Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp))
    }
}

@Composable
private fun outlinedFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = TealPrimary,
    unfocusedBorderColor = DarkBorder,
    focusedContainerColor = DarkBackground,
    unfocusedContainerColor = DarkBackground,
    focusedTextColor = TextPrimary,
    unfocusedTextColor = TextPrimary
)
