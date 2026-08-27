# Prompt dla Google AI Studio – RunnerOS V1.3

Pracujesz na istniejącym repozytorium RunnerOS. Nie twórz nowej aplikacji od zera.

Cel: uruchomić i zweryfikować działający backend `server/index.mjs` + PostgreSQL/PostGIS oraz podłączyć frontend do prawdziwej autoryzacji i synchronizacji.

Wykonaj kolejno:
1. `npm install` w root oraz `npm install` w `server/`.
2. Uruchom testy i `npm run typecheck`, potem `npm run build`.
3. Uruchom PostgreSQL/PostGIS i zastosuj `server/schema.sql`.
4. Ustaw `DATABASE_URL`, `JWT_SECRET`, `VITE_API_URL`.
5. Uruchom API i przetestuj register → login → me → activity sync → feed → follow/unfollow → heatmap.
6. Dodaj testy API dla złego hasła, duplikatu aktywności, braku tokena, follow self i zbyt długiego komentarza.
7. Nie usuwaj funkcji istniejącego GPS, offline, Health Connect, BLE ani UI.
8. Nie oznaczaj buildu jako poprawnego bez faktycznego uruchomienia komend.
9. Na Androidzie sprawdź prawdziwy foreground GPS oraz odzyskiwanie sesji po ubiciu WebView.
