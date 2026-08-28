package expo.modules.zenappusage

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ZenAppUsageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ZenAppUsage")

    Events(
      "onForegroundAppChanged",
      "onBlockedAppIntercepted",
      "onMonitoringStoppedFromOverlay",
      "onMoodInterventionCompleted",
    )

    OnCreate {
      moduleInstance = this@ZenAppUsageModule
    }

    OnDestroy {
      if (moduleInstance === this@ZenAppUsageModule) {
        moduleInstance = null
      }
    }

    AsyncFunction("isUsageAccessGranted") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      AppUsageHelper.isUsageAccessGranted(context)
    }

    AsyncFunction("openUsageAccessSettings") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      AppUsageHelper.openUsageAccessSettings(context)
      null
    }

    AsyncFunction("canDrawOverlays") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      Settings.canDrawOverlays(context)
    }

    AsyncFunction("openOverlaySettings") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}")
      ).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      null
    }

    AsyncFunction("getCurrentForegroundApp") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      val result = AppUsageHelper.getCurrentForegroundApp(context) ?: return@AsyncFunction null
      val (packageName, appName) = result
      mapOf(
        "packageName" to packageName,
        "appName" to appName
      )
    }

    AsyncFunction("startMonitoring") { intervalMs: Double, blockedUntil: Double, packageNames: List<String>, appNames: List<String> ->
      val context = appContext.reactContext ?: return@AsyncFunction false
      if (!AppUsageHelper.isUsageAccessGranted(context)) {
        return@AsyncFunction false
      }
      val safeInterval = intervalMs.toLong().coerceIn(800L, 10_000L)
      AppUsageMonitorService.start(
        context,
        safeInterval,
        blockedUntil.toLong(),
        packageNames,
        appNames
      )
      true
    }

    AsyncFunction("stopMonitoring") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      AppUsageMonitorService.stop(context)
      true
    }

    AsyncFunction("isMonitoring") {
      AppUsageMonitorService.isRunning
    }

    AsyncFunction("consumeOverlayStopRequest") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      AppUsageMonitorService.consumeStoppedFromOverlay(context)
    }

    AsyncFunction("syncMoodIntervention") { packageNames: List<String>, appNames: List<String>, cooldownMs: Double ->
      val context = appContext.reactContext ?: return@AsyncFunction false
      if (!AppUsageHelper.isUsageAccessGranted(context)) {
        return@AsyncFunction false
      }
      val safeCooldown = cooldownMs.toLong().coerceIn(15_000L, 60 * 60 * 1000L)
      AppUsageMonitorService.syncMoodIntervention(
        context,
        packageNames,
        appNames,
        safeCooldown,
      )
      true
    }
  }

  companion object {
    @Volatile
    private var moduleInstance: ZenAppUsageModule? = null

    fun emitForegroundApp(
      packageName: String,
      appName: String?,
      detectedAt: Long,
      isBlocked: Boolean,
    ) {
      moduleInstance?.sendEvent(
        "onForegroundAppChanged",
        mapOf(
          "packageName" to packageName,
          "appName" to appName,
          "detectedAt" to detectedAt,
          "isBlocked" to isBlocked
        )
      )
    }

    fun emitBlockedIntercept(packageName: String, appName: String?, detectedAt: Long) {
      moduleInstance?.sendEvent(
        "onBlockedAppIntercepted",
        mapOf(
          "packageName" to packageName,
          "appName" to appName,
          "detectedAt" to detectedAt,
          "isBlocked" to true
        )
      )
    }

    fun emitMonitoringStoppedFromOverlay() {
      moduleInstance?.sendEvent("onMonitoringStoppedFromOverlay", emptyMap<String, Any>())
    }

    fun emitMoodInterventionCompleted(packageName: String) {
      moduleInstance?.sendEvent(
        "onMoodInterventionCompleted",
        mapOf("packageName" to packageName)
      )
    }
  }
}
