# Prompt dla Google AI Studio / Antigravity Agent

Pracujesz na istniejącym projekcie RunnerOS. Nie przepisuj projektu od zera. Zachowaj jego strukturę i istniejące działanie.

CEL: rozwinąć aplikację do własnego produktu klasy Strava do biegania, bez kopiowania znaków towarowych, grafik, logo ani chronionego UI Stravy 1:1. Ma być funkcjonalnie bardzo bogata, ale wizualnie i brandingowo własna.

PRIORYTET 1 — stabilny tracking:
- GPS wysokiej dokładności
- start/pause/resume/stop
- auto pause
- offline-first
- odporność na utratę GPS
- filtrowanie błędnych punktów
- obliczanie dystansu, czasu ruchu, tempa, prędkości i przewyższenia
- zapis lokalny każdej aktywności
- bezpieczna kolejka synchronizacji

PRIORYTET 2 — Android:
- użyj Kotlin + Jetpack Compose dla natywnej warstwy Android, jeśli potrzebny będzie natywny moduł
- dodaj foreground location service
- trwałe powiadomienie podczas treningu
- poprawne permission flow
- przygotuj miejsce na Health Connect i BLE Heart Rate
- nie usuwaj PWA, web jest klientem pierwszej klasy

PRIORYTET 3 — analiza:
- activity detail
- wykres tempa
- wykres wysokości
- splity
- PB / Best Efforts
- tygodniowe i miesięczne statystyki
- training load / recovery jako osobne moduły

PRIORYTET 4 — mapy:
- MapLibre jako preferowana warstwa mapowa, ale abstrakcja providera
- trasa GPS
- zapis trasy
- GPX export/import
- przygotowanie pod PostGIS
- segment engine jako osobny moduł

PRIORYTET 5 — społeczność:
- feed
- follow
- kudos
- comments
- clubs
- challenges
- prywatność aktywności i hide-start/end

PRIORYTET 6 — bezpieczeństwo:
- Beacon-like live location
- link jednorazowy
- emergency mode
- możliwość wyłączenia live share

ZASADY:
1. Nie kasuj funkcji, które już istnieją.
2. Nie twórz atrap UI udających działające funkcje.
3. Każda funkcja krytyczna ma mieć test lub kontrolę błędu.
4. Oddziel UI, domenę, storage, GPS, sync i Android bridge.
5. Nie umieszczaj kluczy API w kodzie klienta.
6. Nie uzależniaj rozpoczęcia treningu od internetu.
7. Nie kopiuj logo, nazw, ikon, grafik ani dokładnego wyglądu Stravy.
8. Po każdej większej zmianie wykonaj build i napraw błędy kompilacji.

NAJPIERW:
- przeanalizuj istniejący kod,
- wypisz architekturę,
- zaproponuj minimalny plan migracji,
- dopiero potem modyfikuj pliki.
