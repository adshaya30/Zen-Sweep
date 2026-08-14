package expo.modules.zenappusage

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat

class AppUsageMonitorService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private var intervalMs = DEFAULT_INTERVAL_MS
  private var lastPackage: String? = null
  private var overlay: BlockingOverlay? = null
  private var moodOverlay: MoodOverlay? = null

  private val pollRunnable = object : Runnable {
    override fun run() {
      evaluateForeground()
      handler.postDelayed(this, intervalMs)
    }
  }

  private val timerRunnable = object : Runnable {
    override fun run() {
      updateRunningTimer()
      handler.postDelayed(this, 1000L)
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> {
        if (intent?.getBooleanExtra(EXTRA_FROM_OVERLAY, false) == true) {
          markStoppedFromOverlay(applicationContext)
          ZenAppUsageModule.emitMonitoringStoppedFromOverlay()
        }
        // Stop the timer only. Keep mood watching if any apps are enabled.
        overlay?.hide()
        blockedPackages = emptySet()
        blockedUntil = 0L
        if (moodPackages.isEmpty()) {
          stopInternal()
        } else {
          updateNotification(currentNotificationText())
        }
        return START_STICKY
      }
      ACTION_SYNC_MOOD -> {
        applyMoodExtras(intent)
        if (overlay == null) {
          overlay = BlockingOverlay(applicationContext)
        }
        if (moodOverlay == null) {
          moodOverlay = MoodOverlay(applicationContext)
        }
        // startForegroundService() requires startForeground() within ~5s,
        // even if we immediately decide there is nothing to watch.
        startAsForeground()
        handler.removeCallbacks(pollRunnable)
        handler.removeCallbacks(timerRunnable)
        handler.post(pollRunnable)
        handler.post(timerRunnable)
        isRunning = true

        val timerLive = blockedUntil > System.currentTimeMillis()
        if (moodPackages.isEmpty() && !timerLive) {
          stopInternal()
          return START_NOT_STICKY
        }
        return START_STICKY
      }
      else -> {
        intervalMs = intent?.getLongExtra(EXTRA_INTERVAL_MS, DEFAULT_INTERVAL_MS)
          ?: DEFAULT_INTERVAL_MS
        blockedUntil = intent?.getLongExtra(EXTRA_BLOCKED_UNTIL, 0L) ?: 0L
        blockedPackages = intent?.getStringArrayListExtra(EXTRA_PACKAGES)?.toSet()
          ?: emptySet()
        val names = intent?.getStringArrayListExtra(EXTRA_NAMES).orEmpty()
        val packages = intent?.getStringArrayListExtra(EXTRA_PACKAGES).orEmpty()
        appNames = packages.mapIndexed { index, pkg ->
          pkg to (names.getOrNull(index) ?: pkg)
        }.toMap()
        applyMoodExtras(intent)

        if (overlay == null) {
          overlay = BlockingOverlay(applicationContext)
        }
        if (moodOverlay == null) {
          moodOverlay = MoodOverlay(applicationContext)
        }
        startAsForeground()
        handler.removeCallbacks(pollRunnable)
        handler.removeCallbacks(timerRunnable)
        handler.post(pollRunnable)
        handler.post(timerRunnable)
        isRunning = true
      }
    }
    return START_STICKY
  }

  private fun applyMoodExtras(intent: Intent?) {
    val packages = intent?.getStringArrayListExtra(EXTRA_MOOD_PACKAGES)
    val names = intent?.getStringArrayListExtra(EXTRA_MOOD_NAMES).orEmpty()
    if (packages != null) {
      moodPackages = packages.toSet()
      moodAppNames = packages.mapIndexed { index, pkg ->
        pkg to (names.getOrNull(index) ?: pkg)
      }.toMap()
    }
    if (intent?.hasExtra(EXTRA_MOOD_COOLDOWN_MS) == true) {
      moodCooldownMs = intent.getLongExtra(EXTRA_MOOD_COOLDOWN_MS, DEFAULT_MOOD_COOLDOWN_MS)
    }
    loadMoodCooldowns(applicationContext)
  }

  private fun currentNotificationText(): String {
    val remaining = if (blockedUntil > 0L) blockedUntil - System.currentTimeMillis() else 0L
    return when {
      remaining > 0L -> "Time remaining ${formatRemaining(remaining)}"
      moodPackages.isNotEmpty() -> "Mood pause watching ${moodPackages.size} apps"
      else -> "Blocking focus session is active"
    }
  }

  override fun onDestroy() {
    stopInternal()
    super.onDestroy()
  }

  private fun updateRunningTimer() {
    val now = System.currentTimeMillis()
    if (blockedUntil <= 0L) {
      return
    }
    val remaining = blockedUntil - now
    if (remaining <= 0L) {
      overlay?.hide()
      updateNotification("Focus session finished")
      blockedPackages = emptySet()
      blockedUntil = 0L
      return
    }
    if (overlay?.isShowing == true) {
      overlay?.updateRemaining(remaining)
    }
    updateNotification("Time remaining ${formatRemaining(remaining)}")
  }

  private fun formatRemaining(remainingMs: Long): String {
    val totalSeconds = (remainingMs / 1000L).coerceAtLeast(0)
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return String.format("%02d:%02d", minutes, seconds)
  }

  private fun evaluateForeground() {
    val now = System.currentTimeMillis()
    if (blockedUntil > 0L && now >= blockedUntil) {
      overlay?.hide()
      blockedPackages = emptySet()
      blockedUntil = 0L
    }

    val result = AppUsageHelper.getCurrentForegroundApp(applicationContext)
    if (result == null) {
      return
    }

    val (packageName, detectedName) = result
    val appName = appNames[packageName]
      ?: moodAppNames[packageName]
      ?: detectedName
      ?: packageName
    val isOwnApp = packageName == applicationContext.packageName
    val isHome = AppUsageHelper.isLauncherPackage(packageName)
    val timerActive = blockedUntil > now && blockedPackages.contains(packageName)
    val packageChanged = packageName != lastPackage

    if (packageChanged) {
      lastPackage = packageName
      ZenAppUsageModule.emitForegroundApp(
        packageName = packageName,
        appName = appName,
        detectedAt = now,
        isBlocked = timerActive
      )
    }

    // Never cover Home with a leftover overlay.
    if (isHome) {
      overlay?.hide()
      if (moodOverlay?.isShowing == true) {
        moodOverlay?.hide()
      }
      return
    }

    // Drawing our overlay makes UsageStats report Zen Sweep as foreground.
    // Do not hide an in-progress mood pause because of that flicker.
    if (isOwnApp) {
      overlay?.hide()
      return
    }

    // PRIORITY 1: existing timer block — unchanged behavior.
    if (timerActive) {
      moodOverlay?.hide()
      overlay?.show(packageName, appName, blockedUntil - now)
      if (packageChanged) {
        ZenAppUsageModule.emitBlockedIntercept(
          packageName = packageName,
          appName = appName,
          detectedAt = now
        )
      }
      return
    }

    overlay?.hide()

    // PRIORITY 2: Mood Intervention (separate from timer block).
    if (moodOverlay?.isShowing == true) {
      // Keep the in-progress mood flow until Continue, unless user left that app.
      if (packageChanged && packageName != moodOverlay?.activePackageName) {
        moodOverlay?.hide()
      }
      return
    }

    val moodEnabled = moodPackages.contains(packageName)
    val cooldownOk = isMoodCooldownReady(packageName, now)
    if (moodEnabled && cooldownOk) {
      moodOverlay?.show(packageName, appName)
    }
  }

  private fun stopInternal() {
    handler.removeCallbacks(pollRunnable)
    handler.removeCallbacks(timerRunnable)
    overlay?.hide()
    overlay = null
    moodOverlay?.hide()
    moodOverlay = null
    lastPackage = null
    isRunning = false
    blockedPackages = emptySet()
    blockedUntil = 0L
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  private fun buildNotification(text: String): Notification {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = PendingIntent.getActivity(
      this,
      0,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    val stopIntent = Intent(this, AppUsageMonitorService::class.java).apply {
      action = ACTION_STOP
      putExtra(EXTRA_FROM_OVERLAY, true)
    }
    val stopPending = PendingIntent.getService(
      this,
      1,
      stopIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle(
        if (blockedUntil > System.currentTimeMillis()) {
          "Zen Sweep block active"
        } else {
          "Zen Sweep watching"
        }
      )
      .setContentText(text)
      .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
      .setContentIntent(pendingIntent)
      .addAction(0, "Stop blocking", stopPending)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }

  private fun updateNotification(text: String) {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(NOTIFICATION_ID, buildNotification(text))
  }

  private fun startAsForeground() {
    createChannel()
    val notification = buildNotification(currentNotificationText())

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Focus monitoring",
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "Shown while Zen Sweep monitors and blocks selected apps"
    }
    manager.createNotificationChannel(channel)
  }

  companion object {
    const val ACTION_START = "expo.modules.zenappusage.START_MONITORING"
    const val ACTION_STOP = "expo.modules.zenappusage.STOP_MONITORING"
    const val ACTION_SYNC_MOOD = "expo.modules.zenappusage.SYNC_MOOD"
    const val EXTRA_INTERVAL_MS = "intervalMs"
    const val EXTRA_BLOCKED_UNTIL = "blockedUntil"
    const val EXTRA_PACKAGES = "blockedPackages"
    const val EXTRA_NAMES = "blockedNames"
    const val EXTRA_MOOD_PACKAGES = "moodPackages"
    const val EXTRA_MOOD_NAMES = "moodNames"
    const val EXTRA_MOOD_COOLDOWN_MS = "moodCooldownMs"
    const val EXTRA_INTERVENTION = "zen_sweep_intervention"
    const val EXTRA_BLOCKED_APP_NAME = "blocked_app_name"
    const val EXTRA_BLOCKED_PACKAGE = "blocked_package"
    const val EXTRA_FROM_OVERLAY = "fromOverlay"
    const val DEFAULT_INTERVAL_MS = 1500L
    const val DEFAULT_MOOD_COOLDOWN_MS = 45 * 1000L
    private const val CHANNEL_ID = "zen_sweep_usage_monitor"
    private const val NOTIFICATION_ID = 54001
    private const val PREFS_NAME = "zen_sweep_usage"
    private const val KEY_STOPPED_FROM_OVERLAY = "stopped_from_overlay"
    private const val KEY_MOOD_COOLDOWNS = "mood_cooldowns"
    private const val KEY_MOOD_PACKAGES = "mood_packages"

    @Volatile
    var isRunning: Boolean = false
      private set

    @Volatile
    var blockedUntil: Long = 0L
      private set

    @Volatile
    var blockedPackages: Set<String> = emptySet()
      private set

    @Volatile
    var appNames: Map<String, String> = emptyMap()
      private set

    @Volatile
    var moodPackages: Set<String> = emptySet()
      private set

    @Volatile
    var moodAppNames: Map<String, String> = emptyMap()
      private set

    @Volatile
    var moodCooldownMs: Long = DEFAULT_MOOD_COOLDOWN_MS
      private set

    @Volatile
    private var moodLastShown: MutableMap<String, Long> = mutableMapOf()

    fun start(
      context: Context,
      intervalMs: Long,
      blockedUntil: Long,
      packages: List<String>,
      names: List<String>,
    ) {
      clearStoppedFromOverlay(context)
      val moodPkgs = readMoodPackages(context)
      val intent = Intent(context, AppUsageMonitorService::class.java).apply {
        action = ACTION_START
        putExtra(EXTRA_INTERVAL_MS, intervalMs)
        putExtra(EXTRA_BLOCKED_UNTIL, blockedUntil)
        putStringArrayListExtra(EXTRA_PACKAGES, ArrayList(packages))
        putStringArrayListExtra(EXTRA_NAMES, ArrayList(names))
        putStringArrayListExtra(EXTRA_MOOD_PACKAGES, ArrayList(moodPkgs))
        putExtra(EXTRA_MOOD_COOLDOWN_MS, moodCooldownMs)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun syncMoodIntervention(
      context: Context,
      packages: List<String>,
      names: List<String>,
      cooldownMs: Long = DEFAULT_MOOD_COOLDOWN_MS,
    ) {
      saveMoodPackages(context, packages)
      moodAppNames = packages.mapIndexed { index, pkg ->
        pkg to (names.getOrNull(index) ?: pkg)
      }.toMap()
      moodCooldownMs = cooldownMs
      clearMoodCooldowns(context)
      val timerLive = blockedUntil > System.currentTimeMillis()
      // Do not start a foreground service just to shut it down — Android
      // crashes the app if startForeground() is not called in time.
      if (packages.isEmpty() && !isRunning && !timerLive) {
        return
      }
      val intent = Intent(context, AppUsageMonitorService::class.java).apply {
        action = ACTION_SYNC_MOOD
        putStringArrayListExtra(EXTRA_MOOD_PACKAGES, ArrayList(packages))
        putStringArrayListExtra(EXTRA_MOOD_NAMES, ArrayList(names))
        putExtra(EXTRA_MOOD_COOLDOWN_MS, cooldownMs)
        putExtra(EXTRA_INTERVAL_MS, DEFAULT_INTERVAL_MS)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      val intent = Intent(context, AppUsageMonitorService::class.java).apply {
        action = ACTION_STOP
      }
      context.startService(intent)
    }

    fun stopFromOverlay(context: Context) {
      val intent = Intent(context, AppUsageMonitorService::class.java).apply {
        action = ACTION_STOP
        putExtra(EXTRA_FROM_OVERLAY, true)
      }
      context.startService(intent)
    }

    fun markMoodCooldowned(context: Context, packageName: String) {
      val now = System.currentTimeMillis()
      moodLastShown[packageName] = now
      persistMoodCooldowns(context)
    }

    fun clearMoodCooldowns(context: Context) {
      moodLastShown = mutableMapOf()
      persistMoodCooldowns(context)
    }

    fun isMoodCooldownReady(packageName: String, now: Long): Boolean {
      val last = moodLastShown[packageName] ?: return true
      return now - last >= moodCooldownMs
    }

    fun consumeStoppedFromOverlay(context: Context): Boolean {
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val stopped = prefs.getBoolean(KEY_STOPPED_FROM_OVERLAY, false)
      if (stopped) {
        prefs.edit().putBoolean(KEY_STOPPED_FROM_OVERLAY, false).apply()
      }
      return stopped
    }

    private fun markStoppedFromOverlay(context: Context) {
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putBoolean(KEY_STOPPED_FROM_OVERLAY, true)
        .apply()
    }

    private fun clearStoppedFromOverlay(context: Context) {
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putBoolean(KEY_STOPPED_FROM_OVERLAY, false)
        .apply()
    }

    private fun saveMoodPackages(context: Context, packages: List<String>) {
      moodPackages = packages.toSet()
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putStringSet(KEY_MOOD_PACKAGES, packages.toSet())
        .apply()
    }

    private fun readMoodPackages(context: Context): List<String> {
      val stored = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .getStringSet(KEY_MOOD_PACKAGES, emptySet())
        ?: emptySet()
      moodPackages = stored
      return stored.toList()
    }

    private fun loadMoodCooldowns(context: Context) {
      val raw = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .getString(KEY_MOOD_COOLDOWNS, null)
        ?: return
      val map = mutableMapOf<String, Long>()
      raw.split('|').forEach { part ->
        val bits = part.split('=')
        if (bits.size == 2) {
          map[bits[0]] = bits[1].toLongOrNull() ?: return@forEach
        }
      }
      moodLastShown = map
    }

    private fun persistMoodCooldowns(context: Context) {
      val raw = moodLastShown.entries.joinToString("|") { "${it.key}=${it.value}" }
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putString(KEY_MOOD_COOLDOWNS, raw)
        .apply()
    }
  }
}
