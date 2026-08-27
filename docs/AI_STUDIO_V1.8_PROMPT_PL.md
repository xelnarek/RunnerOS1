# Prompt dla Google AI Studio — RunnerOS V1.8

Rozwijaj istniejący projekt RunnerOS, nie twórz go od zera. Zachowaj GPS, Foreground Service, IndexedDB, offline sync, PostGIS, BLE HR i Health Connect.

Priorytet tej iteracji: dopracowanie premium UI oraz audio bez regresji funkcji treningowych.

## Sprawdź
1. npm install
2. npm run preflight
3. npm run typecheck
4. npm test
5. npm run build

## UI
- zachowaj czytelność podczas biegu;
- nie przesadzaj z animacjami;
- nie kopiuj identycznie brandingu Stravy;
- utrzymaj WCAG-ową czytelność tekstu i duże cele dotykowe.

## Audio
- korzystaj z istniejącego audioEngine;
- nie twórz drugiej kolejki audio;
- nie odtwarzaj nakładających się komunikatów;
- preferuj polski głos;
- dla Androida rozważ natywny Text-to-Speech dopiero jako dedykowaną warstwę przez Capacitor, bez łamania API PWA.

Nie usuwaj funkcji, aby build przeszedł.
