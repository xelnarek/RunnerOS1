# AI Studio — RunnerOS V1.9

Nie twórz aplikacji od zera. Zachowaj istniejący kod i architekturę.

## Cel
Rozwinąć RunnerOS w kierunku funkcjonalności obserwowanych w Strava, Nike Run Club i adidas Running, bez kopiowania ich brandingu ani UI 1:1.

## Priorytety
1. Nie psuj GPS/Android foreground service/IndexedDB/sync/PostGIS.
2. Rozbuduj aktywności o workout engine: rozgrzewka, odcinki, przerwy, cooldown.
3. Zamień plan heurystyczny na plan powiązany z profilem i obciążeniem.
4. Dodaj przypisywanie butów do aktywności i automatyczne naliczanie kilometrów.
5. Dodaj cele czasowe/dystansowe i adaptację tygodniowego loadu.
6. Rozbuduj audio do native Android TTS + ducking.
7. Dodaj testy jednostek i scenariusze e2e dla RecordScreen.
8. Po każdej zmianie uruchom typecheck, testy i build. Nigdy nie usuwaj funkcji tylko po to, aby build przeszedł.
