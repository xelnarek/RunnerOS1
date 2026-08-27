# RunnerOS V1.4 Deployment

## Local web
1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to the API base.
3. Install dependencies and run `npm run dev`.

## Backend
1. Create PostgreSQL database with PostGIS enabled.
2. Apply `server/schema.sql`.
3. Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
4. Run `cd server && npm install && npm start`.
5. Verify `GET /health`.

## Android
1. Install Node dependencies.
2. Run `npm run build`.
3. Run `npx cap sync android`.
4. Open `android/` in Android Studio.
5. Install on a physical Android phone for GPS/notification/BLE/Health Connect testing.
