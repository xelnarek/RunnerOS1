# PROMPT DO GOOGLE AI STUDIO — RunnerOS V0.2 → V0.3

Jesteś głównym inżynierem projektu RunnerOS. Otrzymujesz istniejący wieloplikowy projekt PWA. NIE twórz nowego projektu od zera i NIE usuwaj istniejącej architektury bez powodu.

## Cel
Doprowadź RunnerOS do V0.3: prawdziwa mapa treningu + IndexedDB + solidny model sesji + przygotowanie warstwy Android/Capacitor.

## Obowiązkowe zasady
1. Zachowaj TypeScript i modularną strukturę.
2. Nie zastępuj PWA jedną stroną HTML.
3. Nie usuwaj GPS filtering, pause/resume, splits, GPX/JSON export i Activity Detail.
4. Nie kopiuj logo, nazw, grafik ani chronionego UI Stravy. Możesz odtwarzać ogólne wzorce UX i klasy funkcjonalności.
5. Każdą zmianę wykonuj tak, aby aplikacja nadal działała offline.
6. Nie dodawaj backendu jako atrapy. Backend przygotuj jako wyraźną warstwę interfejsu, do późniejszego podpięcia.

## V0.3 — wymagania

### 1. IndexedDB
Wprowadź storage adapter:
- activities,
- track points,
- draft/current session,
- app settings.

localStorage może pozostać jako fallback migracyjny, ale długie ślady GPS mają trafiać do IndexedDB.

### 2. Mapa
Dodaj MapLibre jako warstwę mapy.
- bieżąca pozycja,
- polilinia treningu,
- automatyczne centrowanie,
- zoom,
- start/end marker,
- stan GPS,
- przycisk „moja lokalizacja”.

Nie hardcoduj sekretów API w frontendzie.

### 3. Activity Detail
Mapa ma pokazywać zapisany ślad.
Dodaj mini-wykres tempa i wysokości bez ciężkiej biblioteki, jeśli prosty SVG/canvas wystarczy.

### 4. Session Engine
Wyodrębnij logikę sesji z komponentu UI:
- start,
- pause,
- resume,
- stop,
- elapsed,
- moving time,
- paused time,
- GPS state,
- recovery po odświeżeniu strony.

### 5. Auto-save
Podczas aktywnego treningu stan sesji ma być zapisywany cyklicznie do IndexedDB.
Po reloadzie aplikacja ma pokazać „Wznowić niedokończony trening?”.

### 6. GPS quality
Rozbuduj filtr:
- accuracy threshold,
- impossible speed,
- impossible jump,
- stale timestamp,
- duplicate points,
- out-of-order points.

### 7. Android bridge
Dodaj folder/specyfikację dla Capacitor:
- Location plugin contract,
- foreground service contract,
- Health Connect contract,
- BLE heart-rate contract.

Na tym etapie nie symuluj natywnego background GPS w przeglądarce.

## Kryteria akceptacji
- użytkownik może rozpocząć bieg,
- zatrzymać i wznowić,
- odświeżyć stronę bez utraty aktywnej sesji,
- zakończyć trening,
- zobaczyć ślad na mapie,
- otworzyć szczegóły,
- wyeksportować GPX,
- wejść do historii offline.

Na końcu wykonaj pełny build i popraw wszystkie błędy TypeScript/Vite. Nie zgłaszaj zadania jako ukończone, jeśli build nie przechodzi.
