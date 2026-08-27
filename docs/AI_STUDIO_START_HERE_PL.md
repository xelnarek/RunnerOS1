# RunnerOS — START HERE dla Google AI Studio

## Ważne: wybierz właściwy tryb

Dla tego projektu należy użyć **Google AI Studio → Build mode → Web app / full-stack**, a nie generatora „Android app”.

Powód: RunnerOS jest hybrydowym projektem PWA + Node/PostgreSQL/PostGIS + Android/Capacitor. AI Studio potrafi importować istniejący projekt z GitHuba do Build mode i pracować wieloplikowo. Natomiast generator Android w AI Studio jest ograniczony do klientowego projektu Kotlin + Jetpack Compose, jednego modułu i jednej aktywności. Nie zastępuje naszego backendu ani istniejącego natywnego bridge Android.

## Najlepszy workflow

1. Utwórz prywatne repozytorium GitHub, np. `runneros-strava-class`.
2. Wrzuć do repozytorium całą zawartość tego projektu.
3. Otwórz Google AI Studio → Build mode.
4. `+` → **Import from GitHub**.
5. Wskaż repozytorium i zaimportuj projekt.
6. Wklej jako pierwszy prompt zawartość `docs/AI_STUDIO_MASTER_PROMPT_PL.md`.
7. Nie proś agenta od razu o nowe funkcje. Pierwszym zadaniem ma być audyt + uruchomienie + build + testy.
8. Po każdym większym etapie żądaj raportu: zmienione pliki, testy wykonane, testy niewykonane, błędy blokujące.

## Co ma pozostać źródłem prawdy

- `src/` = frontend i core aplikacji
- `server/` = backend API
- `android/` = natywny Android/Capacitor
- `docs/` = kontrakty i instrukcje
- `tests/` = regresja

Agent nie może przepisywać projektu do jednego pliku.

## Kolejność prac po imporcie

### Etap A — uruchomienie
- install dependencies
- typecheck
- test
- build
- uruchom dev server

### Etap B — backend
- uruchom PostgreSQL/PostGIS
- migracja
- healthcheck
- auth
- activity sync

### Etap C — Android
- `cap sync android`
- build debug APK
- GPS foreground service
- ekran wygaszony
- permission flow

### Etap D — jakość
- GPS quality
- auto-pause
- moving time
- HR BLE
- Health Connect
- recovery po śmierci procesu

### Etap E — produkt
- feed
- followers
- segments
- heatmap
- routes
- challenges
- AI coach

## Zasada

Nie dodawaj funkcji kosztem działającego GPS. Nie usuwaj funkcji tylko po to, aby build przeszedł. Gdy coś nie może zostać zweryfikowane w środowisku AI Studio, oznacz to jawnie.
