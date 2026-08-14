package expo.modules.zenappusage

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.CountDownTimer
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import android.widget.VideoView

/**
 * Mood intervention overlay (separate from timer [BlockingOverlay]).
 *
 * Prototype interventions:
 * - stressed → breathing guide video (if bundled) + inhale/hold/exhale counts
 * - lonely  → short family-connection video experience
 * - other moods → short generic pause
 */
class MoodOverlay(private val context: Context) {
  private val windowManager =
    context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
  private val mainHandler = Handler(Looper.getMainLooper())
  private var root: FrameLayout? = null
  private var content: LinearLayout? = null
  private var visiblePackage: String? = null
  private var visibleAppName: String = ""
  private var countdown: CountDownTimer? = null
  private var breathAnimator: ValueAnimator? = null
  private var breathRunnable: Runnable? = null
  private var videoView: VideoView? = null
  private var mediaPlayer: MediaPlayer? = null
  private var familySceneIndex = 0

  val isShowing: Boolean
    get() = root != null

  val activePackageName: String?
    get() = visiblePackage

  fun canDraw(): Boolean = Settings.canDrawOverlays(context)

  fun show(packageName: String, appName: String) {
    if (!canDraw()) {
      return
    }
    if (root != null && visiblePackage == packageName) {
      return
    }

    hide()
    visiblePackage = packageName
    visibleAppName = appName

    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    val statusH = statusBarHeight()
    val shadeH = statusH + dp(18)
    val cream = Color.parseColor("#FDFBE4")
    val forest = Color.parseColor("#1B3B2B")

    val container = FrameLayout(context).apply {
      setBackgroundColor(cream)
    }

    container.addView(
      View(context).apply {
        setBackgroundColor(forest)
        layoutParams = FrameLayout.LayoutParams(
          FrameLayout.LayoutParams.MATCH_PARENT,
          shadeH
        )
      }
    )

    val panel = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(20), shadeH + dp(12), dp(20), dp(18))
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
    }
    container.addView(panel)
    content = panel

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
      windowManager.addView(container, params)
      root = container
      renderAsk()
    } catch (_: Exception) {
      try {
        params.flags = WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
        windowManager.addView(container, params)
        root = container
        renderAsk()
      } catch (_: Exception) {
        root = null
        content = null
      }
    }
  }

  fun hide() {
    stopMedia()
    countdown?.cancel()
    countdown = null
    breathRunnable?.let { mainHandler.removeCallbacks(it) }
    breathRunnable = null
    breathAnimator?.cancel()
    breathAnimator = null
    val current = root ?: return
    try {
      windowManager.removeView(current)
    } catch (_: Exception) {
    }
    root = null
    content = null
    visiblePackage = null
  }

  private fun stopMedia() {
    try {
      videoView?.stopPlayback()
    } catch (_: Exception) {
    }
    videoView = null
    try {
      mediaPlayer?.stop()
      mediaPlayer?.release()
    } catch (_: Exception) {
    }
    mediaPlayer = null
  }

  private fun renderAsk() {
    val panel = content ?: return
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    stopMedia()
    panel.removeAllViews()
    countdown?.cancel()
    breathRunnable?.let { mainHandler.removeCallbacks(it) }

    panel.addView(
      textView("Zen Sweep", 13f, "#4A8C4D", bold = true).apply {
        letterSpacing = 0.04f
        setPadding(0, 0, 0, dp(6))
      }
    )
    panel.addView(textView("Take a small pause 🌿", 22f, "#1B3B2B", bold = true))
    panel.addView(
      textView("How do you feel right now?", 14f, "#8A8A7A").apply {
        setPadding(0, dp(6), 0, dp(2))
      }
    )
    panel.addView(
      textView("Opened from $visibleAppName", 13f, "#4A8C4D").apply {
        setPadding(0, 0, 0, dp(12))
      }
    )

    val scroll = ScrollView(context)
    val list = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
    }
    var row: LinearLayout? = null
    MOODS.forEachIndexed { index, (id, label) ->
      if (index % 2 == 0) {
        row = LinearLayout(context).apply {
          orientation = LinearLayout.HORIZONTAL
          layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
          ).apply { bottomMargin = dp(8) }
        }
        list.addView(row)
      }
      val cell = moodRow(label) { renderIntervene(id, label) }
      cell.layoutParams = LinearLayout.LayoutParams(
        0,
        LinearLayout.LayoutParams.WRAP_CONTENT,
        1f
      ).apply {
        if (index % 2 == 0) rightMargin = dp(4) else leftMargin = dp(4)
      }
      row?.addView(cell)
    }
    scroll.addView(list)
    panel.addView(
      scroll,
      LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
    )
  }

  private fun renderIntervene(moodId: String, moodLabel: String) {
    when (moodId) {
      "stressed" -> renderBreathing()
      "lonely" -> renderFamilyConnect()
      else -> renderGenericPause(moodId, moodLabel)
    }
  }

  /** Stressed: breathing video (if present) + guided inhale / hold / exhale counts. */
  private fun renderBreathing() {
    val panel = content ?: return
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    stopMedia()
    panel.removeAllViews()
    countdown?.cancel()
    breathAnimator?.cancel()
    panel.gravity = Gravity.CENTER_HORIZONTAL

    panel.addView(textView("Let's breathe 🌿", 22f, "#1B3B2B", bold = true))
    panel.addView(
      textView("Follow the counts — in · hold · out", 13f, "#8A8A7A").apply {
        setPadding(0, dp(6), 0, dp(12))
      }
    )

    val stage = FrameLayout(context).apply {
      background = roundedBg(Color.parseColor("#1B3B2B"), dp(20))
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        dp(200)
      ).apply { bottomMargin = dp(12) }
    }

    val breathRes = rawId("breathing")
    if (breathRes != 0) {
      val vv = VideoView(context).apply {
        setVideoURI(Uri.parse("android.resource://${context.packageName}/$breathRes"))
        setOnPreparedListener { mp ->
          mp.isLooping = true
          start()
        }
        layoutParams = FrameLayout.LayoutParams(
          FrameLayout.LayoutParams.MATCH_PARENT,
          FrameLayout.LayoutParams.MATCH_PARENT
        )
      }
      videoView = vv
      stage.addView(vv)
    } else {
      // Prototype visual stage when no bundled clip
      stage.addView(
        View(context).apply {
          background = GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor("#2F5D45"), Color.parseColor("#1B3B2B"))
          )
          layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
          )
        }
      )
      stage.addView(
        textView("Breathing guide", 14f, "#FDFBE4").apply {
          layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.TOP or Gravity.CENTER_HORIZONTAL
          ).apply { topMargin = dp(12) }
        }
      )
    }

    val circleSize = dp(110)
    val circle = View(context).apply {
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.parseColor("#4A8C4D"))
      }
      layoutParams = FrameLayout.LayoutParams(circleSize, circleSize, Gravity.CENTER)
    }
    stage.addView(circle)
    panel.addView(stage)

    val phaseView = textView("Get ready", 18f, "#1B3B2B", bold = true)
    val countView = textView("3", 42f, "#1B3B2B", bold = true)
    val roundView = textView("Round 1 of 4", 13f, "#8A8A7A")
    panel.addView(phaseView.apply { setPadding(0, dp(4), 0, 0) })
    panel.addView(countView)
    panel.addView(roundView.apply { setPadding(0, dp(4), 0, dp(10)) })

    val skip = Button(context).apply {
      text = "Skip"
      setTextColor(Color.parseColor("#1B3B2B"))
      background = roundedBg(Color.WHITE, dp(24))
      setPadding(dp(16), dp(12), dp(16), dp(12))
      setOnClickListener { renderDone("Nice breathing 🌿") }
    }
    panel.addView(skip)

    // 4 rounds of inhale 4 · hold 4 · exhale 4
    val phases = listOf("Inhale" to 4, "Hold" to 4, "Exhale" to 4)
    var round = 1
    var phaseIndex = 0
    var secondsLeft = 3
    var inPrep = true

    fun pulse(expand: Boolean) {
      breathAnimator?.cancel()
      val from = if (expand) 0.72f else 1.15f
      val to = if (expand) 1.15f else 0.72f
      breathAnimator = ValueAnimator.ofFloat(from, to).apply {
        duration = 3800
        interpolator = AccelerateDecelerateInterpolator()
        addUpdateListener { anim ->
          val s = anim.animatedValue as Float
          circle.scaleX = s
          circle.scaleY = s
        }
        start()
      }
    }

    fun tick() {
      if (!isShowing) return
      if (inPrep) {
        phaseView.text = "Get ready"
        countView.text = secondsLeft.toString()
        if (secondsLeft <= 0) {
          inPrep = false
          phaseIndex = 0
          secondsLeft = phases[0].second
          phaseView.text = phases[0].first
          countView.text = secondsLeft.toString()
          pulse(expand = true)
        } else {
          secondsLeft--
        }
      } else {
        val (name, _) = phases[phaseIndex]
        phaseView.text = name
        countView.text = secondsLeft.toString()
        roundView.text = "Round $round of 4"
        if (secondsLeft <= 1) {
          phaseIndex++
          if (phaseIndex >= phases.size) {
            phaseIndex = 0
            round++
            if (round > 4) {
              renderDone("Nice breathing 🌿")
              return
            }
          }
          secondsLeft = phases[phaseIndex].second
          when (phases[phaseIndex].first) {
            "Inhale" -> pulse(expand = true)
            "Exhale" -> pulse(expand = false)
            else -> { /* hold keeps size */ }
          }
        } else {
          secondsLeft--
        }
      }
      val next = Runnable { tick() }
      breathRunnable = next
      mainHandler.postDelayed(next, 1000L)
    }
    tick()
  }

  /** Lonely: short family-connection video / video-style prototype. */
  private fun renderFamilyConnect() {
    val panel = content ?: return
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    stopMedia()
    panel.removeAllViews()
    countdown?.cancel()
    panel.gravity = Gravity.CENTER_HORIZONTAL

    panel.addView(textView("You're not alone 💚", 22f, "#1B3B2B", bold = true))
    panel.addView(
      textView("A little reminder to call someone who loves you", 13f, "#8A8A7A").apply {
        setPadding(0, dp(6), 0, dp(12))
      }
    )

    val stage = FrameLayout(context).apply {
      background = roundedBg(Color.parseColor("#111811"), dp(20))
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        dp(240)
      ).apply { bottomMargin = dp(12) }
    }

    val familyRes = rawId("family")
    if (familyRes != 0) {
      val vv = VideoView(context).apply {
        setVideoURI(Uri.parse("android.resource://${context.packageName}/$familyRes"))
        setOnPreparedListener { mp ->
          mp.isLooping = true
          start()
        }
        setOnCompletionListener { renderDone("Reach out today 💚") }
        layoutParams = FrameLayout.LayoutParams(
          FrameLayout.LayoutParams.MATCH_PARENT,
          FrameLayout.LayoutParams.MATCH_PARENT
        )
      }
      videoView = vv
      stage.addView(vv)
      // Auto-finish after ~45s even if looping
      countdown = object : CountDownTimer(45_000L, 1000L) {
        override fun onTick(millisUntilFinished: Long) {}
        override fun onFinish() {
          renderDone("Reach out today 💚")
        }
      }.start()
    } else {
      val caption = textView(FAMILY_SCENES[0], 16f, "#FDFBE4", bold = true).apply {
        setPadding(dp(16), dp(16), dp(16), dp(16))
        layoutParams = FrameLayout.LayoutParams(
          FrameLayout.LayoutParams.MATCH_PARENT,
          FrameLayout.LayoutParams.MATCH_PARENT,
          Gravity.CENTER
        )
        gravity = Gravity.CENTER
      }
      stage.addView(
        View(context).apply {
          background = GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            intArrayOf(Color.parseColor("#2A4A35"), Color.parseColor("#111811"))
          )
        }
      )
      stage.addView(
        textView("▶  Family moment", 12f, "#A8C4B0").apply {
          layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.TOP or Gravity.START
          ).apply { setMargins(dp(14), dp(12), 0, 0) }
        }
      )
      stage.addView(caption)
      familySceneIndex = 0
      countdown = object : CountDownTimer(24_000L, 4000L) {
        override fun onTick(millisUntilFinished: Long) {
          familySceneIndex = (familySceneIndex + 1) % FAMILY_SCENES.size
          caption.text = FAMILY_SCENES[familySceneIndex]
        }

        override fun onFinish() {
          renderDone("Reach out today 💚")
        }
      }.start()
    }
    panel.addView(stage)

    panel.addView(
      textView("Video tip: call or talk with family — even a short chat helps.", 13f, "#4A8C4D").apply {
        setPadding(0, 0, 0, dp(14))
      }
    )

    val doneEarly = Button(context).apply {
      text = "I feel better"
      setTextColor(Color.parseColor("#FDFBE4"))
      background = roundedBg(Color.parseColor("#1B3B2B"), dp(28))
      setPadding(dp(18), dp(14), dp(18), dp(14))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
      typeface = Typeface.DEFAULT_BOLD
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
      setOnClickListener { renderDone("Reach out today 💚") }
    }
    panel.addView(doneEarly)
  }

  private fun renderGenericPause(moodId: String, moodLabel: String) {
    val panel = content ?: return
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    stopMedia()
    panel.removeAllViews()
    countdown?.cancel()
    panel.gravity = Gravity.CENTER_HORIZONTAL

    panel.addView(textView(interventionPrompt(moodId), 22f, "#1B3B2B", bold = true))
    panel.addView(
      textView("Feeling ${moodLabel.replace(Regex("^\\S+\\s+"), "")}", 14f, "#4A8C4D").apply {
        setPadding(0, dp(8), 0, dp(16))
      }
    )

    val placeholder = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(dp(16), dp(22), dp(16), dp(22))
      background = roundedBg(Color.WHITE, dp(20))
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        0,
        1f
      ).apply { bottomMargin = dp(14) }
    }
    placeholder.addView(textView("20-second pause", 16f, "#1B3B2B", bold = true))
    placeholder.addView(
      textView("A short reset before you continue", 13f, "#8A8A7A").apply {
        setPadding(0, dp(8), 0, 0)
      }
    )
    panel.addView(placeholder)

    val timeView = textView("00:20", 34f, "#1B3B2B", bold = true)
    val progress = ProgressBar(
      context,
      null,
      android.R.attr.progressBarStyleHorizontal
    ).apply {
      max = 20
      this.progress = 20
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        dp(10)
      ).apply { topMargin = dp(10) }
    }
    panel.addView(timeView)
    panel.addView(progress)

    countdown = object : CountDownTimer(20_000L, 250L) {
      override fun onTick(millisUntilFinished: Long) {
        val totalSeconds = ((millisUntilFinished + 999) / 1000L).toInt().coerceAtLeast(0)
        timeView.text = String.format("00:%02d", totalSeconds)
        progress.progress = totalSeconds
      }

      override fun onFinish() {
        timeView.text = "00:00"
        progress.progress = 0
        renderDone("Nice pause 🌿")
      }
    }.start()
  }

  private fun renderDone(title: String = "Nice pause 🌿") {
    val panel = content ?: return
    val pkg = visiblePackage ?: return
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    stopMedia()
    panel.removeAllViews()
    countdown?.cancel()
    breathRunnable?.let { mainHandler.removeCallbacks(it) }
    breathAnimator?.cancel()
    panel.gravity = Gravity.CENTER

    panel.addView(textView(title, 26f, "#1B3B2B", bold = true))
    panel.addView(
      textView("You took a moment for yourself.", 15f, "#8A8A7A").apply {
        setPadding(0, dp(12), 0, dp(28))
      }
    )

    val continueBtn = Button(context).apply {
      text = "Continue"
      setTextColor(Color.parseColor("#FDFBE4"))
      background = roundedBg(Color.parseColor("#1B3B2B"), dp(28))
      setPadding(dp(20), dp(18), dp(20), dp(18))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
      typeface = Typeface.DEFAULT_BOLD
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
      setOnClickListener {
        AppUsageMonitorService.markMoodCooldowned(context, pkg)
        ZenAppUsageModule.emitMoodInterventionCompleted(pkg)
        hide()
      }
    }
    panel.addView(continueBtn)
  }

  private fun moodRow(label: String, onClick: () -> Unit): View {
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    return Button(context).apply {
      text = label
      setTextColor(Color.parseColor("#1B3B2B"))
      background = roundedBg(Color.WHITE, dp(16))
      gravity = Gravity.CENTER
      setPadding(dp(10), dp(14), dp(10), dp(14))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
      typeface = Typeface.DEFAULT_BOLD
      isAllCaps = false
      setOnClickListener { onClick() }
    }
  }

  private fun textView(
    value: String,
    sizeSp: Float,
    color: String,
    bold: Boolean = false,
  ): TextView {
    return TextView(context).apply {
      text = value
      setTextColor(Color.parseColor(color))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, sizeSp)
      if (bold) {
        typeface = Typeface.DEFAULT_BOLD
      }
      gravity = Gravity.CENTER
    }
  }

  private fun interventionPrompt(moodId: String): String {
    return when (moodId) {
      "happy" -> "Savor this feeling 🌿"
      "calm" -> "Stay with this calm 🌿"
      "neutral" -> "A short reset 🌿"
      "tired" -> "Rest for a moment 🌿"
      "sad" -> "Be kind to yourself 🌿"
      else -> "Take a breath 🌿"
    }
  }

  private fun roundedBg(color: Int, radius: Int): GradientDrawable {
    return GradientDrawable().apply {
      setColor(color)
      cornerRadius = radius.toFloat()
    }
  }

  private fun rawId(name: String): Int {
    return context.resources.getIdentifier(name, "raw", context.packageName)
  }

  private fun statusBarHeight(): Int {
    val resId = context.resources.getIdentifier("status_bar_height", "dimen", "android")
    if (resId > 0) {
      return context.resources.getDimensionPixelSize(resId)
    }
    return (24 * context.resources.displayMetrics.density).toInt()
  }

  companion object {
    val MOODS = listOf(
      "happy" to "😊  Happy",
      "calm" to "😌  Calm",
      "neutral" to "😐  Neutral",
      "stressed" to "😣  Stressed",
      "lonely" to "🥺  Lonely",
      "tired" to "😴  Tired",
    )

    private val FAMILY_SCENES = listOf(
      "📞 Call someone who loves you",
      "💬 A short chat with family can lift you",
      "🏠 Hear a familiar voice today",
      "💚 You matter to people who care",
    )
  }
}
