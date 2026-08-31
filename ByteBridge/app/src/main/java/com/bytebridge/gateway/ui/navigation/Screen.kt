package com.bytebridge.gateway.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    data object Dashboard : Screen("dashboard", "En Vivo", Icons.Default.Bolt)
    data object Simulator : Screen("simulator", "Simulador", Icons.Default.Science)
    data object Scanner : Screen("scanner", "Escanear QR", Icons.Default.QrCodeScanner)
    data object Settings : Screen("settings", "Ajustes", Icons.Default.Settings)
}
