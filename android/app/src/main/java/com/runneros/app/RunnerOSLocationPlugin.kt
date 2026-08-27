package com.runneros.app

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(
    name = "RunnerOSLocation",
    permissions = [
        com.getcapacitor.annotation.Permission(
            alias = "location",
            strings = [Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION]
        )
    ]
)
class RunnerOSLocationPlugin : Plugin() {
    companion object {
        @Volatile private var instance: RunnerOSLocationPlugin? = null

        fun emitLocation(data: JSObject) {
            instance?.notifyListeners("location", data, false)
        }

        fun emitStatus(status: String) {
            val obj = JSObject()
            obj.put("status", status)
            instance?.notifyListeners("status", obj, false)
        }
    }

    override fun load() {
        super.load()
        instance = this
    }

    override fun handleOnDestroy() {
        if (instance === this) instance = null
        super.handleOnDestroy()
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (fine || coarse) {
            val ret = JSObject()
            ret.put("requested", false)
            ret.put("granted", true)
            call.resolve(ret)
            return
        }
        requestPermissionForAlias("location", call, "locationPerms")
    }

    @PluginMethod
    fun start(call: PluginCall) {
        val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!fine && !coarse) {
            call.reject("Location permission not granted")
            return
        }
        RunnerLocationService.start(context)
        val ret = JSObject()
        ret.put("started", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        RunnerLocationService.stop(context)
        val ret = JSObject()
        ret.put("stopped", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun isRunning(call: PluginCall) {
        val ret = JSObject()
        ret.put("running", RunnerLocationService.running)
        call.resolve(ret)
    }

    @PluginMethod
    fun getBufferedPoints(call: PluginCall) {
        val ret = JSObject()
        ret.put("points", RunnerLocationService.getBufferedPoints(context))
        call.resolve(ret)
    }

    @PluginMethod
    fun clearBufferedPoints(call: PluginCall) {
        RunnerLocationService.clearBufferedPoints(context)
        val ret = JSObject()
        ret.put("cleared", true)
        call.resolve(ret)
    }
}
