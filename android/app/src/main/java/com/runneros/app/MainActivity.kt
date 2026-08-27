package com.runneros.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(RunnerOSLocationPlugin::class.java)
        registerPlugin(RunnerOSHealthPlugin::class.java)
        registerPlugin(RunnerOSHeartRatePlugin::class.java)
        registerPlugin(RunnerOSTtsPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
