package com.runneros.app

import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.speech.tts.TextToSpeech
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.Locale

@CapacitorPlugin(name = "RunnerOSTts")
class RunnerOSTtsPlugin : Plugin(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var ready = false
    private var audioManager: AudioManager? = null
    private var focusRequest: AudioFocusRequest? = null

    override fun load() {
        super.load()
        audioManager = context.getSystemService(AudioManager::class.java)
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        ready = status == TextToSpeech.SUCCESS
        if (ready) {
            tts?.language = Locale("pl", "PL")
            tts?.setSpeechRate(1.0f)
            tts?.setPitch(1.0f)
        }
    }

    @PluginMethod
    fun speak(call: PluginCall) {
        val text = call.getString("text")?.trim().orEmpty()
        if (!ready || text.isBlank()) { call.reject("TTS unavailable"); return }
        val duck = call.getBoolean("duck", true)
        if (duck) requestFocus()
        val result = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "runneros-${System.currentTimeMillis()}") ?: TextToSpeech.ERROR
        if (result == TextToSpeech.SUCCESS) call.resolve(JSObject().put("spoken", true)) else call.reject("TTS speak failed")
    }

    @PluginMethod
    fun stop(call: PluginCall) { tts?.stop(); abandonFocus(); call.resolve(JSObject().put("stopped", true)) }

    private fun requestFocus() {
        val am = audioManager ?: return
        if (Build.VERSION.SDK_INT >= 26) {
            val attrs = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()
            focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK).setAudioAttributes(attrs).build()
            am.requestAudioFocus(focusRequest!!)
        } else {
            @Suppress("DEPRECATION") am.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
        }
    }

    private fun abandonFocus() {
        val am = audioManager ?: return
        if (Build.VERSION.SDK_INT >= 26) focusRequest?.let { am.abandonAudioFocusRequest(it) }
        else { @Suppress("DEPRECATION") am.abandonAudioFocus(null) }
    }

    override fun handleOnDestroy() { tts?.stop(); tts?.shutdown(); abandonFocus(); super.handleOnDestroy() }
}
