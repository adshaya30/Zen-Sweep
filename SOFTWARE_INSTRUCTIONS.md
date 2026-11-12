Clone the repository (git clone YOUR_REPO_URL) before proceeding.

# Zen Sweep — Software Instructions

For a judge who has never seen this project. **Zen Sweep is an Android digital-wellbeing app.** Blocking and mood overlays require a **custom Expo Dev Client** (not Expo Go). There is **no backend, no login, and no `.env` configuration**.

The runnable app lives in **`frontend/`**.

---

## 1. Install prerequisites

Install these **before** `npm install`.

### 1.1 Required (Android demo)

| Tool | Version / notes |
| --- | --- |
| **Git** | Any recent version |
| **Node.js** | **20.x LTS** or **22.x LTS** (needed for Expo SDK 54 / React Native 0.81) |
| **npm** | Comes with Node (lockfile is `frontend/package-lock.json`) |
| **Android Studio** | Latest stable. Use its bundled JDK (**JBR / Java 17**) |
| **Android SDK** | From Android Studio SDK Manager: **Platform 36**, **Build-Tools 36.0.0**, **Platform-Tools** (`adb`), **NDK 27.1.12297006** (Expo will request this on first native build) |
| **Physical Android phone** | **Strongly recommended.** API 24+ (Android 7). Package name: `com.zensweep.app`. Overlay + Usage Access are unreliable or incomplete on many emulators. |

Confirm:

```bash
node -v
npm -v
adb version
```

Set `JAVA_HOME` to Android Studio’s JBR, for example:

- Windows: `C:\Program Files\Android\Android Studio\jbr`
- macOS: `/Applications/Android Studio.app/Contents/jbr/Contents/Home`

### 1.2 Optional

| Tool | Why |
| --- | --- |
| **Xcode** (macOS only) | `npm run ios` builds the iOS development client with the native Swift module `ZenAppUsage` using Apple's Screen Time APIs (`FamilyControls` / `ManagedSettings`). |
| **Expo Go** | **Do not use.** Custom native code will not load. |

### 1.3 Phone setup

1. Enable **Developer options** → **USB debugging**.
2. Connect USB. Accept the RSA prompt.
3. Confirm:

```bash
adb devices
```

You should see `device`, not `unauthorized` or `offline`.

---

## 2. Install dependencies

From the **repository root**:

```bash
cd frontend
npm install
```

This installs Expo SDK 54, React Native 0.81.5, NativeWind, React Navigation, AsyncStorage, and the local module `zen-app-usage` (`file:./modules/zen-app-usage`).

Do **not** skip `npm install`. The native module is not published to npm.

---

## 3. Environment variables / config files

**None required.**

- There is **no** `.env.example`.
- `frontend/.env` is empty and unused.
- `frontend/src/config/env.ts` is a placeholder (`export {}`).
- Firebase / auth folders under `src/services/firebase/` and `src/store/` are stubs, not wired up.

You can skip any env-file step.

---

## 4. Build and run the app

### 4.1 Physical Android phone (the path that actually demos blocking)

Keep the USB cable connected.

```bash
cd frontend
npx expo run:android
```

Equivalent script: `npm run android`.

What this does:

1. Compiles the Kotlin module and a **debug Dev Client APK**.
2. Installs `com.zensweep.app` on the device.
3. Starts Metro (often on **8081**; this project has also been run on **8083**).

If the phone cannot reach Metro over Wi‑Fi (common on restricted networks), reverse the port (use the port Metro printed):

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8083 tcp:8083
```

Then open the installed **Zen Sweep** app. If you see the Expo Dev Client URL screen, connect to:

`http://127.0.0.1:8081`  
(or `8083` if that is what Metro printed)

Reload JS later with:

```bash
cd frontend
npx expo start --port 8081
```

**Native overlay / service changes require `npx expo run:android` again.** JS-only UI changes hot-reload.

### 4.2 Android emulator

You can install the Dev Client the same way (`npx expo run:android` with an AVD running). **Usage Access and “Display over other apps” often do not work well in the emulator**, so timer/mood overlays may never appear. Use a real phone for judging the core feature.

### 4.3 iOS
```bash
cd frontend
npm run ios
```

Builds and runs the custom iOS development client using the native Swift module `ZenAppUsageModule`. App shielding is handled through Apple's Screen Time APIs (`FamilyControls` & `ManagedSettings`). Note that running on a real iOS device requires an Apple Developer account with the Family Controls entitlement.

### 4.4 Web (not a valid demo)

```bash
cd frontend
npm run web
```

Web cannot access UsageStats or system overlays. Do not judge blocking from the browser.

### 4.5 Grant permissions on the phone (required)

After first launch, complete onboarding, then:

1. **Usage access**  
   Settings → Apps → Special access → **Usage data access** → enable **Zen Sweep**.  
   The app also prompts this when you tap **Start Block**.

