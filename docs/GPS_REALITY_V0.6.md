# GPS reality check - V0.6

## Current state

### Web/PWA
The recorder uses the real browser Geolocation API via `navigator.geolocation.watchPosition()` with `enableHighAccuracy: true`. The points originate from the device/browser location provider. They are not simulated.

### Android
The TypeScript `NativeLocationBridge` is still a contract only. V0.6 adds a native Android foreground-service foundation, but **does not yet claim production background GPS** until FusedLocationProviderClient, runtime permissions, Capacitor bridging, and physical-device tests are completed.

## Why this matters

Android 14+ requires an explicit foreground service type and matching permissions for location foreground services. Starting a location foreground service also has timing/permission restrictions, so training should be initiated while the app is visible.

## Accuracy policy

The recorder rejects samples with poor reported accuracy, impossible timestamps, stale samples, and large physically implausible jumps. This is a filter, not a claim that GPS accuracy becomes perfect.
