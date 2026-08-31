package com.bytebridge.gateway.data.preference

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.bytebridge.gateway.core.model.BusinessConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "bytebridge_settings")

class AppPreferences(private val context: Context) {

    companion object {
        private val KEY_BUSINESS_NAME = stringPreferencesKey("business_name")
        private val KEY_WEBHOOK_URL = stringPreferencesKey("webhook_url")
        private val KEY_API_KEY = stringPreferencesKey("api_key")
        private val KEY_IS_ACTIVE = booleanPreferencesKey("is_active")
        private val KEY_CREATED_AT = longPreferencesKey("created_at")

        private val KEY_DAEMON_RUNNING = booleanPreferencesKey("daemon_running")
        private val KEY_AUTO_START_BOOT = booleanPreferencesKey("auto_start_boot")
    }

    val businessConfigFlow: Flow<BusinessConfig> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            BusinessConfig(
                businessName = preferences[KEY_BUSINESS_NAME] ?: "PinZulia / The Corner",
                webhookUrl = preferences[KEY_WEBHOOK_URL] ?: "",
                apiKey = preferences[KEY_API_KEY] ?: "",
                isActive = preferences[KEY_IS_ACTIVE] ?: true,
                createdAt = preferences[KEY_CREATED_AT] ?: System.currentTimeMillis()
            )
        }

    val isDaemonRunningFlow: Flow<Boolean> = context.dataStore.data
        .map { preferences -> preferences[KEY_DAEMON_RUNNING] ?: true }

    suspend fun saveBusinessConfig(config: BusinessConfig) {
        context.dataStore.edit { preferences ->
            preferences[KEY_BUSINESS_NAME] = config.businessName
            preferences[KEY_WEBHOOK_URL] = config.webhookUrl
            preferences[KEY_API_KEY] = config.apiKey
            preferences[KEY_IS_ACTIVE] = config.isActive
            preferences[KEY_CREATED_AT] = config.createdAt
        }
    }

    suspend fun setDaemonRunning(running: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_DAEMON_RUNNING] = running
        }
    }

    suspend fun setAutoStartBoot(autoStart: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_AUTO_START_BOOT] = autoStart
        }
    }
}
