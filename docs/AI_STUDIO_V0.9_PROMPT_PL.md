# AI Studio — RunnerOS V0.9

To jest istniejący projekt RunnerOS. NIE twórz nowej aplikacji od zera i NIE kasuj istniejących funkcji.

Cel: dopracować aplikację treningową klasy Strava bez kopiowania marki, logo ani chronionego UI Stravy.

## Priorytet 1 — kompilacja
1. Zainstaluj zależności.
2. Uruchom `npm run typecheck`.
3. Uruchom `npm run test`.
4. Uruchom `npm run build`.
5. Nie obchodź błędów przez usuwanie funkcji. Raportuj każdy błąd dokładnie.

## Priorytet 2 — GPS
- zachowaj `src/core/gps.ts` jako wspólny model jakości,
- zachowaj prawdziwy Android Fused Location Provider,
- nie dodawaj syntetycznych punktów,
- nie zwiększaj automatycznie tolerancji GPS tylko po to, żeby mieć więcej punktów,
- przetestuj teleport detection, stale timestamps, poor accuracy i stationary noise.

## Priorytet 3 — trening
- zachowaj moving time,
- zachowaj auto-pause,
- popraw split interpolation,
- nie licz postoju jako ruchu.

## Priorytet 4 — Health Connect
- używaj oficjalnego `androidx.health.connect:connect-client:1.2.0-alpha05`,
- sprawdzaj uprawnienia przed każdym odczytem/zapisem,
- nie pobieraj danych zdrowotnych bez wyraźnej zgody,
- nie twórz fałszywych danych HR.

## Priorytet 5 — UX
- ekran biegu ma być czytelny jedną ręką i jednym spojrzeniem,
- dystans i tempo mają pierwszeństwo,
- status GPS ma być zrozumiały,
- brak dekoracyjnych animacji obciążających GPS/baterię.

## Priorytet 6 — testy
Dodaj testy dla:
- haversine,
- validSegment,
- movingTime,
- auto-pause,
- recovery,
- trainingLoad,
- consistencyScore.

## Ważne ograniczenie
Nie twierdź, że GPS został przetestowany terenowo, jeśli nie masz realnego urządzenia. Nie twierdź, że BLE HR działa, dopóki nie jest podłączony przez rzeczywisty Bluetooth/GATT. Nie twierdź, że map matching działa, jeśli nie ma routingu.
