# RunnerOS V2.0 Strava-Class — V1.9 Premium UI + Audio + AI Studio Ready

RunnerOS is an offline-first running platform foundation with real GPS tracking, Android foreground location, BLE HR, Health Connect, analytics, social features, sync and a Node + PostgreSQL/PostGIS backend.

## Najważniejsze

To repo jest przygotowane do importu do **Google AI Studio Build mode jako aplikacja webowa/full-stack** oraz do dalszej pracy w Android Studio. Nie należy wybierać generatora „Android app” w AI Studio jako zamiennika całej architektury, bo jego natywne projekty Android są client-side i mają ograniczenia względem naszego backendu i istniejącego układu. citeturn448381search0turn448381search1

## Start lokalny

```bash
npm install
npm run preflight
npm run typecheck
npm test
npm run build
```

Backend:

```bash
docker compose up -d db
cd server
npm install
DATABASE_URL=postgres://runneros:runneros_dev_password@localhost:5432/runneros npm run migrate
DATABASE_URL=postgres://runneros:runneros_dev_password@localhost:5432/runneros JWT_SECRET=replace-me npm start
```

## AI Studio

Przeczytaj w tej kolejności:

1. `docs/AI_STUDIO_START_HERE_PL.md`
2. `docs/AI_STUDIO_MASTER_PROMPT_PL.md`
3. `docs/AI_STUDIO_PHASES_PL.md`

Google AI Studio Build mode obsługuje import istniejącego projektu z GitHuba i pracę wieloplikową; można też połączyć projekt z GitHubem i rozwijać go dalej. citeturn448381search0

## Android

```bash
npm run build
npx cap sync android
```

Następnie otwórz `android/` w Android Studio i zbuduj debug APK na fizycznym urządzeniu.

AI Studio ma osobny tryb budowy natywnego Androida w Kotlinie + Jetpack Compose, ale ten tryb jest ograniczony do client-side, jednej aktywności/modułu i nie zastępuje naszego backendu. citeturn448381search1

## Stan uczciwy

Kod źródłowy jest przygotowany do dalszej pracy. Finalny APK, test 30–60 minut GPS, BLE i pełny PostGIS deployment wymagają rzeczywistego środowiska Android/serwera. Projekt nie oznacza tych rzeczy jako zweryfikowanych bez testu.


## V2.0
Workout Engine, Readiness Score, Adaptive Recommendation, Race Predictor V2, Goals, Gear V2 oraz natywny Android TTS z duckingiem audio.