2. **Display over other apps**  
   Settings → Apps → Special access → **Appear on top** (or Display over other apps) → enable **Zen Sweep**.

3. **Notifications** (Android 13+)  
   Allow so the “Zen Sweep watching / block active” foreground-service notification can show.

4. Samsung / OEM: if the OS suggests **Deep sleep** or battery restriction after crashes, set Zen Sweep to **Unrestricted** / never sleep, or overlays will stop when you leave the app.

---

## 5. Login, credentials, and how to use the features

**No accounts. No test users. No seed database.**

All data is local **AsyncStorage** on the device.

### 5.1 First launch (onboarding)

1. Open **Zen Sweep**.
2. Welcome → **Start growing — it's free** (the **Sign in** button is not a real login; it continues the same setup).
3. Enter a **name** (required). Age optional.
4. Enter a **dream / goals**.
5. Pick **interests**.
6. Pick **trap apps** (WhatsApp, Instagram, YouTube, etc.). These use a **curated list**, not a live scan of every installed app.
7. Set sleep/wake (stored only; they do **not** auto-block).
8. You land on **Overview**.

**Edit setup:** Profile tab → **Edit setup** (restarts onboarding). There is no logout.

### 5.2 Demo A — Timer block (overlay over WhatsApp)

1. Open the **Blocks** tab.
2. Select a duration (e.g. 15 mins).
3. Select **WhatsApp** (or another listed app that is actually installed).
4. Tap **Start Block**. Accept Usage Access + overlay if prompted.
5. Leave Zen Sweep and **open WhatsApp**.
6. You should see a full-screen **cream/forest “WhatsApp is blocked”** overlay with a countdown.
7. **Stop Blocking** or **Return to Zen Sweep** to exit.

If a timer is running, **mood will not show** for that app. Timer always wins.

### 5.3 Demo B — Mood intervention (no timer)

1. On **Blocks**, turn **Mood Intervention ON** (green switch) for WhatsApp. You do **not** need to start a timer.
2. Confirm a notification like **“Zen Sweep watching”**.
3. Open WhatsApp **without** an active block.
4. You should see **“Take a small pause”** with mood buttons.
5. **Stressed** → breathing counts (inhale / hold / exhale).  
   **Lonely** → family-connect prototype.  
   Other moods → short pause.
6. Tap **Continue** when done.

If mood does not appear: stop any active timer first; wait ~45 seconds after a previous mood Continue (cooldown).

### 5.4 Other tabs

- **Insights:** local counts of prevented opens and minutes saved; **Share** uses the system share sheet. No server.
- **Overview:** personalized greeting from onboarding.

---

## 6. Troubleshooting

| Symptom | What to do |
| --- | --- |
| Expo Go / “Unable to load” / Dev Client error screen | Metro is not running, or the phone cannot reach it. Start `npx expo start` in `frontend/`, then `adb reverse tcp:8081 tcp:8081` (or 8083). Reopen the app with the `exp+frontend://...127.0.0.1...` URL. |
| `adb: device offline` / install failed | Unplug USB, revoke USB debugging, replug, `adb devices`. Unlock the phone. |
| `ForegroundServiceDidNotStartInTimeException` crash | Fixed in current source. Rebuild with `npx expo run:android` (JS reload is not enough). |
| Mood overlay flashes then vanishes | Rebuild with current source (overlay was incorrectly dismissed when UsageStats reported Zen Sweep). |
| Overlay never appears | Grant **Usage access** and **Display over other apps**. Use a **physical device**. Confirm the app you open is on the list (`com.whatsapp`, not WhatsApp Business). |
| Timer overlay instead of mood | Stop the block first. Mood only runs when that package is **not** timer-blocked. |
| Native UI (overlay colors/layout) unchanged after edit | Run `npx expo run:android` again. |
| `JAVA_HOME` / Gradle JDK errors | Point `JAVA_HOME` at Android Studio **jbr**, not an old Java 8. |
| Samsung “put this app in deep sleep” | Settings → Battery → Zen Sweep → **Unrestricted**. |
| Blocking does nothing on web | Expected. Web preview cannot access native app usage or shield apps. |
| Empty app list / missing icons | The picker is a **mock list** in `src/features/appBlocking/services/installedApps.ts`. Apps not on that list cannot be selected. |
| Need a clean profile | Uninstall **Zen Sweep** or clear app storage (AsyncStorage). Or Profile → Edit setup. |

### Useful commands

```bash
cd frontend
npx expo start          # Metro only (after a Dev Client is already installed)
npm run android         # native rebuild + install
npm run typecheck
adb reverse tcp:8081 tcp:8081
adb shell am force-stop com.zensweep.app
```

---

## Quick judge checklist

1. `cd frontend && npm install && npx expo run:android`
2. Complete onboarding (any name + pick WhatsApp).
3. Grant Usage Access + Display over other apps.
4. **Start Block** → open WhatsApp → timer overlay.
5. Stop block → Mood ON → open WhatsApp → mood pause.
