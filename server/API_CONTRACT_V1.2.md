# RunnerOS API V1.2

Minimalny kontrakt produkcyjnego backendu. Backend może być Node/Nest/Fastify lub innym runtime.

## Auth
- POST `/v1/auth/register` `{email,password,name}` -> `{token,user}`
- POST `/v1/auth/login` `{email,password}` -> `{token,user}`
- GET `/v1/me` -> `{user}`

## Activities
- POST `/v1/activities` idempotentny upsert aktywności.
- GET `/v1/activities/:id`
- GET `/v1/activities?cursor=...`
- DELETE `/v1/activities/:id`

## Social
- GET `/v1/feed?cursor=...`
- POST `/v1/users/:id/follow`
- DELETE `/v1/users/:id/follow`
- POST `/v1/activities/:id/kudos`
- DELETE `/v1/activities/:id/kudos`
- POST `/v1/activities/:id/comments`
- GET `/v1/activities/:id/comments`

## Geospatial
- GET `/v1/heatmap?bbox=minLng,minLat,maxLng,maxLat&zoom=...`
- GET `/v1/segments/nearby?lat=...&lng=...&radius=...`
- GET `/v1/routes/suggested?lat=...&lng=...&distance=...&profile=run`

## Synchronizacja
Każdy request aktywności zawiera `clientMutationId`. Backend musi traktować go idempotentnie.

## Bezpieczeństwo
- HTTPS only
- JWT access tokens z krótkim TTL
- refresh-token rotation
- rate limit dla auth, follow, comments i kudos
- walidacja payloadów
- prywatne aktywności nie mogą trafić do feedu/heatmapy
- strefy prywatności dla startu/końca trasy
