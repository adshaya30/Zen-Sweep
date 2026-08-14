package expo.modules.zenappusage

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Timer-block overlay — matches Zen Sweep cream / forest theme.
 * Dark status-bar strip keeps light system icons readable over dark apps.
 */
class BlockingOverlay(private val context: Context) {
  private val windowManager =
    context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
  private var root: FrameLayout? = null
  private var timeView: TextView? = null
  private var visiblePackage: String? = null

  val isShowing: Boolean
    get() = root != null

  fun canDraw(): Boolean {
    return Settings.canDrawOverlays(context)
  }

  fun show(packageName: String, appName: String, remainingMs: Long) {
    if (!canDraw()) {
      return
    }

    if (root != null && visiblePackage == packageName) {
      updateRemaining(remainingMs)
      return
    }

    hide()
    visiblePackage = packageName

    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()

    val cream = Color.parseColor("#FDFBE4")
    val forest = Color.parseColor("#1B3B2B")
    val growth = Color.parseColor("#4A8C4D")
    val muted = Color.parseColor("#8A8A7A")
    val white = Color.WHITE
    val statusH = statusBarHeight()
    // Extra band so light status icons stay readable even if inset is off
    val shadeH = statusH + dp(18)

    val frame = FrameLayout(context).apply {
      setBackgroundColor(cream)
    }

    frame.addView(
      View(context).apply {
        setBackgroundColor(forest)
        layoutParams = FrameLayout.LayoutParams(
          FrameLayout.LayoutParams.MATCH_PARENT,
          shadeH
        )
      }
    )

    val container = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(dp(28), shadeH + dp(20), dp(28), dp(40))
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
    }

    val brand = TextView(context).apply {
      text = "Zen Sweep"
      setTextColor(growth)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
      typeface = Typeface.DEFAULT_BOLD
      gravity = Gravity.CENTER
      letterSpacing = 0.04f
    }

    val title = TextView(context).apply {
      text = "$appName is blocked"
      setTextColor(forest)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 28f)
      typeface = Typeface.DEFAULT_BOLD
      gravity = Gravity.CENTER
      setPadding(0, dp(14), 0, dp(8))
    }

    val subtitle = TextView(context).apply {
      text = "Stay focused. This app is part of your active block session."
      setTextColor(muted)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
      gravity = Gravity.CENTER
      setLineSpacing(dp(2).toFloat(), 1.15f)
    }

    val remaining = TextView(context).apply {
      text = formatRemaining(remainingMs)
      setTextColor(forest)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 48f)
      typeface = Typeface.DEFAULT_BOLD
      gravity = Gravity.CENTER
      setPadding(0, dp(20), 0, dp(4))
    }

    val timeHint = TextView(context).apply {
      text = "minutes left"
      setTextColor(muted)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
      gravity = Gravity.CENTER
      setPadding(0, 0, 0, dp(18))
    }

    val buttonLayout = LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT,
      LinearLayout.LayoutParams.WRAP_CONTENT
    ).apply {
      topMargin = dp(10)
    }

    val stopButton = Button(context).apply {
      text = "Stop Blocking"
      setTextColor(cream)
      background = pill(forest, dp(28))
      setPadding(dp(22), dp(20), dp(22), dp(20))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
      typeface = Typeface.DEFAULT_BOLD
      layoutParams = buttonLayout
      setOnClickListener {
        hide()
        AppUsageMonitorService.stopFromOverlay(context)
      }
    }

    val returnButton = Button(context).apply {
      text = "Return to Zen Sweep"
      setTextColor(forest)
      background = pill(white, dp(28))
      setPadding(dp(22), dp(20), dp(22), dp(20))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
      typeface = Typeface.DEFAULT_BOLD
      layoutParams = LinearLayout.LayoutParams(buttonLayout).apply {
        topMargin = dp(10)
      }
      setOnClickListener {
        hide()
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
        launch?.addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        )
        if (launch != null) {
          context.startActivity(launch)
        }
      }
    }

    container.addView(brand)
    container.addView(title)
    container.addView(subtitle)
    container.addView(remaining)
    container.addView(timeHint)
    container.addView(stopButton)
    container.addView(returnButton)
    frame.addView(container)

    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }

    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      type,
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      PixelFormat.OPAQUE
    )
    params.gravity = Gravity.CENTER
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      params.layoutInDisplayCutoutMode =
        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
    }

    try {
      windowManager.addView(frame, params)
      root = frame
      timeView = remaining
    } catch (_: Exception) {
      root = null
    }
  }

  fun updateRemaining(remainingMs: Long) {
    timeView?.text = formatRemaining(remainingMs)
  }

  fun hide() {
    val current = root ?: return
    try {
      windowManager.removeView(current)
    } catch (_: Exception) {
    }
    root = null
    timeView = null
    visiblePackage = null
  }

  private fun pill(color: Int, radius: Int): GradientDrawable {
    return GradientDrawable().apply {
      setColor(color)
      cornerRadius = radius.toFloat()
    }
  }

  private fun statusBarHeight(): Int {
    val resId = context.resources.getIdentifier("status_bar_height", "dimen", "android")
    if (resId > 0) {
      return context.resources.getDimensionPixelSize(resId)
    }
    return (24 * context.resources.displayMetrics.density).toInt()
  }

  private fun formatRemaining(remainingMs: Long): String {
    val totalSeconds = (remainingMs / 1000L).coerceAtLeast(0)
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return String.format("%02d:%02d", minutes, seconds)
  }
}
