# RunnerOS — AI Studio Final Handoff

Nie przebudowuj projektu od zera. Importuj istniejące repozytorium i najpierw uruchom:

1. npm install
2. npm run preflight
3. npm run typecheck
4. npm test
5. npm run build

Następnie napraw wyłącznie rzeczy blokujące uruchomienie. Zachowaj GPS, Foreground Service, BLE HR, Health Connect, IndexedDB, offline queue, JWT/PostGIS, social, plans i Workout Runtime.

## Pierwszy test produktu
- uruchom workout 6 x 2 min,
- sprawdź odzyskanie przerwanego workoutu po zamknięciu WebView,
- sprawdź przejścia etapów,
- sprawdź komunikaty audio,
- wygasz ekran,
- rejestruj GPS 30–60 min,
- pauza/wznowienie,
- stop,
- zapis aktywności,
- sync do API.

Nie usuwaj funkcji po to, aby build przechodził. Każdą zmianę architektury opisz w changelogu.
