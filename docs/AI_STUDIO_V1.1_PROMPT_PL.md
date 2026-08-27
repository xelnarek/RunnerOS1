# Prompt dla Google AI Studio / Gemini — RunnerOS V1.1

Rozwijaj istniejący projekt RunnerOS. Nie twórz nowego projektu i nie usuwaj działających funkcji.

Cel V1.2:
1. Podłącz prawdziwe konta użytkowników, JWT oraz bezpieczne odświeżanie sesji.
2. Rozbuduj feed o followers, kudos, komentarze i prywatność aktywności.
3. Zapisuj heatmapę jako dane geospatial PostGIS zamiast lokalnej bitmapy.
4. Dodaj segment matching na backendzie z tolerancją GPS i rankingiem PB.
5. Dodaj challenge engine z cyklem miesięcznym i historią nagród.
6. Zachowaj offline-first i kolejkę synchronizacji.
7. Nie obchodź błędów przez wyłączanie typowania lub usuwanie funkcji.
8. Uruchom `npm run typecheck`, `npm test` i `npm run build`; pokaż pełny wynik.
9. Dla Androida wykonaj `npx cap sync android` i sprawdź konfigurację foreground GPS, BLE HR i Health Connect.
10. Nie oznaczaj projektu jako produkcyjnego bez fizycznego testu Android GPS przy wygaszonym ekranie.
