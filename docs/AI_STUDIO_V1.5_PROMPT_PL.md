# Prompt do Google AI Studio — RunnerOS V1.5

Pracuj na istniejącym projekcie RunnerOS. Nie twórz nowej aplikacji od zera.

Cel V1.5: doprowadzić projekt do stanu Release Candidate technicznego.

1. Uruchom `npm install`, `npm run typecheck`, `npm test`, `npm run build`.
2. Uruchom backend przez Docker Compose + PostgreSQL/PostGIS.
3. Uruchom `cd server && npm install && npm run migrate && npm start`.
4. Uruchom `npm run smoke:api`.
5. Uruchom `npx cap sync android` i otwórz projekt w Android Studio.
6. Nie usuwaj funkcji tylko po to, aby ukryć błąd. Napraw przyczynę.
7. Na fizycznym Androidzie przetestuj: permissions, START, foreground GPS, wygaszenie ekranu, PAUSE/RESUME, STOP, odzyskanie bufora.
8. Sprawdź ekran Diagnostyka i zapisz wynik.
9. Zweryfikuj rejestrację/logowanie i upload aktywności do PostGIS.
10. Zostaw jasny raport: PASS / FAIL / BLOCKED wraz z logami i dokładnym miejscem problemu.

Nie oznaczaj projektu jako produkcyjnego bez testu fizycznego Androida i prawdziwego PostgreSQL/PostGIS.
