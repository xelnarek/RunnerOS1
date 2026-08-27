# Prompt do Google AI Studio — RunnerOS V0.4

Jesteś starszym inżynierem aplikacji fitness. Rozwijasz istniejący projekt RunnerOS. NIE twórz nowego projektu od zera.

## Zachowaj
- istniejący UI i styl RunnerOS,
- tracking, pause/resume, splity, GPX/JSON,
- recovery aktywnej sesji,
- własny branding RunnerOS,
- architekturę feature/core.

## V0.4 wykonaj
1. Uruchom `npm install` i `npm run build`. Nie zgłaszaj sukcesu bez przejścia buildu.
2. Utrzymaj MapLibre jako warstwę mapy. Map style ma być konfigurowalny przez `VITE_MAP_STYLE_URL`.
3. Zastąp ewentualne użycia localStorage dla historii IndexedDB; zachowaj migrację starych danych.
4. Nie umieszczaj klucza Mapbox ani innych sekretów w repo.
5. Dodaj obsługę błędu stylu mapy, offline i braku GPS.
6. Przygotuj adapter `NativeLocationBridge`, ale nie udawaj, że natywny background GPS działa w samej PWA.
7. Wprowadź testy jednostkowe dla: haversine, distance, splits, pause/resume, GPS jump filtering.
8. Dodaj ekran diagnostyczny tylko w buildzie developerskim: GPS accuracy, points, storage mode, map status.
9. Nie kasuj istniejącej funkcjonalności. Każda zmiana ma zachować kompatybilność z poprzednią wersją danych.

## Po wykonaniu
Pokaż listę zmienionych plików, wynik `npm run build` oraz ewentualne błędy wraz z konkretną przyczyną. Nie ukrywaj błędów.
