package com.runneros.app

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class HealthPermissionsRationaleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(TextView(this).apply {
            text = "RunnerOS używa Health Connect wyłącznie do synchronizacji treningów i odczytu tętna, jeśli użytkownik przyzna odpowiednie uprawnienia. Dane nie są pobierane bez zgody."
            setPadding(40, 60, 40, 60)
        })
    }
}
