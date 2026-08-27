# RunnerOS V1.6 — plan testu Release Candidate

## 1. Backend
1. `docker compose up -d db api`
2. `curl http://localhost:8787/health`
3. Oczekiwane: `ok=true`, `db=true`, `postgis=true`.

## 2. Web
1. `npm ci`
2. `npm run preflight`
3. `npm run verify`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`

## 3. Android
1. `npm run build`
2. `npx cap sync android`
3. Otwórz `android/` w Android Studio.
4. Zainstaluj debug na fizycznym telefonie.
5. Udziel lokalizacji i powiadomień.

## 4. Test GPS
- Start treningu w miejscu z otwartym niebem.
- Sprawdź pierwszy fix < 30 s.
- Zablokuj ekran na 10 min.
- Sprawdź, czy punkty nadal przychodzą.
- Wykonaj ręczną pauzę i wznowienie.
- Przejdź pod zabudowę/drzewa.
- Po 30–60 min zakończ trening.
- Porównaj dystans z referencyjnym zegarkiem/aplikacją.

## 5. Offline
- Rozpocznij trening bez sieci.
- Zakończ.
- Sprawdź lokalny zapis.
- Przywróć sieć.
- Sprawdź kolejkę i deduplikację na API.

## 6. BLE HR
- Sparuj sensor zgodny z Heart Rate Service.
- Sprawdź napływ BPM co najmniej przez 5 min.
- Odłącz i ponownie połącz sensor.

## 7. Health Connect
- Nadaj wymagane zgody.
- Zapisz zakończony trening.
- Zweryfikuj sesję ćwiczeń i dystans.
