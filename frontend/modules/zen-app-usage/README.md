# Zen App Usage (local Expo module)

Cross-platform bridge for Zen Sweep app blocking.

- **Android** — Kotlin bridge to `UsageStatsManager` + system overlays (see `android/`).
- **iOS** — Swift bridge to Apple's Screen Time APIs
  (`FamilyControls` / `ManagedSettings` / `DeviceActivity`, see `ios/`).

## Shared native API surface

The same method names are exposed on both platforms so the React Native layer
stays platform-independent:

| Method | Android | iOS |
| --- | --- | --- |
| `isUsageAccessGranted()` | UsageStats permission via AppOps | FamilyControls authorization approved |
| `openUsageAccessSettings()` | Usage Access settings | App Settings |
| `canDrawOverlays()` | Overlay ("appear on top") grant | Reports FamilyControls approved — iOS has no overlay API, this doubles as "shields can be applied" |
| `openOverlaySettings()` | Overlay settings | App Settings |
| `getCurrentForegroundApp()` | Real foreground package/name | Always `null` (iOS has no such API) |
| `startMonitoring(intervalMs, blockedUntil, packageNames, appNames)` | Foreground service + block overlay | Applies `ManagedSettingsStore` shields + registers a `DeviceActivitySchedule` |
| `stopMonitoring()` | Stops service + hides overlay | Clears shields + stops schedule |
| `isMonitoring()` | Service running flag | Flag / registered activity |
| `consumeOverlayStopRequest()` | Overlay "Stop" flag | Always `false` (no overlay on iOS) |
| `syncMoodIntervention(...)` | Mood overlay packages/cooldown | Accepted no-op (see limitations) |

### iOS-only additions

- `requestAuthorization()` — prompts for / returns FamilyControls approval.
- `presentAppSelectionPicker()` — presents the system `FamilyActivityPicker`;
  returns selected apps as base64-encoded `ApplicationToken`s.

## iOS app identification

iOS identifies apps with `ApplicationToken` (from `FamilyControls`). Tokens can
only be obtained by the user via the system picker — they **cannot** be derived
from bundle IDs like `com.instagram.android`. Zen Sweep serializes token data
(`ApplicationToken.rawValue`) to base64 and stores it in the existing
`packageName` field of `BlockingSession`, so the shared React Native session
logic is unchanged. Because Apple exposes no token→display-name API, iOS-selected
apps render as "Selected App 1…" placeholders in the RN UI.

## iOS configuration required

- **Entitlement** `com.apple.developer.family-controls` (added by
  `app.plugin.js`) — needs a paid Apple Developer account.
- **App Group** `group.com.zensweep.app` (added to the app entitlements by
  `app.plugin.js`) — shared with the optional monitoring extension.
- **iOS 16+** for shielding; deployment target stays 15.1 with availability
  guards.

### Optional DeviceActivityMonitor extension (recommended)

Shields applied while Zen Sweep is running are enforced immediately. To keep
shields enforced after Zen Sweep is backgrounded or killed, add a separate
**app-extension target** containing
`ios/extension/DeviceActivityMonitorExtension.swift`. Expo config plugins cannot
reliably synthesize Xcode extension targets, so this is a manual step after
`npx expo prebuild` (instructions are in that file's header comment). This
extension re-applies shields on `intervalDidStart` and clears them on
`intervalDidEnd`.

## iOS limitations (Apple platform restrictions)

1. **No real-time foreground-app detection.** Android can watch
   `UsageStatsManager` every ~1.5s; iOS exposes no equivalent public API.
   `getCurrentForegroundApp()` therefore returns `null`.
2. **No custom overlay over other apps.** Blocking uses the system Screen-Time
   shield instead of the cream/forest countdown overlay. The countdown/timer UI
   lives in the React Native `ActiveBlockingScreen`.
3. **No real-time mood trigger.** The Android "open a trap app → mood pause"
   trigger cannot exist on iOS; `syncMoodIntervention` is accepted for parity
   but does nothing natively. Mood/wellbeing screens in React Native remain
   shared.
4. **No installed-app enumeration.** Apps are chosen through the system picker,
   and their display names are not retrievable by the app.

## Why a foreground service? (Android only)

React Native JS timers pause when the app is backgrounded. A sticky foreground
service keeps polling UsageStats so Instagram can be detected while Zen Sweep
is not visible. iOS achieves background enforcement via the Screen Time shield +
optional DeviceActivity extension instead.