package com.runneros.app

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicBoolean

class RunnerLocationService : Service() {
    companion object {
        const val CHANNEL_ID = "runneros_tracking"
        const val NOTIFICATION_ID = 4107
        private const val PREFS = "runneros_location"
        private const val BUFFER_KEY = "buffer"
        private const val ACTION_START = "com.runneros.app.location.START"
        private const val ACTION_STOP = "com.runneros.app.location.STOP"
        val running get() = runningFlag.get()
        private val runningFlag = AtomicBoolean(false)

        fun start(context: Context) {
            val intent = Intent(context, RunnerLocationService::class.java).apply { action = ACTION_START }
            ContextCompat.startForegroundService(context, intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, RunnerLocationService::class.java).apply { action = ACTION_STOP }
            context.startService(intent)
        }

        fun getBufferedPoints(context: Context): JSONArray {
            val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(BUFFER_KEY, "[]") ?: "[]"
            return try { JSONArray(raw) } catch (_: Exception) { JSONArray() }
        }

        fun clearBufferedPoints(context: Context) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(BUFFER_KEY).apply()
        }
    }

    private lateinit var fused: FusedLocationProviderClient
    private lateinit var callback: LocationCallback
    private val buffer = mutableListOf<JSONObject>()

    override fun onCreate() {
        super.onCreate()
        createChannel()
        fused = LocationServices.getFusedLocationProviderClient(this)
        loadBuffer()
        callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (location in result.locations) {
                    val o = JSONObject()
                        .put("lat", location.latitude)
                        .put("lng", location.longitude)
                        .put("ts", location.time)
                        .put("accuracy", location.accuracy.toDouble())
                    if (location.hasAltitude()) o.put("altitude", location.altitude)
                    if (location.hasSpeed()) o.put("speed", location.speed.toDouble())
                    buffer.add(o)
                    if (buffer.size > 12000) buffer.removeAt(0)
                    persistBuffer()
                    val js = com.getcapacitor.JSObject().apply {
                        put("lat", location.latitude)
                        put("lng", location.longitude)
                        put("ts", location.time)
                        put("accuracy", location.accuracy.toDouble())
                        if (location.hasAltitude()) put("altitude", location.altitude)
                        if (location.hasSpeed()) put("speed", location.speed.toDouble())
                        put("source", "android")
                    }
                    RunnerOSLocationPlugin.emitLocation(js)
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> stopTracking()
            else -> startTracking()
        }
        return START_STICKY
    }

    private fun startTracking() {
        if (runningFlag.get()) return
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!fine && !coarse) {
            RunnerOSLocationPlugin.emitStatus("permission_denied")
            stopSelf()
            return
        }
        val notification = buildNotification()
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)

        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L)
            .setMinUpdateIntervalMillis(750L)
            .setMinUpdateDistanceMeters(3f)
            .setWaitForAccurateLocation(false)
            .build()
        fused.requestLocationUpdates(request, callback, mainLooper)
        runningFlag.set(true)
        RunnerOSLocationPlugin.emitStatus("running")
    }

    private fun stopTracking() {
        if (::fused.isInitialized && ::callback.isInitialized) {
            fused.removeLocationUpdates(callback)
        }
        runningFlag.set(false)
        RunnerOSLocationPlugin.emitStatus("stopped")
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(): Notification {
        val pi = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(com.runneros.app.R.drawable.ic_runneros_stat)
            .setContentTitle("RunnerOS • trening aktywny")
            .setContentText("GPS działa w tle. Rejestracja jest aktywna.")
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setContentIntent(pi)
            .setOnlyAlertOnce(true)
            .build()
    }

    private fun createChannel() {
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "RunnerOS GPS", NotificationManager.IMPORTANCE_LOW))
    }

    private fun loadBuffer() {
        buffer.clear()
        val arr = getBufferedPoints(this)
        for (i in 0 until arr.length()) buffer.add(arr.optJSONObject(i) ?: JSONObject())
    }

    private fun persistBuffer() {
        val arr = JSONArray()
        buffer.forEach { arr.put(it) }
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(BUFFER_KEY, arr.toString()).apply()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        if (::fused.isInitialized && ::callback.isInitialized) fused.removeLocationUpdates(callback)
        runningFlag.set(false)
        super.onDestroy()
    }
}
