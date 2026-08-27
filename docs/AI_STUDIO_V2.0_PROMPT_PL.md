# MASTER PROMPT — RunnerOS V2.0

Nie twórz aplikacji od zera i nie resetuj architektury.
Najpierw przeanalizuj całe repozytorium, uruchom `npm install`, `npm run preflight`, `npm run typecheck`, `npm test` i `npm run build`.

Cel V2.0:
1. Zweryfikować Workout Engine i stany treningu.
2. Dokończyć powiązanie planowanego workoutId z aktywnością.
3. Dokończyć przypisywanie gearId do aktywności po treningu.
4. Zweryfikować native TTS + ducking na Androidzie.
5. Nie usuwać istniejącego GPS, offline, Health Connect, BLE, PostGIS i sync.
6. Naprawiać błędy zamiast omijać testy.
7. Każdą zmianę poprzedź audytem miejsca w kodzie i zakończ testem.
8. Nie dodawaj fikcyjnych integracji ani danych produkcyjnych.
