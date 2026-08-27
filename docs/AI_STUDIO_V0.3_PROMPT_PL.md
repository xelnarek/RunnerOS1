# PROMPT DO GOOGLE AI STUDIO - RUNNEROS V0.3

Pracujesz na istniejącym repozytorium RunnerOS_Strava_Class_PWA. NIE twórz nowego projektu od zera.

Cel: doprowadź RunnerOS do stabilnego V0.3 jako aplikację klasy Strava, ale z własnym brandingiem i własnym UI.

PRIORYTETY:
1. Nie usuwaj istniejących funkcji.
2. Zachowaj offline-first.
3. Aktywna sesja treningowa musi przeżyć odświeżenie strony i przypadkowe zamknięcie karty.
4. Nie zapisuj błędnych skoków GPS.
5. Nie uzależniaj podstawowego treningu od internetu.
6. Kod ma być modularny i typowany TypeScript.

DO ZROBIENIA:
- zastąpić lokalny RoutePreview przez MapLibre GL JS,
- przygotować abstrakcję MapProvider, aby później można było podmienić źródło map,
- dodać ślad GPS na mapie,
- dodać marker START/FINISH i bieżącej pozycji,
- dodać wykres tempa i wysokości,
- dodać automatyczny zapis punktów co bezpieczny interwał,
- dodać testy jednostkowe dla haversine, filtracji GPS, dystansu, splitów i pauz,
- nie dopuszczać do podwójnego watchPosition,
- obsłużyć permission denied / timeout / unavailable,
- dodać status GPS: dokładność, ostatni punkt, czas od ostatniego punktu,
- przygotować interfejs NativeLocationProvider pod Capacitor,
- nie implementować jeszcze pełnego Android foreground service w PWA.

MAPY:
- nie używaj klucza API w kodzie źródłowym,
- provider map ma być konfigurowalny przez zmienne środowiskowe,
- nie hard-code'uj sekretów,
- przygotuj miejsce na offline tiles, ale nie udawaj ich obsługi, jeśli nie jest zaimplementowana.

JAKOŚĆ:
- uruchom npm run build,
- jeśli build nie przechodzi, napraw błędy zamiast je ignorować,
- sprawdź brak błędów TypeScript,
- nie usuwaj funkcji tylko po to, aby build przeszedł,
- podaj na końcu listę zmienionych plików i ograniczeń.
