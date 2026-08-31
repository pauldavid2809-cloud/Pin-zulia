package com.bytebridge.gateway.service

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.util.Log

object WatchdogHelper {

    private const val TAG = "ByteBridge:Watchdog"

    /**
     * Forces Android OS to re-bind the NotificationListenerService if it got silently disconnected.
     */
    fun forceRebindNotificationListener(context: Context) {
        try {
            val componentName = ComponentName(context, BankPushListenerService::class.java)
            val pm = context.packageManager

            // Toggle component state to trigger OS re-binding
            pm.setComponentEnabledSetting(
                componentName,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
            pm.setComponentEnabledSetting(
                componentName,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            )
            Log.i(TAG, "Notification listener component toggled successfully for re-binding")
        } catch (e: Exception) {
            Log.e(TAG, "Error forcing notification listener re-bind", e)
        }
    }

    /**
     * Returns the detected brand name and instructions if the device belongs to a manufacturer
     * known for aggressive background battery killers (Xiaomi, Tecno, Infinix, Samsung, Huawei).
     */
    fun getManufacturerGuide(): ManufacturerInfo? {
        val manufacturer = Build.MANUFACTURER.lowercase()
        return when {
            manufacturer.contains("xiaomi") || manufacturer.contains("redmi") || manufacturer.contains("poco") -> ManufacturerInfo(
                brand = "Xiaomi / MIUI / HyperOS",
                tip = "1. Ve a Ajustes > Batería > Sin restricciones.\n2. En Tareas Recientes, mantén presionada ByteBridge y activa el candado 🔒.\n3. Activa 'Inicio automático'."
            )
            manufacturer.contains("transsion") || manufacturer.contains("tecno") || manufacturer.contains("infinix") -> ManufacturerInfo(
                brand = "Tecno / Infinix (HiOS / XOS)",
                tip = "1. Ve a Phone Master > Gestión de inicio automático > Activa ByteBridge.\n2. En batería, desactiva la optimización inteligente para ByteBridge."
            )
            manufacturer.contains("samsung") -> ManufacturerInfo(
                brand = "Samsung (One UI)",
                tip = "1. Ve a Ajustes > Aplicaciones > ByteBridge > Batería > Selecciona 'No restringida'.\n2. En Cuidado del dispositivo > Batería, desactiva 'Suspender apps sin uso'."
            )
            manufacturer.contains("huawei") || manufacturer.contains("honor") -> ManufacturerInfo(
                brand = "Huawei / Honor (EMUI / MagicOS)",
                tip = "1. Ve a Ajustes > Batería > Inicio de aplicaciones > ByteBridge > Cambia a 'Gestionar manualmente' y activa Inicio automático y Ejecutar en segundo plano."
            )
            else -> null
        }
    }
}

data class ManufacturerInfo(
    val brand: String,
    val tip: String
)
