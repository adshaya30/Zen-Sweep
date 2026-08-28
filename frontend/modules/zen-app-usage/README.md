# Zen App Usage (local Expo module)

Android-only bridge to `UsageStatsManager` for Zen Sweep.

## Native APIs

- `isUsageAccessGranted()`
- `openUsageAccessSettings()`
- `getCurrentForegroundApp()`
- `startMonitoring(intervalMs)` / `stopMonitoring()` — runs a foreground service
- Event: `onForegroundAppChanged`

## Why a foreground service?

React Native JS timers pause when the app is backgrounded. A sticky foreground
service keeps polling UsageStats so Instagram can be detected while Zen Sweep
is not visible.

## Detection only

This module does **not** block or close other apps.
