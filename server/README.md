# RunnerOS API V1.3

Minimal production-oriented Node API using the Node standard library + PostgreSQL/PostGIS (`pg`). It implements:

- register/login with PBKDF2 password hashing and signed access JWT
- authenticated `/v1/me`
- activity upsert with PostGIS LineString
- offline `/v1/sync` ingestion with activity-ID deduplication
- follow/unfollow
- people search
- personalized feed
- personal heatmap geometry aggregation

## Start

1. Create PostgreSQL database with PostGIS.
2. Apply `schema.sql`.
3. `npm install` inside `server/`.
4. Set `DATABASE_URL` and a strong `JWT_SECRET`.
5. `npm start`.

This is the functional backend foundation. For production deployment add TLS, rate limiting, refresh-token rotation, object storage, observability and secret management.
