package com.runneros.app

import android.Manifest
import android.bluetooth.*
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.PluginMethod
import java.util.UUID

@CapacitorPlugin(name="RunnerOSHeartRate")
class RunnerOSHeartRatePlugin: Plugin(){
    companion object { val SERVICE=UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb"); val CHAR=UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb"); val CCCD=UUID.fromString("00002902-0000-1000-8000-00805f9b34fb") }
    private var gatt:BluetoothGatt?=null
    private var scanner:BluetoothLeScanner?=null
    private val cb=object:BluetoothGattCallback(){
      override fun onConnectionStateChange(g:BluetoothGatt,status:Int,newState:Int){ if(newState==BluetoothProfile.STATE_CONNECTED){gatt=g;g.discoverServices();notifyListeners("status",JSObject().put("status","connected"))} else if(newState==BluetoothProfile.STATE_DISCONNECTED){notifyListeners("status",JSObject().put("status","disconnected"))} }
      override fun onServicesDiscovered(g:BluetoothGatt,status:Int){ val c=g.getService(SERVICE)?.getCharacteristic(CHAR) ?: return; g.setCharacteristicNotification(c,true); c.getDescriptor(CCCD)?.let{it.value=BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE;g.writeDescriptor(it)} }
      override fun onCharacteristicChanged(g:BluetoothGatt,c:BluetoothGattCharacteristic){ if(c.uuid==CHAR && c.value.isNotEmpty()){ val flags=c.value[0].toInt() and 0xff; val oneByte=(flags and 1)==0; val bpm=if(oneByte)c.value[1].toInt() and 0xff else ((c.value[2].toInt() and 0xff) shl 8) or (c.value[1].toInt() and 0xff); notifyListeners("heartRate",JSObject().put("bpm",bpm).put("ts",System.currentTimeMillis()).put("source","ble")) } }
    }
    private fun permsOk():Boolean=Build.VERSION.SDK_INT<31 || (ContextCompat.checkSelfPermission(context,Manifest.permission.BLUETOOTH_SCAN)==PackageManager.PERMISSION_GRANTED && ContextCompat.checkSelfPermission(context,Manifest.permission.BLUETOOTH_CONNECT)==PackageManager.PERMISSION_GRANTED)
    @PluginMethod fun requestPermissions(call:PluginCall){ if(Build.VERSION.SDK_INT>=31)requestPermissions(arrayOf(Manifest.permission.BLUETOOTH_SCAN,Manifest.permission.BLUETOOTH_CONNECT),call,"blePerms") else call.resolve() }
    @PluginMethod fun scan(call:PluginCall){ if(!permsOk()){call.reject("Bluetooth permissions missing");return}; val mgr=context.getSystemService(BluetoothManager::class.java); val adapter=mgr?.adapter ?: run{call.reject("Bluetooth unavailable");return}; scanner=adapter.bluetoothLeScanner; val results=mutableMapOf<String,JSObject>(); val scan=object:ScanCallback(){override fun onScanResult(t:Int,r:ScanResult){val d=r.device; results[d.address]=JSObject().put("id",d.address).put("name",d.name ?: "HR sensor").put("rssi",r.rssi)}}; scanner?.startScan(scan); android.os.Handler(mainLooper).postDelayed({scanner?.stopScan(scan);val arr=com.getcapacitor.JSArray();results.values.forEach{arr.put(it)};call.resolve(JSObject().put("devices",arr))},5000)}
    @PluginMethod fun connect(call:PluginCall){ if(!permsOk()){call.reject("Bluetooth permissions missing");return}; val id=call.getString("id") ?: return call.reject("Brak id"); val mgr=context.getSystemService(BluetoothManager::class.java); val device=mgr?.adapter?.getRemoteDevice(id) ?: return call.reject("Urządzenie nie znalezione"); gatt=device.connectGatt(context,false,cb); this.gatt=gatt;call.resolve(JSObject().put("connecting",true)) }
    @PluginMethod fun disconnect(call:PluginCall){gatt?.disconnect();gatt?.close();gatt=null;call.resolve(JSObject().put("disconnected",true))}
}
