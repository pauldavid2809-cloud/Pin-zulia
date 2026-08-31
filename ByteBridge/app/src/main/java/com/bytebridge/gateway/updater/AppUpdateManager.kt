package com.bytebridge.gateway.updater

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.content.FileProvider
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.util.concurrent.TimeUnit

data class UpdateInfo(
    val hasUpdate: Boolean,
    val latestVersionName: String,
    val latestVersionCode: Int,
    val releaseNotes: String,
    val apkDownloadUrl: String
)

data class UpdateServerResponse(
    val latestVersion: String,
    val versionCode: Int,
    val releaseNotes: String,
    val downloadUrl: String
)

object AppUpdateManager {

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(6, TimeUnit.SECONDS)
        .readTimeout(6, TimeUnit.SECONDS)
        .build()
    private val gson = Gson()

    suspend fun checkForUpdate(
        currentVersionCode: Int,
        updateCheckUrl: String
    ): UpdateInfo = withContext(Dispatchers.IO) {
        if (updateCheckUrl.isBlank()) {
            return@withContext UpdateInfo(false, "", currentVersionCode, "", "")
        }

        try {
            val request = Request.Builder().url(updateCheckUrl).build()
            val response = okHttpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: ""
                val serverInfo = gson.fromJson(body, UpdateServerResponse::class.java)
                val hasUpdate = serverInfo.versionCode > currentVersionCode
                UpdateInfo(
                    hasUpdate = hasUpdate,
                    latestVersionName = serverInfo.latestVersion,
                    latestVersionCode = serverInfo.versionCode,
                    releaseNotes = serverInfo.releaseNotes,
                    apkDownloadUrl = serverInfo.downloadUrl
                )
            } else {
                UpdateInfo(false, "", currentVersionCode, "", "")
            }
        } catch (_: Exception) {
            UpdateInfo(false, "", currentVersionCode, "", "")
        }
    }

    fun downloadAndInstall(context: Context, apkUrl: String, fileName: String = "ByteBridge_Update.apk") {
        try {
            val destination = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)
            if (destination.exists()) destination.delete()

            val request = DownloadManager.Request(Uri.parse(apkUrl))
                .setTitle("ByteBridge Actualización")
                .setDescription("Descargando nueva versión...")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationUri(Uri.fromFile(destination))

            val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val downloadId = manager.enqueue(request)

            val onComplete = object : BroadcastReceiver() {
                override fun onReceive(ctx: Context, intent: Intent) {
                    val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L)
                    if (id == downloadId) {
                        ctx.unregisterReceiver(this)
                        installApk(ctx, destination)
                    }
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(onComplete, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED)
            } else {
                context.registerReceiver(onComplete, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
            }
        } catch (e: Exception) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(browserIntent)
        }
    }

    private fun installApk(context: Context, file: File) {
        val apkUri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        } else {
            Uri.fromFile(file)
        }

        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
        }
        context.startActivity(installIntent)
    }
}
