package expo.modules.zenappusage

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings

object AppUsageHelper {
  fun isUsageAccessGranted(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName
      )
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  fun openUsageAccessSettings(context: Context) {
    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
  }

  fun getAppName(context: Context, packageName: String): String? {
    return try {
      val pm = context.packageManager
      val info = pm.getApplicationInfo(packageName, 0)
      pm.getApplicationLabel(info).toString()
    } catch (_: PackageManager.NameNotFoundException) {
      null
    }
  }

  fun isLauncherPackage(packageName: String): Boolean {
    return LAUNCHERS.contains(packageName)
  }

  /**
   * Returns the most recent foreground app package using UsageEvents.
   * Ignores only system UI / keyboards so Home and Zen Sweep are detected.
   */
  fun getCurrentForegroundApp(context: Context): Pair<String, String?>? {
    if (!isUsageAccessGranted(context)) {
      return null
    }

    val usageStatsManager =
      context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

    val end = System.currentTimeMillis()
    val begin = end - 60_000L

    data class Candidate(val packageName: String, val timestamp: Long)

    val candidates = mutableListOf<Candidate>()

    val events = usageStatsManager.queryEvents(begin, end)
    val event = UsageEvents.Event()
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      val type = event.eventType
      val isResume =
        type == UsageEvents.Event.ACTIVITY_RESUMED ||
          type == UsageEvents.Event.MOVE_TO_FOREGROUND

      if (isResume) {
        candidates.add(Candidate(event.packageName, event.timeStamp))
      }
    }

    if (candidates.isEmpty()) {
      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_BEST,
        begin,
        end
      )
      stats
        ?.sortedByDescending { it.lastTimeUsed }
        ?.forEach { candidates.add(Candidate(it.packageName, it.lastTimeUsed)) }
    }

    val packageName = candidates
      .sortedByDescending { it.timestamp }
      .firstOrNull { !shouldIgnorePackage(it.packageName) }
      ?.packageName
      ?: return null

    return packageName to getAppName(context, packageName)
  }

  private fun shouldIgnorePackage(packageName: String): Boolean {
    return IGNORED_SYSTEM.contains(packageName)
  }

  private val LAUNCHERS = setOf(
    "com.android.launcher",
    "com.android.launcher3",
    "com.google.android.apps.nexuslauncher",
    "com.sec.android.app.launcher",
    "com.samsung.android.launcher",
    "com.sec.android.app.twlauncher",
    "com.samsung.android.app.launcher",
    "com.miui.home",
    "com.huawei.android.launcher",
    "com.oppo.launcher",
    "com.android.settings"
  )

  private val IGNORED_SYSTEM = setOf(
    "com.android.systemui",
    "com.android.inputmethod.latin",
    "com.google.android.inputmethod.latin",
    "com.samsung.android.honeyboard"
  )
}
