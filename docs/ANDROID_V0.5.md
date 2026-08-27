# Android V0.5 Preparation

Target runtime: Capacitor on Android.

## Native contract
`src/core/android/nativeLocation.ts` is the only interface the PWA should use for native location.

## Next native implementation
1. Add Capacitor Android project.
2. Implement a foreground location service with persistent notification.
3. Request fine + background location according to current Android permission rules.
4. Emit normalized points into `NativeLocationBridge`.
5. Keep the same Activity Engine and IndexedDB queue.
6. Stop the foreground service at activity end.

## Battery
Do not request the highest sampling rate permanently. Use a configurable interval/distance policy and handle Android battery optimization explicitly.

## Health Connect
Keep Health Connect behind a second adapter so GPS recording is never blocked by health permissions.
