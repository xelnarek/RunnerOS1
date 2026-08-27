# RunnerOS architecture

## Frontend
React + TypeScript + Vite. PWA-first, offline-first.

## Domain modules
- core/types.ts
- core/gps.ts
- core/metrics.ts
- core/storage.ts
- features/record
- features/activity
- features/profile
- features/feed
- features/routes

## Android layer
Capacitor is the intended bridge. Background tracking should use a native Android foreground service. The PWA remains the main UI.

## Backend target
Node.js API + PostgreSQL/PostGIS + Redis + object storage. Backend is intentionally not hard-coded into this starter so the client can run offline.

## Non-negotiables
- no network dependency for starting/continuing an activity
- local activity persistence
- sync queue
- GPS quality filtering
- privacy controls for route start/end
- provider abstraction for maps
