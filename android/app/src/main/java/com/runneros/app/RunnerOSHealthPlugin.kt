package com.runneros.app

import android.content.Intent
import android.os.Build
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.Length
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.PluginMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.Instant

@CapacitorPlugin(name = "RunnerOSHealth")
class RunnerOSHealthPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private fun client(): HealthConnectClient? {
        if (Build.VERSION.SDK_INT < 28) return null
        return try { HealthConnectClient.getOrCreate(context) } catch (_: Throwable) { null }
    }

    private fun permissions() = setOf(
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getWritePermission(ExerciseSessionRecord::class),
        HealthPermission.getWritePermission(DistanceRecord::class)
    )

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val status = if (Build.VERSION.SDK_INT >= 28) HealthConnectClient.getSdkStatus(context) else HealthConnectClient.SDK_UNAVAILABLE
        val ret = JSObject()
        ret.put("available", status == HealthConnectClient.SDK_AVAILABLE)
        ret.put("status", status)
        call.resolve(ret)
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        val hc = client() ?: run { call.reject("Health Connect nie jest dostępny na tym urządzeniu."); return }
        scope.launch {
            try {
                val granted = hc.permissionController.getGrantedPermissions()
                val needed = permissions().filterNot { granted.contains(it) }.toSet()
                if (needed.isEmpty()) {
                    withContext(Dispatchers.Main) { call.resolve(JSObject().put("granted", true)) }
                    return@launch
                }
                val contract = PermissionController.createRequestPermissionResultContract()
                val intent = contract.createIntent(context, needed)
                startActivityForResult(call, intent, "handleHealthPermissionResult")
            } catch (e: Throwable) {
                withContext(Dispatchers.Main) { call.reject(e.message ?: "Nie udało się otworzyć Health Connect.") }
            }
        }
    }

    @ActivityCallback
    fun handleHealthPermissionResult(call: PluginCall, result: ActivityResult) {
        if (result.resultCode != android.app.Activity.RESULT_OK) { call.resolve(JSObject().put("granted", false)); return }
        scope.launch {
            val hc = client()
            val granted = hc?.permissionController?.getGrantedPermissions()?.containsAll(permissions()) == true
            withContext(Dispatchers.Main) { call.resolve(JSObject().put("granted", granted)) }
        }
    }

    @PluginMethod
    fun writeActivity(call: PluginCall) {
        val hc = client() ?: run { call.resolve(JSObject().put("written", false).put("reason", "unavailable")); return }
        val started = call.getDouble("startedAt") ?: return call.reject("Brak startedAt")
        val ended = call.getDouble("endedAt") ?: return call.reject("Brak endedAt")
        val distance = call.getDouble("distanceM") ?: 0.0
        val start = Instant.ofEpochMilli(started.toLong())
        val end = Instant.ofEpochMilli(ended.toLong())
        scope.launch {
            try {
                val granted = hc.permissionController.getGrantedPermissions()
                val needed = permissions()
                if (!granted.contains(HealthPermission.getWritePermission(ExerciseSessionRecord::class))) {
                    withContext(Dispatchers.Main) { call.resolve(JSObject().put("written", false).put("reason", "permission")) }
                    return@launch
                }
                val session = ExerciseSessionRecord(
                    startTime = start,
                    startZoneOffset = java.time.ZoneId.systemDefault().rules.getOffset(start),
                    endTime = end,
                    endZoneOffset = java.time.ZoneId.systemDefault().rules.getOffset(end),
                    metadata = Metadata.autoRecorded(),
                    exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_RUNNING,
                    title = "RunnerOS Bieg",
                    notes = "Zapisano przez RunnerOS"
                )
                val records = mutableListOf<androidx.health.connect.client.records.Record>(session)
                if (distance > 0 && granted.contains(HealthPermission.getWritePermission(DistanceRecord::class))) {
                    records += DistanceRecord(
                        startTime = start,
                        startZoneOffset = java.time.ZoneId.systemDefault().rules.getOffset(start),
                        endTime = end,
                        endZoneOffset = java.time.ZoneId.systemDefault().rules.getOffset(end),
                        distance = Length.meters(distance),
                        metadata = Metadata.autoRecorded()
                    )
                }
                hc.insertRecords(records)
                withContext(Dispatchers.Main) { call.resolve(JSObject().put("written", true).put("records", records.size)) }
            } catch (e: Throwable) {
                withContext(Dispatchers.Main) { call.resolve(JSObject().put("written", false).put("reason", e.message ?: "Health Connect write failed")) }
            }
        }
    }

    @PluginMethod
    fun readHeartRate(call: PluginCall) {
        val hc = client() ?: run { call.resolve(JSObject().put("samples", JSArray())); return }
        val startMs = call.getDouble("startTime")?.toLong() ?: return call.reject("Brak startTime")
        val endMs = call.getDouble("endTime")?.toLong() ?: return call.reject("Brak endTime")
        scope.launch {
            try {
                val response = hc.readRecords(ReadRecordsRequest<HeartRateRecord>(timeRangeFilter = TimeRangeFilter.between(Instant.ofEpochMilli(startMs), Instant.ofEpochMilli(endMs))))
                val arr = JSArray()
                response.records.flatMap { it.samples }.forEach { sample ->
                    arr.put(JSObject().put("bpm", sample.beatsPerMinute).put("ts", sample.time.toEpochMilli()))
                }
                withContext(Dispatchers.Main) { call.resolve(JSObject().put("samples", arr)) }
            } catch (e: Throwable) {
                withContext(Dispatchers.Main) { call.resolve(JSObject().put("samples", JSArray()).put("error", e.message ?: "read failed")) }
            }
        }
    }
}
