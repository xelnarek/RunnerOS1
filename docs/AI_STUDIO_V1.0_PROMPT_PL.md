# PROMPT DLA GOOGLE AI STUDIO — RUNNEROS V1.0

Pracuj na istniejącym repozytorium RunnerOS. NIE twórz nowej aplikacji od zera.

Cel: doprowadzić projekt do buildable Android/PWA i zamienić V1.0 w działający produkt treningowy.

1. Uruchom `npm install`, następnie `npm run typecheck`, `npm test`, `npm run build`.
2. Nie usuwaj funkcji tylko po to, aby build przeszedł. Napraw przyczynę błędu.
3. Zweryfikuj Capacitor 8, Kotlin/AGP, Android target 36.
4. Sprawdź RunnerLocationService na fizycznym Androidzie: ekran wygaszony, 30 min, utrata GPS, powrót GPS.
5. Zweryfikuj RunnerOSHeartRatePlugin z BLE Heart Rate Profile 0x180D / Characteristic 0x2A37.
6. Dodaj ekran wyboru konkretnego czujnika HR zamiast automatycznego wyboru pierwszego urządzenia.
7. Zastąp `VITE_SYNC_ENDPOINT` realnym backendem dopiero po dodaniu autoryzacji JWT i idempotency keys.
8. Rozwiń PostGIS o map matching, segmenty i heatmap.
9. Zachowaj offline-first i kolejkę synchronizacji.
10. Nie kopiuj znaków towarowych, assetów ani identycznego UI Stravy. Funkcjonalność może być klasy Strava, branding i komponenty mają pozostać własne.
